"use client";

import { useEffect, useState } from "react";
import { extractFromThesis, createAlerts, clientExtract, type Proposal } from "@/lib/alerts";

type Props = {
  onClose: () => void;
  onCreated: (count: number, demo: boolean) => void;
};

export default function NewThesisModal({ onClose, onCreated }: Props) {
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [thesis, setThesis] = useState("");
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [engine, setEngine] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const canAnalyze = ticker.trim().length > 0 && thesis.trim().length >= 20 && !busy;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setBusy(true);
    setError(null);
    try {
      const res = await extractFromThesis(ticker.trim().toUpperCase(), thesis.trim(), action);
      setProposals(res.proposals);
      setSummary(res.thesis_summary);
      setEngine(res.engine === "ia" ? "IA" : "heurística");
      setSelected(new Set(res.proposals.map((_, i) => i)));
      if (res.proposals.length === 0) setError("No se encontraron condiciones de precio en la tesis. Añade niveles explícitos (ej: \"si cae bajo los 66\").");
    } catch {
      const local = clientExtract(thesis, action);
      setProposals(local);
      setSummary(thesis.trim().slice(0, 180));
      setEngine("heurística local (demo)");
      setSelected(new Set(local.map((_, i) => i)));
      if (local.length === 0) setError("Sin sesión backend la extracción necesita niveles explícitos en el texto (ej: \"$66\", \"los 62\").");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!proposals || selected.size === 0 || busy) return;
    setBusy(true);
    const chosen = proposals.filter((_, i) => selected.has(i));
    const { demo } = await createAlerts(
      chosen.map((p) => ({
        ticker: ticker.trim().toUpperCase(),
        thesis_summary: summary,
        source_type: "manual" as const,
        source_id: null,
        condition: p.condition,
        level: p.level,
        severity: p.severity,
        rationale: p.rationale,
      }))
    );
    onCreated(chosen.length, demo);
  };

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[20px] border border-white/[0.12] bg-[#131315] p-8 sm:p-10 shadow-2xl shadow-black/70 animate-fade-in-up"
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

        <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80 mb-2">Nueva tesis vigilada</p>
        <h3 className="text-[24px] font-extralight tracking-tight text-foreground mb-6">
          Escribe la tesis. La IA pone los niveles.
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ticker (ej: BRT)"
            className="bg-background border border-card-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-white/30 outline-none uppercase"
          />
          <div className="flex rounded-lg border border-card-border overflow-hidden">
            {(["buy", "sell"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAction(a)}
                className={`flex-1 text-[10px] uppercase tracking-[0.15em] font-semibold transition-colors cursor-pointer ${
                  action === a ? (a === "buy" ? "bg-green/15 text-green" : "bg-red/15 text-red") : "text-muted hover:text-foreground"
                }`}
              >
                {a === "buy" ? "Tesis alcista" : "Tesis bajista"}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder='Ej: "La prima geopolítica sostiene el Brent. Si cae por debajo de $66 la tesis se debilita; $62 la invalida."'
          rows={4}
          className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 leading-relaxed focus:border-white/30 outline-none resize-none mb-5"
        />

        {proposals === null ? (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className={`inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold rounded-full px-7 py-3.5 transition-all duration-500 ${
              canAnalyze ? "bg-white text-black hover:tracking-[0.3em] cursor-pointer" : "bg-white/[0.08] text-muted cursor-not-allowed"
            }`}
          >
            {busy ? "Analizando…" : "Analizar tesis"}
          </button>
        ) : (
          <>
            {engine && proposals.length > 0 && (
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted/70 mb-3">
                Niveles extraídos · motor {engine}
              </p>
            )}
            <div className="space-y-2.5 mb-6">
              {proposals.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  className={`w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300 cursor-pointer ${
                    selected.has(i) ? "border-white/30 bg-white/[0.04]" : "border-white/[0.08] opacity-50 hover:opacity-80"
                  }`}
                >
                  <span className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center ${selected.has(i) ? "bg-white border-white" : "border-white/30"}`}>
                    {selected.has(i) && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2.5 mb-1">
                      <span className={`text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border ${
                        p.severity === "invalidacion" ? "border-red/40 text-red" : "border-[#ffd60a]/40 text-[#ffd60a]"
                      }`}>
                        {p.severity === "invalidacion" ? "Invalidación" : "Aviso"}
                      </span>
                      <span className="text-[13px] font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.condition === "price_below" ? "↓ por debajo de" : "↑ por encima de"} {p.level}
                      </span>
                    </span>
                    {p.rationale && <span className="block text-[12px] text-muted leading-relaxed">{p.rationale}</span>}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {proposals.length > 0 && (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={selected.size === 0 || busy}
                  className={`inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold rounded-full px-7 py-3.5 transition-all duration-500 ${
                    selected.size > 0 && !busy ? "bg-white text-black hover:tracking-[0.3em] cursor-pointer" : "bg-white/[0.08] text-muted cursor-not-allowed"
                  }`}
                >
                  {busy ? "Creando…" : `Vigilar ${selected.size} ${selected.size === 1 ? "nivel" : "niveles"}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setProposals(null);
                  setError(null);
                }}
                className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground px-2 py-3 transition-colors duration-300 cursor-pointer"
              >
                Editar tesis
              </button>
            </div>
          </>
        )}

        {error && <p className="text-[12px] text-[#ffd60a] mt-4 leading-relaxed">{error}</p>}
      </div>
    </div>
  );
}
