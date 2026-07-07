"""
Hilos temporales — la memoria acumulativa del briefing.

Un hilo = un tema recurrente (aranceles, ciclo IA, OPEC+...) que evoluciona
en el tiempo. En vez de re-explicar cada mañana desde cero, el briefing
consulta el hilo (cuándo apareció, qué ha pasado, qué cambió HOY) y solo
cuenta lo nuevo sobre el contexto acumulado.

POST /threads/ingest es la pieza clave: el pipeline del briefing la llamará
cada mañana con los desarrollos del día — upsert del hilo por slug + entry
nueva (dedupe por fecha+titular) + summary/outlook actualizados.
"""

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Thread, ThreadEntry
from app.api.auth import get_current_user, User

router = APIRouter(prefix="/threads", tags=["threads"])

VALID_SIGNIFICANCE = ("positivo", "negativo", "clave", "neutral")


# ── Schemas ──

class EntryIn(BaseModel):
    date: date
    headline: str
    detail: str = ""
    significance: str = "neutral"
    source: str = ""


class IngestRequest(BaseModel):
    slug: str
    title: str
    tickers: str = ""  # coma-separados
    summary: str = ""  # estado actual — REEMPLAZA al anterior
    outlook: str = ""  # predicción — reemplaza al anterior
    entry: Optional[EntryIn] = None  # el desarrollo de hoy (opcional)


class EntryOut(BaseModel):
    id: int
    date: date
    headline: str
    detail: str
    significance: str
    source: str

    model_config = {"from_attributes": True}


class ThreadOut(BaseModel):
    id: int
    slug: str
    title: str
    status: str
    summary: str
    outlook: str
    tickers: list[str]
    first_seen: date
    last_updated: datetime
    entries: list[EntryOut]


class ThreadPatch(BaseModel):
    status: str  # active / resolved / dormant


def _to_out(t: Thread) -> ThreadOut:
    return ThreadOut(
        id=t.id,
        slug=t.slug,
        title=t.title,
        status=t.status,
        summary=t.summary or "",
        outlook=t.outlook or "",
        tickers=[x.strip() for x in (t.tickers or "").split(",") if x.strip()],
        first_seen=t.first_seen,
        last_updated=t.last_updated,
        entries=[EntryOut.model_validate(e) for e in sorted(t.entries, key=lambda e: e.date)],
    )


# ── Endpoints ──

@router.get("", response_model=list[ThreadOut])
async def list_threads(
    status: str = "active",  # active / all / resolved / dormant
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Hilos del usuario con su evolución completa, los más recientes primero."""
    q = (
        select(Thread)
        .where(Thread.user_id == user.id)
        .options(selectinload(Thread.entries))
        .order_by(Thread.last_updated.desc())
        .limit(30)
    )
    if status != "all":
        q = q.where(Thread.status == status)
    result = await db.execute(q)
    return [_to_out(t) for t in result.scalars().all()]


@router.post("/ingest", response_model=ThreadOut)
async def ingest(
    data: IngestRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Memoria acumulativa: upsert del hilo por slug + entrada del día.
    Idempotente — re-ingestar el mismo desarrollo no duplica nada.
    """
    slug = data.slug.strip().lower()
    if not slug or not data.title.strip():
        raise HTTPException(status_code=400, detail="slug y title son obligatorios")
    if data.entry and data.entry.significance not in VALID_SIGNIFICANCE:
        raise HTTPException(status_code=400, detail=f"significance debe ser {VALID_SIGNIFICANCE}")

    result = await db.execute(
        select(Thread)
        .where(Thread.user_id == user.id, Thread.slug == slug)
        .options(selectinload(Thread.entries))
    )
    thread = result.scalar_one_or_none()

    if thread is None:
        thread = Thread(
            user_id=user.id,
            slug=slug,
            title=data.title.strip(),
            summary=data.summary,
            outlook=data.outlook,
            tickers=data.tickers,
            first_seen=data.entry.date if data.entry else date.today(),
        )
        db.add(thread)
        await db.flush()  # id para la entry
        thread.entries = []
    else:
        # El estado actual se REEMPLAZA (no se acumula texto viejo)
        thread.title = data.title.strip()
        if data.summary:
            thread.summary = data.summary
        if data.outlook:
            thread.outlook = data.outlook
        if data.tickers:
            thread.tickers = data.tickers
        if thread.status == "dormant":
            thread.status = "active"  # un tema dormido que vuelve, revive

    if data.entry:
        dup = any(
            e.date == data.entry.date and e.headline.strip() == data.entry.headline.strip()
            for e in thread.entries
        )
        if not dup:
            db.add(ThreadEntry(
                thread_id=thread.id,
                date=data.entry.date,
                headline=data.entry.headline.strip(),
                detail=data.entry.detail,
                significance=data.entry.significance,
                source=data.entry.source,
            ))
            thread.last_updated = datetime.utcnow()
            if data.entry.date < thread.first_seen:
                thread.first_seen = data.entry.date

    await db.commit()

    # Recargar con entries frescas
    result = await db.execute(
        select(Thread).where(Thread.id == thread.id).options(selectinload(Thread.entries))
    )
    return _to_out(result.scalar_one())


@router.patch("/{thread_id}", response_model=ThreadOut)
async def patch_thread(
    thread_id: int,
    data: ThreadPatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resolver o archivar un hilo (los resueltos cuentan la historia completa)."""
    if data.status not in ("active", "resolved", "dormant"):
        raise HTTPException(status_code=400, detail="status inválido")
    result = await db.execute(
        select(Thread)
        .where(Thread.id == thread_id, Thread.user_id == user.id)
        .options(selectinload(Thread.entries))
    )
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    thread.status = data.status
    await db.commit()
    await db.refresh(thread)
    return _to_out(thread)
