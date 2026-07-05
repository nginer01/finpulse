/**
 * Noticias del briefing — capa de datos.
 *
 * HOY: 6 noticias mock convincentes para desarrollo.
 * FUTURO: estas noticias saldrán del Gmail dedicado (news.FinPulse@gmail.com).
 * Un LLM (Claude) leerá los emails, cruzará fuentes, generará `body`/`snippet`
 * y calculará `relevance` según el portfolio del usuario. La estructura de
 * abajo ya contempla ese reemplazo: basta con poblar los mismos campos desde
 * el backend (GET /api/news/articles) en lugar de este array estático.
 */

export type NewsSourceType = "news" | "newsletter" | "podcast" | "bank" | "polymarket" | "x";

export interface NewsRelevance {
  /** 0-100 — scoring del LLM según el portfolio del usuario */
  score: number;
  /** Por qué esta noticia importa a ESTE usuario */
  reason: string;
  /** Posiciones del portfolio afectadas */
  tickers: string[];
}

export interface NewsImpact {
  ticker: string;
  name: string;
  changePct: number;
  comment: string;
}

export interface NewsArticle {
  id: string; // slug estable; futuro: derivado del hilo temático del briefing
  headline: string;
  snippet: string; // 2 líneas para cards
  category: "Tu portfolio" | "Nuevo" | "Futuro";
  image: string;
  source: { name: string; type: NewsSourceType };
  date: string; // legible; futuro: fecha del briefing que la generó
  readingMinutes: number;
  relevance: NewsRelevance;
  body: string[]; // párrafos del resumen ampliado (futuro: generado por Claude)
  quote?: { text: string; author: string; source: string };
  impacts: NewsImpact[];
  related: string[]; // ids de noticias relacionadas
  // Campos reservados para el pipeline real (email + LLM):
  emailId?: string;
  generatedBy?: string;
}

export const NEWS: NewsArticle[] = [
  {
    id: "acuerdo-eeuu-china",
    headline: "Acuerdo comercial EEUU-China: impacto en ETFs globales y tu posición en MSCI World",
    snippet: "La fase 1 del acuerdo reduce aranceles en consumo e industria. El S&P 500 cierra en máximos y tu núcleo global captura el rally.",
    category: "Tu portfolio",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1600&h=900&fit=crop&q=90",
    source: { name: "Financial Times", type: "news" },
    date: "11 de mayo, 2026",
    readingMinutes: 8,
    relevance: {
      score: 92,
      reason: "IWDA y VUAA suman el 57% de tu portfolio y capturan directamente el rally global que desata el acuerdo.",
      tickers: ["IWDA", "VUAA", "SEMI"],
    },
    body: [
      "El viernes 9 de mayo, la Casa Blanca y el Consejo de Estado chino anunciaron simultáneamente un acuerdo comercial fase 1 que reduce los aranceles sobre bienes de consumo (al 10%) e industriales (al 15%). Es el primer avance concreto en las relaciones comerciales entre las dos mayores economías del mundo desde que se reiniciaron los aranceles a principios de 2026, y los mercados globales lo celebraron con un rally amplio e inmediato.",
      "El S&P 500 cerró en máximos históricos (+1.2%), el Nasdaq subió un +1.8% liderado por mega-caps con exposición a China, y los mercados asiáticos respondieron con subidas del 1.5-2.3% en la sesión del lunes. El Shanghai Composite fue el mayor beneficiario directo (+2.3%), mientras que el Nikkei subió un +1.5% impulsado por las exportadoras japonesas.",
      "Los detalles revelan tanto oportunidades como limitaciones. La exclusión explícita de semiconductores, equipos de IA y materiales estratégicos significa que el verdadero pulso geopolítico aún no se ha resuelto: las negociaciones sobre tecnología se han aplazado a Q3 2026, un calendario de incertidumbre que el mercado aún no ha descontado por completo.",
      "Para tus ETFs globales el impacto es claramente positivo a corto plazo. El MSCI World (+1.8%) y el S&P 500 (+2.1%) capturan directamente la mejora del sentimiento. Hay, sin embargo, una señal de precaución: el VIX cayó a 13.2, niveles de complacencia no vistos desde enero de 2024. Históricamente, cuando el VIX se mantiene por debajo de 14 durante más de 10 sesiones, el S&P 500 ha sufrido correcciones del 3-5% en las semanas siguientes. Ya llevamos 8 sesiones.",
      "La lección de 2019 aplica hoy: el mercado celebra la reducción de incertidumbre más que los términos específicos. La euforia inicial puede durar 2-3 semanas, pero sin progreso real en los aranceles tecnológicos, el impulso se desvanecerá. Si el S&P sube un +3% adicional desde aquí, considera tomar beneficios parciales en VUAA.",
    ],
    quote: {
      text: "Los mercados suben porque hay menos incertidumbre, no porque los términos sean especialmente buenos. Es un acuerdo para seguir negociando, que es mejor que no tener acuerdo.",
      author: "Matt Levine",
      source: "Money Stuff",
    },
    impacts: [
      { ticker: "IWDA", name: "iShares MSCI World", changePct: 1.8, comment: "Beneficiario directo del rally global. El componente europeo también sube por las expectativas de recorte del BCE. Posición núcleo: no requiere acción." },
      { ticker: "VUAA", name: "Vanguard S&P 500", changePct: 2.1, comment: "Máximos históricos. Atención al VIX en 13.2 — no es momento de añadir, pero tampoco de vender. Dejar correr." },
      { ticker: "SEMI", name: "VanEck Semiconductor", changePct: 4.2, comment: "Los aranceles tech quedan fuera del acuerdo y se negocian en Q3. El rally del sector está impulsado por demanda occidental, no china." },
    ],
    related: ["nvidia-blackwell-ultra", "iran-eeuu-brent", "india-supera-china"],
  },
  {
    id: "iran-eeuu-brent",
    headline: "Negociaciones Irán-EEUU avanzan: el Brent cae un 4% en la semana",
    snippet: "El lenguaje diplomático más positivo hasta la fecha. Si Irán vuelve al mercado, 1.5M de barriles diarios presionarían el precio hacia $68-70.",
    category: "Tu portfolio",
    image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1600&h=900&fit=crop&q=90",
    source: { name: "Reuters", type: "news" },
    date: "10 de mayo, 2026",
    readingMinutes: 7,
    relevance: {
      score: 88,
      reason: "Tu posición en Brent (9.3% del portfolio) pierde 45,60 € esta semana y es la más expuesta a un acuerdo con Irán.",
      tickers: ["BRT"],
    },
    body: [
      "Las negociaciones entre Irán y Estados Unidos avanzan más rápido de lo esperado. El secretario de Estado confirmó el jueves que \"se han logrado avances significativos\" — el lenguaje más positivo hasta la fecha. El Brent respondió cayendo un 4.2% en la semana hasta los $74.30.",
      "El escenario que descuenta el mercado: si Irán vuelve al mercado con plena capacidad, se estiman entre 1 y 1.5 millones de barriles diarios adicionales, lo que presionaría los precios hacia los $68-70. Polymarket sitúa la probabilidad de un acuerdo preliminar antes de agosto en el 58%, quince puntos más que la semana pasada.",
      "El paralelo histórico es incómodo. Cuando se firmó el JCPOA en julio de 2015, el Brent estaba en $65; en los seis meses siguientes cayó hasta $45 — un 30%. El factor agravante fue Arabia Saudí: en vez de recortar producción para defender el precio, mantuvo su nivel para defender cuota de mercado.",
      "Hay diferencias con 2026: la demanda global es mayor, la OPEC+ tiene una estructura de coordinación más sólida, y las renovables absorben parte de la demanda incremental. Pero las similitudes preocupan: el lenguaje diplomático es casi idéntico al de 2015 y Arabia Saudí aún no se ha pronunciado. La reunión de la OPEC+ del 1 de junio será decisiva.",
      "El nivel técnico a vigilar es $72: si lo rompe a la baja, el siguiente soporte está en $68. La recomendación activa (convicción 8/10) es reducir la posición un 50% antes de que se pierda ese soporte, manteniendo la otra mitad por si la OPEC+ reacciona con recortes.",
    ],
    quote: {
      text: "El riesgo bajista para el Brent es real y significativo. Incluso si el escenario no es tan extremo como 2015, una caída del 10-15% es plausible si el acuerdo avanza.",
      author: "FinPulse IA",
      source: "Briefing del 11 de mayo",
    },
    impacts: [
      { ticker: "BRT", name: "Brent Crude Oil", changePct: -3.8, comment: "Pérdida de 45,60 € esta semana. Recomendación: reducir 50% antes de la reunión OPEC+ del 1 de junio. Vigilar soporte en $72." },
    ],
    related: ["acuerdo-eeuu-china", "escasez-cobre", "regulacion-ia-europa"],
  },
  {
    id: "nvidia-blackwell-ultra",
    headline: "Nvidia presenta Blackwell Ultra: el mercado de semiconductores se reconfigura",
    snippet: "Rendimiento 4x en inferencia de IA. Los hyperscalers confirman pedidos masivos y TSMC eleva su capex un 15%. Tu mejor posición de la semana.",
    category: "Nuevo",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&q=90",
    source: { name: "Bloomberg", type: "news" },
    date: "9 de mayo, 2026",
    readingMinutes: 6,
    relevance: {
      score: 85,
      reason: "SEMI es tu mejor posición de la semana (+4.2%) y este evento confirma la tesis con la que compraste el 2 de mayo.",
      tickers: ["SEMI"],
    },
    body: [
      "La presentación de Blackwell Ultra el miércoles no fue una mejora incremental — fue un salto generacional. La nueva arquitectura promete un rendimiento 4 veces superior en inferencia de IA, y los pedidos anticipados de los hyperscalers (Amazon, Google, Microsoft) superaron todas las expectativas antes de que Jensen Huang bajara del escenario.",
      "Las implicaciones van más allá de Nvidia. TSMC confirma un aumento de capex del 15% para responder a la demanda, ASML venderá más máquinas EUV, y los fabricantes de memoria HBM (SK Hynix, Samsung) no dan abasto. Es un ciclo que se retroalimenta: la cadena de valor entera sube — ASML +3.2%, SK Hynix +4.8%, Samsung +2.1%.",
      "Tu posición en SEMI fue la gran beneficiada: +4.2% en la semana, la mejor de tu portfolio. Lo más interesante no es el rendimiento, sino tu decisión: compraste el 2 de mayo, cinco días antes del evento, con convicción 7/10 y la tesis de que el ciclo se estaba acelerando. Los datos te dieron la razón.",
      "El matiz que rescatan Matt Levine y Paul Donovan: los aranceles tecnológicos EEUU-China se negocian por separado en Q3, así que Nvidia sigue sin poder vender sus chips más potentes a China. El rally del sector está impulsado por demanda occidental — si las negociaciones de Q3 fracasan, habrá volatilidad.",
      "Próximos catalizadores: earnings de TSMC (22 de mayo) y guidance de ASML (28 de mayo). Ambos confirmarán o desmentirán la tesis del ciclo expansivo de 12-18 meses. Con el sector +25% YTD y un P/E de 32x, la recomendación es añadir solo en caídas superiores al 2%.",
    ],
    quote: {
      text: "Los hyperscalers ya han confirmado pedidos masivos para H2 2026. No es una mejora incremental: reconfigura la cadena de valor entera.",
      author: "The Daily Shot",
      source: "Newsletter del viernes",
    },
    impacts: [
      { ticker: "SEMI", name: "VanEck Semiconductor", changePct: 4.2, comment: "Mejor posición de la semana. Añadir en caídas >2% (convicción 7/10). Vigilar earnings de TSMC el 22 de mayo." },
    ],
    related: ["acuerdo-eeuu-china", "regulacion-ia-europa", "escasez-cobre"],
  },
  {
    id: "india-supera-china",
    headline: "India supera a China como mayor mercado emergente por flujo de capitales",
    snippet: "Tras meses de outperformance india, el acuerdo comercial provoca la primera rotación de capital de vuelta hacia China. Cambio de liderazgo a vigilar.",
    category: "Nuevo",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&h=900&fit=crop&q=90",
    source: { name: "The Daily Shot", type: "newsletter" },
    date: "9 de mayo, 2026",
    readingMinutes: 5,
    relevance: {
      score: 64,
      reason: "Tu exposición a emergentes vía IWDA es indirecta, pero una rotación sostenida cambiaría la composición del MSCI World.",
      tickers: ["IWDA"],
    },
    body: [
      "Un dato pasó desapercibido en la semana del acuerdo comercial: el Nifty 50 indio cerró plano mientras el Shanghai Composite subía un 2.3%. Tras meses de outperformance india, los inversores empiezan a rotar capital de India hacia China aprovechando la distensión comercial.",
      "Los flujos lo confirman. Según datos de EPFR recogidos por The Daily Shot, los ETFs de renta variable global recibieron $12.800 millones en la semana — el mayor flujo desde enero — y por primera vez en ocho meses los fondos de China onshore captaron más que los de India.",
      "El contexto importa: India ha sido la historia favorita de los mercados emergentes durante 2025, con valoraciones que llegaron a cotizar con prima del 80% sobre China. Esa prima se está comprimiendo. Si el acuerdo comercial se consolida y las negociaciones tech de Q3 no descarrilan, la rotación tiene recorrido.",
      "Para tu portfolio el efecto es indirecto: IWDA pondera emergentes de forma marginal, pero un cambio de liderazgo entre India y China alteraría los flujos globales que alimentan al MSCI World. Es un tema de seguimiento, no de acción inmediata.",
      "Señal a vigilar: si los flujos hacia China onshore encadenan cuatro semanas consecutivas de entradas netas, será la confirmación de que la rotación es estructural y no un rebote táctico.",
    ],
    impacts: [
      { ticker: "IWDA", name: "iShares MSCI World", changePct: 0.3, comment: "Efecto indirecto vía ponderación de emergentes. Tema de seguimiento, sin acción inmediata." },
    ],
    related: ["acuerdo-eeuu-china", "nvidia-blackwell-ultra", "escasez-cobre"],
  },
  {
    id: "regulacion-ia-europa",
    headline: "Regulación IA en Europa: el nuevo marco legal podría impactar al sector tech en 2027",
    snippet: "Bruselas prepara la segunda fase del AI Act con requisitos de cómputo y transparencia. Las tecnológicas ya presupuestan el coste de cumplimiento.",
    category: "Futuro",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&h=900&fit=crop&q=90",
    source: { name: "Matt Levine", type: "newsletter" },
    date: "8 de mayo, 2026",
    readingMinutes: 6,
    relevance: {
      score: 58,
      reason: "Impacto a 12-18 meses vista sobre el componente tech de tus ETFs globales y sobre SEMI si la regulación toca al hardware de IA.",
      tickers: ["IWDA", "VUAA", "SEMI"],
    },
    body: [
      "La Comisión Europea prepara la segunda fase del AI Act, con entrada en vigor prevista para 2027. Las filtraciones apuntan a requisitos de transparencia sobre datos de entrenamiento, umbrales de cómputo que obligarían a auditorías independientes, y multas de hasta el 7% de la facturación global.",
      "Matt Levine dedica su newsletter a la parte que el mercado aún no valora: el coste de cumplimiento. Los grandes proveedores de modelos (OpenAI, Anthropic, Google) pueden absorberlo, pero las tecnológicas medianas europeas tendrían que elegir entre licenciar modelos americanos o asumir costes regulatorios desproporcionados.",
      "El precedente del GDPR es ilustrativo: en 2018 el mercado lo ignoró hasta que las primeras multas llegaron en 2019-2020. Esta vez los analistas descuentan un impacto en márgenes del sector tech europeo del 1-2% a partir de 2027 — pequeño, pero no cero.",
      "Para el hardware la incógnita es si los umbrales de cómputo afectan a los aceleradores de IA. Si las auditorías se exigen por debajo del umbral actual de FLOPs, parte de la demanda europea de chips podría retrasarse a 2027-2028, lo que tocaría tangencialmente a tu posición en SEMI.",
      "Horizonte: 12-18 meses. No hay acción que tomar hoy, pero es el tipo de tema que conviene tener en el radar antes de que sea portada. Cuando la fase 2 se vote en el Parlamento Europeo (previsiblemente Q4 2026), el mercado empezará a ponerle precio.",
    ],
    quote: {
      text: "El mercado trata la regulación como ruido hasta que llega la primera multa. Con el AI Act, 2027 es el año en que el ruido se convierte en línea de coste.",
      author: "Matt Levine",
      source: "Money Stuff",
    },
    impacts: [
      { ticker: "SEMI", name: "VanEck Semiconductor", changePct: 0, comment: "Riesgo a 12-18 meses si los umbrales de cómputo tocan al hardware. Sin acción hoy." },
      { ticker: "IWDA", name: "iShares MSCI World", changePct: 0, comment: "El componente tech europeo podría ver presión en márgenes del 1-2% desde 2027." },
    ],
    related: ["nvidia-blackwell-ultra", "acuerdo-eeuu-china", "india-supera-china"],
  },
  {
    id: "escasez-cobre",
    headline: "Escasez global de cobre: la próxima crisis silenciosa de la transición energética",
    snippet: "BBVA Research alerta: la demanda de cobre para EVs y renovables superará la oferta en 2027-2028. Chile y Perú no pueden escalar producción.",
    category: "Futuro",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&h=900&fit=crop&q=90",
    source: { name: "Informe BBVA", type: "bank" },
    date: "8 de mayo, 2026",
    readingMinutes: 6,
    relevance: {
      score: 61,
      reason: "Oportunidad temprana identificada por la IA (COPX, convicción 7/10). Aún no tienes exposición a materias primas industriales.",
      tickers: [],
    },
    body: [
      "BBVA Research y Bloomberg coinciden en la misma alerta: la demanda de cobre para vehículos eléctricos, redes eléctricas y renovables superará estructuralmente a la oferta a partir de 2027-2028. Un EV usa cuatro veces más cobre que un coche de combustión, y cada megavatio eólico instalado necesita entre 3 y 5 toneladas.",
      "El problema es la oferta. Chile y Perú — que concentran el 40% de la producción mundial — no pueden escalar: las leyes del mineral caen, los proyectos nuevos tardan 10-15 años en entrar en producción, y la conflictividad social ha paralizado ampliaciones clave. Las nuevas minas de Congo e Indonesia no cubren el hueco.",
      "El mercado aún no lo ha puesto en precio. El cobre cotiza en rangos y los mineros (COPX) siguen valorados como cíclicos tardíos, no como beneficiarios de un déficit estructural. Es exactamente el tipo de asimetría que busca la sección de oportunidades: tesis fundamentada, catalizador a 12-24 meses, y entrada antes de que sea mainstream.",
      "Los contraargumentos existen y hay que tenerlos delante: el reciclaje de cobre puede amortiguar el déficit (hoy cubre ~30% de la demanda), una desaceleración global reduciría el consumo, y la sustitución por aluminio en algunas aplicaciones es técnicamente viable aunque peor.",
      "La recomendación activa es COPX (Global X Copper Miners) con convicción 7/10, retorno esperado +15% a +40% en 12-24 meses. Si quieres exposición, la vía prudente es una posición inicial pequeña (2-4% del portfolio) con intención de ampliar si la tesis del déficit se confirma en los datos de 2026.",
    ],
    impacts: [],
    related: ["iran-eeuu-brent", "india-supera-china", "acuerdo-eeuu-china"],
  },
];

export function getArticle(id: string): NewsArticle | undefined {
  return NEWS.find((n) => n.id === id);
}

export function getRelated(article: NewsArticle): NewsArticle[] {
  return article.related
    .map((id) => getArticle(id))
    .filter((a): a is NewsArticle => !!a)
    .slice(0, 3);
}
