"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  GLOSSARY,
  LEVEL_LABELS,
  getGlossaryLevel,
  setGlossaryLevel,
  type GlossaryLevel,
} from "@/lib/glossary";
import { track } from "@/lib/tracking";

/*
 * Glosario contextual — patrón SourceLink pero para conceptos.
 * Reposo: texto limpio. Hover: dorado (conocimiento) + icono libro.
 * Popover con definición según nivel (Básico/Medio/Pro, cambiable al vuelo
 * y persistente). Consultar emite señal de tracking del tema.
 * El dorado #d9b984 es EXCEPCIÓN deliberada a la paleta mono: marca
 * "esto es un concepto del glosario" (como el azul marca fuentes).
 *
 * El popover se renderiza en un PORTAL con posición fija: los Reveal de las
 * páginas de artículo llevan transform (stacking context propio), y un
 * popover absoluto quedaría pintado bajo el navbar sticky.
 */

const GOLD = "#d9b984";
const POP_WIDTH = 340;

type Pos = { top: number; left: number; below: boolean };

export default function Term({ k, children }: { k: string; children?: React.ReactNode }) {
  const entry = GLOSSARY[k];
  const [pos, setPos] = useState<Pos | null>(null); // null = cerrado
  const [pinned, setPinned] = useState(false);
  const [level, setLevel] = useState<GlossaryLevel>("medio");
  const [hover, setHover] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tracked = useRef(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const open = pos !== null;

  useEffect(() => {
    setLevel(getGlossaryLevel());
  }, []);

  // Cerrar con Escape, click fuera o scroll (posición fija ⇒ quedaría desanclado)
  useEffect(() => {
    if (!open) return;
    const close = () => {
      setPos(null);
      setPinned(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || popRef.current?.contains(t)) return;
      close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close);
    };
  }, [open]);

  if (!entry) return <>{children ?? k}</>;

  const computePos = (): Pos | null => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const vw = window.innerWidth;
    const width = Math.min(POP_WIDTH, vw - 24);
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 12), vw - width - 12);
    // Bajo el navbar sticky (60px) hace falta ~holgura para abrir hacia arriba
    const below = rect.top < 340;
    const top = below ? rect.bottom + 10 : rect.top - 10;
    return { top, left, below };
  };

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setHover(true);
    timer.current = setTimeout(() => {
      setLevel(getGlossaryLevel()); // el nivel puede haber cambiado desde otro término
      setPos(computePos());
      if (!tracked.current) {
        tracked.current = true;
        track({ eventType: "expand", topic: entry.category, source: "glossary" });
      }
    }, 180);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setHover(false);
    if (!pinned) {
      timer.current = setTimeout(() => setPos(null), 250);
    }
  };

  const keepOpen = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  const changeLevel = (l: GlossaryLevel) => {
    setLevel(l);
    setGlossaryLevel(l);
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => {
          setPinned(!pinned);
          setPos(computePos());
        }}
        className="inline font-medium transition-all duration-300 cursor-help border-b"
        style={{
          color: hover || open ? GOLD : "inherit",
          backgroundColor: hover || open ? "rgba(184,134,11,0.10)" : "transparent",
          borderBottomColor: hover || open ? GOLD : "transparent",
          borderBottomWidth: 1,
        }}
        aria-expanded={open}
        aria-label={`Glosario: ${entry.term}`}
      >
        {children ?? entry.term}
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`inline-block ml-1 -mt-0.5 transition-all duration-300 ${hover || open ? "opacity-100" : "opacity-0 -translate-x-1"}`}
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
        </svg>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popRef}
            onMouseEnter={keepOpen}
            onMouseLeave={hide}
            className="fixed z-[120] rounded-2xl border border-white/[0.12] bg-[#131315] p-5 shadow-2xl shadow-black/60 animate-fade-in-up text-left"
            style={{
              top: pos.top,
              left: pos.left,
              width: Math.min(POP_WIDTH, typeof window !== "undefined" ? window.innerWidth - 24 : POP_WIDTH),
              transform: pos.below ? "none" : "translateY(-100%)",
            }}
            role="tooltip"
          >
            {/* Cabecera */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-[14px] font-semibold text-foreground tracking-wide">{entry.term}</span>
              <span
                className="text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border"
                style={{ borderColor: "rgba(184,134,11,0.4)", color: GOLD }}
              >
                {entry.category}
              </span>
              {/* Selector de profundidad */}
              <span className="ml-auto flex gap-1">
                {(Object.keys(LEVEL_LABELS) as GlossaryLevel[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeLevel(l);
                    }}
                    className={`text-[9px] uppercase tracking-[0.1em] font-semibold px-1.5 py-0.5 rounded transition-colors duration-300 cursor-pointer ${
                      level === l ? "bg-white text-black" : "text-muted hover:text-foreground"
                    }`}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </span>
            </div>

            {/* Definición según nivel */}
            <p className="text-[13px] leading-[1.8] text-[#c8c8cd] font-normal">{entry.levels[level]}</p>

            {/* Ejemplo ligado al portfolio */}
            {entry.example && (
              <p className="mt-3 pl-3 border-l-2 text-[12px] leading-[1.7] text-muted italic font-normal" style={{ borderColor: "rgba(184,134,11,0.35)" }}>
                {entry.example}
              </p>
            )}

            <p className="mt-3 text-[9px] uppercase tracking-[0.2em] font-semibold text-muted/50">
              Glosario FinPulse · profundidad {LEVEL_LABELS[level].toLowerCase()}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}
