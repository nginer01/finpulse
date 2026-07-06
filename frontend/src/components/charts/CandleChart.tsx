"use client";

import { useEffect, useRef, useState } from "react";

export interface Candle {
  label: string;
  o: number;
  h: number;
  l: number;
  c: number;
}

const fmt = (v: number) => v.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/**
 * Velas japonesas animadas — volatilidad de la semana.
 * Verde/rojo por dirección de la vela, wick 2px, cuerpo ≤24px.
 */
export default function CandleChart({
  data,
  height = 200,
  className = "",
  ariaLabel = "Gráfica de velas",
}: {
  data: Candle[];
  height?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const W = 600;
  const H = 200;
  const padT = 14;
  const padB = 26;
  const padX = 26;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!data.length) return null;

  let min = Math.min(...data.map((d) => d.l));
  let max = Math.max(...data.map((d) => d.h));
  const span = max - min || 1;
  min -= span * 0.1;
  max += span * 0.1;
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const slot = (W - padX * 2) / data.length;
  const bodyW = Math.min(24, slot * 0.55);

  const ticks = [min + (max - min) * 0.85, min + (max - min) * 0.5, min + (max - min) * 0.15];
  const hv = hover !== null ? data[hover] : null;

  return (
    <div ref={wrapRef} className={`relative ${className}`} role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} preserveAspectRatio="none">
        {/* gridlines */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padX - 12} y1={y(t)} x2={W - 8} y2={y(t)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={W - 4} y={y(t) - 4} textAnchor="end" fontSize="9.5" fill="#6e6e73" style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = padX + slot * i + slot / 2;
          const up = d.c >= d.o;
          const color = up ? "#30d158" : "#ff453a";
          const top = y(Math.max(d.o, d.c));
          const bot = y(Math.min(d.o, d.c));
          const bodyH = Math.max(2, bot - top);
          return (
            <g
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.7s ease ${i * 110}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms`,
              }}
            >
              {/* wick */}
              <line x1={cx} y1={y(d.h)} x2={cx} y2={y(d.l)} stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {/* cuerpo */}
              <rect x={cx - bodyW / 2} y={top} width={bodyW} height={bodyH} rx="2" fill={color} stroke="#000" strokeWidth="1" />
              {/* etiqueta día */}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#6e6e73">
                {d.label}
              </text>
              {/* hit target ancho */}
              <rect
                x={padX + slot * i}
                y={0}
                width={slot}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hv && hover !== null && (
        <div
          className="absolute pointer-events-none z-20 -translate-x-1/2 rounded-xl bg-[#1d1d1f] border border-white/[0.12] px-3.5 py-2.5 shadow-xl shadow-black/50 whitespace-nowrap"
          style={{ left: `${((padX + slot * hover + slot / 2) / W) * 100}%`, top: 0 }}
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#86868b] font-medium mb-1">{hv.label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]" style={{ fontVariantNumeric: "tabular-nums" }}>
            <span className="text-[#86868b]">Apertura</span>
            <span className="text-right text-[#f5f5f7] font-medium">{fmt(hv.o)}</span>
            <span className="text-[#86868b]">Máximo</span>
            <span className="text-right text-[#f5f5f7] font-medium">{fmt(hv.h)}</span>
            <span className="text-[#86868b]">Mínimo</span>
            <span className="text-right text-[#f5f5f7] font-medium">{fmt(hv.l)}</span>
            <span className="text-[#86868b]">Cierre</span>
            <span className={`text-right font-medium ${hv.c >= hv.o ? "text-[#30d158]" : "text-[#ff453a]"}`}>{fmt(hv.c)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
