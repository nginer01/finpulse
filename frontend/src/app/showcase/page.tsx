"use client";

import { useEffect, useState, useRef } from "react";

/* ══════════════════════════════════════════════
   LIVE CHART
   ══════════════════════════════════════════════ */

function LiveChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let price = 5800;
    for (let i = 0; i < 80; i++) { price += (Math.random() - 0.44) * 12; dataRef.current.push(price); }
    const draw = () => {
      const data = dataRef.current;
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = canvas.offsetHeight * 2;
      ctx.clearRect(0, 0, w, h);
      data.push(data[data.length - 1] + (Math.random() - 0.44) * 12);
      if (data.length > 100) data.shift();
      const min = Math.min(...data) - 8, max = Math.max(...data) + 8;
      const stepX = w / (data.length - 1);
      const isUp = data[data.length - 1] > data[0];
      const color = isUp ? "#30d158" : "#ff453a";
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, isUp ? "rgba(48,209,88,0.10)" : "rgba(255,69,58,0.10)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.moveTo(0, h);
      data.forEach((d, i) => ctx.lineTo(i * stepX, h - ((d - min) / (max - min)) * h));
      ctx.lineTo(w, h); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath();
      data.forEach((d, i) => { const x = i * stepX, y = h - ((d - min) / (max - min)) * h; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
      const lx = (data.length - 1) * stepX, ly = h - ((data[data.length - 1] - min) / (max - min)) * h;
      ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    };
    const interval = setInterval(draw, 700);
    draw();
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

/* ══════════════════════════════════════════════
   SCENE COMPONENTS
   ══════════════════════════════════════════════ */

function SceneIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-[2.5rem] sm:text-[4rem] tracking-[0.35em] uppercase font-semibold text-white mb-4 animate-scene-title" style={{ transform: "scaleY(0.85)" }}>FinPulse</p>
      <p className="text-[14px] text-white/30 font-extralight tracking-[0.15em] animate-scene-sub">Inteligencia financiera personal</p>
    </div>
  );
}

function SceneBriefing() {
  const sections = ["Contexto macro global", "Impacto en tu portfolio", "Temas de seguimiento", "Lo que dicen tus fuentes", "Recomendaciones"];
  const [revealed, setRevealed] = useState(0);
  useEffect(() => { const i = setInterval(() => setRevealed((r) => Math.min(r + 1, sections.length)), 500); return () => clearInterval(i); }, [sections.length]);
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-4 animate-scene-label">Cada manana a las 9:00</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-10 animate-scene-title">Tu briefing diario</h2>
      <div className="w-full max-w-md bg-[#1d1d1f]/60 border border-white/[0.06] rounded-2xl p-6 animate-scene-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Briefing listo</span>
          <span className="text-[10px] text-white/20 ml-auto">8 min lectura</span>
        </div>
        <p className="text-[12px] text-white/40 leading-[1.9] mb-5">Semana clave. Acuerdo EEUU-China impulsa renta variable. Brent -4.2%. BCE dovish — recorte en junio al 73%.</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {["S&P maximos", "Brent -4.2%", "BCE dovish"].map((t, i) => (
            <span key={t} className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${i === 1 ? "bg-[#ff453a]/10 text-[#ff453a]" : i === 2 ? "bg-[#ffd60a]/10 text-[#ffd60a]" : "bg-white/[0.06] text-white/50"}`}>{t}</span>
          ))}
        </div>
        {sections.map((s, i) => (
          <div key={s} className={`flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 transition-all duration-500 ${i < revealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
            <span className="text-[12px] text-white/40">{s}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenePortfolio() {
  const tickers = [
    { t: "IWDA", n: "MSCI World", v: "4.230", c: +1.8 },
    { t: "VUAA", n: "S&P 500", v: "3.150", c: +2.1 },
    { t: "BRT", n: "Brent Oil", v: "1.200", c: -3.8 },
    { t: "EUNA", n: "Euro Bond", v: "2.400", c: +0.5 },
    { t: "SEMI", n: "Semiconductor", v: "1.867", c: +4.2 },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-4 animate-scene-label">Datos en vivo</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-10 animate-scene-title">Tu portfolio, en tiempo real</h2>
      <div className="w-full max-w-2xl grid grid-cols-5 gap-3 animate-scene-card">
        <div className="col-span-3 bg-[#1d1d1f]/60 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">S&P 500</p>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" /><span className="text-[9px] text-white/20">Live</span></div>
          </div>
          <p className="text-xl font-extralight mb-1">5.847 <span className="text-[12px] text-[#30d158]">+1.2%</span></p>
          <div className="h-[160px]"><LiveChart /></div>
        </div>
        <div className="col-span-2 bg-[#1d1d1f]/60 border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-3">Posiciones</p>
          {tickers.map((t, i) => (
            <div key={t.t} className={`flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 animate-stagger-in`} style={{ animationDelay: `${0.8 + i * 0.15}s` }}>
              <div>
                <p className="text-[11px] font-medium text-white">{t.t}</p>
                <p className="text-[9px] text-white/20">{t.n}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] tabular-nums">{t.v}</p>
                <p className={`text-[9px] font-semibold ${t.c >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>{t.c >= 0 ? "+" : ""}{t.c}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneAI() {
  const msgs = [
    { role: "user", text: "Deberia vender Brent?" },
    { role: "ai", text: "Si. Negociaciones Iran-EEUU avanzan. Polymarket 58% acuerdo. Paralelo 2015: caida del 30%. Recomiendo reducir 50%." },
    { role: "user", text: "Y donde reinvierto?" },
    { role: "ai", text: "Dos opciones: SEMI en caida (ciclo expansivo) o EUNA antes del recorte BCE. Conviccion 7/10." },
  ];
  const [count, setCount] = useState(0);
  useEffect(() => { const i = setInterval(() => setCount((c) => Math.min(c + 1, msgs.length)), 1200); return () => clearInterval(i); }, [msgs.length]);
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-[#bf5af2]/60 font-semibold mb-4 animate-scene-label">IA con criterio</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-10 animate-scene-title">Tu estratega personal</h2>
      <div className="w-full max-w-md space-y-3 animate-scene-card">
        {msgs.slice(0, count).map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-msg-in`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-white/10" : "bg-[#bf5af2]/10 border border-[#bf5af2]/15"}`}>
              {m.role === "ai" && <p className="text-[9px] uppercase tracking-wider text-[#bf5af2]/50 font-medium mb-1">FinPulse IA</p>}
              <p className="text-[12px] text-white/70 leading-[1.8]">{m.text}</p>
            </div>
          </div>
        ))}
        {count > 0 && count < msgs.length && (
          <div className="flex justify-start">
            <div className="bg-[#bf5af2]/10 border border-[#bf5af2]/15 rounded-2xl px-4 py-3 flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#bf5af2]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#bf5af2]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#bf5af2]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SceneRecommendations() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 600); }, []);
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-4 animate-scene-label">Analisis</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-10 animate-scene-title">Recomendaciones fundamentadas</h2>
      <div className="w-full max-w-lg space-y-4 animate-scene-card">
        <div className={`bg-[#1d1d1f]/60 border border-[#ff453a]/15 rounded-2xl p-5 transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-medium text-white">Reducir Brent 50%</p>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/50 font-medium">8/10</span>
          </div>
          <p className="text-[11px] text-white/35 leading-[1.8] mb-3">Paralelo 2015: Iran puede anadir 1.5M bbl/dia. Polymarket 58% acuerdo.</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#30d158]/[0.06] rounded-xl p-3"><p className="text-[9px] text-[#30d158] font-medium mb-1">A favor</p><p className="text-[10px] text-white/30">Iran, OPEC+, historico</p></div>
            <div className="bg-[#ff453a]/[0.06] rounded-xl p-3"><p className="text-[9px] text-[#ff453a] font-medium mb-1">En contra</p><p className="text-[10px] text-white/30">OPEC disciplina, demanda</p></div>
          </div>
        </div>
        <div className={`bg-[#1d1d1f]/60 border border-[#30d158]/15 rounded-2xl p-5 transition-all duration-700 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-medium text-white">Anadir SEMI en caida (&gt;2%)</p>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/50 font-medium">7/10</span>
          </div>
          <p className="text-[11px] text-white/35 leading-[1.8]">Ciclo expansivo 12-18 meses. Nvidia Blackwell Ultra. TSMC capex +15%.</p>
        </div>
      </div>
    </div>
  );
}

function SceneDNA() {
  const traits = [
    { l: "Disciplina", v: 78, c: "#fff" },
    { l: "Control emocional", v: 65, c: "#ffd60a" },
    { l: "Diversificacion", v: 82, c: "#30d158" },
    { l: "Timing", v: 54, c: "#ff453a" },
    { l: "Analisis fundamental", v: 71, c: "#fff" },
    { l: "Gestion riesgo", v: 68, c: "#bf5af2" },
  ];
  const [fill, setFill] = useState(false);
  useEffect(() => { setTimeout(() => setFill(true), 500); }, []);
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-4 animate-scene-label">Autoconocimiento</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-10 animate-scene-title">Tu Investor DNA</h2>
      <div className="w-full max-w-sm space-y-4 animate-scene-card">
        {traits.map((t, i) => (
          <div key={t.l}>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-white/30">{t.l}</span>
              <span className="text-white/60 font-medium tabular-nums">{t.v}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full transition-all ease-out" style={{
                width: fill ? `${t.v}%` : "0%",
                backgroundColor: t.c,
                opacity: 0.5,
                transitionDuration: `${1.2 + i * 0.2}s`,
                transitionDelay: `${0.3 + i * 0.1}s`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneStress() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 600); }, []);
  const gauges = [
    { l: "IWDA", v: -52 }, { l: "VUAA", v: -56 }, { l: "BRT", v: -68 }, { l: "EUNA", v: +8 }, { l: "SEMI", v: -62 },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-4 animate-scene-label">Resiliencia</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-3 animate-scene-title">Y si se repite 2008?</h2>
      <p className={`text-[2.5rem] font-extralight text-[#ff453a] mb-10 transition-all duration-1000 ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>-55.6%</p>
      <div className="flex gap-6 animate-scene-card">
        {gauges.map((g, i) => {
          const isUp = g.v > 0;
          const color = isUp ? "#30d158" : "#ff453a";
          return (
            <div key={g.l} className="text-center">
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                    className="transition-all ease-out" style={{
                      strokeDasharray: show ? `${213.6 * (Math.abs(g.v) / 100)} 213.6` : "0 213.6",
                      transitionDuration: `${1.5 + i * 0.2}s`,
                      transitionDelay: `${0.5 + i * 0.15}s`,
                    }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold" style={{ color }}>{g.v > 0 ? "+" : ""}{g.v}%</span>
              </div>
              <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium">{g.l}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SceneNotifications() {
  const notifs = [
    { text: "SEMI +4.2% — Tu mejor posicion hoy", color: "#30d158", icon: "▲" },
    { text: "Recomendacion: Reducir Brent 50%", color: "#bf5af2", icon: "◆" },
    { text: "BCE recorte junio: 73%", color: "#ffd60a", icon: "⚠" },
    { text: "Felicidades: +308€ esta semana", color: "#30d158", icon: "★" },
    { text: "VIX en zona de complacencia", color: "#ff453a", icon: "▼" },
  ];
  const [count, setCount] = useState(0);
  useEffect(() => { const i = setInterval(() => setCount((c) => Math.min(c + 1, notifs.length)), 800); return () => clearInterval(i); }, [notifs.length]);
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-4 animate-scene-label">Siempre informado</p>
      <h2 className="text-[2rem] sm:text-[3rem] font-extralight text-white tracking-tight mb-10 animate-scene-title">Alertas inteligentes</h2>
      <div className="w-full max-w-sm space-y-3">
        {notifs.slice(0, count).map((n, i) => (
          <div key={i} className="animate-notif-in bg-[#1d1d1f]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-xl" style={{ color: n.color }}>{n.icon}</span>
            <p className="text-[12px] text-white/60 font-medium">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneOutro() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-[11px] uppercase tracking-[0.5em] text-white/30 font-semibold mb-6 animate-scene-label">Tu momento</p>
      <h2 className="text-[2.5rem] sm:text-[4rem] font-extralight text-white tracking-tight mb-6 animate-scene-title">Tu ventaja empieza aqui</h2>
      <p className="text-[14px] text-white/25 font-extralight animate-scene-sub">Para inversores que toman sus propias decisiones.</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCENES CONFIG
   ══════════════════════════════════════════════ */

const SCENES: { component: () => React.ReactNode; duration: number }[] = [
  { component: SceneIntro, duration: 3500 },
  { component: SceneBriefing, duration: 6000 },
  { component: ScenePortfolio, duration: 6000 },
  { component: SceneRecommendations, duration: 5500 },
  { component: SceneAI, duration: 7000 },
  { component: SceneDNA, duration: 5000 },
  { component: SceneStress, duration: 5500 },
  { component: SceneNotifications, duration: 5000 },
  { component: SceneOutro, duration: 4000 },
];

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */

export default function ShowcasePage() {
  const [current, setCurrent] = useState(-1);
  const [transitioning, setTransitioning] = useState(false);

  const advance = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setTransitioning(false);
    }, 800);
  };

  useEffect(() => {
    if (current < 0) return;
    if (current >= SCENES.length) return;
    const timer = setTimeout(advance, SCENES[current].duration);
    return () => clearTimeout(timer);
  }, [current]);

  const start = () => advance();
  const Scene = current >= 0 && current < SCENES.length ? SCENES[current].component : null;

  return (
    <main className="h-screen w-screen bg-black overflow-hidden relative">

      {/* Start screen */}
      {current < 0 && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <p className="text-[16px] tracking-[0.3em] uppercase font-semibold text-white/60 mb-2" style={{ transform: "scaleY(0.88)" }}>FinPulse</p>
          <p className="text-[12px] text-white/20 mb-10">Pulsa para iniciar — graba la pantalla primero (Win+G)</p>
          <button onClick={start} className="text-[11px] uppercase tracking-[0.25em] font-semibold bg-white text-black px-10 py-4 hover:bg-white/90 transition-all">
            Iniciar showcase
          </button>
        </div>
      )}

      {/* Scene */}
      {Scene && (
        <div className={`absolute inset-0 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${transitioning ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"}`}>
          <Scene />
        </div>
      )}

      {/* End screen */}
      {current >= SCENES.length && (
        <div className="absolute inset-0 bg-black flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <p className="text-[2rem] tracking-[0.3em] uppercase font-semibold text-white/80" style={{ transform: "scaleY(0.85)" }}>FinPulse</p>
            <p className="text-[13px] text-white/20 mt-3 tracking-wide">finpulse.app</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {current >= 0 && current < SCENES.length && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {SCENES.map((_, i) => (
            <div key={i} className={`h-[3px] rounded-full transition-all duration-700 ${i === current ? "w-8 bg-white/50" : i < current ? "w-2 bg-white/15" : "w-2 bg-white/[0.06]"}`} />
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes scene-title { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scene-label { 0% { opacity: 0; letter-spacing: 0.8em; } 100% { opacity: 1; letter-spacing: 0.5em; } }
        @keyframes scene-sub { 0% { opacity: 0; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scene-card { 0% { opacity: 0; transform: translateY(30px) scale(0.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes stagger-in { 0% { opacity: 0; transform: translateX(10px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes notif-in { 0% { opacity: 0; transform: translateY(15px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes msg-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }

        .animate-scene-title { animation: scene-title 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .animate-scene-label { animation: scene-label 1.2s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-scene-sub { animation: scene-sub 2s ease both; }
        .animate-scene-card { animation: scene-card 1s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        .animate-stagger-in { animation: stagger-in 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-notif-in { animation: notif-in 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-msg-in { animation: msg-in 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-fade-in { animation: fade-in 1.5s ease both; }
      `}</style>
    </main>
  );
}
