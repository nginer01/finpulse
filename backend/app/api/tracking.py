"""
Tracking de comportamiento — personalización adaptativa de los resúmenes.

Recibe eventos en BATCH del frontend y calcula el perfil de intereses con
recency decay (misma fórmula que frontend/src/lib/tracking.ts).

Tablas Supabase necesarias (crear con este SQL):

    create table behavior_events (
      id bigserial primary key,
      user_id uuid,
      event_type text not null,
      topic text not null,
      ticker text, sector text, source text,
      duration_seconds int,
      signal_type text not null check (signal_type in ('interest','concern')),
      created_at timestamptz not null
    );
    create index on behavior_events (user_id, created_at desc);

    create table interest_profile (
      user_id uuid, topic text,
      interest int default 0, concern int default 0,
      updated_at timestamptz default now(),
      primary key (user_id, topic)
    );

Job nocturno (pendiente de cron real): llamar a POST /api/tracking/profile/recalc
cada noche — recalcula interest_profile agregando behavior_events con decay.
Mientras no exista el cron, /profile?recalc=1 lo hace bajo demanda.
"""

import math
import time
from collections import defaultdict

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import text

from app.core.database import async_session

router = APIRouter(prefix="/tracking", tags=["tracking"])

HALF_LIFE_DAYS = 14.0
WEIGHTS = {
    "click_source": 10, "save": 12, "expand": 8, "explicit_interest": 18,
    "feedback_up": 10, "feedback_down": -14, "search": 7, "portfolio_view": 4,
}


class TrackedEvent(BaseModel):
    eventType: str
    topic: str
    ticker: str | None = None
    sector: str | None = None
    source: str | None = None
    durationSeconds: float | None = None
    signalType: str = "interest"
    ts: float  # epoch ms


class EventBatch(BaseModel):
    events: list[TrackedEvent]


@router.post("/events")
async def ingest_events(batch: EventBatch):
    """Ingesta en batch. Best-effort: si la tabla no existe aún, no rompe al cliente."""
    if not batch.events:
        return {"stored": 0}
    try:
        async with async_session() as session:
            for e in batch.events[:200]:
                await session.execute(
                    text(
                        "insert into behavior_events (event_type, topic, ticker, sector, source, duration_seconds, signal_type, created_at) "
                        "values (:et, :topic, :ticker, :sector, :source, :dur, :sig, to_timestamp(:ts))"
                    ),
                    {
                        "et": e.eventType, "topic": e.topic.lower()[:80], "ticker": e.ticker,
                        "sector": e.sector, "source": e.source,
                        "dur": int(e.durationSeconds or 0), "sig": e.signalType, "ts": e.ts / 1000.0,
                    },
                )
            await session.commit()
        return {"stored": len(batch.events)}
    except Exception:
        # tabla no creada / DB caída: el frontend mantiene su agregado local
        return {"stored": 0, "note": "behavior_events no disponible — ver SQL en tracking.py"}


def _score(events: list[dict]) -> list[dict]:
    now = time.time()
    acc: dict[str, dict] = defaultdict(lambda: {"i": 0.0, "c": 0.0})
    for e in events:
        age_days = (now - e["ts"]) / 86400.0
        decay = 0.5 ** (age_days / HALF_LIFE_DAYS)
        base = min(12.0, (e["dur"] or 0) / 10.0) if e["et"] == "dwell" else WEIGHTS.get(e["et"], 0)
        pts = base * decay
        bucket = acc[e["topic"]]
        if e["sig"] == "concern":
            bucket["c"] += abs(pts)
        else:
            bucket["i"] += pts
    norm = lambda v: max(0, min(100, round(100 * (1 - math.exp(-v / 40.0)))))
    return sorted(
        [{"topic": t, "interest": norm(v["i"]), "concern": norm(v["c"])} for t, v in acc.items()],
        key=lambda x: -max(x["interest"], x["concern"]),
    )


@router.get("/profile")
async def get_profile(recalc: int = 1):
    """Perfil de intereses agregado (últimos 60 días de eventos, con decay)."""
    try:
        async with async_session() as session:
            rows = await session.execute(
                text(
                    "select event_type, topic, signal_type, duration_seconds, extract(epoch from created_at) as ts "
                    "from behavior_events where created_at > now() - interval '60 days'"
                )
            )
            events = [
                {"et": r.event_type, "topic": r.topic, "sig": r.signal_type, "dur": r.duration_seconds, "ts": float(r.ts)}
                for r in rows
            ]
        return {"profile": _score(events), "events": len(events)}
    except Exception:
        return {"profile": [], "events": 0, "note": "behavior_events no disponible"}
