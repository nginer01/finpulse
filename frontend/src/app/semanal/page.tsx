"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import LineChart from "@/components/charts/LineChart";
import BarsChart from "@/components/charts/BarsChart";
import CandleChart from "@/components/charts/CandleChart";
import Sparkline from "@/components/charts/Sparkline";
import { Icon, Breadcrumb } from "@/components/article/ArticleBits";

/* ------------------------------------------------------------------ */
/*  Datos por semana                                                   */
/* ------------------------------------------------------------------ */

type Dir = "up" | "down";

interface WeekData {
  id: string;
  label: string;
  range: string;
  headline: string;
  portfolioPct: number;
  portfolioEur: number;
  portfolioValue: number;
  sp: { label: string; value: number }[];
  spPct: string;
  candles: { label: string; o: number; h: number; l: number; c: number }[];
  vix: { value: number; delta: string; note: string };
  sectores: { label: string; value: number; note?: string }[];
  sectorLeader: { name: string; value: string };
  movers: { ticker: string; name: string; change: string; dir: Dir; bar: number; note: string }[];
  posiciones: { t: string; c: string; up: boolean; spark: number[] }[];
  decisiones: { title: string; score: number; verdict: string; text: string }[];
  trackRecord: { pct: number; hits: string; items: { text: string; result: string }[] };
  objetivos: { text: string; priority: "alta" | "media" | "baja" }[];
  eventos: { date: string; event: string }[];
}

const WEEKS: WeekData[] = [
  {
    id: "w27",
    label: "Esta semana",
    range: "29 jun — 3 jul 2026",
    headline: "Cuatro récords en cinco sesiones: el mercado eligió creer",
    portfolioPct: 1.9,
    portfolioEur: 244.15,
    portfolioValue: 13091.47,
    sp: [
      { label: "Vie 26", value: 6173 },
      { label: "Lun 29", value: 6205 },
      { label: "Mar 30", value: 6228 },
      { label: "Mié 1", value: 6212 },
      { label: "Jue 2", value: 6241 },
      { label: "Vie 3", value: 6284 },
    ],
    spPct: "+1,8%",
    candles: [
      { label: "Lun 29", o: 6178, h: 6210, l: 6170, c: 6205 },
      { label: "Mar 30", o: 6205, h: 6235, l: 6198, c: 6228 },
      { label: "Mié 1", o: 6228, h: 6232, l: 6195, c: 6212 },
      { label: "Jue 2", o: 6212, h: 6248, l: 6208, c: 6241 },
      { label: "Vie 3", o: 6245, h: 6290, l: 6240, c: 6284 },
    ],
    vix: { value: 16.4, delta: "-4,9% en la semana", note: "Mínimo de 5 meses con el deadline arancelario a 3 días. Complacencia de manual: cobertura históricamente barata." },
    sectores: [
      { label: "Semiconductores", value: 2.8, note: "Nvidia roza los $4T" },
      { label: "Tecnología", value: 1.9, note: "Mega-caps en máximos" },
      { label: "Financieras", value: 1.1, note: "Despiertan antes de resultados" },
      { label: "Industriales", value: 0.8 },
      { label: "Salud", value: 0.3 },
      { label: "Consumo", value: 0.2 },
      { label: "Utilities", value: -0.6 },
      { label: "Energía", value: -2.1, note: "OPEC+ acelera la devolución" },
    ],
    sectorLeader: { name: "Semiconductores", value: "+2,8%" },
    movers: [
      { ticker: "NVDA", name: "Nvidia", change: "+4,6%", dir: "up", bar: 100, note: "Roza los $4T de capitalización" },
      { ticker: "TSM", name: "TSMC", change: "+3,8%", dir: "up", bar: 83, note: "Ventas de junio +26% interanual" },
      { ticker: "MU", name: "Micron", change: "+3,2%", dir: "up", bar: 70, note: "Demanda HBM desbordada" },
      { ticker: "XOM", name: "Exxon", change: "-3,1%", dir: "down", bar: 67, note: "Peor semana desde abril" },
      { ticker: "OXY", name: "Occidental", change: "-4,1%", dir: "down", bar: 89, note: "La más apalancada al crudo" },
    ],
    posiciones: [
      { t: "SEMI", c: "+3,4%", up: true, spark: [100, 100.8, 101.4, 101.1, 102.2, 103.4] },
      { t: "VUAA", c: "+2,0%", up: true, spark: [100, 100.5, 100.9, 100.6, 101.2, 102.0] },
      { t: "IWDA", c: "+1,6%", up: true, spark: [100, 100.4, 100.8, 100.6, 101.0, 101.6] },
      { t: "EUNA", c: "+0,2%", up: true, spark: [100, 100.1, 100.0, 100.1, 100.2, 100.2] },
      { t: "BRT", c: "-2,8%", up: false, spark: [100, 99.4, 98.9, 99.1, 98.2, 97.2] },
    ],
    decisiones: [
      { title: "No ampliaste SEMI pese al rally", score: 8, verdict: "Disciplina", text: "Llevas semanas esperando un retroceso del 2-3% para ampliar. No llegó y no perseguiste el precio. Proceso correcto aunque cueste rentabilidad a corto." },
      { title: "Mantuviste la mitad restante de BRT", score: 6, verdict: "Neutral", text: "La tesis de cobertura geopolítica sigue viva, pero la OPEC+ acelera. Si el Brent pierde los $66, la decisión pasa a revisión." },
    ],
    trackRecord: {
      pct: 79,
      hits: "15 de 19",
      items: [
        { text: "«Mantener VUAA» (semana pasada)", result: "+2,0% — acertada" },
        { text: "«No añadir riesgo pre-deadline»", result: "En curso" },
        { text: "«Vigilar soporte $66 en Brent»", result: "Sigue vigente" },
      ],
    },
    objetivos: [
      { text: "No añadir riesgo antes del deadline del jueves 9", priority: "alta" },
      { text: "Revisar ingresos Q2 de TSMC (viernes 10) — tesis SEMI", priority: "alta" },
      { text: "Vigilar soporte de $66 en Brent", priority: "media" },
      { text: "Preparar plan para el IPC del 15 de julio", priority: "baja" },
    ],
    eventos: [
      { date: "Lun 6", event: "Primeras cartas arancelarias" },
      { date: "Mié 8", event: "Actas de la Fed" },
      { date: "Jue 9", event: "Deadline aranceles" },
      { date: "Vie 10", event: "Ingresos Q2 TSMC" },
    ],
  },
  {
    id: "w26",
    label: "Semana pasada",
    range: "22 — 26 jun 2026",
    headline: "El alto el fuego hunde el crudo y dispara la renta variable",
    portfolioPct: 1.1,
    portfolioEur: 139.8,
    portfolioValue: 12847.32,
    sp: [
      { label: "Vie 19", value: 5968 },
      { label: "Lun 22", value: 6025 },
      { label: "Mar 23", value: 6092 },
      { label: "Mié 24", value: 6108 },
      { label: "Jue 25", value: 6141 },
      { label: "Vie 26", value: 6173 },
    ],
    spPct: "+3,4%",
    candles: [
      { label: "Lun 22", o: 5975, h: 6040, l: 5960, c: 6025 },
      { label: "Mar 23", o: 6030, h: 6098, l: 6022, c: 6092 },
      { label: "Mié 24", o: 6092, h: 6120, l: 6075, c: 6108 },
      { label: "Jue 25", o: 6108, h: 6150, l: 6100, c: 6141 },
      { label: "Vie 26", o: 6144, h: 6180, l: 6132, c: 6173 },
    ],
    vix: { value: 16.9, delta: "-18% en la semana", note: "Desplome desde 20,6 tras el alto el fuego. La prima de riesgo geopolítico se evaporó en tres sesiones." },
    sectores: [
      { label: "Semiconductores", value: 4.8, note: "Rebote violento tras el susto" },
      { label: "Tecnología", value: 4.1 },
      { label: "Financieras", value: 2.9 },
      { label: "Industriales", value: 2.4 },
      { label: "Consumo", value: 2.2 },
      { label: "Salud", value: 1.1 },
      { label: "Utilities", value: -0.4 },
      { label: "Energía", value: -3.9, note: "El crudo cae un 12% en la semana" },
    ],
    sectorLeader: { name: "Semiconductores", value: "+4,8%" },
    movers: [
      { ticker: "NVDA", name: "Nvidia", change: "+7,2%", dir: "up", bar: 100, note: "Lidera el rebote del riesgo" },
      { ticker: "AVGO", name: "Broadcom", change: "+5,1%", dir: "up", bar: 71, note: "Arrastrada por el ciclo IA" },
      { ticker: "MSFT", name: "Microsoft", change: "+3,9%", dir: "up", bar: 54, note: "Máximos históricos" },
      { ticker: "LMT", name: "Lockheed", change: "-3,0%", dir: "down", bar: 48, note: "Defensa corrige con la paz" },
      { ticker: "OXY", name: "Occidental", change: "-6,2%", dir: "down", bar: 100, note: "El crudo se desploma un 12%" },
    ],
    posiciones: [
      { t: "SEMI", c: "+4,9%", up: true, spark: [100, 101.5, 103.0, 103.4, 104.2, 104.9] },
      { t: "VUAA", c: "+3,4%", up: true, spark: [100, 100.9, 102.1, 102.3, 102.9, 103.4] },
      { t: "IWDA", c: "+2,8%", up: true, spark: [100, 100.8, 101.7, 101.9, 102.4, 102.8] },
      { t: "EUNA", c: "+0,4%", up: true, spark: [100, 100.1, 100.2, 100.3, 100.3, 100.4] },
      { t: "BRT", c: "-9,3%", up: false, spark: [100, 96.5, 93.2, 92.4, 91.5, 90.7] },
    ],
    decisiones: [
      { title: "No vendiste BRT en pánico el lunes", score: 7, verdict: "Control emocional", text: "El crudo abrió desplomándose y aguantaste sin vender en el peor momento. La posición siguió cayendo, pero vender en pánico habría sido peor proceso." },
      { title: "Mantuviste plan pese a la volatilidad", score: 8, verdict: "Disciplina", text: "Semana de titulares extremos y cero operaciones impulsivas. El Investor DNA de control emocional sube 3 puntos." },
    ],
    trackRecord: {
      pct: 78,
      hits: "14 de 18",
      items: [
        { text: "«El crudo corrige si hay acuerdo»", result: "-12% — acertada" },
        { text: "«Mantener SEMI»", result: "+4,9% — acertada" },
        { text: "«VIX sobre 20 es oportunidad»", result: "VIX -18% — acertada" },
      ],
    },
    objetivos: [
      { text: "Confirmar que el alto el fuego se sostiene", priority: "alta" },
      { text: "Evaluar si reducir la mitad restante de BRT", priority: "media" },
      { text: "Fin de semestre: revisar pesos de cartera", priority: "media" },
    ],
    eventos: [
      { date: "Lun 29", event: "Fin del semestre" },
      { date: "Mié 1", event: "ISM manufacturero + ADP" },
      { date: "Vie 3", event: "Nóminas de junio (media sesión)" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  UI helpers                                                         */
/* ------------------------------------------------------------------ */

const cardBase =
  "relative rounded-[20px] border border-card-border bg-card/50 overflow-hidden transition-all duration-300 hover:border-white/[0.18] hover:shadow-[0_18px_70px_rgba(0,0,0,0.6)] hover:scale-[1.015] hover:-translate-y-0.5";

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/80">{children}</p>;
}

const prColor: Record<string, string> = {
  alta: "border-[#ff453a]/30 text-[#ff453a]",
  media: "border-[#ffd60a]/30 text-[#ffd60a]",
  baja: "border-white/20 text-muted",
};

type ModalKey = "performance" | "volatilidad" | "movers" | "sectores" | "decisiones" | "track" | null;

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function SemanalPage() {
  const [weekIdx, setWeekIdx] = useState(0);
  const [modal, setModal] = useState<ModalKey>(null);
  const week = WEEKS[weekIdx];

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal, closeModal]);

  return (
    <main className="min-h-screen">
      <div className="max-w-[1360px] mx-auto px-6 pb-24">

        {/* ============ CABECERA ============ */}
        <div className="pt-10 pb-4">
          <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Resumen", href: "/resumen" }, { label: "Semanal" }]} />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-8 pt-8 pb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-muted/70 font-semibold mb-5">Weekly Dashboard</p>
            <h1 className="text-[2.4rem] sm:text-[3.2rem] font-extralight tracking-tight leading-[1.05]">
              La semana en datos
            </h1>
            <p className="text-[15px] text-muted mt-4 tracking-wide max-w-[560px] leading-relaxed">{week.headline}</p>
          </div>

          {/* Selector de semana */}
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="inline-flex rounded-full border border-card-border bg-card/60 p-1">
              {WEEKS.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => setWeekIdx(i)}
                  className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 cursor-pointer ${
                    weekIdx === i ? "bg-white text-black" : "text-muted hover:text-foreground"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted tracking-[0.15em] uppercase pr-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {week.range}
            </p>
          </div>
        </div>

        {/* ============ GRID ASIMÉTRICO ============ */}
        <div key={week.id} className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ---- HERO CARD — performance de la semana (grande) ---- */}
          <Reveal className="lg:col-span-7 lg:row-span-2">
            <button type="button" onClick={() => setModal("performance")} className={`${cardBase} w-full h-full text-left cursor-pointer group block`}>
              <img
                src="https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1400&h=900&fit=crop&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-[0.07] grayscale transition-opacity duration-700 group-hover:opacity-[0.11]"
              />
              <div className="relative p-7 sm:p-9 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <CardLabel>Tu portfolio — {week.range}</CardLabel>
                    <div className="flex items-baseline gap-4 mt-4">
                      <p className={`text-[3.4rem] sm:text-[4.2rem] font-extralight tracking-tight leading-none ${week.portfolioPct >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                        <AnimatedCounter value={week.portfolioPct} decimals={1} prefix={week.portfolioPct >= 0 ? "+" : ""} suffix="%" duration={1400} />
                      </p>
                      <p className="text-[15px] text-muted font-light" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {week.portfolioPct >= 0 ? "+" : ""}
                        {week.portfolioEur.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <p className="text-[14px] text-[#c8c8cd] mt-3 font-light" style={{ fontVariantNumeric: "tabular-nums" }}>
                      Valor total:{" "}
                      <AnimatedCounter value={week.portfolioValue} decimals={2} suffix=" €" duration={1600} className="font-medium text-foreground" />
                    </p>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/30 transition-all duration-300">
                    <Icon name="lens" className="w-4 h-4" />
                  </span>
                </div>

                <div className="flex-1 min-h-[220px]">
                  <div className="flex items-baseline justify-between mb-3">
                    <CardLabel>S&P 500 — cierres diarios</CardLabel>
                    <span className="text-[15px] font-semibold text-[#30d158]" style={{ fontVariantNumeric: "tabular-nums" }}>{week.spPct}</span>
                  </div>
                  <LineChart data={week.sp} height={230} decimals={0} ariaLabel="S&P 500 durante la semana" />
                </div>

                <div className="mt-7 pt-6 border-t border-white/[0.06] grid grid-cols-5 gap-2">
                  {week.posiciones.map((p) => (
                    <div key={p.t} className="text-center">
                      <p className="text-[10px] font-semibold tracking-[0.15em] text-muted mb-1.5">{p.t}</p>
                      <p className={`text-[13px] font-semibold ${p.up ? "text-[#30d158]" : "text-[#ff453a]"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.c}
                      </p>
                      <div className="flex justify-center mt-1.5">
                        <Sparkline data={p.spark} width={56} height={18} color={p.up ? "#30d158" : "#ff453a"} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          </Reveal>

          {/* ---- VOLATILIDAD ---- */}
          <Reveal delay={100} className="lg:col-span-5">
            <button type="button" onClick={() => setModal("volatilidad")} className={`${cardBase} w-full text-left cursor-pointer group block`}>
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <CardLabel>Volatilidad</CardLabel>
                    <div className="flex items-baseline gap-3 mt-3">
                      <p className="text-[2.2rem] font-extralight tracking-tight leading-none text-[#ffd60a]">
                        <AnimatedCounter value={week.vix.value} decimals={1} duration={1200} />
                      </p>
                      <span className="text-[12px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>VIX · {week.vix.delta}</span>
                    </div>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/30 transition-all duration-300">
                    <Icon name="candles" className="w-4 h-4" />
                  </span>
                </div>
                <CandleChart data={week.candles} height={150} ariaLabel="Velas diarias del S&P 500" />
              </div>
            </button>
          </Reveal>

          {/* ---- TOP MOVERS ---- */}
          <Reveal delay={200} className="lg:col-span-5">
            <button type="button" onClick={() => setModal("movers")} className={`${cardBase} w-full text-left cursor-pointer group block`}>
              <div className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <CardLabel>Top movers</CardLabel>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/30 transition-all duration-300">
                    <Icon name="star" className="w-4 h-4" />
                  </span>
                </div>
                <div className="space-y-4">
                  {week.movers.map((m) => (
                    <div key={m.ticker} className="flex items-center gap-4">
                      <span
                        className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-semibold tracking-wide ${
                          m.dir === "up" ? "bg-[#30d158]/10 text-[#30d158]" : "bg-[#ff453a]/10 text-[#ff453a]"
                        }`}
                      >
                        {m.ticker.slice(0, 4)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-1.5">
                          <p className="text-[13px] font-medium text-foreground truncate">{m.name}</p>
                          <span className={`text-[13px] font-semibold shrink-0 ${m.dir === "up" ? "text-[#30d158]" : "text-[#ff453a]"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                            {m.change}
                          </span>
                        </div>
                        <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${m.bar}%`, backgroundColor: m.dir === "up" ? "#30d158" : "#ff453a" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          </Reveal>

          {/* ---- SECTORES ---- */}
          <Reveal delay={100} className="lg:col-span-6">
            <button type="button" onClick={() => setModal("sectores")} className={`${cardBase} w-full text-left cursor-pointer group block`}>
              <div className="p-7">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardLabel>Sectores — semana</CardLabel>
                    <p className="text-[14px] text-[#c8c8cd] mt-2.5 font-light">
                      Líder: <span className="text-foreground font-medium">{week.sectorLeader.name}</span>{" "}
                      <span className="text-[#30d158] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>{week.sectorLeader.value}</span>
                    </p>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/30 transition-all duration-300">
                    <Icon name="sectors" className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-5">
                  <BarsChart data={[...week.sectores.slice(0, 3), ...week.sectores.slice(-3)]} ariaLabel="Performance sectorial de la semana" />
                </div>
              </div>
            </button>
          </Reveal>

          {/* ---- DECISIONES ---- */}
          <Reveal delay={200} className="lg:col-span-3">
            <button type="button" onClick={() => setModal("decisiones")} className={`${cardBase} w-full h-full text-left cursor-pointer group block`}>
              <div className="p-7 flex flex-col h-full">
                <div className="flex items-start justify-between mb-5">
                  <CardLabel>Tus decisiones</CardLabel>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/30 transition-all duration-300">
                    <Icon name="check" className="w-4 h-4" />
                  </span>
                </div>
                <div className="space-y-5 flex-1">
                  {week.decisiones.map((d) => (
                    <div key={d.title}>
                      <p className="text-[13px] font-medium text-foreground leading-snug mb-2">{d.title}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-white/60 transition-all duration-1000" style={{ width: `${d.score * 10}%` }} />
                        </div>
                        <span className="text-[12px] font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{d.score}/10</span>
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-muted mt-1.5 font-semibold">{d.verdict}</p>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          </Reveal>

          {/* ---- TRACK RECORD IA ---- */}
          <Reveal delay={300} className="lg:col-span-3">
            <button type="button" onClick={() => setModal("track")} className={`${cardBase} w-full h-full text-left cursor-pointer group block`}>
              <div className="p-7 flex flex-col h-full">
                <div className="flex items-start justify-between mb-5">
                  <CardLabel>Recomendaciones IA</CardLabel>
                  <span className="shrink-0 w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-white/30 transition-all duration-300">
                    <Icon name="trend" className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-[3rem] font-extralight tracking-tight leading-none text-foreground">
                  <AnimatedCounter value={week.trackRecord.pct} decimals={0} suffix="%" duration={1400} />
                </p>
                <p className="text-[12px] text-muted mt-2">de acierto histórico · {week.trackRecord.hits}</p>
                <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-2.5 flex-1">
                  {week.trackRecord.items.slice(0, 2).map((r, i) => (
                    <p key={i} className="text-[12px] text-[#c8c8cd] leading-relaxed">
                      {r.text} <span className="text-[#30d158]">{r.result}</span>
                    </p>
                  ))}
                </div>
              </div>
            </button>
          </Reveal>

          {/* ---- CTA — LEER RESUMEN SEMANAL ---- */}
          <Reveal delay={100} className="lg:col-span-12">
            <div className={`${cardBase} group`}>
              <img
                src="https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1800&h=500&fit=crop&q=85"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-[0.16] grayscale transition-all duration-700 group-hover:opacity-[0.22] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
              <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                <div className="max-w-[620px]">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-muted font-semibold mb-4">El artículo completo</p>
                  <h2 className="text-[1.7rem] sm:text-[2.2rem] font-extralight tracking-tight leading-[1.15]">
                    {week.headline}
                  </h2>
                  <p className="text-[14px] text-muted mt-4 leading-relaxed">
                    Día a día, noticias mayores, sectores, técnico y perspectiva — el análisis completo de la semana en formato artículo. ~14 min de lectura.
                  </p>
                </div>
                <div className="flex flex-col gap-3 shrink-0">
                  <Link
                    href="/semanal/resumen"
                    className="inline-flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-9 py-4 hover:tracking-[0.35em] transition-all duration-500"
                  >
                    <Icon name="newspaper" className="w-4 h-4" />
                    Leer resumen semanal
                  </Link>
                  <div className="flex gap-3">
                    <Link
                      href="/comparador"
                      className="flex-1 inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/[0.2] text-foreground rounded-full px-5 py-3 hover:border-white/50 transition-all duration-500"
                    >
                      Comparar semanas
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/[0.2] text-foreground rounded-full px-5 py-3 hover:border-white/50 transition-all duration-500 cursor-pointer"
                      aria-label="Descargar resumen como PDF"
                    >
                      <Icon name="download" className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ---- OBJETIVOS ---- */}
          <Reveal delay={100} className="lg:col-span-6">
            <div className={`${cardBase} h-full`}>
              <div className="p-7">
                <CardLabel>Objetivos — próxima semana</CardLabel>
                <div className="mt-5 space-y-3">
                  {week.objetivos.map((o, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-2.5 border-b border-white/[0.05] last:border-0">
                      <p className="text-[14px] text-[#c8c8cd] leading-snug">{o.text}</p>
                      <span className={`shrink-0 text-[9px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full border ${prColor[o.priority]}`}>
                        {o.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ---- PRÓXIMOS EVENTOS ---- */}
          <Reveal delay={200} className="lg:col-span-6">
            <div className={`${cardBase} h-full`}>
              <div className="p-7">
                <CardLabel>Próximos eventos</CardLabel>
                <div className="mt-5 space-y-3">
                  {week.eventos.map((e, i) => (
                    <div key={i} className="flex items-center gap-5 py-2.5 border-b border-white/[0.05] last:border-0">
                      <span className="w-14 shrink-0 text-[11px] font-semibold text-foreground uppercase tracking-wider" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {e.date}
                      </span>
                      <p className="text-[14px] text-[#c8c8cd] leading-snug">{e.event}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/resumen"
                  className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground transition-colors duration-300"
                >
                  Briefing diario de hoy
                  <Icon name="arrow-right" className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ============ MODAL DETALLE ============ */}
      {modal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-carousel-fade" />
          <div
            className="relative w-full max-w-[720px] max-h-[85vh] overflow-y-auto rounded-[20px] border border-white/[0.12] bg-[#131315] p-8 sm:p-10 shadow-2xl shadow-black/70 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Cerrar"
              className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/[0.15] flex items-center justify-center text-muted hover:text-foreground hover:border-white/40 transition-all duration-300 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {modal === "performance" && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">Detalle · {week.range}</p>
                <h3 className="text-[1.8rem] font-extralight tracking-tight mb-6">Performance de la semana</h3>
                <LineChart data={week.sp} height={240} decimals={0} ariaLabel="S&P 500 durante la semana" />
                <div className="mt-7 space-y-3">
                  {week.posiciones.map((p) => (
                    <div key={p.t} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                      <span className="text-[13px] font-semibold tracking-[0.1em] text-[#c8c8cd]">{p.t}</span>
                      <div className="flex items-center gap-5">
                        <Sparkline data={p.spark} width={90} height={22} color={p.up ? "#30d158" : "#ff453a"} />
                        <span className={`text-[14px] font-semibold w-16 text-right ${p.up ? "text-[#30d158]" : "text-[#ff453a]"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                          {p.c}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/semanal/resumen" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground hover:gap-3.5 transition-all duration-300">
                  Leer el análisis completo <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {modal === "volatilidad" && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">Detalle · {week.range}</p>
                <h3 className="text-[1.8rem] font-extralight tracking-tight mb-2">Volatilidad</h3>
                <p className="text-[14px] text-[#c8c8cd] leading-[1.8] mb-7">{week.vix.note}</p>
                <CandleChart data={week.candles} height={240} ariaLabel="Velas diarias del S&P 500" />
                <p className="text-[12px] text-muted mt-5">
                  VIX: <span className="text-[#ffd60a] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>{week.vix.value.toLocaleString("es-ES")}</span> · {week.vix.delta}
                </p>
              </>
            )}

            {modal === "movers" && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">Detalle · {week.range}</p>
                <h3 className="text-[1.8rem] font-extralight tracking-tight mb-6">Top movers de la semana</h3>
                <div className="space-y-5">
                  {week.movers.map((m) => (
                    <div key={m.ticker} className="flex items-start gap-4 pb-5 border-b border-white/[0.06] last:border-0">
                      <span className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-semibold ${m.dir === "up" ? "bg-[#30d158]/10 text-[#30d158]" : "bg-[#ff453a]/10 text-[#ff453a]"}`}>
                        {m.ticker.slice(0, 4)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-[14px] font-medium text-foreground">{m.name}</p>
                          <span className={`text-[14px] font-semibold ${m.dir === "up" ? "text-[#30d158]" : "text-[#ff453a]"}`} style={{ fontVariantNumeric: "tabular-nums" }}>{m.change}</span>
                        </div>
                        <p className="text-[13px] text-muted leading-relaxed mt-1">{m.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {modal === "sectores" && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">Detalle · {week.range}</p>
                <h3 className="text-[1.8rem] font-extralight tracking-tight mb-7">Sectores — los 8 del S&P</h3>
                <BarsChart data={week.sectores} ariaLabel="Performance sectorial completa" />
                <Link href="/semanal/resumen" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground hover:gap-3.5 transition-all duration-300">
                  Análisis sectorial completo <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {modal === "decisiones" && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">Detalle · {week.range}</p>
                <h3 className="text-[1.8rem] font-extralight tracking-tight mb-6">Tus decisiones, analizadas</h3>
                <div className="space-y-7">
                  {week.decisiones.map((d) => (
                    <div key={d.title}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <p className="text-[15px] font-medium text-foreground">{d.title}</p>
                        <span className="text-[13px] font-semibold text-foreground shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>{d.score}/10</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold mb-3">{d.verdict}</p>
                      <p className="text-[14px] text-[#c8c8cd] leading-[1.8]">{d.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {modal === "track" && (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">Detalle · histórico</p>
                <h3 className="text-[1.8rem] font-extralight tracking-tight mb-2">Track record de la IA</h3>
                <p className="text-[14px] text-[#c8c8cd] leading-[1.8] mb-7">
                  {week.trackRecord.pct}% de acierto ({week.trackRecord.hits} recomendaciones). Cada recomendación se registra y se evalúa
                  retrospectivamente — sin trampas de memoria selectiva.
                </p>
                <div className="space-y-4">
                  {week.trackRecord.items.map((r, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06] last:border-0">
                      <p className="text-[14px] text-[#c8c8cd]">{r.text}</p>
                      <span className="text-[13px] text-[#30d158] font-medium shrink-0">{r.result}</span>
                    </div>
                  ))}
                </div>
                <Link href="/recomendaciones" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground hover:gap-3.5 transition-all duration-300">
                  Ver todas las recomendaciones <Icon name="arrow-right" className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
