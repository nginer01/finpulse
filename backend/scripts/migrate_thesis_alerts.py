"""
Migration: Tesis → alertas automáticas (jul 2026).

Creates the `thesis_alerts` table: invalidation alerts extracted from user
theses (Decision Journal, documents, or manual) that watch real prices.

Run from backend/ with the venv active:  python scripts/migrate_thesis_alerts.py
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
    CREATE TABLE IF NOT EXISTS thesis_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        ticker VARCHAR(20) NOT NULL,
        thesis_summary TEXT NOT NULL,
        source_type VARCHAR(20) NOT NULL DEFAULT 'manual',
        source_id INTEGER,
        condition VARCHAR(20) NOT NULL,
        level FLOAT NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'invalidacion',
        rationale TEXT NOT NULL DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        triggered_at TIMESTAMP,
        triggered_price FLOAT,
        last_price FLOAT,
        last_checked_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_thesis_alerts_user_status ON thesis_alerts (user_id, status)",
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
