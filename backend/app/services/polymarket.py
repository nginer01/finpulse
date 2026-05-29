"""
Polymarket service — fetches prediction market data for financial events.
Uses the public Polymarket API (no auth needed).
"""

import httpx
from dataclasses import dataclass


@dataclass
class PredictionMarket:
    question: str
    probability: float  # 0-100
    volume: float
    category: str


# Key financial/economic events to track
TRACKED_SLUGS = [
    "fed-rate",
    "ecb-rate",
    "recession",
    "trump",
    "iran",
    "china",
    "bitcoin",
    "inflation",
    "oil",
    "sp500",
]


async def fetch_polymarket_data() -> list[PredictionMarket]:
    """
    Fetch relevant prediction market data from Polymarket.
    Returns a list of financial/economic predictions with probabilities.
    """
    markets = []

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Search for financial/economic markets
            for query in ["federal reserve", "ECB rate", "recession 2026", "S&P 500", "oil price", "inflation"]:
                try:
                    res = await client.get(
                        "https://gamma-api.polymarket.com/markets",
                        params={"tag": "economics", "limit": 5, "active": True, "closed": False},
                    )
                    if res.status_code != 200:
                        continue

                    data = res.json()
                    for market in data:
                        question = market.get("question", "")
                        outcomes = market.get("outcomePrices", [])
                        volume = market.get("volume", 0)

                        if not question or not outcomes:
                            continue

                        # Get the "Yes" probability
                        try:
                            prob = float(outcomes[0]) * 100 if outcomes else 0
                        except (ValueError, IndexError):
                            prob = 0

                        markets.append(PredictionMarket(
                            question=question,
                            probability=round(prob, 1),
                            volume=float(volume) if volume else 0,
                            category="economics",
                        ))
                except Exception:
                    continue

    except Exception:
        pass

    # Deduplicate by question
    seen = set()
    unique = []
    for m in markets:
        if m.question not in seen:
            seen.add(m.question)
            unique.append(m)

    return unique[:20]  # Max 20 markets


async def fetch_polymarket_text() -> str:
    """
    Fetch Polymarket data and return as formatted text for Claude.
    """
    markets = await fetch_polymarket_data()

    if not markets:
        return "No hay datos de Polymarket disponibles en este momento."

    parts = ["=== DATOS DE POLYMARKET (MERCADOS DE PREDICCION) ===\n"]

    for m in markets:
        parts.append(f"- {m.question}")
        parts.append(f"  Probabilidad: {m.probability}%")
        if m.volume > 0:
            parts.append(f"  Volumen: ${m.volume:,.0f}")
        parts.append("")

    return "\n".join(parts)
