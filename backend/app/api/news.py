from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import DailySummary, NewsArticle
from app.services.briefing import generate_briefing
from app.services.gmail import fetch_emails

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


class BriefingOut(BaseModel):
    briefing: str
    sources_count: int
    has_polymarket: bool
    has_market_data: bool
    generated_at: str


class EmailPreview(BaseModel):
    subject: str
    sender: str
    date: str
    source_type: str
    body_preview: str  # First 300 chars


# ── Existing endpoints ──

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


# ── New briefing endpoints ──

@router.post("/briefing/generate", response_model=BriefingOut)
async def generate_daily_briefing(days_back: int = 1):
    """
    Generate the daily briefing by reading all sources:
    - Gmail inbox (newsletters, newspapers, reports)
    - Polymarket (prediction markets)
    - Market data (yfinance)

    Passes everything to Claude CEO-of-JP-Morgan to generate
    a personalized briefing adapted to the user's portfolio.
    """
    result = await generate_briefing(days_back=days_back)
    return BriefingOut(
        briefing=result["briefing"],
        sources_count=result["sources_count"],
        has_polymarket=result.get("has_polymarket", False),
        has_market_data=result.get("has_market_data", False),
        generated_at=result["generated_at"],
    )


@router.get("/emails/preview", response_model=list[EmailPreview])
async def preview_emails(days_back: int = 1):
    """
    Preview what emails are in the FinPulse inbox.
    Useful for debugging — shows what the briefing will process.
    """
    emails = fetch_emails(days_back=days_back)
    return [
        EmailPreview(
            subject=em.subject,
            sender=em.sender,
            date=em.date.strftime("%Y-%m-%d %H:%M"),
            source_type=em.source_type,
            body_preview=em.body[:300] + "..." if len(em.body) > 300 else em.body,
        )
        for em in emails
    ]
