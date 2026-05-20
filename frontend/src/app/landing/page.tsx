"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────
   HOOKS
   ────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-[1.4s] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>{children}</div>
  );
}

function useScrollFade() {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(window.scrollY / (window.innerHeight * 0.65), 1);
      setOpacity(1 - p);
      setScale(1 + p * 0.1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { opacity, scale };
}

/* Parallax image that moves slower than scroll */
function ParallaxImage({ src, alt, className = "", speed = 0.15 }: { src: string; alt: string; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight * 0.5) * speed;
      ref.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={ref} className="w-full h-full will-change-transform">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function useTilt(intensity = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * intensity}deg) rotateX(${-((e.clientY - r.top) / r.height - 0.5) * intensity}deg) scale(1.01)`;
  }, [intensity]);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0) scale(1)"; }, []);
  return { ref, onMove, onLeave };
}

/* ──────────────────────────────────────────────
   BORDERCARD
   ────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const svgRef = useRef<SVGRectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const update = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const p = 2 * (containerRef.current.getBoundingClientRect().width + containerRef.current.getBoundingClientRect().height);
    svgRef.current.setAttribute("stroke-dasharray", `${p}`);
    svgRef.current.setAttribute("stroke-dashoffset", `${p}`);
    svgRef.current.dataset.perimeter = `${p}`;
  }, []);
  useEffect(() => { update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); }, [update]);
  return (
    <div ref={containerRef} className={`relative group ${className}`}
      onMouseEnter={() => { if (svgRef.current) svgRef.current.style.strokeDashoffset = "0"; }}
      onMouseLeave={() => { if (svgRef.current) svgRef.current.style.strokeDashoffset = svgRef.current.dataset.perimeter || "0"; }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ borderRadius: "inherit" }}>
        <rect ref={svgRef} x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="20" ry="20"
          fill="none" stroke="rgba(26,26,26,0.35)" strokeWidth="1.5" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </svg>
      <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8 relative z-0 transition-all duration-500 group-hover:border-[#1a1a1a]/25 group-hover:shadow-[0_8px_60px_rgba(0,0,0,0.08)] shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ANIMATED STAT
   ────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   MINI UI
   ────────────────────────────────────────────── */
function Pos({ ticker, name, change, value }: { ticker: string; name: string; change: number; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#f0ede8] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1a1a1a]/[0.07] flex items-center justify-center text-[11px] font-bold text-[#1a1a1a]">{ticker.slice(0, 2)}</div>
        <div><p className="text-[14px] font-semibold text-[#1a1a1a]">{ticker}</p><p className="text-[12px] text-[#999]">{name}</p></div>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-semibold text-[#1a1a1a]">{value}</p>
        <p className={`text-[12px] font-bold ${change >= 0 ? "text-[#1a1a1a]" : "text-[#c4001a]"}`}>{change >= 0 ? "+" : ""}{change}%</p>
      </div>
    </div>
  );
}

function Gauge({ label, drop, color }: { label: string; drop: number; color: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#f0ede8" strokeWidth="3.5" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="3.5"
            strokeDasharray={visible ? `${213.6 * (Math.abs(drop) / 100)} 213.6` : "0 213.6"}
            strokeLinecap="round" className="transition-all duration-[2s] ease-out" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold" style={{ color }}>{drop > 0 ? "+" : ""}{drop}%</span>
      </div>
      <p className="text-[10px] text-[#888] uppercase tracking-wider font-bold">{label}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CINEMATIC IMAGE DIVIDER
   ────────────────────────────────────────────── */
function CinematicDivider({ src, alt, children }: { src: string; alt: string; children?: React.ReactNode }) {
  return (
    <section className="relative z-20 h-[65vh] sm:h-[75vh] overflow-hidden">
      <ParallaxImage src={src} alt={alt} className="absolute inset-0 h-full" speed={0.12} />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-transparent to-transparent opacity-80" />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Reveal>{children}</Reveal>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
export default function LandingPage() {
  const { opacity: heroOp, scale: heroSc } = useScrollFade();
  const [scrolled, setScrolled] = useState(false);
  const t1 = useTilt(5);
  const t2 = useTilt(5);
  const t3 = useTilt(4);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <main className="bg-[#faf8f5] text-[#1a1a1a] overflow-x-hidden selection:bg-[#1a1a1a]/15 landing-page">

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-transparent"}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 sm:px-12 py-5">
          <p className={`text-[16px] tracking-[0.25em] uppercase font-semibold transition-colors duration-700 ${scrolled ? "text-[#1a1a1a]" : "text-white"}`}>FinPulse</p>
          <div className="hidden md:flex items-center gap-10">
            {["Briefing", "Portfolio", "Inteligencia", "Resiliencia"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className={`text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-700 ${scrolled ? "text-[#999] hover:text-[#1a1a1a]" : "text-white/60 hover:text-white"}`}>{l}</a>
            ))}
          </div>
          <Link href="/" className={`text-[11px] uppercase tracking-[0.2em] font-semibold px-6 py-2.5 border transition-all duration-700 ${scrolled ? "text-[#1a1a1a] border-[#1a1a1a]/30 hover:bg-[#1a1a1a] hover:text-white" : "text-white border-white/30 hover:bg-white hover:text-[#1a1a1a]"}`}>
            Entrar
          </Link>
        </div>
      </nav>

      {/* ─── HERO — IMAGE THAT FADES ON SCROLL ─── */}
      <section className="relative h-[120vh]">
        <div className="fixed inset-0 z-0 will-change-transform" style={{ opacity: heroOp, transform: `scale(${heroSc})` }}>
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&q=90" alt="Skyline" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/60" />
        </div>
        <div className="sticky top-0 h-screen flex items-center justify-center z-10" style={{ opacity: heroOp }}>
          <div className="text-center max-w-5xl mx-auto px-6">
            <Reveal><p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-8 font-semibold">FinPulse presenta</p></Reveal>
            <Reveal delay={200}><h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-extralight leading-[0.95] tracking-tight text-white">Inteligencia<br />financiera</h1></Reveal>
            <Reveal delay={500}>
              <Link href="/" className="inline-block mt-12 text-[12px] uppercase tracking-[0.3em] text-white/80 border border-white/30 backdrop-blur-sm bg-white/[0.06] px-10 py-4 hover:bg-white hover:text-[#1a1a1a] transition-all duration-500 font-semibold">
                Descubrir
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ opacity: heroOp }}>
          <div className="w-[1px] h-14 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-4 bg-white/60 animate-scroll-line" />
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY ─── */}
      <section className="relative z-20 bg-[#faf8f5] pt-40 pb-28 sm:pt-52 sm:pb-36">
        <div className="max-w-[750px] mx-auto px-6 text-center">
          <Reveal><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-12 font-semibold">La filosofía</p></Reveal>
          <Reveal delay={100}>
            <h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight leading-[1.3] tracking-tight text-[#1a1a1a]">
              Los mercados no esperan.<span className="text-[#999]"> Tu información tampoco debería.</span>
            </h2>
          </Reveal>
          <Reveal delay={250}><div className="flex items-center justify-center gap-3 my-16"><div className="w-14 h-[1px] bg-[#1a1a1a]/20" /><div className="w-2 h-2 rounded-full border border-[#1a1a1a]/25" /><div className="w-14 h-[1px] bg-[#1a1a1a]/20" /></div></Reveal>
          <Reveal delay={350}>
            <p className="text-[15px] text-[#666] leading-[2.1] font-normal tracking-wide">
              Macro global, renta variable, materias primas, renta fija, divisas — cada mañana, un briefing con la profundidad de un estratega institucional,
              adaptado a <span className="text-[#1a1a1a]">tu</span> portfolio y a las fuentes que tú elijas.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── IMAGE 1 — CINEMATIC DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1920&h=1080&fit=crop&q=90" alt="Morning light">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Cada mañana</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Tu briefing diario</h2>
        </div>
      </CinematicDivider>

      {/* ─── BRIEFING CONTENT ─── */}
      <section id="briefing" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-start">
          <div>
            <Reveal>
              <p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-8 font-semibold">Lo que importa hoy</p>
            </Reveal>
            <Reveal delay={50}>
              <p className="text-[15px] text-[#666] leading-[2.1] font-normal tracking-wide mb-14">
                Macro de EEUU, Europa y Asia. Movimientos en renta variable y fija. Materias primas y divisas.
                Lo que dicen los analistas. Y los paralelos históricos que dan contexto a cada evento.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="space-y-9">
                {[
                  { n: "Contexto macro", d: "Decisiones de bancos centrales, datos de empleo, inflación, PMI" },
                  { n: "Tu portfolio, posición a posición", d: "Qué le afecta hoy a cada activo que tienes en cartera" },
                  { n: "Temas en movimiento", d: "Los hilos que el mercado sigue de cerca esta semana" },
                  { n: "Voces con criterio", d: "Lo que opinan las fuentes que tú seleccionas" },
                  { n: "Precedentes históricos", d: "Qué ocurrió la última vez que se dieron condiciones similares" },
                ].map((item, i) => (
                  <div key={item.n} className="flex items-start gap-5 group">
                    <span className="text-[12px] text-[#1a1a1a]/30 font-semibold mt-1 shrink-0 tabular-nums group-hover:text-[#1a1a1a]/80 transition-colors">0{i + 1}</span>
                    <div><p className="text-[14px] text-[#1a1a1a] font-semibold mb-1.5 tracking-wide">{item.n}</p><p className="text-[13px] text-[#999] font-normal leading-[1.9]">{item.d}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div ref={t1.ref} onMouseMove={t1.onMove} onMouseLeave={t1.onLeave} className="transition-transform duration-300 ease-out will-change-transform">
              <Card>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] animate-pulse" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#1a1a1a] font-bold">Briefing listo</span>
                  <span className="text-[11px] text-[#bbb] ml-auto font-semibold">8 min</span>
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
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── IMAGE 2 — PORTFOLIO DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1920&h=1080&fit=crop&q=90" alt="Financial skyline">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Datos en vivo</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Tu portfolio, en tiempo real</h2>
        </div>
      </CinematicDivider>

      {/* ─── PORTFOLIO CONTENT ─── */}
      <section id="portfolio" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-start">
          <Reveal>
            <div ref={t2.ref} onMouseMove={t2.onMove} onMouseLeave={t2.onLeave} className="transition-transform duration-300 ease-out will-change-transform">
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.35em] text-[#999] font-semibold">Portfolio total</span>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-pulse" /><span className="text-[11px] text-[#1a1a1a] font-bold">En vivo</span></div>
                </div>
                <p className="text-[32px] font-extralight text-[#1a1a1a] tracking-tight">12.847,32 <span className="text-[14px] text-[#ccc] tracking-wide">EUR</span></p>
                <p className="text-[13px] text-[#1a1a1a] font-semibold mb-6">+2.4% esta semana</p>
                <svg viewBox="0 0 300 60" className="w-full h-16 mb-3" preserveAspectRatio="none">
                  <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.18" /><stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" /></linearGradient></defs>
                  <polygon points="0,55 20,50 40,52 60,45 80,40 100,42 120,35 140,30 160,32 180,28 200,25 220,20 240,22 260,18 280,15 300,12 300,60 0,60" fill="url(#cg)" />
                  <polyline points="0,55 20,50 40,52 60,45 80,40 100,42 120,35 140,30 160,32 180,28 200,25 220,20 240,22 260,18 280,15 300,12" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                </svg>
                <Pos ticker="IWDA" name="iShares MSCI World" change={1.8} value="4.230,00" />
                <Pos ticker="VUAA" name="Vanguard S&P 500" change={2.1} value="3.150,00" />
                <Pos ticker="BRT" name="Brent Crude Oil" change={-3.8} value="1.200,00" />
                <Pos ticker="EUNA" name="iShares Euro Gov Bond" change={0.5} value="2.400,00" />
                <Pos ticker="SEMI" name="VanEck Semiconductor" change={4.2} value="1.867,32" />
              </Card>
            </div>
          </Reveal>
          <div>
            <Reveal><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-8 font-semibold">Mercado global</p></Reveal>
            <Reveal delay={50}><p className="text-[15px] text-[#666] leading-[2.1] font-normal tracking-wide mb-12">Acciones, ETFs, materias primas, índices y divisas. Velas japonesas, heatmap y distribución por sector. Todo lo que sigues, en un solo lugar.</p></Reveal>
            <Reveal delay={100}>
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[{ n: "S&P 500", v: "7.375", c: -0.37 }, { n: "VIX", v: "18.07", c: 1.40 }, { n: "Brent", v: "$111", c: -0.67 }, { n: "EUR/USD", v: "1.161", c: -0.44 }, { n: "Gold", v: "$4.502", c: -1.21 }, { n: "US 10Y", v: "4.66%", c: 0.87 }].map((idx) => (
                  <Card key={idx.n}>
                    <p className="text-[10px] text-[#999] mb-2 font-bold uppercase tracking-wider">{idx.n}</p>
                    <p className="text-[16px] font-semibold text-[#1a1a1a]">{idx.v}</p>
                    <p className={`text-[12px] font-bold ${idx.c < 0 ? "text-[#c4001a]" : "text-[#1a1a1a]"}`}>{idx.c >= 0 ? "+" : ""}{idx.c}%</p>
                  </Card>
                ))}
              </div>
            </Reveal>
            <Reveal delay={200}><p className="text-[15px] text-[#666] leading-[2.1] font-normal tracking-wide">Rendimiento contra benchmarks. Y el camino no tomado — las oportunidades que dejaste pasar.</p></Reveal>
          </div>
        </div>
      </section>

      {/* ─── SOURCES SECTION ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6">
          <Reveal><div className="text-center mb-20"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Tus fuentes</p><h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]">Newsletters, analistas, mercados de predicción. <span className="text-[#999]">Todo sintetizado.</span></h2></div></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal>
              <div className="relative h-[360px] rounded-[20px] overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&h=600&fit=crop&q=85" alt="Newsletters" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-2 font-semibold">Newsletters</p>
                  <p className="text-[15px] text-white/90 font-extralight leading-[1.6]">Matt Levine, UBS On-Air, FT Alphaville, BBVA Research — leídas y resumidas antes de que abras el email.</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="relative h-[360px] rounded-[20px] overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=85" alt="Markets" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-2 font-semibold">Mercados</p>
                  <p className="text-[15px] text-white/90 font-extralight leading-[1.6]">Renta variable, fija, materias primas, divisas y volatilidad — los datos que mueven tu portfolio.</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="relative h-[360px] rounded-[20px] overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&q=85" alt="Predictions" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-2 font-semibold">Predicciones</p>
                  <p className="text-[15px] text-white/90 font-extralight leading-[1.6]">Probabilidades de Polymarket integradas en cada tema relevante — del BCE a los aranceles.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── IMAGE 4 — INTELLIGENCE DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1920&h=1080&fit=crop&q=90" alt="Stock analysis">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">IA con criterio</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Recomendaciones fundamentadas</h2>
        </div>
      </CinematicDivider>

      {/* ─── INTELLIGENCE CONTENT ─── */}
      <section id="inteligencia" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6">
          <Reveal><div className="text-center mb-20"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Análisis</p><h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]">Ideas con fundamento, <span className="text-[#999]">no con ruido</span></h2></div></Reveal>
        </div>
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal>
            <Card>
              <div className="flex items-center justify-between mb-7">
                <span className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Recomendaciones activas</span>
                <span className="text-[11px] text-[#1a1a1a] font-semibold bg-[#1a1a1a]/8 px-4 py-1.5 rounded-full">78% acierto</span>
              </div>
              <div className="space-y-4 mb-7">
                <div className="rounded-2xl border border-[#c4001a]/12 bg-[#c4001a]/[0.02] p-5">
                  <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Reducir Brent un 50%</span><span className="text-[11px] px-3 py-1 rounded-full bg-[#faf8f5] text-[#555] font-semibold">8/10</span></div>
                  <p className="text-[13px] text-[#666] leading-[1.8]">Paralelo 2015: Iran puede anadir 1.5M bbl/dia. Polymarket 58% probabilidad de acuerdo.</p>
                </div>
                <div className="rounded-2xl border border-[#1a1a1a]/12 bg-[#1a1a1a]/[0.02] p-5">
                  <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Anadir SEMI en caidas (&gt;2%)</span><span className="text-[11px] px-3 py-1 rounded-full bg-[#faf8f5] text-[#555] font-semibold">7/10</span></div>
                  <p className="text-[13px] text-[#666] leading-[1.8]">Ciclo expansivo 12-18 meses. Nvidia Blackwell Ultra. TSMC capex +15%.</p>
                </div>
              </div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-[0.2em] mb-4">Fuentes consultadas</p>
              <div className="space-y-4 pt-4 border-t border-[#f0ede8]">
                {[
                  { n: "UBS On-Air", q: "La inflacion europea esta contenida. El BCE tiene via libre para recortar en junio." },
                  { n: "Matt Levine", q: "Es un framework, no un acuerdo final. Los aranceles tech se negociaran en Q3." },
                  { n: "Polymarket", q: "Recorte BCE junio: 73% (+8pp). Acuerdo Iran-EEUU: 58% (+15pp)." },
                ].map((s) => (
                  <div key={s.n} className="border-l-[3px] border-[#1a1a1a]/20 pl-4">
                    <span className="text-[12px] text-[#1a1a1a] font-semibold tracking-wide">{s.n}</span>
                    <p className="text-[13px] text-[#777] italic mt-1 leading-[1.7]">&ldquo;{s.q}&rdquo;</p>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={100}>
            <div ref={t3.ref} onMouseMove={t3.onMove} onMouseLeave={t3.onLeave} className="transition-transform duration-300 ease-out will-change-transform h-full">
              <Card className="h-full">
                <p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Tu Investor DNA</p>
                <p className="text-[13px] text-[#999] mt-1.5 mb-8">Perfil psicológico como inversor</p>
                <div className="flex justify-center mb-10">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    <polygon points="100,15 185,55 185,145 100,185 15,145 15,55" fill="none" stroke="#eee" strokeWidth="1" />
                    <polygon points="100,45 160,70 160,130 100,155 40,130 40,70" fill="none" stroke="#f0ede8" strokeWidth="1" />
                    <polygon points="100,75 135,85 135,115 100,125 65,115 65,85" fill="none" stroke="#f5f2ed" strokeWidth="1" />
                    <polygon points="100,22 175,58 170,140 100,172 28,130 35,58" fill="rgba(26,26,26,0.05)" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
                    <circle cx="100" cy="22" r="3.5" fill="#1a1a1a" /><circle cx="175" cy="58" r="3.5" fill="#1a1a1a" /><circle cx="170" cy="140" r="3.5" fill="#1a1a1a" /><circle cx="100" cy="172" r="3.5" fill="#1a1a1a" /><circle cx="28" cy="130" r="3.5" fill="#1a1a1a" /><circle cx="35" cy="58" r="3.5" fill="#1a1a1a" />
                  </svg>
                </div>
                <div className="space-y-5">
                  {[{ l: "Disciplina", v: 78, c: "#1a1a1a" }, { l: "Control emocional", v: 65, c: "#b8860b" }, { l: "Diversificacion", v: 82, c: "#1a1a1a" }, { l: "Timing", v: 54, c: "#c4001a" }].map((t) => (
                    <div key={t.l}><div className="flex justify-between text-[13px] mb-2"><span className="text-[#777]">{t.l}</span><span className="text-[#1a1a1a] font-bold">{t.v}%</span></div><div className="h-2 rounded-full bg-[#f0ede8] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${t.v}%`, backgroundColor: t.c }} /></div></div>
                  ))}
                </div>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── IMAGE 5 — STRESS TEST DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1613442301025-2d930f1cc9dc?w=1920&h=1080&fit=crop&q=90" alt="Market crash">
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Resiliencia</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">¿Y si se repite 2008?</h2>
        </div>
      </CinematicDivider>

      {/* ─── STRESS + COMPARADOR ─── */}
      <section id="resilience" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 mb-20">
          <Reveal><div className="text-center"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Escenarios</p><h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]">¿Qué pasaría si <span className="text-[#999]">vuelve a ocurrir?</span></h2></div></Reveal>
        </div>
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal>
            <Card>
              <div className="flex items-center justify-between mb-8">
                <div><p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Stress Test</p><p className="text-[13px] text-[#999] mt-1.5">Crisis financiera 2008</p></div>
                <div className="text-right"><p className="text-2xl font-light text-[#c4001a]">-55.6%</p><p className="text-[12px] text-[#999]">12.847 → 5.652</p></div>
              </div>
              <div className="grid grid-cols-5 gap-3 mb-8"><Gauge label="IWDA" drop={-52} color="#c4001a" /><Gauge label="VUAA" drop={-56} color="#c4001a" /><Gauge label="BRT" drop={-68} color="#c4001a" /><Gauge label="EUNA" drop={8} color="#1a1a1a" /><Gauge label="SEMI" drop={-62} color="#c4001a" /></div>
              <div className="flex gap-2">
                {["2008", "COVID", "Dot-com", "2022"].map((s, i) => (
                  <button key={s} className={`text-[12px] px-5 py-2.5 rounded-xl border font-bold transition-all ${i === 0 ? "border-[#1a1a1a]/20 text-[#1a1a1a] bg-[#1a1a1a]/6" : "border-[#e5e0db] text-[#bbb] hover:text-[#888]"}`}>{s}</button>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={100}>
            <Card>
              <p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Comparador</p>
              <p className="text-[13px] text-[#999] mt-1.5 mb-6">VUAA vs IWDA — 6 meses</p>
              <svg viewBox="0 0 300 100" className="w-full h-28 mb-6" preserveAspectRatio="none">
                <polyline points="0,80 30,75 60,78 90,65 120,55 150,50 180,45 210,40 240,35 270,30 300,25" fill="none" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.2" />
                <polyline points="0,80 30,70 60,76 90,55 120,42 150,48 180,35 210,25 240,30 270,20 300,15" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              </svg>
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-[#1a1a1a]/20 rounded" /><span className="text-[12px] text-[#888] font-semibold">IWDA +10.2%</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-[#1a1a1a] rounded" /><span className="text-[12px] text-[#1a1a1a] font-semibold">VUAA +12.3%</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ l: "Volatilidad", a: "12.8%", b: "14.2%" }, { l: "Sharpe", a: "1.1", b: "1.2" }, { l: "Max Drawdown", a: "-7.1%", b: "-8.3%" }, { l: "Correlacion", a: "", b: "0.94" }].map((m) => (
                  <div key={m.l} className="bg-[#faf8f5] rounded-xl p-3.5">
                    <p className="text-[10px] text-[#aaa] mb-2 font-bold uppercase tracking-wider">{m.l}</p>
                    {m.a ? <div className="flex justify-between text-[14px] text-[#1a1a1a] font-semibold"><span>{m.a}</span><span>{m.b}</span></div> : <span className="text-[14px] text-[#1a1a1a] font-semibold">{m.b}</span>}
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ─── IMAGE 6 — APRENDIZAJE ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop&q=90" alt="Learning">
        <div className="text-center max-w-2xl px-6">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Aprendizaje continuo</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight mb-6">Cada operacion te hace mejor inversor</h2>
          <p className="text-[15px] text-white/55 font-normal leading-[1.8]">Decision Journal. Sesgos cognitivos detectados. Escenarios alternativos. Signal vs Noise Score. El camino no tomado.</p>
        </div>
      </CinematicDivider>

      {/* ─── 16 HERRAMIENTAS ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-36 sm:py-44">
        <div className="max-w-[1140px] mx-auto px-6">
          <Reveal><div className="text-center mb-24"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Todo en un lugar</p><h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]">Las herramientas <span className="text-[#999]">que necesitas</span></h2></div></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e5e0db]/60">
            {["Dashboard", "Briefing diario", "Portfolio", "Recomendaciones IA", "Investor DNA", "Stress Test", "Comparador", "Decision Journal", "Radar oportunidades", "Deep-dive noticias", "Review semanal", "Chat IA", "Signal vs Noise", "Camino no tomado", "Configuración", "Onboarding"].map((name, i) => (
              <Reveal key={name} delay={i * 25}>
                <div className="bg-[#faf8f5] p-8 sm:p-10 transition-all duration-700 hover:bg-white group cursor-default">
                  <span className="text-[11px] text-[#1a1a1a]/25 tabular-nums font-semibold group-hover:text-[#1a1a1a]/70 transition-colors duration-500">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[13px] text-[#555] mt-3 font-semibold tracking-wide group-hover:text-[#1a1a1a] transition-colors duration-500">{name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-20 overflow-hidden">
        <div className="relative h-[80vh] sm:h-[85vh]">
          <ParallaxImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop&q=90" alt="City at night" className="absolute inset-0 h-full" speed={0.08} />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="max-w-[700px] mx-auto px-6 text-center">
              <Reveal><p className="text-[12px] uppercase tracking-[0.5em] text-white/50 mb-10 font-semibold">Tu momento</p></Reveal>
              <Reveal delay={100}><h2 className="text-4xl sm:text-5xl md:text-[4.5rem] font-extralight text-white tracking-tight leading-[1.05] mb-8">Tu ventaja empieza aquí</h2></Reveal>
              <Reveal delay={250}><p className="text-[15px] text-white/45 font-normal leading-[2] mb-16 max-w-md mx-auto tracking-wide">Para inversores que toman sus propias decisiones.</p></Reveal>
              <Reveal delay={400}><Link href="/" className="inline-block text-[12px] uppercase tracking-[0.3em] text-white border border-white/30 px-14 py-5 hover:bg-white hover:text-[#1a1a1a] transition-all duration-500 font-semibold backdrop-blur-sm bg-white/[0.04]">Comenzar ahora</Link></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 bg-[#faf8f5] py-20">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-12"><div className="w-14 h-[1px] bg-[#e5e0db]" /><div className="w-2 h-2 rounded-full border border-[#e5e0db]" /><div className="w-14 h-[1px] bg-[#e5e0db]" /></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left"><p className="text-[14px] tracking-[0.35em] uppercase text-[#1a1a1a]/70 font-semibold">FinPulse</p><p className="text-[12px] text-[#ccc] mt-2 tracking-wide">Inteligencia financiera personal</p></div>
            <div className="flex items-center gap-10">{["Briefing", "Portfolio", "Inteligencia", "Resiliencia"].map((l) => (<a key={l} href={`#${l.toLowerCase()}`} className="text-[11px] text-[#ccc] hover:text-[#1a1a1a] transition-colors duration-500 uppercase tracking-[0.2em] font-semibold">{l}</a>))}</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .landing-page { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes scroll-line { 0% { transform: translateY(-100%); } 100% { transform: translateY(300%); } }
        .animate-scroll-line { animation: scroll-line 2s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
