"use client";

import { useCallback, useEffect, useState } from "react";
import BorderCard from "@/components/BorderCard";
import Tooltip from "@/components/Tooltip";
import ImageCarousel from "@/components/ImageCarousel";
import { SourceChip } from "@/components/article/SourceLink";
import {
  loadPaths,
  decidePath,
  setPathFiction,
  undoPath,
  pathVerdict,
  type PathDecision,
} from "@/lib/paths";

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

function RecommendationCard({
  r,
  decidedPath,
  onFiction,
  onDecide,
  onUndo,
}: {
  r: Recommendation;
  decidedPath: PathDecision | null;
  onFiction: (r: Recommendation) => void;
  onDecide: (r: Recommendation, decision: "followed" | "ignored") => Promise<void>;
  onUndo: (path: PathDecision) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const decision = decidedPath?.status ?? null;
  const cat = categoryLabels[r.category];

  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

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

            {/* Sources — clickeables, abren modal con snippet + link original */}
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {r.sources.map((s) => <SourceChip key={s.name} name={s.name} />)}
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
              {decision === null ? (
                <>
                  <button
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); act(() => onDecide(r, "followed")); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[#30d158]/15 text-[#30d158] hover:bg-[#30d158]/25 transition-colors disabled:opacity-50"
                  >
                    {busy ? "Registrando…" : "Seguir recomendación"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); act(() => onDecide(r, "ignored")); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#48484a] hover:text-[#86868b] transition-colors disabled:opacity-50"
                  >
                    Ignorar
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-xl text-xs font-semibold ${decision === "followed" ? "bg-[#30d158]/15 text-[#30d158]" : "bg-white/[0.04] text-[#86868b]"}`}>
                    {decision === "followed" ? "✓ Siguiendo esta recomendación" : "Recomendación ignorada"}
                    {decidedPath?.price_at_decision ? (
                      <span className="text-[#48484a] font-normal"> · registrada a {decidedPath.price_at_decision.toFixed(2)}</span>
                    ) : null}
                  </span>
                  <button
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); if (decidedPath) act(() => onUndo(decidedPath)); }}
                    className="text-xs text-[#48484a] hover:text-[#86868b] transition-colors underline underline-offset-4 disabled:opacity-50"
                  >
                    Deshacer
                  </button>
                </div>
              )}
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
  const [paths, setPaths] = useState<PathDecision[]>([]);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFictionModal, setShowFictionModal] = useState(false);
  const [fictionTarget, setFictionTarget] = useState<Recommendation | null>(null);
  const [fictionAmount, setFictionAmount] = useState("500");

  const filtered = filter === "all" ? recommendations : recommendations.filter((r) => r.category === filter);

  const refresh = useCallback(async () => {
    const data = await loadPaths();
    setPaths(data.paths);
    setDemo(data.demo);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Decisión registrada para una recomendación de la lista (match ticker+acción). */
  const pathFor = (r: Recommendation): PathDecision | null =>
    paths.find((p) => p.ticker === r.ticker && p.action === r.action) ?? null;

  const handleDecide = async (r: Recommendation, decision: "followed" | "ignored") => {
    const { path, demo: isDemo } = await decidePath({
      ticker: r.ticker,
      name: r.name,
      action: r.action,
      conviction: r.conviction,
      reasoning: r.thesis,
      decision,
    });
    setNotice(
      path.price_at_decision
        ? `Decisión registrada con ${r.ticker} a ${path.price_at_decision.toFixed(2)} — el camino no tomado la evaluará con precios reales.`
        : `Decisión registrada${isDemo ? " en local (modo demo)" : ""} — se evaluará cuando haya precios.`
    );
    await refresh();
  };

  const handleUndo = async (path: PathDecision) => {
    await undoPath(path.id);
    await refresh();
  };

  const handleAddFiction = (r: Recommendation) => {
    setFictionTarget(r);
    setShowFictionModal(true);
  };

  const confirmFiction = async () => {
    if (!fictionTarget) return;
    const amount = parseFloat(fictionAmount) || 500;
    const existing = pathFor(fictionTarget);
    if (existing) {
      await setPathFiction(existing.id, amount);
    } else {
      // Simular sin hacerlo en real = camino no tomado con dinero de ficción
      await decidePath({
        ticker: fictionTarget.ticker,
        name: fictionTarget.name,
        action: fictionTarget.action,
        conviction: fictionTarget.conviction,
        reasoning: fictionTarget.thesis,
        decision: "ignored",
        fiction_amount: amount,
      });
    }
    setShowFictionModal(false);
    setFictionTarget(null);
    setFictionAmount("500");
    setNotice(`${amount} € en ficción sobre ${fictionTarget.ticker} — su evolución usa precios reales.`);
    await refresh();
  };

  const fictionPaths = paths.filter((p) => p.fiction_amount);
  const totalFictionInvested = fictionPaths.reduce((s, p) => s + (p.fiction_amount || 0), 0);
  const totalFictionValue = fictionPaths.reduce((s, p) => s + (p.fiction_value ?? p.fiction_amount ?? 0), 0);
  const fictionPnL = totalFictionValue - totalFictionInvested;

  // El coste de la inacción: 1.000 € hipotéticos por cada recomendación ignorada
  const HYPOTHETICAL = 1000;
  const evaluated = paths.filter((p) => p.status === "ignored" && p.effect_pct !== null);
  const costOfInaction = evaluated
    .filter((p) => (p.effect_pct || 0) > 0)
    .reduce((s, p) => s + (HYPOTHETICAL * (p.effect_pct || 0)) / 100, 0);
  const savedByIgnoring = evaluated
    .filter((p) => (p.effect_pct || 0) < 0)
    .reduce((s, p) => s + (HYPOTHETICAL * Math.abs(p.effect_pct || 0)) / 100, 0);

  return (
    <main className="min-h-screen overflow-x-hidden">

      {/* ─── HERO CAROUSEL ─── */}
      <ImageCarousel
        images={[
          { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=500&fit=crop&q=90", alt: "Estrategia de inversión" },
          { src: "https://images.unsplash.com/photo-1462206092226-f46025ffe607?w=1600&h=500&fit=crop&q=90", alt: "Ciudad al amanecer" },
          { src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&h=500&fit=crop&q=90", alt: "Análisis financiero" },
        ]}
        heightClass="h-[240px] sm:h-[320px]"
      >
        <div className="h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/60 font-semibold mb-4">IA con criterio</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight text-white tracking-tight">Recomendaciones</h1>
          <p className="text-[13px] text-white/50 mt-4 tracking-wide">Tu director de inversiones personal — análisis, convicción y contraargumentos</p>
        </div>
      </ImageCarousel>

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">

        {/* Header */}
        <div className="mb-10">

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

        {/* Aviso */}
        {notice && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3">
            <p className="text-xs text-[#c8c8cd]">{notice}</p>
            <button onClick={() => setNotice(null)} className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#48484a] hover:text-[#86868b] shrink-0">
              Cerrar
            </button>
          </div>
        )}

        {/* Recommendations list */}
        <div className="space-y-4 mb-16">
          {filtered.map((r) => (
            <RecommendationCard
              key={r.id}
              r={r}
              decidedPath={pathFor(r)}
              onFiction={handleAddFiction}
              onDecide={handleDecide}
              onUndo={handleUndo}
            />
          ))}
        </div>

        {/* El camino no tomado */}
        <div className="border-t border-white/[0.04] pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-1">El camino no tomado</h2>
              <p className="text-xs text-[#86868b]">
                Cada Seguir/Ignorar queda registrado con el precio real del momento. Esto es lo que habría pasado.
                {demo && <span className="text-[#ffd60a]"> · Modo demo</span>}
              </p>
            </div>
            {(costOfInaction > 0 || savedByIgnoring > 0) && (
              <BorderCard padding="p-3">
                <div className="flex items-center gap-4">
                  <div>
                    <Tooltip text="Con 1.000 € hipotéticos por cada recomendación ignorada que luego funcionó.">
                      <p className="text-[10px] text-[#48484a] uppercase tracking-wider border-b border-dashed border-[#48484a]/30">Coste de la inacción</p>
                    </Tooltip>
                    <p className="text-sm font-semibold text-[#ff453a]">−{costOfInaction.toFixed(0)} €</p>
                  </div>
                  <div className="w-[1px] h-6 bg-white/[0.06]" />
                  <div>
                    <Tooltip text="Con 1.000 € hipotéticos por cada recomendación ignorada que habría salido mal.">
                      <p className="text-[10px] text-[#48484a] uppercase tracking-wider border-b border-dashed border-[#48484a]/30">Ahorrado al ignorar</p>
                    </Tooltip>
                    <p className="text-sm font-semibold text-[#30d158]">+{savedByIgnoring.toFixed(0)} €</p>
                  </div>
                </div>
              </BorderCard>
            )}
          </div>

          <div className="space-y-3 mt-6">
            {paths.map((p) => {
              const verdict = pathVerdict(p);
              const isBuy = !p.action.toLowerCase().startsWith("vender") && !p.action.toLowerCase().startsWith("reducir");
              return (
                <BorderCard key={p.id} padding="p-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.status === "followed" ? "bg-[#30d158]/10 text-[#30d158]" : "bg-white/[0.05] text-[#86868b]"}`}>
                      {p.status === "followed" ? "Seguida" : "Ignorada"}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${actionColors[p.action] || "bg-white/5 text-[#f5f5f7]"}`}>{p.action}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.ticker}</p>
                      <p className="text-[11px] text-[#48484a] truncate">{p.name || p.reasoning.slice(0, 60)}</p>
                    </div>
                    <div className="text-xs text-[#86868b]" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.price_at_decision ? (
                        <>
                          {p.price_at_decision.toFixed(2)} <span className="text-[#48484a]">→</span>{" "}
                          {p.current_price ? p.current_price.toFixed(2) : "…"}
                        </>
                      ) : (
                        <span className="text-[#48484a]">sin precio de referencia</span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      {p.effect_pct !== null && (
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${p.effect_pct >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                            {p.effect_pct >= 0 ? "+" : ""}{p.effect_pct.toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-[#48484a]">seguirla habría dado</p>
                        </div>
                      )}
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                          verdict.good === true
                            ? "bg-[#30d158]/10 text-[#30d158]"
                            : verdict.good === false
                            ? "bg-[#ff453a]/10 text-[#ff453a]"
                            : "bg-white/[0.04] text-[#86868b]"
                        }`}
                      >
                        {verdict.label}
                      </span>
                      <button
                        onClick={() => handleUndo(p)}
                        aria-label="Eliminar registro"
                        title="Eliminar registro"
                        className="w-6 h-6 rounded-full border border-white/[0.1] flex items-center justify-center text-[#48484a] hover:text-[#f5f5f7] hover:border-white/30 transition-all"
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {p.fiction_amount ? (
                    <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#48484a] border border-dashed border-white/[0.1]">ficción</span>
                      <p className="text-xs text-[#86868b]" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.fiction_amount.toLocaleString("es-ES")} € simulados{" "}
                        {p.fiction_value !== null && (
                          <>
                            → <span className={p.fiction_value >= p.fiction_amount ? "text-[#30d158]" : "text-[#ff453a]"}>
                              {p.fiction_value.toLocaleString("es-ES")} €
                            </span>{" "}
                            {isBuy ? "hoy" : "hoy (posición corta simulada)"}
                          </>
                        )}
                      </p>
                    </div>
                  ) : null}
                </BorderCard>
              );
            })}
          </div>

          {paths.length === 0 && (
            <div className="text-center py-12 text-[#48484a]">
              <p className="text-sm">Aún no hay decisiones registradas</p>
              <p className="text-xs mt-1">Pulsa Seguir, Ignorar o &ldquo;Invertir en ficción&rdquo; en cualquier recomendación</p>
            </div>
          )}

          {/* Resumen ficción */}
          {fictionPaths.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80">Cartera de ficción</p>
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
