"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadAlerts, dismissAlert, distanceToLevel, type ThesisAlert } from "@/lib/alerts";

/*
 * Campana de alertas — conectada a Tesis → Alertas automáticas.
 * Disparadas arriba (tesis rota/tocada), luego las vigiladas con su margen.
 */

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return "hace minutos";
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export default function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [alerts, setAlerts] = useState<ThesisAlert[] | null>(null);

  useEffect(() => {
    if (open && alerts === null) {
      loadAlerts().then((d) => setAlerts(d.alerts));
    }
  }, [open, alerts]);

  if (!open) return null;

  const triggered = (alerts || []).filter((a) => a.status === "triggered");
  const active = (alerts || []).filter((a) => a.status === "active");

  const handleDismiss = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await dismissAlert(id);
    const d = await loadAlerts();
    setAlerts(d.alerts);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-14 right-4 z-50 w-96 max-h-[80vh] bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Alertas de tesis</h3>
            {triggered.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red/20 text-red font-medium">{triggered.length}</span>
            )}
          </div>
          <Link href="/alertas" onClick={onClose} className="text-xs text-accent-light hover:text-accent transition-colors">
            Gestionar →
          </Link>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto divide-y divide-card-border">
          {alerts === null ? (
            <p className="p-6 text-xs text-muted animate-pulse">Comprobando niveles…</p>
          ) : triggered.length === 0 && active.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-foreground font-medium mb-1">Sin tesis vigiladas</p>
              <p className="text-xs text-muted leading-relaxed">
                Escribe una tesis o escanea tu journal — la IA extraerá los niveles de invalidación y los vigilará por ti.
              </p>
            </div>
          ) : (
            <>
              {triggered.map((a) => {
                const broken = a.severity === "invalidacion";
                return (
                  <div key={a.id} className={`p-4 ${broken ? "bg-red/5" : "bg-[#ffd60a]/5"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse ${broken ? "bg-red" : "bg-[#ffd60a]"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {a.ticker} — {broken ? "tesis rota" : "tesis tocada"} {a.condition === "price_below" ? "bajo" : "sobre"}{" "}
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{a.level.toFixed(2)}</span>
                          </p>
                          <span className="text-xs text-muted shrink-0">{timeAgo(a.triggered_at)}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted mb-2">{a.thesis_summary}</p>
                        <button
                          onClick={(e) => handleDismiss(a.id, e)}
                          className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {active.map((a) => {
                const dist = distanceToLevel(a);
                const near = dist !== null && dist <= 5;
                return (
                  <div key={a.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${near ? "bg-[#ffd60a]" : "bg-green opacity-50"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted truncate">
                            <span className="text-foreground font-medium">{a.ticker}</span>{" "}
                            {a.condition === "price_below" ? "↓" : "↑"}{" "}
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{a.level.toFixed(2)}</span>
                            <span className="text-muted/70"> · {a.severity === "invalidacion" ? "invalidación" : "aviso"}</span>
                          </p>
                          {dist !== null && (
                            <span
                              className={`text-xs shrink-0 font-semibold ${near ? "text-[#ffd60a]" : "text-green"}`}
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {dist >= 0 ? "+" : ""}{dist.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-card-border">
          <Link
            href="/alertas"
            onClick={onClose}
            className="block text-center text-[10px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors py-1"
          >
            Ver todas las tesis vigiladas
          </Link>
        </div>
      </div>
    </>
  );
}

export function AlertsBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-1.5 rounded-lg hover:bg-black/[0.05] transition-colors"
      title="Alertas"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M13.5 6.75a4.5 4.5 0 1 0-9 0c0 4.5-2.25 5.625-2.25 5.625h13.5s-2.25-1.125-2.25-5.625" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.297 14.625a1.5 1.5 0 0 1-2.594 0" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
