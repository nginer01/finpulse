"""Market data service — yfinance + Finnhub + FRED."""

import asyncio
from datetime import datetime, timedelta
from functools import lru_cache
from typing import Any

import yfinance as yf

from app.core.config import settings

# ── Ticker mapping: frontend ticker → yfinance symbol ──
TICKER_MAP: dict[str, str] = {
    # European ETFs (Amsterdam/London)
    "IWDA": "IWDA.AS",
    "VUAA": "VUAA.DE",
    "EUNA": "EUNA.AS",
    "SEMI": "SEMI.AS",
    # Commodities
    "BRT": "BZ=F",       # Brent Crude futures
    # US ETFs / Stocks (pass-through)
    "SPY": "SPY",
    "QQQ": "QQQ",
    "AAPL": "AAPL",
    "MSFT": "MSFT",
    "NVDA": "NVDA",
    "TSLA": "TSLA",
    "GLD": "GLD",
    "IBIT": "IBIT",
}

# Major indices for the indices endpoint
INDICES = {
    "S&P 500": "^GSPC",
    "Nasdaq": "^IXIC",
    "Stoxx 600": "^STOXX",
    "IBEX 35": "^IBEX",
    "DAX": "^GDAXI",
    "Nikkei 225": "^N225",
    "VIX": "^VIX",
    "Brent": "BZ=F",
    "Gold": "GC=F",
    "EUR/USD": "EURUSD=X",
    "US 10Y": "^TNX",
    "DXY": "DX-Y.NYB",
}

# yfinance period mapping from frontend timeframes
PERIOD_MAP = {
    "1S": "5d",
    "1M": "1mo",
    "3M": "3mo",
    "6M": "6mo",
    "1A": "1y",
    "YTD": "ytd",
    "MAX": "max",
}

INTERVAL_MAP = {
    "1S": "1h",
    "1M": "1d",
    "3M": "1d",
    "6M": "1wk",
    "1A": "1wk",
    "YTD": "1d",
}


def _resolve_ticker(ticker: str) -> str:
    return TICKER_MAP.get(ticker.upper(), ticker)


# ── Simple TTL cache ──
_cache: dict[str, tuple[float, Any]] = {}


def _get_cached(key: str, ttl_seconds: int = 60) -> Any | None:
    if key in _cache:
        ts, data = _cache[key]
        if datetime.now().timestamp() - ts < ttl_seconds:
            return data
    return None


def _set_cache(key: str, data: Any) -> None:
    _cache[key] = (datetime.now().timestamp(), data)


# ── Sync helpers (run in thread pool) ──

def _fetch_quote(yf_ticker: str) -> dict:
    t = yf.Ticker(yf_ticker)
    info = t.info
    price = info.get("regularMarketPrice") or info.get("previousClose") or 0
    prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose") or price
    change_pct = ((price - prev_close) / prev_close * 100) if prev_close else 0

    return {
        "price": price,
        "previousClose": prev_close,
        "change": round(price - prev_close, 4),
        "changePct": round(change_pct, 2),
        "currency": info.get("currency", "USD"),
        "name": info.get("shortName") or info.get("longName", yf_ticker),
        "marketState": info.get("marketState", "UNKNOWN"),
        "dayHigh": info.get("regularMarketDayHigh"),
        "dayLow": info.get("regularMarketDayLow"),
        "volume": info.get("regularMarketVolume"),
        "marketCap": info.get("marketCap"),
    }


def _fetch_quotes_batch(yf_tickers: list[str]) -> dict[str, dict]:
    tickers_str = " ".join(yf_tickers)
    data = yf.Tickers(tickers_str)
    results = {}
    for sym in yf_tickers:
        try:
            info = data.tickers[sym].info
            price = info.get("regularMarketPrice") or info.get("previousClose") or 0
            prev = info.get("regularMarketPreviousClose") or info.get("previousClose") or price
            change_pct = ((price - prev) / prev * 100) if prev else 0
            results[sym] = {
                "price": price,
                "previousClose": prev,
                "change": round(price - prev, 4),
                "changePct": round(change_pct, 2),
                "currency": info.get("currency", "USD"),
                "name": info.get("shortName") or info.get("longName", sym),
            }
        except Exception:
            results[sym] = {"price": 0, "error": f"Failed to fetch {sym}"}
    return results


def _fetch_history(yf_ticker: str, period: str, interval: str) -> list[dict]:
    t = yf.Ticker(yf_ticker)
    df = t.history(period=period, interval=interval)
    if df.empty:
        return []

    candles = []
    for idx, row in df.iterrows():
        time_str = idx.strftime("%Y-%m-%d")
        candles.append({
            "time": time_str,
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        })
    return candles


def _fetch_fundamentals(yf_ticker: str) -> dict:
    t = yf.Ticker(yf_ticker)
    info = t.info
    return {
        "name": info.get("shortName") or info.get("longName", yf_ticker),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "pe": info.get("trailingPE"),
        "forwardPe": info.get("forwardPE"),
        "eps": info.get("trailingEps"),
        "marketCap": info.get("marketCap"),
        "beta": info.get("beta"),
        "dividendYield": info.get("dividendYield"),
        "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
        "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
        "revenueGrowth": info.get("revenueGrowth"),
        "profitMargins": info.get("profitMargins"),
        "returnOnEquity": info.get("returnOnEquity"),
        "debtToEquity": info.get("debtToEquity"),
        "shortRatio": info.get("shortRatio"),
        "analystRating": info.get("recommendationKey"),
        "targetPrice": info.get("targetMeanPrice"),
    }


# ── Async public API ──

async def get_quote(ticker: str) -> dict:
    yf_sym = _resolve_ticker(ticker)
    cache_key = f"quote:{yf_sym}"
    cached = _get_cached(cache_key, ttl_seconds=30)
    if cached:
        return cached
    result = await asyncio.to_thread(_fetch_quote, yf_sym)
    result["ticker"] = ticker
    result["yf_symbol"] = yf_sym
    _set_cache(cache_key, result)
    return result


async def get_quotes(tickers: list[str]) -> dict[str, dict]:
    yf_map = {_resolve_ticker(t): t for t in tickers}
    yf_tickers = list(yf_map.keys())

    cache_key = f"quotes:{','.join(sorted(yf_tickers))}"
    cached = _get_cached(cache_key, ttl_seconds=30)
    if cached:
        return cached

    raw = await asyncio.to_thread(_fetch_quotes_batch, yf_tickers)

    # Map back to frontend tickers
    result = {}
    for yf_sym, data in raw.items():
        frontend_ticker = yf_map.get(yf_sym, yf_sym)
        data["ticker"] = frontend_ticker
        data["yf_symbol"] = yf_sym
        result[frontend_ticker] = data

    _set_cache(cache_key, result)
    return result


async def get_history(ticker: str, timeframe: str = "6M") -> list[dict]:
    yf_sym = _resolve_ticker(ticker)
    period = PERIOD_MAP.get(timeframe, "6mo")
    interval = INTERVAL_MAP.get(timeframe, "1d")

    cache_key = f"history:{yf_sym}:{period}:{interval}"
    cached = _get_cached(cache_key, ttl_seconds=300)
    if cached:
        return cached

    result = await asyncio.to_thread(_fetch_history, yf_sym, period, interval)
    _set_cache(cache_key, result)
    return result


async def get_indices() -> dict[str, dict]:
    cache_key = "indices:all"
    cached = _get_cached(cache_key, ttl_seconds=30)
    if cached:
        return cached

    yf_tickers = list(INDICES.values())
    raw = await asyncio.to_thread(_fetch_quotes_batch, yf_tickers)

    result = {}
    for label, yf_sym in INDICES.items():
        data = raw.get(yf_sym, {"price": 0, "error": "no data"})
        data["label"] = label
        data["yf_symbol"] = yf_sym
        result[label] = data

    _set_cache(cache_key, result)
    return result


async def get_fundamentals(ticker: str) -> dict:
    yf_sym = _resolve_ticker(ticker)
    cache_key = f"fundamentals:{yf_sym}"
    cached = _get_cached(cache_key, ttl_seconds=3600)
    if cached:
        return cached

    result = await asyncio.to_thread(_fetch_fundamentals, yf_sym)
    result["ticker"] = ticker
    result["yf_symbol"] = yf_sym
    _set_cache(cache_key, result)
    return result


async def get_portfolio_snapshot(tickers: list[str]) -> dict:
    """Get quotes for portfolio tickers + major indices in one call."""
    all_tickers = list(set(tickers))
    quotes = await get_quotes(all_tickers)
    indices = await get_indices()
    return {
        "positions": quotes,
        "indices": indices,
        "timestamp": datetime.now().isoformat(),
    }
