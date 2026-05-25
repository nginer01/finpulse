"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AnimatedCounter from "@/components/AnimatedCounter";
import dynamic from "next/dynamic";
import { usePortfolioSnapshot } from "@/hooks/useMarketData";

const TradingChart = dynamic(() => import("@/components/TradingChart"), { ssr: false });

/* ══════════════════════════════════════════════
   HOOKS
   ══════════════════════════════════════════════ */

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" }) {
  const { ref, visible } = useReveal();
  const transforms: Record<string, string> = { up: "translate-y-10", left: "-translate-x-10", right: "translate-x-10", scale: "scale-95" };
  return (
    <div ref={ref} className={`transition-all duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "opacity-100 translate-y-0 translate-x-0 scale-100" : `opacity-0 ${transforms[direction]}`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>{children}</div>
  );
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-white/30 animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
          }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   CINEMATIC DIVIDER
   ══════════════════════════════════════════════ */
function CinematicDivider({ src, alt, children, variant = 0 }: { src: string; alt: string; children?: React.ReactNode; variant?: number }) {
  const kenBurnsClass = ["animate-ken-burns", "animate-ken-burns-2", "animate-ken-burns-3"][variant % 3];
  return (
    <section className="relative z-20 h-[65vh] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className={`w-full h-full will-change-transform ${kenBurnsClass}`}>
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Reveal>{children}</Reveal>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════
   ANIMATED STAT
   ══════════════════════════════════════════════ */
function AnimatedStat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const { ref, visible } = useReveal();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / 2000, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value]);
  return (
    <div ref={ref} className="text-center">
      <p className="text-6xl sm:text-7xl font-extralight tracking-tight text-[#1a1a1a]">{count}{suffix}</p>
      <p className="mt-4 text-[12px] uppercase tracking-[0.2em] text-[#999] font-semibold">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════ */

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

const NEWS_CARDS = [
  { title: "Acuerdo comercial EEUU-China: impacto en ETFs globales y tu posicion en MSCI World", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop&q=85", label: "Tu portfolio", source: "Financial Times" },
  { title: "Negociaciones Iran-EEUU avanzan: Brent cae 4% en la semana", image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=600&fit=crop&q=85", label: "Tu portfolio", source: "Reuters" },
  { title: "Nvidia presenta Blackwell Ultra: el mercado de semiconductores se reconfigura", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&q=85", label: "Nuevo", source: "Bloomberg" },
  { title: "India supera a China como mayor mercado emergente por flujo de capitales", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=85", label: "Nuevo", source: "The Daily Shot" },
  { title: "Regulacion IA en Europa: nuevo marco legal podria impactar al sector tech en 2027", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop&q=85", label: "Futuro", source: "Matt Levine" },
  { title: "Escasez global de cobre: la proxima crisis silenciosa para la transicion energetica", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop&q=85", label: "Futuro", source: "Informe BBVA" },
];

const DNA_BARS = [
  { label: "Disciplina", value: 78, color: "#1a1a1a" },
  { label: "Control emocional", value: 65, color: "#b8860b" },
  { label: "Diversificacion", value: 82, color: "#1a1a1a" },
  { label: "Timing", value: 54, color: "#c4001a" },
];

/* ══════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════ */
export default function PreviewLight() {
  const { data: snapshot } = usePortfolioSnapshot();

  const positions = Object.entries(HOLDINGS).map(([ticker, { qty, name }]) => {
    const quote = snapshot?.positions[ticker];
    const price = quote?.price || 0;
    const value = price * qty;
    const changePct = quote?.changePct || 0;
    return { ticker, name, value, changePct, price, qty };
  });

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const weightedChange = totalValue > 0
    ? positions.reduce((sum, p) => sum + (p.changePct * p.value / totalValue), 0)
    : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="bg-[#faf8f5] text-[#1a1a1a] overflow-x-hidden preview-light-page">

      {/* ─── SECTION 1: HERO WITH VIDEO ─── */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1920&h=1080&fit=crop&q=90"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
        <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
        <Particles />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center max-w-5xl mx-auto px-6">
            <Reveal>
              <p className="text-[12px] uppercase tracking-[0.5em] text-white/60 font-semibold mb-6">{dateStr} — {timeStr}</p>
            </Reveal>
            <Reveal delay={200}>
              <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-extralight text-white tracking-tight leading-[1.05]">Buenos dias, Nico</h1>
            </Reveal>
            <Reveal delay={500}>
              <p className="text-[16px] text-white/40 font-extralight tracking-[0.1em] mt-6">Tu resumen financiero personalizado</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: QUICK STATS ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Tu portfolio hoy</p>
              <p className="text-[4rem] font-extralight tracking-tight text-[#1a1a1a]">
                {totalValue > 0 ? formatEUR(totalValue) : "---"} <span className="text-[18px] text-[#ccc]">EUR</span>
              </p>
              <p className={`text-[16px] font-semibold mt-3 ${weightedChange >= 0 ? "text-[#1a1a1a]" : "text-[#c4001a]"}`}>
                {weightedChange >= 0 ? "+" : ""}{weightedChange.toFixed(2)}% hoy
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delay={100}>
              <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-3">Mejor posicion</p>
                <p className="text-[32px] font-extralight tracking-tight text-[#1a1a1a]">SEMI</p>
                <p className="text-[13px] text-[#1a1a1a] font-semibold mt-2">+4.2% esta semana</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-3">Sentimiento</p>
                <p className="text-[32px] font-extralight tracking-tight text-[#b8860b]">62<span className="text-[16px] text-[#ccc]">/100</span></p>
                <p className="text-[13px] text-[#999] mt-2">Optimismo moderado</p>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-3">Recomendacion IA</p>
                <p className="text-[32px] font-extralight tracking-tight text-[#1a1a1a]">Mantener</p>
                <p className="text-[13px] text-[#999] mt-2">Conviccion 7/10</p>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-semibold mb-3">Investor DNA</p>
                <p className="text-[32px] font-extralight tracking-tight text-[#1a1a1a]">Equilibrado</p>
                <p className="text-[13px] text-[#999] mt-2">Acierto: 68%</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CINEMATIC DIVIDER 1 ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1920&h=1080&fit=crop&q=90" alt="Markets" variant={0}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Cada manana</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Tu briefing diario</h2>
        </div>
      </CinematicDivider>

      {/* ─── SECTION 3: BRIEFING ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-start">
          {/* Left — Text */}
          <div>
            <Reveal>
              <p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-8 font-semibold">Lo que importa hoy</p>
            </Reveal>
            <Reveal delay={50}>
              <p className="text-[17px] text-[#555] leading-[2.2] tracking-wide mb-14">
                Macro de EEUU, Europa y Asia. Movimientos en renta variable y fija. Materias primas y divisas.
                Lo que dicen los analistas. Y los paralelos historicos que dan contexto a cada evento.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="space-y-9">
                {[
                  { n: "Contexto macro", d: "Decisiones de bancos centrales, datos de empleo, inflacion, PMI" },
                  { n: "Tu portfolio, posicion a posicion", d: "Que le afecta hoy a cada activo que tienes en cartera" },
                  { n: "Temas en movimiento", d: "Los hilos que el mercado sigue de cerca esta semana" },
                  { n: "Voces con criterio", d: "Lo que opinan las fuentes que tu seleccionas" },
                  { n: "Precedentes historicos", d: "Que ocurrio la ultima vez que se dieron condiciones similares" },
                ].map((item, i) => (
                  <div key={item.n} className="flex items-start gap-5 group cursor-default">
                    <span className="text-[12px] text-[#1a1a1a]/30 font-semibold mt-1 shrink-0 tabular-nums group-hover:text-[#1a1a1a]/80 transition-colors">0{i + 1}</span>
                    <div><p className="text-[14px] text-[#1a1a1a] font-semibold mb-1.5 tracking-wide group-hover:tracking-widest transition-all duration-500">{item.n}</p><p className="text-[13px] text-[#999] font-normal leading-[1.9]">{item.d}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — Card */}
          <Reveal delay={150} direction="right">
            <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_60px_rgba(0,0,0,0.08)] hover:border-[#1a1a1a]/25 transition-all duration-500">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] animate-pulse" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#1a1a1a] font-bold">Briefing listo</span>
                <span className="text-[11px] text-[#bbb] ml-auto font-semibold">8 min</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {["UBS On-Air", "Matt Levine", "Polymarket", "FT"].map((s) => (
                  <span key={s} className="text-[11px] px-3.5 py-1.5 rounded-full border border-[#e5e0db] text-[#666] font-semibold">{s}</span>
                ))}
              </div>
              <p className="text-[15px] font-semibold text-[#1a1a1a] mb-4 tracking-wide">Resumen ejecutivo</p>
              <p className="text-[13px] text-[#666] leading-[1.9] mb-6">Semana clave para los mercados. El acuerdo EEUU-China impulsa la renta variable. El Brent cae un 4.2% por negociaciones Iran-EEUU. El BCE mantiene tono dovish.</p>
              <div className="flex flex-wrap gap-2 mb-7">
                <span className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#1a1a1a]/8 text-[#1a1a1a] font-bold">S&P 500 maximos</span>
                <span className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#c4001a]/8 text-[#c4001a] font-bold">Brent -4.2%</span>
                <span className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#b8860b]/8 text-[#b8860b] font-bold">BCE dovish</span>
              </div>
              <div className="pt-5 border-t border-[#f0ede8]">
                {["Contexto macro global", "Impacto en tu portfolio", "Temas de seguimiento", "Lo que dicen tus fuentes", "Recomendaciones"].map((s) => (
                  <div key={s} className="flex items-center justify-between py-3 border-b border-[#f0ede8] last:border-0 group/r cursor-pointer hover:bg-[#faf8f5] -mx-4 px-4 rounded-lg transition-colors">
                    <span className="text-[14px] text-[#444] font-medium group-hover/r:text-[#1a1a1a]">{s}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#ddd] group-hover/r:text-[#1a1a1a] group-hover/r:translate-x-1 transition-all"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── CINEMATIC DIVIDER 2 ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&h=1080&fit=crop&q=90" alt="News" variant={1}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Profundiza</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Noticias seleccionadas para ti</h2>
        </div>
      </CinematicDivider>

      {/* ─── SECTION 4: NEWS CARDS ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEWS_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 120} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <div className="relative h-[360px] rounded-[20px] overflow-hidden group cursor-pointer transition-transform duration-500 hover:scale-105">
                  <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-2 font-semibold">{card.label} — {card.source}</p>
                    <p className="text-[15px] text-white/90 font-extralight leading-[1.6]">{card.title}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CINEMATIC DIVIDER 3 ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1920&h=1080&fit=crop&q=90" alt="Data" variant={2}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Datos en vivo</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Portfolio y mercados</h2>
        </div>
      </CinematicDivider>

      {/* ─── SECTION 5: PORTFOLIO + DNA ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-start">
          {/* Left — Portfolio card */}
          <Reveal direction="left">
            <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_60px_rgba(0,0,0,0.08)] hover:border-[#1a1a1a]/25 transition-all duration-500">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.35em] text-[#999] font-semibold">Portfolio total</span>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-pulse" /><span className="text-[11px] text-[#1a1a1a] font-bold">En vivo</span></div>
              </div>
              <p className="text-[32px] font-extralight text-[#1a1a1a] tracking-tight mb-1">
                {totalValue > 0 ? formatEUR(totalValue) : "---"} <span className="text-[14px] text-[#ccc] tracking-wide">EUR</span>
              </p>
              <p className={`text-[13px] font-semibold mb-6 ${weightedChange >= 0 ? "text-[#1a1a1a]" : "text-[#c4001a]"}`}>
                {weightedChange >= 0 ? "+" : ""}{weightedChange.toFixed(2)}% hoy
              </p>
              <div className="mb-4">
                <TradingChart />
              </div>
              <div className="mt-3">
                {positions.map((p) => (
                  <div key={p.ticker} className="flex items-center justify-between py-3.5 border-b border-[#f0ede8] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1a1a1a]/[0.07] flex items-center justify-center text-[11px] font-bold text-[#1a1a1a]">{p.ticker.slice(0, 2)}</div>
                      <div><p className="text-[14px] font-semibold text-[#1a1a1a]">{p.ticker}</p><p className="text-[12px] text-[#999]">{p.name}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold text-[#1a1a1a]">{formatEUR(p.value)}</p>
                      <p className={`text-[12px] font-bold ${p.changePct >= 0 ? "text-[#1a1a1a]" : "text-[#c4001a]"}`}>{p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right — Investor DNA + Learning */}
          <Reveal delay={150} direction="right">
            <div className="space-y-8">
              <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_60px_rgba(0,0,0,0.08)] hover:border-[#1a1a1a]/25 transition-all duration-500">
                <p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Tu Investor DNA</p>
                <p className="text-[13px] text-[#999] mt-1.5 mb-8">Perfil psicologico como inversor</p>
                <div className="space-y-5">
                  {DNA_BARS.map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-[13px] mb-2">
                        <span className="text-[#777]">{bar.label}</span>
                        <span className="text-[#1a1a1a] font-bold">{bar.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#f0ede8] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-[2s] ease-out animate-bar-fill" style={{ "--bar-width": `${bar.value}%`, backgroundColor: bar.color } as React.CSSProperties} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[#999] mt-6">Tendencia: mejorando en disciplina, trabajar en timing de entrada.</p>
              </div>

              <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_60px_rgba(0,0,0,0.08)] hover:border-[#1a1a1a]/25 transition-all duration-500">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#1a1a1a]/50 font-semibold mb-4">Ultima leccion aprendida</p>
                <div className="bg-[#faf8f5] rounded-[16px] p-4 border border-[#e5e0db]">
                  <p className="text-[12px] text-[#1a1a1a]/50 mb-2">Hace 3 dias — Venta de BRT</p>
                  <p className="text-[17px] text-[#555] leading-[2.2] tracking-wide">
                    Vendiste parte de Brent tras caida del 2%. Resultado: siguio cayendo un 1.8% adicional.
                    <span className="text-[#1a1a1a] font-medium"> Buena decision.</span> Senal clave que detectaste: volumen de venta institucional inusualmente alto.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SECTION 6: STATS ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-28">
        <div className="max-w-[900px] mx-auto px-6 grid grid-cols-3 gap-8">
          <AnimatedStat value={12} suffix="+" label="Fuentes integradas" />
          <AnimatedStat value={365} suffix="" label="Briefings al ano" />
          <AnimatedStat value={98} suffix="%" label="Cobertura global" />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 bg-[#faf8f5] py-20">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-14 h-[1px] bg-[#e5e0db]" />
            <div className="w-2 h-2 rotate-45 border border-[#e5e0db]" />
            <div className="w-14 h-[1px] bg-[#e5e0db]" />
          </div>
          <div className="text-center">
            <p className="text-[14px] tracking-[0.35em] uppercase text-[#1a1a1a]/70 font-semibold">FinPulse</p>
            <p className="text-[12px] text-[#ccc] mt-2 tracking-wide">Inteligencia financiera personal</p>
          </div>
        </div>
      </footer>

      {/* ─── STYLES ─── */}
      <style jsx global>{`
        .preview-light-page {
          font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Ken Burns variants */
        @keyframes ken-burns {
          0%   { transform: scale(1) translate(0, 0); }
          50%  { transform: scale(1.15) translate(-2%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes ken-burns-2 {
          0%   { transform: scale(1.1) translate(-1%, 0); }
          50%  { transform: scale(1) translate(1%, -2%); }
          100% { transform: scale(1.1) translate(-1%, 0); }
        }
        @keyframes ken-burns-3 {
          0%   { transform: scale(1) translate(1%, 1%); }
          50%  { transform: scale(1.12) translate(-1%, 0); }
          100% { transform: scale(1) translate(1%, 1%); }
        }
        .animate-ken-burns   { animation: ken-burns 20s ease-in-out infinite; }
        .animate-ken-burns-2 { animation: ken-burns-2 25s ease-in-out infinite; }
        .animate-ken-burns-3 { animation: ken-burns-3 22s ease-in-out infinite; }

        /* Floating particles */
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          50% { transform: translate(30px, -60px); opacity: 0.3; }
        }
        .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }

        /* Film grain */
        .film-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 128px 128px;
        }

        /* Bar fill */
        @keyframes bar-fill {
          0% { width: 0; }
          100% { width: var(--bar-width); }
        }
        .animate-bar-fill { animation: bar-fill 1.5s ease-out forwards; width: 0; }
      `}</style>
    </main>
  );
}
