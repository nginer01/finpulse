"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BorderCard from "@/components/BorderCard";
import Tooltip from "@/components/Tooltip";
import AnimatedCounter from "@/components/AnimatedCounter";
import dynamic from "next/dynamic";
import { usePortfolioSnapshot } from "@/hooks/useMarketData";
import type { Quote } from "@/lib/api";

const TradingChart = dynamic(() => import("@/components/TradingChart"), { ssr: false });

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-12">
      <div className="w-14 h-[1px] bg-white/[0.06]" />
      <div className="w-1.5 h-1.5 rounded-full border border-white/[0.08]" />
      <div className="w-14 h-[1px] bg-white/[0.06]" />
    </div>
  );
}

function SummarySection({ title, icon, tag, tagColor, defaultOpen, children }: {
  title: string;
  icon: string;
  tag?: string;
  tagColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-[13px] font-medium text-white/80 flex-1">{title}</span>
        {tag && (
          <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full ${tagColor || "border border-white/[0.08] text-white/30"}`}>{tag}</span>
        )}
        <span className="text-white/30"><ChevronIcon open={open} /></span>
      </button>
      {open && (
        <div className="pb-5 pl-9 pr-4 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
}

function SourceBadge({ name, type }: { name: string; type: "newsletter" | "podcast" | "polymarket" | "x" | "bank" | "news" }) {
  const colors: Record<string, string> = {
    newsletter: "border-blue-400/20 text-blue-400/80",
    podcast: "border-[#bf5af2]/20 text-[#bf5af2]/80",
    polymarket: "border-[#30d158]/20 text-[#30d158]/80",
    x: "border-white/10 text-white/50",
    bank: "border-[#ffd60a]/20 text-[#ffd60a]/80",
    news: "border-[#ff453a]/20 text-[#ff453a]/80",
  };
  return (
    <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border ${colors[type]}`}>{name}</span>
  );
}

function NewsCard({ type, title, tag, delay, image, source, summary, impact, sources }: {
  type: string; title: string; tag: string; delay: string; image: string; source: string;
  summary: string; impact: string; sources: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const tagColors: Record<string, string> = {
    "Tu portfolio": "border-[#30d158]/20 text-[#30d158]/80",
    "Nuevo": "border-[#30d158]/20 text-[#30d158]/80",
    "Futuro": "border-[#ffd60a]/20 text-[#ffd60a]/80",
  };
  return (
    <div className={`bg-[#111111] border border-white/[0.06] rounded-2xl cursor-pointer transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] hover:scale-[1.01] ${delay}`}>
      <div onClick={() => setExpanded(!expanded)}>
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/50 to-transparent" />
          <span className="absolute bottom-2 left-3 text-[10px] text-white/30 uppercase tracking-[0.1em]">{source}</span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/25 uppercase tracking-[0.1em]">{type}</span>
            <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border ${tagColors[tag] || "border-white/[0.08] text-white/30"}`}>{tag}</span>
          </div>
          <h3 className="text-[13px] font-medium leading-snug mb-2 text-white/90">{title}</h3>
          {!expanded && <p className="text-[11px] text-white/30">Click para expandir</p>}
          {expanded && (
            <div className="mt-3 space-y-3 animate-fade-in-up">
              <p className="text-[13px] text-white/40 leading-[1.9]">{summary}</p>
              <div className="bg-black/40 rounded-xl p-3 border border-white/[0.06]">
                <p className="text-[11px] text-[#30d158] font-medium mb-1 uppercase tracking-[0.1em]">Impacto en tu portfolio</p>
                <p className="text-[13px] text-white/40 leading-[1.9]">{impact}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {sources.map((s) => (
                  <span key={s} className="text-[10px] px-2.5 py-1 rounded-full border border-white/[0.06] text-white/30">{s}</span>
                ))}
              </div>
              <Link href="/noticia" className="block text-[11px] text-white/50 hover:text-white/70 transition-colors" onClick={(e) => e.stopPropagation()}>
                Profundizar &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PortfolioPosition({ ticker, name, change, value }: { ticker: string; name: string; change: number; value: string }) {
  const isPositive = change >= 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[10px] font-mono text-white/50">
          {ticker.slice(0, 2)}
        </div>
        <div>
          <p className="text-[13px] font-medium text-white/90">{ticker}</p>
          <p className="text-[11px] text-white/30">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-medium tabular-nums text-white/90">{value}</p>
        <p className={`text-[11px] font-medium tabular-nums ${isPositive ? "text-[#30d158]" : "text-[#ff453a]"}`}>
          {isPositive ? "+" : ""}{change}%
        </p>
      </div>
    </div>
  );
}


// Holdings: quantity per ticker (from user's portfolio)
const HOLDINGS: Record<string, { qty: number; name: string }> = {
  IWDA: { qty: 35, name: "iShares MSCI World" },
  VUAA: { qty: 10, name: "Vanguard S&P 500" },
  BRT: { qty: 15, name: "Brent Crude Oil" },
  EUNA: { qty: 50, name: "iShares Euro Gov Bond" },
  SEMI: { qty: 100, name: "VanEck Semiconductor" },
};

function formatEUR(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PreviewDark() {
  const { data: snapshot, loading: marketLoading } = usePortfolioSnapshot();

  // Compute portfolio positions from real market data
  const positions = Object.entries(HOLDINGS).map(([ticker, { qty, name }]) => {
    const quote = snapshot?.positions[ticker];
    const price = quote?.price || 0;
    const value = price * qty;
    const changePct = quote?.changePct || 0;
    return { ticker, name, value, changePct, price, qty };
  });

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

  // Compute weighted weekly change
  const weightedChange = totalValue > 0
    ? positions.reduce((sum, p) => sum + (p.changePct * p.value / totalValue), 0)
    : 0;

  // Format current date
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden preview-dark-page">

      {/* Hero: Daily Summary */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="stagger-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 font-medium mb-2">{dateStr} &mdash; {timeStr}</p>
          <h1 className="text-3xl font-extralight tracking-wide text-white">Buenos d&iacute;as, Nico</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
          <div className="stagger-2">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-1">Portfolio total</p>
              <AnimatedCounter value={totalValue} className="text-xl font-extralight tracking-tight text-white" />
              <p className={`text-[11px] font-medium tabular-nums ${weightedChange >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                {weightedChange >= 0 ? "+" : ""}{weightedChange.toFixed(1)}% hoy
              </p>
            </div>
          </div>
          <div className="stagger-3">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
              <Tooltip text="Indice de sentimiento basado en Polymarket, VIX y flujos de capital. 0 = panico extremo, 100 = euforia maxima.">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-1 border-b border-dashed border-white/10">Sentimiento mercado</p>
              </Tooltip>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#ff453a] to-[#ffd60a] animate-fill-bar" />
                </div>
                <span className="text-sm font-medium tabular-nums text-[#ffd60a]">62</span>
              </div>
              <p className="text-[11px] text-white/30 mt-1">Moderadamente optimista</p>
            </div>
          </div>
          <div className="stagger-4">
            <Link href="/recomendaciones">
              <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-1">Recomendacion IA</p>
                <p className="text-[13px] font-medium text-white/90">Mantener posiciones</p>
                <p className="text-[11px] text-white/40">Conviccion: 7/10 &rarr;</p>
              </div>
            </Link>
          </div>
          <div className="stagger-5">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
              <Tooltip text="Tu perfil psicologico como inversor. Mide disciplina, control emocional, diversificacion y timing. Evoluciona con cada decision.">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-1 border-b border-dashed border-white/10">Tu Investor DNA</p>
              </Tooltip>
              <p className="text-[13px] font-medium text-white/90">Perfil equilibrado</p>
              <p className="text-[11px] text-white/30">Acierto: 68% (mejorando)</p>
            </div>
          </div>
        </div>

        {/* Next event countdown */}
        <div className="stagger-6 mb-8">
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff453a]/10 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="3" width="14" height="12" rx="2" stroke="#ff453a" strokeWidth="1.5" />
                    <path d="M2 7h14" stroke="#ff453a" strokeWidth="1.5" />
                    <path d="M6 3V1M12 3V1" stroke="#ff453a" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-white/25 uppercase tracking-[0.1em]">Proximo evento</p>
                  <p className="text-[13px] font-medium text-white/90">IPC EEUU &mdash; martes 13 mayo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extralight tracking-tight text-[#ff453a]">1d 6h</p>
                <p className="text-[10px] text-white/25">Puede frenar el rally</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Summary -- Full version */}
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 mb-8 stagger-7">
          {/* Summary header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/25">Resumen diario</h2>
            <span className="text-[10px] text-[#30d158]/80 ml-1">Actualizado hace 2h</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <SourceBadge name="UBS On-Air" type="podcast" />
            <SourceBadge name="Matt Levine" type="newsletter" />
            <SourceBadge name="The Daily Shot" type="newsletter" />
            <SourceBadge name="Polymarket" type="polymarket" />
            <SourceBadge name="@zerohedge" type="x" />
            <SourceBadge name="@sentimentrader" type="x" />
            <SourceBadge name="Informe BBVA" type="bank" />
            <SourceBadge name="Financial Times" type="news" />
          </div>

          {/* Executive summary -- always visible */}
          <div className="relative rounded-2xl overflow-hidden mb-5 border border-white/[0.06]">
            <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=300&fit=crop" alt="Mercados globales" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em]">Resumen ejecutivo</p>
            </div>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06] mb-5">
            <p className="text-[13px] text-white/40 leading-[1.9]">
              Semana clave para los mercados globales. El acuerdo comercial preliminar EEUU-China impulsa a la renta variable global, con el S&P 500 cerrando en maximos historicos (+1.2%) y mercados europeos al alza. Sin embargo, el sector energetico se debilita tras avances en las negociaciones Iran-EEUU, con el Brent cayendo un 4.2% en la semana. El BCE mantiene el tono dovish y Polymarket situa al 73% la probabilidad de recorte en junio.
            </p>
            <p className="text-[13px] text-white/40 leading-[1.9] mt-3">
              <span className="text-[#30d158] font-medium">Para tu portfolio:</span> balance neto positivo (+2.4%). Tus posiciones en MSCI World y S&P 500 capturan la subida. Tu exposicion a Brent es el punto debil &mdash; considera reducirla o cubrir.
              <span className="text-white/60"> Semiconductores destaca como la mejor posicion (+4.2%) </span> tras el anuncio de Nvidia.
            </p>
          </div>

          {/* CTA -- Leer resumen completo */}
          <Link href="/resumen" className="group block mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] transition-all duration-500 hover:border-white/[0.20] hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]">
              {/* Background image with parallax-like effect */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop"
                  alt=""
                  className="w-full h-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
              </div>

              {/* Animated accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Subtle moving particles */}
              <div className="absolute top-4 right-12 w-1 h-1 rounded-full bg-[#30d158]/60 animate-pulse" />
              <div className="absolute top-8 right-24 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-6 right-16 w-1 h-1 rounded-full bg-[#ffd60a]/40 animate-pulse" style={{ animationDelay: "0.5s" }} />

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-[#30d158] font-medium">Briefing listo</span>
                  <span className="text-[10px] text-white/25 ml-1">8 min lectura</span>
                </div>

                <h3 className="text-[14px] sm:text-[15px] font-semibold tracking-wide text-white mb-2 transition-transform duration-300 group-hover:translate-x-1">
                  Leer el briefing completo
                </h3>
                <p className="text-[13px] text-white/40 max-w-md mb-5 leading-[1.9]">
                  Contexto macro global, impacto detallado en cada posicion de tu portfolio, fuentes clave y recomendaciones de accion.
                </p>

                {/* Mini preview tags */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#30d158]/20 text-[#30d158]/80">S&P 500 en maximos</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#ff453a]/20 text-[#ff453a]/80">Brent -4.2%</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#ffd60a]/20 text-[#ffd60a]/80">BCE dovish</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-white/10 text-white/30">+5 temas</span>
                </div>

                {/* Button */}
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/[0.08] border border-white/[0.10] transition-all duration-300 group-hover:bg-white/[0.12] group-hover:border-white/[0.18]">
                  <span className="text-[13px] font-medium text-white">Abrir briefing</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="transition-transform duration-300 group-hover:translate-x-1.5">
                    <path d="M4 9h10M10 5l4 4-4 4" stroke="#f5f5f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Collapsible sections */}
          <div className="divide-y divide-white/[0.06]">
            <SummarySection title="Contexto macro global" icon="&#x1f30d;" tag="Alcista" tagColor="border border-[#30d158]/20 text-[#30d158]/80" defaultOpen>
              <div className="space-y-3 text-[13px] text-white/40 leading-[1.9]">
                <p>
                  <span className="text-white/90 font-medium">EEUU:</span> El S&P 500 cerro el viernes en 5.847 puntos (+1.2%), impulsado por el anuncio del acuerdo comercial fase 1 con China. El Nasdaq subio un +1.8% liderado por semiconductores y mega-caps tech. Los futuros apuntan a apertura plana el lunes &mdash; el mercado ya ha descontado gran parte de la noticia. El VIX cayo a 13.2, niveles de complacencia no vistos desde enero 2024.
                </p>
                <p>
                  <span className="text-white/90 font-medium">Europa:</span> Stoxx 600 +0.8%. El BCE no ha hablado oficialmente, pero las actas de la ultima reunion filtradas por Financial Times confirman que la mayoria del consejo apoya un recorte de 25pb en junio. El euro se debilita frente al dolar (1.076), lo cual es positivo para exportadoras europeas.
                </p>
                <p>
                  <span className="text-white/90 font-medium">Asia:</span> Nikkei +1.5% (yen debil favorece exportadoras). Shanghai Composite +2.3% celebra el acuerdo comercial. India (Nifty 50) plana &mdash; los inversores rotan hacia China tras meses de outperformance indio.
                </p>
                <p>
                  <span className="text-white/90 font-medium">Renta fija:</span> Treasury 10Y en 4.28% (-5pb en la semana). Los bonos europeos se benefician del tono dovish del BCE. El Bund aleman cae a 2.31%.
                </p>
              </div>
            </SummarySection>

            <SummarySection title="Impacto directo en tu portfolio" icon="&#x1f4bc;" tag="+2.4%" tagColor="border border-[#30d158]/20 text-[#30d158]/80">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-[13px]">
                  <span className="text-[#30d158] mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-white/90 font-medium">IWDA (iShares MSCI World) +1.8%</span></p>
                    <p className="text-white/40 leading-[1.9]">Se beneficia directamente del rally global. El acuerdo EEUU-China reduce riesgo geopolitico, que era el principal freno para mercados desarrollados. Con el BCE dovish, el componente europeo tambien tira al alza. <span className="text-white/60">Esta posicion esta en su mejor momento en 3 meses.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-[13px]">
                  <span className="text-[#30d158] mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-white/90 font-medium">VUAA (Vanguard S&P 500) +2.1%</span></p>
                    <p className="text-white/40 leading-[1.9]">Maximos historicos. El acuerdo comercial elimina la incertidumbre que pesaba sobre mega-caps con exposicion a China (Apple, Nvidia, Tesla). Atencion: el VIX en 13.2 indica complacencia extrema &mdash; historicamente, niveles sub-14 preceden correcciones del 3-5% en las siguientes 4-6 semanas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-[13px]">
                  <span className="text-[#ff453a] mt-0.5">&#x25BC;</span>
                  <div>
                    <p><span className="text-white/90 font-medium">BRT (Brent Crude Oil) -3.8%</span></p>
                    <p className="text-white/40 leading-[1.9]">Las negociaciones Iran-EEUU avanzan mas rapido de lo esperado. Si Iran vuelve al mercado con plena capacidad, se estiman 1.5M barriles/dia adicionales. Esto presionaria al Brent hacia los $68-70. <span className="text-[#ff453a]">Tu posicion pierde 45,60 esta semana. Considerar stop-loss en $72 o reducir exposicion un 50%.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-[13px]">
                  <span className="text-[#30d158] mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-white/90 font-medium">EUNA (iShares Euro Gov Bond) +0.5%</span></p>
                    <p className="text-white/40 leading-[1.9]">Beneficiado por el tono dovish del BCE. Si se confirma el recorte en junio, esta posicion podria subir un 1-2% adicional. Paul Donovan (UBS) confirma que la inflacion europea no sera problema hasta Q4 2026.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-[13px]">
                  <span className="text-[#30d158] mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-white/90 font-medium">SEMI (VanEck Semiconductor) +4.2%</span></p>
                    <p className="text-white/40 leading-[1.9]">Mejor posicion de la semana. Nvidia presento la nueva arquitectura Blackwell Ultra y los pedidos anticipados superan expectativas. TSMC confirma aumento de capex del 15%. El sector esta en un ciclo expansivo que podria durar 12-18 meses mas. <span className="text-[#30d158]">Considerar aumentar posicion en caidas.</span></p>
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Temas de seguimiento" icon="&#x1f4cd;" tag="3 activos" tagColor="border border-white/10 text-white/50">
              <div className="space-y-4 text-[13px]">
                <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white/90">Semiconductores</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#ff453a]/20 text-[#ff453a]/80">ALTA (subida dinamica)</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">Prioridad base: MEDIA. Subida a ALTA por el evento de Nvidia. La nueva arquitectura Blackwell Ultra promete 4x mejor rendimiento en inferencia IA. Esto reconfigura la cadena de valor: TSMC, ASML, Samsung y SK Hynix suben entre 2-6%. Tu posicion en SEMI esta bien posicionada. Proximos catalistas: earnings de TSMC (22 mayo) y guidance de ASML (28 mayo).</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white/90">Petroleo y energia</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#ff453a]/20 text-[#ff453a]/80">ALTA (subida dinamica)</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">Prioridad base: MEDIA. Subida a ALTA por la caida del Brent. Las negociaciones Iran-EEUU son el driver principal. Arabia Saudi aun no ha reaccionado &mdash; si recorta produccion, el impacto se amortigua. Si no, el Brent puede caer hasta $68. La OPEC+ se reune el 1 de junio. Fecha clave.</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white/90">Politica monetaria BCE</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#ffd60a]/20 text-[#ffd60a]/80">MEDIA</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">Sin cambios de prioridad. Reunion del BCE el 5 de junio. Polymarket: 73% probabilidad de recorte 25pb. Impacto en tu portfolio: positivo para EUNA (bonos), positivo para IWDA (componente europeo), neutral para el resto.</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Lo que dicen tus fuentes" icon="&#x1f4e1;" tag="8 fuentes hoy" tagColor="border border-[#bf5af2]/20 text-[#bf5af2]/80">
              <div className="space-y-4 text-[13px]">
                <div className="border-l-2 border-[#bf5af2]/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="UBS On-Air" type="podcast" />
                    <span className="text-[11px] text-white/25">Paul Donovan &mdash; hoy</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">&quot;La inflacion europea esta contenida. Los datos de salarios del Q1 confirman que no hay presion alcista significativa. El BCE tiene via libre para recortar en junio sin arriesgar su credibilidad.&quot; Donovan tambien advierte que el acuerdo EEUU-China es &quot;fase 1 &mdash; los aranceles tech siguen sobre la mesa.&quot;</p>
                </div>
                <div className="border-l-2 border-blue-400/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Matt Levine" type="newsletter" />
                    <span className="text-[11px] text-white/25">Money Stuff &mdash; viernes</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">Analisis detallado del acuerdo comercial: &quot;Es un framework, no un acuerdo final. Los mercados celebran la reduccion de incertidumbre, no los terminos especificos. La letra pequena muestra que los aranceles a semiconductores y IA se negociaran por separado en Q3.&quot;</p>
                </div>
                <div className="border-l-2 border-[#30d158]/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Polymarket" type="polymarket" />
                    <span className="text-[11px] text-white/25">Datos en vivo</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">Recorte BCE junio: <span className="text-[#30d158]">73%</span> (+8% vs semana pasada). Acuerdo Iran-EEUU antes de agosto: <span className="text-[#ffd60a]">58%</span> (+15% vs semana pasada). Recesion EEUU en 2026: <span className="text-[#30d158]">12%</span> (minimo del ano). S&P 500 sobre 6000 antes de diciembre: <span className="text-[#ffd60a]">61%</span>.</p>
                </div>
                <div className="border-l-2 border-white/10 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="@zerohedge" type="x" />
                    <span className="text-[11px] text-white/25">Hilo destacado &mdash; sabado</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">Alerta sobre la complacencia del mercado: &quot;VIX en 13 con earnings season terminando y el acuerdo China ya descontado. El proximo catalizador es a la baja, no al alza. Historicamente, VIX sub-14 durante mas de 2 semanas precede correcciones.&quot; <span className="text-white/60">Dato relevante para tu S&P 500.</span></p>
                </div>
                <div className="border-l-2 border-[#ffd60a]/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Informe BBVA" type="bank" />
                    <span className="text-[11px] text-white/25">Informe semanal &mdash; viernes</span>
                  </div>
                  <p className="text-white/40 leading-[1.9]">BBVA Research revisa al alza su prevision de PIB eurozona para 2026: de 1.1% a 1.4%. Mejora perspectivas para exportadoras alemanas y sector financiero europeo. Mantiene prevision de 2 recortes del BCE este ano (junio y septiembre).</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Paralelos historicos" icon="&#x1f4da;">
              <div className="space-y-4 text-[13px] text-white/40">
                <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                  <p className="text-white/90 font-medium mb-2">Acuerdo comercial EEUU-China (2019 vs 2026)</p>
                  <p className="leading-[1.9]">En diciembre 2019, el acuerdo fase 1 impulso al S&P 500 un +3.2% en las 2 semanas siguientes. Sin embargo, los aranceles clave nunca se eliminaron realmente y el rally se agoto en febrero 2020 (antes del COVID). <span className="text-white/60">Patron similar: el mercado celebra la reduccion de incertidumbre, pero los detalles importan.</span> Recomendacion: disfrutar el rally pero no perseguirlo &mdash; tomar beneficios parciales si sube un +3% adicional.</p>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                  <p className="text-white/90 font-medium mb-2">Iran volviendo al mercado (2015-2016)</p>
                  <p className="leading-[1.9]">Cuando se firmo el JCPOA en 2015, el Brent cayo de $65 a $45 en 6 meses (-30%). La produccion iraniana aumento en 1M barriles/dia. Arabia Saudi respondio manteniendo su produccion para defender cuota de mercado, lo que intensifico la caida. <span className="text-[#ff453a]">Si el patron se repite, tu posicion en Brent tiene riesgo significativo a la baja.</span> Diferencia clave: en 2026 la demanda global es mayor y la OPEC+ tiene mas disciplina que en 2015.</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Recomendaciones de hoy" icon="&#x1f3af;" tag="2 acciones" tagColor="border border-white/10 text-white/50">
              <div className="space-y-4 text-[13px]">
                <div className="bg-black/40 rounded-xl p-4 border border-[#ff453a]/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 font-medium">Reducir Brent un 50%</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-white/10 text-white/50">Conviccion: 8/10</span>
                  </div>
                  <p className="text-white/40 leading-[1.9] mb-3">Las negociaciones Iran-EEUU, el paralelo historico de 2015, y la falta de reaccion de Arabia Saudi apuntan a mas caidas. Reducir a la mitad para limitar perdidas y mantener exposicion por si la OPEC+ reacciona.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#111111] rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-[10px] text-[#30d158] mb-1 font-medium uppercase tracking-[0.1em]">A favor</p>
                      <p className="text-[12px] text-white/40 leading-[1.8]">Paralelo 2015 (Brent -30%). Iran puede anadir 1.5M bbl/dia. Polymarket da 58% a acuerdo. Tu portfolio ya tiene bastante riesgo energy.</p>
                    </div>
                    <div className="bg-[#111111] rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-[10px] text-[#ff453a] mb-1 font-medium uppercase tracking-[0.1em]">En contra</p>
                      <p className="text-[12px] text-white/40 leading-[1.8]">La OPEC+ tiene mas disciplina hoy. La demanda global crece. Arabia Saudi podria recortar produccion. El acuerdo puede retrasarse meses.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-[#30d158]/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 font-medium">Anadir SEMI en caidas (si baja &gt;2%)</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-white/10 text-white/50">Conviccion: 7/10</span>
                  </div>
                  <p className="text-white/40 leading-[1.9] mb-3">El ciclo de semiconductores es expansivo (12-18 meses). Nvidia Blackwell Ultra confirma la demanda. TSMC aumenta capex. Pero el sector ya ha subido mucho &mdash; esperar una caida para comprar con mejor riesgo/recompensa.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#111111] rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-[10px] text-[#30d158] mb-1 font-medium uppercase tracking-[0.1em]">A favor</p>
                      <p className="text-[12px] text-white/40 leading-[1.8]">Ciclo expansivo confirmado. Demanda IA insaciable. Capex TSMC +15%. Tu posicion actual es pequena (14% del portfolio).</p>
                    </div>
                    <div className="bg-[#111111] rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-[10px] text-[#ff453a] mb-1 font-medium uppercase tracking-[0.1em]">En contra</p>
                      <p className="text-[12px] text-white/40 leading-[1.8]">Sector ya +25% YTD. Aranceles tech EEUU-China aun no resueltos (Matt Levine). Valoraciones estiradas (P/E sector en 32x).</p>
                    </div>
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Alertas y proximos eventos" icon="&#x26a0;&#xfe0f;" tag="3 alertas" tagColor="border border-[#ff453a]/20 text-[#ff453a]/80">
              <div className="space-y-3 text-[13px]">
                <div className="flex items-start gap-3">
                  <span className="text-[#ff453a] mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-white/90 font-medium">VIX en zona de complacencia (13.2)</p>
                    <p className="text-white/40 leading-[1.9]">Historicamente, VIX sub-14 durante +2 semanas precede correcciones del 3-5%. No vender, pero no anadir riesgo agresivamente. Tu S&P 500 es la posicion mas expuesta.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#ffd60a] mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-white/90 font-medium">Brent &mdash; vigilar nivel $72</p>
                    <p className="text-white/40 leading-[1.9]">Si rompe los $72 a la baja, el siguiente soporte esta en $68. Considerar stop-loss o reduccion de posicion antes de esa ruptura.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white/50 mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-white/90 font-medium">Proximos eventos clave</p>
                    <p className="text-white/40 leading-[1.9]">IPC EEUU (martes 13). Earnings TSMC (22 mayo). Reunion OPEC+ (1 junio). Reunion BCE (5 junio). Cualquiera de estos puede mover tu portfolio significativamente.</p>
                  </div>
                </div>
              </div>
            </SummarySection>
          </div>
        </div>
      </section>

      <DiamondDivider />

      {/* 6 News Windows */}
      <section className="max-w-6xl mx-auto px-6 pb-8 stagger-3">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/25 mb-8">Noticias para profundizar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NewsCard type="Interes personal" title="Acuerdo comercial EEUU-China: impacto en ETFs globales y tu posicion en MSCI World" tag="Tu portfolio" delay="stagger-1" image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop" source="Financial Times"
            summary="El acuerdo fase 1 reduce aranceles en un 30% para bienes industriales. Sin embargo, los aranceles tech (semiconductores, IA) se negociaran por separado en Q3. Los mercados celebran la reduccion de incertidumbre -- S&P 500 en maximos."
            impact="Tu IWDA sube +1.8% directamente por esto. VUAA tambien se beneficia (+2.1%). Efecto neto: +~120 en tu portfolio."
            sources={["Financial Times", "Matt Levine", "Polymarket"]}
          />
          <NewsCard type="Interes personal" title="Negociaciones Iran-EEUU avanzan: Brent cae 4% en la semana" tag="Tu portfolio" delay="stagger-2" image="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=300&fit=crop" source="Reuters"
            summary="El secretario de Estado confirmo avances significativos. Si Iran vuelve al mercado con plena capacidad, 1.5M barriles/dia adicionales presionarian los precios. Polymarket: 58% probabilidad de acuerdo antes de agosto."
            impact="Tu posicion en BRT pierde 45,60 esta semana. Si el Brent rompe $72, puede caer hasta $68. Considerar reducir exposicion."
            sources={["Reuters", "UBS On-Air", "Polymarket"]}
          />
          <NewsCard type="Informacion nueva" title="Nvidia presenta nueva arquitectura Blackwell Ultra: el mercado de semiconductores se reconfigura" tag="Nuevo" delay="stagger-3" image="https://images.unsplash.com/photo-1640955014216-75201056c829?w=600&h=300&fit=crop" source="Bloomberg"
            summary="Blackwell Ultra promete 4x mejor rendimiento en inferencia IA. Los hyperscalers ya han confirmado pedidos masivos. TSMC aumenta capex un 15%. El ciclo expansivo de semiconductores se extiende 12-18 meses mas."
            impact="Tu SEMI sube +4.2%, mejor posicion de la semana. Considerar aumentar en proxima caida."
            sources={["Bloomberg", "@sentimentrader", "Financial Times"]}
          />
          <NewsCard type="Informacion nueva" title="India supera a China como mayor mercado emergente por flujo de capitales" tag="Nuevo" delay="stagger-4" image="https://images.unsplash.com/photo-1532664189809-02133fee698d?w=600&h=300&fit=crop" source="The Daily Shot"
            summary="Tras meses de outperformance, India atrae mas capital que China por primera vez en 2026. Sin embargo, el acuerdo EEUU-China esta provocando rotacion inversa -- los inversores vuelven a mirar a Shanghai."
            impact="No tienes exposicion directa a emergentes. Podria ser una oportunidad futura si India corrige."
            sources={["The Daily Shot", "BBVA Research"]}
          />
          <NewsCard type="Vision futura" title="Regulacion IA en Europa: nuevo marco legal podria impactar al sector tech en 2027" tag="Futuro" delay="stagger-5" image="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop" source="Matt Levine"
            summary="La UE prepara nuevas restricciones para modelos de IA de alto riesgo. Las multas podrian alcanzar el 6% de los ingresos globales. Meta, Google y Microsoft serian los mas afectados. Implementacion prevista para Q1 2027."
            impact="Impacto indirecto en tu VUAA y IWDA por el peso de big tech. Monitorizar -- no requiere accion inmediata."
            sources={["Matt Levine", "Financial Times"]}
          />
          <NewsCard type="Vision futura" title="Escasez global de cobre: la proxima crisis silenciosa para la transicion energetica" tag="Futuro" delay="stagger-6" image="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop" source="Informe BBVA"
            summary="BBVA Research alerta: la demanda de cobre para vehiculos electricos y renovables superara la oferta en 2027-2028. Chile y Peru no pueden aumentar produccion al ritmo necesario. El precio podria duplicarse en 3 anos."
            impact="No tienes exposicion a cobre. Podria ser oportunidad a medio plazo -- radar de oportunidades activado."
            sources={["Informe BBVA", "Bloomberg"]}
          />
        </div>
      </section>

      <DiamondDivider />

      {/* Fiction mini */}
      <section className="max-w-6xl mx-auto px-6 pb-4 stagger-8">
        <Link href="/recomendaciones">
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center border border-dashed border-white/[0.15]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#86868b" strokeWidth="1" strokeDasharray="2 1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-white/25 uppercase tracking-[0.1em]">Inversiones en ficcion</p>
                  <p className="text-[13px] font-medium text-white/90">2 activas &mdash; IBIT, GLD</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium tabular-nums text-[#30d158]">+284,50 &euro;</p>
                <p className="text-[10px] text-white/25">de 800 &euro; simulados &rarr;</p>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <DiamondDivider />

      {/* Portfolio Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portfolio */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/25">Portfolio</h2>
              <span className={`text-[11px] font-medium tabular-nums ${weightedChange >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>{weightedChange >= 0 ? "+" : ""}{weightedChange.toFixed(1)}% hoy</span>
            </div>
            <TradingChart />
            <div className="mt-3 px-2">
              {positions.map((p) => (
                <PortfolioPosition
                  key={p.ticker}
                  ticker={p.ticker}
                  name={p.name}
                  change={p.changePct}
                  value={formatEUR(p.value)}
                />
              ))}
            </div>
          </div>

          {/* Investor DNA + Learning */}
          <div className="space-y-6">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/25 mb-4">Investor DNA</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/30">Disciplina</span>
                    <span className="text-white/60 font-medium tabular-nums"><AnimatedCounter value={78} decimals={0} suffix="%" /></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-white/40 animate-fill-bar" style={{ width: "78%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/30">Control emocional</span>
                    <span className="text-white/60 font-medium tabular-nums"><AnimatedCounter value={65} decimals={0} suffix="%" /></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-[#ffd60a] animate-fill-bar" style={{ width: "65%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/30">Diversificacion</span>
                    <span className="text-white/60 font-medium tabular-nums"><AnimatedCounter value={82} decimals={0} suffix="%" /></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-[#30d158] animate-fill-bar" style={{ width: "82%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/30">Timing</span>
                    <span className="text-white/60 font-medium tabular-nums">54%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-[#ff453a]" style={{ width: "54%" }} />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-white/30 mt-4">Tendencia: mejorando en disciplina, trabajar en timing de entrada.</p>
            </div>

            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/25 mb-3">Ultima leccion aprendida</h2>
              <div className="bg-black/40 rounded-xl p-4 border border-white/[0.06]">
                <p className="text-[10px] text-white/40 mb-2 uppercase tracking-[0.1em]">Hace 3 dias &mdash; Venta de BRT</p>
                <p className="text-[13px] text-white/40 leading-[1.9]">
                  Vendiste parte de Brent tras caida del 2%. Resultado: siguio cayendo un 1.8% adicional.
                  <span className="text-[#30d158]"> Buena decision.</span> Senal clave que detectaste: volumen de venta institucional inusualmente alto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DiamondDivider />

      {/* Radar de Oportunidades */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/25 mb-8">Radar de oportunidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Radar visual */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)]">
            <div className="relative w-48 h-48">
              {/* Radar circles */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                {/* Sweep line */}
                <line x1="100" y1="100" x2="170" y2="40" stroke="#f5f5f7" strokeWidth="1.5" opacity="0.4">
                  <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite" />
                </line>
                {/* Blips -- opportunities */}
                <circle cx="135" cy="55" r="5" fill="#30d158" opacity="0.9">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="70" r="4" fill="#ffd60a" opacity="0.8">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="120" r="3.5" fill="#f5f5f7" opacity="0.7">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <p className="text-[11px] text-white/30 mt-2">3 oportunidades detectadas</p>
          </div>

          {/* Opportunity cards */}
          <div className="md:col-span-2 space-y-3">
            <div className="bg-[#111111] border-l-[3px] border-l-[#30d158] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#30d158] animate-pulse" />
                  <span className="text-[13px] font-medium text-white/90">Cobre &mdash; escasez global 2027-2028</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#30d158]/20 text-[#30d158]/80">Alta conviccion</span>
              </div>
              <p className="text-[13px] text-white/40 leading-[1.9] mb-2">BBVA Research y Bloomberg alertan: la demanda de cobre para EVs y renovables superara la oferta. Chile y Peru no pueden escalar produccion. El precio podria duplicarse en 3 anos.</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-white/25">Detectado hace 3 dias</span>
                <span className="text-white/10">&bull;</span>
                <span className="text-white/25">4 fuentes</span>
                <span className="text-white/10">&bull;</span>
                <span className="text-[#30d158]/80">No mainstream todavia</span>
              </div>
            </div>
            <div className="bg-[#111111] border-l-[3px] border-l-[#ffd60a] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffd60a] animate-pulse" />
                  <span className="text-[13px] font-medium text-white/90">India &mdash; rotacion de capital tras acuerdo China</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#ffd60a]/20 text-[#ffd60a]/80">Media conviccion</span>
              </div>
              <p className="text-[13px] text-white/40 leading-[1.9] mb-2">Los inversores rotan de India a China por el acuerdo. Si India corrige un 10-15%, podria ser punto de entrada historico para el mercado emergente de mayor crecimiento a largo plazo.</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-white/25">Detectado hace 1 dia</span>
                <span className="text-white/10">&bull;</span>
                <span className="text-white/25">2 fuentes</span>
                <span className="text-white/10">&bull;</span>
                <span className="text-[#ffd60a]/80">Emergente</span>
              </div>
            </div>
            <div className="bg-[#111111] border-l-[3px] border-l-[#bf5af2] border border-white/[0.06] rounded-2xl p-4 transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#bf5af2] animate-pulse" />
                  <span className="text-[13px] font-medium text-white/90">Nuclear &mdash; renacimiento por demanda IA</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border border-[#bf5af2]/20 text-[#bf5af2]/80">En observacion</span>
              </div>
              <p className="text-[13px] text-white/40 leading-[1.9] mb-2">Los centros de datos de IA necesitan energia limpia y estable. Microsoft, Google y Amazon firman acuerdos con plantas nucleares. ETFs de uranio suben +18% YTD. Tendencia incipiente.</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-white/25">Detectado hace 5 dias</span>
                <span className="text-white/10">&bull;</span>
                <span className="text-white/25">3 fuentes</span>
                <span className="text-white/10">&bull;</span>
                <span className="text-[#bf5af2]/80">Temprano</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <DiamondDivider />
      <footer className="py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-[11px] text-white/25">
          <span>FinPulse &mdash; Aprende mientras inviertes</span>
          <span>En desarrollo</span>
        </div>
      </footer>

      <style jsx global>{`
        .preview-dark-page { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      `}</style>
    </main>
  );
}
