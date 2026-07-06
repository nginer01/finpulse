/**
 * Registro de fuentes citadas en la app.
 * Cada dato/consejo clickeable apunta a una entrada de aquí — el modal
 * de fuente (SourceLink) muestra nombre, fecha, snippet y link al original.
 * MOCK: cuando exista el pipeline real, esto vendrá de Supabase (tabla sources).
 */

export type SourceType = "newsletter" | "podcast" | "polymarket" | "x" | "bank" | "news" | "paper" | "web";

export interface SourceRef {
  id: string;
  name: string;
  type: SourceType;
  author?: string;
  date: string;
  title: string;
  snippet: string;
  url?: string;
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  newsletter: "Newsletter",
  podcast: "Podcast",
  polymarket: "Mercado de predicción",
  x: "X (Twitter)",
  bank: "Informe bancario",
  news: "Prensa",
  paper: "Paper / informe",
  web: "Web",
};

export const SOURCES: Record<string, SourceRef> = {
  "ubs-donovan": {
    id: "ubs-donovan",
    name: "UBS On-Air",
    type: "podcast",
    author: "Paul Donovan",
    date: "6 julio 2026",
    title: "Payrolls, tariffs and the September question",
    snippet:
      "El dato de empleo no cambia el destino, cambia el calendario. La Fed recortará cuando los aranceles dejen de ensuciar la foto de inflación — septiembre sigue vivo. Sobre el 9 de julio: espero prórrogas selectivas, no un choque.",
    url: "https://www.ubs.com/global/en/wealth-management/insights/podcasts.html",
  },
  "matt-levine": {
    id: "matt-levine",
    name: "Money Stuff",
    type: "newsletter",
    author: "Matt Levine — Bloomberg",
    date: "3 julio 2026",
    title: "The Market Buys the Calendar",
    snippet:
      "Nadie compra el S&P a 22 veces beneficios porque espere un recorte en julio. Lo compra porque cree que los beneficios del Q2 van a justificar el múltiplo. La semana que viene empezamos a saberlo.",
    url: "https://www.bloomberg.com/opinion/authors/ARbTQlRLRjE/matthew-s-levine",
  },
  "daily-shot": {
    id: "daily-shot",
    name: "The Daily Shot",
    type: "newsletter",
    date: "3 julio 2026",
    title: "Tariff deadline vs. record-low hedging costs",
    snippet:
      "El mercado ha decidido que los aranceles son una táctica de negociación y no una política económica. La semana que viene sabremos si el mercado negocia bien. El coste de cobertura sobre el Stoxx está en mínimos del año.",
    url: "https://dailyshotbrief.com",
  },
  "polymarket-fed": {
    id: "polymarket-fed",
    name: "Polymarket",
    type: "polymarket",
    date: "6 julio 2026",
    title: "Fed decision in September 2026",
    snippet:
      "Recorte en septiembre: 68% (+9 en la semana tras las nóminas). Recorte en julio: 5% (-16). Recesión EEUU en 2026: 18% (-2). Volumen agregado del mercado: $41M.",
    url: "https://polymarket.com",
  },
  "polymarket-aranceles": {
    id: "polymarket-aranceles",
    name: "Polymarket",
    type: "polymarket",
    date: "6 julio 2026",
    title: "EU-US trade framework before July 9",
    snippet:
      "Acuerdo marco UE-EEUU antes del 9 de julio: 42% (+11 en la semana). Prórroga de la pausa para la mayoría de socios: 71%. Aranceles >25% a Japón: 34%.",
    url: "https://polymarket.com",
  },
  "ft-empleo": {
    id: "ft-empleo",
    name: "Financial Times",
    type: "news",
    date: "3 julio 2026",
    title: "US payrolls beat forecasts as jobless rate falls to 4.1%",
    snippet:
      "La economía estadounidense creó 147.000 empleos en junio, por encima de las 110.000 previstas. El detalle: el empleo público estatal y local aportó la mitad del total; el privado (ADP) fue negativo por primera vez en dos años.",
    url: "https://www.ft.com",
  },
  "reuters-opec": {
    id: "reuters-opec",
    name: "Reuters",
    type: "news",
    date: "5 julio 2026",
    title: "OPEC+ agrees larger-than-expected output hike for August",
    snippet:
      "El grupo devolverá 548.000 barriles diarios en agosto, frente a los 411.000 de los tres meses anteriores. Fuentes del cártel: 'La cuota de mercado manda'. Es la señal más clara desde 2015 de que Arabia Saudí tolera precios más bajos.",
    url: "https://www.reuters.com",
  },
  "bloomberg-nvda": {
    id: "bloomberg-nvda",
    name: "Bloomberg",
    type: "news",
    date: "3 julio 2026",
    title: "Nvidia closes within 2% of $4 trillion valuation",
    snippet:
      "Nvidia está a un paso de ser la primera empresa de la historia en valer 4 billones de dólares — más que todo el mercado bursátil alemán. Los pedidos de Blackwell Ultra tienen comprometida la capacidad de 2026.",
    url: "https://www.bloomberg.com",
  },
  "tsmc-ventas": {
    id: "tsmc-ventas",
    name: "TSMC IR",
    type: "web",
    date: "4 julio 2026",
    title: "June 2026 revenue report",
    snippet:
      "Ventas de junio +26% interanual. El Q2 completo se publica el 10 de julio. El consenso espera confirmación del ciclo de capex de IA; una decepción aquí sería el primer aviso serio para el sector.",
    url: "https://investor.tsmc.com",
  },
  "bbva-research": {
    id: "bbva-research",
    name: "BBVA Research",
    type: "bank",
    date: "2 julio 2026",
    title: "Situación Global — julio 2026",
    snippet:
      "Revisamos el PIB eurozona 2026 al 1,5%. El euro fuerte (1,178) resta dos décimas a las exportadoras. Mantenemos previsión de BCE sin cambios hasta diciembre. Riesgo principal: escalada arancelaria tras el 9 de julio.",
    url: "https://www.bbvaresearch.com",
  },
  "zerohedge-vix": {
    id: "zerohedge-vix",
    name: "@zerohedge",
    type: "x",
    date: "5 julio 2026",
    title: "Hilo: VIX 16 into a binary event",
    snippet:
      "VIX en 16,4 con el deadline arancelario a 3 días. Máximos históricos + volatilidad en mínimos de 5 meses + posicionamiento largo récord. Ya sabéis cómo termina esto cuando sale mal. Hilo con los datos de 2018 y abril 2025.",
    url: "https://x.com/zerohedge",
  },
  "sentimentrader": {
    id: "sentimentrader",
    name: "@sentimentrader",
    type: "x",
    date: "3 julio 2026",
    title: "Optimism index update",
    snippet:
      "Nuestro índice compuesto entra en 'optimismo elevado' (no extremo). Históricamente: retornos planos a 1 mes, +4% de media a 3 meses. No es señal de venta — es señal de no perseguir.",
    url: "https://x.com/sentimentrader",
  },
  "ubs-bce": {
    id: "ubs-bce",
    name: "UBS On-Air",
    type: "podcast",
    author: "Paul Donovan",
    date: "1 julio 2026",
    title: "Sintra: the euro problem",
    snippet:
      "Lagarde admitió en Sintra que el euro fuerte 'ya es parte de la conversación'. Con EUR/USD en máximos de cuatro años, las exportadoras europeas pierden competitividad — primer matiz negativo para el tramo europeo de los índices globales.",
    url: "https://www.ubs.com/global/en/wealth-management/insights/podcasts.html",
  },
  "jpm-outlook": {
    id: "jpm-outlook",
    name: "JP Morgan AM",
    type: "bank",
    date: "30 junio 2026",
    title: "Mid-Year Outlook 2026",
    snippet:
      "Sobreponderamos renta variable de calidad y semiconductores; infraponderamos energía hasta ver disciplina de la OPEC+. El riesgo mejor pagado del semestre: coberturas baratas contra un accidente arancelario.",
    url: "https://am.jpmorgan.com",
  },
};

/** Busca una fuente por nombre aproximado ("Polymarket (58%)" → polymarket-*). */
export function findSourceByName(name: string): SourceRef | undefined {
  const clean = name.toLowerCase().replace(/\(.*\)/, "").trim();
  return Object.values(SOURCES).find(
    (s) =>
      s.name.toLowerCase().includes(clean) ||
      clean.includes(s.name.toLowerCase()) ||
      (s.author && s.author.toLowerCase().includes(clean))
  );
}
