"use client";

import { useState, useEffect, useCallback } from "react";
import { getPortfolioSnapshot, getHistory, type PortfolioSnapshot, type OHLCV } from "@/lib/api";

const PORTFOLIO_TICKERS = ["IWDA", "VUAA", "BRT", "EUNA", "SEMI"];
const REFRESH_INTERVAL = 30_000; // 30 seconds

export function usePortfolioSnapshot() {
  const [data, setData] = useState<PortfolioSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await getPortfolioSnapshot(PORTFOLIO_TICKERS);
      setData(snapshot);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useChartData(ticker: string, timeframe: string) {
  const [candles, setCandles] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHistory(ticker, timeframe)
      .then((res) => {
        if (!cancelled) {
          setCandles(res.candles);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [ticker, timeframe]);

  return { candles, loading };
}
