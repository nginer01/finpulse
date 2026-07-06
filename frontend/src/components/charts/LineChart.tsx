"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface LinePoint {
  label: string;
  value: number;
}

const fmt = (v: number, decimals: number) =>
  v.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Gráfica de línea animada estilo periódico financiero.
 * Serie única, trazo 2px, wash de área al 10%, gridlines hairline,
 * crosshair + tooltip en hover, dot final con anillo de superficie.
 */
export default function LineChart({
  data,
  height = 240,
  color = "#f5f5f7",
  unit = "",
  decimals = 0,
  endLabel = true,
  className = "",
  ariaLabel = "Gráfica de línea",
}: {
  data: LinePoint[];
  height?: number;
  color?: string;
  unit?: string;
  decimals?: number;
  endLabel?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const W = 600;
  const H = 200;
  const padL = 10;
  const padR = endLabel ? 64 : 14;
  const padT = 18;
  const padB = 26;

  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
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

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !visible) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)";
    path.style.strokeDashoffset = "0";
  }, [visible]);

  const { pts, min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    let mn = Math.min(...values);
    let mx = Math.max(...values);
    const span = mx - mn || Math.abs(mx) * 0.02 || 1;
    mn -= span * 0.12;
    mx += span * 0.12;
    const p = data.map((d, i) => {
      const x = padL + (i / (data.length - 1)) * (W - padL - padR);
      const y = padT + (1 - (d.value - mn) / (mx - mn)) * (H - padT - padB);
      return { x, y };
    });
    return { pts: p, min: mn, max: mx };
  }, [data, padR]);

  const gradId = useMemo(
    () => `lc-${data.length}-${Math.round(Math.abs(data[0]?.value ?? 0))}-${color.replace("#", "")}`,
    [data, color]
  );

  if (data.length < 2) return null;

  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${lineD} L${pts[pts.length - 1].x.toFixed(1)},${H - padB} L${pts[0].x.toFixed(1)},${H - padB} Z`;
  const last = pts[pts.length - 1];

  const ticks = [min + (max - min) * 0.9, min + (max - min) * 0.5, min + (max - min) * 0.1];

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHover(nearest);
  };

  const hv = hover !== null ? data[hover] : null;
  const hp = hover !== null ? pts[hover] : null;

  return (
    <div ref={wrapRef} className={`relative ${className}`} role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height }}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines — hairline, sólidas, recesivas */}
        {ticks.map((t, i) => {
          const y = padT + (1 - (t - min) / (max - min)) * (H - padT - padB);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR + 40} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <text x={W - 4} y={y - 4} textAnchor="end" fontSize="9.5" fill="#6e6e73" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(t, decimals)}
              </text>
            </g>
          );
        })}

        {/* área wash */}
        <path d={areaD} fill={`url(#${gradId})`} opacity={visible ? 1 : 0} style={{ transition: "opacity 1.6s ease 0.5s" }} />

        {/* línea */}
        <path ref={pathRef} d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

        {/* crosshair hover */}
        {hp && (
          <g>
            <line x1={hp.x} y1={padT - 6} x2={hp.x} y2={H - padB} stroke="rgba(255,255,255,0.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={hp.x} cy={hp.y} r="4.5" fill={color} stroke="#000" strokeWidth="2" />
          </g>
        )}

        {/* endpoint + label directo */}
        {visible && hover === null && (
          <g style={{ animation: "carousel-fade 0.8s ease 1.2s both" }}>
            <circle cx={last.x} cy={last.y} r="4.5" fill={color} stroke="#000" strokeWidth="2" />
            {endLabel && (
              <text x={last.x + 8} y={last.y + 3.5} fontSize="11" fontWeight="600" fill="#f5f5f7" style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(data[data.length - 1].value, decimals)}{unit}
              </text>
            )}
          </g>
        )}

        {/* etiquetas eje X */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.ceil(data.length / 8));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={pts[i].x} y={H - 8} textAnchor={i === data.length - 1 ? "end" : "middle"} fontSize="9.5" fill="#6e6e73">
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* tooltip */}
      {hv && hp && (
        <div
          className="absolute pointer-events-none z-20 -translate-x-1/2 rounded-xl bg-[#1d1d1f] border border-white/[0.12] px-3.5 py-2.5 shadow-xl shadow-black/50 text-center whitespace-nowrap"
          style={{ left: `${(hp.x / W) * 100}%`, top: Math.max(0, (hp.y / H) * height - 64) }}
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#86868b] font-medium">{hv.label}</p>
          <p className="text-[14px] font-semibold text-[#f5f5f7]" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(hv.value, decimals)}{unit}
          </p>
        </div>
      )}
    </div>
  );
}
