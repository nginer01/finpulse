"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/article/ArticleBits";
import { loadDocs, sortDocs, ORIGIN_LABEL, DOCS_EVENT, type UserDoc, type DocFileType, type DocOrigin } from "@/lib/documents";

export const FILE_ICON: Record<DocFileType, string> = {
  pdf: "doc",
  img: "image",
  html: "link",
  eml: "mail",
  docx: "doc",
  txt: "doc",
};

export const ORIGIN_ICON: Record<DocOrigin, string> = {
  email: "mail",
  upload: "upload",
  url: "link",
  synpulse: "folder",
};

export function relevanceColor(r: number) {
  return r >= 80 ? "#30d158" : r >= 60 ? "#ffd60a" : "#86868b";
}

/* ------------------------------------------------------------------ */
/*  Modal de documento — resumen completo                              */
/* ------------------------------------------------------------------ */

export function DocModal({ doc, onClose }: { doc: UserDoc; onClose: () => void }) {
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
        className="relative w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-[20px] border border-white/[0.12] bg-[#131315] p-8 sm:p-10 shadow-2xl shadow-black/70 animate-fade-in-up"
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

        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full border border-white/[0.15] text-[#c8c8cd]">
            <Icon name={ORIGIN_ICON[doc.origin]} className="w-3 h-3" />
            {ORIGIN_LABEL[doc.origin]}
          </span>
          <span className="text-[11px] text-muted tracking-wide">{doc.sourceName} · {doc.date}</span>
        </div>

        <h3 className="text-[22px] font-extralight tracking-wide text-foreground leading-snug mb-5">{doc.title}</h3>

        {/* Relevancia */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted">Relevancia para tu portfolio</span>
          <div className="flex-1 h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${doc.relevance}%`, backgroundColor: relevanceColor(doc.relevance) }} />
          </div>
          <span className="text-[14px] font-semibold" style={{ color: relevanceColor(doc.relevance), fontVariantNumeric: "tabular-nums" }}>
            {doc.relevance}
          </span>
        </div>

        <p className="text-[14px] leading-[1.85] text-[#c8c8cd] mb-7">{doc.summary}</p>

        {/* Tags + tickers */}
        <div className="flex flex-wrap gap-2 mb-4">
          {doc.tags.map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-[0.12em] font-medium px-3 py-1 rounded-full bg-white/[0.05] text-[#c8c8cd]">
              {t}
            </span>
          ))}
        </div>
        {doc.tickers.length > 0 && (
          <p className="text-[11px] text-muted mb-7">
            Afecta a: {doc.tickers.map((t, i) => (
              <span key={t} className="text-foreground font-semibold">{i > 0 ? " · " : ""}{t}</span>
            ))}
          </p>
        )}

        <div className="flex items-center gap-3">
          {doc.url ? (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-6 py-3 hover:tracking-[0.3em] transition-all duration-500"
            >
              Ver original
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ) : (
            <span className="text-[11px] text-muted">Documento local — sin enlace original</span>
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
/*  Panel para /resumen — top documentos por relevancia + fecha        */
/* ------------------------------------------------------------------ */

export default function DocumentsPanel({ limit = 6 }: { limit?: number }) {
  const [docs, setDocs] = useState<UserDoc[]>([]);
  const [open, setOpen] = useState<UserDoc | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const refresh = () => setDocs(sortDocs(loadDocs().filter((d) => d.status === "procesado")));
    refresh();
    window.addEventListener(DOCS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DOCS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const shown = docs.slice(0, limit);

  return (
    <div>
      <div className="rounded-2xl border border-card-border overflow-hidden">
        {shown.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setOpen(d)}
            className={`w-full text-left flex items-start gap-4 sm:gap-5 px-5 sm:px-7 py-5 hover:bg-white/[0.03] transition-colors duration-300 cursor-pointer ${
              i > 0 ? "border-t border-white/[0.06]" : ""
            }`}
          >
            <span className="w-10 h-10 shrink-0 rounded-xl border border-white/[0.1] flex items-center justify-center text-muted mt-0.5">
              <Icon name={FILE_ICON[d.fileType]} className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0 block">
              <span className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] font-medium text-foreground tracking-wide leading-snug line-clamp-1">{d.title}</span>
                <span
                  className="shrink-0 text-[13px] font-semibold"
                  style={{ color: relevanceColor(d.relevance), fontVariantNumeric: "tabular-nums" }}
                  title="Relevancia para tu portfolio (0-100)"
                >
                  {d.relevance}
                </span>
              </span>
              <span className="block text-[13px] text-muted leading-relaxed mt-1 line-clamp-2">{d.snippet}</span>
              <span className="flex items-center gap-3 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold text-muted/80">
                  <Icon name={ORIGIN_ICON[d.origin]} className="w-3 h-3" />
                  {ORIGIN_LABEL[d.origin]}
                </span>
                <span className="text-[11px] text-muted/70" style={{ fontVariantNumeric: "tabular-nums" }}>{d.date}</span>
                {d.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[9px] uppercase tracking-[0.12em] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-muted">
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[10px] uppercase tracking-[0.2em] font-semibold text-muted group-hover:text-foreground">
                  Expandir
                </span>
              </span>
            </span>
          </button>
        ))}
        {shown.length === 0 && (
          <p className="px-7 py-8 text-[13px] text-muted">
            Aún no hay documentos procesados. Conecta tu email o sube documentos desde Ajustes.
          </p>
        )}
      </div>

      <Link
        href="/ajustes#documentos"
        className="mt-6 inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground transition-colors duration-300"
      >
        Gestionar mis documentos
        <Icon name="arrow-right" className="w-3.5 h-3.5" />
      </Link>

      {open && <DocModal doc={open} onClose={close} />}
    </div>
  );
}
