"use client";

import { useEffect, useRef, useState } from "react";

export interface BarRow {
  label: string;
  value: number; // % con signo
  note?: string;
}

/**
 * Barras horizontales divergentes desde eje central (performance por sector).
 * Verde/rojo codifican dirección — siempre acompañadas del valor con signo.
 * Barras finas (18px), extremo redondeado 4px, base cuadrada, animación de llenado.
 */
export default function BarsChart({
  data,
  className = "",
  ariaLabel = "Performance por sector",
}: {
  data: BarRow[];
  className?: string;
  ariaLabel?: string;
}) {
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
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value))) || 1;

  return (
    <div ref={wrapRef} className={`relative ${className}`} role="img" aria-label={ariaLabel}>
      <div className="relative">
        {/* eje central hairline */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/[0.1]" style={{ marginLeft: 0 }} />

        <div className="space-y-[10px]">
          {data.map((d, i) => {
            const positive = d.value >= 0;
            // 42% máx por lado: deja sitio para la etiqueta de valor al extremo
            const w = (Math.abs(d.value) / maxAbs) * 42;
            const color = positive ? "#30d158" : "#ff453a";
            return (
              <div
                key={d.label}
                className={`relative h-[30px] rounded-lg transition-colors duration-300 ${hover === i ? "bg-white/[0.04]" : ""}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {/* etiqueta del sector */}
                <span
                  className={`absolute top-1/2 -translate-y-1/2 text-[11px] tracking-wide text-[#c8c8cd] whitespace-nowrap ${
                    positive ? "right-[51%] pr-3 text-right" : "left-[51%] pl-3"
                  }`}
                >
                  {d.label}
                </span>

                {/* barra */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-[18px]"
                  style={{
                    left: positive ? "50%" : `${50 - w}%`,
                    width: visible ? `${w}%` : "0%",
                    backgroundColor: color,
                    borderRadius: positive ? "0 4px 4px 0" : "4px 0 0 4px",
                    transition: `width 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms, left 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
                    ...(visible ? {} : { left: "50%" }),
                  }}
                />

                {/* valor al extremo de la barra */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#f5f5f7] whitespace-nowrap transition-opacity duration-500"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    opacity: visible ? 1 : 0,
                    transitionDelay: `${i * 70 + 600}ms`,
                    ...(positive ? { left: `calc(${50 + w}% + 8px)` } : { right: `calc(${50 + w}% + 8px)` }),
                  }}
                >
                  {positive ? "+" : ""}
                  {d.value.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </span>

                {/* tooltip */}
                {hover === i && d.note && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-20 rounded-xl bg-[#1d1d1f] border border-white/[0.12] px-3.5 py-2 shadow-xl shadow-black/50 whitespace-nowrap pointer-events-none">
                    <p className="text-[11px] text-[#c8c8cd]">{d.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
