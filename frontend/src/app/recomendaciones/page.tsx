"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import BorderCard from "@/components/BorderCard";
import Tooltip from "@/components/Tooltip";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

type Recommendation = {
  id: string;
  ticker: string;
  name: string;
  action: "Comprar" | "Vender" | "Mantener" | "Vigilar";
  conviction: number;
  risk: number;
  expectedReturn: { min: number; max: number };
  timeframe: string;
  thesis: string;
  sources: { name: string; type: string }[];
  proArgs: string[];
  contraArgs: string[];
  date: string;
  status: "active" | "followed" | "ignored";
  category: "portfolio" | "opportunity" | "defensive";
};

type FictionInvestment = {
  id: string;
  ticker: string;
  name: string;
  entryPrice: number;
  currentPrice: number;
  date: string;
  amount: number;
};

/* ──────────────────────────────────────────────
   MOCK DATA
   ────────────────────────────────────────────── */

const recommendations: Recommendation[] = [
  {
    id: "r1",
    ticker: "BRT",
    name: "Brent Crude Oil",
    action: "Vender",
    conviction: 8,
    risk: 7,
    expectedReturn: { min: -15, max: -5 },
    timeframe: "1-3 meses",
    thesis: "Las negociaciones Iran-EEUU avanzan más rápido de lo esperado. Si Iran vuelve al mercado con plena capacidad, el Brent podría caer hasta $68. El paralelo histórico de 2015 (JCPOA) muestra una caída del 30% en 6 meses. Arabia Saudi aún no ha reaccionado — la reunión OPEC+ del 1 de junio será decisiva.",
    sources: [
      { name: "Reuters", type: "news" },
      { name: "Polymarket (58%)", type: "polymarket" },
      { name: "UBS On-Air", type: "podcast" },
    ],
    proArgs: [
      "Paralelo histórico 2015: Brent cayó 30%",
      "Iran puede añadir 1.5M bbl/día",
      "Polymarket: 58% probabilidad de acuerdo",
      "Dólar fuerte presiona commodities",
    ],
    contraArgs: [
      "OPEC+ tiene más disciplina que en 2015",
      "Demanda global es mayor",
      "Arabia Saudi podría recortar producción",
      "El acuerdo puede retrasarse meses",
    ],
    date: "11 mayo 2026",
    status: "active",
    category: "portfolio",
  },
  {
    id: "r2",
    ticker: "SEMI",
    name: "VanEck Semiconductor ETF",
    action: "Comprar",
    conviction: 7,
    risk: 5,
    expectedReturn: { min: 8, max: 20 },
    timeframe: "6-12 meses",
    thesis: "El ciclo expansivo de semiconductores se confirma con Nvidia Blackwell Ultra. TSMC aumenta capex un 15%. La demanda de IA es insaciable y los hyperscalers confirman pedidos masivos. Sin embargo, el sector ya sube +25% YTD — esperar una caída del 2-3% para mejorar el punto de entrada.",
    sources: [
      { name: "Bloomberg", type: "news" },
      { name: "@sentimentrader", type: "x" },
      { name: "Financial Times", type: "news" },
    ],
    proArgs: [
      "Ciclo expansivo confirmado 12-18 meses",
      "Nvidia Blackwell Ultra: demanda récord",
      "TSMC capex +15%",
      "IA como megatendencia estructural",
    ],
    contraArgs: [
      "Sector +25% YTD, valoraciones estiradas (P/E 32x)",
      "Aranceles tech EEUU-China sin resolver",
      "VIX bajo sugiere posible corrección",
    ],
    date: "11 mayo 2026",
    status: "active",
    category: "portfolio",
  },
  {
    id: "r3",
    ticker: "COPX",
    name: "Global X Copper Miners ETF",
    action: "Comprar",
    conviction: 7,
    risk: 6,
    expectedReturn: { min: 15, max: 40 },
    timeframe: "12-24 meses",
    thesis: "BBVA Research y Bloomberg alertan: la demanda de cobre para vehículos eléctricos y renovables superará la oferta en 2027-2028. Chile y Perú no pueden escalar producción. El precio podría duplicarse en 3 años. Es una oportunidad temprana — aún no es mainstream.",
    sources: [
      { name: "Informe BBVA", type: "bank" },
      { name: "Bloomberg", type: "news" },
      { name: "Financial Times", type: "news" },
      { name: "Polymarket", type: "polymarket" },
    ],
    proArgs: [
      "Déficit de oferta estructural desde 2027",
      "Demanda EV + renovables crece exponencialmente",
      "Chile y Perú no pueden aumentar producción",
      "Aún no es mainstream — oportunidad temprana",
    ],
    contraArgs: [
      "Reciclaje de cobre puede amortiguar el déficit",
      "Nuevas minas en desarrollo (Congo, Indonesia)",
      "Desaceleración económica global reduciría demanda",
    ],
    date: "9 mayo 2026",
    status: "active",
    category: "opportunity",
  },
  {
    id: "r4",
    ticker: "URNM",
    name: "Sprott Uranium Miners ETF",
    action: "Vigilar",
    conviction: 5,
    risk: 8,
    expectedReturn: { min: 20, max: 60 },
    timeframe: "12-36 meses",
    thesis: "El renacimiento nuclear por la demanda energética de centros de datos de IA. Microsoft, Google y Amazon firman acuerdos con plantas nucleares. ETFs de uranio suben +18% YTD. Tendencia incipiente con alto potencial pero también alta volatilidad.",
    sources: [
      { name: "Bloomberg", type: "news" },
      { name: "Matt Levine", type: "newsletter" },
    ],
    proArgs: [
      "Hyperscalers necesitan energía limpia y estable",
      "Microsoft firmó acuerdo con Three Mile Island",
      "Uranio +18% YTD, tendencia acelerando",
      "Regulación favorable en EEUU y Europa",
    ],
    contraArgs: [
      "Alta volatilidad histórica en uranio",
      "Riesgo regulatorio y de percepción pública",
      "Nuevas plantas tardan 10+ años en construirse",
      "Alternativas renovables más baratas a corto plazo",
    ],
    date: "8 mayo 2026",
    status: "active",
    category: "opportunity",
  },
  {
    id: "r5",
    ticker: "EUNA",
    name: "iShares Euro Gov Bond",
    action: "Mantener",
    conviction: 6,
    risk: 2,
    expectedReturn: { min: 2, max: 5 },
    timeframe: "3-6 meses",
    thesis: "El BCE está en modo dovish. Polymarket da un 73% a recorte en junio. Los bonos europeos se benefician directamente. Posición defensiva que está funcionando bien. Considerar aumentar si tienes cash disponible antes de la reunión del 5 de junio.",
    sources: [
      { name: "UBS On-Air", type: "podcast" },
      { name: "Polymarket (73%)", type: "polymarket" },
      { name: "Financial Times", type: "news" },
    ],
    proArgs: [
      "BCE dovish — 73% probabilidad de recorte",
      "Inflación europea contenida",
      "Baja volatilidad, posición defensiva",
    ],
    contraArgs: [
      "Rendimiento limitado (+2-5%)",
      "Si inflación rebota en Q4, bonos sufren",
      "Oportunidad de coste frente a renta variable",
    ],
    date: "11 mayo 2026",
    status: "active",
    category: "defensive",
  },
];

const fictionInvestments: FictionInvestment[] = [
  { id: "f1", ticker: "IBIT", name: "Bitcoin ETF", entryPrice: 42000, currentPrice: 68500, date: "15 enero 2026", amount: 500 },
  { id: "f2", ticker: "GLD", name: "SPDR Gold Trust", entryPrice: 2050, currentPrice: 2340, date: "1 marzo 2026", amount: 300 },
];

/* ──────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────── */

const actionColors: Record<string, string> = {
  Comprar: "bg-[#30d158]/15 text-[#30d158]",
  Vender: "bg-[#ff453a]/15 text-[#ff453a]",
  Mantener: "bg-white/5 text-[#f5f5f7]",
  Vigilar: "bg-[#ffd60a]/15 text-[#ffd60a]",
};

const categoryLabels: Record<string, { label: string; color: string }> = {
  portfolio: { label: "Tu portfolio", color: "bg-white/5 text-[#86868b]" },
  opportunity: { label: "Oportunidad", color: "bg-[#30d158]/10 text-[#30d158]" },
  defensive: { label: "Defensiva", color: "bg-[#ffd60a]/10 text-[#ffd60a]" },
};

function RiskGauge({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  const color = value <= 3 ? "#30d158" : value <= 6 ? "#ffd60a" : "#ff453a";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#2d2d2d] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{value}/10</span>
    </div>
  );
}

function SourceBadge({ name, type }: { name: string; type: string }) {
  const colors: Record<string, string> = {
    newsletter: "bg-blue-500/15 text-blue-400",
    podcast: "bg-purple-500/15 text-purple-400",
    polymarket: "bg-emerald-500/15 text-emerald-400",
    x: "bg-zinc-500/15 text-zinc-400",
    bank: "bg-amber-500/15 text-[#ffd60a]",
    news: "bg-rose-500/15 text-rose-400",
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full ${colors[type] || "bg-white/5 text-[#86868b]"}`}>{name}</span>
  );
}

function ConvictionDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? "bg-[#f5f5f7]" : "bg-[#2d2d2d]"}`} />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   COMPONENTS
   ────────────────────────────────────────────── */

function RecommendationCard({ r, onFiction }: { r: Recommendation; onFiction: (r: Recommendation) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cat = categoryLabels[r.category];

  return (
    <BorderCard padding="p-0" className="cursor-pointer">
      <div onClick={() => setExpanded(!expanded)}>
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${actionColors[r.action]}`}>
                {r.action}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
            </div>
            <span className="text-xs text-[#48484a]">{r.date}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[15px] mb-0.5">{r.ticker}</h3>
              <p className="text-xs text-[#86868b]">{r.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-lg font-semibold ${r.expectedReturn.min >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                {r.expectedReturn.min >= 0 ? "+" : ""}{r.expectedReturn.min}% a {r.expectedReturn.max >= 0 ? "+" : ""}{r.expectedReturn.max}%
              </p>
              <p className="text-[11px] text-[#48484a]">{r.timeframe}</p>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Tooltip text="Nivel de seguridad en la recomendación basado en número de fuentes, datos de Polymarket y paralelos históricos.">
                <p className="text-[11px] text-[#48484a] mb-1 border-b border-dashed border-[#48484a]/30">Convicción</p>
              </Tooltip>
              <ConvictionDots value={r.conviction} />
            </div>
            <div>
              <Tooltip text="Volatilidad y probabilidad de pérdida. 0 = sin riesgo, 10 = riesgo extremo. Basado en el tipo de activo, condiciones del mercado y horizonte temporal.">
                <p className="text-[11px] text-[#48484a] mb-1 border-b border-dashed border-[#48484a]/30">Riesgo</p>
              </Tooltip>
              <RiskGauge value={r.risk} />
            </div>
          </div>
        </div>

        {/* Thesis preview */}
        <div className="px-5 pb-4">
          <p className="text-xs text-[#86868b] leading-relaxed line-clamp-2">{r.thesis}</p>
        </div>

        {expanded && (
          <div className="animate-fade-in-up border-t border-white/[0.04]">
            {/* Full thesis */}
            <div className="px-5 pt-4 pb-3">
              <p className="text-xs text-[#86868b] leading-6">{r.thesis}</p>
            </div>

            {/* Sources */}
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {r.sources.map((s) => <SourceBadge key={s.name} name={s.name} type={s.type} />)}
            </div>

            {/* Pro / Contra */}
            <div className="grid grid-cols-2 gap-0 border-t border-white/[0.04]">
              <div className="p-4 border-r border-white/[0.04]">
                <p className="text-[11px] text-[#30d158] font-medium mb-2">A favor</p>
                {r.proArgs.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1.5">
                    <span className="text-[#30d158] text-[10px] mt-0.5">+</span>
                    <p className="text-[11px] text-[#86868b] leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <p className="text-[11px] text-[#ff453a] font-medium mb-2">En contra</p>
                {r.contraArgs.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1.5">
                    <span className="text-[#ff453a] text-[10px] mt-0.5">-</span>
                    <p className="text-[11px] text-[#86868b] leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 border-t border-white/[0.04]">
              <button
                onClick={(e) => { e.stopPropagation(); onFiction(r); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] transition-colors border border-white/[0.08]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#86868b" strokeWidth="1" strokeDasharray="3 2" />
                  <path d="M5 7l2 2 3-4" stroke="#86868b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Invertir en ficción
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-medium bg-[#30d158]/15 text-[#30d158] hover:bg-[#30d158]/25 transition-colors">
                Seguir recomendación
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-medium text-[#48484a] hover:text-[#86868b] transition-colors">
                Ignorar
              </button>
            </div>
          </div>
        )}
      </div>
    </BorderCard>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */

export default function RecomendacionesPage() {
  const [filter, setFilter] = useState<"all" | "portfolio" | "opportunity" | "defensive">("all");
  const [fictions, setFictions] = useState<FictionInvestment[]>(fictionInvestments);
  const [showFictionModal, setShowFictionModal] = useState(false);
  const [fictionTarget, setFictionTarget] = useState<Recommendation | null>(null);
  const [fictionAmount, setFictionAmount] = useState("500");

  const filtered = filter === "all" ? recommendations : recommendations.filter((r) => r.category === filter);

  const handleAddFiction = (r: Recommendation) => {
    setFictionTarget(r);
    setShowFictionModal(true);
  };

  const confirmFiction = () => {
    if (!fictionTarget) return;
    setFictions((prev) => [
      ...prev,
      {
        id: `f${Date.now()}`,
        ticker: fictionTarget.ticker,
        name: fictionTarget.name,
        entryPrice: 100,
        currentPrice: 100,
        date: "12 mayo 2026",
        amount: parseFloat(fictionAmount) || 500,
      },
    ]);
    setShowFictionModal(false);
    setFictionTarget(null);
    setFictionAmount("500");
  };

  const totalFictionValue = fictions.reduce((s, f) => s + f.amount * (f.currentPrice / f.entryPrice), 0);
  const totalFictionInvested = fictions.reduce((s, f) => s + f.amount, 0);
  const fictionPnL = totalFictionValue - totalFictionInvested;

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Nav />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" stroke="#f5f5f7" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extralight tracking-wide">Recomendaciones</h1>
              <p className="text-sm text-[#86868b]">Tu director de inversiones personal — análisis, convicción, y contraargumentos</p>
            </div>
          </div>

          {/* Track record */}
          <BorderCard padding="p-4" className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[11px] text-[#48484a] uppercase tracking-wider">Acierto total</p>
                  <p className="text-xl font-semibold text-[#30d158]">78%</p>
                </div>
                <div className="w-[1px] h-8 bg-white/[0.06]" />
                <div>
                  <p className="text-[11px] text-[#48484a] uppercase tracking-wider">Recomendaciones</p>
                  <p className="text-xl font-semibold">18</p>
                </div>
                <div className="w-[1px] h-8 bg-white/[0.06]" />
                <div>
                  <p className="text-[11px] text-[#48484a] uppercase tracking-wider">Acertadas</p>
                  <p className="text-xl font-semibold">14</p>
                </div>
                <div className="w-[1px] h-8 bg-white/[0.06]" />
                <div>
                  <p className="text-[11px] text-[#48484a] uppercase tracking-wider">Activas ahora</p>
                  <p className="text-xl font-semibold">{recommendations.length}</p>
                </div>
              </div>
              <p className="text-xs text-[#48484a]">Historial desde enero 2026</p>
            </div>
          </BorderCard>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {([["all", "Todas"], ["portfolio", "Tu portfolio"], ["opportunity", "Oportunidades"], ["defensive", "Defensivas"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-white text-black"
                  : "bg-white/[0.04] text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.06]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Recommendations list */}
        <div className="space-y-4 mb-16">
          {filtered.map((r) => (
            <RecommendationCard key={r.id} r={r} onFiction={handleAddFiction} />
          ))}
        </div>

        {/* Fiction investments section */}
        <div className="border-t border-white/[0.04] pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-1">Inversiones en ficción</h2>
              <p className="text-xs text-[#86868b]">Seguimiento de inversiones simuladas — sin dinero real</p>
            </div>
            <BorderCard padding="p-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-[#48484a] uppercase tracking-wider">Invertido</p>
                  <p className="text-sm font-semibold">{totalFictionInvested.toLocaleString("es-ES")} €</p>
                </div>
                <div className="w-[1px] h-6 bg-white/[0.06]" />
                <div>
                  <p className="text-[10px] text-[#48484a] uppercase tracking-wider">P&L</p>
                  <p className={`text-sm font-semibold ${fictionPnL >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                    {fictionPnL >= 0 ? "+" : ""}{fictionPnL.toFixed(2)} €
                  </p>
                </div>
              </div>
            </BorderCard>
          </div>

          <div className="space-y-3">
            {fictions.map((f) => {
              const pnl = ((f.currentPrice - f.entryPrice) / f.entryPrice) * 100;
              const profit = f.amount * (f.currentPrice / f.entryPrice) - f.amount;
              return (
                <BorderCard key={f.id} padding="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center border border-dashed border-white/[0.15]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="#86868b" strokeWidth="1" strokeDasharray="2 1.5" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{f.ticker}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#48484a] border border-dashed border-white/[0.1]">ficción</span>
                        </div>
                        <p className="text-xs text-[#48484a]">{f.name} — desde {f.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${pnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(1)}%
                      </p>
                      <p className="text-xs text-[#48484a]">
                        {profit >= 0 ? "+" : ""}{profit.toFixed(2)} € de {f.amount} €
                      </p>
                    </div>
                  </div>
                </BorderCard>
              );
            })}
          </div>

          {fictions.length === 0 && (
            <div className="text-center py-12 text-[#48484a]">
              <p className="text-sm">No tienes inversiones en ficción</p>
              <p className="text-xs mt-1">Pulsa &ldquo;Invertir en ficción&rdquo; en cualquier recomendación</p>
            </div>
          )}
        </div>
      </div>

      {/* Fiction modal */}
      {showFictionModal && fictionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFictionModal(false)} />
          <div className="relative bg-[#1d1d1f] border border-white/[0.08] rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-1">Invertir en ficción</h3>
            <p className="text-xs text-[#86868b] mb-5">Simula una inversión sin dinero real. Podrás seguir su evolución.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium">{fictionTarget.ticker}</p>
                  <p className="text-xs text-[#48484a]">{fictionTarget.name}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${actionColors[fictionTarget.action]}`}>
                  {fictionTarget.action}
                </span>
              </div>

              <div>
                <label className="text-xs text-[#86868b] block mb-1.5">Cantidad simulada (€)</label>
                <input
                  type="number"
                  value={fictionAmount}
                  onChange={(e) => setFictionAmount(e.target.value)}
                  className="w-full bg-black border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/[0.2] transition-colors"
                  placeholder="500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFictionModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmFiction}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-white text-black hover:bg-white/90 transition-colors"
                >
                  Añadir a ficción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
