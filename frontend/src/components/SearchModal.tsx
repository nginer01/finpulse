"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type SearchResult = {
  type: "noticia" | "posicion" | "decision" | "pagina";
  title: string;
  subtitle: string;
  href: string;
  icon: string;
};

const allResults: SearchResult[] = [
  { type: "noticia", title: "Acuerdo comercial EEUU-China", subtitle: "Impacto en ETFs globales", href: "/noticia", icon: "N" },
  { type: "noticia", title: "Negociaciones Iran-EEUU", subtitle: "Brent cae 4% en la semana", href: "/noticia", icon: "N" },
  { type: "noticia", title: "Nvidia Blackwell Ultra", subtitle: "Semiconductores se reconfiguran", href: "/noticia", icon: "N" },
  { type: "noticia", title: "Regulacion IA en Europa", subtitle: "Nuevo marco legal 2027", href: "/noticia", icon: "N" },
  { type: "noticia", title: "Escasez global de cobre", subtitle: "Transicion energetica en riesgo", href: "/noticia", icon: "N" },
  { type: "noticia", title: "India vs China emergentes", subtitle: "Rotacion de capital", href: "/noticia", icon: "N" },
  { type: "posicion", title: "IWDA — iShares MSCI World", subtitle: "4.230,00 — +1.8%", href: "/portfolio", icon: "P" },
  { type: "posicion", title: "VUAA — Vanguard S&P 500", subtitle: "3.150,00 — +2.1%", href: "/portfolio", icon: "P" },
  { type: "posicion", title: "BRT — Brent Crude Oil", subtitle: "1.200,00 — -3.8%", href: "/portfolio", icon: "P" },
  { type: "posicion", title: "EUNA — iShares Euro Gov Bond", subtitle: "2.400,00 — +0.5%", href: "/portfolio", icon: "P" },
  { type: "posicion", title: "SEMI — VanEck Semiconductor", subtitle: "1.867,32 — +4.2%", href: "/portfolio", icon: "P" },
  { type: "decision", title: "Venta parcial BRT", subtitle: "8 mayo — Score 9/10", href: "/aprendizaje", icon: "D" },
  { type: "decision", title: "Compra SEMI", subtitle: "2 mayo — Score 7/10", href: "/aprendizaje", icon: "D" },
  { type: "decision", title: "Compra EUNA", subtitle: "25 abril — Score 6/10", href: "/aprendizaje", icon: "D" },
  { type: "pagina", title: "Resumen diario", subtitle: "Briefing completo de hoy", href: "/resumen", icon: "R" },
  { type: "pagina", title: "Portfolio", subtitle: "Tus posiciones e inversiones", href: "/portfolio", icon: "R" },
  { type: "pagina", title: "Aprendizaje", subtitle: "Investor DNA, decisiones, sesgos", href: "/aprendizaje", icon: "R" },
  { type: "pagina", title: "Resumen semanal", subtitle: "Review de la semana", href: "/semanal", icon: "R" },
  { type: "pagina", title: "Stress Test", subtitle: "Simula escenarios historicos", href: "/stress-test", icon: "R" },
  { type: "pagina", title: "Comparador", subtitle: "Compara activos lado a lado", href: "/comparador", icon: "R" },
  { type: "pagina", title: "Ajustes", subtitle: "Configuracion de la app", href: "/ajustes", icon: "R" },
];

const typeColors: Record<string, string> = {
  noticia: "bg-rose-500/15 text-rose-400",
  posicion: "bg-green/15 text-green",
  decision: "bg-amber-500/15 text-amber-400",
  pagina: "bg-accent/15 text-accent-light",
};

const typeLabels: Record<string, string> = {
  noticia: "Noticia",
  posicion: "Posicion",
  decision: "Decision",
  pagina: "Pagina",
};

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const filtered = query.length > 0
    ? allResults.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allResults.slice(0, 8);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-card-border rounded-2xl w-full max-w-xl mx-4 shadow-2xl shadow-black/40 overflow-hidden animate-fade-in-up">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-card-border">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-muted">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar noticias, posiciones, decisiones..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted"
          />
          <kbd className="hidden sm:inline text-xs text-muted bg-card-border px-2 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="py-2">
              {query.length === 0 && (
                <p className="px-5 py-2 text-xs text-muted">Recientes y sugeridos</p>
              )}
              {filtered.map((result, i) => (
                <Link
                  key={i}
                  href={result.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${typeColors[result.type]}`}>
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted truncate">{result.subtitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${typeColors[result.type]}`}>
                    {typeLabels[result.type]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
          <span>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
          <span className="hidden sm:inline">
            <kbd className="bg-card-border px-1.5 py-0.5 rounded mr-1">Ctrl</kbd>
            <kbd className="bg-card-border px-1.5 py-0.5 rounded">K</kbd>
            para buscar
          </span>
        </div>
      </div>
    </div>
  );
}
