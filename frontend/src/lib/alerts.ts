/**
 * Tesis → alertas automáticas — cliente API + fallback demo.
 * La IA lee las tesis (Decision Journal, documentos o texto manual), extrae
 * los niveles de precio que las invalidarían y los vigila con precios reales
 * (POST /api/alerts/check). Sin sesión/backend: modo demo coherente con el
 * journal, con persistencia local de descartes y altas.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LOCAL_KEY = "finpulse-alerts-local-v1";

// ── Types ──

export type AlertCondition = "price_below" | "price_above";
export type AlertSeverity = "aviso" | "invalidacion";
export type AlertStatus = "active" | "triggered" | "dismissed";

export type ThesisAlert = {
  id: number;
  ticker: string;
  thesis_summary: string;
  source_type: "journal" | "document" | "manual";
  source_id: number | null;
  condition: AlertCondition;
  level: number;
  severity: AlertSeverity;
  rationale: string;
  status: AlertStatus;
  triggered_at: string | null;
  triggered_price: number | null;
  last_price: number | null;
  last_checked_at: string | null;
  created_at: string;
};

export type Proposal = {
  condition: AlertCondition;
  level: number;
  severity: AlertSeverity;
  rationale: string;
};

export type ExtractResult = {
  ticker: string;
  current_price: number | null;
  thesis_summary: string;
  proposals: Proposal[];
  engine: "ia" | "heuristica";
};

export type ScanResult = {
  scanned_theses: number;
  created: ThesisAlert[];
  engine: string;
  message: string;
};

export type AlertsData = {
  alerts: ThesisAlert[];
  demo: boolean;
};

// ── Auth + fetch ──

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("finpulse_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ── Mock (coherente con el Decision Journal demo) ──

export const MOCK_ALERTS: ThesisAlert[] = [
  // Tesis manual del usuario: Brent con niveles explícitos $66/$62
  {
    id: 501, ticker: "BRT",
    thesis_summary: "La prima geopolítica sostiene el Brent por encima de los 66; por debajo de 62 la tesis está rota.",
    source_type: "manual", source_id: null,
    condition: "price_below", level: 66, severity: "aviso",
    rationale: "Primer nivel citado en la tesis: perder los 66 debilita el argumento de la prima geopolítica.",
    status: "triggered", triggered_at: "2026-07-02T15:30:00", triggered_price: 65.82,
    last_price: 64.9, last_checked_at: "2026-07-07T08:00:00", created_at: "2026-06-20T10:00:00",
  },
  {
    id: 502, ticker: "BRT",
    thesis_summary: "La prima geopolítica sostiene el Brent por encima de los 66; por debajo de 62 la tesis está rota.",
    source_type: "manual", source_id: null,
    condition: "price_below", level: 62, severity: "invalidacion",
    rationale: "Nivel de ruptura: bajo 62 la oferta OPEC+ domina y la tesis queda invalidada.",
    status: "active", triggered_at: null, triggered_price: null,
    last_price: 64.9, last_checked_at: "2026-07-07T08:00:00", created_at: "2026-06-20T10:00:00",
  },
  // Extraídas del journal (decisión SEMI, tesis capex IA — sin niveles explícitos → ±8/15%)
  {
    id: 503, ticker: "SEMI",
    thesis_summary: "El ciclo de capex en IA sigue acelerando; SEMI como exposición diversificada al sector.",
    source_type: "journal", source_id: 101,
    condition: "price_below", level: 40.5, severity: "aviso",
    rationale: "Sin niveles explícitos en la tesis: aviso a -8% del precio de entrada al ciclo.",
    status: "active", triggered_at: null, triggered_price: null,
    last_price: 45.93, last_checked_at: "2026-07-07T08:00:00", created_at: "2026-07-01T09:00:00",
  },
  {
    id: 504, ticker: "SEMI",
    thesis_summary: "El ciclo de capex en IA sigue acelerando; SEMI como exposición diversificada al sector.",
    source_type: "journal", source_id: 101,
    condition: "price_below", level: 37.4, severity: "invalidacion",
    rationale: "Una caída del 15% implicaría que el mercado descuenta el fin del ciclo de capex.",
    status: "active", triggered_at: null, triggered_price: null,
    last_price: 45.93, last_checked_at: "2026-07-07T08:00:00", created_at: "2026-07-01T09:00:00",
  },
  // Extraída del journal (decisión EUNA, tesis recorte BCE con dato Polymarket)
  {
    id: 505, ticker: "EUNA",
    thesis_summary: "Polymarket da 78% a recorte del BCE en septiembre: alargar duración antes del movimiento.",
    source_type: "journal", source_id: 105,
    condition: "price_below", level: 4.44, severity: "aviso",
    rationale: "Si el bono cae un 4%, el mercado está descontando que el recorte no llega.",
    status: "active", triggered_at: null, triggered_price: null,
    last_price: 4.66, last_checked_at: "2026-07-07T08:00:00", created_at: "2026-07-02T11:10:00",
  },
];

// ── Persistencia local (modo demo) ──

type LocalState = { created: ThesisAlert[]; dismissed: number[] };

function readLocal(): LocalState {
  if (typeof window === "undefined") return { created: [], dismissed: [] };
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { created: [], dismissed: [] };
}

function writeLocal(state: LocalState) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {}
}

function demoAlerts(): ThesisAlert[] {
  const local = readLocal();
  return [...local.created, ...MOCK_ALERTS].map((a) =>
    local.dismissed.includes(a.id) ? { ...a, status: "dismissed" as AlertStatus } : a
  );
}

// ── API pública (real con fallback demo) ──

export async function loadAlerts(): Promise<AlertsData> {
  try {
    // check refresca precios y dispara lo que toque; luego traemos el estado completo
    await api("/api/alerts/check", { method: "POST" }).catch(() => null);
    const alerts = await api<ThesisAlert[]>("/api/alerts?status=all");
    return { alerts, demo: false };
  } catch {
    return { alerts: demoAlerts(), demo: true };
  }
}

export async function extractFromThesis(ticker: string, thesis: string, action: string): Promise<ExtractResult> {
  return api<ExtractResult>("/api/alerts/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker, thesis, action }),
  });
}

export async function createAlerts(
  alerts: Omit<ThesisAlert, "id" | "status" | "triggered_at" | "triggered_price" | "last_price" | "last_checked_at" | "created_at">[]
): Promise<{ created: ThesisAlert[]; demo: boolean }> {
  try {
    const created = await api<ThesisAlert[]>("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alerts),
    });
    return { created, demo: false };
  } catch {
    const local = readLocal();
    const created = alerts.map((a, i) => ({
      ...a,
      id: Date.now() + i,
      status: "active" as AlertStatus,
      triggered_at: null,
      triggered_price: null,
      last_price: null,
      last_checked_at: null,
      created_at: new Date().toISOString(),
    }));
    local.created.unshift(...created);
    writeLocal(local);
    return { created, demo: true };
  }
}

export async function dismissAlert(id: number): Promise<{ demo: boolean }> {
  try {
    await api(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    return { demo: false };
  } catch {
    const local = readLocal();
    if (!local.dismissed.includes(id)) local.dismissed.push(id);
    local.created = local.created.map((a) => (a.id === id ? { ...a, status: "dismissed" as AlertStatus } : a));
    writeLocal(local);
    return { demo: true };
  }
}

export async function scanJournal(): Promise<ScanResult> {
  return api<ScanResult>("/api/alerts/scan-journal", { method: "POST" });
}

/** Distancia del precio actual al nivel, en % firmado (negativo = margen agotándose). */
export function distanceToLevel(alert: ThesisAlert): number | null {
  if (!alert.last_price) return null;
  return ((alert.last_price - alert.level) / alert.level) * 100 * (alert.condition === "price_below" ? 1 : -1);
}

/** Heurística cliente (modo demo): mismos criterios que el backend — regex de niveles explícitos. */
export function clientExtract(thesis: string, action: string): Proposal[] {
  const levels: number[] = [];
  const re = /[$€£]\s?(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s?[$€£]|\blos\s+(\d+(?:[.,]\d+)?)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(thesis))) {
    const raw = m[1] || m[2] || m[3];
    const v = parseFloat(raw.replace(",", "."));
    if (!isNaN(v)) levels.push(v);
  }
  const bullish = action !== "sell";
  const condition = (bullish ? "price_below" : "price_above") as AlertCondition;
  const uniq = [...new Set(levels)].sort((a, b) => (bullish ? b - a : a - b)).slice(0, 2);
  if (uniq.length === 2) {
    return [
      { condition, level: uniq[0], severity: "aviso", rationale: `Primer nivel citado en la tesis: ${uniq[0]}.` },
      { condition, level: uniq[1], severity: "invalidacion", rationale: `Nivel de ruptura de la tesis: ${uniq[1]}.` },
    ];
  }
  if (uniq.length === 1) {
    return [{ condition, level: uniq[0], severity: "invalidacion", rationale: `Único nivel citado en la tesis: ${uniq[0]}.` }];
  }
  return [];
}
