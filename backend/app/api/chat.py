from fastapi import APIRouter
from pydantic import BaseModel
import anthropic

from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = """Eres el asistente financiero de FinPulse, una plataforma personal de inteligencia financiera.

Tu rol es explicar conceptos financieros de forma clara y conectarlos con el portfolio y las noticias del usuario.

Reglas:
- Responde siempre en español
- Usa un tono cercano pero profesional
- Conecta las explicaciones con ejemplos reales del mercado
- Si el concepto afecta al portfolio del usuario, mencionalo
- Usa **negrita** para terminos clave
- Estructura con listas cuando sea util
- Se conciso pero completo
- No des consejos de inversion directos, sino educacion

El usuario es un inversor intermedio con portfolio en: IWDA (MSCI World), VUAA (S&P 500), BRT (Brent), EUNA (Bonos Euro), SEMI (Semiconductores).
"""


class ChatRequest(BaseModel):
    message: str
    context: str | None = None


class ChatResponse(BaseModel):
    response: str


@router.post("/ask", response_model=ChatResponse)
async def ask_ai(data: ChatRequest):
    if not settings.anthropic_api_key:
        return ChatResponse(
            response="La API de Claude no esta configurada. Anade tu ANTHROPIC_API_KEY en el archivo .env para activar el asistente IA."
        )

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    messages = [{"role": "user", "content": data.message}]

    if data.context:
        messages[0]["content"] = f"Contexto: {data.context}\n\nPregunta: {data.message}"

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    return ChatResponse(response=response.content[0].text)
