"""Create all database tables in Supabase."""
import asyncio
from app.core.database import engine, Base
from app.models.models import *  # noqa: F401, F403 — import all models so they register


async def create_all():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created successfully!")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_all())
