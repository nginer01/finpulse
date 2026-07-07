"""
Migration: Modo quiz opcional (jul 2026).

Creates the `quiz_cards` table: post-briefing comprehension questions with
spaced repetition (1/3/7/14 days).

Run from backend/ with the venv active:  python scripts/migrate_quiz.py
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
    CREATE TABLE IF NOT EXISTS quiz_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_index INTEGER NOT NULL,
        explanation TEXT NOT NULL DEFAULT '',
        topic VARCHAR(100) NOT NULL DEFAULT '',
        step INTEGER NOT NULL DEFAULT 0,
        lapses INTEGER NOT NULL DEFAULT 0,
        mastered BOOLEAN NOT NULL DEFAULT FALSE,
        next_review_at TIMESTAMP,
        last_answered_at TIMESTAMP,
        source_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_quiz_cards_user_review ON quiz_cards (user_id, mastered, next_review_at)",
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
