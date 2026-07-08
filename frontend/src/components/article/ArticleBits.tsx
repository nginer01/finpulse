"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";
import SourceLink from "@/components/article/SourceLink";

/* ------------------------------------------------------------------ */
/*  Iconos SVG limpios (stroke 1.5, sin emojis)                        */
/* ------------------------------------------------------------------ */

export function Icon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "newspaper":
      return (
        <svg {...common}>
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
          <path d="M7 8h6v4H7V8zM7 16h6" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M17 7h4v4" />
        </svg>
      );
    case "sectors":
      return (
        <svg {...common}>
          <path d="M4 21V9l5-4v16M9 21V13l5-3v11M14 21V12l6-3v12" />
          <path d="M2 21h20" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3z" />
        </svg>
      );
    case "lens":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3M8 11h6M11 8v6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18M8 15h4" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3l9.5 16.5H2.5L12 3z" />
          <path d="M12 10v4M12 17.5v.5" />
        </svg>
      );
    case "thread":
      return (
        <svg {...common}>
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="6" cy="19" r="2" />
          <path d="M6 7v3M6 14v3M12 5h8M12 12h8M12 19h8" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4h12v17l-6-4-6 4V4z" />
        </svg>
      );
    case "bookmark-filled":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h12v17l-6-4-6 4V4z" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="17" cy="6" r="2.5" />
          <circle cx="17" cy="18" r="2.5" />
          <path d="M8.3 10.8l6.4-3.6M8.3 13.2l6.4 3.6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M8 6l10 6-10 6V6z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M4 12h16M14 6l6 6-6 6" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="M20 12H4M10 6l-6 6 6 6" />
        </svg>
      );
    case "candles":
      return (
        <svg {...common}>
          <path d="M7 3v3M7 15v6M17 3v6M17 18v3" />
          <rect x="5" y="6" width="4" height="9" rx="1" />
          <rect x="15" y="9" width="4" height="9" rx="1" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 15V3M7 8l5-5 5 5M4 21h16" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 14a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.4 1.4" />
          <path d="M14 10a5 5 0 00-7.07 0l-2.83 2.83a5 5 0 007.07 7.07l1.4-1.4" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 10.5 4M20 4v7h-7" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6V3z" />
          <path d="M14 3v4h4M9 12h6M9 16h6" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M3 17l5-5 4 4 3-3 6 6" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 0112 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" />
          <path d="M10 19.5a2.2 2.2 0 004 0" />
        </svg>
      );
    case "theme":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 3.5v17M12 3.5a8.5 8.5 0 010 17" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "plug":
      return (
        <svg {...common}>
          <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 01-5 5v0a5 5 0 01-5-5V8z" />
          <path d="M12 16v5" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2.2M12 17v.5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3M12 15v2" />
        </svg>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Kicker — cabecera de sección de artículo con icono                 */
/* ------------------------------------------------------------------ */

export function Kicker({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <span className="w-9 h-9 shrink-0 rounded-full border border-[color:var(--art-ring)] flex items-center justify-center text-muted">
        <Icon name={icon} className="w-[15px] h-[15px]" />
      </span>
      <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80 whitespace-nowrap">{children}</span>
      <div className="flex-1 h-[1px] bg-[color:var(--art-hairline)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PullQuote — cita destacada con línea vertical                      */
/* ------------------------------------------------------------------ */

export function PullQuote({ quote, source, meta, sourceId }: { quote: string; source: string; meta?: string; sourceId?: string }) {
  return (
    <blockquote className="border-l-2 border-[color:var(--art-rule-strong)] pl-6 sm:pl-8 my-10">
      <p className="text-[19px] sm:text-[21px] font-extralight italic leading-[1.7] text-[color:var(--art-bright)] tracking-wide">&ldquo;{quote}&rdquo;</p>
      <footer className="mt-4 flex items-baseline gap-3">
        {sourceId ? (
          <SourceLink sourceId={sourceId} className="text-[12px] uppercase tracking-[0.2em] font-semibold">
            {source}
          </SourceLink>
        ) : (
          <span className="text-[12px] uppercase tracking-[0.2em] font-semibold text-foreground">{source}</span>
        )}
        {meta && <span className="text-[12px] text-muted">{meta}</span>}
      </footer>
    </blockquote>
  );
}

/* ------------------------------------------------------------------ */
/*  InlineImage — figura con pie de foto                               */
/* ------------------------------------------------------------------ */

export function InlineImage({ src, alt, caption, height = "h-64 sm:h-80" }: { src: string; alt: string; caption?: string; height?: string }) {
  return (
    <figure className="my-12 group">
      <div className={`relative overflow-hidden rounded-2xl ${height}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/15" />
      </div>
      {caption && <figcaption className="text-[12px] text-muted mt-3 leading-relaxed">{caption}</figcaption>}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  VideoCard — placeholder elegante de vídeo embebido                 */
/* ------------------------------------------------------------------ */

export function VideoCard({ poster, title, duration }: { poster: string; title: string; duration: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <figure className="my-12">
      <button
        type="button"
        onClick={() => {
          setPressed(true);
          setTimeout(() => setPressed(false), 2200);
        }}
        className="relative w-full overflow-hidden rounded-2xl h-64 sm:h-80 group cursor-pointer block text-left"
        aria-label={`Reproducir vídeo: ${title}`}
      >
        <img src={poster} alt={title} className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full border border-white/40 bg-white/[0.08] backdrop-blur-sm flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
            <Icon name="play" className="w-6 h-6 ml-0.5" />
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-semibold mb-1.5">Vídeo</p>
            <p className="text-[15px] text-white font-light tracking-wide">{title}</p>
          </div>
          <span className="text-[11px] font-semibold text-white/90 bg-black/50 border border-white/20 rounded-full px-3 py-1" style={{ fontVariantNumeric: "tabular-nums" }}>
            {duration}
          </span>
        </div>
        {pressed && (
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.2em] font-semibold text-white bg-black/70 border border-white/20 rounded-full px-4 py-2 animate-fade-in-up">
            Vídeo disponible con el briefing en vivo
          </span>
        )}
      </button>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  DataTip — dato numérico con tooltip en hover                       */
/* ------------------------------------------------------------------ */

export function DataTip({ value, tip, direction }: { value: string; tip: string; direction?: "up" | "down" | "flat" }) {
  const color =
    direction === "up" ? "text-[color:var(--pnl-up)]" : direction === "down" ? "text-[color:var(--pnl-down)]" : "text-foreground";
  return (
    <Tooltip text={tip}>
      <span className={`font-semibold border-b border-dotted border-[color:var(--art-rule-strong)] ${color}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  ShareBar — Guardar / Compartir con feedback                        */
/* ------------------------------------------------------------------ */

const SAVED_EVENT = "finpulse-saved-change";

function subscribeSaved(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(SAVED_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(SAVED_EVENT, cb);
  };
}

export function ShareBar({ title, storageKey }: { title: string; storageKey: string }) {
  const saved = useSyncExternalStore(
    subscribeSaved,
    () => {
      try {
        return localStorage.getItem(`finpulse-saved-${storageKey}`) === "1";
      } catch {
        return false;
      }
    },
    () => false
  );
  const [copied, setCopied] = useState(false);

  const toggleSave = () => {
    try {
      if (saved) localStorage.removeItem(`finpulse-saved-${storageKey}`);
      else {
        localStorage.setItem(`finpulse-saved-${storageKey}`, "1");
        import("@/lib/tracking").then(({ track }) => track({ eventType: "save", topic: storageKey.startsWith("semanal") ? "resumen semanal" : "briefing diario" }));
      }
      window.dispatchEvent(new Event(SAVED_EVENT));
    } catch {}
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const base =
    "inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.25em] font-semibold px-7 py-3.5 rounded-full border transition-all duration-500 cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={toggleSave} className={`${base} ${saved ? "border-white bg-white text-black" : "border-white/[0.2] text-foreground hover:border-white/50"}`}>
        <Icon name={saved ? "bookmark-filled" : "bookmark"} className="w-3.5 h-3.5" />
        {saved ? "Guardado" : "Guardar resumen"}
      </button>
      <button type="button" onClick={share} className={`${base} border-white/[0.2] text-foreground hover:border-white/50`}>
        <Icon name={copied ? "check" : "share"} className="w-3.5 h-3.5" />
        {copied ? "Enlace copiado" : "Compartir"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                         */
/* ------------------------------------------------------------------ */

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-x-3 gap-y-1">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/50">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {it.href ? (
            <Link href={it.href} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300">
              {it.label}
            </Link>
          ) : (
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-foreground">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionDivider — diamante + líneas (design bible, app oscura)      */
/* ------------------------------------------------------------------ */

export function SectionDivider({ className = "my-20" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="w-14 h-[1px] bg-[color:var(--art-rule)]" />
      <div className="w-1.5 h-1.5 rounded-full border border-[color:var(--art-ring)]" />
      <div className="w-14 h-[1px] bg-[color:var(--art-rule)]" />
    </div>
  );
}
