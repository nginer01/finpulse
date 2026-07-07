"""
Modo quiz opcional — confirma la comprensión del briefing.

3 preguntas tipo flashcard tras el briefing diario. Los fallos vuelven con
repetición espaciada (1 → 3 → 7 → 14 días; acierto avanza, fallo reinicia)
hasta dominarse. Los resultados alimentan el Investor DNA y los temas
fallados se convierten en señal de profundización para el briefing.

Generación: Claude crea las preguntas desde el contenido del briefing
(POST /quiz/generate). Sin API key devuelve vacío y el frontend usa su
banco demo — misma lógica de scheduling en ambos lados.
"""

import asyncio
import json
import re
from datetime import date, datetime, timedelta
from typing import Optional

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.models import QuizCard
from app.api.auth import get_current_user, User

router = APIRouter(prefix="/quiz", tags=["quiz"])

# Intervalos de repetición espaciada (días). Superar el último = dominada.
INTERVALS = [1, 3, 7, 14]


# ── Schemas ──

class CardCreate(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str = ""
    topic: str = ""
    source_date: Optional[date] = None


class CardOut(BaseModel):
    id: int
    question: str
    options: list[str]
    correct_index: int
    explanation: str
    topic: str
    step: int
    lapses: int
    mastered: bool
    is_review: bool  # true si viene de un fallo anterior (repaso)
    next_review_at: Optional[datetime]
    source_date: Optional[date]


class AnswerRequest(BaseModel):
    correct: bool


class GenerateRequest(BaseModel):
    content: str  # texto del briefing
    count: int = 3
    source_date: Optional[date] = None


class GenerateResponse(BaseModel):
    cards: list[CardOut]
    engine: str  # ia / none
    message: str


class StatsOut(BaseModel):
    total_cards: int
    mastered: int
    due_reviews: int
    lapses_total: int
    accuracy_hint: float  # % de cartas sin ningún fallo


# ── Helpers ──

def _to_out(c: QuizCard, is_review: bool = False) -> CardOut:
    try:
        options = json.loads(c.options)
    except Exception:
        options = []
    return CardOut(
        id=c.id, question=c.question, options=options, correct_index=c.correct_index,
        explanation=c.explanation or "", topic=c.topic or "", step=c.step,
        lapses=c.lapses, mastered=c.mastered, is_review=is_review,
        next_review_at=c.next_review_at, source_date=c.source_date,
    )


GENERATE_PROMPT = """Eres el CIO de FinPulse creando un mini-quiz para confirmar que el usuario comprendió el briefing de hoy.

Reglas:
- Preguntas sobre lo IMPORTANTE del briefing (impacto en el portfolio, cifras clave, causas), no trivialidades.
- Cada pregunta: 3 opciones plausibles, UNA correcta. Las incorrectas deben ser errores razonables, no absurdos.
- explanation: 1-2 frases que refuercen el concepto (por qué es la correcta y qué implica).
- topic: tema en minúsculas de esta lista si aplica: semiconductores, energía, eurozona, política monetaria, aranceles, macro EEUU, renta variable EEUU, renta variable global, volatilidad. Si no encaja, un tema corto propio.
- En español, tono claro.

Responde SOLO con JSON válido:
{"questions": [{"question": "...", "options": ["...","...","..."], "correct_index": 0, "explanation": "...", "topic": "..."}]}"""


def _parse_json(text: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE).strip()
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Sin JSON")
    return json.loads(cleaned[start : end + 1])


# ── Endpoints ──

@router.get("/session", response_model=list[CardOut])
async def get_session(
    limit: int = 3,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    La sesión de hoy: primero los repasos vencidos (fallos que vuelven),
    después preguntas nuevas, hasta `limit`.
    """
    now = datetime.utcnow()
    due = await db.execute(
        select(QuizCard)
        .where(
            QuizCard.user_id == user.id,
            QuizCard.mastered == False,  # noqa: E712
            QuizCard.next_review_at.is_not(None),
            QuizCard.next_review_at <= now,
        )
        .order_by(QuizCard.next_review_at)
        .limit(limit)
    )
    cards = [_to_out(c, is_review=True) for c in due.scalars().all()]

    remaining = limit - len(cards)
    if remaining > 0:
        fresh = await db.execute(
            select(QuizCard)
            .where(QuizCard.user_id == user.id, QuizCard.next_review_at.is_(None))
            .order_by(QuizCard.created_at.desc())
            .limit(remaining)
        )
        cards.extend(_to_out(c) for c in fresh.scalars().all())

    return cards


@router.post("/cards", response_model=list[CardOut])
async def create_cards(
    cards: list[CardCreate],
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Alta manual/bulk de preguntas (el pipeline del briefing las creará cada mañana)."""
    if not cards:
        raise HTTPException(status_code=400, detail="Lista vacía")
    created = []
    for c in cards:
        if not (0 <= c.correct_index < len(c.options)) or len(c.options) < 2:
            raise HTTPException(status_code=400, detail="Opciones/índice inválidos")
        card = QuizCard(
            user_id=user.id,
            question=c.question,
            options=json.dumps(c.options, ensure_ascii=False),
            correct_index=c.correct_index,
            explanation=c.explanation,
            topic=c.topic,
            source_date=c.source_date,
        )
        db.add(card)
        created.append(card)
    await db.commit()
    for card in created:
        await db.refresh(card)
    return [_to_out(c) for c in created]


@router.post("/generate", response_model=GenerateResponse)
async def generate_cards(
    data: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Claude lee el briefing y crea las preguntas del día (persistidas como nuevas)."""
    if not settings.anthropic_api_key:
        return GenerateResponse(cards=[], engine="none",
                                message="ANTHROPIC_API_KEY no configurada — el quiz usa el banco local")
    if len(data.content.strip()) < 100:
        raise HTTPException(status_code=400, detail="Contenido del briefing demasiado corto")

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = await asyncio.to_thread(
            lambda: client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2048,
                system=GENERATE_PROMPT,
                messages=[{"role": "user", "content": f"Genera {data.count} preguntas de este briefing:\n\n{data.content[:20000]}"}],
            )
        )
        parsed = _parse_json(response.content[0].text)
    except Exception as e:
        return GenerateResponse(cards=[], engine="none", message=f"Generación fallida: {e}")

    created = []
    for q in parsed.get("questions", [])[: data.count]:
        options = [str(o) for o in q.get("options", [])]
        idx = q.get("correct_index", 0)
        if len(options) < 2 or not (0 <= idx < len(options)):
            continue
        card = QuizCard(
            user_id=user.id,
            question=str(q.get("question", "")),
            options=json.dumps(options, ensure_ascii=False),
            correct_index=int(idx),
            explanation=str(q.get("explanation", "")),
            topic=str(q.get("topic", "")),
            source_date=data.source_date or date.today(),
        )
        db.add(card)
        created.append(card)
    await db.commit()
    for card in created:
        await db.refresh(card)

    return GenerateResponse(
        cards=[_to_out(c) for c in created], engine="ia",
        message=f"{len(created)} preguntas generadas del briefing",
    )


@router.post("/cards/{card_id}/answer", response_model=CardOut)
async def answer_card(
    card_id: int,
    data: AnswerRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Registra la respuesta y reprograma: acierto avanza el intervalo
    (1→3→7→14 días, superar el último = dominada); fallo reinicia a 1 día.
    """
    result = await db.execute(
        select(QuizCard).where(QuizCard.id == card_id, QuizCard.user_id == user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    now = datetime.utcnow()
    was_review = card.next_review_at is not None
    card.last_answered_at = now
    if data.correct:
        if card.step >= len(INTERVALS) - 1 or (not was_review and card.lapses == 0):
            # Nueva acertada a la primera, o último intervalo superado → dominada
            card.mastered = True
            card.next_review_at = None
        else:
            card.step += 1
            card.next_review_at = now + timedelta(days=INTERVALS[min(card.step, len(INTERVALS) - 1)])
    else:
        card.lapses += 1
        card.step = 0
        card.next_review_at = now + timedelta(days=INTERVALS[0])

    await db.commit()
    await db.refresh(card)
    return _to_out(card, is_review=was_review)


@router.get("/stats", response_model=StatsOut)
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Métricas para el Investor DNA (comprensión)."""
    result = await db.execute(select(QuizCard).where(QuizCard.user_id == user.id))
    cards = list(result.scalars().all())
    now = datetime.utcnow()
    total = len(cards)
    mastered = sum(1 for c in cards if c.mastered)
    due = sum(1 for c in cards if not c.mastered and c.next_review_at and c.next_review_at <= now)
    lapses = sum(c.lapses for c in cards)
    answered = [c for c in cards if c.last_answered_at]
    clean = sum(1 for c in answered if c.lapses == 0)
    return StatsOut(
        total_cards=total,
        mastered=mastered,
        due_reviews=due,
        lapses_total=lapses,
        accuracy_hint=round(clean / len(answered) * 100, 1) if answered else 0,
    )
