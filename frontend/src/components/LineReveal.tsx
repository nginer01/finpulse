"use client";

import { useEffect, useRef, useState } from "react";
import useReducedMotion from "@/hooks/useReducedMotion";

/**
 * Titular revelado línea a línea con máscara (overflow-hidden + translate-y).
 * CSS puro, sin librerías de motion. Respeta prefers-reduced-motion.
 */
export default function LineReveal({
  lines,
  as: Tag = "div",
  className = "",
  lineClassName = "",
  startDelay = 0,
  stagger = 90,
}: {
  lines: string[];
  as?: "h1" | "h2" | "div";
  className?: string;
  lineClassName?: string;
  startDelay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    const el = ref.current;
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
  }, [reduce]);

  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span
            className={`block will-change-transform transition-transform duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              visible ? "translate-y-0" : "translate-y-full"
            } ${lineClassName}`}
            style={{ transitionDelay: reduce ? "0ms" : `${startDelay + i * stagger}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
