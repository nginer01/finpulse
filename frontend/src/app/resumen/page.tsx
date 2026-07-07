import Link from "next/link";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import LineChart from "@/components/charts/LineChart";
import BarsChart from "@/components/charts/BarsChart";
import Sparkline from "@/components/charts/Sparkline";
import {
  Kicker,
  PullQuote,
  InlineImage,
  VideoCard,
  DataTip,
  ShareBar,
  Breadcrumb,
  SectionDivider,
  Icon,
} from "@/components/article/ArticleBits";
import { P, H2, Strong } from "@/components/article/Typography";
import SourceLink from "@/components/article/SourceLink";
import DocumentsPanel from "@/components/documents/DocumentsPanel";
import ReadingTime from "@/components/article/ReadingTime";
import { DwellTracker, SundayCheckin, TopicPulse } from "@/components/tracking/Trackers";
import QuizSection from "@/components/quiz/QuizSection";
import Term from "@/components/article/Term";
import AudioBriefing from "@/components/audio/AudioBriefing";
import ThreadsSection from "@/components/threads/ThreadsSection";

/* ------------------------------------------------------------------ */
/*  Mock data — Lunes, 6 de julio de 2026                              */
/* ------------------------------------------------------------------ */

const spWeek = [
  { label: "Lun 29", value: 6205 },
  { label: "Mar 30", value: 6228 },
  { label: "Mié 1", value: 6212 },
  { label: "Jue 2", value: 6241 },
  { label: "Vie 3", value: 6284 },
];

const sectores = [
  { label: "Semiconductores", value: 2.8, note: "Nvidia roza los 4 billones de capitalización" },
  { label: "Tecnología", value: 1.9, note: "Mega-caps lideran el rally de la semana" },
  { label: "Financieras", value: 1.1, note: "Curva de tipos más pendiente favorece márgenes" },
  { label: "Industriales", value: 0.8, note: "Expectativa de acuerdos comerciales" },
  { label: "Salud", value: 0.3, note: "Sin catalizadores, sesión de transición" },
  { label: "Consumo", value: 0.2, note: "A la espera de resultados del Q2" },
  { label: "Utilities", value: -0.6, note: "Rotación hacia riesgo penaliza defensivos" },
  { label: "Energía", value: -2.1, note: "La OPEC+ acelera la devolución de producción" },
];

const indices = [
  { name: "S&P 500", value: "6.284,65", change: "+0,83%", dir: "up" as const, spark: [6205, 6228, 6212, 6241, 6284] },
  { name: "Nasdaq", value: "20.601,10", change: "+1,02%", dir: "up" as const, spark: [20280, 20390, 20305, 20445, 20601] },
  { name: "Stoxx 600", value: "543,20", change: "+0,48%", dir: "up" as const, spark: [538.9, 540.1, 539.2, 541.4, 543.2] },
  { name: "IBEX 35", value: "14.120,00", change: "+0,71%", dir: "up" as const, spark: [13950, 14010, 13980, 14060, 14120] },
  { name: "Brent", value: "$68,30", change: "-0,75%", dir: "down" as const, spark: [69.8, 69.2, 69.5, 68.8, 68.3] },
  { name: "VIX", value: "16,38", change: "-4,9%", dir: "down" as const, spark: [17.9, 17.4, 17.6, 16.9, 16.38] },
];

const movers = [
  { ticker: "NVDA", name: "Nvidia", change: "+2,4%", dir: "up" as const, tip: "Roza los 4 billones de capitalización. Pedidos de Blackwell Ultra desbordados hasta 2027." },
  { ticker: "TSM", name: "TSMC", change: "+3,1%", dir: "up" as const, tip: "Ventas de junio +26% interanual. Publica ingresos del Q2 el 10 de julio." },
  { ticker: "ASML", name: "ASML", change: "+2,2%", dir: "up" as const, tip: "Arrastrada por el ciclo de capex de las foundries. Resultados el 15 de julio." },
  { ticker: "XOM", name: "Exxon Mobil", change: "-2,6%", dir: "down" as const, tip: "El aumento de producción de la OPEC+ presiona a todo el sector." },
  { ticker: "TSLA", name: "Tesla", change: "-1,8%", dir: "down" as const, tip: "Ruido político en torno a Musk y entregas del Q2 por debajo de lo esperado." },
];

const polymarket = [
  { q: "Recorte Fed en septiembre", p: 68, delta: "+9", tone: "green" },
  { q: "Recorte Fed en julio", p: 5, delta: "-16", tone: "muted" },
  { q: "Acuerdo UE-EEUU antes del 9 jul", p: 42, delta: "+11", tone: "amber" },
  { q: "Recesión EEUU en 2026", p: 18, delta: "-2", tone: "green" },
];

const eventos = [
  { date: "Hoy", event: "Vence la pausa arancelaria: primeras cartas a socios comerciales", impact: "alta" },
  { date: "Mié 8", event: "Actas de la Fed — sesgo del comité tras el dato de empleo", impact: "alta" },
  { date: "Jue 9", event: "Deadline oficial de aranceles recíprocos", impact: "alta" },
  { date: "Vie 10", event: "Ingresos Q2 de TSMC — primer test del ciclo semi", impact: "media" },
  { date: "Mar 14", event: "Arranca la temporada de resultados: JPMorgan y Citi", impact: "media" },
  { date: "Mié 15", event: "IPC de junio en EEUU — clave para el recorte de septiembre", impact: "alta" },
];

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function ResumenDiario() {
  return (
    <main className="min-h-screen">
      <ScrollProgress />

      {/* ============ HERO — portada de periódico ============ */}
      <section className="relative h-[68vh] min-h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&h=1080&fit=crop&q=90"
          alt="Wall Street en máximos históricos"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-[1360px] mx-auto px-6 pb-14 sm:pb-20">
            <div className="animate-fade-in-up">
              <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.5em] text-white/60 font-semibold mb-6">
                Briefing diario — Lunes, 6 de julio de 2026
              </p>
              <h1 className="max-w-[1000px] text-[2.6rem] sm:text-[3.4rem] md:text-[3.8rem] font-extralight text-white tracking-tight leading-[1.08]">
                Wall Street toca máximos con el empleo de junio; el crudo cede ante la OPEC+
              </h1>
              <p className="max-w-[720px] mt-6 text-[15px] sm:text-[16px] text-white/65 leading-[1.7] tracking-wide font-light">
                El S&P 500 cierra la semana en 6.284 puntos tras unas nóminas más fuertes de lo previsto. La Fed gana margen,
                el petróleo pierde soporte y los aranceles del 9 de julio marcan la agenda.
              </p>
              <p className="mt-6 text-[12px] text-white/45 tracking-wide">
                14 fuentes procesadas · 231 noticias analizadas · <ReadingTime />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CUERPO — artículo + sidebar ============ */}
      <div className="max-w-[1360px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="py-8 border-b border-white/[0.06]">
          <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Resumen", href: "/resumen" }, { label: "6 julio 2026" }]} />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-14 xl:gap-20 pt-14 pb-10">

          {/* ==================== COLUMNA ARTÍCULO ==================== */}
          <article className="max-w-[760px] min-w-0">
            <DwellTracker />
            <SundayCheckin />

            {/* ---------- 1. TOP STORY ---------- */}
            <Reveal>
              <section data-track-topic="macro EEUU">
                <Kicker icon="newspaper">Top Story</Kicker>
                <H2>El mercado laboral entierra el recorte de julio — y a nadie le importa</H2>
                <P className="first-letter:text-[64px] first-letter:font-extralight first-letter:float-left first-letter:leading-[0.8] first-letter:mr-3 first-letter:mt-1 first-letter:text-foreground">
                  La economía estadounidense creó <SourceLink sourceId="ft-empleo">147.000 empleos</SourceLink> en
                  junio, muy por encima de las 110.000 que esperaba el consenso, y la tasa de paro bajó al 4,1%. En cualquier otro
                  contexto, un dato así habría enfriado a la renta variable — empleo fuerte significa Fed paciente, y Fed paciente
                  significa tipos altos durante más tiempo. El viernes ocurrió exactamente lo contrario: el S&P 500 cerró
                  en <DataTip value="6.284,65" tip="Nuevo máximo histórico de cierre. Cuarto récord en las últimas seis sesiones." direction="up" /> puntos,
                  nuevo máximo histórico, con el Nasdaq también en territorio inexplorado.
                </P>
                <P className="mt-5">
                  La lectura del mercado es de manual goldilocks: la economía no se enfría lo suficiente como para temer una recesión,
                  pero la inflación tampoco da señales de reacelerarse. <SourceLink sourceId="polymarket-fed">Polymarket liquidó en horas la apuesta por un
                  recorte en julio</SourceLink> — del 21% al <Strong>5%</Strong> — y a la vez subió la de septiembre hasta el <Strong>68%</Strong>. Es decir:
                  el mercado no ha renunciado a los recortes, solo los ha movido seis semanas. Y con la temporada de resultados del
                  segundo trimestre arrancando el día 14, la atención rota de la macro a los beneficios.
                </P>
                <P className="mt-5">
                  El asterisco de la semana es doble. Primero, los aranceles: la pausa de 90 días expira el <Strong>9 de julio</Strong> y
                  la Casa Blanca empieza hoy a enviar cartas con los nuevos tipos arancelarios a los socios sin acuerdo. Europa negocia
                  contrarreloj — <SourceLink sourceId="polymarket-aranceles">Polymarket da un 42% a un acuerdo marco antes del jueves</SourceLink>. Segundo, el crudo: la OPEC+ confirmó este fin
                  de semana un aumento de producción de <SourceLink sourceId="reuters-opec">548.000 barriles diarios</SourceLink> para
                  agosto, acelerando la devolución de los recortes voluntarios. El Brent abre la semana débil en $68,30.
                </P>
                <P className="mt-5">
                  Para tu cartera, la foto es favorable con una excepción conocida: <Strong>IWDA y VUAA</Strong> navegan en máximos,
                  <Strong> SEMI</Strong> vuelve a ser la mejor posición de la semana (+3,4%) empujada por Nvidia y TSMC, y el lastre
                  sigue siendo <Strong>BRT</Strong>, que acumula un -2,8% semanal y afronta un agosto con más oferta en el mercado.
                </P>

                <PullQuote
                  quote="El dato de empleo no cambia el destino, cambia el calendario. La Fed recortará cuando los aranceles dejen de ensuciar la foto de inflación — septiembre sigue vivo."
                  source="Paul Donovan"
                  meta="UBS On-Air, esta mañana"
                  sourceId="ubs-donovan"
                />

                <InlineImage
                  src="https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1600&h=800&fit=crop&q=90"
                  alt="Pantallas de cotización en verde"
                  caption="Cuarto cierre récord del S&P 500 en seis sesiones. El breadth mejora: el 62% de los componentes cotiza sobre su media de 50 sesiones. Foto: Bloomberg"
                />
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 2. MERCADOS ---------- */}
            <Reveal>
              <section data-track-topic="renta variable EEUU" data-track-tickers="VUAA,IWDA">
                <Kicker icon="trend">Mercados</Kicker>
                <H2>Récords en Nueva York, calma tensa en Europa</H2>
                <P>
                  La semana corta por el 4 de julio dejó al <Strong>S&P 500 con un +1,7% semanal</Strong> y al Nasdaq con un +1,6%.
                  El rally es estrecho pero se está ensanchando: las financieras acompañaron por primera vez en un mes (+1,1%) ante
                  una curva de tipos algo más pendiente, y el Russell 2000 de pequeñas compañías sumó un +1,0%. El Treasury a 10 años
                  repuntó hasta el <DataTip value="4,34%" tip="El dato de empleo elevó la rentabilidad 5 pb el viernes: menos recortes descontados a corto plazo." direction="flat" /> tras
                  el dato de empleo — el bono, a diferencia de la bolsa, sí se tomó en serio el aplazamiento de los recortes.
                </P>
                <P className="mt-5">
                  Europa cerró la semana con avances más tímidos (Stoxx 600 +0,5%) y toda la atención puesta en Washington. El euro,
                  en <DataTip value="1,178" tip="EUR/USD en máximos de cuatro años. Un euro fuerte abarata importaciones pero penaliza a las exportadoras europeas." direction="up" /> dólares,
                  cotiza en máximos de cuatro años — un problema creciente para las exportadoras del DAX y un tema que el BCE ya
                  discute abiertamente desde el foro de Sintra. En Asia, el Nikkei retrocedió un 0,6% el lunes: Japón figura entre los
                  países que recibirán carta arancelaria esta semana.
                </P>

                <div className="my-10 rounded-2xl border border-card-border bg-card/40 p-6 sm:p-8">
                  <div className="flex items-baseline justify-between mb-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-1.5">S&P 500 — última semana</p>
                      <p className="text-[13px] text-muted">Cierre diario, puntos</p>
                    </div>
                    <p className="text-[22px] font-extralight text-[#30d158] tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>+1,7%</p>
                  </div>
                  <LineChart data={spWeek} height={240} decimals={0} ariaLabel="Evolución del S&P 500 en la última semana" />
                </div>

                <P>
                  La volatilidad sigue comprimida: el <Term k="vix">VIX</Term> cerró en <DataTip value="16,38" tip="Mínimo de cinco meses. Por debajo de 17 el mercado descuenta un verano tranquilo — históricamente un aviso." direction="down" />,
                  mínimos de febrero. Con el deadline arancelario a tres días vista, <SourceLink sourceId="zerohedge-vix">ese nivel de complacencia es la lectura más
                  incómoda del tablero</SourceLink>: o el mercado sabe algo (que habrá prórrogas y acuerdos), o está infravalorando el único{" "}
                  <Term k="evento-binario">evento binario</Term> de la semana.
                </P>

                <VideoCard
                  poster="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1600&h=800&fit=crop&q=90"
                  title="Market open — la semana de los aranceles en 60 segundos"
                  duration="0:58"
                />
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 3. SECTORES ---------- */}
            <Reveal>
              <section data-track-topic="semiconductores" data-track-tickers="SEMI">
                <Kicker icon="sectors">Sectores en movimiento</Kicker>
                <H2>Los chips tiran del carro, la energía se queda sola</H2>
                <P>
                  La dispersión sectorial de la semana cuenta la historia completa del mercado en una sola imagen. En un extremo,
                  los <Strong>semiconductores (+2,8%)</Strong>: <SourceLink sourceId="bloomberg-nvda">Nvidia rozó los 4 billones de dólares de capitalización</SourceLink> — sería la
                  primera empresa de la historia en alcanzarlos — y <SourceLink sourceId="tsmc-ventas">TSMC publicó unas ventas de junio un 26% superiores</SourceLink> al año
                  pasado. El <Term k="capex">ciclo de inversión</Term> en infraestructura de IA no da señales de fatiga, y la cadena entera (ASML, SK Hynix,
                  Micron) subió en bloque.
                </P>
                <P className="mt-5">
                  En el otro extremo, la <Strong>energía (-2,1%)</Strong> fue el único sector en rojo claro. La decisión de la <Term k="opec">OPEC+</Term>
                  de devolver 548.000 barriles diarios en agosto — más rápido de lo que descontaba el mercado — confirma que Arabia
                  Saudí prioriza cuota de mercado sobre precio. Exxon y Chevron cayeron más de un 2% y el sector acumula ya un -8%
                  en el año, el peor del S&P 500.
                </P>

                <div className="my-10 rounded-2xl border border-card-border bg-card/40 p-6 sm:p-8">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-1.5">Performance sectorial — semana</p>
                      <p className="text-[13px] text-muted">S&P 500, variación semanal por sector</p>
                    </div>
                  </div>
                  <BarsChart data={sectores} ariaLabel="Performance semanal por sector del S&P 500" />
                </div>

                <P>
                  Entre ambos polos, los defensivos (utilities -0,6%, salud +0,3%) confirman la rotación hacia el riesgo. Es el patrón
                  clásico de un mercado en máximos con volatilidad baja: el dinero sale de lo aburrido y persigue lo que ya sube.
                  Funciona — hasta que deja de hacerlo.
                </P>
                <div className="mt-8">
                  <TopicPulse topic="semiconductores" />
                </div>
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 4. ACTIVOS DESTACADOS ---------- */}
            <Reveal>
              <section>
                <Kicker icon="star">Activos destacados</Kicker>
                <H2>Cinco valores que movieron la sesión</H2>
                <div className="mt-8 rounded-2xl border border-card-border overflow-hidden">
                  {movers.map((m, i) => (
                    <div
                      key={m.ticker}
                      className={`flex items-center gap-4 sm:gap-6 px-5 sm:px-7 py-5 hover:bg-white/[0.03] transition-colors duration-300 ${
                        i > 0 ? "border-t border-white/[0.06]" : ""
                      }`}
                    >
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-[12px] font-semibold tracking-wide ${
                          m.dir === "up" ? "bg-[#30d158]/10 text-[#30d158]" : "bg-[#ff453a]/10 text-[#ff453a]"
                        }`}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {m.ticker.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-medium text-foreground tracking-wide">
                          {m.name} <span className="text-muted text-[12px] ml-1">{m.ticker}</span>
                        </p>
                        <p className="text-[13px] text-muted leading-relaxed mt-0.5 line-clamp-2">{m.tip}</p>
                      </div>
                      <DataTip value={m.change} tip={m.tip} direction={m.dir} />
                    </div>
                  ))}
                </div>
                <InlineImage
                  src="https://images.unsplash.com/photo-1640955014216-75201056c829?w=1600&h=800&fit=crop&q=90"
                  alt="Oblea de semiconductores"
                  caption="Nvidia se acerca a los 4 billones de capitalización; TSMC publica el Q2 el 10 de julio. Tu posición en SEMI captura toda la cadena. Foto: Reuters"
                />
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 5. ANÁLISIS ---------- */}
            <Reveal>
              <section data-track-topic="política monetaria">
                <Kicker icon="lens">Análisis</Kicker>
                <H2>Por qué el mercado celebra malas noticias para los recortes</H2>
                <P>
                  Hay una aparente contradicción en la reacción del viernes: el dato de empleo retrasa los recortes de la Fed y aun
                  así la bolsa marca máximos. La explicación está en qué tipo de recortes descontaba el mercado. Un recorte en julio
                  habría sido un <Strong>recorte por debilidad</Strong> — la Fed acudiendo al rescate de una economía que se enfría.
                  El recorte de septiembre que ahora cotiza al 68% es un <Strong>recorte por normalización</Strong> — la inflación
                  convergiendo al objetivo con pleno empleo. El segundo escenario es históricamente mucho mejor para la renta
                  variable, y el mercado votó el viernes con claridad.
                </P>
                <P className="mt-5">
                  Matt Levine lo resumía el viernes con su sorna habitual: el mercado ya no negocia tipos, negocia la credibilidad
                  del calendario. Mientras el dato de inflación del día 15 no se contamine visiblemente por los aranceles, la tesis
                  goldilocks se mantiene. El riesgo real no está en la Fed — está en que el 9 de julio termine sin acuerdos y con
                  tipos arancelarios más altos de lo que el VIX en 16 sugiere que nadie espera.
                </P>
                <P className="mt-5">
                  La lección aplicable a tu cartera es de disciplina, no de acción: con IWDA y VUAA en máximos y la volatilidad en
                  mínimos, añadir riesgo ahora es comprar caro el escenario bueno. La asimetría favorece esperar al IPC del 15 de
                  julio y al desenlace arancelario antes de mover ficha.
                </P>

                <PullQuote
                  quote="Nadie compra el S&P a 22 veces beneficios porque espere un recorte en julio. Lo compra porque cree que los beneficios del Q2 van a justificar el múltiplo. La semana que viene empezamos a saberlo."
                  source="Matt Levine"
                  meta="Money Stuff, viernes"
                  sourceId="matt-levine"
                />
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 6. POLÍTICA & ECONOMÍA GLOBAL ---------- */}
            <Reveal>
              <section data-track-topic="aranceles" data-track-tickers="IWDA,VUAA">
                <Kicker icon="compass">Política &amp; economía global</Kicker>
                <H2>Washington marca el paso, Fráncfort respira</H2>
                <P>
                  La semana geopolítica tiene un solo epicentro: las <SourceLink sourceId="polymarket-aranceles">cartas arancelarias que empiezan a salir hoy</SourceLink> de
                  la Casa Blanca. El guion previsto es de escalada controlada — tipos del 25-40% para los socios sin acuerdo, con
                  entrada en vigor el 1 de agosto, lo que en la práctica añade tres semanas más de negociación tras el deadline
                  formal del jueves. Bruselas negocia una exención parcial para automoción a cambio de compromisos de compra de
                  gas natural licuado; Japón e India están sensiblemente más lejos de lo que el mercado descuenta.
                </P>
                <P className="mt-5">
                  En el plano monetario, el dato de empleo redefine el mapa: la Fed no tiene ninguna urgencia y las actas del
                  miércoles deberían confirmar un comité cómodo esperando al IPC del día 15. El BCE, por su parte, tiene un
                  problema nuevo que no es de tipos sino de divisa: <SourceLink sourceId="ubs-bce">un euro en máximos de cuatro años</SourceLink> que
                  ya resta competitividad a las exportadoras y que, según <SourceLink sourceId="bbva-research">BBVA Research</SourceLink>, quita
                  unas dos décimas de PIB al sector exterior de la eurozona. Un BCE quieto con una Fed a punto de recortar es la
                  receta para que el euro siga fuerte — vigílalo si el tramo europeo de tu IWDA empieza a rezagarse.
                </P>
                <P className="mt-5">
                  El tercer frente es fiscal: el paquete presupuestario aprobado la semana pasada en EEUU añade estímulo a una
                  economía que no lo pide, y el Tesoro anunciará el miércoles el calendario de emisiones del trimestre. Más papel
                  con la Fed en pausa es presión estructural al alza para el tramo largo de la <Term k="curva-de-tipos">curva</Term> — el 10 años en 4,34% puede
                  parecer alto, pero el suelo de esa cifra lo pone la oferta, no solo la inflación.
                </P>
                <div className="mt-8">
                  <TopicPulse topic="aranceles" />
                </div>
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 7. PORTFOLIO IMPACT ---------- */}
            <Reveal>
              <section>
                <Kicker icon="check">Portfolio impact</Kicker>
                <H2>Qué significa hoy para cada posición</H2>
                <div className="mt-8 space-y-6">
                  {[
                    {
                      t: "IWDA — iShares MSCI World (33%)",
                      c: "up" as const,
                      txt: "Máximos históricos arrastrada por EEUU. El riesgo específico de hoy es el arancelario: dos tercios del índice es EEUU, pero el tramo europeo sufre si el jueves acaba mal. Sin acción — es el núcleo y se comporta como tal.",
                    },
                    {
                      t: "VUAA — Vanguard S&P 500 (25%)",
                      c: "up" as const,
                      txt: "Cuarto récord en seis sesiones y a 22x beneficios. La validación llega el 14 con la banca. No añadir en máximos con VIX en 16: si el múltiplo se justifica, será con earnings, no con momentum.",
                    },
                    {
                      t: "SEMI — VanEck Semiconductor (15%)",
                      c: "up" as const,
                      txt: "Mejor posición de la semana (+3,4%). El dato clave llega el viernes con los ingresos Q2 de TSMC. El retroceso del 2-3% que esperas para ampliar quizá no llegue — no perseguir sigue siendo la decisión.",
                    },
                    {
                      t: "EUNA — iShares Euro Gov Bond (19%)",
                      c: "flat" as const,
                      txt: "BCE quieto y curva europea estable: hace exactamente su trabajo de lastre defensivo. Si el jueves arancelario sale mal, es la posición que amortigua. Mantener sin más.",
                    },
                    {
                      t: "BRT — Brent Crude Oil (9%)",
                      c: "down" as const,
                      txt: "El único frente abierto. La OPEC+ devuelve 548k b/d en agosto y los inventarios del miércoles dirán si el mercado los absorbe. Tu nivel de invalidación sigue en $66 — hoy cotiza a $68,30, sin margen para la complacencia.",
                    },
                  ].map((p) => (
                    <div key={p.t} className="flex gap-4">
                      <span
                        className={`mt-2 w-2 h-2 shrink-0 rounded-full ${
                          p.c === "up" ? "bg-[#30d158]" : p.c === "down" ? "bg-[#ff453a]" : "bg-[#ffd60a]"
                        }`}
                      />
                      <div>
                        <p className="text-[15px] font-medium text-foreground tracking-wide mb-1.5">{p.t}</p>
                        <p className="text-[15px] leading-[1.8] text-[#b8b8bd] tracking-wide">{p.txt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 8. LO QUE VIENE ---------- */}
            <Reveal>
              <section>
                <Kicker icon="calendar">Lo que viene</Kicker>
                <H2>Tres días para el deadline arancelario</H2>
                <P>
                  La semana se decide entre el miércoles y el jueves: actas de la Fed el día 8 y vencimiento de la pausa arancelaria
                  el día 9. El escenario base del mercado — prórrogas selectivas y un acuerdo marco con la UE — dejaría vía libre
                  hasta el IPC del 15. El escenario alternativo, cartas con <Term k="arancel">aranceles</Term> del 25-40% y sin prórroga, encontraría a un
                  mercado en máximos, con volatilidad en mínimos y posicionamiento largo. No hace falta explicar cómo termina esa
                  combinación si sale mal.
                </P>
                <div className="mt-9 space-y-0 rounded-2xl border border-card-border overflow-hidden">
                  {eventos.map((e, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-5 px-5 sm:px-7 py-4 hover:bg-white/[0.03] transition-colors duration-300 ${
                        i > 0 ? "border-t border-white/[0.06]" : ""
                      }`}
                    >
                      <span className="w-16 shrink-0 text-[12px] font-semibold text-foreground uppercase tracking-wider" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {e.date}
                      </span>
                      <span className="flex-1 text-[14px] text-[#c8c8cd] leading-relaxed">{e.event}</span>
                      <span
                        className={`shrink-0 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-1 rounded-full border ${
                          e.impact === "alta" ? "border-[#ff453a]/30 text-[#ff453a]" : "border-[#ffd60a]/30 text-[#ffd60a]"
                        }`}
                      >
                        {e.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- HILOS TEMPORALES — memoria acumulativa ---------- */}
            <Reveal>
              <ThreadsSection />
            </Reveal>

            <SectionDivider />

            {/* ---------- 9. PERSPECTIVAS ALTERNATIVAS ---------- */}
            <Reveal>
              <section data-track-topic="volatilidad" data-track-tickers="VUAA" data-track-negative="1">
                <Kicker icon="alert">Perspectivas alternativas</Kicker>
                <H2>El caso contrarian: qué tendría que pasar para que esto salga mal</H2>
                <P>
                  Todo lo anterior es el consenso, y el consenso está muy cómodo. El caso bajista honesto tiene tres patas. La
                  primera es mecánica: <SourceLink sourceId="daily-shot">el posicionamiento especulativo largo en S&P está en máximos del año</SourceLink> con
                  la <Term k="vol-implicita">volatilidad</Term> en mínimos — cuando todo el mundo está del mismo lado, el movimiento contrario no necesita una
                  gran excusa, solo un empujón. Un jueves arancelario sin prórrogas sería ese empujón.
                </P>
                <P className="mt-5">
                  La segunda es de fondo: el mercado laboral es menos sólido de lo que dice el titular. El ADP privado fue
                  negativo por primera vez en dos años y la mitad de las <Term k="nominas">nóminas</Term> de junio las puso el empleo público estatal.
                  Si esa divergencia se confirma en julio, el recorte de septiembre dejará de ser "por normalización" y empezará
                  a oler a "por debilidad" — y ese matiz, como vimos en 2024, vale un 5% de índice.
                </P>
                <P className="mt-5">
                  La tercera es la concentración: dos tercios de la subida del semestre la explican los mismos diez valores, y
                  <SourceLink sourceId="zerohedge-vix"> la historia de los últimos veranos</SourceLink> dice que agosto no perdona
                  a los mercados estrechos. Nada de esto es una predicción — es el precio de lista del escenario en el que la
                  semana que viene alguien no renueva la música. Tu cartera lo tiene parcialmente cubierto con EUNA; la mitad
                  restante de BRT, en cambio, no es <Term k="cobertura">cobertura</Term> para este riesgo: es riesgo adicional.
                </P>
              </section>
            </Reveal>

            <SectionDivider />

            {/* ---------- 10. MIS DOCUMENTOS ---------- */}
            <Reveal>
              <section>
                <Kicker icon="folder">Mis documentos</Kicker>
                <H2>Lo que ha llegado a tu bandeja</H2>
                <P className="mb-9">
                  Newsletters, informes subidos, artículos y notas de tu carpeta Synpulse — procesados por la IA y ordenados por
                  relevancia para tu portfolio. Haz clic en cualquiera para leer el resumen completo.
                </P>
                <DocumentsPanel limit={6} />
              </section>
            </Reveal>

            {/* ---------- CIERRE + ACCIONES ---------- */}
            <div className="mt-20 pt-10 border-t border-white/[0.06]">
              <p className="text-[12px] text-muted leading-relaxed mb-8">
                Resumen generado a las 9:00 AM del 6 de julio de 2026 · 14 fuentes procesadas · 231 noticias analizadas · 11 vinculadas a tu portfolio
              </p>
              <ShareBar title="FinPulse — Briefing del 6 de julio de 2026" storageKey="resumen-2026-07-06" />
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-12">
                <Link href="/semanal" className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground transition-all duration-500">
                  Ver resumen semanal
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <Icon name="arrow-right" className="w-3.5 h-3.5" />
                  </span>
                </Link>
                <Link href="/noticia" className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground transition-all duration-500">
                  Análisis completo del sector semis
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <Icon name="arrow-right" className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          </article>

          {/* ==================== SIDEBAR ==================== */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-10 min-w-0">

            {/* Índices */}
            <Reveal delay={100}>
              <div className="rounded-2xl border border-card-border bg-card/40 p-6">
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-5">Índices — cierre viernes</p>
                <div className="space-y-4">
                  {indices.map((idx) => (
                    <div key={idx.name} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground tracking-wide">{idx.name}</p>
                        <p className="text-[15px] font-extralight text-[#e8e8ed] tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {idx.value}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Sparkline data={idx.spark} width={72} height={24} color={idx.dir === "up" ? "#30d158" : "#ff453a"} />
                        <span
                          className={`text-[12px] font-semibold w-14 text-right ${idx.dir === "up" ? "text-[#30d158]" : "text-[#ff453a]"}`}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {idx.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Tu portfolio */}
            <Reveal delay={200}>
              <div className="rounded-2xl border border-card-border bg-card/40 p-6">
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-4">Tu portfolio</p>
                <p className="text-[34px] font-extralight tracking-tight text-foreground leading-none">
                  13.091<span className="text-[20px] text-muted">,47 €</span>
                </p>
                <p className="text-[13px] font-semibold text-[#30d158] mt-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                  +1,9% esta semana · +244,15 €
                </p>
                <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-2.5">
                  {[
                    { t: "SEMI", c: "+3,4%", up: true },
                    { t: "VUAA", c: "+2,0%", up: true },
                    { t: "IWDA", c: "+1,6%", up: true },
                    { t: "EUNA", c: "+0,2%", up: true },
                    { t: "BRT", c: "-2,8%", up: false },
                  ].map((p) => (
                    <div key={p.t} className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold tracking-[0.1em] text-[#c8c8cd]">{p.t}</span>
                      <span className={`text-[12px] font-semibold ${p.up ? "text-[#30d158]" : "text-[#ff453a]"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.c}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/portfolio"
                  className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground transition-colors duration-300"
                >
                  Ver portfolio
                  <Icon name="arrow-right" className="w-3 h-3" />
                </Link>
              </div>
            </Reveal>

            {/* Polymarket */}
            <Reveal delay={300}>
              <div className="rounded-2xl border border-card-border bg-card/40 p-6">
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-5">Polymarket — probabilidades</p>
                <div className="space-y-5">
                  {polymarket.map((pm) => (
                    <div key={pm.q}>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <p className="text-[12px] text-[#c8c8cd] leading-snug">{pm.q}</p>
                        <p className="text-[15px] font-semibold text-foreground shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {pm.p}%<span className="text-[10px] text-muted font-medium ml-1">({pm.delta})</span>
                        </p>
                      </div>
                      <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
                        <div className="h-full rounded-full bg-white/60" style={{ width: `${pm.p}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Alerta */}
            <Reveal delay={400}>
              <div className="rounded-2xl border border-[#ffd60a]/25 bg-card/40 p-6">
                <div className="flex items-center gap-3 mb-3 text-[#ffd60a]">
                  <Icon name="alert" className="w-4 h-4" />
                  <p className="text-[11px] uppercase tracking-[0.25em] font-semibold">Alerta activa</p>
                </div>
                <p className="text-[14px] text-foreground font-medium leading-snug mb-2">VIX en 16,4 con deadline arancelario a 3 días</p>
                <p className="text-[13px] text-muted leading-relaxed">
                  La combinación de máximos históricos, volatilidad en mínimos de 5 meses y un evento binario el jueves es el patrón
                  que históricamente precede picos de volatilidad. No añadir riesgo antes del día 9.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* Modo quiz opcional — 3 flashcards post-briefing con repetición espaciada */}
        <QuizSection />
      </div>

      {/* Audio briefing opcional — el briefing como podcast */}
      <AudioBriefing title="Briefing diario — FinPulse" />
    </main>
  );
}
