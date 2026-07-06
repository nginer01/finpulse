"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mini línea de tendencia inline — tinta fina, sin ejes.
 * Para sidebars, tablas y stat tiles.
 */
export default function Sparkline({
  data,
  color = "#f5f5f7",
  width = 96,
  height = 28,
  className = "",
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const ref = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const path = ref.current;
    if (!path || !visible) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    // force reflow so the transition runs
    path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)";
    path.style.strokeDashoffset = "0";
  }, [visible]);

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [ex, ey] = pts[pts.length - 1];

  return (
    <span ref={wrapRef} className={`inline-block ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <path ref={ref} d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {visible && <circle cx={ex} cy={ey} r="2.5" fill={color} stroke="#000" strokeWidth="1.5" />}
      </svg>
    </span>
  );
}
