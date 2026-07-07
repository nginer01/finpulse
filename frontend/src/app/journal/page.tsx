"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import QuickTagModal from "@/components/journal/QuickTagModal";
import {
  loadJournal,
  requestReview,
  syncEmail,
  syncCsv,
  TAG_LABELS,
  EMOTIONAL_TAGS,
  type JournalData,
  type JournalDecision,
  type PendingOperation,
} from "@/lib/journal";

/* ── Helpers de presentación ── */

const RESULT_META: Record<string, { label: string; cls: string }> = {
  good: { label: "Acertada", cls: "border-green/40 text-green" },
  neutral: { label: "Neutral", cls: "border-white/20 text-[#c8c8cd]" },
  bad: { label: "Fallida", cls: "border-red/40 text-red" },
};

const SOURCE_LABEL: Record<string, string> = { email: "email", csv: "CSV", manual: "manual" };

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function Pct({ entry, after, horizon }: { entry: number; after: number | null; horizon: string }) {
  if (!after) {
    return (
      <span className="text-[11px] text-muted/60" style={{ fontVariantNumeric: "tabular-nums" }}>
        {horizon} —
      </span>
    );
  }
  const pct = ((after - entry) / entry) * 100;
  const cls = pct > 0.05 ? "text-green" : pct < -0.05 ? "text-red" : "text-[#c8c8cd]";
  return (
    <span className="text-[11px]" style={{ fontVariantNumeric: "tabular-nums" }}>
      <span className="text-muted/60">{horizon} </span>
      <span className={`font-semibold ${cls}`}>{pct > 0 ? "+" : ""}{pct.toFixed(1)}%</span>
    </span>
  );
}

/** Render mínimo del review IA: párrafos + **negritas**. */
function AiReview({ text }: { text: string }) {
  return (
    <div className="space-y-2.5">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="text-[13px] leading-[1.85] text-[#c8c8cd]">
          {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#1d1d1f]/60 border border-card-border rounded-2xl p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/70 mb-2">{label}</p>
      <p className="text-[30px] sm:text-[34px] font-extralight tracking-tight text-foreground leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-muted mt-2">{sub}</p>}
    </div>
  );
}

/* ── Página ── */

export default function JournalPage() {
  const [data, setData] = useState<JournalData | null>(null);
  const [tagging, setTagging] = useState<PendingOperation | null | "manual">(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [openReview, setOpenReview] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setData(await loadJournal());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSaved = (decision: JournalDecision, demo: boolean) => {
    setTagging(null);
    setNotice(demo ? "Decisión guardada en local (modo demo, sin sesión backend)." : "Decisión registrada en tu journal.");
    refresh();
  };

  const handleSyncEmail = async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const res = await syncEmail();
      setNotice(res.message);
      await refresh();
    } catch {
      setNotice("Sincronización por email no disponible (requiere sesión y Gmail dedicado configurado).");
    } finally {
      setSyncing(false);
    }
  };

  const handleCsv = async (file: File) => {
    setSyncing(true);
    setNotice(null);
    try {
      const res = await syncCsv(file);
      setNotice(res.message);
      await refresh();
    } catch {
      setNotice("No se pudo importar el CSV (requiere sesión backend). Exporta el extracto desde Revolut → Historial.");
    } finally {
      setSyncing(false);
    }
  };

  const handleReview = async (id: number) => {
    setReviewing(id);
    setNotice(null);
    try {
      await requestReview(id);
      await refresh();
      setOpenReview((prev) => new Set(prev).add(id));
      setNotice("Evaluación retrospectiva completada.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "La evaluación IA requiere sesión backend y precios posteriores a la decisión.");
    } finally {
      setReviewing(null);
    }
  };

  const toggleReview = (id: number) =>
    setOpenReview((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted animate-pulse">Cargando journal…</p>
      </main>
    );
  }

  const { decisions, pending, stats, demo } = data;
  const withThesis = decisions.filter((d) => d.thesis.trim()).length;
  const emotional = decisions.filter((d) => d.tags.some((t) => EMOTIONAL_TAGS.has(t))).length;
  const discipline = decisions.length ? Math.round((withThesis / decisions.length) * 100) : 0;
  const emotionalPct = decisions.length ? Math.round((emotional / decisions.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Header */}
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80 mb-4">Decision Journal</p>
          <h1 className="text-4xl sm:text-5xl md:text-[3.6rem] font-extralight tracking-tight text-foreground leading-[1.08] mb-5">
            Cada decisión,<br />una lección.
          </h1>
          <p className="text-[15px] text-muted leading-[1.9] max-w-[640px]">
            Tus compras y ventas en Revolut entran solas — por email de confirmación o CSV. Tú solo pones el porqué en 2 segundos;
            la IA vuelve a los 30 y 90 días para evaluar el <span className="text-foreground font-medium">proceso</span>, no solo el resultado.
          </p>
        </Reveal>

        {demo && (
          <Reveal delay={100}>
            <p className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1.5 rounded-full border border-[#ffd60a]/30 text-[#ffd60a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd60a]" />
              Modo demo — inicia sesión para el journal real
            </p>
          </Reveal>
        )}

        {/* Stats */}
        <Reveal delay={120}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <StatTile label="Decisiones" value={String(stats.total_decisions)} sub={`${stats.pending} sin evaluar`} />
            <StatTile label="Acierto" value={`${stats.accuracy}%`} sub={`${stats.good} acertadas · ${stats.bad} fallidas`} />
            <StatTile label="Convicción media" value={`${stats.avg_conviction}`} sub="sobre 10" />
            <StatTile
              label="Proceso emocional"
              value={`${emotionalPct}%`}
              sub={emotionalPct > 25 ? "FOMO/miedo por encima de lo sano" : "bajo control"}
            />
          </div>
        </Reveal>

        {/* Aviso */}
        {notice && (
          <div className="mt-6 flex items-center justify-between gap-4 bg-[#1d1d1f]/60 border border-card-border rounded-xl px-5 py-3.5">
            <p className="text-[13px] text-[#c8c8cd]">{notice}</p>
            <button onClick={() => setNotice(null)} className="text-muted hover:text-foreground text-[11px] uppercase tracking-[0.15em] font-semibold cursor-pointer shrink-0">
              Cerrar
            </button>
          </div>
        )}

        {/* Operaciones detectadas sin etiquetar */}
        {pending.length > 0 && (
          <Reveal delay={150}>
            <section className="mt-10 bg-[#1d1d1f]/60 border border-[#ffd60a]/25 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffd60a] animate-pulse" />
                <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#ffd60a]">
                  {pending.length} {pending.length === 1 ? "operación detectada" : "operaciones detectadas"} sin etiquetar
                </h2>
              </div>
              <p className="text-[13px] text-muted mb-6">Detectadas automáticamente en tu broker. Ponles el porqué antes de que se te olvide.</p>
              <div className="space-y-3">
                {pending.map((op) => (
                  <div key={op.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-background/60 border border-card-border rounded-xl px-5 py-4">
                    <span
                      className={`text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 rounded-full border ${
                        op.operation_type === "buy" ? "border-green/40 text-green" : "border-red/40 text-red"
                      }`}
                    >
                      {op.operation_type === "buy" ? "Compra" : "Venta"}
                    </span>
                    <span className="text-[17px] font-semibold tracking-wide text-foreground">{op.ticker}</span>
                    <span className="text-[13px] text-[#c8c8cd]" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {op.quantity} uds × {op.price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtDate(op.date)}</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted/70">vía {SOURCE_LABEL[op.source]}</span>
                    <button
                      onClick={() => setTagging(op)}
                      className="ml-auto text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-5 py-2.5 hover:tracking-[0.3em] transition-all duration-500 cursor-pointer"
                    >
                      Etiquetar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* Sincronización */}
        <Reveal delay={180}>
          <section className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border border-card-border rounded-2xl px-6 py-5 bg-[#1d1d1f]/40">
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-1">Broker conectado — Revolut</p>
              <p className="text-[12px] text-muted leading-relaxed">
                Auto-sync por emails de confirmación en el Gmail dedicado; el CSV del historial funciona como respaldo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncEmail}
                disabled={syncing}
                className="text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/20 text-foreground rounded-full px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-500 cursor-pointer disabled:opacity-50"
              >
                {syncing ? "Sincronizando…" : "Buscar en email"}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={syncing}
                className="text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/20 text-foreground rounded-full px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-500 cursor-pointer disabled:opacity-50"
              >
                Importar CSV
              </button>
              <button
                onClick={() => setTagging("manual")}
                className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground px-2 py-2.5 transition-colors duration-300 cursor-pointer"
              >
                + Manual
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCsv(f);
                  e.target.value = "";
                }}
              />
            </div>
          </section>
        </Reveal>

        {/* Timeline de decisiones */}
        <section className="mt-14">
          <Reveal>
            <div className="flex items-center gap-4 mb-8">
              <span className="w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </span>
              <h2 className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80">Historial de decisiones</h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          </Reveal>

          {decisions.length === 0 ? (
            <p className="text-[14px] text-muted">Aún no hay decisiones registradas. Sincroniza tu broker o registra una manualmente.</p>
          ) : (
            <div className="space-y-4">
              {[...decisions]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((d, i) => {
                  const meta = d.result ? RESULT_META[d.result] : null;
                  const isOpen = openReview.has(d.id);
                  return (
                    <Reveal key={d.id} delay={Math.min(i * 60, 300)}>
                      <article className="bg-[#1d1d1f]/60 border border-card-border rounded-2xl p-6 sm:p-7 hover:border-white/[0.16] transition-colors duration-500">
                        {/* Cabecera */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                          <span
                            className={`text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 rounded-full border ${
                              d.action === "buy" ? "border-green/40 text-green" : "border-red/40 text-red"
                            }`}
                          >
                            {d.action === "buy" ? "Compra" : "Venta"}
                          </span>
                          <span className="text-[19px] font-semibold tracking-wide text-foreground">{d.ticker}</span>
                          <span className="text-[13px] text-[#c8c8cd]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {d.quantity} uds × {d.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtDate(d.date)}</span>
                          {d.operation_id !== null && (
                            <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-muted/70 border border-white/[0.1] rounded-full px-2 py-0.5">
                              auto-sync
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-3">
                            <span className="text-[11px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                              convicción <span className="text-foreground font-semibold">{d.conviction}/10</span>
                            </span>
                            {meta ? (
                              <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 rounded-full border ${meta.cls}`}>
                                {meta.label}
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 rounded-full border border-[#ffd60a]/30 text-[#ffd60a]">
                                Sin evaluar
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {d.tags.map((t) => (
                            <span
                              key={t}
                              className={`text-[10px] tracking-wide font-medium px-2.5 py-1 rounded-full border ${
                                EMOTIONAL_TAGS.has(t) ? "border-[#ffd60a]/30 text-[#ffd60a]" : "border-white/[0.12] text-[#c8c8cd]"
                              }`}
                            >
                              {TAG_LABELS[t] || t}
                            </span>
                          ))}
                        </div>

                        {/* Tesis */}
                        {d.thesis && (
                          <blockquote className="border-l-2 border-white/[0.15] pl-4 mb-4">
                            <p className="text-[13px] leading-[1.8] text-[#c8c8cd] italic">{d.thesis}</p>
                          </blockquote>
                        )}

                        {/* Evolución + acciones */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <Pct entry={d.price} after={d.price_after_7d} horizon="+7d" />
                          <Pct entry={d.price} after={d.price_after_30d} horizon="+30d" />
                          <Pct entry={d.price} after={d.price_after_90d} horizon="+90d" />
                          <span className="ml-auto flex items-center gap-4">
                            {d.ai_review ? (
                              <button
                                onClick={() => toggleReview(d.id)}
                                className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
                              >
                                {isOpen ? "Ocultar evaluación IA" : "Ver evaluación IA"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReview(d.id)}
                                disabled={reviewing === d.id}
                                className="text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/20 text-foreground rounded-full px-4 py-2 hover:bg-white hover:text-black transition-all duration-500 cursor-pointer disabled:opacity-50"
                              >
                                {reviewing === d.id ? "Evaluando…" : "Evaluar con IA"}
                              </button>
                            )}
                          </span>
                        </div>

                        {/* Review IA */}
                        {d.ai_review && isOpen && (
                          <div className="mt-5 bg-background/60 border border-card-border rounded-xl p-5">
                            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/70 mb-3">Evaluación retrospectiva — CIO FinPulse</p>
                            <AiReview text={d.ai_review} />
                            {d.lesson && (
                              <p className="mt-3 text-[12px] text-[#ffd60a]/90">
                                <span className="uppercase tracking-[0.15em] font-semibold text-[10px]">Lección guardada · </span>
                                {d.lesson}
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    </Reveal>
                  );
                })}
            </div>
          )}
        </section>

        {/* Conexión con Investor DNA */}
        <Reveal delay={100}>
          <section className="mt-14 border border-card-border rounded-2xl p-6 sm:p-8 bg-[#1d1d1f]/40">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-2">Esto alimenta tu Investor DNA</p>
                <p className="text-[13px] text-muted leading-[1.9] max-w-[560px]">
                  <span className="text-foreground font-medium">{discipline}%</span> de tus decisiones llevan tesis escrita (disciplina) y{" "}
                  <span className="text-foreground font-medium">{emotionalPct}%</span> incluyen motivos emocionales (control emocional).
                  {stats.best_ticker && (
                    <> Tu mejor historial está en <span className="text-green font-semibold">{stats.best_ticker}</span>
                    {stats.worst_ticker && stats.worst_ticker !== stats.best_ticker && (
                      <> y el peor en <span className="text-red font-semibold">{stats.worst_ticker}</span></>
                    )}.</>
                  )}
                </p>
              </div>
              <Link
                href="/aprendizaje"
                className="shrink-0 text-[10px] uppercase tracking-[0.25em] font-semibold border border-white/20 text-foreground rounded-full px-6 py-3 hover:bg-white hover:text-black transition-all duration-500"
              >
                Ver mi Investor DNA
              </Link>
            </div>
          </section>
        </Reveal>
      </div>

      {/* Modal de tags rápidos */}
      {tagging !== null && (
        <QuickTagModal
          operation={tagging === "manual" ? null : tagging}
          onClose={() => setTagging(null)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}
