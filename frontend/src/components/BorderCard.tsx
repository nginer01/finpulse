"use client";

import { useRef, useEffect, useCallback } from "react";

export default function BorderCard({
  children,
  className = "",
  padding = "p-5",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
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
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          strokeDasharray="0"
          strokeDashoffset="0"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className={`bg-card/60 border border-card-border rounded-2xl ${padding} relative z-0 transition-all duration-500 group-hover:border-white/[0.15] group-hover:bg-card/80`}>
        {children}
      </div>
    </div>
  );
}
