from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import portfolio, chat, news, market, auth, journal, tracking

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="API para FinPulse — plataforma personal de inteligencia financiera",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(journal.router, prefix="/api")
app.include_router(tracking.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": "FinPulse API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/debug/db")
async def debug_db():
    import os
    db_url = os.environ.get("DATABASE_URL", "NOT SET")
    # Mask password
    masked = db_url
    if "@" in db_url and ":" in db_url:
        parts = db_url.split("@")
        pre = parts[0]
        host = parts[1] if len(parts) > 1 else ""
        user_pass = pre.split("//")[-1] if "//" in pre else pre
        user = user_pass.split(":")[0] if ":" in user_pass else user_pass
        masked = f"...{user}:****@{host}"

    try:
        from app.core.database import async_session
        from sqlalchemy import text
        async with async_session() as session:
            result = await session.execute(text("SELECT 1"))
            return {"db": "connected", "url_masked": masked}
    except Exception as e:
        return {"db": "error", "error": str(e), "url_masked": masked}
