"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import BorderCard from "@/components/BorderCard";

/* ──────────────────────────────────────────────
   MOCK DATA — Assets
   ────────────────────────────────────────────── */

interface AssetData {
  ticker: string;
  name: string;
  priceHistory: number[]; // 6 months, normalized to 100 at start
  ytd: number;
  oneYear: number;
  volatility: number;
  maxDrawdown: number;
  sharpe: number;
  beta: number;
  pe: number;
  sectors: { label: string; pct: number; color: string }[];
  correlations: Record<string, number>;
}

const ASSETS: Record<string, AssetData> = {
  VUAA: {
    ticker: "VUAA",
    name: "Vanguard S&P 500 UCITS ETF",
    priceHistory: [100, 101.2, 99.8, 102.5, 103.1, 101.8, 104.2, 105.8, 106.3, 107.1, 108.5, 109.2, 110.8, 111.5, 112.3],
    ytd: 12.3,
    oneYear: 18.5,
    volatility: 14.2,
    maxDrawdown: -8.3,
    sharpe: 1.2,
    beta: 1.0,
    pe: 22,
    sectors: [
      { label: "Tecnologia", pct: 31, color: "#f5f5f7" },
      { label: "Salud", pct: 13, color: "#30d158" },
      { label: "Financiero", pct: 13, color: "#f5f5f7" },
      { label: "Consumo", pct: 11, color: "#f59e0b" },
      { label: "Otros", pct: 32, color: "#86868b" },
    ],
    correlations: { SEMI: 0.72, EUNA: 0.15, GLD: 0.08, IWDA: 0.95, AAPL: 0.82, MSFT: 0.85, NVDA: 0.68, TSLA: 0.55, SPY: 0.99, QQQ: 0.92, BRT: 0.25 },
  },
  SEMI: {
    ticker: "SEMI",
    name: "VanEck Semiconductor UCITS ETF",
    priceHistory: [100, 103.5, 101.2, 107.8, 110.5, 106.3, 112.8, 118.2, 115.5, 121.3, 125.8, 122.4, 128.7, 132.1, 128.7],
    ytd: 28.7,
    oneYear: 45.2,
    volatility: 28.5,
    maxDrawdown: -18.5,
    sharpe: 1.4,
    beta: 1.6,
    pe: 32,
    sectors: [
      { label: "Semiconductores", pct: 82, color: "#f5f5f7" },
      { label: "Equipamiento", pct: 12, color: "#f5f5f7" },
      { label: "Otros tech", pct: 6, color: "#86868b" },
    ],
    correlations: { VUAA: 0.72, EUNA: 0.05, GLD: -0.02, IWDA: 0.68, AAPL: 0.75, MSFT: 0.78, NVDA: 0.92, TSLA: 0.48, SPY: 0.71, QQQ: 0.88, BRT: 0.12 },
  },
  IWDA: {
    ticker: "IWDA",
    name: "iShares Core MSCI World UCITS ETF",
    priceHistory: [100, 100.8, 99.5, 101.8, 102.4, 101.2, 103.5, 104.8, 105.1, 105.9, 107.2, 107.8, 108.9, 109.5, 110.2],
    ytd: 10.2,
    oneYear: 15.8,
    volatility: 12.8,
    maxDrawdown: -7.1,
    sharpe: 1.1,
    beta: 0.95,
    pe: 20,
    sectors: [
      { label: "Tecnologia", pct: 24, color: "#f5f5f7" },
      { label: "Financiero", pct: 16, color: "#f5f5f7" },
      { label: "Salud", pct: 12, color: "#30d158" },
      { label: "Industrial", pct: 11, color: "#f59e0b" },
      { label: "Otros", pct: 37, color: "#86868b" },
    ],
    correlations: { VUAA: 0.95, SEMI: 0.68, EUNA: 0.20, GLD: 0.10, AAPL: 0.78, MSFT: 0.80, NVDA: 0.62, TSLA: 0.50, SPY: 0.96, QQQ: 0.88, BRT: 0.30 },
  },
  EUNA: {
    ticker: "EUNA",
    name: "iShares Euro Gov Bond UCITS ETF",
    priceHistory: [100, 100.2, 100.5, 100.1, 99.8, 100.3, 100.6, 100.8, 101.0, 100.7, 101.2, 101.5, 101.8, 102.0, 102.3],
    ytd: 2.3,
    oneYear: 4.1,
    volatility: 5.2,
    maxDrawdown: -2.1,
    sharpe: 0.6,
    beta: 0.1,
    pe: 0,
    sectors: [
      { label: "Bonos Gobierno", pct: 72, color: "#30d158" },
      { label: "Bonos Corporativos", pct: 18, color: "#f5f5f7" },
      { label: "Otros RF", pct: 10, color: "#86868b" },
    ],
    correlations: { VUAA: 0.15, SEMI: 0.05, IWDA: 0.20, GLD: 0.35, AAPL: 0.10, MSFT: 0.12, NVDA: 0.02, TSLA: -0.05, SPY: 0.14, QQQ: 0.08, BRT: -0.10 },
  },
  GLD: {
    ticker: "GLD",
    name: "SPDR Gold Shares",
    priceHistory: [100, 101.5, 103.2, 102.8, 104.5, 106.1, 105.3, 107.8, 109.2, 108.5, 110.8, 112.3, 113.5, 114.8, 115.2],
    ytd: 15.2,
    oneYear: 22.5,
    volatility: 11.5,
    maxDrawdown: -5.8,
    sharpe: 1.3,
    beta: 0.05,
    pe: 0,
    sectors: [
      { label: "Oro fisico", pct: 100, color: "#f59e0b" },
    ],
    correlations: { VUAA: 0.08, SEMI: -0.02, IWDA: 0.10, EUNA: 0.35, AAPL: 0.05, MSFT: 0.06, NVDA: -0.05, TSLA: -0.10, SPY: 0.07, QQQ: 0.02, BRT: 0.22 },
  },
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    priceHistory: [100, 101.8, 100.5, 103.2, 105.1, 103.8, 106.5, 108.2, 107.5, 109.8, 112.3, 111.5, 114.2, 115.8, 116.5],
    ytd: 16.5,
    oneYear: 24.8,
    volatility: 18.5,
    maxDrawdown: -10.2,
    sharpe: 1.25,
    beta: 1.1,
    pe: 28,
    sectors: [
      { label: "Hardware", pct: 52, color: "#f5f5f7" },
      { label: "Servicios", pct: 28, color: "#30d158" },
      { label: "Wearables", pct: 12, color: "#f5f5f7" },
      { label: "Otros", pct: 8, color: "#86868b" },
    ],
    correlations: { VUAA: 0.82, SEMI: 0.75, IWDA: 0.78, EUNA: 0.10, GLD: 0.05, MSFT: 0.88, NVDA: 0.72, TSLA: 0.45, SPY: 0.83, QQQ: 0.90, BRT: 0.18 },
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    priceHistory: [100, 102.1, 101.2, 104.5, 106.2, 104.8, 107.8, 109.5, 110.2, 112.1, 114.5, 113.8, 116.2, 117.8, 118.5],
    ytd: 18.5,
    oneYear: 28.2,
    volatility: 19.2,
    maxDrawdown: -9.8,
    sharpe: 1.35,
    beta: 1.15,
    pe: 34,
    sectors: [
      { label: "Cloud", pct: 42, color: "#f5f5f7" },
      { label: "Productividad", pct: 32, color: "#f5f5f7" },
      { label: "Gaming", pct: 14, color: "#30d158" },
      { label: "Otros", pct: 12, color: "#86868b" },
    ],
    correlations: { VUAA: 0.85, SEMI: 0.78, IWDA: 0.80, EUNA: 0.12, GLD: 0.06, AAPL: 0.88, NVDA: 0.80, TSLA: 0.42, SPY: 0.86, QQQ: 0.92, BRT: 0.15 },
  },
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    priceHistory: [100, 105.2, 102.8, 112.5, 118.3, 113.5, 122.8, 130.5, 126.2, 135.8, 142.5, 138.2, 148.5, 155.2, 152.8],
    ytd: 52.8,
    oneYear: 85.5,
    volatility: 38.5,
    maxDrawdown: -22.3,
    sharpe: 1.5,
    beta: 1.9,
    pe: 55,
    sectors: [
      { label: "Data Center / AI", pct: 65, color: "#f5f5f7" },
      { label: "Gaming", pct: 22, color: "#30d158" },
      { label: "Auto", pct: 8, color: "#f5f5f7" },
      { label: "Otros", pct: 5, color: "#86868b" },
    ],
    correlations: { VUAA: 0.68, SEMI: 0.92, IWDA: 0.62, EUNA: 0.02, GLD: -0.05, AAPL: 0.72, MSFT: 0.80, TSLA: 0.55, SPY: 0.67, QQQ: 0.85, BRT: 0.08 },
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla Inc.",
    priceHistory: [100, 108.5, 95.2, 112.8, 105.3, 98.5, 115.2, 122.8, 110.5, 125.3, 118.2, 108.5, 130.2, 125.8, 120.5],
    ytd: 20.5,
    oneYear: 32.8,
    volatility: 48.5,
    maxDrawdown: -28.5,
    sharpe: 0.85,
    beta: 2.1,
    pe: 65,
    sectors: [
      { label: "Automotriz", pct: 55, color: "#f5f5f7" },
      { label: "Energia", pct: 25, color: "#30d158" },
      { label: "AI / Autonomo", pct: 15, color: "#f5f5f7" },
      { label: "Otros", pct: 5, color: "#86868b" },
    ],
    correlations: { VUAA: 0.55, SEMI: 0.48, IWDA: 0.50, EUNA: -0.05, GLD: -0.10, AAPL: 0.45, MSFT: 0.42, NVDA: 0.55, SPY: 0.54, QQQ: 0.60, BRT: 0.20 },
  },
  SPY: {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    priceHistory: [100, 101.3, 99.9, 102.6, 103.2, 101.9, 104.3, 105.9, 106.4, 107.2, 108.6, 109.3, 110.9, 111.6, 112.4],
    ytd: 12.4,
    oneYear: 18.8,
    volatility: 14.0,
    maxDrawdown: -8.1,
    sharpe: 1.22,
    beta: 1.0,
    pe: 22,
    sectors: [
      { label: "Tecnologia", pct: 31, color: "#f5f5f7" },
      { label: "Salud", pct: 13, color: "#30d158" },
      { label: "Financiero", pct: 13, color: "#f5f5f7" },
      { label: "Consumo", pct: 11, color: "#f59e0b" },
      { label: "Otros", pct: 32, color: "#86868b" },
    ],
    correlations: { VUAA: 0.99, SEMI: 0.71, IWDA: 0.96, EUNA: 0.14, GLD: 0.07, AAPL: 0.83, MSFT: 0.86, NVDA: 0.67, TSLA: 0.54, QQQ: 0.93, BRT: 0.26 },
  },
  QQQ: {
    ticker: "QQQ",
    name: "Invesco QQQ Trust (Nasdaq-100)",
    priceHistory: [100, 102.5, 100.8, 105.2, 107.1, 104.5, 108.8, 111.5, 112.2, 114.8, 117.5, 116.2, 119.8, 121.5, 122.8],
    ytd: 22.8,
    oneYear: 32.5,
    volatility: 18.8,
    maxDrawdown: -12.5,
    sharpe: 1.35,
    beta: 1.25,
    pe: 30,
    sectors: [
      { label: "Tecnologia", pct: 50, color: "#f5f5f7" },
      { label: "Comunicaciones", pct: 16, color: "#f5f5f7" },
      { label: "Consumo", pct: 15, color: "#f59e0b" },
      { label: "Salud", pct: 7, color: "#30d158" },
      { label: "Otros", pct: 12, color: "#86868b" },
    ],
    correlations: { VUAA: 0.92, SEMI: 0.88, IWDA: 0.88, EUNA: 0.08, GLD: 0.02, AAPL: 0.90, MSFT: 0.92, NVDA: 0.85, TSLA: 0.60, SPY: 0.93, BRT: 0.18 },
  },
  BRT: {
    ticker: "BRT",
    name: "Brent Crude Oil ETF",
    priceHistory: [100, 98.5, 102.3, 99.8, 96.5, 101.2, 97.8, 95.2, 99.5, 97.2, 93.8, 96.5, 94.2, 92.8, 91.5],
    ytd: -8.5,
    oneYear: -12.2,
    volatility: 32.5,
    maxDrawdown: -15.8,
    sharpe: -0.3,
    beta: 0.8,
    pe: 0,
    sectors: [
      { label: "Petróleo crudo", pct: 85, color: "#ff453a" },
      { label: "Gas natural", pct: 10, color: "#f59e0b" },
      { label: "Otros", pct: 5, color: "#86868b" },
    ],
    correlations: { VUAA: 0.25, SEMI: 0.12, IWDA: 0.30, EUNA: -0.10, GLD: 0.22, AAPL: 0.18, MSFT: 0.15, NVDA: 0.08, TSLA: 0.20, SPY: 0.26, QQQ: 0.18 },
  },
};

const TICKER_LIST = Object.keys(ASSETS);

const MONTHS = ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May"];

/* ──────────────────────────────────────────────
   HELPER: get correlation between two assets
   ────────────────────────────────────────────── */

function getCorrelation(a: string, b: string): number {
  if (a === b) return 1.0;
  return ASSETS[a]?.correlations[b] ?? ASSETS[b]?.correlations[a] ?? 0.5;
}

function correlationLabel(c: number): { text: string; color: string } {
  const abs = Math.abs(c);
  if (abs >= 0.7) return { text: "Alta", color: "#ff453a" };
  if (abs >= 0.4) return { text: "Moderada", color: "#f59e0b" };
  return { text: "Baja", color: "#30d158" };
}

function correlationAdvice(a: string, b: string, corr: number): string {
  if (corr >= 0.7) {
    return `Correlación alta -- ambos activos tienden a moverse en la misma direccion. Diversificación limitada.`;
  }
  if (corr >= 0.4) {
    return `Correlación moderada -- cierta diversificación, pero siguen compartiendo factores de riesgo comunes.`;
  }
  if (corr >= 0) {
    return `Correlación baja -- excelente para diversificación. Los movimientos de ${a} y ${b} son relativamente independientes.`;
  }
  return `Correlación negativa -- cuando uno sube, el otro tiende a bajar. Muy util como cobertura.`;
}

/* ──────────────────────────────────────────────
   SVG PRICE CHART
   ────────────────────────────────────────────── */

function PriceChart({ assetA, assetB }: { assetA: AssetData; assetB: AssetData }) {
  const dataA = assetA.priceHistory;
  const dataB = assetB.priceHistory;
  const allValues = [...dataA, ...dataB];
  const minVal = Math.min(...allValues) - 2;
  const maxVal = Math.max(...allValues) + 2;
  const range = maxVal - minVal;

  const W = 700;
  const H = 256;
  const padX = 0;
  const padY = 16;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  function toPoints(data: number[]): string {
    return data
      .map((v, i) => {
        const x = padX + (i / (data.length - 1)) * chartW;
        const y = padY + chartH - ((v - minVal) / range) * chartH;
        return `${x},${y}`;
      })
      .join(" ");
  }

  function toAreaPoints(data: number[]): string {
    const line = data.map((v, i) => {
      const x = padX + (i / (data.length - 1)) * chartW;
      const y = padY + chartH - ((v - minVal) / range) * chartH;
      return `${x},${y}`;
    });
    return `${padX},${padY + chartH} ${line.join(" ")} ${padX + chartW},${padY + chartH}`;
  }

  // Grid lines
  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) => minVal + (range / (gridLines - 1)) * i);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5f5f7" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f5f5f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#30d158" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#30d158" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridValues.map((v, i) => {
          const y = padY + chartH - ((v - minVal) / range) * chartH;
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="#2d2d2d" strokeWidth="1" />
              <text x={W - 4} y={y - 4} fill="#86868b" fontSize="10" textAnchor="end">
                {v.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Areas */}
        <polygon points={toAreaPoints(dataA)} fill="url(#gradA)" />
        <polygon points={toAreaPoints(dataB)} fill="url(#gradB)" />

        {/* Lines */}
        <polyline points={toPoints(dataA)} fill="none" stroke="#f5f5f7" strokeWidth="2.5" strokeLinejoin="round" />
        <polyline points={toPoints(dataB)} fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinejoin="round" />

        {/* End dots */}
        {[dataA, dataB].map((data, idx) => {
          const lastI = data.length - 1;
          const x = padX + (lastI / (data.length - 1)) * chartW;
          const y = padY + chartH - ((data[lastI] - minVal) / range) * chartH;
          const color = idx === 0 ? "#f5f5f7" : "#30d158";
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="4" fill={color} />
              <circle cx={x} cy={y} r="7" fill={color} opacity="0.25" />
            </g>
          );
        })}
      </svg>

      {/* X axis labels */}
      <div className="flex justify-between px-1 mt-1">
        {MONTHS.map((m) => (
          <span key={m} className="text-[10px] text-muted">{m}</span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   DONUT CHART
   ────────────────────────────────────────────── */

function DonutChart({ data, label }: { data: { label: string; pct: number; color: string }[]; label: string }) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  const stroke = 14;

  let cumulative = 0;
  const segments = data.map((d) => {
    const start = cumulative;
    cumulative += d.pct;
    return { ...d, start, end: cumulative };
  });

  function arc(startPct: number, endPct: number): string {
    const startAngle = (startPct / 100) * 360 - 90;
    const endAngle = (endPct / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={arc(seg.start, seg.end - 0.5)}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e5e5e5" fontSize="13" fontWeight="600">
          {label}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#86868b" fontSize="9">
          Composicion
        </text>
      </svg>
      <div className="space-y-1.5 w-full">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-muted flex-1">{d.label}</span>
            <span className="font-medium">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   METRIC COMPARISON ROW
   ────────────────────────────────────────────── */

type MetricDirection = "higher" | "lower" | "neutral";

interface MetricRow {
  label: string;
  valueA: number;
  valueB: number;
  format: (v: number) => string;
  direction: MetricDirection; // "higher" = higher is better, "lower" = lower is better
}

function MetricComparisonTable({ metrics }: { metrics: MetricRow[] }) {
  return (
    <div className="space-y-3">
      {metrics.map((m) => {
        const maxVal = Math.max(Math.abs(m.valueA), Math.abs(m.valueB));
        const barA = maxVal > 0 ? (Math.abs(m.valueA) / maxVal) * 100 : 0;
        const barB = maxVal > 0 ? (Math.abs(m.valueB) / maxVal) * 100 : 0;

        let winnerA = false;
        let winnerB = false;
        if (m.direction === "higher") {
          winnerA = m.valueA > m.valueB;
          winnerB = m.valueB > m.valueA;
        } else if (m.direction === "lower") {
          winnerA = Math.abs(m.valueA) < Math.abs(m.valueB);
          winnerB = Math.abs(m.valueB) < Math.abs(m.valueA);
        }

        const colorA = winnerA ? "#f5f5f7" : "#86868b";
        const colorB = winnerB ? "#30d158" : "#86868b";

        return (
          <div key={m.label} className="bg-card border border-card-border rounded-lg p-3 sm:p-4">
            <p className="text-xs text-muted mb-2 font-medium">{m.label}</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Asset A */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: winnerA ? "#f5f5f7" : "#e5e5e5" }}
                  >
                    {m.format(m.valueA)}
                  </span>
                  {winnerA && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent-light font-medium">
                      Mejor
                    </span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-card-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barA}%`, backgroundColor: colorA }}
                  />
                </div>
              </div>
              {/* Asset B */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: winnerB ? "#30d158" : "#e5e5e5" }}
                  >
                    {m.format(m.valueB)}
                  </span>
                  {winnerB && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green/15 text-green font-medium">
                      Mejor
                    </span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-card-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barB}%`, backgroundColor: colorB }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   CORRELATION VISUAL
   ────────────────────────────────────────────── */

function CorrelationVisual({ tickerA, tickerB, corr }: { tickerA: string; tickerB: string; corr: number }) {
  const { text, color } = correlationLabel(corr);
  const pct = ((corr + 1) / 2) * 100; // map -1..1 to 0..100

  return (
    <BorderCard padding="p-5" className="sm:">
      <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-4">Analisis de correlación</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Big number */}
        <div className="text-center sm:text-left shrink-0">
          <p className="text-4xl font-bold tracking-tight" style={{ color }}>
            {corr.toFixed(2)}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color }}>
            Correlación {text}
          </p>
        </div>

        {/* Bar */}
        <div className="flex-1 w-full">
          <div className="flex justify-between text-[10px] text-muted mb-1">
            <span>-1.0 (inversa)</span>
            <span>0 (sin corr.)</span>
            <span>+1.0 (perfecta)</span>
          </div>
          <div className="h-4 rounded-full bg-card-border overflow-hidden relative">
            {/* Color zones */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-green/10" />
              <div className="flex-1 bg-amber-500/10" />
              <div className="flex-1 bg-red/10" />
            </div>
            {/* Indicator */}
            <div
              className="absolute top-0 bottom-0 w-1 rounded-full transition-all duration-500"
              style={{
                left: `${pct}%`,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          </div>

          <div className="mt-3 bg-background rounded-lg p-3 border border-card-border">
            <p className="text-xs text-muted leading-relaxed">
              {correlationAdvice(tickerA, tickerB, corr)}
            </p>
          </div>
        </div>
      </div>
    </BorderCard>
  );
}

/* ──────────────────────────────────────────────
   ASSET SELECTOR
   ────────────────────────────────────────────── */

function AssetSelector({
  value,
  onChange,
  color,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  color: string;
  label: string;
}) {
  return (
    <div className="flex-1">
      <label className="text-xs text-muted mb-1.5 block">{label}</label>
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-card border border-card-border rounded-lg pl-8 pr-4 py-2.5 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-accent/50 transition-colors"
          style={{ color: "#e5e5e5" }}
        >
          {TICKER_LIST.map((t) => (
            <option key={t} value={t} className="bg-card">
              {t} — {ASSETS[t].name}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */

export default function ComparadorPage() {
  const [tickerA, setTickerA] = useState("VUAA");
  const [tickerB, setTickerB] = useState("SEMI");

  const assetA = ASSETS[tickerA];
  const assetB = ASSETS[tickerB];
  const corr = getCorrelation(tickerA, tickerB);

  const metrics: MetricRow[] = [
    { label: "Rendimiento YTD", valueA: assetA.ytd, valueB: assetB.ytd, format: (v) => `${v >= 0 ? "+" : ""}${v}%`, direction: "higher" },
    { label: "Rendimiento 1 Ano", valueA: assetA.oneYear, valueB: assetB.oneYear, format: (v) => `${v >= 0 ? "+" : ""}${v}%`, direction: "higher" },
    { label: "Volatilidad", valueA: assetA.volatility, valueB: assetB.volatility, format: (v) => `${v}%`, direction: "lower" },
    { label: "Max Drawdown", valueA: assetA.maxDrawdown, valueB: assetB.maxDrawdown, format: (v) => `${v}%`, direction: "lower" },
    { label: "Sharpe Ratio", valueA: assetA.sharpe, valueB: assetB.sharpe, format: (v) => v.toFixed(2), direction: "higher" },
    { label: "Beta", valueA: assetA.beta, valueB: assetB.beta, format: (v) => v.toFixed(1), direction: "neutral" },
    { label: "P/E Ratio", valueA: assetA.pe, valueB: assetB.pe, format: (v) => (v === 0 ? "N/A" : `${v}x`), direction: "neutral" },
  ];

  // Find low-correlation suggestions
  const suggestions = TICKER_LIST
    .filter((t) => t !== tickerA && t !== tickerB)
    .map((t) => ({ ticker: t, corr: getCorrelation(tickerA, t) }))
    .sort((a, b) => a.corr - b.corr)
    .slice(0, 2);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ─── 1. HEADER & SELECTORS ─── */}
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-extralight tracking-wide mb-1">
              Comparador de activos
            </h1>
            <p className="text-sm text-muted">
              Compara rendimiento, riesgo y composición de dos activos lado a lado.
            </p>
          </div>

          <BorderCard padding="p-4" className="sm:">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <AssetSelector
                value={tickerA}
                onChange={setTickerA}
                color="#f5f5f7"
                label="Activo A"
              />
              <div className="hidden sm:flex items-end pb-2.5">
                <span className="text-muted text-sm font-medium">vs</span>
              </div>
              <AssetSelector
                value={tickerB}
                onChange={setTickerB}
                color="#30d158"
                label="Activo B"
              />
            </div>

            {/* Quick summary chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-card-border">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-xs font-medium text-accent-light">{assetA.ticker}</span>
                <span className="text-xs text-muted">{assetA.name}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green/10">
                <span className="w-2.5 h-2.5 rounded-full bg-green" />
                <span className="text-xs font-medium text-green">{assetB.ticker}</span>
                <span className="text-xs text-muted">{assetB.name}</span>
              </div>
            </div>
          </BorderCard>
        </section>

        {/* ─── 2. PRICE CHART OVERLAY ─── */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-4">Rendimiento comparado (6 meses)</h2>
          <BorderCard padding="p-4" className="sm:">
            {/* Legend */}
            <div className="flex items-center gap-5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 rounded-full bg-accent" />
                <span className="text-xs font-medium">{assetA.ticker}</span>
                <span className={`text-xs font-semibold ${assetA.priceHistory[assetA.priceHistory.length - 1] >= 100 ? "text-accent-light" : "text-red"}`}>
                  {assetA.priceHistory[assetA.priceHistory.length - 1] >= 100 ? "+" : ""}
                  {(assetA.priceHistory[assetA.priceHistory.length - 1] - 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 rounded-full bg-green" />
                <span className="text-xs font-medium">{assetB.ticker}</span>
                <span className={`text-xs font-semibold ${assetB.priceHistory[assetB.priceHistory.length - 1] >= 100 ? "text-green" : "text-red"}`}>
                  {assetB.priceHistory[assetB.priceHistory.length - 1] >= 100 ? "+" : ""}
                  {(assetB.priceHistory[assetB.priceHistory.length - 1] - 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <PriceChart assetA={assetA} assetB={assetB} />

            <p className="text-[10px] text-muted mt-2 text-center">
              Base 100 al inicio del periodo. Datos simulados con fines educativos.
            </p>
          </BorderCard>
        </section>

        {/* ─── 3. KEY METRICS COMPARISON ─── */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-2">Metricas clave</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              {assetA.ticker}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-green" />
              {assetB.ticker}
            </div>
          </div>
          <MetricComparisonTable metrics={metrics} />
        </section>

        {/* ─── 4. CORRELATION ANALYSIS ─── */}
        <section>
          <CorrelationVisual tickerA={tickerA} tickerB={tickerB} corr={corr} />
        </section>

        {/* ─── 5. SECTOR/COMPOSITION BREAKDOWN ─── */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-4">Composición por sector</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BorderCard padding="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80">{assetA.ticker}</h3>
                <span className="text-xs text-muted">{assetA.name}</span>
              </div>
              <DonutChart data={assetA.sectors} label={assetA.ticker} />
            </BorderCard>
            <BorderCard padding="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green" />
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80">{assetB.ticker}</h3>
                <span className="text-xs text-muted">{assetB.name}</span>
              </div>
              <DonutChart data={assetB.sectors} label={assetB.ticker} />
            </BorderCard>
          </div>
        </section>

        {/* ─── 6. RECOMMENDATION ─── */}
        <section>
          <div className="bg-gradient-to-r from-accent/10 via-card to-green/10 border border-card-border rounded-xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.18 18L10 15.77L5.82 18L6 12.14L2 8.27L7.91 7.26L10 2Z" fill="#f5f5f7" opacity="0.8" />
                </svg>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-2">Recomendación de diversificación</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Si buscas mayor diversificación, considera combinar{" "}
                  <span className="text-accent-light font-medium">{tickerA}</span> con un activo de baja correlación
                  {suggestions.length > 0 && (
                    <>
                      {" "}como{" "}
                      <span className="text-green font-medium">
                        {suggestions[0].ticker}
                      </span>{" "}
                      (correlación {suggestions[0].corr.toFixed(2)})
                      {suggestions.length > 1 && (
                        <>
                          {" "}o{" "}
                          <span className="text-green font-medium">
                            {suggestions[1].ticker}
                          </span>{" "}
                          (correlación {suggestions[1].corr.toFixed(2)})
                        </>
                      )}
                    </>
                  )}
                  . Combinar activos con baja correlación reduce la volatilidad total del portfolio sin sacrificar rendimiento esperado.
                </p>

                {/* Quick correlation table for suggestions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {suggestions.map((s) => {
                    const { color } = correlationLabel(s.corr);
                    return (
                      <button
                        key={s.ticker}
                        onClick={() => setTickerB(s.ticker)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-card-border hover:border-accent/40 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs font-medium">{s.ticker}</span>
                        <span className="text-[10px] text-muted">corr. {s.corr.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-card-border py-6 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted">
          <span>FinPulse -- Aprende mientras inviertes</span>
          <span>En desarrollo</span>
        </div>
      </footer>
    </main>
  );
}
