"""Market data API endpoints."""

from fastapi import APIRouter, Query

from app.services import market as market_service

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/quote/{ticker}")
async def get_quote(ticker: str):
    """Get real-time quote for a single ticker."""
    return await market_service.get_quote(ticker)


@router.get("/quotes")
async def get_quotes(tickers: str = Query(..., description="Comma-separated tickers")):
    """Get real-time quotes for multiple tickers. Example: ?tickers=IWDA,VUAA,BRT"""
    ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
    return await market_service.get_quotes(ticker_list)


@router.get("/history/{ticker}")
async def get_history(
    ticker: str,
    timeframe: str = Query("6M", description="1S, 1M, 3M, 6M, 1A, YTD"),
):
    """Get OHLCV history for TradingChart. Returns array of {time, open, high, low, close, volume}."""
    candles = await market_service.get_history(ticker, timeframe)
    return {"ticker": ticker, "timeframe": timeframe, "candles": candles}


@router.get("/indices")
async def get_indices():
    """Get major market indices: S&P 500, Nasdaq, VIX, Brent, EUR/USD, etc."""
    return await market_service.get_indices()


@router.get("/fundamentals/{ticker}")
async def get_fundamentals(ticker: str):
    """Get fundamental data: P/E, margins, beta, analyst targets, etc."""
    return await market_service.get_fundamentals(ticker)


@router.get("/portfolio-snapshot")
async def get_portfolio_snapshot(
    tickers: str = Query(..., description="Comma-separated portfolio tickers"),
):
    """Get portfolio quotes + indices in one call for dashboard."""
    ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
    return await market_service.get_portfolio_snapshot(ticker_list)
