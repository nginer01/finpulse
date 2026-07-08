"use client";

import { useEffect, useState, useRef } from "react";
import useReducedMotion from "@/hooks/useReducedMotion";

export default function AnimatedCounter({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
  decimals = 2,
  className = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (hasAnimated.current) return;
    if (reduce) {
      hasAnimated.current = true;
      const raf = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, reduce]);

  const formatted = display.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
