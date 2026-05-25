"use client";

import { useEffect, useState, useRef } from "react";

/* ══════════════════════════════════════════════
   ANIMATED MOCK DATA
   ══════════════════════════════════════════════ */

const TICKERS = [
  { ticker: "IWDA", name: "iShares MSCI World", base: 4230, weight: 32.9 },
  { ticker: "VUAA", name: "Vanguard S&P 500", base: 3150, weight: 24.5 },
  { ticker: "BRT", name: "Brent Crude Oil", base: 1200, weight: 9.3 },
  { ticker: "EUNA", name: "iShares Euro Gov Bond", base: 2400, weight: 18.7 },
  { ticker: "SEMI", name: "VanEck Semiconductor", base: 1867, weight: 14.5 },
];

const NOTIFICATIONS = [
  { type: "buy", text: "SEMI +4.2% — Tu mejor posicion hoy", icon: "▲", color: "#30d158" },
  { type: "alert", text: "VIX en 13.2 — Zona de complacencia", icon: "⚠", color: "#ffd60a" },
  { type: "sell", text: "Brent -3.8% — Considera reducir exposicion", icon: "▼", color: "#ff453a" },
  { type: "ai", text: "Recomendacion IA: Mantener VUAA (8/10)", icon: "◆", color: "#bf5af2" },
  { type: "buy", text: "S&P 500 en maximos historicos +1.2%", icon: "▲", color: "#30d158" },
  { type: "ai", text: "BCE recorte junio: probabilidad 73%", icon: "◆", color: "#bf5af2" },
  { type: "alert", text: "Earnings TSMC el 22 mayo — Vigila SEMI", icon: "⚠", color: "#ffd60a" },
  { type: "buy", text: "Felicidades: +308€ esta semana (+2.4%)", icon: "★", color: "#30d158" },
];

function useAnimatedValue(base: number, volatility = 0.003, speed = 2000) {
  const [value, setValue] = useState(base);
  const [change, setChange] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * volatility * base;
      setValue((v) => {
        const next = v + delta;
        setChange(((next - base) / base) * 100);
        return next;
      });
    }, speed + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [base, volatility, speed]);
  return { value, change };
}

/* ══════════════════════════════════════════════
   ANIMATED CHART
   ══════════════════════════════════════════════ */

function LiveChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize data
    let price = 5847;
    for (let i = 0; i < 80; i++) {
      price += (Math.random() - 0.47) * 15;
      dataRef.current.push(price);
    }

    const draw = () => {
      const data = dataRef.current;
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = canvas.offsetHeight * 2;
      ctx.clearRect(0, 0, w, h);

      // Add new point
      const last = data[data.length - 1];
      data.push(last + (Math.random() - 0.47) * 15);
      if (data.length > 120) data.shift();

      const min = Math.min(...data) - 10;
      const max = Math.max(...data) + 10;
      const stepX = w / (data.length - 1);

      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      const isUp = data[data.length - 1] > data[0];
      grad.addColorStop(0, isUp ? "rgba(48, 209, 88, 0.15)" : "rgba(255, 69, 58, 0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.beginPath();
      ctx.moveTo(0, h);
      data.forEach((d, i) => {
        const x = i * stepX;
        const y = h - ((d - min) / (max - min)) * h;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h);
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = i * stepX;
        const y = h - ((d - min) / (max - min)) * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = isUp ? "#30d158" : "#ff453a";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pulse dot at end
      const lastX = (data.length - 1) * stepX;
      const lastY = h - ((data[data.length - 1] - min) / (max - min)) * h;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = isUp ? "#30d158" : "#ff453a";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
      ctx.strokeStyle = isUp ? "rgba(48,209,88,0.3)" : "rgba(255,69,58,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const interval = setInterval(draw, 800);
    draw();
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

/* ══════════════════════════════════════════════
   NOTIFICATION TOAST
   ══════════════════════════════════════════════ */

function NotificationStream() {
  const [visible, setVisible] = useState<number[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    const show = () => {
      const idx = indexRef.current % NOTIFICATIONS.length;
      indexRef.current++;
      setVisible((v) => [...v.slice(-2), idx]);

      // Remove after 4s
      setTimeout(() => {
        setVisible((v) => v.slice(1));
      }, 4000);
    };

    show();
    const interval = setInterval(show, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 w-[280px]">
      {visible.map((idx, i) => {
        const n = NOTIFICATIONS[idx];
        return (
          <div key={`${idx}-${i}`} className="animate-slide-in bg-[#1d1d1f]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl">
            <span className="text-lg" style={{ color: n.color }}>{n.icon}</span>
            <p className="text-[11px] text-white/80 font-medium leading-[1.5]">{n.text}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   POSITION ROW
   ══════════════════════════════════════════════ */

function Position({ ticker, name, base, weight }: { ticker: string; name: string; base: number; weight: number }) {
  const { value, change } = useAnimatedValue(base, 0.002, 2500);
  const isUp = change >= 0;
  const [flash, setFlash] = useState(false);
  const prevChange = useRef(change);

  useEffect(() => {
    if (Math.abs(change - prevChange.current) > 0.05) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    prevChange.current = change;
  }, [change]);

  return (
    <div className={`flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0 transition-colors duration-600 ${flash ? (isUp ? "bg-[#30d158]/[0.04]" : "bg-[#ff453a]/[0.04]") : ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/60">{ticker.slice(0, 2)}</div>
        <div>
          <p className="text-[13px] font-medium text-white">{ticker}</p>
          <p className="text-[10px] text-white/30">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[13px] font-medium tabular-nums transition-colors duration-300 ${flash ? (isUp ? "text-[#30d158]" : "text-[#ff453a]") : "text-white"}`}>
          {value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-[11px] font-semibold tabular-nums ${isUp ? "text-[#30d158]" : "text-[#ff453a]"}`}>
          {isUp ? "+" : ""}{change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SENTIMENT GAUGE
   ══════════════════════════════════════════════ */

function SentimentGauge() {
  const [value, setValue] = useState(62);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((v) => Math.max(40, Math.min(85, v + (Math.random() - 0.5) * 3)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const color = value > 70 ? "#30d158" : value > 50 ? "#ffd60a" : "#ff453a";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-[2s] ease-out" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[14px] font-extralight tabular-nums transition-colors duration-1000" style={{ color }}>{Math.round(value)}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN DEMO PAGE
   ══════════════════════════════════════════════ */

export default function DemoPage() {
  const { value: totalValue, change: totalChange } = useAnimatedValue(12847.32, 0.001, 2000);
  const isUp = totalChange >= 0;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[14px] tracking-[0.25em] uppercase font-semibold" style={{ transform: "scaleY(0.88)", display: "inline-block" }}>FinPulse</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium">Demo en vivo</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">

        {/* Portfolio hero */}
        <div className="relative mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium mb-3">Portfolio total</p>
          <div className="flex items-end gap-4 mb-1">
            <p className="text-4xl sm:text-5xl font-extralight tracking-tight tabular-nums">
              {totalValue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-lg text-white/20 ml-2">EUR</span>
            </p>
          </div>
          <p className={`text-[14px] font-medium tabular-nums ${isUp ? "text-[#30d158]" : "text-[#ff453a]"}`}>
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}{totalChange.toFixed(2)}% hoy
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Chart */}
          <div className="lg:col-span-2 relative bg-[#1d1d1f]/40 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">S&P 500</p>
                <p className="text-[20px] font-extralight tabular-nums">5.847,32</p>
              </div>
              <div className="flex gap-1">
                {["1D", "1S", "1M", "6M", "1A"].map((t, i) => (
                  <button key={t} className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${i === 2 ? "bg-white/10 text-white" : "text-white/30"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[280px] px-2 pb-2">
              <LiveChart />
            </div>
            <NotificationStream />
          </div>

          {/* Positions */}
          <div className="bg-[#1d1d1f]/40 border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Posiciones</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
                <span className="text-[10px] text-white/40 font-medium">En vivo</span>
              </div>
            </div>
            {TICKERS.map((t) => (
              <Position key={t.ticker} {...t} />
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

          {/* Sentiment */}
          <div className="bg-[#1d1d1f]/40 border border-white/[0.06] rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-4">Sentimiento de mercado</p>
            <SentimentGauge />
            <p className="text-[11px] text-white/25 mt-3">Basado en VIX, Polymarket y flujos</p>
          </div>

          {/* AI Recommendation */}
          <div className="bg-[#1d1d1f]/40 border border-white/[0.06] rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-4">Recomendacion IA</p>
            <p className="text-[18px] font-extralight tracking-wide mb-1">Reducir Brent 50%</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#ff453a]/20 text-[#ff453a] font-medium">Conviccion 8/10</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 font-medium">3 fuentes</span>
            </div>
          </div>

          {/* Investor DNA mini */}
          <div className="bg-[#1d1d1f]/40 border border-white/[0.06] rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-4">Tu Investor DNA</p>
            <div className="space-y-3">
              {[
                { l: "Disciplina", v: 78, c: "#fff" },
                { l: "Timing", v: 54, c: "#ff453a" },
                { l: "Diversificacion", v: 82, c: "#30d158" },
              ].map((t) => (
                <div key={t.l}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/30">{t.l}</span>
                    <span className="text-white/60 font-medium">{t.v}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full animate-bar-grow" style={{ width: `${t.v}%`, backgroundColor: t.c, opacity: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          0% { opacity: 0; transform: translateX(40px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bar-grow {
          0% { width: 0; }
        }
        .animate-bar-grow {
          animation: bar-grow 1.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
