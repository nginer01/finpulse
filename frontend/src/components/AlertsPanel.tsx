"use client";

import { useState } from "react";

type Alert = {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "BRT rompe soporte $74",
    description: "Brent Crude ha caido por debajo de $74. Proximo soporte en $72. Tu posicion pierde -3.8% esta semana.",
    time: "Hace 2h",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "VIX en zona de complacencia",
    description: "VIX en 13.2 — historicamente, niveles sub-14 durante +2 semanas preceden correcciones del 3-5%.",
    time: "Hace 5h",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "Nueva recomendacion: reducir BRT",
    description: "Conviccion 8/10. Negociaciones Iran avanzan. Considerar reducir posicion un 50%.",
    time: "Hace 8h",
    read: false,
  },
  {
    id: "4",
    type: "info",
    title: "SEMI alcanza +4.2% semanal",
    description: "Tu mejor posicion esta semana. El ciclo de semiconductores se confirma tras evento Nvidia.",
    time: "Hace 1d",
    read: true,
  },
  {
    id: "5",
    type: "warning",
    title: "Earnings TSMC el 22 mayo",
    description: "Evento clave para tu posicion en SEMI. Puede confirmar o desmentir el ciclo expansivo.",
    time: "Hace 1d",
    read: true,
  },
  {
    id: "6",
    type: "info",
    title: "Resumen diario listo",
    description: "Tu resumen del 11 de mayo esta disponible. 14 fuentes procesadas.",
    time: "Hace 1d",
    read: true,
  },
];

const typeStyles = {
  critical: { dot: "bg-red", border: "border-red/20", bg: "bg-red/5", icon: "!" },
  warning: { dot: "bg-amber-400", border: "border-amber-400/20", bg: "bg-amber-400/5", icon: "⚠" },
  info: { dot: "bg-accent", border: "border-accent/20", bg: "bg-accent/5", icon: "i" },
};

export default function AlertsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [alerts, setAlerts] = useState(mockAlerts);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-14 right-4 z-50 w-96 max-h-[80vh] bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Alertas</h3>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red/20 text-red font-medium">{unreadCount}</span>
            )}
          </div>
          <button onClick={markAllRead} className="text-xs text-accent-light hover:text-accent transition-colors">
            Marcar todas leidas
          </button>
        </div>

        {/* Alerts list */}
        <div className="overflow-y-auto max-h-[65vh] divide-y divide-card-border">
          {alerts.map((alert) => {
            const style = typeStyles[alert.type];
            return (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-white/[0.02] ${!alert.read ? style.bg : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot} ${!alert.read ? "animate-pulse" : "opacity-40"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-sm font-medium truncate ${alert.read ? "text-muted" : "text-foreground"}`}>
                        {alert.title}
                      </p>
                      <span className="text-xs text-muted shrink-0">{alert.time}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${alert.read ? "text-muted/60" : "text-muted"}`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function AlertsBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
      title="Alertas"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M13.5 6.75a4.5 4.5 0 1 0-9 0c0 4.5-2.25 5.625-2.25 5.625h13.5s-2.25-1.125-2.25-5.625" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.297 14.625a1.5 1.5 0 0 1-2.594 0" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
