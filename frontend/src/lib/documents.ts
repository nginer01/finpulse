/**
 * Documentos del usuario: emails procesados, uploads manuales, URLs y
 * archivos de la carpeta Synpulse. MOCK con persistencia en localStorage —
 * cuando exista el backend real, esto vendrá de GET /api/documents
 * (ver docs/documentos-pipeline.md para el contrato completo).
 */

export type DocOrigin = "email" | "upload" | "url" | "synpulse";
export type DocFileType = "pdf" | "img" | "html" | "eml" | "docx" | "txt";
export type DocStatus = "procesado" | "procesando" | "error";

export interface UserDoc {
  id: string;
  title: string;
  snippet: string;
  summary: string;
  origin: DocOrigin;
  sourceName: string;
  fileType: DocFileType;
  date: string;
  dateISO: string;
  relevance: number; // 0-100 respecto al portfolio del usuario
  tags: string[];
  tickers: string[];
  status: DocStatus;
  url?: string;
}

export const ORIGIN_LABEL: Record<DocOrigin, string> = {
  email: "Email",
  upload: "Subida manual",
  url: "URL",
  synpulse: "Carpeta Synpulse",
};

export const MOCK_DOCS: UserDoc[] = [
  {
    id: "d1",
    title: "Money Stuff: The Market Buys the Calendar",
    snippet: "Levine sobre por qué la bolsa celebra el retraso de los recortes: el mercado ya no negocia tipos, negocia la credibilidad del calendario de la Fed.",
    summary:
      "Matt Levine analiza la reacción del mercado al dato de empleo de junio (147.000 nóminas vs 110.000 esperadas). Tesis central: el S&P a 22x beneficios no se sostiene por expectativas de recortes inmediatos sino por la temporada de resultados del Q2 que arranca el 14 de julio. Distingue entre recortes 'por rescate' (malos para bolsa) y 'por normalización' (buenos), y sitúa septiembre (68% en Polymarket) en la segunda categoría. Menciona explícitamente semiconductores como el sector donde los beneficios tienen que validar el múltiplo — relevante para tu posición en SEMI. Riesgo señalado: un IPC de junio contaminado por aranceles rompería la narrativa goldilocks.",
    origin: "email",
    sourceName: "Money Stuff (Bloomberg)",
    fileType: "eml",
    date: "3 jul 2026",
    dateISO: "2026-07-03",
    relevance: 92,
    tags: ["Fed", "recortes", "earnings Q2", "semiconductores", "goldilocks"],
    tickers: ["VUAA", "SEMI", "IWDA"],
    status: "procesado",
    url: "https://www.bloomberg.com/opinion/authors/ARbTQlRLRjE/matthew-s-levine",
  },
  {
    id: "d2",
    title: "JP Morgan AM — Mid-Year Outlook 2026",
    snippet: "Sobreponderan calidad y semiconductores; infraponderan energía hasta ver disciplina OPEC+. Coberturas baratas como el riesgo mejor pagado del semestre.",
    summary:
      "Informe de perspectivas de mitad de año de JP Morgan Asset Management (34 páginas, PDF). Puntos clave para tu cartera: (1) sobreponderación explícita de semiconductores con horizonte 12 meses — coincide con tu tesis en SEMI; (2) infraponderación de energía citando la ruptura de disciplina de la OPEC+ — refuerza la revisión pendiente de tu mitad restante de BRT; (3) recomiendan cobertura vía opciones sobre índices europeos aprovechando la volatilidad implícita en mínimos; (4) escenario base de 2 recortes de la Fed en 2026 (septiembre y diciembre). Target S&P 500 a cierre de año: 6.500. Riesgo principal del informe: escalada arancelaria sostenida post-9 de julio.",
    origin: "upload",
    sourceName: "PDF subido manualmente",
    fileType: "pdf",
    date: "30 jun 2026",
    dateISO: "2026-06-30",
    relevance: 88,
    tags: ["outlook", "semiconductores", "energía", "cobertura", "Fed"],
    tickers: ["SEMI", "BRT", "VUAA"],
    status: "procesado",
  },
  {
    id: "d3",
    title: "The Daily Shot — Tariff deadline vs. record-low hedging costs",
    snippet: "El gráfico del día: coste de cobertura del Stoxx en mínimos anuales con el deadline arancelario a 3 días. Complacencia medible.",
    summary:
      "Edición del viernes de The Daily Shot con 42 gráficos. Los tres más relevantes para ti: (1) el coste de puts a 1 mes sobre el Stoxx 600 está en el percentil 8 del año pese al deadline del 9 de julio — cobertura históricamente barata; (2) posicionamiento especulativo neto largo en S&P en máximos de 2026 — combustible para una corrección si el jueves sale mal; (3) breadth del rally mejorando: 62% de componentes sobre su media de 50 sesiones, el rally se ensancha. Conclusión implícita del editor: el mercado trata los aranceles como táctica de negociación, no como política económica.",
    origin: "email",
    sourceName: "The Daily Shot",
    fileType: "eml",
    date: "3 jul 2026",
    dateISO: "2026-07-03",
    relevance: 81,
    tags: ["aranceles", "volatilidad", "posicionamiento", "cobertura", "breadth"],
    tickers: ["IWDA", "VUAA"],
    status: "procesado",
    url: "https://dailyshotbrief.com",
  },
  {
    id: "d4",
    title: "BBVA Research — Situación Global julio 2026",
    snippet: "PIB eurozona revisado al 1,5%. El euro fuerte resta dos décimas a exportadoras. BCE sin cambios hasta diciembre.",
    summary:
      "Informe mensual de BBVA Research (español, 28 páginas). Revisión al alza del PIB eurozona 2026 (1,4% → 1,5%) por consumo interno, pero con advertencia: EUR/USD en 1,178 (máximos de 4 años) resta unas dos décimas al sector exportador — matiz negativo para el tramo europeo de tu IWDA. Mantienen BCE sin movimientos hasta diciembre. España crece al 2,1%, por encima de la media. Riesgo principal: aranceles post-9 de julio; estiman impacto de -0,3pp en PIB eurozona en el peor escenario. Para tu EUNA: entorno de tipos estables es neutral-positivo.",
    origin: "email",
    sourceName: "BBVA Research",
    fileType: "eml",
    date: "2 jul 2026",
    dateISO: "2026-07-02",
    relevance: 74,
    tags: ["eurozona", "BCE", "euro", "PIB", "aranceles"],
    tickers: ["IWDA", "EUNA"],
    status: "procesado",
    url: "https://www.bbvaresearch.com",
  },
  {
    id: "d5",
    title: "Captura: tabla de flujos ETF semanales (EPFR)",
    snippet: "Imagen procesada con OCR: $18.400M de entrada en ETFs de renta variable global, mayor flujo desde enero. Salidas en energía por 5ª semana.",
    summary:
      "Imagen subida manualmente (captura de una tabla de EPFR Global compartida en X). El OCR extrajo la tabla completa de flujos semanales: renta variable global +$18.400M (mayor entrada desde enero), tecnología +$4.200M, energía -$890M (quinta semana consecutiva de salidas), bonos gobierno euro +$1.100M. Lectura para tu cartera: el flujo institucional acompaña tu posicionamiento en IWDA/VUAA/SEMI y confirma el consenso vendedor en energía que pesa sobre BRT. Dato de contraste: cuando los flujos semanales superan $15.000M, el retorno medio del mes siguiente es plano — el dinero llega tarde.",
    origin: "upload",
    sourceName: "Imagen (OCR)",
    fileType: "img",
    date: "4 jul 2026",
    dateISO: "2026-07-04",
    relevance: 67,
    tags: ["flujos", "ETF", "institucional", "energía"],
    tickers: ["IWDA", "VUAA", "SEMI", "BRT"],
    status: "procesado",
  },
  {
    id: "d6",
    title: "Goldman Sachs — The AI capex supercycle, year two",
    snippet: "URL procesada: el capex de hyperscalers crecerá 34% en 2026. La restricción ya no es demanda, es potencia eléctrica disponible.",
    summary:
      "Artículo de Goldman Sachs Insights procesado desde URL. Tesis: el ciclo de inversión en infraestructura de IA entra en su segundo año con capex agregado de hyperscalers +34% interanual, pero el cuello de botella se desplaza de chips a energía — la potencia eléctrica contratada para centros de datos en EEUU está agotada hasta 2028. Implicaciones: (1) la demanda de semiconductores sigue asegurada 12-18 meses (positivo SEMI); (2) emerge una segunda derivada en utilities con exposición a datacenters y en nuclear — tema que ya apareció en tus recomendaciones (URNM). Cifra destacada: cada GW de datacenter requiere ~$35.000M de inversión total.",
    origin: "url",
    sourceName: "goldmansachs.com",
    fileType: "html",
    date: "1 jul 2026",
    dateISO: "2026-07-01",
    relevance: 79,
    tags: ["IA", "capex", "semiconductores", "energía eléctrica", "nuclear"],
    tickers: ["SEMI"],
    status: "procesado",
    url: "https://www.goldmansachs.com/insights",
  },
  {
    id: "d7",
    title: "Notas propias — tesis Brent revisada.docx",
    snippet: "Documento de la carpeta Synpulse: tu tesis actualizada sobre la mitad restante de BRT con niveles de decisión ($66 / $62).",
    summary:
      "Documento Word detectado en tu carpeta Synpulse. Es tu propia nota de tesis sobre Brent, actualizada tras la reunión OPEC+ del 5 de julio. Puntos que registras: mantienes la mitad restante como cobertura geopolítica pura, no como apuesta direccional; nivel de invalidación en $66 (soporte de mayo) — si cierra por debajo, venta del 50% restante; nivel de pánico en $62. Catalizadores anotados: inventarios EIA del miércoles, reunión técnica OPEC+ del 28 de julio. La IA cruzó tu nota con las fuentes de la semana: Reuters y JP Morgan apuntan en la misma dirección (sin disciplina de oferta, sesgo bajista).",
    origin: "synpulse",
    sourceName: "Synpulse/tesis-brent-v3.docx",
    fileType: "docx",
    date: "5 jul 2026",
    dateISO: "2026-07-05",
    relevance: 85,
    tags: ["Brent", "tesis propia", "OPEC+", "niveles"],
    tickers: ["BRT"],
    status: "procesado",
  },
  {
    id: "d8",
    title: "FirstFT: Tariff letters to go out Monday",
    snippet: "Newsletter matinal del FT: las cartas arancelarias salen el lunes; la UE negocia exención parcial para automoción.",
    summary:
      "FirstFT del lunes 6 de julio. Titulares relevantes: (1) la Casa Blanca confirma el envío de las primeras cartas arancelarias hoy, con tipos del 25-40% para los socios sin acuerdo; (2) Bruselas negocia una exención parcial para automoción a cambio de compromisos de compra de GNL; (3) Japón e India, más lejos del acuerdo de lo que descuenta el mercado según fuentes diplomáticas. Contexto para hoy: el desenlace del jueves 9 es el evento binario de la semana para tu IWDA y VUAA. El artículo enlaza el tracker de negociaciones del FT.",
    origin: "email",
    sourceName: "Financial Times — FirstFT",
    fileType: "eml",
    date: "6 jul 2026",
    dateISO: "2026-07-06",
    relevance: 83,
    tags: ["aranceles", "UE", "comercio", "deadline"],
    tickers: ["IWDA", "VUAA"],
    status: "procesado",
    url: "https://www.ft.com/firstft",
  },
];

/* ------------------------------------------------------------------ */
/*  Persistencia local (mock) — sustituir por API real                 */
/* ------------------------------------------------------------------ */

const STORE_KEY = "finpulse-docs-v1";
export const DOCS_EVENT = "finpulse-docs-change";

export function loadDocs(): UserDoc[] {
  if (typeof window === "undefined") return MOCK_DOCS;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return MOCK_DOCS;
    const parsed = JSON.parse(raw) as UserDoc[];
    return Array.isArray(parsed) ? parsed : MOCK_DOCS;
  } catch {
    return MOCK_DOCS;
  }
}

export function saveDocs(docs: UserDoc[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event(DOCS_EVENT));
  } catch {}
}

export function sortDocs(docs: UserDoc[]): UserDoc[] {
  // relevancia primero; a igualdad (±5), más reciente primero
  return [...docs].sort((a, b) => {
    const dr = b.relevance - a.relevance;
    if (Math.abs(dr) > 5) return dr;
    return b.dateISO.localeCompare(a.dateISO);
  });
}
