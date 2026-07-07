"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import NewThesisModal from "@/components/alerts/NewThesisModal";
import {
  loadAlerts,
  dismissAlert,
  scanJournal,
  distanceToLevel,
  type ThesisAlert,
} from "@/lib/alerts";

const SOURCE_LABEL: Record<string, string> = { journal: "Journal", document: "Documento", manual: "Manual" };

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }) + " " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

/** Barra de margen hasta el nivel: verde lejos, ámbar cerca, rojo al límite. */
function MarginBar({ alert }: { alert: ThesisAlert }) {
  const dist = distanceToLevel(alert);
  if (dist === null) {
    return <span className="text-[11px] text-muted/60">sin precio aún</span>;
  }
  const pct = Math.max(0, Math.min(dist, 30)); // escala 0-30%
  const width = (pct / 30) * 100;
  const color = dist <= 3 ? "#ff453a" : dist <= 10 ? "#ffd60a" : "#30d158";
  return (
    <div className="flex items-center gap-3 flex-1 min-w-[140px]">
      <div className="flex-1 h-[6px] rounded-full bg-white/[0.07] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-semibold shrink-0" style={{ color, fontVariantNumeric: "tabular-nums" }}>
        {dist >= 0 ? "+" : ""}{dist.toFixed(1)}% margen
      </span>
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

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<ThesisAlert[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    const data = await loadAlerts();
    setAlerts(data.alerts);
    setDemo(data.demo);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleScan = async () => {
    setScanning(true);
    setNotice(null);
    try {
      const res = await scanJournal();
      setNotice(`${res.message} (motor: ${res.engine === "ia" ? "IA" : "heurística"}).`);
      await refresh();
    } catch {
      setNotice("El escaneo del journal requiere sesión backend. En demo, las tesis del journal ya aparecen vigiladas.");
    } finally {
      setScanning(false);
    }
  };

  const handleDismiss = async (id: number) => {
    await dismissAlert(id);
    await refresh();
  };

  const { triggered, activeGroups, activeCount, lastChecked } = useMemo(() => {
    const list = alerts || [];
    const triggered = list.filter((a) => a.status === "triggered");
    const active = list.filter((a) => a.status === "active");
    const groups = new Map<string, ThesisAlert[]>();
    for (const a of active) {
      const key = `${a.ticker}|${a.thesis_summary}`;
      groups.set(key, [...(groups.get(key) || []), a]);
    }
    const lastChecked = list.reduce<string | null>(
      (acc, a) => (a.last_checked_at && (!acc || a.last_checked_at > acc) ? a.last_checked_at : acc),
      null
    );
    return { triggered, activeGroups: [...groups.entries()], activeCount: active.length, lastChecked };
  }, [alerts]);

  if (!alerts) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted animate-pulse">Cargando alertas…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Header */}
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80 mb-4">Tesis → Alertas automáticas</p>
          <h1 className="text-4xl sm:text-5xl md:text-[3.6rem] font-extralight tracking-tight text-foreground leading-[1.08] mb-5">
            Tu tesis, vigilada<br />las 24 horas.
          </h1>
          <p className="text-[15px] text-muted leading-[1.9] max-w-[640px]">
            La IA lee tus tesis — del journal, de tus documentos o escritas aquí — y extrae los niveles de precio que las{" "}
            <span className="text-foreground font-medium">invalidarían</span>. Cuando un nivel se cruza, te enteras antes de
            empezar a racionalizar la pérdida.
          </p>
        </Reveal>

        {demo && (
          <Reveal delay={100}>
            <p className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1.5 rounded-full border border-[#ffd60a]/30 text-[#ffd60a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd60a]" />
              Modo demo — inicia sesión para vigilancia real
            </p>
          </Reveal>
        )}

        {/* Stats */}
        <Reveal delay={120}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <StatTile label="Tesis vigiladas" value={String(activeGroups.length)} sub="con niveles activos" />
            <StatTile label="Niveles activos" value={String(activeCount)} sub="aviso + invalidación" />
            <StatTile label="Disparadas" value={String(triggered.length)} sub="requieren tu revisión" />
            <StatTile label="Última comprobación" value={lastChecked ? fmtDateTime(lastChecked).split(" ").slice(-1)[0] : "—"} sub={lastChecked ? fmtDateTime(lastChecked) : "aún sin chequeo"} />
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

        {/* Acciones */}
        <Reveal delay={150}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-6 py-3 hover:tracking-[0.3em] transition-all duration-500 cursor-pointer disabled:opacity-50"
            >
              {scanning ? "Escaneando…" : "Escanear tesis del journal"}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="text-[10px] uppercase tracking-[0.25em] font-semibold border border-white/20 text-foreground rounded-full px-6 py-3 hover:bg-white hover:text-black transition-all duration-500 cursor-pointer"
            >
              + Nueva tesis vigilada
            </button>
          </div>
        </Reveal>

        {/* Disparadas */}
        {triggered.length > 0 && (
          <section className="mt-12">
            <Reveal>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
                <h2 className="text-[11px] uppercase tracking-[0.3em] font-semibold text-red">Alertas disparadas</h2>
                <div className="flex-1 h-px bg-red/[0.15]" />
              </div>
            </Reveal>
            <div className="space-y-4">
              {triggered.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i * 60, 240)}>
                  <article className={`border rounded-2xl p-6 sm:p-7 ${a.severity === "invalidacion" ? "border-red/40 bg-red/[0.04]" : "border-[#ffd60a]/40 bg-[#ffd60a]/[0.04]"}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                      <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 rounded-full border ${
                        a.severity === "invalidacion" ? "border-red/50 text-red" : "border-[#ffd60a]/50 text-[#ffd60a]"
                      }`}>
                        {a.severity === "invalidacion" ? "Tesis rota" : "Tesis tocada"}
                      </span>
                      <span className="text-[19px] font-semibold tracking-wide text-foreground">{a.ticker}</span>
                      <span className="text-[13px] text-[#c8c8cd]" style={{ fontVariantNumeric: "tabular-nums" }}>
                        cruzó {a.condition === "price_below" ? "↓" : "↑"} {a.level.toFixed(2)} a {a.triggered_price?.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-muted">{fmtDateTime(a.triggered_at)}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-[0.15em] font-semibold text-muted/70 border border-white/[0.1] rounded-full px-2 py-0.5">
                        {SOURCE_LABEL[a.source_type]}
                      </span>
                    </div>
                    <blockquote className="border-l-2 border-white/[0.15] pl-4 mb-3">
                      <p className="text-[13px] leading-[1.8] text-[#c8c8cd] italic">{a.thesis_summary}</p>
                    </blockquote>
                    {a.rationale && <p className="text-[13px] text-muted leading-relaxed mb-4">{a.rationale}</p>}
                    <div className="flex flex-wrap items-center gap-4">
                      {a.source_type === "journal" && (
                        <Link
                          href="/journal"
                          className="text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/20 text-foreground rounded-full px-4 py-2 hover:bg-white hover:text-black transition-all duration-500"
                        >
                          Revisar decisión en el journal
                        </Link>
                      )}
                      <button
                        onClick={() => handleDismiss(a.id)}
                        className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
                      >
                        Descartar
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Tesis vigiladas */}
        <section className="mt-12">
          <Reveal>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-9 h-9 rounded-full border border-white/[0.12] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <h2 className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80">Tesis bajo vigilancia</h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          </Reveal>

          {activeGroups.length === 0 ? (
            <p className="text-[14px] text-muted">
              No hay tesis vigiladas. Escanea tu journal o escribe una tesis nueva — la IA extraerá los niveles.
            </p>
          ) : (
            <div className="space-y-4">
              {activeGroups.map(([key, group], i) => {
                const first = group[0];
                return (
                  <Reveal key={key} delay={Math.min(i * 60, 240)}>
                    <article className="bg-[#1d1d1f]/60 border border-card-border rounded-2xl p-6 sm:p-7 hover:border-white/[0.16] transition-colors duration-500">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                        <span className="text-[19px] font-semibold tracking-wide text-foreground">{first.ticker}</span>
                        {first.last_price && (
                          <span className="text-[13px] text-[#c8c8cd]" style={{ fontVariantNumeric: "tabular-nums" }}>
                            ahora {first.last_price.toFixed(2)}
                          </span>
                        )}
                        <span className="ml-auto text-[10px] uppercase tracking-[0.15em] font-semibold text-muted/70 border border-white/[0.1] rounded-full px-2 py-0.5">
                          {SOURCE_LABEL[first.source_type]}
                        </span>
                      </div>
                      <blockquote className="border-l-2 border-white/[0.15] pl-4 mb-5">
                        <p className="text-[13px] leading-[1.8] text-[#c8c8cd] italic">{first.thesis_summary}</p>
                      </blockquote>
                      <div className="space-y-3">
                        {[...group]
                          .sort((a, b) => (a.severity === "aviso" ? -1 : 1) - (b.severity === "aviso" ? -1 : 1))
                          .map((a) => (
                            <div key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                              <span className={`w-24 shrink-0 text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-1 rounded-full border text-center ${
                                a.severity === "invalidacion" ? "border-red/40 text-red" : "border-[#ffd60a]/40 text-[#ffd60a]"
                              }`}>
                                {a.severity === "invalidacion" ? "Invalidación" : "Aviso"}
                              </span>
                              <span className="w-28 shrink-0 text-[13px] text-foreground font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                                {a.condition === "price_below" ? "↓ bajo" : "↑ sobre"} {a.level.toFixed(2)}
                              </span>
                              <MarginBar alert={a} />
                              <button
                                onClick={() => handleDismiss(a.id)}
                                aria-label="Descartar nivel"
                                title="Descartar nivel"
                                className="shrink-0 w-6 h-6 rounded-full border border-white/[0.12] flex items-center justify-center text-muted hover:text-foreground hover:border-white/30 transition-all duration-300 cursor-pointer"
                              >
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                              </button>
                            </div>
                          ))}
                      </div>
                      {group.some((a) => a.rationale) && (
                        <p className="mt-4 text-[12px] text-muted leading-relaxed">
                          {group.find((a) => a.severity === "invalidacion")?.rationale || first.rationale}
                        </p>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        {/* Cómo funciona */}
        <Reveal delay={100}>
          <section className="mt-14 border border-card-border rounded-2xl p-6 sm:p-8 bg-[#1d1d1f]/40">
            <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-4">Cómo funciona</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                ["01", "La IA lee tu tesis", "Del Decision Journal, de tus documentos o escrita aquí. Entiende el argumento, no solo los números."],
                ["02", "Extrae la invalidación", "Los niveles que romperían la tesis — explícitos si los citas, razonables (±8/15%) si no."],
                ["03", "Vigila y avisa", "Precios reales comprobados cada vez que entras (y con cron, cada mañana). Si un nivel cae, lo sabes."],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <p className="text-[22px] font-extralight text-muted/50 mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>{n}</p>
                  <p className="text-[13px] font-semibold text-foreground tracking-wide mb-1.5">{t}</p>
                  <p className="text-[12px] text-muted leading-[1.8]">{d}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>

      {modalOpen && (
        <NewThesisModal
          onClose={() => setModalOpen(false)}
          onCreated={(count, isDemo) => {
            setModalOpen(false);
            setNotice(isDemo ? `${count} niveles vigilados (modo demo, guardado en local).` : `${count} niveles bajo vigilancia.`);
            refresh();
          }}
        />
      )}
    </main>
  );
}
