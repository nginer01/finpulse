"""
Migration: Hilos temporales (jul 2026).

Creates `threads` + `thread_entries`: accumulated memory of recurring topics
so the briefing shows evolution instead of re-explaining from scratch.

Run from backend/ with the venv active:  python scripts/migrate_threads.py
Uses asyncpg directly with statement_cache_size=0 (Supabase pgbouncer).
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncpg  # noqa: E402
from app.core.config import settings  # noqa: E402

STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS threads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        slug VARCHAR(80) NOT NULL,
        title VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        summary TEXT NOT NULL DEFAULT '',
        outlook TEXT NOT NULL DEFAULT '',
        tickers VARCHAR(100) NOT NULL DEFAULT '',
        first_seen DATE NOT NULL,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
    """,
    "CREATE UNIQUE INDEX IF NOT EXISTS ux_threads_user_slug ON threads (user_id, slug)",
    """
    CREATE TABLE IF NOT EXISTS thread_entries (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES threads(id),
        date DATE NOT NULL,
        headline VARCHAR(300) NOT NULL,
        detail TEXT NOT NULL DEFAULT '',
        significance VARCHAR(20) NOT NULL DEFAULT 'neutral',
        source VARCHAR(100) NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_thread_entries_thread_date ON thread_entries (thread_id, date)",
]


async def main():
    dsn = settings.database_url.strip().replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn, statement_cache_size=0)
    try:
        for stmt in STATEMENTS:
            await conn.execute(stmt)
            print(f"OK: {stmt.strip().splitlines()[0]}...")
    finally:
        await conn.close()
    print("Migration completed.")


if __name__ == "__main__":
    asyncio.run(main())
