"""
Migration: El camino no tomado (jul 2026).

Adds to `recommendations`: name, price_at_decision, decided_at, fiction_amount —
the snapshot needed to evaluate "qué habría pasado" with real prices.

Run from backend/ with the venv active:  python scripts/migrate_paths.py
Uses asyncpg directly with statement_cache_size=0 (Supabase pgbouncer).
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncpg  # noqa: E402
from app.core.config import settings  # noqa: E402

STATEMENTS = [
    "ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS name VARCHAR(200)",
    "ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS price_at_decision FLOAT",
    "ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP",
    "ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS fiction_amount FLOAT",
]


async def main():
    dsn = settings.database_url.strip().replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn, statement_cache_size=0)
    try:
        for stmt in STATEMENTS:
            await conn.execute(stmt)
            print(f"OK: {stmt}")
    finally:
        await conn.close()
    print("Migration completed.")


if __name__ == "__main__":
    asyncio.run(main())
