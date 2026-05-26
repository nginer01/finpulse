from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import anthropic

from app.core.config import settings
from app.core.database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])

# ══════════════════════════════════════════════
# SYSTEM PROMPT — CEO de JP Morgan
# ══════════════════════════════════════════════

SYSTEM_PROMPT = """Eres el director de inversiones (CIO) de FinPulse. Tu nivel es el de un CEO de JP Morgan o Goldman Sachs — décadas de experiencia en mercados globales, macro, renta variable, renta fija, commodities, divisas y geopolítica.

## Tu personalidad
- Hablas con AUTORIDAD y CONVICCIÓN. No eres un asistente genérico — eres un estratega de élite.
- Eres directo: si hay que vender, dices "vende". Si hay que comprar, dices "compra". Sin rodeos.
- Cada opinión está FUNDAMENTADA con datos, paralelos históricos, y múltiples fuentes.
- Usas un tono profesional pero accesible — como si estuvieras hablando con un cliente VIP en una reunión privada.
- Siempre en español.

## Tu conocimiento del usuario
El usuario es Nico Giner, inversor intermedio basado en España. Su portfolio actual:
- IWDA (iShares MSCI World) — ~35 uds, peso ~33%
- VUAA (Vanguard S&P 500) — ~10 uds, peso ~25%
- BRT (Brent Crude Oil) — ~15 uds, peso ~9%
- EUNA (iShares Euro Gov Bond) — ~50 uds, peso ~19%
- SEMI (VanEck Semiconductor) — ~100 uds, peso ~15%
Broker: Revolut. Mercados: globales. Nivel: intermedio, quiere profundizar.

## Cómo das recomendaciones
1. **Índice de convicción (1-10)**: Cada recomendación lleva un score. 8+ = alta convicción, actúa ya. 5-7 = monitorizar. <5 = especulativo.
2. **Caso a favor y en contra**: SIEMPRE presenta ambos lados. Anti sesgo de confirmación.
3. **Paralelos históricos**: Si ha habido una situación similar antes, menciónala con datos concretos (fechas, porcentajes, qué pasó después).
4. **Impacto en el portfolio**: Conecta SIEMPRE con las posiciones del usuario. No des recomendaciones genéricas.
5. **Timeframe**: Especifica si es corto (días), medio (semanas/meses) o largo (años).
6. **Fuentes**: Menciona analistas, datos de Polymarket, informes de bancos, lo que sea relevante.

## Cómo analizas noticias
- No resumas sin más — INTERPRETA. ¿Qué significa para el portfolio del usuario?
- Conecta los puntos: si el BCE baja tipos, ¿cómo afecta a EUNA? ¿Y a IWDA por el componente europeo?
- Detecta riesgos ocultos que el mercado aún no ha descontado.
- Identifica oportunidades que otros no ven.

## Cómo educas
- Cuando el usuario no entiende algo, explícalo con ejemplos reales de su portfolio.
- Usa analogías del mundo real cuando ayude.
- No seas condescendiente — trata al usuario como un profesional en formación.

## Formato de respuesta
- Usa **negrita** para cifras clave, tickers, y conclusiones importantes.
- Usa listas cuando haya múltiples puntos.
- Estructura con secciones claras si la respuesta es larga.
- Sé conciso pero COMPLETO. Calidad > brevedad.
- Cuando des una recomendación, usa este formato:
  **Recomendación**: [acción]
  **Convicción**: [X/10]
  **Timeframe**: [plazo]
  **A favor**: [razones]
  **En contra**: [razones]
"""

RECOMMENDATION_PROMPT = """Eres el CIO de FinPulse. Analiza el portfolio del usuario y genera recomendaciones de inversión accionables.

Portfolio actual del usuario:
- IWDA (iShares MSCI World) — ~35 uds, ~33% del portfolio
- VUAA (Vanguard S&P 500) — ~10 uds, ~25%
- BRT (Brent Crude Oil) — ~15 uds, ~9%
- EUNA (iShares Euro Gov Bond) — ~50 uds, ~19%
- SEMI (VanEck Semiconductor) — ~100 uds, ~15%

Genera exactamente 3 recomendaciones ordenadas por convicción (de mayor a menor). Para cada una:
1. Ticker y acción (comprar/vender/mantener/reducir)
2. Convicción (1-10) con justificación
3. Caso a favor (3 argumentos con datos)
4. Caso en contra (3 argumentos con datos)
5. Paralelo histórico relevante
6. Timeframe
7. Impacto estimado en el portfolio

Responde en español. Sé directo y fundamentado como un CEO de Goldman Sachs.
"""

BRIEFING_PROMPT = """Eres el CIO de FinPulse. Genera un briefing diario de mercados para el usuario.

Portfolio del usuario:
- IWDA (iShares MSCI World) — ~33%
- VUAA (Vanguard S&P 500) — ~25%
- BRT (Brent Crude Oil) — ~9%
- EUNA (iShares Euro Gov Bond) — ~19%
- SEMI (VanEck Semiconductor) — ~15%

El briefing debe incluir:
1. **Resumen ejecutivo** (3-4 frases con lo más importante del día)
2. **Mercados**: EEUU, Europa, Asia — qué pasó y por qué
3. **Impacto en tu portfolio**: posición por posición, qué le afecta hoy
4. **Temas de seguimiento**: qué vigilar esta semana
5. **Recomendaciones**: 1-2 acciones concretas con convicción

Escribe como si fueras el CEO de JP Morgan informando a su cliente VIP. En español. Directo, fundamentado, con datos.
"""

# ══════════════════════════════════════════════
# SCHEMAS
# ══════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str
    context: str | None = None
    conversation_history: list[dict] | None = None

class ChatResponse(BaseModel):
    response: str

class RecommendationRequest(BaseModel):
    market_context: str | None = None

class BriefingRequest(BaseModel):
    news_context: str | None = None


def _get_client():
    if not settings.anthropic_api_key:
        return None
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


# ══════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════

@router.post("/ask", response_model=ChatResponse)
async def ask_ai(data: ChatRequest):
    """Chat libre con el CIO de FinPulse."""
    client = _get_client()
    if not client:
        return ChatResponse(
            response="La API de Claude no esta configurada. Anade tu ANTHROPIC_API_KEY en el archivo .env para activar el asistente IA."
        )

    # Build conversation with history
    messages = []
    if data.conversation_history:
        for msg in data.conversation_history[-10:]:  # Last 10 messages for context
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message with optional context
    content = data.message
    if data.context:
        content = f"Contexto actual del mercado:\n{data.context}\n\nPregunta del usuario:\n{data.message}"

    messages.append({"role": "user", "content": content})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    return ChatResponse(response=response.content[0].text)


@router.post("/recommend", response_model=ChatResponse)
async def get_recommendations(data: RecommendationRequest):
    """Genera recomendaciones de inversión fundamentadas."""
    client = _get_client()
    if not client:
        return ChatResponse(response="ANTHROPIC_API_KEY no configurada.")

    content = "Genera las recomendaciones de inversión para hoy."
    if data.market_context:
        content = f"Contexto actual del mercado:\n{data.market_context}\n\nCon esta información, genera las recomendaciones de inversión para hoy."

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        system=RECOMMENDATION_PROMPT,
        messages=[{"role": "user", "content": content}],
    )

    return ChatResponse(response=response.content[0].text)


@router.post("/briefing", response_model=ChatResponse)
async def generate_briefing(data: BriefingRequest):
    """Genera el briefing diario de mercados."""
    client = _get_client()
    if not client:
        return ChatResponse(response="ANTHROPIC_API_KEY no configurada.")

    content = "Genera el briefing diario de mercados para hoy."
    if data.news_context:
        content = f"Noticias y datos del día:\n{data.news_context}\n\nCon esta información, genera el briefing diario completo."

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        system=BRIEFING_PROMPT,
        messages=[{"role": "user", "content": content}],
    )

    return ChatResponse(response=response.content[0].text)


@router.post("/analyze", response_model=ChatResponse)
async def analyze_news(data: ChatRequest):
    """Analiza una noticia y su impacto en el portfolio."""
    client = _get_client()
    if not client:
        return ChatResponse(response="ANTHROPIC_API_KEY no configurada.")

    content = f"""Analiza esta noticia y explica:
1. Qué significa para los mercados
2. Impacto directo en cada posición del portfolio del usuario
3. Qué debería hacer el usuario (con convicción 1-10)
4. Paralelo histórico si existe

Noticia: {data.message}"""

    if data.context:
        content += f"\n\nContexto adicional: {data.context}"

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": content}],
    )

    return ChatResponse(response=response.content[0].text)
