"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import BorderCard from "@/components/BorderCard";

/* ───── helpers ───── */

function SourceBadge({ name, type }: { name: string; type: string }) {
  const colors: Record<string, string> = {
    newsletter: "bg-blue-500/15 text-blue-400",
    polymarket: "bg-emerald-500/15 text-emerald-400",
    news: "bg-rose-500/15 text-rose-400",
  };
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full ${colors[type] || "bg-card-border text-muted"}`}
    >
      {name}
    </span>
  );
}

function SectionDivider() {
  return <div className="h-px bg-card-border my-10" />;
}

/* ───── mini SVG charts ───── */

function ChartUp() {
  return (
    <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#30d158" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#30d158" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,32 L10,30 L20,28 L30,30 L40,26 L50,22 L60,24 L70,18 L80,14 L90,12 L100,8 L110,6 L120,4" fill="none" stroke="#30d158" strokeWidth="2" />
      <path d="M0,32 L10,30 L20,28 L30,30 L40,26 L50,22 L60,24 L70,18 L80,14 L90,12 L100,8 L110,6 L120,4 L120,40 L0,40 Z" fill="url(#gUp)" />
    </svg>
  );
}

function ChartUpStrong() {
  return (
    <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gUpS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#30d158" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#30d158" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,35 L10,33 L20,34 L30,30 L40,28 L50,26 L60,20 L70,18 L80,12 L90,10 L100,6 L110,4 L120,2" fill="none" stroke="#30d158" strokeWidth="2" />
      <path d="M0,35 L10,33 L20,34 L30,30 L40,28 L50,26 L60,20 L70,18 L80,12 L90,10 L100,6 L110,4 L120,2 L120,40 L0,40 Z" fill="url(#gUpS)" />
    </svg>
  );
}

function ChartFlat() {
  return (
    <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gFlat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86868b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#86868b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,20 L10,22 L20,18 L30,20 L40,19 L50,21 L60,17 L70,20 L80,22 L90,19 L100,21 L110,18 L120,20" fill="none" stroke="#86868b" strokeWidth="2" />
      <path d="M0,20 L10,22 L20,18 L30,20 L40,19 L50,21 L60,17 L70,20 L80,22 L90,19 L100,21 L110,18 L120,20 L120,40 L0,40 Z" fill="url(#gFlat)" />
    </svg>
  );
}

/* ───── timeline data ───── */

const timelineEvents = [
  {
    date: "28 abril",
    title: "Primeros rumores de negociaciones",
    description:
      "Fuentes cercanas al Departamento de Estado filtran a Reuters que se han retomado conversaciones informales con Beijing sobre aranceles. Los mercados no reaccionan de forma significativa — el escepticismo es alto tras varios intentos fallidos en 2025.",
    impact: "neutral" as const,
    impactLabel: "Sin impacto en mercados",
  },
  {
    date: "2 mayo",
    title: "Filtraciones sobre terminos preliminares",
    description:
      "Bloomberg publica detalles de un borrador que incluye reduccion de aranceles al 10% en bienes de consumo y al 15% en industriales. Los semiconductores y tecnologia IA quedan explicitamente excluidos. El S&P 500 sube un +0.4% en la sesion.",
    impact: "green" as const,
    impactLabel: "S&P 500 +0.4%",
  },
  {
    date: "5 mayo",
    title: "Mercados empiezan a descontar el acuerdo",
    description:
      "Los futuros del S&P 500 abren al alza tras un fin de semana de especulaciones. Polymarket sube la probabilidad de acuerdo del 45% al 62%. Los sectores industriales y de consumo lideran las subidas. El yuan se fortalece frente al dolar.",
    impact: "green" as const,
    impactLabel: "S&P 500 +0.6%, Yuan +0.8%",
  },
  {
    date: "7 mayo",
    title: "Bloomberg confirma reuniones de alto nivel",
    description:
      "El Secretario del Tesoro y el Viceprimer Ministro chino se reunen en Ginebra. Las fotos del encuentro circulan en redes sociales y generan un rally intradía. Financial Times publica un analisis detallado de los posibles terminos.",
    impact: "green" as const,
    impactLabel: "S&P 500 +0.8%, VIX cae a 14.1",
  },
  {
    date: "9 mayo",
    title: "Anuncio oficial del acuerdo fase 1",
    description:
      "La Casa Blanca y el Consejo de Estado chino anuncian simultaneamente el acuerdo. Reduccion de aranceles en bienes de consumo e industriales. Se establece un calendario de negociaciones para semiconductores en Q3. El S&P 500 cierra en máximos históricos.",
    impact: "green" as const,
    impactLabel: "S&P 500 +1.2%, máximos históricos",
  },
  {
    date: "11 mayo",
    title: "Mercados consolidan, analistas evaluan impacto",
    description:
      "Tras el rally del viernes, los analistas empiezan a desmenuzar la letra pequena. Matt Levine advierte que los aranceles tech siguen sobre la mesa. El VIX cae a 13.2 — niveles de complacencia. Los mercados asiaticos celebran con subidas del 1.5-2.3%.",
    impact: "neutral" as const,
    impactLabel: "Consolidacion, VIX 13.2",
  },
];

/* ───── main page ───── */

export default function NoticiaPage() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  return (
    <main className="min-h-screen">
      <Nav />

      {/* ───── 1. HERO ───── */}
      <section className="relative w-full h-[420px] md:h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=500&fit=crop"
          alt="Mercados globales trading"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <SourceBadge name="Financial Times" type="news" />
            <SourceBadge name="Matt Levine" type="newsletter" />
            <SourceBadge name="Polymarket" type="polymarket" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Acuerdo comercial EEUU-China: impacto en ETFs globales
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span>11 de mayo, 2026</span>
            <span className="hidden sm:inline">|</span>
            <span>Tiempo de lectura: ~12 min</span>
            <span className="hidden sm:inline">|</span>
            <span className="text-accent-light">Analisis profundo</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* ───── 2. KEY DATA BAR ───── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 py-8 border-b border-card-border">
          <BorderCard padding="p-4" className="text-center">
            <p className="text-xs text-muted mb-1">S&P 500</p>
            <p className="text-xl font-bold text-green">+1.2%</p>
            <p className="text-xs text-muted">Máximos históricos</p>
          </BorderCard>
          <BorderCard padding="p-4" className="text-center">
            <p className="text-xs text-muted mb-1">Acuerdo</p>
            <p className="text-xl font-bold text-accent-light">Fase 1</p>
            <p className="text-xs text-muted">Bienes consumo e industrial</p>
          </BorderCard>
          <BorderCard padding="p-4" className="text-center">
            <p className="text-xs text-muted mb-1">Polymarket BCE</p>
            <p className="text-xl font-bold text-green">73%</p>
            <p className="text-xs text-muted">Recorte junio</p>
          </BorderCard>
          <BorderCard padding="p-4" className="text-center">
            <p className="text-xs text-muted mb-1">VIX</p>
            <p className="text-xl font-bold text-[#ffd60a]">13.2</p>
            <p className="text-xs text-muted">Complacencia</p>
          </BorderCard>
        </section>

        <SectionDivider />

        {/* ───── 3. ANALISIS COMPLETO ───── */}
        <section>
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=900&h=300&fit=crop"
              alt="Analisis de mercados"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-2xl font-bold">Analisis completo</h2>
              <p className="text-xs text-muted">Que paso, por que importa, que significa para tu dinero</p>
            </div>
          </div>

          <div className="text-sm leading-7 text-muted space-y-5">
            <p>
              El viernes 9 de mayo, la Casa Blanca y el Consejo de Estado chino anunciaron
              simultaneamente un <span className="text-accent-light font-medium">acuerdo comercial
              fase 1</span> que reduce los aranceles sobre bienes de consumo e industriales. Es el
              primer avance concreto en las relaciones comerciales entre las dos mayores economias del
              mundo desde que se reiniciaron los aranceles a principios de 2026, y los mercados
              globales lo celebraron con un rally amplio e inmediato.
            </p>

            <p>
              El <span className="text-green font-medium">S&P 500 cerro en máximos históricos
              (+1.2%)</span>, el Nasdaq subio un +1.8% liderado por mega-caps con exposición a China,
              y los mercados asiaticos respondieron con subidas del 1.5-2.3% en la sesion del lunes.
              El Shanghai Composite fue el mayor beneficiario directo (+2.3%), mientras que el Nikkei
              subio un +1.5% impulsado por exportadoras japonesas.
            </p>

            <div className="border-l-2 border-accent-light/40 pl-5 py-2 bg-card/50 rounded-r-lg">
              <p className="text-xs text-accent-light mb-1">Matt Levine — Money Stuff</p>
              <p className="text-foreground italic">
                &quot;Los mercados suben porque hay menos incertidumbre, no porque los terminos sean
                especialmente buenos. Es un acuerdo para seguir negociando, que es mejor que no tener
                acuerdo.&quot;
              </p>
            </div>

            <p>
              Los detalles del acuerdo revelan tanto oportunidades como limitaciones. Los aranceles a
              bienes de consumo se reducen al 10%, los industriales al 15%. Pero la{" "}
              <span className="text-red font-medium">exclusion explicita de semiconductores,
              equipos de IA y materiales estrategicos</span> significa que el verdadero pulso
              geopolitico aun no se ha resuelto. Las negociaciones sobre tecnologia se han aplazado
              a Q3 2026, lo que introduce un calendario de incertidumbre que el mercado aun no ha
              descontado por completo.
            </p>

            <p>
              Para los ETFs globales, el impacto es claramente positivo en el corto plazo. Los fondos
              que replican indices amplios como el{" "}
              <span className="text-green font-medium">MSCI World (+1.8%) y el S&P 500 (+2.1%)</span>{" "}
              capturan directamente la mejora del sentimiento. Los ETFs de mercados emergentes
              asiaticos son los mayores beneficiarios relativos, con el MSCI Emerging Markets subiendo
              un +2.8%.
            </p>

            <div className="border-l-2 border-green/40 pl-5 py-2 bg-card/50 rounded-r-lg">
              <p className="text-xs text-green mb-1">Financial Times — Analisis editorial</p>
              <p className="text-foreground italic">
                &quot;El acuerdo reduce el riesgo tail de una escalada arancelaria total. Para los
                inversores en ETFs globales, esto elimina el principal descuento geopolitico que pesaba
                sobre la renta variable internacional desde enero.&quot;
              </p>
            </div>

            <p>
              Sin embargo, hay señales de precaucion. El{" "}
              <span className="text-[#ffd60a] font-medium">VIX cayo a 13.2</span>, niveles de
              complacencia no vistos desde enero 2024. Históricamente, cuando el VIX se mantiene por
              debajo de 14 durante mas de 10 sesiones consecutivas, el S&P 500 ha sufrido correcciones
              del 3-5% en las semanas siguientes. Ya llevamos 8 sesiones — no es momento de perseguir
              el rally, sino de dejar correr las posiciones existentes.
            </p>

            <p>
              En paralelo, el{" "}
              <span className="text-accent-light font-medium">BCE mantiene un tono dovish</span> que
              refuerza el caso alcista para renta variable europea. Las actas filtradas por Financial
              Times muestran que 19 de 26 miembros del consejo apoyan un recorte de 25 puntos basicos
              en junio. Polymarket cifra la probabilidad al 73%. Este contexto de politica monetaria
              expansiva en Europa complementa la mejora del sentimiento comercial global.
            </p>

            <BorderCard padding="p-5" className="text-foreground">
              <p className="font-semibold mb-2">Impacto neto en tu portfolio</p>
              <p className="text-muted">
                El efecto combinado del acuerdo comercial, el BCE dovish y el rally de semiconductores
                genera un{" "}
                <span className="text-green font-medium">resultado positivo de +2.4% semanal</span>{" "}
                para tu portfolio. Las posiciones en IWDA y VUAA son las principales beneficiarias. La
                unica nota negativa es BRT (Brent), afectado indirectamente por el contexto energetico
                global — pero esa caida responde mas a las negociaciones Iran-EEUU que al acuerdo con
                China.
              </p>
            </BorderCard>
          </div>
        </section>

        <SectionDivider />

        {/* ───── 4. HILO TEMPORAL ───── */}
        <section>
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&h=300&fit=crop"
              alt="Timeline cronologica"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-2xl font-bold">Hilo temporal</h2>
              <p className="text-xs text-muted">Como evoluciono esta historia dia a dia</p>
            </div>
          </div>

          <div className="relative pl-8 space-y-0">
            {/* vertical line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-card-border" />

            {timelineEvents.map((event, i) => {
              const isExpanded = expandedEvent === i;
              const dotColor =
                event.impact === "green"
                  ? "bg-green"
                  : (event.impact as string) === "red"
                    ? "bg-red"
                    : "bg-muted";

              return (
                <div key={i} className="relative pb-6">
                  {/* dot */}
                  <div
                    className={`absolute -left-[20.5px] top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 ring-background z-[1]`}
                  />

                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : i)}
                    className="w-full text-left group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-1">
                      <span className="text-xs font-mono text-accent-light font-medium shrink-0">
                        {event.date}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-light transition-colors">
                        {event.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          event.impact === "green"
                            ? "bg-green/15 text-green"
                            : (event.impact as string) === "red"
                              ? "bg-red/15 text-red"
                              : "bg-card-border text-muted"
                        }`}
                      >
                        {event.impactLabel}
                      </span>
                      <span className="text-xs text-muted">
                        {isExpanded ? "Colapsar" : "Expandir"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 text-sm text-muted leading-7 bg-card border border-card-border rounded-xl p-4 animate-fade-in-up">
                      {event.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <SectionDivider />

        {/* ───── 5. IMPACTO EN TU PORTFOLIO ───── */}
        <section>
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&h=300&fit=crop"
              alt="Portfolio personal"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-2xl font-bold">Impacto en tu portfolio</h2>
              <p className="text-xs text-muted">Como afecta esta noticia a tus posiciones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IWDA */}
            <div className="bg-card border border-green/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center text-sm font-mono text-green">
                    IW
                  </div>
                  <div>
                    <p className="font-medium text-foreground">IWDA</p>
                    <p className="text-xs text-muted">iShares MSCI World</p>
                  </div>
                </div>
                <span className="text-green font-bold text-lg">+1.8%</span>
              </div>
              <p className="text-xs text-muted mb-3">
                Beneficiario directo. El MSCI World captura el rally global impulsado por la reduccion
                de riesgo geopolitico. El componente europeo tambien sube por las expectativas de
                recorte del BCE. Posicion nucleo que no requiere accion.
              </p>
              <div className="rounded-lg overflow-hidden border border-card-border bg-background p-2">
                <ChartUp />
              </div>
            </div>

            {/* VUAA */}
            <div className="bg-card border border-green/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center text-sm font-mono text-green">
                    VU
                  </div>
                  <div>
                    <p className="font-medium text-foreground">VUAA</p>
                    <p className="text-xs text-muted">Vanguard S&P 500</p>
                  </div>
                </div>
                <span className="text-green font-bold text-lg">+2.1%</span>
              </div>
              <p className="text-xs text-muted mb-3">
                Máximos históricos. Las mega-caps con exposición a China (Apple, Nvidia, Tesla)
                lideran el rally. Atención al VIX en 13.2 — no es momento de añadir, pero tampoco de
                vender. Dejar correr la posicion.
              </p>
              <div className="rounded-lg overflow-hidden border border-card-border bg-background p-2">
                <ChartUpStrong />
              </div>
            </div>

            {/* BRT */}
            <div className="bg-card border border-muted/30 rounded-xl p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/10 flex items-center justify-center text-sm font-mono text-muted">
                    BR
                  </div>
                  <div>
                    <p className="font-medium text-foreground">BRT</p>
                    <p className="text-xs text-muted">Brent Crude Oil</p>
                  </div>
                </div>
                <span className="text-muted font-bold text-lg">~0%</span>
              </div>
              <p className="text-xs text-muted mb-3">
                Afectado indirectamente. La caida del Brent esta semana (-3.8%) responde
                principalmente a las negociaciones Iran-EEUU, no al acuerdo con China. El acuerdo
                comercial tiene un efecto ligeramente positivo sobre la demanda global de energia, pero
                es insuficiente para compensar la presion bajista del lado de la oferta iraní. Posicion
                a vigilar de cerca por otras razones.
              </p>
              <div className="rounded-lg overflow-hidden border border-card-border bg-background p-2">
                <ChartFlat />
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ───── 6. PARALELO HISTORICO ───── */}
        <section>
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=300&fit=crop"
              alt="Datos históricos"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-2xl font-bold">Paralelo histórico</h2>
              <p className="text-xs text-muted">2019 vs 2026: dos acuerdos, dos contextos</p>
            </div>
          </div>

          <BorderCard padding="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* 2019 */}
              <div className="p-6 border-b md:border-b-0 md:border-r border-card-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-lg font-bold text-accent-light">
                    19
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Acuerdo Fase 1 — 2019</h3>
                    <p className="text-xs text-muted">Diciembre 2019</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted leading-6">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <p>S&P 500 subio +3.2% en las dos semanas posteriores al anuncio</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <p>Rally amplio — todos los sectores subieron, industriales y tech lideraron</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                    <p>
                      Aranceles clave nunca se eliminaron. Compromisos de compra incumplidos por China
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                    <p>Rally se agoto en febrero 2020. Duracion real: ~8 semanas</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted mt-2 shrink-0" />
                    <p>Contexto: Fed en pausa, sin presiones inflacionarias significativas</p>
                  </div>
                </div>
              </div>

              {/* 2026 */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green/10 flex items-center justify-center text-lg font-bold text-green">
                    26
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Acuerdo Fase 1 — 2026</h3>
                    <p className="text-xs text-muted">Mayo 2026</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted leading-6">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                    <p>S&P 500 sube +1.2% en la primera sesion. Rally mas contenido que en 2019</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <p>Exclusion explicita de semiconductores, IA y materiales estrategicos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                    <p>BCE dovish refuerza el caso — contexto macro mas favorable para renta variable</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffd60a] mt-2 shrink-0" />
                    <p>VIX en 13.2 — complacencia extrema, históricamente precede correcciones</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                    <p>
                      Negociaciones tech en Q3 seran el verdadero test. Si fracasan, el rally se
                      revierte
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* conclusion */}
            <div className="border-t border-card-border p-6 bg-background/50">
              <p className="text-sm text-muted leading-7">
                <span className="text-accent-light font-medium">Leccion de 2019:</span> El mercado
                celebra la reduccion de incertidumbre mas que los terminos especificos. La euforia
                inicial puede durar 2-3 semanas, pero sin progreso real en los temas pendientes, el
                impulso se desvanece. Si el S&P sube un +3% adicional, considerar tomar beneficios
                parciales.
              </p>
            </div>
          </BorderCard>
        </section>

        <SectionDivider />

        {/* ───── 7. CONTRAARGUMENTOS ───── */}
        <section>
          <div className="relative rounded-xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=300&fit=crop"
              alt="Analisis bull vs bear"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-2xl font-bold">Contraargumentos</h2>
              <p className="text-xs text-muted">Caso optimista vs caso pesimista</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Optimista */}
            <div className="bg-card border border-green/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-green/15 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#30d158"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <h3 className="text-green font-semibold text-lg">Caso optimista</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted leading-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                  <span>
                    El acuerdo es solo el principio — las negociaciones tech en Q3 podrian producir
                    mas avances, generando otro rally
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                  <span>
                    El BCE recortando en junio + acuerdo comercial = doble viento de cola para renta
                    variable global
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                  <span>
                    La reduccion de incertidumbre comercial libera inversión empresarial represada,
                    impulsando el crecimiento real
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                  <span>
                    Earnings del Q2 podrian sorprender al alza con mejores guias si las empresas
                    incorporan el acuerdo en sus proyecciones
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 shrink-0" />
                  <span>
                    China estimulando su economia internamente + acuerdo = posible reaceleracion
                    global coordinada
                  </span>
                </li>
              </ul>
            </div>

            {/* Pesimista */}
            <div className="bg-card border border-red/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-red/15 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff453a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </svg>
                </div>
                <h3 className="text-red font-semibold text-lg">Caso pesimista</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted leading-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                  <span>
                    Como en 2019, el acuerdo es mas simbolico que sustancial — los aranceles clave
                    persisten y China podria incumplir compromisos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                  <span>
                    VIX en 13.2 es una señal de complacencia extrema — correcciones del 3-5% son
                    históricamente probables desde estos niveles
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                  <span>
                    Las negociaciones tech en Q3 son el verdadero campo de batalla — un fracaso
                    revertiria todo el optimismo actual
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                  <span>
                    El mercado ya ha descontado la noticia — el risk/reward para nuevas compras es
                    asimetrico a la baja
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red mt-2 shrink-0" />
                  <span>
                    Tensiones geopoliticas latentes (Taiwan, Mar del Sur de China) pueden resurgir en
                    cualquier momento e invalidar el acuerdo
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ───── 8. NOTICIAS RELACIONADAS ───── */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Noticias relacionadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="#"
              className="group bg-card border border-card-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1640955014216-75201056c829?w=400&h=200&fit=crop"
                  alt="Semiconductores"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-xs text-accent-light mb-1">Tecnologia</p>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-light transition-colors leading-snug">
                  Nvidia Blackwell Ultra: el ciclo de semiconductores se acelera
                </h3>
                <p className="text-xs text-muted mt-2">9 mayo, 2026 — 6 min lectura</p>
              </div>
            </Link>

            <Link
              href="#"
              className="group bg-card border border-card-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=400&h=200&fit=crop"
                  alt="Petróleo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-xs text-red mb-1">Energia</p>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-light transition-colors leading-snug">
                  Negociaciones Iran-EEUU: riesgo bajista para el Brent
                </h3>
                <p className="text-xs text-muted mt-2">10 mayo, 2026 — 8 min lectura</p>
              </div>
            </Link>

            <Link
              href="#"
              className="group bg-card border border-card-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519995451813-39e29e054914?w=400&h=200&fit=crop"
                  alt="BCE Europa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-xs text-green mb-1">Politica monetaria</p>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent-light transition-colors leading-snug">
                  BCE camino al recorte: que significa para bonos europeos
                </h3>
                <p className="text-xs text-muted mt-2">8 mayo, 2026 — 5 min lectura</p>
              </div>
            </Link>
          </div>
        </section>

        <SectionDivider />

        {/* ───── 9. BACK BUTTON ───── */}
        <div className="pb-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-accent-light hover:text-accent transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver al resumen
          </Link>
        </div>
      </div>
    </main>
  );
}
