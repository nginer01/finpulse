"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import AddPosition, { type UserPosition } from "@/components/AddPosition";
import PortfolioHeatmap from "@/components/PortfolioHeatmap";
import dynamic from "next/dynamic";

const TradingChart = dynamic(() => import("@/components/TradingChart"), { ssr: false });

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("finpulse_positions");
    if (saved) {
      try { setUserPositions(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (userPositions.length > 0) {
      localStorage.setItem("finpulse_positions", JSON.stringify(userPositions));
    }
  }, [userPositions]);

  const handleAddPositions = (newPositions: UserPosition[]) => {
    setUserPositions((prev) => [...prev, ...newPositions]);
  };

  const handleRemovePosition = (id: string) => {
    setUserPositions((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("finpulse_positions", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Nav />
      <AddPosition open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddPositions} />

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

            {/* TradingView chart */}
            <div className="px-3 sm:px-4 pb-4 pt-3">
              <TradingChart />
            </div>
          </div>
        </section>

        {/* ─── 2. POSITIONS ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Posiciones</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-light transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Anadir posicion
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions.map((p) => (
              <PositionCard key={p.ticker} {...p} />
            ))}

            {/* User-added positions */}
            {userPositions.map((p) => (
              <div key={p.id} className="bg-card border border-accent/20 rounded-xl p-5 hover:border-accent/40 transition-all duration-300 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-sm font-mono text-accent-light font-semibold">
                      {p.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.ticker}</p>
                      <p className="text-xs text-muted">{p.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold">{(p.quantity * p.buyPrice).toLocaleString("es-ES", { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted">{p.quantity} uds. a {p.buyPrice}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-light font-medium">{p.broker}</span>
                    {p.date && <span>{p.date}</span>}
                  </div>
                  <button
                    onClick={() => handleRemovePosition(p.id)}
                    className="text-muted hover:text-red transition-colors px-2"
                    title="Eliminar posicion"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HEATMAP ─── */}
        <section>
          <PortfolioHeatmap />
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
