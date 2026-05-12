"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import BorderCard from "@/components/BorderCard";

function MockChart() {
  const points = "0,40 15,35 30,42 45,28 55,32 65,18 80,22 95,10 110,15 130,8 150,12 170,5";
  return (
    <svg viewBox="0 0 170 50" className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,50 ${points} 170,50`} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="1.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SummarySection({ title, icon, tag, tagColor, defaultOpen, children }: {
  title: string;
  icon: string;
  tag?: string;
  tagColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-card-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium flex-1">{title}</span>
        {tag && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${tagColor || "bg-card-border text-muted"}`}>{tag}</span>
        )}
        <span className="text-muted"><ChevronIcon open={open} /></span>
      </button>
      {open && (
        <div className="pb-5 pl-9 pr-4 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
}

function SourceBadge({ name, type }: { name: string; type: "newsletter" | "podcast" | "polymarket" | "x" | "bank" | "news" }) {
  const colors: Record<string, string> = {
    newsletter: "bg-blue-500/15 text-blue-400",
    podcast: "bg-purple-500/15 text-purple-400",
    polymarket: "bg-emerald-500/15 text-emerald-400",
    x: "bg-zinc-500/15 text-zinc-400",
    bank: "bg-amber-500/15 text-amber-400",
    news: "bg-rose-500/15 text-rose-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[type]}`}>{name}</span>
  );
}

function NewsCard({ type, title, tag, delay, image, source, summary, impact, sources }: {
  type: string; title: string; tag: string; delay: string; image: string; source: string;
  summary: string; impact: string; sources: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const tagColors: Record<string, string> = {
    "Tu portfolio": "bg-accent/20 text-accent-light",
    "Nuevo": "bg-green/20 text-green",
    "Futuro": "bg-amber-500/20 text-amber-400",
  };
  return (
    <div
      className={`bg-card border border-card-border rounded-xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 cursor-pointer ${delay}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <span className="absolute bottom-2 left-3 text-xs text-muted/80">{source}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted uppercase tracking-wider">{type}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${tagColors[tag] || "bg-card-border text-muted"}`}>{tag}</span>
        </div>
        <h3 className="text-sm font-medium leading-snug mb-2">{title}</h3>
        {!expanded && <p className="text-xs text-accent-light">Click para expandir</p>}
        {expanded && (
          <div className="mt-3 space-y-3 animate-fade-in-up">
            <p className="text-xs text-muted leading-relaxed">{summary}</p>
            <div className="bg-background rounded-lg p-3 border border-card-border">
              <p className="text-xs text-accent-light font-medium mb-1">Impacto en tu portfolio</p>
              <p className="text-xs text-muted">{impact}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {sources.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-card-border text-muted">{s}</span>
              ))}
            </div>
            <Link href="/noticia" className="block text-xs text-accent-light hover:text-accent transition-colors" onClick={(e) => e.stopPropagation()}>
              Profundizar →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioPosition({ ticker, name, change, value }: { ticker: string; name: string; change: number; value: string }) {
  const isPositive = change >= 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-mono text-accent-light">
          {ticker.slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium">{ticker}</p>
          <p className="text-xs text-muted">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{value}</p>
        <p className={`text-xs ${isPositive ? "text-green" : "text-red"}`}>
          {isPositive ? "+" : ""}{change}%
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <BorderCard padding="p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </BorderCard>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Nav />

      {/* Hero: Daily Summary */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="animate-fade-in-up">
          <p className="text-muted text-sm mb-1">Domingo, 11 de mayo 2026 — 9:00 AM</p>
          <h1 className="text-2xl font-bold mb-4">Buenos dias, Nico</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up-delay">
          <BorderCard padding="p-4">
            <p className="text-xs text-muted mb-1">Portfolio total</p>
            <p className="text-xl font-bold">12.847,32</p>
            <p className="text-xs text-green">+2.4% esta semana</p>
          </BorderCard>
          <BorderCard padding="p-4">
            <p className="text-xs text-muted mb-1">Sentimiento mercado</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-card-border overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-red to-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-400">62</span>
            </div>
            <p className="text-xs text-muted mt-1">Moderadamente optimista</p>
          </BorderCard>
          <BorderCard padding="p-4">
            <p className="text-xs text-muted mb-1">Recomendación IA</p>
            <p className="text-sm font-medium">Mantener posiciones</p>
            <p className="text-xs text-accent-light">Convicción: 7/10</p>
          </BorderCard>
          <BorderCard padding="p-4">
            <p className="text-xs text-muted mb-1">Tu Investor DNA</p>
            <p className="text-sm font-medium">Perfil equilibrado</p>
            <p className="text-xs text-muted">Acierto: 68% (mejorando)</p>
          </BorderCard>
        </div>

        {/* Daily Summary — Full version */}
        <div className="bg-card border border-card-border rounded-xl p-6 mb-8 animate-fade-in-up-delay-2">
          {/* Summary header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="font-semibold">Resumen diario</h2>
            <Link href="/resumen" className="text-xs text-accent-light hover:text-accent transition-colors ml-auto">
              Leer resumen completo →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <SourceBadge name="UBS On-Air" type="podcast" />
            <SourceBadge name="Matt Levine" type="newsletter" />
            <SourceBadge name="The Daily Shot" type="newsletter" />
            <SourceBadge name="Polymarket" type="polymarket" />
            <SourceBadge name="@zerohedge" type="x" />
            <SourceBadge name="@sentimentrader" type="x" />
            <SourceBadge name="Informe BBVA" type="bank" />
            <SourceBadge name="Financial Times" type="news" />
          </div>

          {/* Executive summary — always visible */}
          <div className="relative rounded-lg overflow-hidden mb-5 border border-card-border">
            <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=300&fit=crop" alt="Mercados globales" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs text-accent-light font-medium uppercase tracking-wider">Resumen ejecutivo</p>
            </div>
          </div>
          <div className="bg-background rounded-lg p-4 border border-card-border mb-5">
            <p className="text-sm leading-relaxed">
              Semana clave para los mercados globales. El acuerdo comercial preliminar EEUU-China impulsa a la renta variable global, con el S&P 500 cerrando en máximos históricos (+1.2%) y mercados europeos al alza. Sin embargo, el sector energetico se debilita tras avances en las negociaciones Iran-EEUU, con el Brent cayendo un 4.2% en la semana. El BCE mantiene el tono dovish y Polymarket situa al 73% la probabilidad de recorte en junio.
            </p>
            <p className="text-sm leading-relaxed mt-3">
              <span className="text-green font-medium">Para tu portfolio:</span> balance neto positivo (+2.4%). Tus posiciones en MSCI World y S&P 500 capturan la subida. Tu exposición a Brent es el punto debil — considera reducirla o cubrir.
              <span className="text-accent-light"> Semiconductores destaca como la mejor posición (+4.2%) </span> tras el anuncio de Nvidia.
            </p>
          </div>

          {/* Collapsible sections */}
          <div className="divide-y divide-card-border">
            <SummarySection title="Contexto macro global" icon="&#x1f30d;" tag="Alcista" tagColor="bg-green/15 text-green" defaultOpen>
              <div className="space-y-3 text-sm text-muted leading-relaxed">
                <p>
                  <span className="text-foreground font-medium">EEUU:</span> El S&P 500 cerro el viernes en 5.847 puntos (+1.2%), impulsado por el anuncio del acuerdo comercial fase 1 con China. El Nasdaq subio un +1.8% liderado por semiconductores y mega-caps tech. Los futuros apuntan a apertura plana el lunes — el mercado ya ha descontado gran parte de la noticia. El VIX cayo a 13.2, niveles de complacencia no vistos desde enero 2024.
                </p>
                <p>
                  <span className="text-foreground font-medium">Europa:</span> Stoxx 600 +0.8%. El BCE no ha hablado oficialmente, pero las actas de la última reunion filtradas por Financial Times confirman que la mayoria del consejo apoya un recorte de 25pb en junio. El euro se debilita frente al dolar (1.076), lo cual es positivo para exportadoras europeas.
                </p>
                <p>
                  <span className="text-foreground font-medium">Asia:</span> Nikkei +1.5% (yen debil favorece exportadoras). Shanghai Composite +2.3% celebra el acuerdo comercial. India (Nifty 50) plana — los inversores rotan hacia China tras meses de outperformance indio.
                </p>
                <p>
                  <span className="text-foreground font-medium">Renta fija:</span> Treasury 10Y en 4.28% (-5pb en la semana). Los bonos europeos se benefician del tono dovish del BCE. El Bund aleman cae a 2.31%.
                </p>
              </div>
            </SummarySection>

            <SummarySection title="Impacto directo en tu portfolio" icon="&#x1f4bc;" tag="+2.4%" tagColor="bg-green/15 text-green">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">IWDA (iShares MSCI World) +1.8%</span></p>
                    <p className="text-muted">Se beneficia directamente del rally global. El acuerdo EEUU-China reduce riesgo geopolitico, que era el principal freno para mercados desarrollados. Con el BCE dovish, el componente europeo tambien tira al alza. <span className="text-accent-light">Esta posición esta en su mejor momento en 3 meses.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">VUAA (Vanguard S&P 500) +2.1%</span></p>
                    <p className="text-muted">Máximos históricos. El acuerdo comercial elimina la incertidumbre que pesaba sobre mega-caps con exposición a China (Apple, Nvidia, Tesla). Atención: el VIX en 13.2 indica complacencia extrema — históricamente, niveles sub-14 preceden correcciones del 3-5% en las siguientes 4-6 semanas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-red mt-0.5">&#x25BC;</span>
                  <div>
                    <p><span className="text-foreground font-medium">BRT (Brent Crude Oil) -3.8%</span></p>
                    <p className="text-muted">Las negociaciones Iran-EEUU avanzan mas rapido de lo esperado. Si Iran vuelve al mercado con plena capacidad, se estiman 1.5M barriles/dia adicionales. Esto presionaria al Brent hacia los $68-70. <span className="text-red">Tu posición pierde 45,60 esta semana. Considerar stop-loss en $72 o reducir exposición un 50%.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">EUNA (iShares Euro Gov Bond) +0.5%</span></p>
                    <p className="text-muted">Beneficiado por el tono dovish del BCE. Si se confirma el recorte en junio, esta posición podria subir un 1-2% adicional. Paul Donovan (UBS) confirma que la inflacion europea no sera problema hasta Q4 2026.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">SEMI (VanEck Semiconductor) +4.2%</span></p>
                    <p className="text-muted">Mejor posición de la semana. Nvidia presento la nueva arquitectura Blackwell Ultra y los pedidos anticipados superan expectativas. TSMC confirma aumento de capex del 15%. El sector esta en un ciclo expansivo que podria durar 12-18 meses mas. <span className="text-green">Considerar aumentar posición en caidas.</span></p>
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Temas de seguimiento" icon="&#x1f4cd;" tag="3 activos" tagColor="bg-accent/15 text-accent-light">
              <div className="space-y-4 text-sm">
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Semiconductores</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red/15 text-red">ALTA (subida dinamica)</span>
                  </div>
                  <p className="text-muted">Prioridad base: MEDIA. Subida a ALTA por el evento de Nvidia. La nueva arquitectura Blackwell Ultra promete 4x mejor rendimiento en inferencia IA. Esto reconfigura la cadena de valor: TSMC, ASML, Samsung y SK Hynix suben entre 2-6%. Tu posición en SEMI esta bien posicionada. Próximos catalistas: earnings de TSMC (22 mayo) y guidance de ASML (28 mayo).</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Petróleo y energia</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red/15 text-red">ALTA (subida dinamica)</span>
                  </div>
                  <p className="text-muted">Prioridad base: MEDIA. Subida a ALTA por la caida del Brent. Las negociaciones Iran-EEUU son el driver principal. Arabia Saudi aun no ha reaccionado — si recorta produccion, el impacto se amortigua. Si no, el Brent puede caer hasta $68. La OPEC+ se reune el 1 de junio. Fecha clave.</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Politica monetaria BCE</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">MEDIA</span>
                  </div>
                  <p className="text-muted">Sin cambios de prioridad. Reunion del BCE el 5 de junio. Polymarket: 73% probabilidad de recorte 25pb. Impacto en tu portfolio: positivo para EUNA (bonos), positivo para IWDA (componente europeo), neutral para el resto.</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Lo que dicen tus fuentes" icon="&#x1f4e1;" tag="8 fuentes hoy" tagColor="bg-purple-500/15 text-purple-400">
              <div className="space-y-4 text-sm">
                <div className="border-l-2 border-purple-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="UBS On-Air" type="podcast" />
                    <span className="text-xs text-muted">Paul Donovan — hoy</span>
                  </div>
                  <p className="text-muted">&quot;La inflacion europea esta contenida. Los datos de salarios del Q1 confirman que no hay presion alcista significativa. El BCE tiene via libre para recortar en junio sin arriesgar su credibilidad.&quot; Donovan tambien advierte que el acuerdo EEUU-China es &quot;fase 1 — los aranceles tech siguen sobre la mesa.&quot;</p>
                </div>
                <div className="border-l-2 border-blue-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Matt Levine" type="newsletter" />
                    <span className="text-xs text-muted">Money Stuff — viernes</span>
                  </div>
                  <p className="text-muted">Analisis detallado del acuerdo comercial: &quot;Es un framework, no un acuerdo final. Los mercados celebran la reduccion de incertidumbre, no los terminos especificos. La letra pequena muestra que los aranceles a semiconductores y IA se negociaran por separado en Q3.&quot;</p>
                </div>
                <div className="border-l-2 border-emerald-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Polymarket" type="polymarket" />
                    <span className="text-xs text-muted">Datos en vivo</span>
                  </div>
                  <p className="text-muted">Recorte BCE junio: <span className="text-green">73%</span> (+8% vs semana pasada). Acuerdo Iran-EEUU antes de agosto: <span className="text-amber-400">58%</span> (+15% vs semana pasada). Recesion EEUU en 2026: <span className="text-green">12%</span> (mínimo del ano). S&P 500 sobre 6000 antes de diciembre: <span className="text-amber-400">61%</span>.</p>
                </div>
                <div className="border-l-2 border-zinc-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="@zerohedge" type="x" />
                    <span className="text-xs text-muted">Hilo destacado — sabado</span>
                  </div>
                  <p className="text-muted">Alerta sobre la complacencia del mercado: &quot;VIX en 13 con earnings season terminando y el acuerdo China ya descontado. El próximo catalizador es a la baja, no al alza. Históricamente, VIX sub-14 durante mas de 2 semanas precede correcciones.&quot; <span className="text-accent-light">Dato relevante para tu S&P 500.</span></p>
                </div>
                <div className="border-l-2 border-amber-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Informe BBVA" type="bank" />
                    <span className="text-xs text-muted">Informe semanal — viernes</span>
                  </div>
                  <p className="text-muted">BBVA Research revisa al alza su previsión de PIB eurozona para 2026: de 1.1% a 1.4%. Mejora perspectivas para exportadoras alemanas y sector financiero europeo. Mantiene previsión de 2 recortes del BCE este año (junio y septiembre).</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Paralelos históricos" icon="&#x1f4da;">
              <div className="space-y-4 text-sm text-muted">
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-foreground font-medium mb-2">Acuerdo comercial EEUU-China (2019 vs 2026)</p>
                  <p>En diciembre 2019, el acuerdo fase 1 impulso al S&P 500 un +3.2% en las 2 semanas siguientes. Sin embargo, los aranceles clave nunca se eliminaron realmente y el rally se agoto en febrero 2020 (antes del COVID). <span className="text-accent-light">Patron similar: el mercado celebra la reduccion de incertidumbre, pero los detalles importan.</span> Recomendación: disfrutar el rally pero no perseguirlo — tomar beneficios parciales si sube un +3% adicional.</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-foreground font-medium mb-2">Iran volviendo al mercado (2015-2016)</p>
                  <p>Cuando se firmo el JCPOA en 2015, el Brent cayo de $65 a $45 en 6 meses (-30%). La produccion iraniana aumento en 1M barriles/dia. Arabia Saudi respondio manteniendo su produccion para defender cuota de mercado, lo que intensifico la caida. <span className="text-red">Si el patron se repite, tu posición en Brent tiene riesgo significativo a la baja.</span> Diferencia clave: en 2026 la demanda global es mayor y la OPEC+ tiene mas disciplina que en 2015.</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Recomendaciones de hoy" icon="&#x1f3af;" tag="2 acciones" tagColor="bg-accent/15 text-accent-light">
              <div className="space-y-4 text-sm">
                <div className="bg-background rounded-lg p-4 border border-red/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Reducir Brent un 50%</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">Convicción: 8/10</span>
                  </div>
                  <p className="text-muted mb-3">Las negociaciones Iran-EEUU, el paralelo histórico de 2015, y la falta de reaccion de Arabia Saudi apuntan a mas caidas. Reducir a la mitad para limitar perdidas y mantener exposición por si la OPEC+ reacciona.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-green mb-1 font-medium">A favor</p>
                      <p className="text-xs text-muted">Paralelo 2015 (Brent -30%). Iran puede añadir 1.5M bbl/dia. Polymarket da 58% a acuerdo. Tu portfolio ya tiene bastante riesgo energy.</p>
                    </div>
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-red mb-1 font-medium">En contra</p>
                      <p className="text-xs text-muted">La OPEC+ tiene mas disciplina hoy. La demanda global crece. Arabia Saudi podria recortar produccion. El acuerdo puede retrasarse meses.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-green/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Añadir SEMI en caidas (si baja &gt;2%)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">Convicción: 7/10</span>
                  </div>
                  <p className="text-muted mb-3">El ciclo de semiconductores es expansivo (12-18 meses). Nvidia Blackwell Ultra confirma la demanda. TSMC aumenta capex. Pero el sector ya ha subido mucho — esperar una caida para comprar con mejor riesgo/recompensa.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-green mb-1 font-medium">A favor</p>
                      <p className="text-xs text-muted">Ciclo expansivo confirmado. Demanda IA insaciable. Capex TSMC +15%. Tu posición actual es pequena (14% del portfolio).</p>
                    </div>
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-red mb-1 font-medium">En contra</p>
                      <p className="text-xs text-muted">Sector ya +25% YTD. Aranceles tech EEUU-China aun no resueltos (Matt Levine). Valoraciones estiradas (P/E sector en 32x).</p>
                    </div>
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Alertas y próximos eventos" icon="&#x26a0;&#xfe0f;" tag="3 alertas" tagColor="bg-red/15 text-red">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-red mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-foreground font-medium">VIX en zona de complacencia (13.2)</p>
                    <p className="text-muted">Históricamente, VIX sub-14 durante +2 semanas precede correcciones del 3-5%. No vender, pero no añadir riesgo agresivamente. Tu S&P 500 es la posición mas expuesta.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-foreground font-medium">Brent — vigilar nivel $72</p>
                    <p className="text-muted">Si rompe los $72 a la baja, el siguiente soporte esta en $68. Considerar stop-loss o reduccion de posición antes de esa ruptura.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent-light mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-foreground font-medium">Próximos eventos clave</p>
                    <p className="text-muted">IPC EEUU (martes 13). Earnings TSMC (22 mayo). Reunion OPEC+ (1 junio). Reunion BCE (5 junio). Cualquiera de estos puede mover tu portfolio significativamente.</p>
                  </div>
                </div>
              </div>
            </SummarySection>
          </div>
        </div>
      </section>

      {/* 6 News Windows */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <h2 className="font-semibold mb-4">Noticias para profundizar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NewsCard type="Interes personal" title="Acuerdo comercial EEUU-China: impacto en ETFs globales y tu posición en MSCI World" tag="Tu portfolio" delay="animate-fade-in-up" image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop" source="Financial Times"
            summary="El acuerdo fase 1 reduce aranceles en un 30% para bienes industriales. Sin embargo, los aranceles tech (semiconductores, IA) se negociaran por separado en Q3. Los mercados celebran la reduccion de incertidumbre — S&P 500 en máximos."
            impact="Tu IWDA sube +1.8% directamente por esto. VUAA tambien se beneficia (+2.1%). Efecto neto: +~120 en tu portfolio."
            sources={["Financial Times", "Matt Levine", "Polymarket"]}
          />
          <NewsCard type="Interes personal" title="Negociaciones Iran-EEUU avanzan: Brent cae 4% en la semana" tag="Tu portfolio" delay="animate-fade-in-up-delay" image="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=300&fit=crop" source="Reuters"
            summary="El secretario de Estado confirmo avances significativos. Si Iran vuelve al mercado con plena capacidad, 1.5M barriles/dia adicionales presionarian los precios. Polymarket: 58% probabilidad de acuerdo antes de agosto."
            impact="Tu posición en BRT pierde 45,60 esta semana. Si el Brent rompe $72, puede caer hasta $68. Considerar reducir exposición."
            sources={["Reuters", "UBS On-Air", "Polymarket"]}
          />
          <NewsCard type="Información nueva" title="Nvidia presenta nueva arquitectura Blackwell Ultra: el mercado de semiconductores se reconfigura" tag="Nuevo" delay="animate-fade-in-up-delay-2" image="https://images.unsplash.com/photo-1640955014216-75201056c829?w=600&h=300&fit=crop" source="Bloomberg"
            summary="Blackwell Ultra promete 4x mejor rendimiento en inferencia IA. Los hyperscalers ya han confirmado pedidos masivos. TSMC aumenta capex un 15%. El ciclo expansivo de semiconductores se extiende 12-18 meses mas."
            impact="Tu SEMI sube +4.2%, mejor posición de la semana. Considerar aumentar en próxima caida."
            sources={["Bloomberg", "@sentimentrader", "Financial Times"]}
          />
          <NewsCard type="Información nueva" title="India supera a China como mayor mercado emergente por flujo de capitales" tag="Nuevo" delay="animate-fade-in-up" image="https://images.unsplash.com/photo-1532664189809-02133fee698d?w=600&h=300&fit=crop" source="The Daily Shot"
            summary="Tras meses de outperformance, India atrae mas capital que China por primera vez en 2026. Sin embargo, el acuerdo EEUU-China esta provocando rotacion inversa — los inversores vuelven a mirar a Shanghai."
            impact="No tienes exposición directa a emergentes. Podria ser una oportunidad futura si India corrige."
            sources={["The Daily Shot", "BBVA Research"]}
          />
          <NewsCard type="Vision futura" title="Regulación IA en Europa: nuevo marco legal podria impactar al sector tech en 2027" tag="Futuro" delay="animate-fade-in-up-delay" image="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop" source="Matt Levine"
            summary="La UE prepara nuevas restricciones para modelos de IA de alto riesgo. Las multas podrian alcanzar el 6% de los ingresos globales. Meta, Google y Microsoft serian los mas afectados. Implementacion prevista para Q1 2027."
            impact="Impacto indirecto en tu VUAA y IWDA por el peso de big tech. Monitorizar — no requiere accion inmediata."
            sources={["Matt Levine", "Financial Times"]}
          />
          <NewsCard type="Vision futura" title="Escasez global de cobre: la próxima crisis silenciosa para la transicion energetica" tag="Futuro" delay="animate-fade-in-up-delay-2" image="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop" source="Informe BBVA"
            summary="BBVA Research alerta: la demanda de cobre para vehículos eléctricos y renovables superara la oferta en 2027-2028. Chile y Peru no pueden aumentar produccion al ritmo necesario. El precio podria duplicarse en 3 años."
            impact="No tienes exposición a cobre. Podria ser oportunidad a medio plazo — radar de oportunidades activado."
            sources={["Informe BBVA", "Bloomberg"]}
          />
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portfolio */}
          <BorderCard padding="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Portfolio</h2>
              <span className="text-xs text-green">+2.4% semanal</span>
            </div>
            <MockChart />
            <div className="mt-4">
              <PortfolioPosition ticker="IWDA" name="iShares MSCI World" change={1.8} value="4.230,00" />
              <PortfolioPosition ticker="VUAA" name="Vanguard S&P 500" change={2.1} value="3.150,00" />
              <PortfolioPosition ticker="BRT" name="Brent Crude Oil" change={-3.8} value="1.200,00" />
              <PortfolioPosition ticker="EUNA" name="iShares Euro Gov Bond" change={0.5} value="2.400,00" />
              <PortfolioPosition ticker="SEMI" name="VanEck Semiconductor" change={4.2} value="1.867,32" />
            </div>
          </BorderCard>

          {/* Investor DNA + Learning */}
          <div className="space-y-6">
            <BorderCard padding="p-6">
              <h2 className="font-semibold mb-4">Investor DNA</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Disciplina</span>
                    <span>78%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: "78%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Control emocional</span>
                    <span>65%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: "65%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Diversificación</span>
                    <span>82%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                    <div className="h-full rounded-full bg-green" style={{ width: "82%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Timing</span>
                    <span>54%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                    <div className="h-full rounded-full bg-red" style={{ width: "54%" }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted mt-4">Tendencia: mejorando en disciplina, trabajar en timing de entrada.</p>
            </BorderCard>

            <BorderCard padding="p-6">
              <h2 className="font-semibold mb-3">Última lección aprendida</h2>
              <div className="bg-background rounded-lg p-4 border border-card-border">
                <p className="text-xs text-accent-light mb-2">Hace 3 dias — Venta de BRT</p>
                <p className="text-sm text-muted leading-relaxed">
                  Vendiste parte de Brent tras caida del 2%. Resultado: siguio cayendo un 1.8% adicional.
                  <span className="text-green"> Buena decision.</span> Señal clave que detectaste: volumen de venta institucional inusualmente alto.
                </p>
              </div>
            </BorderCard>
          </div>
        </div>
      </section>

      {/* Radar de Oportunidades */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <h2 className="font-semibold mb-4">Radar de oportunidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Radar visual */}
          <BorderCard padding="p-6" className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Radar circles */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#1e1e2e" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#1e1e2e" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="#1e1e2e" strokeWidth="1" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="#1e1e2e" strokeWidth="0.5" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="#1e1e2e" strokeWidth="0.5" />
                {/* Sweep line */}
                <line x1="100" y1="100" x2="170" y2="40" stroke="#6366f1" strokeWidth="1.5" opacity="0.6">
                  <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite" />
                </line>
                {/* Blips — opportunities */}
                <circle cx="135" cy="55" r="5" fill="#22c55e" opacity="0.9">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="70" r="4" fill="#f59e0b" opacity="0.8">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="120" r="3.5" fill="#6366f1" opacity="0.7">
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <p className="text-xs text-muted mt-2">3 oportunidades detectadas</p>
          </BorderCard>

          {/* Opportunity cards */}
          <div className="md:col-span-2 space-y-3">
            <div className="bg-card border border-green/20 rounded-xl p-4 hover:border-green/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
                  <span className="text-sm font-medium">Cobre — escasez global 2027-2028</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green/15 text-green">Alta convicción</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-2">BBVA Research y Bloomberg alertan: la demanda de cobre para EVs y renovables superara la oferta. Chile y Peru no pueden escalar produccion. El precio podria duplicarse en 3 años.</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Detectado hace 3 dias</span>
                <span className="text-muted">•</span>
                <span className="text-muted">4 fuentes</span>
                <span className="text-muted">•</span>
                <span className="text-green">No mainstream todavia</span>
              </div>
            </div>
            <div className="bg-card border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-medium">India — rotacion de capital tras acuerdo China</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Media convicción</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-2">Los inversores rotan de India a China por el acuerdo. Si India corrige un 10-15%, podria ser punto de entrada histórico para el mercado emergente de mayor crecimiento a largo plazo.</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Detectado hace 1 dia</span>
                <span className="text-muted">•</span>
                <span className="text-muted">2 fuentes</span>
                <span className="text-muted">•</span>
                <span className="text-amber-400">Emergente</span>
              </div>
            </div>
            <div className="bg-card border border-accent/20 rounded-xl p-4 hover:border-accent/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium">Nuclear — renacimiento por demanda IA</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">En observacion</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-2">Los centros de datos de IA necesitan energia limpia y estable. Microsoft, Google y Amazon firman acuerdos con plantas nucleares. ETFs de uranio suben +18% YTD. Tendencia incipiente.</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Detectado hace 5 dias</span>
                <span className="text-muted">•</span>
                <span className="text-muted">3 fuentes</span>
                <span className="text-muted">•</span>
                <span className="text-accent-light">Temprano</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-card-border">
        <h2 className="text-xl font-bold mb-2 text-center">Lo que hace diferente a FinPulse</h2>
        <p className="text-sm text-muted text-center mb-8">No es solo un tracker. Es tu copiloto financiero.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon="&#x1f9ec;" title="Investor DNA" description="Tu perfil psicologico como inversor. Sesgos, fortalezas, debilidades. Evoluciona contigo." />
          <FeatureCard icon="&#x1f4d3;" title="Decision Journal" description="Cada operación se registra con contexto: noticias, sentimiento, recomendación IA. Review automatico." />
          <FeatureCard icon="&#x1f4e1;" title="Signal vs Noise" description="Mide que fuentes te hacen ganar dinero. Elimina el ruido, enfocate en lo que importa." />
          <FeatureCard icon="&#x1f300;" title="Stress Test" description="Simula escenarios históricos contra tu portfolio. Que pasa si se repite 2008? Y 2020?" />
          <FeatureCard icon="&#x1f6e4;&#xfe0f;" title="El camino no tomado" description="Registra oportunidades que descartaste. Ve como habrian ido. Aprende de lo que no hiciste." />
          <FeatureCard icon="&#x1f3af;" title="Conviction Tracker" description="Registra tu nivel de confianza en cada decision. Descubre cuando confiar en tu instinto." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted">
          <span>FinPulse — Aprende mientras inviertes</span>
          <span>En desarrollo</span>
        </div>
      </footer>
    </main>
  );
}
