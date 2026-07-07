/**
 * El camino no tomado — cliente API + fallback demo.
 * Cada Seguir/Ignorar/Invertir-en-ficción se registra AUTOMÁTICAMENTE con
 * snapshot del precio real (backend). GET /paths lo evalúa con precios
 * actuales: qué habría pasado. effect_pct = qué habría dado SEGUIR la
 * recomendación (signo ya orientado por la dirección Comprar/Vender).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LOCAL_KEY = "finpulse-paths-local-v1";

// ── Types ──

export type PathDecision = {
  id: number;
  ticker: string;
  name: string;
  action: string; // Comprar / Vender / Mantener / Vigilar
  conviction: number;
  reasoning: string;
  status: "followed" | "ignored";
  price_at_decision: number | null;
  decided_at: string | null;
  fiction_amount: number | null;
  date: string;
  current_price: number | null;
  change_pct: number | null;
  effect_pct: number | null; // qué habría dado seguirla
  fiction_value: number | null;
};

export type PathsData = { paths: PathDecision[]; demo: boolean };

export type DecideInput = {
  ticker: string;
  name: string;
  action: string;
  conviction: number;
  reasoning: string;
  decision: "followed" | "ignored";
  fiction_amount?: number | null;
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

// ── Mock (demo, coherente con las recomendaciones de la página) ──

export const MOCK_PATHS: PathDecision[] = [
  {
    id: 901, ticker: "BRT", name: "Brent Crude Oil", action: "Vender", conviction: 8,
    reasoning: "Negociaciones Irán-EEUU avanzan; paralelo 2015: -30% en 6 meses.",
    status: "ignored", price_at_decision: 74.2, decided_at: "2026-05-11T10:00:00", fiction_amount: null,
    date: "2026-05-11", current_price: 64.9, change_pct: -12.53, effect_pct: 12.53, fiction_value: null,
  },
  {
    id: 902, ticker: "COPX", name: "Global X Copper Miners ETF", action: "Comprar", conviction: 7,
    reasoning: "Déficit estructural de cobre 2027-2028: demanda EV supera oferta.",
    status: "ignored", price_at_decision: 41.2, decided_at: "2026-05-09T09:30:00", fiction_amount: null,
    date: "2026-05-09", current_price: 44.85, change_pct: 8.86, effect_pct: 8.86, fiction_value: null,
  },
  {
    id: 903, ticker: "SEMI", name: "VanEck Semiconductor ETF", action: "Comprar", conviction: 7,
    reasoning: "Ciclo expansivo confirmado con Blackwell Ultra y capex TSMC +15%.",
    status: "followed", price_at_decision: 42.1, decided_at: "2026-06-05T11:00:00", fiction_amount: null,
    date: "2026-06-05", current_price: 45.93, change_pct: 9.1, effect_pct: 9.1, fiction_value: null,
  },
  {
    id: 904, ticker: "URNM", name: "Sprott Uranium Miners ETF", action: "Comprar", conviction: 5,
    reasoning: "Renacimiento nuclear por demanda de centros de datos.",
    status: "ignored", price_at_decision: 38.1, decided_at: "2026-05-08T12:00:00", fiction_amount: null,
    date: "2026-05-08", current_price: 36.22, change_pct: -4.93, effect_pct: -4.93, fiction_value: null,
  },
  {
    id: 905, ticker: "IBIT", name: "iShares Bitcoin Trust", action: "Comprar", conviction: 6,
    reasoning: "Flujos institucionales récord hacia ETFs de Bitcoin.",
    status: "ignored", price_at_decision: 38.5, decided_at: "2026-01-15T10:00:00", fiction_amount: 500,
    date: "2026-01-15", current_price: 47.1, change_pct: 22.34, effect_pct: 22.34, fiction_value: 611.7,
  },
  {
    id: 906, ticker: "GLD", name: "SPDR Gold Trust", action: "Comprar", conviction: 6,
    reasoning: "Cobertura ante incertidumbre de aranceles y dólar.",
    status: "ignored", price_at_decision: 205, decided_at: "2026-03-01T09:00:00", fiction_amount: 300,
    date: "2026-03-01", current_price: 234.1, change_pct: 14.2, effect_pct: 14.2, fiction_value: 342.6,
  },
];

// ── Persistencia local (demo) ──

type LocalState = { created: PathDecision[]; removed: number[]; fictions: Record<number, number> };

function readLocal(): LocalState {
  if (typeof window === "undefined") return { created: [], removed: [], fictions: {} };
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { created: [], removed: [], fictions: {} };
}

function writeLocal(state: LocalState) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {}
}

function demoPaths(): PathDecision[] {
  const local = readLocal();
  return [...local.created, ...MOCK_PATHS]
    .filter((p) => !local.removed.includes(p.id))
    .map((p) => {
      const amount = local.fictions[p.id];
      if (!amount) return p;
      const value = p.effect_pct !== null ? Math.round(amount * (1 + p.effect_pct / 100) * 100) / 100 : null;
      return { ...p, fiction_amount: amount, fiction_value: value };
    });
}

// ── API pública (real con fallback demo) ──

export async function loadPaths(): Promise<PathsData> {
  try {
    const paths = await api<PathDecision[]>("/api/paths");
    return { paths, demo: false };
  } catch {
    return { paths: demoPaths(), demo: true };
  }
}

export async function decidePath(input: DecideInput): Promise<{ path: PathDecision; demo: boolean }> {
  try {
    const path = await api<PathDecision>("/api/paths/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return { path, demo: false };
  } catch {
    const local = readLocal();
    const path: PathDecision = {
      id: Date.now(),
      ticker: input.ticker.toUpperCase(),
      name: input.name,
      action: input.action,
      conviction: input.conviction,
      reasoning: input.reasoning,
      status: input.decision,
      price_at_decision: null,
      decided_at: new Date().toISOString(),
      fiction_amount: input.fiction_amount ?? null,
      date: new Date().toISOString().slice(0, 10),
      current_price: null,
      change_pct: null,
      effect_pct: null,
      fiction_value: null,
    };
    local.created.unshift(path);
    writeLocal(local);
    return { path, demo: true };
  }
}

export async function setPathFiction(id: number, amount: number): Promise<{ demo: boolean }> {
  try {
    await api(`/api/paths/${id}/fiction`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    return { demo: false };
  } catch {
    const local = readLocal();
    local.fictions[id] = amount;
    local.created = local.created.map((p) => (p.id === id ? { ...p, fiction_amount: amount } : p));
    writeLocal(local);
    return { demo: true };
  }
}

export async function undoPath(id: number): Promise<{ demo: boolean }> {
  try {
    await api(`/api/paths/${id}`, { method: "DELETE" });
    return { demo: false };
  } catch {
    const local = readLocal();
    if (!local.removed.includes(id)) local.removed.push(id);
    local.created = local.created.filter((p) => p.id !== id);
    delete local.fictions[id];
    writeLocal(local);
    return { demo: true };
  }
}

/** Veredicto legible de una decisión evaluada. */
export function pathVerdict(p: PathDecision): { label: string; good: boolean | null } {
  if (p.effect_pct === null) return { label: "esperando precios", good: null };
  const followedIt = p.status === "followed";
  const paidOff = p.effect_pct > 0.5;
  const wentBad = p.effect_pct < -0.5;
  if (followedIt) {
    if (paidOff) return { label: "Bien seguida", good: true };
    if (wentBad) return { label: "Seguirla salió mal", good: false };
    return { label: "Sin efecto aún", good: null };
  }
  if (paidOff) return { label: "Te costó dejarla pasar", good: false };
  if (wentBad) return { label: "Bien ignorada", good: true };
  return { label: "Sin efecto aún", good: null };
}
