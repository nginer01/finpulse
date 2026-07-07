/**
 * Tracking de comportamiento — personalización adaptativa.
 * PRIORIDAD: aprendizaje implícito (clicks en fuentes, dwell time, guardados).
 * Transparente y desactivable desde /ajustes/intereses. Los eventos se envían
 * en BATCH a POST /api/tracking/events; si el backend no responde, se agregan
 * en local (mismo modelo) para que el perfil funcione ya en mock.
 */

export type EventType = "click_source" | "dwell" | "expand" | "save" | "search" | "portfolio_view" | "feedback_up" | "feedback_down" | "explicit_interest";
export type SignalType = "interest" | "concern";

export interface TrackEvent {
  eventType: EventType;
  topic: string;
  ticker?: string;
  sector?: string;
  source?: string;
  durationSeconds?: number;
  signalType: SignalType;
  ts: number;
}

export const PORTFOLIO_TICKERS = ["IWDA", "VUAA", "BRT", "EUNA", "SEMI"];
const ENABLED_KEY = "finpulse-tracking-enabled";
const QUEUE_KEY = "finpulse-track-queue";
const EVENTS_KEY = "finpulse-track-events"; // histórico local (mock del backend)
const OVERRIDE_KEY = "finpulse-interest-overrides";
export const PROFILE_EVENT = "finpulse-profile-change";

/* Mapa tema ← fuente (para clicks en SourceLink sin tocar cada página) */
const SOURCE_TOPICS: Record<string, { topic: string; tickers?: string[]; negative?: boolean }> = {
  "reuters-opec": { topic: "energía", tickers: ["BRT"], negative: true },
  "bloomberg-nvda": { topic: "semiconductores", tickers: ["SEMI"] },
  "tsmc-ventas": { topic: "semiconductores", tickers: ["SEMI"] },
  "polymarket-fed": { topic: "política monetaria" },
  "polymarket-aranceles": { topic: "aranceles", tickers: ["IWDA", "VUAA"] },
  "ft-empleo": { topic: "macro EEUU" },
  "ubs-donovan": { topic: "política monetaria" },
  "ubs-bce": { topic: "eurozona", tickers: ["EUNA", "IWDA"] },
  "matt-levine": { topic: "renta variable EEUU", tickers: ["VUAA"] },
  "daily-shot": { topic: "volatilidad" },
  "zerohedge-vix": { topic: "volatilidad", negative: true },
  "bbva-research": { topic: "eurozona", tickers: ["EUNA"] },
  "jpm-outlook": { topic: "estrategia" },
  sentimentrader: { topic: "sentimiento" },
};

export function isTrackingEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) !== "0";
  } catch {
    return false;
  }
}

export function setTrackingEnabled(on: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, on ? "1" : "0");
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {}
}

/** interest vs concern: negativa + toca cartera → concern; exploración → interest. */
export function classifySignal(tickers: string[] | undefined, negative: boolean | undefined): SignalType {
  const touchesPortfolio = (tickers || []).some((t) => PORTFOLIO_TICKERS.includes(t));
  return negative && touchesPortfolio ? "concern" : "interest";
}

export function track(partial: Omit<TrackEvent, "ts" | "signalType"> & { signalType?: SignalType; negative?: boolean; tickers?: string[] }) {
  if (typeof window === "undefined" || !isTrackingEnabled()) return;
  const evt: TrackEvent = {
    eventType: partial.eventType,
    topic: partial.topic,
    ticker: partial.ticker ?? partial.tickers?.[0],
    sector: partial.sector,
    source: partial.source,
    durationSeconds: partial.durationSeconds,
    signalType: partial.signalType ?? classifySignal(partial.tickers, partial.negative),
    ts: Date.now(),
  };
  try {
    const q: TrackEvent[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    q.push(evt);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
    const hist: TrackEvent[] = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    hist.push(evt);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(hist.slice(-800)));
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {}
  scheduleFlush();
}

export function trackSourceClick(sourceId: string, sourceName: string) {
  const m = SOURCE_TOPICS[sourceId];
  track({ eventType: "click_source", topic: m?.topic ?? sourceName, tickers: m?.tickers, negative: m?.negative, source: sourceName });
}

/* ---- flush en batch al backend (best-effort) ---- */
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 15000);
}

export async function flush() {
  flushTimer = null;
  let batch: TrackEvent[] = [];
  try {
    batch = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    if (!batch.length) return;
    localStorage.setItem(QUEUE_KEY, "[]");
  } catch {
    return;
  }
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "";
    await fetch(`${api}/api/tracking/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {
    /* backend no disponible: el histórico local ya alimenta el perfil */
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flush());
}

/* ------------------------------------------------------------------ */
/*  Perfil de intereses — agregación con recency decay                 */
/*  (mock local del job nocturno; misma fórmula que el backend)        */
/* ------------------------------------------------------------------ */

const WEIGHTS: Record<EventType, number> = {
  click_source: 10,
  save: 12,
  expand: 8,
  explicit_interest: 18,
  feedback_up: 10,
  feedback_down: -14,
  search: 7,
  portfolio_view: 4,
  dwell: 0, // el dwell puntúa por duración: +1 por cada 10s (cap 12)
};

const HALF_LIFE_DAYS = 14;

export interface TopicScore {
  topic: string;
  interest: number;
  concern: number;
  events: number;
}

export function computeProfile(): TopicScore[] {
  let events: TrackEvent[] = [];
  let overrides: Record<string, number> = {};
  try {
    events = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    overrides = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}");
  } catch {}
  const now = Date.now();
  const acc: Record<string, { i: number; c: number; n: number }> = {};
  for (const e of events) {
    const ageDays = (now - e.ts) / 86400000;
    const decay = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    const base = e.eventType === "dwell" ? Math.min(12, (e.durationSeconds || 0) / 10) : WEIGHTS[e.eventType] ?? 0;
    const pts = base * decay;
    const key = e.topic.toLowerCase();
    acc[key] ??= { i: 0, c: 0, n: 0 };
    if (e.signalType === "concern") acc[key].c += Math.abs(pts);
    else acc[key].i += pts;
    acc[key].n += 1;
  }
  for (const [topic, delta] of Object.entries(overrides)) {
    if (delta === -999) delete acc[topic];
    else {
      acc[topic] ??= { i: 0, c: 0, n: 0 };
      acc[topic].i += delta;
    }
  }
  const norm = (v: number) => Math.max(0, Math.min(100, Math.round(100 * (1 - Math.exp(-v / 40)))));
  return Object.entries(acc)
    .map(([topic, v]) => ({ topic, interest: norm(v.i), concern: norm(v.c), events: v.n }))
    .filter((t) => t.interest > 0 || t.concern > 0)
    .sort((a, b) => Math.max(b.interest, b.concern) - Math.max(a.interest, a.concern));
}

export function adjustTopic(topic: string, delta: number) {
  try {
    const o = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}");
    o[topic.toLowerCase()] = delta === -999 ? -999 : (o[topic.toLowerCase()] || 0) + delta;
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {}
}

/** Bloques de texto para inyectar en el prompt del briefing. */
export function profileForPrompt(): { deepen: string[]; portfolio: string[] } {
  const p = computeProfile();
  return {
    deepen: p.filter((t) => t.interest >= 40).slice(0, 6).map((t) => t.topic),
    portfolio: p.filter((t) => t.concern >= 30).slice(0, 6).map((t) => t.topic),
  };
}
