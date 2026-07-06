import Link from "next/link";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import LineChart from "@/components/charts/LineChart";
import BarsChart from "@/components/charts/BarsChart";
import CandleChart from "@/components/charts/CandleChart";
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
import { P, Lead, H2, Strong } from "@/components/article/Typography";
import SourceLink from "@/components/article/SourceLink";

/* ------------------------------------------------------------------ */
/*  Mock data — Semana del 29 de junio al 3 de julio de 2026           */
/* ------------------------------------------------------------------ */

const spSemana = [
  { label: "Vie 26", value: 6173 },
  { label: "Lun 29", value: 6205 },
  { label: "Mar 30", value: 6228 },
  { label: "Mié 1", value: 6212 },
  { label: "Jue 2", value: 6241 },
  { label: "Vie 3", value: 6284 },
];

const velas = [
  { label: "Lun 29", o: 6178, h: 6210, l: 6170, c: 6205 },
  { label: "Mar 30", o: 6205, h: 6235, l: 6198, c: 6228 },
  { label: "Mié 1", o: 6228, h: 6232, l: 6195, c: 6212 },
  { label: "Jue 2", o: 6212, h: 6248, l: 6208, c: 6241 },
  { label: "Vie 3", o: 6245, h: 6290, l: 6240, c: 6284 },
];

const sectoresSemana = [
  { label: "Semiconductores", value: 2.8, note: "Nvidia roza $4T; ventas de TSMC +26% interanual" },
  { label: "Tecnología", value: 1.9, note: "Mega-caps en máximos históricos" },
  { label: "Financieras", value: 1.1, note: "Curva más pendiente; resultados el día 14" },
  { label: "Industriales", value: 0.8, note: "Optimismo por acuerdos comerciales" },
  { label: "Salud", value: 0.3, note: "Semana de transición" },
  { label: "Consumo", value: 0.2, note: "A la espera del Q2" },
  { label: "Utilities", value: -0.6, note: "Rotación hacia riesgo" },
  { label: "Energía", value: -2.1, note: "OPEC+ devuelve producción más rápido de lo previsto" },
];

const dias = [
  {
    day: "Lunes 29",
    dato: "+0,52%",
    dir: "up" as const,
    titulo: "Cierre de semestre con viento de cola",
    texto:
      "Última semana del semestre y el clásico window dressing institucional: los gestores maquillan carteras comprando lo que ya sube. El S&P abrió al alza tras el optimismo comercial del fin de semana y no miró atrás. Tu IWDA capturó el movimiento desde la campana.",
  },
  {
    day: "Martes 30",
    dato: "+0,37%",
    dir: "up" as const,
    titulo: "El mejor semestre desde 2023 queda sellado",
    texto:
      "El S&P 500 cerró junio con un +10,6% en el primer semestre. En Sintra, Lagarde admitió que el euro fuerte 'ya es parte de la conversación' — primer aviso para las exportadoras europeas y un matiz para el tramo europeo de tu MSCI World.",
  },
  {
    day: "Miércoles 1",
    dato: "-0,26%",
    dir: "down" as const,
    titulo: "El ADP siembra la primera duda",
    texto:
      "El empleo privado ADP cayó en 33.000 puestos, primer dato negativo en más de dos años, y el ISM manufacturero siguió en contracción (49,0). Única sesión roja de la semana. El mercado la usó para recargar: los futuros ya apuntaban arriba esa misma noche.",
  },
  {
    day: "Jueves 2",
    dato: "+0,47%",
    dir: "up" as const,
    titulo: "Los semis toman el mando",
    texto:
      "Nvidia +2,6% intradía y toda la cadena detrás. Tu posición en SEMI firmó su mejor sesión del mes. En paralelo, Washington confirmó que las cartas arancelarias empezarían a salir el lunes 6 — el mercado lo ignoró olímpicamente.",
  },
  {
    day: "Viernes 3",
    dato: "+0,69%",
    dir: "up" as const,
    titulo: "Nóminas fuertes y récord en media sesión",
    texto:
      "147.000 empleos contra 110.000 esperados y paro en 4,1%. Adiós al recorte de julio, hola al de septiembre (68% en Polymarket). Wall Street cerró a las 13:00 por la víspera del 4 de julio — le bastó media sesión para marcar el cuarto récord de la semana.",
  },
];

const gainers = [
  { ticker: "NVDA", name: "Nvidia", change: "+4,6%", tip: "Roza los $4T de capitalización — sería la primera empresa de la historia" },
  { ticker: "TSM", name: "TSMC", change: "+3,8%", tip: "Ventas de junio +26% interanual; Q2 completo el 10 de julio" },
  { ticker: "MU", name: "Micron", change: "+3,2%", tip: "La demanda de memoria HBM sigue desbordada" },
  { ticker: "ASML", name: "ASML", change: "+2,9%", tip: "El capex de las foundries tira de los pedidos EUV" },
];

const losers = [
  { ticker: "OXY", name: "Occidental", change: "-4,1%", tip: "La más apalancada al precio del crudo entre las grandes" },
  { ticker: "COP", name: "ConocoPhillips", change: "-3,5%", tip: "Revisión a la baja de estimaciones tras la OPEC+" },
  { ticker: "XOM", name: "Exxon Mobil", change: "-3,1%", tip: "Peor semana desde abril" },
  { ticker: "TSLA", name: "Tesla", change: "-2,4%", tip: "Entregas Q2 -13% interanual y ruido político" },
];

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function ResumenSemanalCompleto() {
  return (
    <main className="min-h-screen">
      <ScrollProgress />

      {/* ============ HERO ============ */}
      <section className="relative h-[72vh] min-h-[520px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1920&h=1080&fit=crop&q=90"
          alt="Mercados globales al alza"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns-2"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-[1360px] mx-auto px-6 pb-14 sm:pb-20">
            <div className="animate-fade-in-up">
              <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.5em] text-white/60 font-semibold mb-6">
                Weekly Market Report — Semana del 29 de junio al 3 de julio de 2026
              </p>
              <h1 className="max-w-[1050px] text-[2.8rem] sm:text-[3.6rem] md:text-[4.2rem] font-extralight text-white tracking-tight leading-[1.06]">
                La semana en que el mercado eligió creer
              </h1>
              <p className="max-w-[760px] mt-6 text-[15px] sm:text-[17px] text-white/65 leading-[1.7] tracking-wide font-light">
                Cuatro récords en cinco sesiones, el mejor semestre desde 2023, la OPEC+ abriendo el grifo y unos aranceles
                que vencen en tres días. Todo, con la volatilidad en mínimos de cinco meses.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#30d158] border border-[#30d158]/30 rounded-full px-4 py-1.5">
                  <Icon name="trend" className="w-3 h-3" /> Bullish
                </span>
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#ffd60a] border border-[#ffd60a]/30 rounded-full px-4 py-1.5">
                  <Icon name="alert" className="w-3 h-3" /> Complacencia — VIX 16,4
                </span>
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/70 border border-white/20 rounded-full px-4 py-1.5">
                  87 noticias · 14 fuentes · ~14 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CUERPO ============ */}
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="py-8 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Semanal", href: "/semanal" }, { label: "Resumen" }]} />
          <Link
            href="/resumen"
            className="group inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300"
          >
            Briefing diario de hoy
            <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Stats strip */}
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 py-12 border-b border-white/[0.06]">
            {[
              { label: "Tu portfolio", value: "+1,9%", sub: "+244,15 € en la semana", color: "text-[#30d158]" },
              { label: "S&P 500", value: "6.284", sub: "4 récords en 5 sesiones", color: "text-foreground" },
              { label: "Brent", value: "$68,3", sub: "-2,3% — OPEC+ acelera", color: "text-[#ff453a]" },
              { label: "VIX", value: "16,4", sub: "Mínimo de 5 meses", color: "text-[#ffd60a]" },
            ].map((s) => (
              <div key={s.label} className="text-center px-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted/70 font-semibold mb-3">{s.label}</p>
                <p className={`text-[2.4rem] font-extralight tracking-tight leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[12px] text-muted mt-2.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="max-w-[780px] mx-auto pt-16 pb-10">

          {/* ---------- INTRO ---------- */}
          <Reveal>
            <section>
              <Lead>
                Hay semanas que se explican con un dato y semanas que se explican con una actitud. Esta fue de las segundas. El
                S&P 500 firmó <Strong>cuatro cierres récord en cinco sesiones</Strong> y selló el mejor primer semestre desde 2023
                (+10,6%), en una semana acortada por el 4 de julio en la que hubo de todo: un dato de empleo privado negativo, la
                OPEC+ devolviendo producción a un mercado ya bien abastecido, y un deadline arancelario a tres días vista. El
                mercado lo miró todo, lo sopesó — y decidió creer en el escenario bueno.
              </Lead>
              <P className="mt-5">
                Para tu cartera fue la tercera semana positiva consecutiva: <Strong>+1,9%, +244,15 €</Strong>, con los
                semiconductores tirando del carro y el Brent restando por segunda semana. Más abajo está el desglose día a día,
                el análisis por sectores, el técnico y lo que viene. Pero si solo te llevas una idea, que sea esta: la distancia
                entre lo bien que está el mercado y lo poco que cuesta asegurarse contra un accidente no había sido tan grande
                desde febrero. Cuando el seguro está regalado, suele ser porque nadie cree necesitarlo.
              </P>
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- DÍA A DÍA ---------- */}
          <Reveal>
            <section>
              <Kicker icon="calendar">Lo que pasó cada día</Kicker>
              <H2>Cinco sesiones, una sola dirección</H2>

              <div className="mt-10 space-y-0">
                {dias.map((d, i) => (
                  <div key={d.day} className={`relative pl-8 sm:pl-10 pb-10 ${i < dias.length - 1 ? "border-l border-white/[0.08] ml-[7px]" : "ml-[7px]"}`}>
                    <span
                      className={`absolute -left-[7px] top-1 w-[14px] h-[14px] rounded-full border-2 border-black ${
                        d.dir === "up" ? "bg-[#30d158]" : "bg-[#ff453a]"
                      }`}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2.5">
                      <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted">{d.day}</span>
                      <span
                        className={`text-[15px] font-semibold ${d.dir === "up" ? "text-[#30d158]" : "text-[#ff453a]"}`}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {d.dato}
                      </span>
                    </div>
                    <h3 className="text-[19px] sm:text-[21px] font-extralight tracking-wide text-foreground mb-3">{d.titulo}</h3>
                    <p className="text-[15px] leading-[1.8] text-[#b8b8bd] tracking-wide">{d.texto}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-card-border bg-card/40 p-6 sm:p-8">
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-1.5">S&P 500 — la semana en una línea</p>
                    <p className="text-[13px] text-muted">Cierres diarios, desde el viernes anterior</p>
                  </div>
                  <p className="text-[22px] font-extralight text-[#30d158] tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>+1,8%</p>
                </div>
                <LineChart data={spSemana} height={240} decimals={0} ariaLabel="S&P 500 durante la semana" />
              </div>
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- NOTICIAS MAYORES ---------- */}
          <Reveal>
            <section>
              <Kicker icon="newspaper">Las noticias de la semana</Kicker>
              <H2>Cuatro historias que movieron el tablero</H2>

              <h3 className="text-[22px] sm:text-[24px] font-extralight tracking-wide text-foreground mt-10 mb-4">
                1. El empleo americano no se rinde
              </h3>
              <P>
                Las <SourceLink sourceId="ft-empleo">147.000 nóminas</SourceLink> de
                junio pulverizaron el consenso y enterraron el recorte de julio en cuestión de minutos: <SourceLink sourceId="polymarket-fed">Polymarket lo hundió del 21%
                al 5%</SourceLink>, mientras septiembre subía al 68%. La paradoja — bolsa en máximos celebrando el retraso de los recortes — se
                explica porque el mercado prefiere mil veces un recorte por normalización que un recorte por rescate. El matiz
                incómodo lo puso el ADP del miércoles con su -33.000 en el sector privado: el empleo público estatal y local está
                sosteniendo la creación de puestos. Es un dato para archivar, no para operar. Todavía.
              </P>

              <h3 className="text-[22px] sm:text-[24px] font-extralight tracking-wide text-foreground mt-12 mb-4">
                2. La OPEC+ abre el grifo — y tu Brent lo nota
              </h3>
              <P>
                El cártel confirmó la devolución de <SourceLink sourceId="reuters-opec">548.000 barriles diarios en agosto</SourceLink>, acelerando el ritmo de los
                tres meses anteriores (411.000). Arabia Saudí ha dejado de defender el precio para defender la cuota — el mismo
                guion de 2015 que ya conoces de sobra. El Brent cerró la semana en $68,30 (-2,3%) y tu posición
                en <Strong>BRT acumula un -2,8% semanal</Strong>. La reducción del 50% que ejecutaste en mayo sigue pareciendo la
                decisión correcta: la mitad restante es exposición a un eventual shock geopolítico, no una apuesta a que la OPEC+
                cambie de idea.
              </P>

              <InlineImage
                src="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1600&h=800&fit=crop&q=90"
                alt="Refinería de petróleo al atardecer"
                caption="La OPEC+ devuelve producción a un mercado bien abastecido. El Brent acumula un -8% en el año. Foto: Reuters"
              />

              <h3 className="text-[22px] sm:text-[24px] font-extralight tracking-wide text-foreground mt-12 mb-4">
                3. Nvidia a las puertas de los 4 billones
              </h3>
              <P>
                La cifra es difícil de procesar: <SourceLink sourceId="bloomberg-nvda">Nvidia cerró el jueves a un 2% de convertirse en la primera empresa de la
                historia en valer 4 billones de dólares</SourceLink> — más que todo el mercado bursátil alemán. Detrás del hito hay
                sustancia: <SourceLink sourceId="tsmc-ventas">TSMC reportó ventas de junio un 26% superiores</SourceLink> al año anterior, y los pedidos de Blackwell Ultra tienen
                la capacidad de 2026 comprometida al completo. Tu SEMI (+3,4% en la semana) captura toda la cadena — fabricante,
                foundry, memoria y litografía — que es exactamente donde quieres estar en este ciclo.
              </P>

              <h3 className="text-[22px] sm:text-[24px] font-extralight tracking-wide text-foreground mt-12 mb-4">
                4. Aranceles: la cuenta atrás que nadie cotiza
              </h3>
              <P>
                La pausa de 90 días vence el <Strong>9 de julio</Strong> y las cartas con los nuevos tipos empiezan a salir el lunes.
                Bruselas negocia un acuerdo marco (<SourceLink sourceId="polymarket-aranceles">42% de probabilidad en Polymarket, +11 en la semana</SourceLink>); Japón e India están más
                lejos. El mercado descuenta prórrogas y acuerdos de mínimos — probablemente con razón. Pero un VIX en 16,4 con un
                evento binario a tres días es la definición técnica de complacencia, y las opciones de cobertura sobre el Stoxx
                están históricamente baratas para quien quiera dormir tranquilo.
              </P>

              <PullQuote
                quote="El mercado ha decidido que los aranceles son una táctica de negociación y no una política económica. La semana que viene sabremos si el mercado negocia bien."
                source="The Daily Shot"
                meta="Edición del viernes"
                sourceId="daily-shot"
              />
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- SECTORES ---------- */}
          <Reveal>
            <section>
              <Kicker icon="sectors">Performance de sectores</Kicker>
              <H2>Una rotación de libro hacia el riesgo</H2>
              <P>
                El mapa sectorial de la semana es el de un mercado sin miedo: <Strong>todo lo cíclico arriba, todo lo defensivo
                plano o abajo, y la energía en su propia crisis particular</Strong>. Los semiconductores (+2,8%) encadenan su cuarta
                semana consecutiva batiendo al índice, y la tecnología en conjunto aporta ya dos tercios de la subida del S&P en el
                semestre — una concentración que es a la vez la fortaleza y la fragilidad de este mercado.
              </P>
              <P className="mt-5">
                Las financieras (+1,1%) merecen mención: llevaban un mes rezagadas y despertaron justo antes de sus resultados del
                14 de julio. Si JPMorgan y Citi confirman márgenes, el rally gana la anchura que le falta. Y la energía (-2,1%)
                cierra su peor racha desde abril: es ya el único sector del S&P en negativo en el año.
              </P>

              <div className="my-10 rounded-2xl border border-card-border bg-card/40 p-6 sm:p-8">
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-1.5">Variación semanal por sector</p>
                <p className="text-[13px] text-muted mb-6">S&P 500, semana del 29 jun — 3 jul</p>
                <BarsChart data={sectoresSemana} ariaLabel="Performance semanal por sector" />
              </div>
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- ACTIVOS DESTACADOS ---------- */}
          <Reveal>
            <section>
              <Kicker icon="star">Activos destacados</Kicker>
              <H2>Ganadores y perdedores de la semana</H2>

              <div className="grid sm:grid-cols-2 gap-6 mt-9">
                <div className="rounded-2xl border border-[#30d158]/20 overflow-hidden">
                  <p className="px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold text-[#30d158] border-b border-white/[0.06]">
                    Top gainers
                  </p>
                  {gainers.map((m, i) => (
                    <div key={m.ticker} className={`flex items-center justify-between gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-300 ${i > 0 ? "border-t border-white/[0.05]" : ""}`}>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-foreground">
                          {m.name} <span className="text-muted text-[11px] ml-1">{m.ticker}</span>
                        </p>
                      </div>
                      <DataTip value={m.change} tip={m.tip} direction="up" />
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[#ff453a]/20 overflow-hidden">
                  <p className="px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold text-[#ff453a] border-b border-white/[0.06]">
                    Top losers
                  </p>
                  {losers.map((m, i) => (
                    <div key={m.ticker} className={`flex items-center justify-between gap-3 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-300 ${i > 0 ? "border-t border-white/[0.05]" : ""}`}>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-foreground">
                          {m.name} <span className="text-muted text-[11px] ml-1">{m.ticker}</span>
                        </p>
                      </div>
                      <DataTip value={m.change} tip={m.tip} direction="down" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- ANÁLISIS TÉCNICO ---------- */}
          <Reveal>
            <section>
              <Kicker icon="candles">Análisis técnico</Kicker>
              <H2>Máximos sin euforia en el volumen</H2>
              <P>
                La estructura técnica del S&P sigue siendo constructiva: la ruptura de los <Strong>6.250</Strong> del viernes se
                produjo con el índice claramente por encima de sus medias de 20 y 50 sesiones, y el antiguo techo se convierte en
                el primer soporte. Por abajo, la zona de <Strong>6.150-6.170</Strong> (máximos de febrero y hueco alcista del lunes)
                es el nivel que separa la tendencia sana de la primera corrección seria. Por arriba, la extensión natural del
                movimiento apunta a la zona psicológica de <Strong>6.300-6.350</Strong>.
              </P>
              <P className="mt-5">
                El pero está en la participación: el rally del viernes llegó con un volumen un 24% inferior a la media por la media
                sesión festiva, y el RSI diario roza 68 — todavía no es sobrecompra, pero ya no queda mucho margen. Con el deadline
                del día 9 en medio, lo más probable es que los primeros días de la semana sean de consolidación entre 6.240 y 6.300.
              </P>

              <div className="my-10 rounded-2xl border border-card-border bg-card/40 p-6 sm:p-8">
                <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-muted/80 mb-1.5">S&P 500 — velas de la semana</p>
                <p className="text-[13px] text-muted mb-6">Rango diario (OHLC). Pasa el cursor por cada vela.</p>
                <CandleChart data={velas} height={230} ariaLabel="Velas diarias del S&P 500" />
                <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-[12px] text-muted">
                    Soporte: <span className="text-foreground font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>6.250 / 6.150</span>
                  </p>
                  <p className="text-[12px] text-muted">
                    Resistencia: <span className="text-foreground font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>6.300-6.350</span>
                  </p>
                  <p className="text-[12px] text-muted">
                    RSI diario: <span className="text-[#ffd60a] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>68</span>
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- PERSPECTIVA ---------- */}
          <Reveal>
            <section>
              <Kicker icon="compass">Perspectiva para la próxima semana</Kicker>
              <H2>La semana que puede validarlo (o estropearlo) todo</H2>
              <P>
                Pocas veces una semana concentra tanto: <Strong>cartas arancelarias desde el lunes</Strong>, actas de la Fed el
                miércoles, deadline oficial el jueves y los ingresos del Q2 de TSMC el viernes como aperitivo de la temporada de
                resultados. El escenario base — prórrogas, un acuerdo marco con la UE y unas actas sin sorpresas — es continuista:
                consolidación en la zona 6.240-6.300 hasta el IPC del día 15.
              </P>
              <P className="mt-5">
                Para tu cartera, el plan es el mismo que cerró la semana pasada: <Strong>no añadir riesgo antes del jueves 9</Strong>.
                Si TSMC confirma el viernes la fortaleza del ciclo, la eventual caída del 2-3% en SEMI que llevas semanas esperando
                para ampliar podría no llegar — y no pasa nada: no perseguir precio también es una decisión. En el Brent, el nivel
                a vigilar sigue siendo el soporte de $66; perderlo abriría la puerta a los $62 y a replantear la mitad restante de
                la posición.
              </P>

              <VideoCard
                poster="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1600&h=800&fit=crop&q=90"
                title="Weekly wrap — la semana en 90 segundos"
                duration="1:32"
              />
            </section>
          </Reveal>

          <SectionDivider />

          {/* ---------- CONCLUSIÓN ---------- */}
          <Reveal>
            <section>
              <Kicker icon="check">Conclusión</Kicker>
              <P>
                Fue una semana para dejarse llevar, y tu cartera se dejó llevar bien: +1,9% con tres de cinco posiciones batiendo
                al índice. El mercado ha elegido creer en el aterrizaje perfecto — empleo sólido, inflación contenida, recortes en
                septiembre y aranceles negociables. Puede que tenga razón. Pero los máximos históricos con volatilidad en mínimos
                y un evento binario a tres días son el tipo de contexto donde la prudencia no cuesta rentabilidad: solo cuesta
                paciencia. Esta semana, la paciencia es la posición.
              </P>
            </section>
          </Reveal>

          {/* ---------- CIERRE + NAVEGACIÓN ---------- */}
          <div className="mt-20 pt-10 border-t border-white/[0.06]">
            <p className="text-[12px] text-muted leading-relaxed mb-8">
              Resumen generado el domingo 5 de julio de 2026 · 87 noticias analizadas · 14 fuentes · 9 vinculadas a tu portfolio
            </p>
            <ShareBar title="FinPulse — Resumen semanal, 29 jun a 3 jul 2026" storageKey="semanal-2026-w27" />

            <div className="grid sm:grid-cols-3 gap-4 mt-12">
              <Link
                href="/semanal"
                className="group flex items-center justify-between rounded-2xl border border-card-border bg-card/40 px-6 py-5 hover:border-white/25 transition-all duration-500"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted mb-1.5">Dashboard</p>
                  <p className="text-[14px] text-foreground font-light">Semana en datos</p>
                </div>
                <Icon name="arrow-left" className="w-4 h-4 text-muted group-hover:text-foreground group-hover:-translate-x-1 transition-all duration-500" />
              </Link>
              <Link
                href="/resumen"
                className="group flex items-center justify-between rounded-2xl border border-card-border bg-card/40 px-6 py-5 hover:border-white/25 transition-all duration-500"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted mb-1.5">Briefing diario</p>
                  <p className="text-[14px] text-foreground font-light">Lunes 6 de julio</p>
                </div>
                <Icon name="arrow-right" className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all duration-500" />
              </Link>
              <div className="flex items-center justify-between rounded-2xl border border-card-border/50 bg-card/20 px-6 py-5 opacity-50 cursor-not-allowed">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted mb-1.5">Próxima semana</p>
                  <p className="text-[14px] text-muted font-light">Disponible el 12 de julio</p>
                </div>
                <Icon name="arrow-right" className="w-4 h-4 text-muted/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
