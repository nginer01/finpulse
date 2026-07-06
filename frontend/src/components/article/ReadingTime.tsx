"use client";

import { useEffect, useState } from "react";

/**
 * Tiempo de lectura estimado calculado sobre el contenido REAL de la página
 * (palabras del <main> / 200 wpm). Sin cifras hardcodeadas: cuando el
 * pipeline genere resúmenes de ~1h/~2h, esto lo reflejará solo.
 */
export default function ReadingTime({ prefix = "Lectura estimada", className = "" }: { prefix?: string; className?: string }) {
  const [mins, setMins] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.querySelector("main");
      if (!el) return;
      const words = (el as HTMLElement).innerText.trim().split(/\s+/).length;
      setMins(Math.max(1, Math.round(words / 200)));
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}: {mins === null ? "…" : mins >= 90 ? `${Math.round(mins / 60)}+ horas` : mins >= 60 ? `~${Math.round(mins / 60)} hora${mins >= 90 ? "s" : ""}` : `~${mins} min`}
    </span>
  );
}
