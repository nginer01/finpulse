"use client";

import { useRef, useEffect, useCallback, useState } from "react";

/* ─────────────────────────────────────────────────
   BORDER TRACE CARD — SVG stroke-dashoffset animation
   ───────────────────────────────────────────────── */

function Card({ children, className = "", padding = "p-5" }: { children: React.ReactNode; className?: string; padding?: string }) {
  const svgRef = useRef<SVGRectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePerimeter = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const perimeter = 2 * (width + height);
    svgRef.current.setAttribute("stroke-dasharray", `${perimeter}`);
    svgRef.current.setAttribute("stroke-dashoffset", `${perimeter}`);
    svgRef.current.dataset.perimeter = `${perimeter}`;
  }, []);

  useEffect(() => {
    updatePerimeter();
    window.addEventListener("resize", updatePerimeter);
    return () => window.removeEventListener("resize", updatePerimeter);
  }, [updatePerimeter]);

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      onMouseEnter={() => {
        if (svgRef.current) svgRef.current.style.strokeDashoffset = "0";
      }}
      onMouseLeave={() => {
        if (svgRef.current) {
          svgRef.current.style.strokeDashoffset = svgRef.current.dataset.perimeter || "0";
        }
      }}
    >
      {/* Border trace SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" style={{ borderRadius: "inherit" }}>
        <rect
          ref={svgRef}
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="15"
          ry="15"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeDasharray="0"
          strokeDashoffset="0"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      {/* Static subtle border */}
      <div className={`bg-[#1d1d1f]/60 border border-white/[0.08] rounded-2xl ${padding} relative z-0 transition-all duration-500 group-hover:border-white/[0.15] group-hover:bg-[#1d1d1f]/80`}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PREVIEW PAGE — Apple Minimal + Border Trace
   ───────────────────────────────────────────────── */

const logoFonts = [
  { name: "Playfair Display", css: "'Playfair Display', serif", desc: "Serif elegante — estilo editorial premium" },
  { name: "Cormorant Garamond", css: "'Cormorant Garamond', serif", desc: "Serif fino — lujo silencioso, tipo Cartier" },
  { name: "Sora", css: "'Sora', sans-serif", desc: "Sans geométrica — moderna, limpia, tech" },
  { name: "Space Grotesk", css: "'Space Grotesk', sans-serif", desc: "Sans angular — tipo startup fintech" },
  { name: "Instrument Serif", css: "'Instrument Serif', serif", desc: "Serif contemporáneo — equilibrado, distinto" },
];

export default function PreviewPage() {
  const [fontIdx, setFontIdx] = useState(2); // Sora

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]" style={{ fontFamily: "-apple-system, SF Pro Display, SF Pro Text, system-ui, sans-serif" }}>

      {/* Google Fonts loader */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      {/* Font selector — fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur border-b border-[#333] px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs text-[#888]">Elige tipografía del logo:</span>
          <div className="flex items-center gap-1.5">
            {logoFonts.map((f, i) => (
              <button
                key={f.name}
                onClick={() => setFontIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  fontIdx === i
                    ? "bg-white text-black font-medium"
                    : "bg-[#1a1a1a] text-[#888] border border-[#333] hover:border-[#555]"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
        <p className="max-w-5xl mx-auto text-[10px] text-[#555] mt-1">{logoFonts[fontIdx].desc}</p>
      </div>

      {/* Nav — white bar */}
      <header className="sticky top-[52px] z-20 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black/[0.06] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#1d1d1f]" />
            </div>
            <span
              className="text-2xl tracking-tight text-[#1d1d1f]"
              style={{ fontFamily: logoFonts[fontIdx].css, fontWeight: fontIdx === 4 ? 400 : 600 }}
            >
              FinPulse
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[#86868b]">
            <span className="text-[#1d1d1f] font-medium">Resumen</span>
            <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Portfolio</span>
            <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Aprendizaje</span>
            <span className="hover:text-[#1d1d1f] transition-colors cursor-pointer">Semanal</span>
            <div className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-xs text-white font-medium">NG</div>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-20">

        {/* Greeting */}
        <p className="text-sm text-[#86868b] mb-1.5">Domingo, 11 de mayo 2026 — 9:00 AM</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Buenos días, Nico</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <Card>
            <p className="text-xs text-[#86868b] mb-1.5">Portfolio total</p>
            <p className="text-2xl font-semibold tracking-tight">12.847,32</p>
            <p className="text-xs text-[#30d158] mt-0.5">+2.4% esta semana</p>
          </Card>
          <Card>
            <p className="text-xs text-[#86868b] mb-1.5">Sentimiento</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-[#2d2d2d] overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#ff453a] to-[#ffd60a]" />
              </div>
              <span className="text-sm font-medium text-[#ffd60a]">62</span>
            </div>
            <p className="text-xs text-[#86868b] mt-1.5">Moderadamente optimista</p>
          </Card>
          <Card>
            <p className="text-xs text-[#86868b] mb-1.5">Recomendación IA</p>
            <p className="text-sm font-medium">Mantener posiciones</p>
            <p className="text-xs text-[#86868b] mt-0.5">Convicción: 7/10</p>
          </Card>
          <Card>
            <p className="text-xs text-[#86868b] mb-1.5">Investor DNA</p>
            <p className="text-sm font-medium">Perfil equilibrado</p>
            <p className="text-xs text-[#86868b] mt-0.5">Acierto: 68%</p>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mb-10" padding="p-7">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <h2 className="text-lg font-semibold tracking-tight">Resumen diario</h2>
            <span className="text-xs text-[#86868b] ml-auto">14 fuentes</span>
          </div>
          <p className="text-sm text-[#86868b] leading-7 mb-4">
            Los mercados globales abren la semana con tono positivo tras el acuerdo comercial preliminar entre EEUU y China.
            El S&P 500 cerró en máximos históricos (+1.2%). <span className="text-[#f5f5f7]">Tu posición en MSCI World se beneficia directamente.</span>
          </p>
          <p className="text-sm text-[#86868b] leading-7">
            UBS On-Air destaca que la inflación europea sigue contenida. Polymarket sitúa al 73% la probabilidad de recorte del BCE en junio — <span className="text-[#30d158]">esto podría impulsar tu portfolio un 3-5% adicional.</span>
          </p>
          <div className="flex gap-2 mt-5">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[#86868b]">Macro Global</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#30d158]/10 text-[#30d158]">Favorable</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#ff453a]/10 text-[#ff453a]">1 alerta</span>
          </div>
        </Card>

        {/* News */}
        <h2 className="text-lg font-semibold tracking-tight mb-5">Noticias para profundizar</h2>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { type: "Interés personal", title: "Acuerdo EEUU-China: impacto en ETFs globales y tu posición en MSCI World", src: "Financial Times" },
            { type: "Información nueva", title: "Nvidia Blackwell Ultra: el mercado de semiconductores se reconfigura", src: "Bloomberg" },
            { type: "Visión futura", title: "Escasez global de cobre: la próxima crisis silenciosa para la transición energética", src: "BBVA Research" },
          ].map((n) => (
            <Card key={n.title} padding="p-0">
              <div className="h-36 bg-[#2d2d2d] rounded-t-2xl" />
              <div className="p-5">
                <p className="text-xs text-[#86868b] uppercase tracking-wide mb-2">{n.type}</p>
                <p className="text-sm font-medium leading-snug mb-3">{n.title}</p>
                <p className="text-xs text-[#86868b]">{n.src}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Portfolio + DNA */}
        <div className="grid grid-cols-2 gap-5">
          <Card padding="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold tracking-tight">Portfolio</h2>
              <span className="text-xs text-[#30d158]">+2.4%</span>
            </div>
            {[
              { t: "IWDA", n: "iShares MSCI World", v: "4.230,00", c: 1.8 },
              { t: "VUAA", n: "Vanguard S&P 500", v: "3.150,00", c: 2.1 },
              { t: "BRT", n: "Brent Crude Oil", v: "1.200,00", c: -3.8 },
              { t: "EUNA", n: "Euro Gov Bond", v: "2.400,00", c: 0.5 },
              { t: "SEMI", n: "VanEck Semiconductor", v: "1.867,32", c: 4.2 },
            ].map((p) => (
              <div key={p.t} className="flex items-center justify-between py-3.5 border-b border-white/[0.06] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xs font-mono text-[#86868b]">
                    {p.t.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.t}</p>
                    <p className="text-xs text-[#86868b]">{p.n}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{p.v}</p>
                  <p className={`text-xs ${p.c >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                    {p.c >= 0 ? "+" : ""}{p.c}%
                  </p>
                </div>
              </div>
            ))}
          </Card>

          <Card padding="p-6">
            <h2 className="text-lg font-semibold tracking-tight mb-5">Investor DNA</h2>
            {[
              { n: "Disciplina", v: 78, color: "#f5f5f7" },
              { n: "Control emocional", v: 65, color: "#ffd60a" },
              { n: "Diversificación", v: 82, color: "#30d158" },
              { n: "Timing", v: 54, color: "#ff453a" },
            ].map((t) => (
              <div key={t.n} className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#86868b]">{t.n}</span>
                  <span>{t.v}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#2d2d2d] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.v}%`, backgroundColor: t.color }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-[#86868b] mt-5">Mejorando en disciplina. Trabajar en timing.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
