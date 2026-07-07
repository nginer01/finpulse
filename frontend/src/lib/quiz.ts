/**
 * Modo quiz opcional — 3 preguntas post-briefing tipo flashcard.
 * Los fallos vuelven con repetición espaciada (1→3→7→14 días; acierto avanza,
 * fallo reinicia; nueva acertada a la primera = dominada). Misma lógica que
 * el backend (app/api/quiz.py) para que el modo demo se comporte igual.
 * Los temas fallados emiten señal de profundización (tracking) y los
 * resultados alimentan el Investor DNA.
 */

import { track } from "@/lib/tracking";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STATE_KEY = "finpulse-quiz-v1";
const ENABLED_KEY = "finpulse-quiz-enabled";
const INTERVALS_DAYS = [1, 3, 7, 14];
const DAY_MS = 86_400_000;

// ── Types ──

export type QuizQuestion = {
  id: number | string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string;
  is_review: boolean;
  fromBackend: boolean;
};

export type QuizSession = { questions: QuizQuestion[]; demo: boolean };

// ── Toggle (modo quiz opcional) ──

export function isQuizEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) !== "0";
  } catch {
    return false;
  }
}

export function setQuizEnabled(on: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, on ? "1" : "0");
  } catch {}
}

// ── Banco demo (coherente con el briefing mock de la semana 29 jun – 3 jul 2026) ──

type BankCard = Omit<QuizQuestion, "is_review" | "fromBackend">;

export const MOCK_BANK: BankCard[] = [
  {
    id: "mock-1",
    question: "El S&P 500 cerró la semana en máximos históricos. ¿Qué nivel alcanzó?",
    options: ["5.870 puntos", "6.284 puntos", "6.750 puntos"],
    correct_index: 1,
    explanation: "El S&P 500 marcó 6.284, encadenando récords pese al deadline arancelario — el mercado descuenta que habrá acuerdo o prórroga.",
    topic: "renta variable EEUU",
  },
  {
    id: "mock-2",
    question: "El dato de empleo de EEUU (147k nóminas) salió mejor de lo esperado. ¿Cuál fue la lectura del mercado para los tipos?",
    options: [
      "Recorte inminente de la Fed en julio",
      "Menos presión para recortar: la Fed puede esperar",
      "Subida de tipos en septiembre",
    ],
    correct_index: 1,
    explanation: "Un mercado laboral sólido da margen a la Fed para mantener tipos: se enfría la expectativa de recorte en julio, no la de recortes más adelante.",
    topic: "macro EEUU",
  },
  {
    id: "mock-3",
    question: "La OPEC+ anunció un aumento de producción desde agosto. ¿De cuánto?",
    options: ["+250k barriles/día", "+548k barriles/día", "+1,2M barriles/día"],
    correct_index: 1,
    explanation: "+548k b/d — mayor de lo esperado. Más oferta presiona el Brent a la baja, y por eso tu posición BRT fue el lastre de la semana.",
    topic: "energía",
  },
  {
    id: "mock-4",
    question: "Nvidia rozó un hito de capitalización esta semana. ¿Cuál?",
    options: ["Los $2 billones (trillions)", "Los $3 billones", "Los $4 billones"],
    correct_index: 2,
    explanation: "Nvidia rozó los $4T impulsada por la demanda de chips para IA — el motor del ciclo que sostiene tu posición en SEMI.",
    topic: "semiconductores",
  },
  {
    id: "mock-5",
    question: "¿Qué evento binario tiene el mercado marcado en rojo para el 9 de julio?",
    options: [
      "La reunión del BCE",
      "El deadline de los aranceles de EEUU",
      "Los resultados de TSMC",
    ],
    correct_index: 1,
    explanation: "El 9 de julio vence la prórroga arancelaria de EEUU. Con el VIX en 16,4 (complacencia), un desenlace duro pillaría al mercado sin cobertura.",
    topic: "aranceles",
  },
  {
    id: "mock-6",
    question: "Según Polymarket, ¿qué probabilidad tiene un recorte del BCE en septiembre?",
    options: ["38%", "78%", "95%"],
    correct_index: 1,
    explanation: "78% — por eso alargar duración en bonos europeos (EUNA) antes del movimiento es la jugada que registraste en tu journal.",
    topic: "política monetaria",
  },
  {
    id: "mock-7",
    question: "Las ventas de TSMC crecieron con fuerza. ¿Qué implica para el ciclo de semiconductores?",
    options: [
      "El ciclo se agota: es pico de demanda",
      "Confirma el ciclo de capex en IA: la demanda sigue acelerando",
      "Solo refleja acumulación de inventarios",
    ],
    correct_index: 1,
    explanation: "TSMC +32% interanual confirma que el capex en IA sigue acelerando — valida la tesis de tu posición SEMI (y su alerta de invalidación sigue lejos).",
    topic: "semiconductores",
  },
  {
    id: "mock-8",
    question: "El VIX está en 16,4. ¿Por qué el briefing lo señala como riesgo y no como calma?",
    options: [
      "Porque 16,4 es un nivel históricamente alto",
      "Porque volatilidad tan baja con un evento binario cerca suele preceder picos de volatilidad",
      "Porque el VIX ya no es un indicador fiable",
    ],
    correct_index: 1,
    explanation: "Mínimos de volatilidad + evento binario (aranceles 9 jul) = complacencia. Ese patrón precede históricamente repuntes bruscos del VIX.",
    topic: "volatilidad",
  },
];

// ── Estado local (repetición espaciada en demo) ──

type CardProgress = { step: number; lapses: number; mastered: boolean; nextReview: number | null; seen: boolean };
type LocalState = Record<string, CardProgress>;

function readState(): LocalState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function writeState(s: LocalState) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {}
}

function progressOf(s: LocalState, id: string): CardProgress {
  return s[id] || { step: 0, lapses: 0, mastered: false, nextReview: null, seen: false };
}

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
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Sesión del día ──

function localSession(limit = 3): QuizQuestion[] {
  const s = readState();
  const now = Date.now();
  const due = MOCK_BANK.filter((c) => {
    const p = progressOf(s, String(c.id));
    return !p.mastered && p.nextReview !== null && p.nextReview <= now;
  }).map((c) => ({ ...c, is_review: true, fromBackend: false }));

  const fresh = MOCK_BANK.filter((c) => !progressOf(s, String(c.id)).seen)
    .map((c) => ({ ...c, is_review: false, fromBackend: false }));

  return [...due, ...fresh].slice(0, limit);
}

export async function loadQuizSession(limit = 3): Promise<QuizSession> {
  try {
    const cards = await api<(Omit<QuizQuestion, "fromBackend"> & { id: number })[]>(`/api/quiz/session?limit=${limit}`);
    if (cards.length > 0) {
      return { questions: cards.map((c) => ({ ...c, fromBackend: true })), demo: false };
    }
    // Backend sin preguntas aún (el pipeline las generará) → banco local
    return { questions: localSession(limit), demo: true };
  } catch {
    return { questions: localSession(limit), demo: true };
  }
}

// ── Responder ──

export async function answerQuiz(q: QuizQuestion, correct: boolean): Promise<void> {
  // Señal de personalización: un fallo = tema a profundizar en próximos briefings
  if (!correct && q.topic) {
    track({ eventType: "explicit_interest", topic: q.topic, source: "quiz", signalType: "interest" });
  }

  if (q.fromBackend && typeof q.id === "number") {
    try {
      await api(`/api/quiz/cards/${q.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correct }),
      });
      return;
    } catch {}
  }

  // Scheduling local — espejo del backend
  const s = readState();
  const id = String(q.id);
  const p = progressOf(s, id);
  const wasReview = p.nextReview !== null;
  if (correct) {
    if (p.step >= INTERVALS_DAYS.length - 1 || (!wasReview && p.lapses === 0)) {
      p.mastered = true;
      p.nextReview = null;
    } else {
      p.step += 1;
      p.nextReview = Date.now() + INTERVALS_DAYS[Math.min(p.step, INTERVALS_DAYS.length - 1)] * DAY_MS;
    }
  } else {
    p.lapses += 1;
    p.step = 0;
    p.nextReview = Date.now() + INTERVALS_DAYS[0] * DAY_MS;
  }
  p.seen = true;
  s[id] = p;
  writeState(s);
}

/** Resumen local para el bloque DNA (demo). */
export function localQuizStats(): { mastered: number; pendingReview: number; lapses: number } {
  const s = readState();
  let mastered = 0, pending = 0, lapses = 0;
  for (const c of MOCK_BANK) {
    const p = progressOf(s, String(c.id));
    if (p.mastered) mastered++;
    if (!p.mastered && p.nextReview !== null) pending++;
    lapses += p.lapses;
  }
  return { mastered, pendingReview: pending, lapses };
}
