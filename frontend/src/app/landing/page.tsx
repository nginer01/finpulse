"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

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

function useScrollFade() {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(window.scrollY / (window.innerHeight * 0.65), 1);
      setOpacity(1 - p);
      setScale(1 + p * 0.15);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { opacity, scale };
}

/* Scroll-linked progress for a section */
function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, 1 - rect.bottom / (window.innerHeight + rect.height)));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { ref, progress };
}

/* Parallax image with Ken Burns */
function ParallaxImage({ src, alt, className = "", speed = 0.15, kenBurns = false }: { src: string; alt: string; className?: string; speed?: number; kenBurns?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (kenBurns) return; // ken burns is pure CSS
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight * 0.5) * speed;
      ref.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed, kenBurns]);
  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={ref} className={`w-full h-full will-change-transform ${kenBurns ? "animate-ken-burns" : ""}`}>
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

/* Magnetic button — follows cursor slightly */
function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    ref.current.style.transform = `translate(${(e.clientX - cx) * strength}px, ${(e.clientY - cy) * strength}px)`;
  }, [strength]);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = "translate(0,0)"; }, []);
  return { ref, onMove, onLeave };
}

/* Word-by-word reveal on scroll */
function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleWords, setVisibleWords] = useState(0);
  const words = text.split(" ");
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const start = window.innerHeight * 1.1;
      const end = window.innerHeight * 0.55;
      const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setVisibleWords(Math.floor(p * words.length));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [words.length]);
  return (
    <div ref={containerRef} className={className}>
      {words.map((w, i) => (
        <span key={i} className={`inline-block mr-[0.3em] transition-all duration-500 ${i < visibleWords ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-2 blur-[2px]"}`}>{w}</span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   BORDERCARD
   ══════════════════════════════════════════════ */
function Card({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  const svgRef = useRef<SVGRectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const update = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const p = 2 * (containerRef.current.getBoundingClientRect().width + containerRef.current.getBoundingClientRect().height);
    svgRef.current.setAttribute("stroke-dasharray", `${p}`);
    svgRef.current.setAttribute("stroke-dashoffset", `${p}`);
    svgRef.current.dataset.perimeter = `${p}`;
  }, []);
  useEffect(() => { update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); }, [update]);
  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !glow) return;
    const r = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, [glow]);
  return (
    <div ref={containerRef} className={`relative group ${className}`}
      onMouseMove={(e) => { handleMove(e); if (svgRef.current) svgRef.current.style.strokeDashoffset = "0"; }}
      onMouseEnter={() => { if (svgRef.current) svgRef.current.style.strokeDashoffset = "0"; }}
      onMouseLeave={() => { if (svgRef.current) svgRef.current.style.strokeDashoffset = svgRef.current.dataset.perimeter || "0"; }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ borderRadius: "inherit" }}>
        <rect ref={svgRef} x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="20" ry="20"
          fill="none" stroke="rgba(26,26,26,0.35)" strokeWidth="1.5" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </svg>
      {glow && <div className="absolute pointer-events-none z-[5] w-[300px] h-[300px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[80px] bg-[#1a1a1a]/[0.04]" style={{ left: mousePos.x - 150, top: mousePos.y - 150 }} />}
      <div className="bg-white rounded-[20px] border border-[#e5e0db] p-8 relative z-0 transition-all duration-500 group-hover:border-[#1a1a1a]/25 group-hover:shadow-[0_8px_60px_rgba(0,0,0,0.08)] shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </div>
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
   MARQUEE TICKER
   ══════════════════════════════════════════════ */
function MarqueeTicker() {
  const items = [
    { t: "S&P 500", v: "5,842", c: +0.87 }, { t: "NASDAQ", v: "18,453", c: +1.24 },
    { t: "STOXX 600", v: "528", c: +0.33 }, { t: "IBEX 35", v: "11,892", c: -0.15 },
    { t: "DAX", v: "18,756", c: +0.62 }, { t: "Nikkei", v: "38,487", c: -0.41 },
    { t: "VIX", v: "18.07", c: +1.40 }, { t: "Brent", v: "$82.45", c: -2.31 },
    { t: "Gold", v: "$2,348", c: +0.55 }, { t: "EUR/USD", v: "1.0876", c: -0.12 },
    { t: "US 10Y", v: "4.42%", c: +0.08 }, { t: "BTC", v: "$67,234", c: +3.12 },
  ];
  const row = items.map((d, i) => (
    <span key={i} className="inline-flex items-center gap-2 mx-6 shrink-0">
      <span className="text-[11px] text-[#999] font-semibold uppercase tracking-wider">{d.t}</span>
      <span className="text-[12px] text-[#1a1a1a] font-bold">{d.v}</span>
      <span className={`text-[11px] font-bold ${d.c >= 0 ? "text-[#1a1a1a]" : "text-[#c4001a]"}`}>{d.c >= 0 ? "+" : ""}{d.c}%</span>
    </span>
  ));
  return (
    <div className="relative z-20 bg-[#faf8f5] border-y border-[#e5e0db]/60 overflow-hidden py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {row}{row}{row}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MINI UI
   ══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   CINEMATIC DIVIDER — Ken Burns + grain
   ══════════════════════════════════════════════ */
function CinematicDivider({ src, alt, children, variant = 0 }: { src: string; alt: string; children?: React.ReactNode; variant?: number }) {
  const kenBurnsClass = ["animate-ken-burns", "animate-ken-burns-2", "animate-ken-burns-3"][variant % 3];
  return (
    <section className="relative z-20 h-[65vh] sm:h-[75vh] overflow-hidden">
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
   FLOATING PARTICLES
   ══════════════════════════════════════════════ */
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
   SPLIT TEXT (letter-by-letter hero)
   ══════════════════════════════════════════════ */
function SplitText({ text, className = "", delay = 0, style }: { text: string; className?: string; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={style} aria-label={text}>
      {text.split("").map((char, i) => (
        <span key={i} className={`inline-block transition-all duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-[40px] blur-[4px]"}`}
          style={{ transitionDelay: `${delay + i * 50}ms` }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════ */
export default function LandingPage() {
  const { opacity: heroOp, scale: heroSc } = useScrollFade();
  const [scrolled, setScrolled] = useState(false);
  const t1 = useTilt(5);
  const t2 = useTilt(5);
  const t3 = useTilt(4);
  const mag1 = useMagnetic(0.25);
  const mag2 = useMagnetic(0.25);
  const philRef = useScrollProgress();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <main className="bg-[#faf8f5] text-[#1a1a1a] overflow-x-hidden selection:bg-[#1a1a1a]/15 landing-page scroll-smooth">

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-transparent"}`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 sm:px-12 py-5">
          <p className={`text-[16px] tracking-[0.25em] uppercase font-semibold transition-colors duration-700 ${scrolled ? "text-[#1a1a1a]" : "text-white"}`}>FinPulse</p>
          <div className="hidden md:flex items-center gap-10">
            {["Briefing", "Portfolio", "Inteligencia", "Resiliencia"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className={`text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-700 ${scrolled ? "text-[#999] hover:text-[#1a1a1a]" : "text-white/60 hover:text-white"}`}>{l}</a>
            ))}
          </div>
          <div ref={mag1.ref} onMouseMove={mag1.onMove} onMouseLeave={mag1.onLeave} className="transition-transform duration-300 ease-out">
            <Link href="/login" className={`text-[11px] uppercase tracking-[0.2em] font-semibold px-6 py-2.5 border transition-all duration-700 ${scrolled ? "text-[#1a1a1a] border-[#1a1a1a]/30 hover:bg-[#1a1a1a] hover:text-white" : "text-white border-white/30 hover:bg-white hover:text-[#1a1a1a]"}`}>
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO — Ken Burns + Particles + Split Text ─── */}
      <section className="relative h-[120vh]">
        <div className="fixed inset-0 z-0 will-change-transform overflow-hidden" style={{ opacity: heroOp, transform: `scale(${heroSc})` }}>
          <div className="absolute inset-0 animate-ken-burns">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&q=90" alt="Skyline" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/60" />
          <div className="absolute inset-0 film-grain opacity-[0.04] pointer-events-none" />
          <Particles />
        </div>
        <div className="sticky top-0 h-screen flex items-center justify-center z-10" style={{ opacity: heroOp }}>
          <div className="text-center max-w-5xl mx-auto px-6">
            <SplitText text="FinPulse" className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] uppercase tracking-[0.25em] font-semibold leading-[0.95] text-white" style={{ transform: "scaleY(0.85)" }} delay={200} />
            <Reveal delay={800}>
              <p className="text-[14px] sm:text-[16px] text-white/50 font-extralight tracking-[0.15em] mt-6 mb-12">Inteligencia financiera personal</p>
            </Reveal>
            <Reveal delay={1000}>
              <div ref={mag2.ref} onMouseMove={mag2.onMove} onMouseLeave={mag2.onLeave} className="inline-block transition-transform duration-300 ease-out">
                <Link href="/login" className="inline-block text-[12px] uppercase tracking-[0.3em] text-white/80 border border-white/30 backdrop-blur-sm bg-white/[0.06] px-10 py-4 hover:bg-white hover:text-[#1a1a1a] transition-all duration-500 font-semibold hover:tracking-[0.4em]">
                  Comenzar
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10" style={{ opacity: heroOp }}>
          <div className="w-[1px] h-14 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-4 bg-white/60 animate-scroll-line" />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE TICKER ─── */}
      <MarqueeTicker />

      {/* ─── PHILOSOPHY — Word-by-word reveal ─── */}
      <section ref={philRef.ref} className="relative z-20 bg-[#faf8f5] pt-40 pb-28 sm:pt-52 sm:pb-36">
        <div className="max-w-[750px] mx-auto px-6 text-center">
          <Reveal><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-12 font-semibold">La filosofia</p></Reveal>
          <TextReveal
            text="Los mercados no esperan. Tu informacion tampoco deberia."
            className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight leading-[1.3] tracking-tight text-[#1a1a1a]"
          />
          <Reveal delay={250}><div className="flex items-center justify-center gap-3 my-16"><div className="w-14 h-[1px] bg-[#1a1a1a]/20" /><div className="w-2 h-2 rounded-full border border-[#1a1a1a]/25 animate-pulse" /><div className="w-14 h-[1px] bg-[#1a1a1a]/20" /></div></Reveal>
          <Reveal delay={350}>
            <p className="text-[15px] text-[#666] leading-[2.1] font-normal tracking-wide">
              Macro global, renta variable, materias primas, renta fija, divisas — cada manana, un briefing con la profundidad de un estratega institucional,
              adaptado a <span className="text-[#1a1a1a] font-medium">tu</span> portfolio y a las fuentes que tu elijas.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── IMAGE 1 — CINEMATIC DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=1920&h=1080&fit=crop&q=90" alt="Morning light" variant={0}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Cada manana</p>
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
          <Reveal delay={150} direction="right">
            <div ref={t1.ref} onMouseMove={t1.onMove} onMouseLeave={t1.onLeave} className="transition-transform duration-300 ease-out will-change-transform">
              <Card glow>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] animate-pulse" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#1a1a1a] font-bold">Briefing listo</span>
                  <span className="text-[11px] text-[#bbb] ml-auto font-semibold">8 min</span>
                </div>
                <p className="text-[15px] font-semibold text-[#1a1a1a] mb-4 tracking-wide">Resumen ejecutivo</p>
                <p className="text-[13px] text-[#666] leading-[1.9] mb-6">Semana clave para los mercados. El acuerdo EEUU-China impulsa la renta variable. El Brent cae un 4.2% por negociaciones Iran-EEUU. El BCE mantiene tono dovish.</p>
                <div className="flex flex-wrap gap-2 mb-7">
                  <span className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#1a1a1a]/8 text-[#1a1a1a] font-bold">S&P 500 maximos</span>
                  <span className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#c4001a]/8 text-[#c4001a] font-bold animate-pulse">Brent -4.2%</span>
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
      <CinematicDivider src="https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1920&h=1080&fit=crop&q=90" alt="Financial skyline" variant={1}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Datos en vivo</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Tu portfolio, en tiempo real</h2>
        </div>
      </CinematicDivider>

      {/* ─── PORTFOLIO CONTENT ─── */}
      <section id="portfolio" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-start">
          <Reveal direction="left">
            <div ref={t2.ref} onMouseMove={t2.onMove} onMouseLeave={t2.onLeave} className="transition-transform duration-300 ease-out will-change-transform">
              <Card glow>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.35em] text-[#999] font-semibold">Portfolio total</span>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-pulse" /><span className="text-[11px] text-[#1a1a1a] font-bold">En vivo</span></div>
                </div>
                <p className="text-[32px] font-extralight text-[#1a1a1a] tracking-tight">12.847,32 <span className="text-[14px] text-[#ccc] tracking-wide">EUR</span></p>
                <p className="text-[13px] text-[#1a1a1a] font-semibold mb-6">+2.4% esta semana</p>
                <svg viewBox="0 0 300 60" className="w-full h-16 mb-3" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.18" /><stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" /></linearGradient>
                    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.3" /><stop offset="100%" stopColor="#1a1a1a" /></linearGradient>
                  </defs>
                  <polygon points="0,55 20,50 40,52 60,45 80,40 100,42 120,35 140,30 160,32 180,28 200,25 220,20 240,22 260,18 280,15 300,12 300,60 0,60" fill="url(#cg)" />
                  <polyline points="0,55 20,50 40,52 60,45 80,40 100,42 120,35 140,30 160,32 180,28 200,25 220,20 240,22 260,18 280,15 300,12" fill="none" stroke="url(#lg)" strokeWidth="2" className="animate-draw-line" />
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
            <Reveal delay={50}><p className="text-[15px] text-[#666] leading-[2.1] font-normal tracking-wide mb-12">Acciones, ETFs, materias primas, indices y divisas. Velas japonesas, heatmap y distribucion por sector. Todo lo que sigues, en un solo lugar.</p></Reveal>
            <Reveal delay={100}>
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[{ n: "S&P 500", v: "7.375", c: -0.37 }, { n: "VIX", v: "18.07", c: 1.40 }, { n: "Brent", v: "$111", c: -0.67 }, { n: "EUR/USD", v: "1.161", c: -0.44 }, { n: "Gold", v: "$4.502", c: -1.21 }, { n: "US 10Y", v: "4.66%", c: 0.87 }].map((idx, i) => (
                  <Reveal key={idx.n} delay={100 + i * 60} direction="scale">
                    <Card>
                      <p className="text-[10px] text-[#999] mb-2 font-bold uppercase tracking-wider">{idx.n}</p>
                      <p className="text-[16px] font-semibold text-[#1a1a1a]">{idx.v}</p>
                      <p className={`text-[12px] font-bold ${idx.c < 0 ? "text-[#c4001a]" : "text-[#1a1a1a]"}`}>{idx.c >= 0 ? "+" : ""}{idx.c}%</p>
                    </Card>
                  </Reveal>
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
          <Reveal><div className="text-center mb-20"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Tus fuentes</p>
            <TextReveal text="Newsletters, analistas, mercados de prediccion. Todo sintetizado." className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]" />
          </div></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&h=600&fit=crop&q=85", alt: "Newsletters", label: "Newsletters", desc: "Matt Levine, UBS On-Air, FT Alphaville, BBVA Research — leidas y resumidas antes de que abras el email." },
              { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=85", alt: "Markets", label: "Mercados", desc: "Renta variable, fija, materias primas, divisas y volatilidad — los datos que mueven tu portfolio." },
              { src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&q=85", alt: "Predictions", label: "Predicciones", desc: "Probabilidades de Polymarket integradas en cada tema relevante — del BCE a los aranceles." },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 120} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <div className="relative h-[360px] rounded-[20px] overflow-hidden group cursor-default">
                  <img src={card.src} alt={card.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-2 font-semibold">{card.label}</p>
                    <p className="text-[15px] text-white/90 font-extralight leading-[1.6]">{card.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMAGE 4 — INTELLIGENCE DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1462206092226-f46025ffe607?w=1920&h=1080&fit=crop&q=90" alt="Cityscape light" variant={2}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">IA con criterio</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Recomendaciones fundamentadas</h2>
        </div>
      </CinematicDivider>

      {/* ─── INTELLIGENCE CONTENT ─── */}
      <section id="inteligencia" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6">
          <Reveal><div className="text-center mb-20"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Analisis</p><h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]">Ideas con fundamento, <span className="text-[#999]">no con ruido</span></h2></div></Reveal>
        </div>
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal direction="left">
            <Card glow>
              <div className="flex items-center justify-between mb-7">
                <span className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Recomendaciones activas</span>
                <span className="text-[11px] text-[#1a1a1a] font-semibold bg-[#1a1a1a]/8 px-4 py-1.5 rounded-full">78% acierto</span>
              </div>
              <div className="space-y-4 mb-7">
                <div className="rounded-2xl border border-[#c4001a]/12 bg-[#c4001a]/[0.02] p-5 hover:border-[#c4001a]/30 transition-colors duration-500">
                  <div className="flex items-center justify-between mb-2"><span className="text-[13px] font-semibold text-[#1a1a1a] tracking-wide">Reducir Brent un 50%</span><span className="text-[11px] px-3 py-1 rounded-full bg-[#faf8f5] text-[#555] font-semibold">8/10</span></div>
                  <p className="text-[13px] text-[#666] leading-[1.8]">Paralelo 2015: Iran puede anadir 1.5M bbl/dia. Polymarket 58% probabilidad de acuerdo.</p>
                </div>
                <div className="rounded-2xl border border-[#1a1a1a]/12 bg-[#1a1a1a]/[0.02] p-5 hover:border-[#1a1a1a]/30 transition-colors duration-500">
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
                  <div key={s.n} className="border-l-[3px] border-[#1a1a1a]/20 pl-4 hover:border-[#1a1a1a]/60 transition-colors duration-500">
                    <span className="text-[12px] text-[#1a1a1a] font-semibold tracking-wide">{s.n}</span>
                    <p className="text-[13px] text-[#777] italic mt-1 leading-[1.7]">&ldquo;{s.q}&rdquo;</p>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={100} direction="right">
            <div ref={t3.ref} onMouseMove={t3.onMove} onMouseLeave={t3.onLeave} className="transition-transform duration-300 ease-out will-change-transform h-full">
              <Card className="h-full" glow>
                <p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Tu Investor DNA</p>
                <p className="text-[13px] text-[#999] mt-1.5 mb-8">Perfil psicologico como inversor</p>
                <div className="flex justify-center mb-10">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    <polygon points="100,15 185,55 185,145 100,185 15,145 15,55" fill="none" stroke="#eee" strokeWidth="1" />
                    <polygon points="100,45 160,70 160,130 100,155 40,130 40,70" fill="none" stroke="#f0ede8" strokeWidth="1" />
                    <polygon points="100,75 135,85 135,115 100,125 65,115 65,85" fill="none" stroke="#f5f2ed" strokeWidth="1" />
                    <polygon points="100,22 175,58 170,140 100,172 28,130 35,58" fill="rgba(26,26,26,0.05)" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" className="animate-draw-polygon" />
                    <circle cx="100" cy="22" r="3.5" fill="#1a1a1a" className="animate-pop" style={{ animationDelay: "0.5s" }} />
                    <circle cx="175" cy="58" r="3.5" fill="#1a1a1a" className="animate-pop" style={{ animationDelay: "0.7s" }} />
                    <circle cx="170" cy="140" r="3.5" fill="#1a1a1a" className="animate-pop" style={{ animationDelay: "0.9s" }} />
                    <circle cx="100" cy="172" r="3.5" fill="#1a1a1a" className="animate-pop" style={{ animationDelay: "1.1s" }} />
                    <circle cx="28" cy="130" r="3.5" fill="#1a1a1a" className="animate-pop" style={{ animationDelay: "1.3s" }} />
                    <circle cx="35" cy="58" r="3.5" fill="#1a1a1a" className="animate-pop" style={{ animationDelay: "1.5s" }} />
                  </svg>
                </div>
                <div className="space-y-5">
                  {[{ l: "Disciplina", v: 78, c: "#1a1a1a" }, { l: "Control emocional", v: 65, c: "#b8860b" }, { l: "Diversificacion", v: 82, c: "#1a1a1a" }, { l: "Timing", v: 54, c: "#c4001a" }].map((t) => (
                    <div key={t.l}><div className="flex justify-between text-[13px] mb-2"><span className="text-[#777]">{t.l}</span><span className="text-[#1a1a1a] font-bold">{t.v}%</span></div><div className="h-2 rounded-full bg-[#f0ede8] overflow-hidden"><div className="h-full rounded-full transition-all duration-[2s] ease-out animate-bar-fill" style={{ "--bar-width": `${t.v}%`, backgroundColor: t.c } as React.CSSProperties} /></div></div>
                  ))}
                </div>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── IMAGE 5 — STRESS TEST DIVIDER ─── */}
      <CinematicDivider src="https://images.unsplash.com/photo-1534996858221-380b92700493?w=1920&h=1080&fit=crop&q=90" alt="Storm clouds" variant={1}>
        <div className="text-center">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Resiliencia</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight">Y si se repite 2008?</h2>
        </div>
      </CinematicDivider>

      {/* ─── STRESS + COMPARADOR ─── */}
      <section id="resiliencia" className="relative z-20 bg-[#faf8f5] py-32 sm:py-40">
        <div className="max-w-[1140px] mx-auto px-6 mb-20">
          <Reveal><div className="text-center"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Escenarios</p><h2 className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]">Que pasaria si <span className="text-[#999]">vuelve a ocurrir?</span></h2></div></Reveal>
        </div>
        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal direction="left">
            <Card glow>
              <div className="flex items-center justify-between mb-8">
                <div><p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Stress Test</p><p className="text-[13px] text-[#999] mt-1.5">Crisis financiera 2008</p></div>
                <div className="text-right"><p className="text-2xl font-light text-[#c4001a]">-55.6%</p><p className="text-[12px] text-[#999]">12.847 → 5.652</p></div>
              </div>
              <div className="grid grid-cols-5 gap-3 mb-8"><Gauge label="IWDA" drop={-52} color="#c4001a" /><Gauge label="VUAA" drop={-56} color="#c4001a" /><Gauge label="BRT" drop={-68} color="#c4001a" /><Gauge label="EUNA" drop={8} color="#1a1a1a" /><Gauge label="SEMI" drop={-62} color="#c4001a" /></div>
              <div className="flex gap-2">
                {["2008", "COVID", "Dot-com", "2022"].map((s, i) => (
                  <button key={s} className={`text-[12px] px-5 py-2.5 rounded-xl border font-bold transition-all duration-300 ${i === 0 ? "border-[#1a1a1a]/20 text-[#1a1a1a] bg-[#1a1a1a]/6" : "border-[#e5e0db] text-[#bbb] hover:text-[#888] hover:border-[#ccc]"}`}>{s}</button>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={100} direction="right">
            <Card glow>
              <p className="text-[14px] font-semibold text-[#1a1a1a] tracking-wide">Comparador</p>
              <p className="text-[13px] text-[#999] mt-1.5 mb-6">VUAA vs IWDA — 6 meses</p>
              <svg viewBox="0 0 300 100" className="w-full h-28 mb-6" preserveAspectRatio="none">
                <polyline points="0,80 30,75 60,78 90,65 120,55 150,50 180,45 210,40 240,35 270,30 300,25" fill="none" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.2" className="animate-draw-line" style={{ animationDelay: "0.3s" }} />
                <polyline points="0,80 30,70 60,76 90,55 120,42 150,48 180,35 210,25 240,30 270,20 300,15" fill="none" stroke="#1a1a1a" strokeWidth="2" className="animate-draw-line" />
              </svg>
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-[#1a1a1a]/20 rounded" /><span className="text-[12px] text-[#888] font-semibold">IWDA +10.2%</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-[2px] bg-[#1a1a1a] rounded" /><span className="text-[12px] text-[#1a1a1a] font-semibold">VUAA +12.3%</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ l: "Volatilidad", a: "12.8%", b: "14.2%" }, { l: "Sharpe", a: "1.1", b: "1.2" }, { l: "Max Drawdown", a: "-7.1%", b: "-8.3%" }, { l: "Correlacion", a: "", b: "0.94" }].map((m) => (
                  <div key={m.l} className="bg-[#faf8f5] rounded-xl p-3.5 hover:bg-[#f5f2ed] transition-colors duration-300">
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
      <CinematicDivider src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop&q=90" alt="Learning" variant={2}>
        <div className="text-center max-w-2xl px-6">
          <p className="text-[12px] uppercase tracking-[0.5em] text-white/70 mb-5 font-semibold">Aprendizaje continuo</p>
          <h2 className="text-4xl sm:text-5xl md:text-[4rem] font-extralight text-white tracking-tight mb-6">Cada operacion te hace mejor inversor</h2>
          <p className="text-[15px] text-white/55 font-normal leading-[1.8]">Decision Journal. Sesgos cognitivos detectados. Escenarios alternativos. Signal vs Noise Score. El camino no tomado.</p>
        </div>
      </CinematicDivider>

      {/* ─── 16 HERRAMIENTAS — Horizontal scroll on mobile ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-36 sm:py-44">
        <div className="max-w-[1140px] mx-auto px-6">
          <Reveal><div className="text-center mb-24"><p className="text-[12px] uppercase tracking-[0.5em] text-[#1a1a1a]/50 mb-6 font-semibold">Todo en un lugar</p>
            <TextReveal text="Las herramientas que necesitas" className="text-[1.75rem] sm:text-[2.4rem] md:text-[3rem] font-extralight tracking-tight text-[#1a1a1a]" />
          </div></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e5e0db]/60">
            {["Dashboard", "Briefing diario", "Portfolio", "Recomendaciones IA", "Investor DNA", "Stress Test", "Comparador", "Decision Journal", "Radar oportunidades", "Deep-dive noticias", "Review semanal", "Chat IA", "Signal vs Noise", "Camino no tomado", "Configuracion", "Onboarding"].map((name, i) => (
              <Reveal key={name} delay={i * 40} direction="scale">
                <div className="bg-[#faf8f5] p-8 sm:p-10 transition-all duration-700 hover:bg-white group cursor-default relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <span className="text-[11px] text-[#1a1a1a]/25 tabular-nums font-semibold group-hover:text-[#1a1a1a]/70 transition-colors duration-500 relative z-10">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[13px] text-[#555] mt-3 font-semibold tracking-wide group-hover:text-[#1a1a1a] group-hover:tracking-widest transition-all duration-500 relative z-10">{name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-20 bg-[#faf8f5] py-28">
        <div className="max-w-[900px] mx-auto px-6 grid grid-cols-3 gap-8">
          <AnimatedStat value={12} suffix="+" label="Fuentes integradas" />
          <AnimatedStat value={365} suffix="" label="Briefings al ano" />
          <AnimatedStat value={98} suffix="%" label="Cobertura global" />
        </div>
      </section>

      {/* ─── CTA — Animated gradient + magnetic button ─── */}
      <section className="relative z-20 overflow-hidden">
        <div className="relative h-[80vh] sm:h-[85vh]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full animate-ken-burns-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop&q=90" alt="City at night" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 animate-gradient-shift opacity-20" />
          <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          <Particles />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="max-w-[700px] mx-auto px-6 text-center">
              <Reveal><p className="text-[12px] uppercase tracking-[0.5em] text-white/50 mb-10 font-semibold">Tu momento</p></Reveal>
              <Reveal delay={100}>
                <TextReveal text="Tu ventaja empieza aqui" className="text-4xl sm:text-5xl md:text-[4.5rem] font-extralight text-white tracking-tight leading-[1.05] mb-8" />
              </Reveal>
              <Reveal delay={250}><p className="text-[15px] text-white/45 font-normal leading-[2] mb-16 max-w-md mx-auto tracking-wide">Para inversores que toman sus propias decisiones.</p></Reveal>
              <Reveal delay={400}>
                <div className="inline-block transition-transform duration-300 ease-out">
                  <Link href="/login" className="group/cta inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.3em] text-white border border-white/30 px-14 py-5 hover:bg-white hover:text-[#1a1a1a] transition-all duration-500 font-semibold backdrop-blur-sm bg-white/[0.04] hover:tracking-[0.4em] hover:px-16">
                    Comenzar ahora
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-0 -translate-x-2 group-hover/cta:opacity-100 group-hover/cta:translate-x-0 transition-all duration-500"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </div>
              </Reveal>
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

      {/* ─── STYLES ─── */}
      <style jsx global>{`
        .landing-page {
          font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Scroll line */
        @keyframes scroll-line { 0% { transform: translateY(-100%); } 100% { transform: translateY(300%); } }
        .animate-scroll-line { animation: scroll-line 2s ease-in-out infinite; }

        /* Marquee */
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }

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
          50% { transform: translate(${Math.random() > 0.5 ? '' : '-'}30px, -60px); opacity: 0.3; }
        }
        .animate-float-particle { animation: float-particle 8s ease-in-out infinite; }

        /* Film grain */
        .film-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 128px 128px;
        }

        /* Draw line animation */
        @keyframes draw-line {
          0% { stroke-dasharray: 0 9999; }
          100% { stroke-dasharray: 9999 0; }
        }
        .animate-draw-line { animation: draw-line 2s ease-out forwards; }

        /* Draw polygon */
        @keyframes draw-polygon {
          0% { stroke-dasharray: 0 9999; opacity: 0; }
          10% { opacity: 1; }
          100% { stroke-dasharray: 9999 0; opacity: 1; }
        }
        .animate-draw-polygon { animation: draw-polygon 2.5s ease-out forwards; }

        /* Pop in circles */
        @keyframes pop {
          0% { r: 0; opacity: 0; }
          60% { r: 4.5; }
          100% { r: 3.5; opacity: 1; }
        }
        .animate-pop { animation: pop 0.5s ease-out forwards; opacity: 0; }

        /* Bar fill */
        @keyframes bar-fill {
          0% { width: 0; }
          100% { width: var(--bar-width); }
        }
        .animate-bar-fill { animation: bar-fill 1.5s ease-out forwards; width: 0; }

        /* Animated gradient */
        @keyframes gradient-shift {
          0%   { background: radial-gradient(ellipse at 20% 50%, rgba(26,26,26,0.3) 0%, transparent 70%); }
          33%  { background: radial-gradient(ellipse at 80% 30%, rgba(26,26,26,0.3) 0%, transparent 70%); }
          66%  { background: radial-gradient(ellipse at 50% 80%, rgba(26,26,26,0.3) 0%, transparent 70%); }
          100% { background: radial-gradient(ellipse at 20% 50%, rgba(26,26,26,0.3) 0%, transparent 70%); }
        }
        .animate-gradient-shift { animation: gradient-shift 10s ease-in-out infinite; }

        /* Smooth scroll */
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}
