"""
Decision Journal — the learning engine of FinPulse.

Every time the user buys or sells, they log WHY:
- Quick tags (2 seconds): predefined reasons
- Optional free text: deeper thesis

Later, the AI reviews the decision retrospectively:
- Did the price go up or down after?
- Was the reasoning correct?
- What signals were missed?
"""

from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Decision, DecisionResult
from app.api.auth import get_current_user, User

router = APIRouter(prefix="/journal", tags=["journal"])

# ── Available quick tags ──
AVAILABLE_TAGS = {
    # Bullish reasons
    "analisis-tecnico": "Analisis tecnico",
    "recomendacion-ia": "Recomendacion IA",
    "noticia-positiva": "Noticia positiva",
    "tendencia-alcista": "Tendencia alcista",
    "infravalorado": "Infravalorado",
    "earnings-buenos": "Earnings buenos",
    "rebalanceo": "Rebalanceo",
    "dca": "DCA (compra periodica)",
    # Bearish reasons
    "noticia-negativa": "Noticia negativa",
    "tendencia-bajista": "Tendencia bajista",
    "sobrevalorado": "Sobrevalorado",
    "toma-beneficios": "Toma de beneficios",
    "stop-loss": "Stop loss",
    "cobertura": "Cobertura",
    # Emotional
    "intuicion": "Intuicion",
    "fomo": "FOMO",
    "miedo": "Miedo",
    "oportunidad": "Oportunidad unica",
    # External
    "polymarket": "Dato de Polymarket",
    "fuente-confiable": "Fuente confiable",
    "paralelo-historico": "Paralelo historico",
}


# ── Schemas ──

class DecisionCreate(BaseModel):
    ticker: str
    action: str  # buy / sell
    price: float
    quantity: float
    conviction: int  # 1-10
    tags: list[str]  # list of tag keys from AVAILABLE_TAGS
    thesis: str = ""  # optional free text
    date: Optional[date] = None  # defaults to today

class DecisionOut(BaseModel):
    id: int
    ticker: str
    action: str
    price: float
    quantity: float
    conviction: int
    tags: list[str]
    thesis: str
    result: Optional[str]
    lesson: Optional[str]
    ai_review: Optional[str]
    price_after_7d: Optional[float]
    price_after_30d: Optional[float]
    date: date
    created_at: datetime

    model_config = {"from_attributes": True}

class DecisionUpdate(BaseModel):
    result: Optional[str] = None  # good / neutral / bad
    lesson: Optional[str] = None

class TagsOut(BaseModel):
    tags: dict[str, str]


# ── Endpoints ──

@router.get("/tags", response_model=TagsOut)
async def get_available_tags():
    """Get all available quick tags for the decision journal."""
    return TagsOut(tags=AVAILABLE_TAGS)


@router.post("/decisions", response_model=DecisionOut)
async def create_decision(
    data: DecisionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Log a new investment decision.
    Quick tags are mandatory (at least 1), thesis is optional.
    """
    if not data.tags:
        raise HTTPException(status_code=400, detail="Selecciona al menos un tag")
    if data.conviction < 1 or data.conviction > 10:
        raise HTTPException(status_code=400, detail="Conviccion debe ser entre 1 y 10")
    if data.action not in ("buy", "sell"):
        raise HTTPException(status_code=400, detail="Accion debe ser 'buy' o 'sell'")

    # Validate tags
    invalid = [t for t in data.tags if t not in AVAILABLE_TAGS]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Tags invalidos: {invalid}")

    decision = Decision(
        user_id=user.id,
        ticker=data.ticker.upper(),
        action=data.action,
        price=data.price,
        quantity=data.quantity,
        conviction=data.conviction,
        tags=",".join(data.tags),
        thesis=data.thesis,
        date=data.date or date.today(),
    )
    db.add(decision)
    await db.commit()
    await db.refresh(decision)

    return _to_out(decision)


@router.get("/decisions", response_model=list[DecisionOut])
async def list_decisions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """List all decisions for the current user, newest first."""
    result = await db.execute(
        select(Decision)
        .where(Decision.user_id == user.id)
        .order_by(Decision.date.desc())
        .limit(limit)
    )
    return [_to_out(d) for d in result.scalars().all()]


@router.get("/decisions/{decision_id}", response_model=DecisionOut)
async def get_decision(
    decision_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific decision."""
    result = await db.execute(
        select(Decision).where(Decision.id == decision_id, Decision.user_id == user.id)
    )
    decision = result.scalar_one_or_none()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision no encontrada")
    return _to_out(decision)


@router.patch("/decisions/{decision_id}", response_model=DecisionOut)
async def update_decision(
    decision_id: int,
    data: DecisionUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the result/lesson of a decision (after the fact)."""
    result = await db.execute(
        select(Decision).where(Decision.id == decision_id, Decision.user_id == user.id)
    )
    decision = result.scalar_one_or_none()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision no encontrada")

    if data.result is not None:
        if data.result not in ("good", "neutral", "bad"):
            raise HTTPException(status_code=400, detail="Resultado debe ser good/neutral/bad")
        decision.result = data.result
    if data.lesson is not None:
        decision.lesson = data.lesson

    await db.commit()
    await db.refresh(decision)
    return _to_out(decision)


@router.get("/stats", response_model=dict)
async def get_journal_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get decision journal statistics for the user."""
    result = await db.execute(
        select(Decision).where(Decision.user_id == user.id)
    )
    decisions = result.scalars().all()

    total = len(decisions)
    if total == 0:
        return {
            "total_decisions": 0,
            "good": 0, "neutral": 0, "bad": 0, "pending": 0,
            "accuracy": 0,
            "avg_conviction": 0,
            "most_used_tags": [],
            "best_ticker": None,
            "worst_ticker": None,
        }

    good = sum(1 for d in decisions if d.result == DecisionResult.GOOD)
    neutral = sum(1 for d in decisions if d.result == DecisionResult.NEUTRAL)
    bad = sum(1 for d in decisions if d.result == DecisionResult.BAD)
    pending = sum(1 for d in decisions if d.result is None)
    reviewed = good + neutral + bad

    # Tag frequency
    tag_counts: dict[str, int] = {}
    for d in decisions:
        if d.tags:
            for t in d.tags.split(","):
                tag_counts[t] = tag_counts.get(t, 0) + 1
    most_used = sorted(tag_counts.items(), key=lambda x: -x[1])[:5]

    # Best/worst ticker by result
    ticker_scores: dict[str, list[int]] = {}
    for d in decisions:
        if d.result:
            score = {"good": 1, "neutral": 0, "bad": -1}.get(d.result.value, 0)
            ticker_scores.setdefault(d.ticker, []).append(score)

    best = max(ticker_scores.items(), key=lambda x: sum(x[1]) / len(x[1]), default=(None, []))
    worst = min(ticker_scores.items(), key=lambda x: sum(x[1]) / len(x[1]), default=(None, []))

    return {
        "total_decisions": total,
        "good": good,
        "neutral": neutral,
        "bad": bad,
        "pending": pending,
        "accuracy": round(good / reviewed * 100, 1) if reviewed > 0 else 0,
        "avg_conviction": round(sum(d.conviction for d in decisions) / total, 1),
        "most_used_tags": [{"tag": t, "label": AVAILABLE_TAGS.get(t, t), "count": c} for t, c in most_used],
        "best_ticker": best[0],
        "worst_ticker": worst[0],
    }


def _to_out(d: Decision) -> DecisionOut:
    return DecisionOut(
        id=d.id,
        ticker=d.ticker,
        action=d.action,
        price=d.price,
        quantity=d.quantity,
        conviction=d.conviction,
        tags=d.tags.split(",") if d.tags else [],
        thesis=d.thesis or "",
        result=d.result.value if d.result else None,
        lesson=d.lesson,
        ai_review=d.ai_review,
        price_after_7d=d.price_after_7d,
        price_after_30d=d.price_after_30d,
        date=d.date,
        created_at=d.created_at,
    )
