"""
Migration: Decision Journal + broker auto-sync (jul 2026).

Adds to `operations`: source, external_id (dedupe key for CSV/email sync).
Adds to `decisions`: price_after_90d, operation_id (link to synced operation).

Run from backend/ with the venv active:  python scripts/migrate_journal.py
Uses asyncpg directly with statement_cache_size=0 (Supabase pgbouncer).
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncpg  # noqa: E402
from app.core.config import settings  # noqa: E402

STATEMENTS = [
    "ALTER TABLE operations ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual'",
    "ALTER TABLE operations ADD COLUMN IF NOT EXISTS external_id VARCHAR(64)",
    "CREATE UNIQUE INDEX IF NOT EXISTS ux_operations_external_id ON operations (external_id)",
    "ALTER TABLE decisions ADD COLUMN IF NOT EXISTS price_after_90d FLOAT",
    "ALTER TABLE decisions ADD COLUMN IF NOT EXISTS operation_id INTEGER REFERENCES operations(id)",
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
