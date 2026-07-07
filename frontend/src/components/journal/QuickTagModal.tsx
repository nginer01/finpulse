"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TAG_GROUPS,
  EMOTIONAL_TAGS,
  TICKER_TOPICS,
  saveDecision,
  type PendingOperation,
  type JournalDecision,
  type DecisionInput,
} from "@/lib/journal";
import { track } from "@/lib/tracking";

const SOURCE_LABEL: Record<string, string> = {
  email: "Detectada por email",
  csv: "Importada de CSV",
  manual: "Manual",
};

type Props = {
  /** Operación de broker detectada; si falta, el modal pide los datos (registro manual). */
  operation?: PendingOperation | null;
  onClose: () => void;
  onSaved: (decision: JournalDecision, demo: boolean) => void;
};

export default function QuickTagModal({ operation, onClose, onSaved }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [conviction, setConviction] = useState(7);
  const [thesis, setThesis] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  // Campos del registro manual (solo sin operación)
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isBuy = operation ? operation.operation_type === "buy" : action === "buy";
  const effectiveTicker = (operation?.ticker || ticker).toUpperCase();

  const canSave = useMemo(() => {
    if (tags.length === 0 || saving) return false;
    if (!operation) {
      return !!ticker.trim() && parseFloat(quantity) > 0 && parseFloat(price) > 0;
    }
    return true;
  }, [tags, saving, operation, ticker, quantity, price]);

  const toggleTag = (key: string) =>
    setTags((prev) => (prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]));

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    const input: DecisionInput = operation
      ? {
          ticker: operation.ticker,
          action: operation.operation_type,
          price: operation.price,
          quantity: operation.quantity,
          conviction,
          tags,
          thesis: thesis.trim(),
          date: operation.date,
          operation_id: operation.id,
        }
      : {
          ticker: effectiveTicker,
          action,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          conviction,
          tags,
          thesis: thesis.trim(),
        };

    try {
      const { decision, demo } = await saveDecision(input);
      // Señal de personalización: decisión sobre una posición = portfolio_view;
      // tags emocionales o defensivos sobre cartera → concern.
      const negative = tags.some((t) => EMOTIONAL_TAGS.has(t) || t === "stop-loss" || t === "noticia-negativa");
      track({
        eventType: "portfolio_view",
        topic: TICKER_TOPICS[effectiveTicker] || effectiveTicker.toLowerCase(),
        tickers: [effectiveTicker],
        negative,
        source: "journal",
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      });
      onSaved(decision, demo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la decisión");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-[20px] border border-white/[0.12] bg-[#131315] p-8 sm:p-10 shadow-2xl shadow-black/70 animate-fade-in-up"
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

        <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80 mb-4">Decision Journal</p>

        {/* Resumen de la operación */}
        {operation ? (
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span
              className={`text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full border ${
                isBuy ? "border-green/40 text-green" : "border-red/40 text-red"
              }`}
            >
              {isBuy ? "Compra" : "Venta"}
            </span>
            <span className="text-[26px] font-extralight tracking-tight text-foreground">{operation.ticker}</span>
            <span className="text-[14px] text-[#c8c8cd]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {operation.quantity} uds × {operation.price.toFixed(2)}
            </span>
            <span className="text-[11px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{operation.date}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-full border border-white/[0.12] text-muted">
              {SOURCE_LABEL[operation.source] || operation.source}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Ticker"
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
                  {a === "buy" ? "Compra" : "Venta"}
                </button>
              ))}
            </div>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Unidades"
              inputMode="decimal"
              className="bg-background border border-card-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-white/30 outline-none"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio"
              inputMode="decimal"
              className="bg-background border border-card-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-white/30 outline-none"
            />
          </div>
        )}

        <p className="text-[13px] text-muted leading-relaxed mb-6">
          ¿Por qué {isBuy ? "compraste" : "vendiste"}? Elige al menos un motivo — 2 segundos ahora, una lección dentro de 90 días.
        </p>

        {/* Tags rápidos */}
        <div className="space-y-5 mb-7">
          {TAG_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/70 mb-2.5">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((t) => {
                  const on = tags.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleTag(t.key)}
                      className={`px-3.5 py-1.5 rounded-full border text-[11px] tracking-wide font-medium transition-all duration-300 cursor-pointer ${
                        on
                          ? "bg-white text-black border-white"
                          : "border-white/[0.12] text-[#c8c8cd] hover:border-white/30 hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Convicción */}
        <div className="mb-7">
          <div className="flex items-baseline justify-between mb-2.5">
            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/70">Convicción</p>
            <span className="text-[20px] font-extralight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              {conviction}<span className="text-[12px] text-muted">/10</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setConviction(n)}
                aria-label={`Convicción ${n}`}
                className={`flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  n <= conviction ? "bg-white" : "bg-white/[0.1] hover:bg-white/[0.25]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Nota opcional */}
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="Tesis opcional — ¿qué tendría que pasar para que esta decisión fuera un error?"
          rows={2}
          className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 leading-relaxed focus:border-white/30 outline-none resize-none mb-6"
        />

        {error && <p className="text-[12px] text-red mb-4">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold rounded-full px-7 py-3.5 transition-all duration-500 ${
              canSave
                ? "bg-white text-black hover:tracking-[0.3em] cursor-pointer"
                : "bg-white/[0.08] text-muted cursor-not-allowed"
            }`}
          >
            {saving ? "Guardando…" : "Guardar decisión"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground px-2 py-3 transition-colors duration-300 cursor-pointer"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
