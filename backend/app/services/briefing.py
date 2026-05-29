"""
Briefing generator — the CORE of FinPulse.

Reads ALL sources (Gmail, Polymarket, market data), passes everything
to Claude with the CEO-of-JP-Morgan persona, and generates a personalized
daily briefing adapted to the user's portfolio.

RULES:
- Read EVERYTHING from the sources, don't summarize superficially
- Cross-reference: if multiple sources talk about the same topic, merge info
- Adapt to the user's portfolio: prioritize what affects their positions
- NEVER invent anything: only verified info from the sources
- Quality > brevity: the briefing can be long, completeness matters
- Historical parallels when relevant
- Recommendations with conviction 1-10, pro/contra, timeframe
"""

import anthropic
from datetime import datetime

from app.core.config import settings
from app.services.gmail import fetch_all_emails_text
from app.services.polymarket import fetch_polymarket_text
from app.services.market import get_portfolio_snapshot_sync


BRIEFING_SYSTEM = """Eres el director de inversiones (CIO) de FinPulse. Tu nivel es el de un CEO de JP Morgan — decadas de experiencia en mercados globales.

## Tu mision
Generar el briefing diario mas completo y util que este inversor haya leido jamas. No un resumen generico — un analisis profundo, personalizado, fundamentado y accionable.

## Portfolio del usuario
- IWDA (iShares MSCI World) — ~35 uds, ~33% del portfolio
- VUAA (Vanguard S&P 500) — ~10 uds, ~25%
- BRT (Brent Crude Oil) — ~15 uds, ~9%
- EUNA (iShares Euro Gov Bond) — ~50 uds, ~19%
- SEMI (VanEck Semiconductor) — ~100 uds, ~15%

## Como debes procesar la informacion
1. LEE TODO el contenido de cada email detenidamente. No resumas por encima.
2. CRUZA FUENTES: si varias fuentes hablan del mismo tema, junta toda la informacion. No repitas — profundiza.
3. ANADE CONTEXTO: usa los datos de Polymarket y de mercado para enriquecer el analisis.
4. PRIORIZA por impacto en el portfolio del usuario.
5. DETECTA conexiones que no son obvias entre noticias.

## Estructura del briefing (OBLIGATORIA)
### 1. Resumen ejecutivo
3-4 frases con lo MAS importante del dia. Directo, sin rodeos.

### 2. Mercados en detalle
EEUU, Europa, Asia, renta fija, divisas, commodities. Que paso, por que, y que significa.

### 3. Tu portfolio hoy
Posicion por posicion: que le afecta, cuanto ha cambiado, que deberia hacer el usuario.

### 4. Temas de seguimiento
Temas activos con prioridad (ALTA/MEDIA/BAJA). Si un evento importante ha ocurrido, sube la prioridad dinamicamente.

### 5. Lo que dicen tus fuentes
Citas TEXTUALES relevantes de las newsletters, analistas, emails. Atribuye siempre a la fuente.

### 6. Paralelos historicos
Si algo similar ha ocurrido antes, mencionalo con fechas y datos concretos. Que paso despues?

### 7. Recomendaciones
1-3 recomendaciones concretas. Cada una con:
- **Accion**: comprar/vender/mantener/reducir
- **Conviccion**: X/10
- **Timeframe**: corto/medio/largo
- **A favor**: 3 argumentos con datos
- **En contra**: 3 argumentos con datos (anti sesgo de confirmacion)

### 8. Alertas y proximos eventos
Eventos clave de la semana que pueden mover el portfolio. Fechas y por que importan.

## Reglas ABSOLUTAS
- NO INVENTAR NADA. Solo informacion que viene de las fuentes proporcionadas.
- Si no hay suficiente informacion sobre un tema, dilo explicitamente.
- Calidad > brevedad. El briefing puede ser largo si la informacion lo requiere.
- Tono: directo, profesional, como un CEO hablando a su cliente mas importante.
- Idioma: español.
- Usa **negrita** para cifras clave, tickers, y conclusiones importantes.
"""


def _get_market_context() -> str:
    """Get current market data as text for Claude."""
    try:
        tickers = ["IWDA", "VUAA", "BRT", "EUNA", "SEMI"]
        snapshot = get_portfolio_snapshot_sync(tickers)

        parts = ["=== DATOS DE MERCADO EN TIEMPO REAL ===\n"]

        if "positions" in snapshot:
            for ticker, data in snapshot["positions"].items():
                parts.append(f"- {ticker} ({data.get('name', '')})")
                parts.append(f"  Precio: {data.get('price', 'N/A')} {data.get('currency', '')}")
                parts.append(f"  Cambio: {data.get('changePct', 0):.2f}%")
                parts.append("")

        if "indices" in snapshot:
            parts.append("Indices principales:")
            for name, data in snapshot["indices"].items():
                parts.append(f"- {data.get('label', name)}: {data.get('price', 'N/A')} ({data.get('changePct', 0):+.2f}%)")
            parts.append("")

        return "\n".join(parts)
    except Exception as e:
        return f"Error obteniendo datos de mercado: {str(e)}"


async def generate_briefing(days_back: int = 1) -> dict:
    """
    Generate the daily briefing by:
    1. Reading all emails from Gmail
    2. Fetching Polymarket data
    3. Getting market data
    4. Passing everything to Claude

    Returns dict with briefing text and metadata.
    """
    if not settings.anthropic_api_key:
        return {
            "briefing": "ANTHROPIC_API_KEY no configurada. Anade tu API key en .env para activar el briefing.",
            "sources_count": 0,
            "generated_at": datetime.now().isoformat(),
        }

    # 1. Read Gmail
    email_text = fetch_all_emails_text(days_back=days_back)

    # 2. Fetch Polymarket
    polymarket_text = await fetch_polymarket_text()

    # 3. Get market data
    market_text = _get_market_context()

    # 4. Count sources
    email_count = email_text.count("--- EMAIL")
    has_polymarket = "POLYMARKET" in polymarket_text
    has_market = "DATOS DE MERCADO" in market_text

    # 5. Build the full context for Claude
    full_context = f"""Fecha: {datetime.now().strftime('%A, %d de %B de %Y — %H:%M')} (hora España)

{email_text}

{polymarket_text}

{market_text}

=== FIN DE LAS FUENTES ===

Con TODA esta informacion, genera el briefing diario completo siguiendo la estructura obligatoria.
Recuerda: lee TODO detenidamente, cruza fuentes, no inventes nada, adapta al portfolio del usuario.
"""

    # 6. Generate briefing with Claude
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        system=BRIEFING_SYSTEM,
        messages=[{"role": "user", "content": full_context}],
    )

    briefing_text = response.content[0].text

    return {
        "briefing": briefing_text,
        "sources_count": email_count,
        "has_polymarket": has_polymarket,
        "has_market_data": has_market,
        "generated_at": datetime.now().isoformat(),
        "model": "claude-sonnet-4-20250514",
    }
