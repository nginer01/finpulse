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

import asyncio
from datetime import date, datetime, timedelta
from typing import Optional

import anthropic
import yfinance as yf
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Decision, DecisionResult, Operation
from app.api.auth import get_current_user, User
from app.services import revolut
from app.services.gmail import fetch_emails
from app.services.market import TICKER_MAP

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
    operation_id: Optional[int] = None  # broker operation this decision tags

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
    price_after_90d: Optional[float]
    operation_id: Optional[int]
    date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class OperationOut(BaseModel):
    id: int
    ticker: str
    operation_type: str
    quantity: float
    price: float
    date: date
    broker: str
    source: str

    model_config = {"from_attributes": True}


class SyncResult(BaseModel):
    detected: int  # trades found in the source
    created: int  # new operations stored (after dedupe)
    operations: list[OperationOut]  # the newly created ones
    message: str

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

    # If the decision tags a synced broker operation, validate it and inherit its data
    operation = None
    if data.operation_id is not None:
        result = await db.execute(
            select(Operation).where(Operation.id == data.operation_id, Operation.user_id == user.id)
        )
        operation = result.scalar_one_or_none()
        if not operation:
            raise HTTPException(status_code=404, detail="Operacion no encontrada")
        existing = await db.execute(
            select(Decision).where(Decision.operation_id == data.operation_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Esta operacion ya tiene decision registrada")

    decision = Decision(
        user_id=user.id,
        ticker=(operation.ticker if operation else data.ticker).upper(),
        action=operation.operation_type if operation else data.action,
        price=operation.price if operation else data.price,
        quantity=operation.quantity if operation else data.quantity,
        conviction=data.conviction,
        tags=",".join(data.tags),
        thesis=data.thesis,
        date=operation.date if operation else (data.date or date.today()),
        operation_id=data.operation_id,
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
        decision.result = DecisionResult(data.result)
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


# ══════════════════════════════════════════════
# BROKER AUTO-SYNC (Revolut)
# ══════════════════════════════════════════════

async def _store_trades(
    trades: list[revolut.ParsedTrade], user: User, db: AsyncSession
) -> SyncResult:
    """Insert parsed trades as operations, skipping already-known external_ids."""
    if not trades:
        return SyncResult(detected=0, created=0, operations=[], message="No se detectaron operaciones nuevas")

    ext_ids = [t.external_id for t in trades]
    result = await db.execute(
        select(Operation.external_id).where(Operation.external_id.in_(ext_ids))
    )
    known = {row[0] for row in result.all()}

    created: list[Operation] = []
    seen: set[str] = set()
    for t in trades:
        if t.external_id in known or t.external_id in seen:
            continue
        seen.add(t.external_id)
        op = Operation(
            user_id=user.id,
            ticker=t.ticker,
            operation_type=t.operation_type,
            quantity=t.quantity,
            price=t.price,
            date=t.date,
            broker="Revolut",
            source=t.source,
            external_id=t.external_id,
        )
        db.add(op)
        created.append(op)

    await db.commit()
    for op in created:
        await db.refresh(op)

    return SyncResult(
        detected=len(trades),
        created=len(created),
        operations=[OperationOut.model_validate(op) for op in created],
        message=f"{len(created)} operaciones nuevas de {len(trades)} detectadas",
    )


@router.post("/sync/email", response_model=SyncResult)
async def sync_from_email(
    days_back: int = 7,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Scan the dedicated FinPulse inbox for Revolut order-confirmation emails
    and register any trades found as operations (deduped).
    """
    if not settings.gmail_address or not settings.gmail_app_password:
        return SyncResult(
            detected=0, created=0, operations=[],
            message="Gmail dedicado no configurado (GMAIL_ADDRESS + GMAIL_APP_PASSWORD)",
        )

    emails = await asyncio.to_thread(fetch_emails, days_back, 200)
    trades = []
    for em in emails:
        if not revolut.is_revolut_email(em.sender, em.subject):
            continue
        trade = revolut.parse_confirmation_email(em.subject, em.body, em.date)
        if trade:
            trades.append(trade)

    return await _store_trades(trades, user, db)


@router.post("/sync/csv", response_model=SyncResult)
async def sync_from_csv(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Import a Revolut account statement CSV as operations (deduped)."""
    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    trades = revolut.parse_csv(text)
    return await _store_trades(trades, user, db)


@router.get("/pending", response_model=list[OperationOut])
async def get_pending_operations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
):
    """Broker operations that still have no decision tagged — the quick-tag queue."""
    tagged = select(Decision.operation_id).where(
        Decision.user_id == user.id, Decision.operation_id.is_not(None)
    )
    result = await db.execute(
        select(Operation)
        .where(Operation.user_id == user.id, Operation.id.not_in(tagged))
        .order_by(Operation.date.desc(), Operation.id.desc())
        .limit(limit)
    )
    return [OperationOut.model_validate(op) for op in result.scalars().all()]


# ══════════════════════════════════════════════
# EVALUACION RETROSPECTIVA IA (30/90 dias)
# ══════════════════════════════════════════════

REVIEW_PROMPT = """Eres el CIO de FinPulse evaluando retrospectivamente una decision de inversion del usuario.

Evalua el PROCESO, no solo el resultado: una buena decision puede salir mal y viceversa.
Se directo y honesto, como un mentor de elite. En espanol. Maximo ~250 palabras.

Estructura tu respuesta en 3 partes:
1. **Veredicto**: ¿proceso solido o defectuoso? ¿El resultado valida o contradice el razonamiento?
2. **Lo que dice el precio**: interpreta los retornos a 7/30/90 dias vs la accion tomada.
3. **Leccion**: una leccion accionable y concreta para la proxima decision similar.

Si los tags incluyen razones emocionales (fomo, miedo, intuicion), señalalo explicitamente."""


def _fetch_prices_after(ticker: str, decision_date: date) -> dict[str, float | None]:
    """Closing prices ~7/30/90 days after the decision (None if horizon not reached)."""
    yf_symbol = TICKER_MAP.get(ticker.upper(), ticker.upper())
    end = min(decision_date + timedelta(days=100), date.today() + timedelta(days=1))
    try:
        df = yf.Ticker(yf_symbol).history(
            start=decision_date.isoformat(), end=end.isoformat(), interval="1d"
        )
    except Exception:
        return {}
    if df.empty:
        return {}

    closes = [(idx.date(), float(row["Close"])) for idx, row in df.iterrows()]
    out: dict[str, float | None] = {}
    for label, days in (("7d", 7), ("30d", 30), ("90d", 90)):
        target = decision_date + timedelta(days=days)
        if target > date.today():
            out[label] = None
            continue
        # First trading day at or after the horizon (tolerance: 7 days)
        candidates = [c for d, c in closes if target <= d <= target + timedelta(days=7)]
        out[label] = round(candidates[0], 4) if candidates else None
    return out


def _heuristic_result(action: str, entry: float, prices: dict[str, float | None]) -> str | None:
    """good/neutral/bad from the longest horizon available. Sells invert the sign."""
    for label in ("90d", "30d", "7d"):
        price = prices.get(label)
        if price and entry:
            ret = (price - entry) / entry
            effective = ret if action == "buy" else -ret
            if effective >= 0.02:
                return "good"
            if effective <= -0.02:
                return "bad"
            return "neutral"
    return None


@router.post("/decisions/{decision_id}/review", response_model=DecisionOut)
async def review_decision(
    decision_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrospective AI evaluation: fetches real prices 7/30/90 days after the
    decision, classifies the outcome, and (if Claude is configured) writes a
    process-focused review with a concrete lesson.
    """
    result = await db.execute(
        select(Decision).where(Decision.id == decision_id, Decision.user_id == user.id)
    )
    decision = result.scalar_one_or_none()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision no encontrada")

    prices = await asyncio.to_thread(_fetch_prices_after, decision.ticker, decision.date)
    if not any(prices.values()):
        raise HTTPException(
            status_code=422,
            detail="Aun no hay precios posteriores a la decision (demasiado reciente o ticker sin datos)",
        )

    decision.price_after_7d = prices.get("7d") or decision.price_after_7d
    decision.price_after_30d = prices.get("30d") or decision.price_after_30d
    decision.price_after_90d = prices.get("90d") or decision.price_after_90d

    heuristic = _heuristic_result(decision.action, decision.price, prices)
    if heuristic and decision.result is None:
        decision.result = DecisionResult(heuristic)

    # AI review (graceful fallback without API key)
    if settings.anthropic_api_key:
        def _pct(p: float | None) -> str:
            if not p or not decision.price:
                return "sin datos"
            ret = (p - decision.price) / decision.price * 100
            return f"{ret:+.1f}% ({p:.2f})"

        tag_labels = [AVAILABLE_TAGS.get(t, t) for t in (decision.tags or "").split(",") if t]
        context = f"""DECISION A EVALUAR:
- Accion: {"COMPRA" if decision.action == "buy" else "VENTA"} de {decision.quantity} uds de {decision.ticker} a {decision.price:.2f}
- Fecha: {decision.date.isoformat()}
- Conviccion declarada: {decision.conviction}/10
- Razones (tags): {", ".join(tag_labels) or "ninguna"}
- Tesis escrita: {decision.thesis or "(no escribio tesis)"}

EVOLUCION REAL DEL PRECIO DESPUES:
- A 7 dias: {_pct(prices.get("7d"))}
- A 30 dias: {_pct(prices.get("30d"))}
- A 90 dias: {_pct(prices.get("90d"))}

Clasificacion automatica del resultado: {heuristic or "pendiente"}"""

        try:
            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            response = await asyncio.to_thread(
                lambda: client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=1024,
                    system=REVIEW_PROMPT,
                    messages=[{"role": "user", "content": context}],
                )
            )
            decision.ai_review = response.content[0].text
        except Exception:
            pass  # keep price-based result even if the AI call fails

    await db.commit()
    await db.refresh(decision)
    return _to_out(decision)


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
        price_after_90d=d.price_after_90d,
        operation_id=d.operation_id,
        date=d.date,
        created_at=d.created_at,
    )
