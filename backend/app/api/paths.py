"""
El camino no tomado — la memoria de lo que decidiste NO hacer.

Cada vez que el usuario decide sobre una recomendación (seguir/ignorar) o la
simula ("invertir en ficción"), se registra AUTOMÁTICAMENTE con un snapshot
del precio real en ese momento. Después, GET /paths evalúa con precios
actuales qué habría pasado: lo que te costó ignorar, lo que te ahorraste,
y cuánto vale la posición ficticia.

La dirección importa: ignorar un "Comprar" que subió te costó dinero; ignorar
un "Vender" que subió te lo ahorró. effect_pct ya viene con el signo correcto
de "qué habría dado seguir la recomendación".
"""

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import Recommendation, RecommendationStatus
from app.api.auth import get_current_user, User
from app.services.market import get_quote, get_quotes

router = APIRouter(prefix="/paths", tags=["paths"])


# ── Schemas ──

class DecideRequest(BaseModel):
    ticker: str
    name: str = ""
    action: str  # Comprar / Vender / Mantener / Vigilar (se guarda tal cual)
    conviction: int = 5
    reasoning: str = ""
    decision: str  # followed / ignored
    fiction_amount: Optional[float] = None  # si además la simula


class FictionRequest(BaseModel):
    amount: float


class PathOut(BaseModel):
    id: int
    ticker: str
    name: str
    action: str
    conviction: int
    reasoning: str
    status: str  # followed / ignored
    price_at_decision: Optional[float]
    decided_at: Optional[datetime]
    fiction_amount: Optional[float]
    date: date
    # Evaluación live ("qué habría pasado")
    current_price: Optional[float] = None
    change_pct: Optional[float] = None  # variación del precio desde la decisión
    effect_pct: Optional[float] = None  # qué habría dado SEGUIR la recomendación (signo ya orientado)
    fiction_value: Optional[float] = None  # valor actual de la posición ficticia


# ── Helpers ──

_BUY_ACTIONS = ("comprar", "buy", "aumentar", "mantener", "vigilar")
_SELL_ACTIONS = ("vender", "sell", "reducir")


def _direction(action: str) -> int:
    a = action.strip().lower()
    if any(a.startswith(s) for s in _SELL_ACTIONS):
        return -1
    return 1


def _to_out(r: Recommendation, price: float | None) -> PathOut:
    change = None
    effect = None
    fiction_value = None
    if price and r.price_at_decision:
        change = round((price - r.price_at_decision) / r.price_at_decision * 100, 2)
        effect = round(change * _direction(r.action), 2)
        if r.fiction_amount:
            fiction_value = round(r.fiction_amount * (1 + effect / 100), 2)
    return PathOut(
        id=r.id,
        ticker=r.ticker or "",
        name=r.name or "",
        action=r.action,
        conviction=r.conviction,
        reasoning=r.reasoning,
        status=r.status.value if hasattr(r.status, "value") else str(r.status),
        price_at_decision=r.price_at_decision,
        decided_at=r.decided_at,
        fiction_amount=r.fiction_amount,
        date=r.date,
        current_price=price,
        change_pct=change,
        effect_pct=effect,
        fiction_value=fiction_value,
    )


# ── Endpoints ──

@router.post("/decide", response_model=PathOut)
async def decide(
    data: DecideRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Registra la decisión sobre una recomendación con snapshot del precio real.
    Esto es lo que hace posible el contrafactual: sin precio de referencia
    no hay "qué habría pasado".
    """
    if data.decision not in ("followed", "ignored"):
        raise HTTPException(status_code=400, detail="decision debe ser followed o ignored")

    price = None
    try:
        quote = await get_quote(data.ticker)
        price = float(quote.get("price") or 0) or None
    except Exception:
        pass

    rec = Recommendation(
        user_id=user.id,
        ticker=data.ticker.upper(),
        name=data.name,
        action=data.action,
        conviction=data.conviction,
        reasoning=data.reasoning,
        pro_arguments="",
        contra_arguments="",
        status=RecommendationStatus(data.decision),
        price_at_decision=price,
        decided_at=datetime.utcnow(),
        fiction_amount=data.fiction_amount,
        date=date.today(),
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return _to_out(rec, price)


@router.get("", response_model=list[PathOut])
async def list_paths(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Todas las decisiones registradas, evaluadas con precios actuales."""
    result = await db.execute(
        select(Recommendation)
        .where(
            Recommendation.user_id == user.id,
            Recommendation.status != RecommendationStatus.PENDING,
            Recommendation.decided_at.is_not(None),
        )
        .order_by(Recommendation.decided_at.desc())
        .limit(100)
    )
    recs = list(result.scalars().all())
    if not recs:
        return []

    tickers = sorted({r.ticker for r in recs if r.ticker})
    try:
        quotes = await get_quotes(tickers)
    except Exception:
        quotes = {}

    return [_to_out(r, quotes.get(r.ticker, {}).get("price")) for r in recs]


@router.patch("/{path_id}/fiction", response_model=PathOut)
async def set_fiction(
    path_id: int,
    data: FictionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Añade (o ajusta) la inversión ficticia sobre una decisión ya registrada."""
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser positiva")
    result = await db.execute(
        select(Recommendation).where(Recommendation.id == path_id, Recommendation.user_id == user.id)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Decisión no encontrada")
    rec.fiction_amount = data.amount
    await db.commit()
    await db.refresh(rec)

    price = None
    try:
        quote = await get_quote(rec.ticker)
        price = float(quote.get("price") or 0) or None
    except Exception:
        pass
    return _to_out(rec, price)


@router.delete("/{path_id}")
async def undo_decision(
    path_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deshacer: elimina la decisión registrada."""
    result = await db.execute(
        select(Recommendation).where(Recommendation.id == path_id, Recommendation.user_id == user.id)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Decisión no encontrada")
    await db.delete(rec)
    await db.commit()
    return {"ok": True}
