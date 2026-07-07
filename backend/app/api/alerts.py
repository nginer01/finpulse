"""
Tesis → alertas automáticas — el diferencial de FinPulse.

La IA lee las tesis del usuario (Decision Journal, documentos, o texto manual),
extrae las condiciones que las INVALIDARÍAN (niveles de precio) y las vigila
contra precios reales. Cuando un nivel se cruza, la alerta se dispara: la tesis
está tocada o rota, y el usuario se entera antes de racionalizar la pérdida.

Extracción: Claude si hay API key (entiende la tesis y propone niveles con
racional); fallback heurístico por regex de niveles si no.
Chequeo: POST /alerts/check evalúa todas las activas con yfinance — lo llamará
un cron; mientras tanto el frontend lo invoca al cargar (mismo patrón que el
recalc del tracking).
"""

import asyncio
import json
import re
from datetime import datetime
from typing import Optional

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Decision, ThesisAlert
from app.api.auth import get_current_user, User
from app.services.market import get_quotes

router = APIRouter(prefix="/alerts", tags=["alerts"])


# ── Schemas ──

class Proposal(BaseModel):
    condition: str  # price_below / price_above
    level: float
    severity: str  # aviso / invalidacion
    rationale: str = ""


class ExtractRequest(BaseModel):
    ticker: str
    thesis: str
    action: str = "buy"  # buy / sell — orienta la dirección de invalidación


class ExtractResponse(BaseModel):
    ticker: str
    current_price: Optional[float]
    thesis_summary: str
    proposals: list[Proposal]
    engine: str  # ia / heuristica


class AlertCreate(BaseModel):
    ticker: str
    thesis_summary: str
    condition: str
    level: float
    severity: str = "invalidacion"
    rationale: str = ""
    source_type: str = "manual"  # journal / document / manual
    source_id: Optional[int] = None


class AlertOut(BaseModel):
    id: int
    ticker: str
    thesis_summary: str
    source_type: str
    source_id: Optional[int]
    condition: str
    level: float
    severity: str
    rationale: str
    status: str
    triggered_at: Optional[datetime]
    triggered_price: Optional[float]
    last_price: Optional[float]
    last_checked_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertPatch(BaseModel):
    status: str  # active / dismissed


class CheckResult(BaseModel):
    checked: int
    triggered: list[AlertOut]
    alerts: list[AlertOut]


class ScanResult(BaseModel):
    scanned_theses: int
    created: list[AlertOut]
    engine: str
    message: str


# ── Extracción de condiciones de invalidación ──

EXTRACT_PROMPT = """Eres el CIO de FinPulse. Tu tarea: leer la tesis de inversión del usuario y extraer las condiciones de PRECIO que la INVALIDARÍAN.

Reglas:
- Solo niveles de precio del activo de la tesis (no de otros activos).
- Si la tesis menciona niveles explícitos (soportes, stops, "si cae por debajo de X"), úsalos.
- Si no hay niveles explícitos pero la tesis es direccional, propón niveles razonables: para una tesis alcista, un aviso ~-8% y una invalidación ~-15% desde el precio actual; para una bajista, al revés.
- Máximo 3 condiciones. severity: "aviso" (la tesis se debilita) o "invalidacion" (la tesis está rota).
- rationale: UNA frase concreta conectando el nivel con la tesis.
- Si la tesis no da pie a ninguna condición de precio, devuelve [].

Responde SOLO con JSON válido, sin texto adicional ni markdown:
{"thesis_summary": "<resumen de la tesis en 1 frase>", "conditions": [{"condition": "price_below"|"price_above", "level": <número>, "severity": "aviso"|"invalidacion", "rationale": "<frase>"}]}"""


def _extract_levels(text: str) -> list[float]:
    """Encuentra niveles de precio mencionados en el texto ($66, 66,40€, 'los 62'...)."""
    levels = []
    for m in re.finditer(r"[$€£]\s?(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s?[$€£]|\blos\s+(\d+(?:[.,]\d+)?)\b", text):
        raw = next(g for g in m.groups() if g)
        try:
            levels.append(float(raw.replace(",", ".")))
        except ValueError:
            continue
    return levels


def _heuristic_extract(ticker: str, thesis: str, action: str, current_price: float | None) -> tuple[str, list[Proposal]]:
    """Sin API key: regex de niveles + dirección según la acción de la tesis."""
    summary = thesis.strip().replace("\n", " ")
    if len(summary) > 180:
        summary = summary[:177] + "..."

    levels = _extract_levels(thesis)
    bullish = action != "sell"
    condition = "price_below" if bullish else "price_above"

    # Niveles relevantes: los que invalidarían (por debajo si alcista, por encima si bajista)
    if current_price:
        relevant = sorted(
            [lv for lv in levels if (lv < current_price) == bullish or lv == current_price],
            reverse=bullish,
        )
    else:
        relevant = sorted(set(levels), reverse=bullish)

    proposals: list[Proposal] = []
    if relevant:
        capped = relevant[:2] if len(relevant) >= 2 else relevant
        if len(capped) == 2:
            proposals.append(Proposal(condition=condition, level=capped[0], severity="aviso",
                                      rationale=f"Primer nivel mencionado en la tesis: la tesis se debilita en {capped[0]:g}."))
            proposals.append(Proposal(condition=condition, level=capped[1], severity="invalidacion",
                                      rationale=f"Nivel de ruptura de la tesis: {capped[1]:g}."))
        else:
            proposals.append(Proposal(condition=condition, level=capped[0], severity="invalidacion",
                                      rationale=f"Único nivel citado en la tesis: {capped[0]:g}."))
    elif current_price:
        aviso = round(current_price * (0.92 if bullish else 1.08), 2)
        invalida = round(current_price * (0.85 if bullish else 1.15), 2)
        proposals.append(Proposal(condition=condition, level=aviso, severity="aviso",
                                  rationale="Sin niveles explícitos en la tesis: aviso a ±8% del precio actual."))
        proposals.append(Proposal(condition=condition, level=invalida, severity="invalidacion",
                                  rationale="Invalidación por defecto a ±15% del precio actual."))

    return summary, proposals


def _parse_claude_json(text: str) -> dict:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.MULTILINE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Sin JSON en la respuesta")
    return json.loads(cleaned[start : end + 1])


async def _ai_extract(ticker: str, thesis: str, action: str, current_price: float | None) -> tuple[str, list[Proposal]] | None:
    """Claude lee la tesis y propone condiciones. None si no hay API key o falla."""
    if not settings.anthropic_api_key:
        return None
    context = f"""Activo: {ticker}
Acción de la tesis: {"COMPRA (tesis alcista)" if action != "sell" else "VENTA (tesis bajista)"}
Precio actual: {f"{current_price:.2f}" if current_price else "desconocido"}

TESIS DEL USUARIO:
{thesis}"""
    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = await asyncio.to_thread(
            lambda: client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=EXTRACT_PROMPT,
                messages=[{"role": "user", "content": context}],
            )
        )
        data = _parse_claude_json(response.content[0].text)
        proposals = []
        for c in data.get("conditions", [])[:3]:
            if c.get("condition") in ("price_below", "price_above") and isinstance(c.get("level"), (int, float)):
                proposals.append(Proposal(
                    condition=c["condition"],
                    level=float(c["level"]),
                    severity=c.get("severity") if c.get("severity") in ("aviso", "invalidacion") else "invalidacion",
                    rationale=str(c.get("rationale", ""))[:500],
                ))
        summary = str(data.get("thesis_summary", ""))[:300] or thesis[:180]
        return summary, proposals
    except Exception:
        return None


async def _current_price(ticker: str) -> float | None:
    try:
        quotes = await get_quotes([ticker])
        price = quotes.get(ticker.upper(), {}).get("price") or quotes.get(ticker, {}).get("price")
        return float(price) if price else None
    except Exception:
        return None


async def _extract(ticker: str, thesis: str, action: str) -> ExtractResponse:
    price = await _current_price(ticker)
    ai = await _ai_extract(ticker, thesis, action, price)
    if ai is not None:
        summary, proposals = ai
        engine = "ia"
    else:
        summary, proposals = _heuristic_extract(ticker, thesis, action, price)
        engine = "heuristica"
    return ExtractResponse(ticker=ticker.upper(), current_price=price, thesis_summary=summary,
                           proposals=proposals, engine=engine)


# ── Endpoints ──

@router.post("/extract", response_model=ExtractResponse)
async def extract_conditions(data: ExtractRequest, user: User = Depends(get_current_user)):
    """La IA lee una tesis y propone las alertas de invalidación (sin persistir)."""
    if not data.thesis.strip():
        raise HTTPException(status_code=400, detail="La tesis no puede estar vacía")
    return await _extract(data.ticker, data.thesis, data.action)


@router.post("", response_model=list[AlertOut])
async def create_alerts(
    alerts: list[AlertCreate],
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Persiste alertas (normalmente las propuestas por /extract que el usuario acepta)."""
    if not alerts:
        raise HTTPException(status_code=400, detail="Lista de alertas vacía")
    created = []
    for a in alerts:
        if a.condition not in ("price_below", "price_above"):
            raise HTTPException(status_code=400, detail=f"Condición inválida: {a.condition}")
        alert = ThesisAlert(
            user_id=user.id,
            ticker=a.ticker.upper(),
            thesis_summary=a.thesis_summary,
            source_type=a.source_type,
            source_id=a.source_id,
            condition=a.condition,
            level=a.level,
            severity=a.severity if a.severity in ("aviso", "invalidacion") else "invalidacion",
            rationale=a.rationale,
        )
        db.add(alert)
        created.append(alert)
    await db.commit()
    for alert in created:
        await db.refresh(alert)
    return [AlertOut.model_validate(a) for a in created]


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    status: str = "all",  # all / active / triggered / dismissed
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(ThesisAlert).where(ThesisAlert.user_id == user.id)
    if status != "all":
        q = q.where(ThesisAlert.status == status)
    result = await db.execute(q.order_by(ThesisAlert.created_at.desc()).limit(100))
    return [AlertOut.model_validate(a) for a in result.scalars().all()]


@router.patch("/{alert_id}", response_model=AlertOut)
async def patch_alert(
    alert_id: int,
    data: AlertPatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Descartar o reactivar una alerta."""
    if data.status not in ("active", "dismissed"):
        raise HTTPException(status_code=400, detail="status debe ser active o dismissed")
    result = await db.execute(
        select(ThesisAlert).where(ThesisAlert.id == alert_id, ThesisAlert.user_id == user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    alert.status = data.status
    if data.status == "active":
        alert.triggered_at = None
        alert.triggered_price = None
    await db.commit()
    await db.refresh(alert)
    return AlertOut.model_validate(alert)


@router.post("/check", response_model=CheckResult)
async def check_alerts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    El vigilante: evalúa todas las alertas activas contra precios reales.
    Lo llamará un cron; mientras tanto, el frontend lo invoca al cargar.
    """
    result = await db.execute(
        select(ThesisAlert).where(ThesisAlert.user_id == user.id, ThesisAlert.status == "active")
    )
    active = list(result.scalars().all())
    if not active:
        return CheckResult(checked=0, triggered=[], alerts=[])

    tickers = sorted({a.ticker for a in active})
    try:
        quotes = await get_quotes(tickers)
    except Exception:
        quotes = {}

    now = datetime.utcnow()
    triggered = []
    for a in active:
        price = quotes.get(a.ticker, {}).get("price")
        if not price:
            continue
        a.last_price = float(price)
        a.last_checked_at = now
        fired = (a.condition == "price_below" and price <= a.level) or (
            a.condition == "price_above" and price >= a.level
        )
        if fired:
            a.status = "triggered"
            a.triggered_at = now
            a.triggered_price = float(price)
            triggered.append(a)

    await db.commit()
    for a in active:
        await db.refresh(a)

    return CheckResult(
        checked=len(active),
        triggered=[AlertOut.model_validate(a) for a in triggered],
        alerts=[AlertOut.model_validate(a) for a in active],
    )


@router.post("/scan-journal", response_model=ScanResult)
async def scan_journal(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Recorre las tesis escritas en el Decision Journal y crea alertas de
    invalidación para las que aún no tienen ninguna. La IA (o la heurística)
    lee cada tesis una sola vez.
    """
    result = await db.execute(
        select(Decision).where(Decision.user_id == user.id, Decision.thesis != "")
    )
    decisions = [d for d in result.scalars().all() if (d.thesis or "").strip()]

    existing = await db.execute(
        select(ThesisAlert.source_id).where(
            ThesisAlert.user_id == user.id, ThesisAlert.source_type == "journal"
        )
    )
    covered = {row[0] for row in existing.all()}

    to_scan = [d for d in decisions if d.id not in covered]
    created: list[ThesisAlert] = []
    engine = "heuristica"

    for d in to_scan:
        extraction = await _extract(d.ticker, d.thesis, d.action)
        if extraction.engine == "ia":
            engine = "ia"
        for p in extraction.proposals:
            alert = ThesisAlert(
                user_id=user.id,
                ticker=d.ticker,
                thesis_summary=extraction.thesis_summary,
                source_type="journal",
                source_id=d.id,
                condition=p.condition,
                level=p.level,
                severity=p.severity,
                rationale=p.rationale,
            )
            db.add(alert)
            created.append(alert)

    await db.commit()
    for a in created:
        await db.refresh(a)

    return ScanResult(
        scanned_theses=len(to_scan),
        created=[AlertOut.model_validate(a) for a in created],
        engine=engine,
        message=f"{len(created)} alertas creadas de {len(to_scan)} tesis nuevas"
        if to_scan else "Todas las tesis del journal ya están vigiladas",
    )
