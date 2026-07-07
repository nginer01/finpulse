/**
 * Decision Journal — cliente API + fallback mock.
 * Las operaciones entran AUTOMÁTICAMENTE desde Revolut (emails de confirmación
 * al Gmail dedicado o CSV export); cada una se etiqueta en 2s (tags + nota
 * opcional) y la IA la evalúa retrospectivamente a 7/30/90 días.
 * Si el backend no responde (sin sesión / sin red), la página funciona en modo
 * demo con datos coherentes con el portfolio y persiste en localStorage.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LOCAL_KEY = "finpulse-journal-local-v1";

// ── Types ──

export type JournalDecision = {
  id: number;
  ticker: string;
  action: "buy" | "sell";
  price: number;
  quantity: number;
  conviction: number;
  tags: string[];
  thesis: string;
  result: "good" | "neutral" | "bad" | null;
  lesson: string | null;
  ai_review: string | null;
  price_after_7d: number | null;
  price_after_30d: number | null;
  price_after_90d: number | null;
  operation_id: number | null;
  date: string;
  created_at: string;
};

export type PendingOperation = {
  id: number;
  ticker: string;
  operation_type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  broker: string;
  source: "manual" | "csv" | "email";
};

export type JournalStats = {
  total_decisions: number;
  good: number;
  neutral: number;
  bad: number;
  pending: number;
  accuracy: number;
  avg_conviction: number;
  most_used_tags: { tag: string; label: string; count: number }[];
  best_ticker: string | null;
  worst_ticker: string | null;
};

export type SyncResult = {
  detected: number;
  created: number;
  operations: PendingOperation[];
  message: string;
};

export type DecisionInput = {
  ticker: string;
  action: "buy" | "sell";
  price: number;
  quantity: number;
  conviction: number;
  tags: string[];
  thesis: string;
  date?: string;
  operation_id?: number | null;
};

// ── Tags (espejo de AVAILABLE_TAGS del backend) ──

export type TagGroup = { label: string; tags: { key: string; label: string }[] };

export const TAG_GROUPS: TagGroup[] = [
  {
    label: "Tesis / análisis",
    tags: [
      { key: "analisis-tecnico", label: "Análisis técnico" },
      { key: "infravalorado", label: "Infravalorado" },
      { key: "sobrevalorado", label: "Sobrevalorado" },
      { key: "earnings-buenos", label: "Earnings buenos" },
      { key: "tendencia-alcista", label: "Tendencia alcista" },
      { key: "tendencia-bajista", label: "Tendencia bajista" },
    ],
  },
  {
    label: "Gestión de cartera",
    tags: [
      { key: "rebalanceo", label: "Rebalanceo" },
      { key: "dca", label: "DCA (periódica)" },
      { key: "toma-beneficios", label: "Toma de beneficios" },
      { key: "stop-loss", label: "Stop loss" },
      { key: "cobertura", label: "Cobertura" },
    ],
  },
  {
    label: "Señales externas",
    tags: [
      { key: "noticia-positiva", label: "Noticia positiva" },
      { key: "noticia-negativa", label: "Noticia negativa" },
      { key: "recomendacion-ia", label: "Recomendación IA" },
      { key: "polymarket", label: "Dato de Polymarket" },
      { key: "fuente-confiable", label: "Fuente confiable" },
      { key: "paralelo-historico", label: "Paralelo histórico" },
    ],
  },
  {
    label: "Emocional",
    tags: [
      { key: "intuicion", label: "Intuición" },
      { key: "fomo", label: "FOMO" },
      { key: "miedo", label: "Miedo" },
      { key: "oportunidad", label: "Oportunidad única" },
    ],
  },
];

export const TAG_LABELS: Record<string, string> = Object.fromEntries(
  TAG_GROUPS.flatMap((g) => g.tags.map((t) => [t.key, t.label]))
);

/** Tags que delatan proceso emocional — alimentan la señal concern y el Investor DNA. */
export const EMOTIONAL_TAGS = new Set(["fomo", "miedo", "intuicion"]);

/** Tema de tracking por ticker del portfolio (señal portfolio_view al etiquetar). */
export const TICKER_TOPICS: Record<string, string> = {
  SEMI: "semiconductores",
  BRT: "energía",
  EUNA: "eurozona",
  IWDA: "renta variable global",
  VUAA: "renta variable EEUU",
};

// ── Auth helper ──

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

// ── Mock (modo demo, coherente con la semana 29 jun – 3 jul 2026) ──

export const MOCK_PENDING: PendingOperation[] = [
  { id: 9001, ticker: "SEMI", operation_type: "buy", quantity: 10, price: 43.85, date: "2026-07-03", broker: "Revolut", source: "email" },
  { id: 9002, ticker: "BRT", operation_type: "sell", quantity: 5, price: 68.4, date: "2026-07-02", broker: "Revolut", source: "email" },
];

export const MOCK_DECISIONS: JournalDecision[] = [
  {
    id: 101, ticker: "SEMI", action: "buy", price: 42.1, quantity: 20, conviction: 8,
    tags: ["tendencia-alcista", "earnings-buenos", "fuente-confiable"],
    thesis: "Nvidia roza los $4T y TSMC crece +32% interanual. El ciclo de capex en IA sigue acelerando y SEMI es mi exposición diversificada al sector.",
    result: "good", lesson: null,
    ai_review: "**Veredicto**: proceso sólido. Entraste con una tesis clara (ciclo de capex IA), múltiples fuentes y convicción alta coherente con el tamaño de la posición.\n\n**Lo que dice el precio**: +4,2% a 7 días y +9,1% a 30 días validan el timing. El sector confirmó con las ventas récord de TSMC.\n\n**Lección**: cuando tesis, fuentes y momentum coinciden, tu convicción 8/10 estuvo bien calibrada. Documenta el nivel de invalidación para la próxima.",
    price_after_7d: 43.87, price_after_30d: 45.93, price_after_90d: null,
    operation_id: null, date: "2026-06-05", created_at: "2026-06-05T10:12:00",
  },
  {
    id: 102, ticker: "BRT", action: "sell", price: 66.8, quantity: 5, conviction: 6,
    tags: ["noticia-negativa", "toma-beneficios"],
    thesis: "OPEC+ anuncia +548k b/d desde agosto. Con la prima geopolítica desinflándose, reduzco un tercio de la posición.",
    result: "good", lesson: "Vender parcialmente ante cambios de oferta estructurales funciona mejor que esperar confirmación.",
    ai_review: "**Veredicto**: proceso correcto — reaccionaste a un cambio fundamental de oferta, no a ruido. Reducir (y no cerrar) fue proporcional a la señal.\n\n**Lo que dice el precio**: el Brent cayó -3,8% en los 30 días siguientes al anuncio. La venta a 66,80 evitó ese tramo.\n\n**Lección**: las decisiones de oferta de la OPEP son de las pocas señales macro accionables en horas. Mantén la regla: cambio estructural → ajuste parcial inmediato.",
    price_after_7d: 65.1, price_after_30d: 64.26, price_after_90d: null,
    operation_id: null, date: "2026-07-01", created_at: "2026-07-01T16:40:00",
  },
  {
    id: 103, ticker: "IWDA", action: "buy", price: 95.1, quantity: 3, conviction: 9,
    tags: ["dca"],
    thesis: "",
    result: "neutral", lesson: null,
    ai_review: null,
    price_after_7d: 95.6, price_after_30d: 96.02, price_after_90d: null,
    operation_id: null, date: "2026-06-01", created_at: "2026-06-01T09:00:00",
  },
  {
    id: 104, ticker: "VUAA", action: "buy", price: 104.3, quantity: 2, conviction: 4,
    tags: ["fomo", "intuicion"],
    thesis: "El S&P encadena récords y no quiero quedarme fuera del rally.",
    result: "bad", lesson: null,
    ai_review: "**Veredicto**: proceso defectuoso aunque el daño fue limitado. Los tags lo dicen todo: FOMO + intuición, sin tesis fundamentada ni nivel de salida. Convicción 4/10 y aun así entraste — eso es una contradicción.\n\n**Lo que dice el precio**: -2,9% a 30 días. Compraste un máximo local perseguido por el rally, exactamente el patrón que describe tu tag.\n\n**Lección**: si tu convicción es ≤5, la posición debería ser 0. El FOMO en máximos históricos es el sesgo más caro de tu historial — usa DCA programado para el índice y reserva las compras discrecionales para cuando tengas tesis.",
    price_after_7d: 103.1, price_after_30d: 101.28, price_after_90d: null,
    operation_id: null, date: "2026-05-18", created_at: "2026-05-18T14:20:00",
  },
  {
    id: 105, ticker: "EUNA", action: "buy", price: 4.62, quantity: 25, conviction: 7,
    tags: ["rebalanceo", "polymarket"],
    thesis: "Polymarket da 78% a recorte del BCE en septiembre. Alargo duración antes del movimiento.",
    result: null, lesson: null,
    ai_review: null,
    price_after_7d: null, price_after_30d: null, price_after_90d: null,
    operation_id: null, date: "2026-07-02", created_at: "2026-07-02T11:05:00",
  },
];

function computeStats(decisions: JournalDecision[]): JournalStats {
  const total = decisions.length;
  const good = decisions.filter((d) => d.result === "good").length;
  const neutral = decisions.filter((d) => d.result === "neutral").length;
  const bad = decisions.filter((d) => d.result === "bad").length;
  const pending = decisions.filter((d) => !d.result).length;
  const reviewed = good + neutral + bad;
  const counts: Record<string, number> = {};
  decisions.forEach((d) => d.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const most_used_tags = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, label: TAG_LABELS[tag] || tag, count }));

  const perTicker: Record<string, number[]> = {};
  decisions.forEach((d) => {
    if (!d.result) return;
    const score = d.result === "good" ? 1 : d.result === "bad" ? -1 : 0;
    (perTicker[d.ticker] = perTicker[d.ticker] || []).push(score);
  });
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const tickers = Object.entries(perTicker);
  const best = tickers.length ? tickers.reduce((a, b) => (avg(a[1]) >= avg(b[1]) ? a : b))[0] : null;
  const worst = tickers.length ? tickers.reduce((a, b) => (avg(a[1]) <= avg(b[1]) ? a : b))[0] : null;

  return {
    total_decisions: total, good, neutral, bad, pending,
    accuracy: reviewed ? Math.round((good / reviewed) * 1000) / 10 : 0,
    avg_conviction: total ? Math.round((decisions.reduce((a, d) => a + d.conviction, 0) / total) * 10) / 10 : 0,
    most_used_tags, best_ticker: best, worst_ticker: worst,
  };
}

// ── Local persistence (modo demo) ──

type LocalState = { decisions: JournalDecision[]; taggedPendingIds: number[] };

function readLocal(): LocalState {
  if (typeof window === "undefined") return { decisions: [], taggedPendingIds: [] };
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { decisions: [], taggedPendingIds: [] };
}

function writeLocal(state: LocalState) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {}
}

// ── Public API (real con fallback demo) ──

export type JournalData = {
  decisions: JournalDecision[];
  pending: PendingOperation[];
  stats: JournalStats;
  demo: boolean;
};

export async function loadJournal(): Promise<JournalData> {
  try {
    const [decisions, pending, stats] = await Promise.all([
      api<JournalDecision[]>("/api/journal/decisions"),
      api<PendingOperation[]>("/api/journal/pending"),
      api<JournalStats>("/api/journal/stats"),
    ]);
    return { decisions, pending, stats, demo: false };
  } catch {
    const local = readLocal();
    const decisions = [...local.decisions, ...MOCK_DECISIONS];
    const pending = MOCK_PENDING.filter((op) => !local.taggedPendingIds.includes(op.id));
    return { decisions, pending, stats: computeStats(decisions), demo: true };
  }
}

export async function saveDecision(input: DecisionInput): Promise<{ decision: JournalDecision; demo: boolean }> {
  try {
    const decision = await api<JournalDecision>("/api/journal/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return { decision, demo: false };
  } catch {
    const local = readLocal();
    const decision: JournalDecision = {
      id: Date.now(),
      ticker: input.ticker.toUpperCase(),
      action: input.action,
      price: input.price,
      quantity: input.quantity,
      conviction: input.conviction,
      tags: input.tags,
      thesis: input.thesis,
      result: null, lesson: null, ai_review: null,
      price_after_7d: null, price_after_30d: null, price_after_90d: null,
      operation_id: input.operation_id ?? null,
      date: input.date || new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    };
    local.decisions.unshift(decision);
    if (input.operation_id) local.taggedPendingIds.push(input.operation_id);
    writeLocal(local);
    return { decision, demo: true };
  }
}

export async function requestReview(decisionId: number): Promise<JournalDecision> {
  return api<JournalDecision>(`/api/journal/decisions/${decisionId}/review`, { method: "POST" });
}

export async function syncEmail(): Promise<SyncResult> {
  return api<SyncResult>("/api/journal/sync/email", { method: "POST" });
}

export async function syncCsv(file: File): Promise<SyncResult> {
  const form = new FormData();
  form.append("file", file);
  return api<SyncResult>("/api/journal/sync/csv", { method: "POST", body: form });
}
