"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */

const positions = [
  {
    ticker: "IWDA",
    name: "iShares MSCI World",
    value: "4.230,00",
    weekChange: 1.8,
    weight: 32.9,
    news: 2,
    sparkline: "0,30 12,28 24,32 36,25 48,27 60,22 72,24 84,18 96,20 108,15",
  },
  {
    ticker: "VUAA",
    name: "Vanguard S&P 500",
    value: "3.150,00",
    weekChange: 2.1,
    weight: 24.5,
    news: 3,
    sparkline: "0,32 12,30 24,28 36,26 48,24 60,20 72,22 84,16 96,14 108,10",
  },
  {
    ticker: "BRT",
    name: "Brent Crude Oil",
    value: "1.200,00",
    weekChange: -3.8,
    weight: 9.3,
    news: 2,
    sparkline: "0,12 12,14 24,18 36,16 48,20 60,24 72,22 84,28 96,30 108,34",
  },
  {
    ticker: "EUNA",
    name: "iShares Euro Gov Bond",
    value: "2.400,00",
    weekChange: 0.5,
    weight: 18.7,
    news: 1,
    sparkline: "0,26 12,25 24,26 36,24 48,25 60,23 72,24 84,22 96,23 108,21",
  },
  {
    ticker: "SEMI",
    name: "VanEck Semiconductor",
    value: "1.867,32",
    weekChange: 4.2,
    weight: 14.5,
    news: 4,
    sparkline: "0,38 12,35 24,30 36,28 48,22 60,18 72,20 84,14 96,10 108,6",
  },
];

const sectorData = [
  { label: "Tech", pct: 39, color: "#6366f1" },
  { label: "Index Global", pct: 33, color: "#818cf8" },
  { label: "Energia", pct: 9, color: "#ef4444" },
  { label: "Renta Fija", pct: 19, color: "#22c55e" },
];

const geoData = [
  { label: "Global", pct: 33, color: "#818cf8" },
  { label: "EEUU", pct: 39, color: "#6366f1" },
  { label: "Europa", pct: 19, color: "#22c55e" },
  { label: "Commodities", pct: 9, color: "#ef4444" },
];

const benchmarks = [
  { label: "Tu portfolio", value: 7.1, color: "#6366f1" },
  { label: "S&P 500", value: 12.3, color: "#818cf8" },
  { label: "MSCI World", value: 8.7, color: "#22c55e" },
];

const missedTrades = [
  {
    asset: "Bitcoin ETF (IBIT)",
    date: "enero",
    buyPrice: "42.000",
    currentPrice: "68.500",
    gain: "+63%",
    lesson:
      "El miedo a la volatilidad crypto te hizo dudar. Leccion: asignar un % pequeno (2-5%) a activos de alta conviccion reduce el arrepentimiento sin comprometer el portfolio.",
  },
  {
    asset: "Oro (GLD)",
    date: "marzo",
    buyPrice: "2.050",
    currentPrice: "2.340",
    gain: "+14%",
    lesson:
      "Priorizaste renta variable sobre refugio. Leccion: el oro actua como cobertura — incluso un 5% de exposicion habria reducido la volatilidad de tu portfolio un 8%.",
  },
];

const operations = [
  { date: "8 mayo", type: "Venta", ticker: "BRT", detail: "-50 units", price: "$76.20" },
  { date: "2 mayo", type: "Compra", ticker: "SEMI", detail: "+30 units", price: "$58.40" },
  { date: "25 abril", type: "Compra", ticker: "EUNA", detail: "+100 units", price: "$23.80" },
  { date: "15 abril", type: "Compra", ticker: "VUAA", detail: "+10 units", price: "$312.50" },
  { date: "1 abril", type: "Compra", ticker: "IWDA", detail: "+20 units", price: "$78.90" },
];

/* ──────────────────────────────────────────────
   SVG HELPERS
   ────────────────────────────────────────────── */

type ChartPoint = { x: number; y: number; date: string; value: number };
type ChartEvent = { x: number; date: string; label: string; impact: "positive" | "negative" | "neutral" };

const chartDataByRange: Record<string, { points: ChartPoint[]; events: ChartEvent[] }> = {
  "1S": {
    points: [
      { x: 0, y: 12520, date: "5 may", value: 12520 },
      { x: 100, y: 12480, date: "6 may", value: 12480 },
      { x: 200, y: 12610, date: "7 may", value: 12610 },
      { x: 300, y: 12580, date: "8 may", value: 12580 },
      { x: 400, y: 12720, date: "9 may", value: 12720 },
      { x: 500, y: 12790, date: "10 may", value: 12790 },
      { x: 600, y: 12847, date: "11 may", value: 12847 },
    ],
    events: [
      { x: 100, date: "6 may", label: "IPC EEUU en linea con expectativas", impact: "neutral" },
      { x: 200, date: "7 may", label: "Nvidia presenta Blackwell Ultra → SEMI +4.2%", impact: "positive" },
      { x: 300, date: "8 may", label: "Venta parcial BRT — negociaciones Iran avanzan", impact: "negative" },
      { x: 400, date: "9 may", label: "Acuerdo EEUU-China oficial → S&P maximos", impact: "positive" },
    ],
  },
  "1M": {
    points: [
      { x: 0, y: 11800, date: "11 abr", value: 11800 },
      { x: 60, y: 11950, date: "15 abr", value: 11950 },
      { x: 120, y: 12100, date: "19 abr", value: 12100 },
      { x: 180, y: 11980, date: "23 abr", value: 11980 },
      { x: 240, y: 12200, date: "27 abr", value: 12200 },
      { x: 300, y: 12350, date: "1 may", value: 12350 },
      { x: 360, y: 12280, date: "3 may", value: 12280 },
      { x: 420, y: 12520, date: "5 may", value: 12520 },
      { x: 480, y: 12610, date: "7 may", value: 12610 },
      { x: 540, y: 12720, date: "9 may", value: 12720 },
      { x: 600, y: 12847, date: "11 may", value: 12847 },
    ],
    events: [
      { x: 60, date: "15 abr", label: "Compra VUAA +10 units — FOMO rally", impact: "neutral" },
      { x: 180, date: "23 abr", label: "Caida tech por earnings mixtos", impact: "negative" },
      { x: 240, date: "27 abr", label: "Compra EUNA — tesis BCE dovish", impact: "positive" },
      { x: 360, date: "3 may", label: "Compra SEMI — ciclo semiconductores", impact: "positive" },
      { x: 480, date: "7 may", label: "Nvidia Blackwell Ultra → rally semis", impact: "positive" },
      { x: 540, date: "9 may", label: "Acuerdo EEUU-China → maximos", impact: "positive" },
    ],
  },
  "3M": {
    points: [
      { x: 0, y: 10800, date: "11 feb", value: 10800 },
      { x: 50, y: 11000, date: "21 feb", value: 11000 },
      { x: 100, y: 10700, date: "3 mar", value: 10700 },
      { x: 150, y: 10950, date: "13 mar", value: 10950 },
      { x: 200, y: 11200, date: "23 mar", value: 11200 },
      { x: 250, y: 11100, date: "2 abr", value: 11100 },
      { x: 300, y: 11400, date: "12 abr", value: 11400 },
      { x: 350, y: 11800, date: "22 abr", value: 11800 },
      { x: 400, y: 12100, date: "2 may", value: 12100 },
      { x: 500, y: 12520, date: "7 may", value: 12520 },
      { x: 600, y: 12847, date: "11 may", value: 12847 },
    ],
    events: [
      { x: 100, date: "3 mar", label: "Correccion tech — Nasdaq -3%", impact: "negative" },
      { x: 200, date: "23 mar", label: "BCE senala posible recorte junio", impact: "positive" },
      { x: 350, date: "22 abr", label: "Earnings MSFT/GOOGL superan expectativas", impact: "positive" },
      { x: 500, date: "7 may", label: "Nvidia Blackwell Ultra", impact: "positive" },
    ],
  },
  "6M": {
    points: [
      { x: 0, y: 10200, date: "11 nov", value: 10200 },
      { x: 40, y: 10400, date: "25 nov", value: 10400 },
      { x: 80, y: 10150, date: "9 dic", value: 10150 },
      { x: 120, y: 10600, date: "23 dic", value: 10600 },
      { x: 160, y: 10550, date: "6 ene", value: 10550 },
      { x: 200, y: 10900, date: "20 ene", value: 10900 },
      { x: 240, y: 11100, date: "3 feb", value: 11100 },
      { x: 280, y: 10800, date: "17 feb", value: 10800 },
      { x: 320, y: 11300, date: "3 mar", value: 11300 },
      { x: 360, y: 11500, date: "17 mar", value: 11500 },
      { x: 400, y: 11200, date: "31 mar", value: 11200 },
      { x: 440, y: 11700, date: "14 abr", value: 11700 },
      { x: 480, y: 11900, date: "28 abr", value: 11900 },
      { x: 520, y: 12300, date: "5 may", value: 12300 },
      { x: 560, y: 12600, date: "9 may", value: 12600 },
      { x: 600, y: 12847, date: "11 may", value: 12847 },
    ],
    events: [
      { x: 80, date: "9 dic", label: "Fed mantiene tipos — mercado decepciona", impact: "negative" },
      { x: 200, date: "20 ene", label: "Rally inicio de ano — flujos ETFs record", impact: "positive" },
      { x: 280, date: "17 feb", label: "Aranceles EEUU-China — caida generalizada", impact: "negative" },
      { x: 400, date: "31 mar", label: "Correccion Q1 — toma de beneficios", impact: "negative" },
      { x: 520, date: "5 may", label: "Rumores acuerdo EEUU-China", impact: "positive" },
      { x: 560, date: "9 may", label: "Acuerdo oficial + Nvidia Blackwell", impact: "positive" },
    ],
  },
  "1A": {
    points: [
      { x: 0, y: 8500, date: "may 2025", value: 8500 },
      { x: 50, y: 8800, date: "jun 2025", value: 8800 },
      { x: 100, y: 9200, date: "jul 2025", value: 9200 },
      { x: 150, y: 8900, date: "ago 2025", value: 8900 },
      { x: 200, y: 9400, date: "sep 2025", value: 9400 },
      { x: 250, y: 9700, date: "oct 2025", value: 9700 },
      { x: 300, y: 10000, date: "nov 2025", value: 10000 },
      { x: 350, y: 10200, date: "dic 2025", value: 10200 },
      { x: 400, y: 10600, date: "ene 2026", value: 10600 },
      { x: 450, y: 10900, date: "feb 2026", value: 10900 },
      { x: 500, y: 11400, date: "mar 2026", value: 11400 },
      { x: 550, y: 12100, date: "abr 2026", value: 12100 },
      { x: 600, y: 12847, date: "may 2026", value: 12847 },
    ],
    events: [
      { x: 150, date: "ago 2025", label: "Crisis bancaria regional EEUU", impact: "negative" },
      { x: 300, date: "nov 2025", label: "Fed primer recorte de tipos", impact: "positive" },
      { x: 400, date: "ene 2026", label: "Nuevos aranceles EEUU-China", impact: "negative" },
      { x: 550, date: "abr 2026", label: "Earnings season excepcional Q1", impact: "positive" },
    ],
  },
  "YTD": {
    points: [
      { x: 0, y: 10400, date: "1 ene", value: 10400 },
      { x: 50, y: 10600, date: "15 ene", value: 10600 },
      { x: 100, y: 10900, date: "1 feb", value: 10900 },
      { x: 150, y: 10700, date: "15 feb", value: 10700 },
      { x: 200, y: 11100, date: "1 mar", value: 11100 },
      { x: 250, y: 11400, date: "15 mar", value: 11400 },
      { x: 300, y: 11200, date: "1 abr", value: 11200 },
      { x: 350, y: 11500, date: "15 abr", value: 11500 },
      { x: 400, y: 11900, date: "1 may", value: 11900 },
      { x: 500, y: 12520, date: "7 may", value: 12520 },
      { x: 600, y: 12847, date: "11 may", value: 12847 },
    ],
    events: [
      { x: 50, date: "15 ene", label: "Aranceles EEUU-China anunciados", impact: "negative" },
      { x: 200, date: "1 mar", label: "BCE confirma tono dovish", impact: "positive" },
      { x: 300, date: "1 abr", label: "Correccion por toma de beneficios Q1", impact: "negative" },
      { x: 400, date: "1 may", label: "Compra SEMI antes de evento Nvidia", impact: "positive" },
      { x: 500, date: "7 may", label: "Nvidia Blackwell Ultra + acuerdo China", impact: "positive" },
    ],
  },
};

const timeRanges = ["1S", "1M", "3M", "6M", "1A", "YTD"] as const;

type ChartType = "line" | "candle";

function LineIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polyline points="2,14 6,8 10,11 14,4 17,6" stroke={active ? "#818cf8" : "#71717a"} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CandleIcon({ active }: { active: boolean }) {
  const c = active ? "#818cf8" : "#71717a";
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="4" y1="2" x2="4" y2="16" stroke={c} strokeWidth="1" />
      <rect x="2" y="5" width="4" height="6" fill={active ? "#22c55e" : c} rx="0.5" />
      <line x1="10" y1="2" x2="10" y2="16" stroke={c} strokeWidth="1" />
      <rect x="8" y="7" width="4" height="5" fill={active ? "#ef4444" : c} rx="0.5" />
      <line x1="16" y1="4" x2="16" y2="14" stroke={c} strokeWidth="1" />
      <rect x="14" y="6" width="4" height="4" fill={active ? "#22c55e" : c} rx="0.5" />
    </svg>
  );
}

function InteractiveChart() {
  const [range, setRange] = useState<string>("6M");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [activeEvent, setActiveEvent] = useState<ChartEvent | null>(null);
  const [chartType, setChartType] = useState<ChartType>("line");

  const data = chartDataByRange[range];
  const { points, events } = data;

  const minY = Math.min(...points.map((p) => p.y)) - 200;
  const maxY = Math.max(...points.map((p) => p.y)) + 200;
  const w = 600;
  const h = 220;

  const toSvgY = (val: number) => h - 20 - ((val - minY) / (maxY - minY)) * (h - 40);
  const toSvgX = (x: number) => x;

  const polylinePoints = points.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(" ");
  const polygonPoints = `0,${h} ${polylinePoints} ${w},${h}`;

  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;

  const eventColors = { positive: "#22c55e", negative: "#ef4444", neutral: "#71717a" };

  return (
    <div>
      <div
        className="relative"
        onMouseLeave={() => { setHoverIdx(null); setActiveEvent(null); }}
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-52 sm:h-64"
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * w;
            let closest = 0;
            let closestDist = Infinity;
            points.forEach((p, i) => {
              const dist = Math.abs(p.x - mouseX);
              if (dist < closestDist) { closestDist = dist; closest = i; }
            });
            setHoverIdx(closest);
            const nearEvent = events.find((ev) => Math.abs(ev.x - mouseX) < 25);
            setActiveEvent(nearEvent || null);
          }}
        >
          <defs>
            <linearGradient id="interactiveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line key={pct} x1="0" y1={h * pct} x2={w} y2={h * pct} stroke="#1e1e2e" strokeWidth="0.5" />
          ))}

          {/* Chart body */}
          {chartType === "line" ? (
            <>
              <polygon points={polygonPoints} fill="url(#interactiveGrad)" />
              <polyline points={polylinePoints} fill="none" stroke="#6366f1" strokeWidth="2" />
            </>
          ) : (
            /* Candlestick */
            points.map((p, i) => {
              if (i === 0) return null;
              const prev = points[i - 1];
              const isUp = p.y >= prev.y;
              const openY = toSvgY(prev.y);
              const closeY = toSvgY(p.y);
              const highY = Math.min(openY, closeY) - 8;
              const lowY = Math.max(openY, closeY) + 8;
              const candleW = Math.max(8, (w / points.length) * 0.5);
              const cx = toSvgX(p.x);
              return (
                <g key={i}>
                  {/* Wick */}
                  <line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={isUp ? "#22c55e" : "#ef4444"} strokeWidth="1" />
                  {/* Body */}
                  <rect
                    x={cx - candleW / 2}
                    y={Math.min(openY, closeY)}
                    width={candleW}
                    height={Math.max(Math.abs(closeY - openY), 2)}
                    fill={isUp ? "#22c55e" : "#ef4444"}
                    rx="1"
                  />
                </g>
              );
            })
          )}

          {/* Event markers */}
          {events.map((ev, i) => (
            <g key={i}>
              <line
                x1={ev.x} y1={20} x2={ev.x} y2={h}
                stroke={eventColors[ev.impact]} strokeWidth="1" strokeDasharray="4,4" opacity="0.5"
              />
              <circle
                cx={ev.x} cy={20} r="5"
                fill={eventColors[ev.impact]} opacity="0.9"
                className="cursor-pointer"
              />
            </g>
          ))}

          {/* Hover vertical line */}
          {hoverPoint && (
            <>
              <line
                x1={toSvgX(hoverPoint.x)} y1={0}
                x2={toSvgX(hoverPoint.x)} y2={h}
                stroke="#818cf8" strokeWidth="1" opacity="0.6"
              />
              <circle
                cx={toSvgX(hoverPoint.x)}
                cy={toSvgY(hoverPoint.y)}
                r="5" fill="#818cf8" stroke="#0a0a0f" strokeWidth="2"
              />
            </>
          )}

          {/* End dot */}
          <circle cx={w} cy={toSvgY(points[points.length - 1].y)} r="4" fill="#818cf8" />
        </svg>

        {/* Hover tooltip */}
        {hoverPoint && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-card border border-card-border rounded-lg px-4 py-2 pointer-events-none z-10 text-center shadow-lg"
          >
            <p className="text-xs text-muted">{hoverPoint.date}</p>
            <p className="text-lg font-bold">{hoverPoint.value.toLocaleString("es-ES")}</p>
          </div>
        )}

        {/* Event tooltip */}
        {activeEvent && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-card border border-card-border rounded-lg px-4 py-2.5 pointer-events-none z-10 max-w-sm text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColors[activeEvent.impact] }} />
              <p className="text-xs text-muted">{activeEvent.date}</p>
            </div>
            <p className="text-xs font-medium">{activeEvent.label}</p>
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mt-3">
        {/* Chart type */}
        <div className="flex items-center gap-1 bg-card border border-card-border rounded-lg p-0.5">
          <button
            onClick={() => setChartType("line")}
            className={`p-1.5 rounded-md transition-colors ${chartType === "line" ? "bg-accent/20" : "hover:bg-white/[0.03]"}`}
            title="Grafica de lineas"
          >
            <LineIcon active={chartType === "line"} />
          </button>
          <button
            onClick={() => setChartType("candle")}
            className={`p-1.5 rounded-md transition-colors ${chartType === "candle" ? "bg-accent/20" : "hover:bg-white/[0.03]"}`}
            title="Candlestick"
          >
            <CandleIcon active={chartType === "candle"} />
          </button>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => { setRange(r); setHoverIdx(null); setActiveEvent(null); }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                range === r
                  ? "bg-accent/20 text-accent-light font-medium"
                  : "text-muted hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ points, positive }: { points: string; positive: boolean }) {
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <svg viewBox="0 0 108 40" className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${positive ? "g" : "r"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,40 ${points} 108,40`}
        fill={`url(#spark-${positive ? "g" : "r"})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   COMPONENTS
   ────────────────────────────────────────────── */

function PositionCard({
  ticker, name, value, weekChange, weight, news, sparkline,
}: (typeof positions)[0]) {
  const positive = weekChange >= 0;
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-sm font-mono text-accent-light font-semibold">
            {ticker.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold">{ticker}</p>
            <p className="text-xs text-muted">{name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold">{value}</p>
          <p className={`text-xs font-medium ${positive ? "text-green" : "text-red"}`}>
            {positive ? "+" : ""}
            {weekChange}% sem
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline points={sparkline} positive={positive} />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-light font-medium">
            {weight}%
          </span>
          <span>del portfolio</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-card-border">
          {news} noticias vinculadas
        </span>
      </div>
    </div>
  );
}

function HorizontalBarChart({ data }: { data: { label: string; pct: number; color: string }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted">{d.label}</span>
            <span className="font-medium">{d.pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-card-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${d.pct}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BenchmarkBars() {
  const max = Math.max(...benchmarks.map((b) => b.value));
  return (
    <div className="space-y-4">
      {benchmarks.map((b) => (
        <div key={b.label}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className={b.label === "Tu portfolio" ? "font-semibold" : "text-muted"}>
              {b.label}
            </span>
            <span className="font-bold" style={{ color: b.color }}>
              +{b.value}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-card-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(b.value / max) * 100}%`,
                backgroundColor: b.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MissedTradeCard({
  asset, date, buyPrice, currentPrice, gain, lesson,
}: (typeof missedTrades)[0]) {
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden hover:border-red/30 transition-all duration-300">
      <div className="p-5">
        <p className="text-xs text-muted mb-1">No compraste en {date}</p>
        <p className="font-semibold mb-3">{asset}</p>

        {/* Price comparison */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-background rounded-lg p-3 border border-card-border text-center">
            <p className="text-xs text-muted mb-0.5">Precio entonces</p>
            <p className="text-sm font-bold text-red">${buyPrice}</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-muted shrink-0">
            <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex-1 bg-background rounded-lg p-3 border border-card-border text-center">
            <p className="text-xs text-muted mb-0.5">Precio hoy</p>
            <p className="text-sm font-bold text-green">${currentPrice}</p>
          </div>
        </div>

        {/* Gain badge */}
        <div className="bg-green/10 border border-green/20 rounded-lg px-4 py-2.5 text-center mb-4">
          <p className="text-green font-bold text-lg">Habrias ganado {gain}</p>
        </div>

        {/* Lesson */}
        <div className="bg-background rounded-lg p-3 border border-card-border">
          <p className="text-xs text-accent-light font-medium mb-1">Leccion aprendida</p>
          <p className="text-xs text-muted leading-relaxed">{lesson}</p>
        </div>
      </div>
    </div>
  );
}

function OperationRow({ date, type, ticker, detail, price }: (typeof operations)[0]) {
  const isSell = type === "Venta";
  return (
    <div className="flex items-center gap-4 py-3 border-b border-card-border last:border-0">
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 ${
          isSell ? "bg-red/10 text-red" : "bg-green/10 text-green"
        }`}
      >
        {isSell ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isSell ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
            {type}
          </span>
          <span className="text-sm font-semibold">{ticker}</span>
          <span className="text-xs text-muted">{detail}</span>
        </div>
        <p className="text-xs text-muted mt-0.5">{date} 2026</p>
      </div>
      {/* Price */}
      <span className="text-sm font-medium shrink-0">{price}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"sector" | "geo">("sector");

  return (
    <main className="min-h-screen">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ─── 1. PORTFOLIO OVERVIEW ─── */}
        <section>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            {/* Hero image */}
            <div className="relative h-40 sm:h-52 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=250&fit=crop"
                alt="Portfolio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Valor total del portfolio</p>
                <div className="flex items-end gap-4 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">12.847,32</h1>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-green text-sm font-semibold bg-green/10 px-2.5 py-1 rounded-lg">
                      +847,32 (+7.1% YTD)
                    </span>
                    <span className="text-green text-xs bg-green/10 px-2 py-0.5 rounded-lg">
                      +2.4% esta semana
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive chart */}
            <div className="px-5 sm:px-6 pb-5 pt-3">
              <InteractiveChart />
            </div>
          </div>
        </section>

        {/* ─── 2. POSITIONS ─── */}
        <section>
          <h2 className="text-lg font-bold mb-4">Posiciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions.map((p) => (
              <PositionCard key={p.ticker} {...p} />
            ))}
          </div>
        </section>

        {/* ─── 3. DISTRIBUTION CHARTS ─── */}
        <section>
          <h2 className="text-lg font-bold mb-4">Distribucion del portfolio</h2>

          {/* Tabs on small screens, side by side on md+ */}
          <div className="md:hidden flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("sector")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "sector"
                  ? "bg-accent/15 text-accent-light"
                  : "bg-card-border text-muted"
              }`}
            >
              Por sector
            </button>
            <button
              onClick={() => setActiveTab("geo")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "geo"
                  ? "bg-accent/15 text-accent-light"
                  : "bg-card-border text-muted"
              }`}
            >
              Por geografia
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`bg-card border border-card-border rounded-xl p-5 ${activeTab !== "sector" ? "hidden md:block" : ""}`}>
              <h3 className="text-sm font-semibold mb-4 text-muted">Por sector</h3>
              <HorizontalBarChart data={sectorData} />
            </div>
            <div className={`bg-card border border-card-border rounded-xl p-5 ${activeTab !== "geo" ? "hidden md:block" : ""}`}>
              <h3 className="text-sm font-semibold mb-4 text-muted">Por geografia</h3>
              <HorizontalBarChart data={geoData} />
            </div>
          </div>
        </section>

        {/* ─── 4. RENDIMIENTO VS BENCHMARKS ─── */}
        <section>
          <h2 className="text-lg font-bold mb-4">Rendimiento vs Benchmarks (YTD)</h2>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=200&fit=crop"
                alt="Benchmarks"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/40" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs text-muted mb-1">Comparativa anual</p>
                <p className="text-sm text-muted">
                  Tu portfolio rinde un{" "}
                  <span className="text-accent-light font-medium">5.2% menos</span> que el S&P 500 pero esta{" "}
                  <span className="text-green font-medium">cerca del MSCI World</span>.
                </p>
              </div>
            </div>
            <div className="p-5">
              <BenchmarkBars />
            </div>
          </div>
        </section>

        {/* ─── 5. EL CAMINO NO TOMADO ─── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold">El camino no tomado</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
              Inversiones no realizadas
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missedTrades.map((mt) => (
              <MissedTradeCard key={mt.asset} {...mt} />
            ))}
          </div>
        </section>

        {/* ─── 6. HISTORIAL DE OPERACIONES ─── */}
        <section>
          <h2 className="text-lg font-bold mb-4">Historial de operaciones</h2>
          <div className="bg-card border border-card-border rounded-xl p-5">
            {operations.map((op, i) => (
              <OperationRow key={i} {...op} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-card-border py-6 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted">
          <span>FinPulse — Aprende mientras inviertes</span>
          <span>En desarrollo</span>
        </div>
      </footer>
    </main>
  );
}
