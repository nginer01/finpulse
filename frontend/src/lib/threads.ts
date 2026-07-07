/**
 * Hilos temporales — la memoria acumulativa del briefing.
 * Un tema recurrente no se re-explica cada día: su hilo guarda cuándo
 * apareció, cómo ha evolucionado, qué cambió HOY y qué puede pasar.
 * El pipeline del briefing real alimentará POST /api/threads/ingest cada
 * mañana; mientras, el mock cuenta las 4 historias vivas de la semana.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──

export type ThreadEntry = {
  id: number;
  date: string;
  headline: string;
  detail: string;
  significance: "positivo" | "negativo" | "clave" | "neutral";
  source: string;
};

export type Thread = {
  id: number;
  slug: string;
  title: string;
  status: "active" | "resolved" | "dormant";
  summary: string;
  outlook: string;
  tickers: string[];
  first_seen: string;
  last_updated: string;
  entries: ThreadEntry[];
};

export type ThreadsData = { threads: Thread[]; demo: boolean };

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

// ── Mock — los 4 hilos vivos de la semana del 29 jun – 6 jul 2026 ──

export const MOCK_THREADS: Thread[] = [
  {
    id: 801,
    slug: "aranceles-eeuu",
    title: "Aranceles: la cuenta atrás del 9 de julio",
    status: "active",
    summary:
      "A 48 horas del deadline, las cartas con tipos del 25-40% empiezan a salir hoy con entrada en vigor el 1 de agosto — en la práctica, tres semanas más de negociación. Polymarket da 42% a un acuerdo marco UE-EEUU antes del jueves.",
    outlook:
      "Escenario base (55%): prórrogas selectivas y acuerdo de mínimos con la UE — vía libre hasta el IPC del 15. Alternativo (30%): cartas duras sin prórroga → corrección con VIX en 16 y posicionamiento largo. Cola (15%): acuerdo amplio → rally de alivio.",
    tickers: ["IWDA", "VUAA"],
    first_seen: "2026-04-09",
    last_updated: "2026-07-06T09:00:00",
    entries: [
      { id: 1, date: "2026-04-09", headline: "Pausa de 90 días a los aranceles recíprocos", detail: "El mercado rebota +9,5% en la mejor sesión desde 2008. Empieza la cuenta atrás.", significance: "clave", source: "FT" },
      { id: 2, date: "2026-06-12", headline: "La UE pone sobre la mesa un acuerdo marco", detail: "Bruselas ofrece compras de GNL y defensa a cambio de exención parcial para automoción.", significance: "positivo", source: "Reuters" },
      { id: 3, date: "2026-06-27", headline: "Canadá retira su impuesto digital y vuelve a la mesa", detail: "Primera señal de que el deadline funciona como palanca de negociación real.", significance: "positivo", source: "Bloomberg" },
      { id: 4, date: "2026-07-03", headline: "Vietnam firma: 20% general, 40% al transbordo", detail: "Primer acuerdo completo. El mercado lo lee como plantilla para el resto de Asia.", significance: "clave", source: "FT" },
      { id: 5, date: "2026-07-06", headline: "HOY — Las cartas empiezan a salir; vigor el 1 de agosto", detail: "Escalada controlada: el aplazamiento efectivo de tres semanas rebaja el riesgo binario del jueves, pero no lo elimina.", significance: "neutral", source: "Polymarket 42%" },
    ],
  },
  {
    id: 802,
    slug: "ciclo-ia-semis",
    title: "El ciclo de la IA: camino de los 4 billones",
    status: "active",
    summary:
      "Nvidia rozó los $4T de capitalización — sería la primera empresa de la historia — y TSMC crece +26% interanual en junio. El capex de los hyperscalers sigue acelerando y la cadena entera (ASML, SK Hynix, Micron) sube en bloque. Tu SEMI, mejor posición de la semana (+3,4%).",
    outlook:
      "La validación llega el viernes con los ingresos Q2 de TSMC. Si confirma, el retroceso del 2-3% que esperas para ampliar SEMI quizá no llegue. Riesgo del hilo: a 32x beneficios estimados, un simple recorte de capex comprime el múltiplo del sector un 15%.",
    tickers: ["SEMI"],
    first_seen: "2026-05-28",
    last_updated: "2026-07-06T09:00:00",
    entries: [
      { id: 6, date: "2026-05-28", headline: "Nvidia bate estimaciones y guía al alza", detail: "Data center +70% interanual. El mercado descarta la fatiga del ciclo.", significance: "positivo", source: "Bloomberg" },
      { id: 7, date: "2026-06-10", headline: "TSMC: ventas de mayo +32% interanual", detail: "La demanda de CoWoS sigue por encima de la capacidad. Colas hasta 2027.", significance: "positivo", source: "TSMC IR" },
      { id: 8, date: "2026-06-24", headline: "Micron guía por encima del consenso: HBM agotada", detail: "La memoria de alto ancho de banda, vendida hasta fin de año.", significance: "positivo", source: "Reuters" },
      { id: 9, date: "2026-07-03", headline: "Nvidia roza los $4T de capitalización", detail: "Cuarta sesión récord del semestre para el sector. SEMI +2,8% en la semana.", significance: "clave", source: "Bloomberg" },
      { id: 10, date: "2026-07-06", headline: "HOY — La cadena sube en bloque; foco en TSMC el viernes", detail: "ASML +2,2% arrastrada por el capex de las foundries. Q2 de TSMC el día 10: el primer 'earnings' del trimestre para tu SEMI.", significance: "neutral", source: "FinPulse" },
    ],
  },
  {
    id: 803,
    slug: "opec-oferta",
    title: "OPEC+ abre el grifo",
    status: "active",
    summary:
      "Tercer aumento consecutivo de cuotas: +548k b/d desde agosto, más de lo esperado. Arabia Saudí prioriza cuota de mercado sobre precio. El Brent pierde un 2,3% en la semana y acumula -8% en el año; tu nivel de invalidación en los $66 sigue a un 3,5% de distancia.",
    outlook:
      "Los inventarios del miércoles dirán si el mercado absorbe los barriles. Bajo $66 la tesis de la prima geopolítica se debilita (tu alerta salta); bajo $62 está rota y toca replantear la mitad restante de BRT. Al alza, solo un shock de oferta real la reactiva.",
    tickers: ["BRT"],
    first_seen: "2026-05-31",
    last_updated: "2026-07-06T09:00:00",
    entries: [
      { id: 11, date: "2026-05-31", headline: "Primer aumento: +411k b/d para julio", detail: "La OPEC+ rompe la disciplina de recortes. El Brent pierde los $80.", significance: "negativo", source: "Reuters" },
      { id: 12, date: "2026-06-15", headline: "La prima geopolítica se desinfla", detail: "Sin escalada en Ormuz, el crudo devuelve todo el rally de junio en cinco sesiones.", significance: "negativo", source: "Daily Shot" },
      { id: 13, date: "2026-07-01", headline: "Tu venta parcial de BRT a 66,80", detail: "Registrada en el journal: reducir un tercio ante el cambio estructural de oferta. La IA la evaluó como acertada (+12,5% vs mantener).", significance: "clave", source: "Journal" },
      { id: 14, date: "2026-07-05", headline: "+548k b/d desde agosto — más de lo esperado", detail: "Tercer aumento consecutivo y el más agresivo. Exxon y Chevron caen >2%.", significance: "negativo", source: "Reuters" },
      { id: 15, date: "2026-07-06", headline: "HOY — Brent a $68,3; inventarios el miércoles", detail: "Sin margen para la complacencia: $66 es el primer aviso de tu tesis.", significance: "neutral", source: "FinPulse" },
    ],
  },
  {
    id: 804,
    slug: "bce-dovish",
    title: "El giro dovish del BCE",
    status: "active",
    summary:
      "Con la inflación en el objetivo y un euro en máximos de cuatro años (1,178) que ya resta dos décimas de PIB al sector exterior, el mercado da 78% a un recorte en septiembre. Tu compra de EUNA del día 2 es exactamente esta apuesta: alargar duración antes del movimiento.",
    outlook:
      "Si el BCE recorta en septiembre, la curva corta europea baja y EUNA lo captura. El riesgo es el euro: un BCE quieto con la Fed recortando lo empuja aún más arriba — presión para Lagarde, viento en contra para el tramo europeo de IWDA.",
    tickers: ["EUNA", "IWDA"],
    first_seen: "2026-06-05",
    last_updated: "2026-07-06T09:00:00",
    entries: [
      { id: 16, date: "2026-06-05", headline: "El BCE recorta 25 pb y señala pausa", detail: "Octavo recorte del ciclo. Lagarde: 'estamos en buena posición para esperar'.", significance: "clave", source: "BCE" },
      { id: 17, date: "2026-06-18", headline: "La inflación de la eurozona toca el 2,0%", detail: "Objetivo cumplido. El debate pasa de 'si' a 'cuándo' el siguiente recorte.", significance: "positivo", source: "Eurostat" },
      { id: 18, date: "2026-07-01", headline: "Sintra: el euro fuerte entra en el discurso", detail: "Varios consejeros admiten que 1,18 ya condiciona las proyecciones de inflación importada.", significance: "neutral", source: "UBS On-Air" },
      { id: 19, date: "2026-07-02", headline: "Tu compra de EUNA: alargar duración pre-recorte", detail: "25 uds a 4,62 con el dato de Polymarket al 78% — registrada en el journal y con alertas de invalidación activas.", significance: "clave", source: "Journal" },
      { id: 20, date: "2026-07-06", headline: "HOY — Polymarket mantiene 78% para septiembre", detail: "Curva europea estable; EUNA hace su trabajo de lastre defensivo (+0,2%).", significance: "neutral", source: "Polymarket" },
    ],
  },
];

// ── API pública (real con fallback demo) ──

export async function loadThreads(): Promise<ThreadsData> {
  try {
    const threads = await api<Thread[]>("/api/threads?status=active");
    if (threads.length > 0) return { threads, demo: false };
    // Backend sin hilos aún (el pipeline los alimentará) → mock
    return { threads: MOCK_THREADS, demo: true };
  } catch {
    return { threads: MOCK_THREADS, demo: true };
  }
}

/** Semanas que lleva vivo un hilo (mínimo 1). */
export function threadAgeWeeks(t: Thread): number {
  const first = new Date(t.first_seen + "T00:00:00").getTime();
  const last = new Date(t.last_updated).getTime();
  return Math.max(1, Math.round((last - first) / (7 * 86_400_000)));
}
