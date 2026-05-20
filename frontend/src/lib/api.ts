const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Types ──

export type Quote = {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
  currency: string;
  name: string;
  marketState?: string;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
};

export type OHLCV = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IndexQuote = Quote & { label: string };

export type Fundamentals = {
  ticker: string;
  name: string;
  sector?: string;
  pe?: number;
  forwardPe?: number;
  beta?: number;
  marketCap?: number;
  dividendYield?: number;
  revenueGrowth?: number;
  profitMargins?: number;
  analystRating?: string;
  targetPrice?: number;
};

export type PortfolioSnapshot = {
  positions: Record<string, Quote>;
  indices: Record<string, IndexQuote>;
  timestamp: string;
};

// ── API functions ──

export async function getQuote(ticker: string): Promise<Quote> {
  return fetchAPI(`/api/market/quote/${ticker}`);
}

export async function getQuotes(tickers: string[]): Promise<Record<string, Quote>> {
  return fetchAPI(`/api/market/quotes?tickers=${tickers.join(",")}`);
}

export async function getHistory(ticker: string, timeframe = "6M"): Promise<{ ticker: string; timeframe: string; candles: OHLCV[] }> {
  return fetchAPI(`/api/market/history/${ticker}?timeframe=${timeframe}`);
}

export async function getIndices(): Promise<Record<string, IndexQuote>> {
  return fetchAPI(`/api/market/indices`);
}

export async function getFundamentals(ticker: string): Promise<Fundamentals> {
  return fetchAPI(`/api/market/fundamentals/${ticker}`);
}

export async function getPortfolioSnapshot(tickers: string[]): Promise<PortfolioSnapshot> {
  return fetchAPI(`/api/market/portfolio-snapshot?tickers=${tickers.join(",")}`);
}
