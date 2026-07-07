/**
 * Glosario contextual — términos técnicos con explicación al hover.
 * Tres profundidades: basico (principiante), medio (intermedio, default de
 * Nico), pro (avanzado). El nivel sale del perfil (experience_level) y se
 * puede cambiar al vuelo desde el propio popover (override persistente).
 * Consultar un término emite señal de tracking (tema a profundizar).
 */

export type GlossaryLevel = "basico" | "medio" | "pro";

export type GlossaryEntry = {
  term: string;
  category: string;
  levels: Record<GlossaryLevel, string>;
  example?: string; // ligado al portfolio cuando aplica
};

const LEVEL_KEY = "finpulse-glossary-level";

export const LEVEL_LABELS: Record<GlossaryLevel, string> = {
  basico: "Básico",
  medio: "Medio",
  pro: "Pro",
};

export function getGlossaryLevel(): GlossaryLevel {
  try {
    const override = localStorage.getItem(LEVEL_KEY);
    if (override === "basico" || override === "medio" || override === "pro") return override;
    const user = JSON.parse(localStorage.getItem("finpulse_user") || "{}");
    const exp = (user.experience_level || "").toLowerCase();
    if (exp.startsWith("princ")) return "basico";
    if (exp.startsWith("avanz") || exp.startsWith("expert")) return "pro";
  } catch {}
  return "medio";
}

export function setGlossaryLevel(level: GlossaryLevel) {
  try {
    localStorage.setItem(LEVEL_KEY, level);
  } catch {}
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  vix: {
    term: "VIX",
    category: "volatilidad",
    levels: {
      basico: "El 'índice del miedo': mide cuánto movimiento espera el mercado en el S&P 500 durante el próximo mes. Alto = nervios; bajo = calma.",
      medio: "Índice de volatilidad implícita a 30 días del S&P 500, calculado desde los precios de las opciones. Bajo 15 suele leerse como complacencia; sobre 30, como estrés. Extremos prolongados tienden a revertir.",
      pro: "Volatilidad implícita a 30 días interpolada de la cadena de opciones OTM del SPX (metodología variance swap). Niveles sub-15 sostenidos comprimen las primas y suelen preceder expansiones bruscas de vol; la estructura de futuros (contango/backwardation del VX) matiza la lectura.",
    },
    example: "Con VIX en 16,4 y el deadline arancelario a días, protegerse con opciones es históricamente barato.",
  },
  "punto-basico": {
    term: "punto básico",
    category: "renta fija",
    levels: {
      basico: "Una centésima de un 1%. Si un bono pasa de rendir 3,00% a 3,25%, ha subido 25 puntos básicos.",
      medio: "1 pb = 0,01%. La unidad estándar para hablar de tipos y diferenciales: '50 pb de recorte' = medio punto porcentual menos.",
      pro: "0,01% (1e-4). En duración: ΔPrecio ≈ −Duración modificada × Δtipos(pb)/100. El DV01 expresa la sensibilidad en euros por punto básico.",
    },
  },
  duracion: {
    term: "duración",
    category: "renta fija",
    levels: {
      basico: "Cuánto sube o baja un bono cuando se mueven los tipos de interés. Más duración = más sensible.",
      medio: "Sensibilidad del precio de un bono a los tipos: con duración 7, una bajada de tipos del 1% sube el precio ~7%. Alargar duración = apostar a que los tipos bajan.",
      pro: "Media ponderada de los plazos de los flujos (Macaulay); la modificada aproxima la variación porcentual del precio por unidad de yield. Para movimientos grandes entra la convexidad (efecto de segundo orden, favorable al tenedor).",
    },
    example: "Tu compra de EUNA antes del recorte del BCE es una apuesta de duración: si bajan tipos, el bono sube.",
  },
  "prima-geopolitica": {
    term: "prima geopolítica",
    category: "energía",
    levels: {
      basico: "El extra que paga el mercado por el petróleo cuando hay riesgo de conflicto que pueda cortar el suministro.",
      medio: "Sobreprecio del crudo atribuible al riesgo de interrupciones de oferta (guerras, sanciones, estrechos). Se infla con los titulares y se desinfla más rápido de lo que llegó.",
      pro: "Diferencial entre el precio spot y el justificado por fundamentales de oferta/demanda e inventarios. Difícil de medir directamente; proxies: spreads calendario, posicionamiento especulativo (CFTC) y opciones OTM call skew.",
    },
    example: "Tu tesis de BRT depende de esta prima: por eso su alerta de invalidación vigila los 66$.",
  },
  capex: {
    term: "capex",
    category: "semiconductores",
    levels: {
      basico: "El dinero que las empresas invierten en fábricas, máquinas y equipos para crecer.",
      medio: "Capital expenditure: inversión en activo fijo. En semiconductores, el capex de TSMC/Intel/Samsung y de los hyperscalers (Microsoft, Google) marca el ciclo del sector entero.",
      pro: "Gasto capitalizado en balance y depreciado en años (vs opex). El ratio capex/ventas y su segunda derivada anticipan el ciclo de equipamiento (ASML, AMAT) con 2-3 trimestres de adelanto sobre las foundries.",
    },
    example: "El ciclo de capex en IA es la tesis de tu posición SEMI: mientras acelere, la tesis vive.",
  },
  "evento-binario": {
    term: "evento binario",
    category: "riesgo",
    levels: {
      basico: "Un evento con dos desenlaces muy distintos (acuerdo o no acuerdo) que puede mover el mercado de golpe.",
      medio: "Catalizador de fecha conocida y resultado incierto (deadline arancelario, fallo judicial, dato clave). El riesgo no es la dirección sino el salto: el precio puede abrir en otro nivel sin dejarte reaccionar.",
      pro: "Discontinuidad en la distribución de retornos: gap risk no cubrible con stops. Se gestiona con opciones (straddles/strangles si la vol implícita no lo descuenta) o reduciendo tamaño antes del evento.",
    },
    example: "El deadline arancelario del 9 de julio es el evento binario de la semana — y el VIX en 16 dice que nadie lo cubre.",
  },
  complacencia: {
    term: "complacencia",
    category: "sentimiento",
    levels: {
      basico: "Cuando el mercado está tan tranquilo que deja de protegerse — justo cuando protegerse es más barato.",
      medio: "Estado de sentimiento con volatilidad comprimida, poca demanda de cobertura y récords encadenados. No predice la caída, pero garantiza que si llega, pillará a la mayoría sin red.",
      pro: "Métricas: VIX sub-15 sostenido, put/call ratio bajo, skew plano, exposición sistemática (vol target/CTA) elevada. El riesgo es reflexivo: la calma atrae apalancamiento que amplifica el shock cuando la vol repunta.",
    },
  },
  nominas: {
    term: "nóminas (NFP)",
    category: "macro EEUU",
    levels: {
      basico: "El dato mensual de empleo en EEUU: cuántos puestos de trabajo se crearon. Mueve mercados el primer viernes de cada mes.",
      medio: "Nonfarm payrolls: creación de empleo no agrícola. Fuerte = economía sólida = la Fed puede mantener tipos altos; débil = recortes más cerca. El matiz está en las revisiones y en el detalle público/privado.",
      pro: "Encuesta de establecimientos (CES), ±100k de error muestral y revisiones sistemáticas. Cruzar con la encuesta de hogares (tasa de paro), ADP y JOLTS. El breakdown sectorial (privado vs gobierno) pesa más que el headline.",
    },
    example: "Las 147k nóminas de junio parecían fuertes, pero la mitad era empleo público estatal — el matiz que cambia la lectura.",
  },
  "media-movil": {
    term: "media móvil",
    category: "técnico",
    levels: {
      basico: "El precio medio de las últimas X sesiones, dibujado como línea. Ayuda a ver la tendencia sin el ruido del día a día.",
      medio: "Media del precio de las últimas N sesiones (50 y 200 son las clásicas). Precio sobre la de 200 = tendencia alcista de fondo; los cruces (golden/death cross) se usan como señales de cambio.",
      pro: "Filtro paso-bajo con lag proporcional a N. Variantes exponenciales ponderan lo reciente. Su valor real es como nivel de referencia autocumplido: los algos institucionales ejecutan contra la MM200, lo que la convierte en soporte/resistencia de facto.",
    },
  },
  soporte: {
    term: "soporte",
    category: "técnico",
    levels: {
      basico: "Un nivel de precio donde históricamente aparecen compradores y la caída se frena.",
      medio: "Zona donde la demanda ha superado a la oferta en el pasado. Perderlo con volumen convierte el soporte en resistencia y suele acelerar la caída — por eso las tesis definen su invalidación ahí.",
      pro: "Concentración de liquidez visible en el perfil de volumen; su ruptura dispara stops agrupados (liquidity sweep) y produce el patrón de aceleración-retesteo. Más fiable cuanto más veces defendido y con más volumen.",
    },
    example: "Tu alerta de BRT en los 66$ vigila exactamente esto: el soporte que sostiene la tesis.",
  },
  "per": {
    term: "PER",
    category: "valoración",
    levels: {
      basico: "Cuántas veces pagas los beneficios anuales de una empresa al comprar su acción. PER 20 = pagas 20 años de beneficio actual.",
      medio: "Price/Earnings: precio entre beneficio por acción. 22x en el S&P está caro frente a su media histórica (~16-17x) — se justifica solo si los beneficios crecen o los tipos bajan.",
      pro: "Inverso del earnings yield; compárese con el tipo real a 10 años (equity risk premium). El PER forward depende de estimaciones con sesgo optimista; el CAPE de Shiller suaviza el ciclo. Múltiplo alto = duración larga implícita: sensibilidad a tipos.",
    },
  },
  earnings: {
    term: "earnings",
    category: "renta variable",
    levels: {
      basico: "Los resultados trimestrales de las empresas: cuánto ganaron y qué esperan ganar. Las sorpresas mueven el precio.",
      medio: "Temporada de resultados: lo que importa no es el número sino la comparación con lo esperado y la guía futura. Un buen dato con mala guía castiga; el mercado cotiza expectativas.",
      pro: "La reacción depende del posicionamiento y de la vol implícita descontada (implied move de los straddles). Beat-and-fade en máximos = distribución; miss absorbido sin caída = suelo de expectativas.",
    },
    example: "La banca americana abre temporada el 14 de julio — la validación (o no) del S&P a 22x beneficios.",
  },
  contango: {
    term: "contango",
    category: "energía",
    levels: {
      basico: "Cuando el petróleo para entrega futura cuesta más que el de entrega inmediata. Suele señalar mercado bien abastecido.",
      medio: "Curva de futuros ascendente: el spot vale menos que los contratos lejanos. Indica oferta holgada (almacenar sale rentable) y penaliza a los ETFs que ruedan contratos, como los de crudo.",
      pro: "Estructura donde el roll yield es negativo para posiciones largas en futuros. La transición backwardation→contango es señal de cambio de régimen de inventarios; el spread M1-M2 es el termómetro diario.",
    },
    example: "Si el Brent entra en contango tras el aumento de la OPEC+, tu posición BRT sufre también por el roll.",
  },
  hawkish: {
    term: "hawkish",
    category: "política monetaria",
    levels: {
      basico: "Postura 'dura' de un banco central: prioriza contener la inflación aunque cueste crecimiento — tipos altos por más tiempo.",
      medio: "Sesgo restrictivo: subir tipos o retrasar recortes. Un dato fuerte de empleo hace 'hawkish' la lectura del mercado aunque la Fed no diga nada. Antónimo: dovish.",
      pro: "Se mide en la reacción de los futuros de fondos federales y el repricing de la curva corta (2Y). El tono importa menos que el dot plot y el balance (QT); la comunicación es el instrumento.",
    },
  },
  dovish: {
    term: "dovish",
    category: "política monetaria",
    levels: {
      basico: "Postura 'suave' de un banco central: prioriza apoyar la economía — tipos bajos o recortes más pronto.",
      medio: "Sesgo acomodaticio: recortar tipos o insinuar que llegarán. El BCE está dovish; por eso el mercado da 78% a un recorte en septiembre y los bonos europeos suben.",
      pro: "El repricing dovish baja la curva corta y empina la larga si el mercado compra reflación; aplana si compra desaceleración. La divisa suele debilitarse salvo que el resto de bancos centrales acompañe.",
    },
    example: "Tu compra de EUNA es una apuesta a que el BCE cumple su giro dovish en septiembre.",
  },
  "curva-de-tipos": {
    term: "curva de tipos",
    category: "renta fija",
    levels: {
      basico: "El mapa de cuánto rinde la deuda a cada plazo: 1 año, 5, 10, 30. Su forma cuenta qué espera el mercado de la economía.",
      medio: "Normal: plazos largos rinden más. Invertida (cortos > largos): el mercado espera recortes — históricamente precede recesiones. La 'desinversión' tras una inversión larga es la fase delicada.",
      pro: "El spread 2s10s es el proxy estándar; el bear/bull steepening distingue si empina por inflación o por recortes. La prima de plazo (ACM) separa expectativas de compensación por riesgo — su repunte en 2026 es la incógnita fiscal.",
    },
  },
  "stop-loss": {
    term: "stop loss",
    category: "gestión de riesgo",
    levels: {
      basico: "Una orden que vende automáticamente si el precio cae hasta un nivel que tú fijas. Corta las pérdidas sin que tengas que mirar.",
      medio: "Nivel de salida predefinido. Bien puesto responde a la tesis ('si pierde 66, mi razón para estar dentro ya no existe'), no a un porcentaje arbitrario. En gaps puede ejecutarse peor que el nivel.",
      pro: "Stops de mercado sufren slippage en gaps y barridos de liquidez; los stop-limit arriesgan no ejecutarse. Alternativas: salidas por cierre confirmado, opciones protectoras, o sizing que haga tolerable el peor caso.",
    },
    example: "Tus alertas de invalidación son stops mentales: FinPulse te avisa del nivel; la decisión sigue siendo tuya.",
  },
  dca: {
    term: "DCA",
    category: "gestión de cartera",
    levels: {
      basico: "Invertir la misma cantidad cada mes, pase lo que pase. Compras más barato cuando cae y más caro cuando sube — de media, te olvidas del timing.",
      medio: "Dollar-cost averaging: aportaciones periódicas fijas. Renuncia al timing a cambio de disciplina; matemáticamente pierde contra invertir todo de golpe en mercados alcistas, pero gana en la práctica porque elimina el factor emocional.",
      pro: "Reduce la varianza del precio medio de entrada, no el riesgo terminal. Vs lump-sum: inferior en esperanza (el mercado sube ~2/3 del tiempo), superior en utilidad si la aversión al arrepentimiento es alta. Su valor es conductual, no estadístico.",
    },
    example: "Tus compras mensuales de IWDA son DCA puro — y tu journal las etiqueta así para no confundirlas con decisiones tácticas.",
  },
  rebalanceo: {
    term: "rebalanceo",
    category: "gestión de cartera",
    levels: {
      basico: "Devolver la cartera a sus pesos objetivo: vender un poco de lo que más subió y comprar lo que se quedó atrás.",
      medio: "Disciplina antimomentum: fuerza a vender caro y comprar barato sin opinar. Por calendario (trimestral) o por bandas (cuando un peso se desvía >5pp del objetivo).",
      pro: "El rebalanceo por bandas domina al de calendario en coste/beneficio. Genera 'rebalancing premium' en activos con varianza alta y baja correlación; en tendencias fuertes sostenidas, penaliza (vende ganadores pronto).",
    },
    example: "SEMI pesa ya el 15% de tu cartera tras el rally — el rebalanceo diría recortar; tu convicción en el ciclo dirá si obedeces.",
  },
  beta: {
    term: "beta",
    category: "riesgo",
    levels: {
      basico: "Cuánto se mueve un activo cuando el mercado se mueve un 1%. Beta 1,5 = amplifica; beta 0,5 = amortigua.",
      medio: "Sensibilidad estadística al mercado. SEMI tiene beta alta (el sector amplifica los ciclos); EUNA, beta casi nula con bolsa — por eso equilibran la cartera.",
      pro: "Pendiente de la regresión de retornos vs benchmark; inestable entre regímenes (la beta condicional en caídas suele ser mayor). Distinguir beta de mercado de exposiciones factoriales (size, value, momentum) para no pagar alfa por beta disfrazada.",
    },
  },
  drawdown: {
    term: "drawdown",
    category: "riesgo",
    levels: {
      basico: "La caída desde el punto más alto de tu cartera hasta el más bajo. Un -20% de drawdown necesita +25% para recuperarse.",
      medio: "Pérdida máxima desde pico. La asimetría es lo cruel: -50% exige +100% de recuperación. Gestionar drawdowns importa más que maximizar retornos para poder mantener el plan.",
      pro: "Max drawdown es función del path, no de la distribución de retornos — dos series con igual Sharpe difieren brutalmente. El ratio de Calmar (CAGR/MaxDD) y el tiempo bajo el agua completan la foto.",
    },
  },
  "etf": {
    term: "ETF",
    category: "producto",
    levels: {
      basico: "Un fondo que cotiza en bolsa como una acción: con una sola compra llevas dentro cientos de empresas o bonos.",
      medio: "Exchange-traded fund: réplica de un índice con liquidez intradía y comisiones bajas. Los UCITS europeos (IWDA, VUAA) acumulan dividendos y tienen ventajas fiscales para residentes en España frente a los americanos.",
      pro: "El mecanismo de creación/reembolso in-kind mantiene el precio pegado al NAV vía arbitraje de participantes autorizados. Vigilar: tracking difference (no solo error), método de réplica (física vs sintética) y préstamo de valores.",
    },
    example: "Tu núcleo (IWDA + VUAA) son ETFs UCITS de acumulación — eficiencia fiscal española incluida.",
  },
  cobertura: {
    term: "cobertura",
    category: "gestión de riesgo",
    levels: {
      basico: "Una posición que gana cuando tu cartera pierde, para amortiguar los golpes. Como un seguro: cuesta algo y casi siempre 'sobra'.",
      medio: "Hedge: reducir un riesgo específico sin deshacer la posición (puts sobre índice, oro frente a inflación, duración frente a recesión). El coste recurrente es el precio de dormir tranquilo.",
      pro: "Cobertura óptima ≠ eliminar riesgo: ratio de cobertura según beta/delta y presupuesto de coste. Los proxies baratos (correlaciones históricas) fallan justo en la cola — el basis risk es el impuesto oculto del hedging indirecto.",
    },
  },
  "renta-fija": {
    term: "renta fija",
    category: "renta fija",
    levels: {
      basico: "Prestar dinero (a gobiernos o empresas) a cambio de intereses. Más estable que la bolsa, pero no sin riesgo: si suben los tipos, tus bonos valen menos.",
      medio: "Bonos: el precio se mueve al revés que los tipos. La 'renta' es fija; el precio, no. Duración y calidad crediticia son las dos palancas de riesgo.",
      pro: "Descomposición del yield: tipo real + inflación esperada + prima de plazo (+ spread de crédito). El retorno total combina carry, roll-down y ΔP por tipos — en 2026, el roll-down de una curva empinada es la fuente silenciosa de retorno.",
    },
    example: "EUNA es tu pata de renta fija: bonos de gobierno euro que suben si el BCE recorta.",
  },
  "opec": {
    term: "OPEC+",
    category: "energía",
    levels: {
      basico: "El club de países productores de petróleo (Arabia Saudí, Rusia y aliados) que pacta cuánto crudo sacar al mercado para influir en el precio.",
      medio: "Cartel que gestiona ~40% de la producción mundial. Sus decisiones de cuota son de las pocas señales macro accionables en horas: más oferta = presión bajista inmediata.",
      pro: "La cohesión interna es la variable: cumplimiento de cuotas vs sobreproducción (Irak, Kazajistán). La capacidad ociosa saudí (~3M b/d) es la put implícita del mercado; su erosión cambia el régimen de precios.",
    },
    example: "Los +548k b/d desde agosto son el motivo de tu venta parcial de BRT — y de que su tesis tenga alerta en los 66$.",
  },
  arancel: {
    term: "arancel",
    category: "aranceles",
    levels: {
      basico: "Un impuesto a los productos importados. Encarece lo de fuera para proteger lo de dentro — y lo suele pagar el consumidor.",
      medio: "Herramienta comercial y de negociación. El efecto de primer orden es inflacionario y contractivo; el de segundo, redistribución de cadenas de suministro. Los deadlines crean eventos binarios de mercado.",
      pro: "Incidencia fiscal repartida entre márgenes del exportador, importador y precios finales según elasticidades. El canal financiero (incertidumbre → capex diferido) suele pesar más que el arancel mismo; vigilar exenciones sectoriales (semis).",
    },
    example: "El deadline del 9 de julio afecta a IWDA y VUAA por exposición global — y a SEMI si el sector no queda exento.",
  },
  "yield": {
    term: "yield",
    category: "renta fija",
    levels: {
      basico: "El rendimiento anual que te da una inversión: los intereses de un bono o los dividendos de una acción, en porcentaje.",
      medio: "En bonos, la TIR: el retorno anualizado si lo mantienes a vencimiento. Sube cuando el precio baja. El yield del 10Y americano es el precio del dinero global.",
      pro: "Yield-to-maturity asume reinversión de cupones a la propia TIR (sesgo). Comparar yields entre divisas exige el coste de cobertura FX (que puede comerse todo el diferencial). El earnings yield bursátil (1/PER) compite con el yield real del bono.",
    },
  },
  "posicion-corta": {
    term: "posición corta",
    category: "renta variable",
    levels: {
      basico: "Apostar a que algo va a bajar: vendes hoy lo que no tienes para recomprarlo más barato mañana.",
      medio: "Short: beneficio si el activo cae. Riesgo asimétrico (la pérdida potencial es ilimitada) y coste de mantenimiento (préstamo del título, dividendos).",
      pro: "El borrow cost y el riesgo de squeeze (recall del préstamo, gamma de opciones) dominan la ecuación en nombres concurridos. El short interest y days-to-cover miden el combustible del squeeze.",
    },
    example: "En 'El camino no tomado', ignorar un Vender se evalúa como si hubieras abierto el corto: qué habría dado.",
  },
  breakeven: {
    term: "breakeven de inflación",
    category: "macro",
    levels: {
      basico: "La inflación media que el mercado espera para los próximos años, deducida de los precios de los bonos.",
      medio: "Diferencia entre el yield del bono nominal y el indexado a inflación al mismo plazo. Breakeven 10Y en 2,3% = el mercado espera esa inflación media a diez años.",
      pro: "Incluye prima de riesgo de inflación y de liquidez del TIPS — no es expectativa pura. Los breakevens cortos (2Y) reaccionan a energía; el 5Y5Y forward es la vara de credibilidad del banco central.",
    },
  },
  "vol-implicita": {
    term: "volatilidad implícita",
    category: "volatilidad",
    levels: {
      basico: "El movimiento que el mercado espera de un activo, deducido de lo que cuestan sus opciones. Cara = se espera movimiento.",
      medio: "La volatilidad que iguala el precio de mercado de una opción en el modelo. Comprar opciones es comprar vol implícita: rentable solo si el movimiento real la supera.",
      pro: "Superficie de vol: skew (puts caras = miedo a caídas) y estructura temporal. El spread implícita-realizada es la prima de riesgo de varianza — sistemáticamente positiva, salvo cuando más importa.",
    },
  },
};

/** Nº de términos — útil para tests y para la nota del glosario. */
export const GLOSSARY_SIZE = Object.keys(GLOSSARY).length;
