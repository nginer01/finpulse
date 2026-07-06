"use client";

import { useCallback, useEffect, useState } from "react";
import { SOURCES, SOURCE_TYPE_LABEL, findSourceByName, type SourceRef, type SourceType } from "@/lib/sources";

const typeColor: Record<SourceType, string> = {
  newsletter: "border-blue-400/30 text-blue-300",
  podcast: "border-purple-400/30 text-purple-300",
  polymarket: "border-emerald-400/30 text-emerald-300",
  x: "border-white/20 text-[#c8c8cd]",
  bank: "border-[#ffd60a]/30 text-[#ffd60a]",
  news: "border-rose-400/30 text-rose-300",
  paper: "border-white/20 text-[#c8c8cd]",
  web: "border-white/20 text-[#c8c8cd]",
};

/* ------------------------------------------------------------------ */
/*  Modal de fuente — compartido                                       */
/* ------------------------------------------------------------------ */

export function SourceModal({ source, onClose }: { source: SourceRef; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-carousel-fade" />
      <div
        className="relative w-full max-w-[520px] rounded-[20px] border border-white/[0.12] bg-[#131315] p-8 shadow-2xl shadow-black/70 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/[0.15] flex items-center justify-center text-muted hover:text-foreground hover:border-white/40 transition-all duration-300 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full border ${typeColor[source.type]}`}>
            {SOURCE_TYPE_LABEL[source.type]}
          </span>
          <span className="text-[11px] text-muted tracking-wide">{source.date}</span>
        </div>

        <p className="text-[12px] uppercase tracking-[0.25em] font-semibold text-muted mb-1.5">
          {source.name}
          {source.author && <span className="normal-case tracking-normal font-normal text-muted/70"> · {source.author}</span>}
        </p>
        <h3 className="text-[20px] font-extralight tracking-wide text-foreground leading-snug mb-5">{source.title}</h3>

        <blockquote className="border-l-2 border-white/20 pl-4 mb-7">
          <p className="text-[14px] leading-[1.8] text-[#c8c8cd] italic">&ldquo;{source.snippet}&rdquo;</p>
        </blockquote>

        <div className="flex items-center gap-3">
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-6 py-3 hover:tracking-[0.3em] transition-all duration-500"
            >
              Leer original
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ) : (
            <span className="text-[11px] text-muted">Original no disponible — procesado desde email</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground px-4 py-3 transition-colors duration-300 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SourceLink — texto inline clickeable que abre el modal             */
/* ------------------------------------------------------------------ */

export default function SourceLink({
  sourceId,
  children,
  className = "",
}: {
  sourceId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const source = SOURCES[sourceId];
  const close = useCallback(() => setOpen(false), []);
  if (!source) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline items-baseline text-left cursor-pointer text-foreground font-medium border-b border-dotted border-white/40 hover:border-white hover:text-white transition-colors duration-300 ${className}`}
        title={`Ver fuente: ${source.name}`}
      >
        {children}
        <svg
          className="inline-block ml-1 mb-0.5 opacity-50"
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      </button>
      {open && <SourceModal source={source} onClose={close} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  SourceChip — badge clickeable (listas de fuentes)                  */
/* ------------------------------------------------------------------ */

export function SourceChip({ name, sourceId }: { name: string; sourceId?: string }) {
  const [open, setOpen] = useState(false);
  const source = (sourceId && SOURCES[sourceId]) || findSourceByName(name);
  const close = useCallback(() => setOpen(false), []);

  const cls = source ? typeColor[source.type] : "border-white/15 text-muted";

  if (!source) {
    return <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border ${cls}`}>{name}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`text-[10px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded-full border cursor-pointer hover:bg-white/[0.06] transition-colors duration-300 ${cls}`}
        title={`Ver fuente: ${source.name}`}
      >
        {name}
      </button>
      {open && <SourceModal source={source} onClose={close} />}
    </>
  );
}
