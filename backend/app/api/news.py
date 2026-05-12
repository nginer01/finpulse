from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import DailySummary, NewsArticle

router = APIRouter(prefix="/news", tags=["news"])


class SummaryOut(BaseModel):
    id: int
    date: date
    executive_summary: str
    full_content: str
    sources_count: int
    articles_count: int

    model_config = {"from_attributes": True}


class ArticleOut(BaseModel):
    id: int
    title: str
    summary: str | None
    source: str
    source_type: str
    url: str | None

    model_config = {"from_attributes": True}


@router.get("/summary/today", response_model=SummaryOut | None)
async def get_today_summary(db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(DailySummary).where(DailySummary.date == today).limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/summary/{target_date}", response_model=SummaryOut | None)
async def get_summary_by_date(target_date: date, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DailySummary).where(DailySummary.date == target_date).limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/articles", response_model=list[ArticleOut])
async def get_recent_articles(limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NewsArticle).order_by(NewsArticle.published_at.desc()).limit(limit)
    )
    return result.scalars().all()
