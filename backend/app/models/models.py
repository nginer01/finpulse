from datetime import datetime, date
from sqlalchemy import String, Float, Integer, Text, DateTime, Date, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


# ── Enums ──

class Priority(str, enum.Enum):
    ALTA = "alta"
    MEDIA = "media"
    BAJA = "baja"


class DecisionResult(str, enum.Enum):
    GOOD = "good"
    NEUTRAL = "neutral"
    BAD = "bad"


class RecommendationStatus(str, enum.Enum):
    FOLLOWED = "followed"
    IGNORED = "ignored"
    PENDING = "pending"


# ── User ──

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    experience_level: Mapped[str] = mapped_column(String(20), default="intermedio")
    timezone: Mapped[str] = mapped_column(String(50), default="Europe/Madrid")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    positions: Mapped[list["Position"]] = relationship(back_populates="user")
    decisions: Mapped[list["Decision"]] = relationship(back_populates="user")
    topics: Mapped[list["TrackingTopic"]] = relationship(back_populates="user")


# ── Portfolio ──

class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ticker: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Float)
    buy_price: Mapped[float] = mapped_column(Float)
    buy_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    broker: Mapped[str] = mapped_column(String(50), default="Revolut")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="positions")


class Operation(Base):
    __tablename__ = "operations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ticker: Mapped[str] = mapped_column(String(20))
    operation_type: Mapped[str] = mapped_column(String(10))  # buy / sell
    quantity: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    date: Mapped[date] = mapped_column(Date)
    broker: Mapped[str] = mapped_column(String(50), default="Revolut")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ── News & Sources ──

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(100))
    source_type: Mapped[str] = mapped_column(String(50))  # newsletter, podcast, x, polymarket, bank, news
    url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    # embedding will be stored via pgvector extension
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date)
    executive_summary: Mapped[str] = mapped_column(Text)
    full_content: Mapped[str] = mapped_column(Text)
    sources_count: Mapped[int] = mapped_column(Integer, default=0)
    articles_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ── Learning ──

class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ticker: Mapped[str] = mapped_column(String(20))
    action: Mapped[str] = mapped_column(String(10))  # buy / sell
    price: Mapped[float] = mapped_column(Float)
    quantity: Mapped[float] = mapped_column(Float)
    conviction: Mapped[int] = mapped_column(Integer)  # 1-10
    thesis: Mapped[str] = mapped_column(Text)
    result: Mapped[str | None] = mapped_column(SAEnum(DecisionResult), nullable=True)
    lesson: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="decisions")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ticker: Mapped[str | None] = mapped_column(String(20), nullable=True)
    action: Mapped[str] = mapped_column(String(100))
    conviction: Mapped[int] = mapped_column(Integer)  # 1-10
    reasoning: Mapped[str] = mapped_column(Text)
    pro_arguments: Mapped[str] = mapped_column(Text)
    contra_arguments: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(SAEnum(RecommendationStatus), default=RecommendationStatus.PENDING)
    outcome: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ── Tracking Topics ──

class TrackingTopic(Base):
    __tablename__ = "tracking_topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    priority: Mapped[str] = mapped_column(SAEnum(Priority), default=Priority.MEDIA)
    auto_priority: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="topics")
