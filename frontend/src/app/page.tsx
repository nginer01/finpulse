"use client";

import { useState } from "react";
import Link from "next/link";

function PulseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="inline-block">
      <circle cx="16" cy="16" r="14" stroke="#6366f1" strokeWidth="2" opacity="0.3" />
      <circle cx="16" cy="16" r="8" stroke="#6366f1" strokeWidth="2" opacity="0.6" />
      <circle cx="16" cy="16" r="3" fill="#6366f1" />
    </svg>
  );
}

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

function NewsCard({ type, title, tag, delay }: { type: string; title: string; tag: string; delay: string }) {
  const tagColors: Record<string, string> = {
    "Tu portfolio": "bg-accent/20 text-accent-light",
    "Nuevo": "bg-green/20 text-green",
    "Futuro": "bg-amber-500/20 text-amber-400",
  };
  return (
    <div className={`bg-card border border-card-border rounded-xl p-5 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 ${delay}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted uppercase tracking-wider">{type}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${tagColors[tag] || "bg-card-border text-muted"}`}>{tag}</span>
      </div>
      <h3 className="text-sm font-medium leading-snug mb-3">{title}</h3>
      <div className="h-px bg-card-border mb-3" />
      <p className="text-xs text-muted">Click para expandir</p>
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
    <div className="bg-card border border-card-border rounded-xl p-6 hover:border-accent/30 transition-all duration-300">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-card-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PulseIcon />
            <span className="text-lg font-semibold tracking-tight">FinPulse</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <span className="hover:text-foreground cursor-pointer transition-colors">Resumen</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Portfolio</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Aprendizaje</span>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent-light font-medium">NG</div>
          </nav>
        </div>
      </header>

      {/* Hero: Daily Summary */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="animate-fade-in-up">
          <p className="text-muted text-sm mb-1">Domingo, 11 de mayo 2026 — 9:00 AM</p>
          <h1 className="text-2xl font-bold mb-4">Buenos dias, Nico</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in-up-delay">
          <div className="bg-card border border-card-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Portfolio total</p>
            <p className="text-xl font-bold">12.847,32</p>
            <p className="text-xs text-green">+2.4% esta semana</p>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Sentimiento mercado</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-card-border overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-red to-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-400">62</span>
            </div>
            <p className="text-xs text-muted mt-1">Moderadamente optimista</p>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Recomendacion IA</p>
            <p className="text-sm font-medium">Mantener posiciones</p>
            <p className="text-xs text-accent-light">Conviccion: 7/10</p>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Tu Investor DNA</p>
            <p className="text-sm font-medium">Perfil equilibrado</p>
            <p className="text-xs text-muted">Acierto: 68% (mejorando)</p>
          </div>
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
          <div className="bg-background rounded-lg p-4 border border-card-border mb-5">
            <p className="text-xs text-accent-light font-medium uppercase tracking-wider mb-2">Resumen ejecutivo</p>
            <p className="text-sm leading-relaxed">
              Semana clave para los mercados globales. El acuerdo comercial preliminar EEUU-China impulsa a la renta variable global, con el S&P 500 cerrando en maximos historicos (+1.2%) y mercados europeos al alza. Sin embargo, el sector energetico se debilita tras avances en las negociaciones Iran-EEUU, con el Brent cayendo un 4.2% en la semana. El BCE mantiene el tono dovish y Polymarket situa al 73% la probabilidad de recorte en junio.
            </p>
            <p className="text-sm leading-relaxed mt-3">
              <span className="text-green font-medium">Para tu portfolio:</span> balance neto positivo (+2.4%). Tus posiciones en MSCI World y S&P 500 capturan la subida. Tu exposicion a Brent es el punto debil — considera reducirla o cubrir.
              <span className="text-accent-light"> Semiconductores destaca como la mejor posicion (+4.2%) </span> tras el anuncio de Nvidia.
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
                  <span className="text-foreground font-medium">Europa:</span> Stoxx 600 +0.8%. El BCE no ha hablado oficialmente, pero las actas de la ultima reunion filtradas por Financial Times confirman que la mayoria del consejo apoya un recorte de 25pb en junio. El euro se debilita frente al dolar (1.076), lo cual es positivo para exportadoras europeas.
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
                    <p className="text-muted">Se beneficia directamente del rally global. El acuerdo EEUU-China reduce riesgo geopolitico, que era el principal freno para mercados desarrollados. Con el BCE dovish, el componente europeo tambien tira al alza. <span className="text-accent-light">Esta posicion esta en su mejor momento en 3 meses.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">VUAA (Vanguard S&P 500) +2.1%</span></p>
                    <p className="text-muted">Maximos historicos. El acuerdo comercial elimina la incertidumbre que pesaba sobre mega-caps con exposicion a China (Apple, Nvidia, Tesla). Atencion: el VIX en 13.2 indica complacencia extrema — historicamente, niveles sub-14 preceden correcciones del 3-5% en las siguientes 4-6 semanas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-red mt-0.5">&#x25BC;</span>
                  <div>
                    <p><span className="text-foreground font-medium">BRT (Brent Crude Oil) -3.8%</span></p>
                    <p className="text-muted">Las negociaciones Iran-EEUU avanzan mas rapido de lo esperado. Si Iran vuelve al mercado con plena capacidad, se estiman 1.5M barriles/dia adicionales. Esto presionaria al Brent hacia los $68-70. <span className="text-red">Tu posicion pierde 45,60 esta semana. Considerar stop-loss en $72 o reducir exposicion un 50%.</span></p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">EUNA (iShares Euro Gov Bond) +0.5%</span></p>
                    <p className="text-muted">Beneficiado por el tono dovish del BCE. Si se confirma el recorte en junio, esta posicion podria subir un 1-2% adicional. Paul Donovan (UBS) confirma que la inflacion europea no sera problema hasta Q4 2026.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-green mt-0.5">&#x25B2;</span>
                  <div>
                    <p><span className="text-foreground font-medium">SEMI (VanEck Semiconductor) +4.2%</span></p>
                    <p className="text-muted">Mejor posicion de la semana. Nvidia presento la nueva arquitectura Blackwell Ultra y los pedidos anticipados superan expectativas. TSMC confirma aumento de capex del 15%. El sector esta en un ciclo expansivo que podria durar 12-18 meses mas. <span className="text-green">Considerar aumentar posicion en caidas.</span></p>
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
                  <p className="text-muted">Prioridad base: MEDIA. Subida a ALTA por el evento de Nvidia. La nueva arquitectura Blackwell Ultra promete 4x mejor rendimiento en inferencia IA. Esto reconfigura la cadena de valor: TSMC, ASML, Samsung y SK Hynix suben entre 2-6%. Tu posicion en SEMI esta bien posicionada. Proximos catalistas: earnings de TSMC (22 mayo) y guidance de ASML (28 mayo).</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Petroleo y energia</span>
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
                  <p className="text-muted">Recorte BCE junio: <span className="text-green">73%</span> (+8% vs semana pasada). Acuerdo Iran-EEUU antes de agosto: <span className="text-amber-400">58%</span> (+15% vs semana pasada). Recesion EEUU en 2026: <span className="text-green">12%</span> (minimo del ano). S&P 500 sobre 6000 antes de diciembre: <span className="text-amber-400">61%</span>.</p>
                </div>
                <div className="border-l-2 border-zinc-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="@zerohedge" type="x" />
                    <span className="text-xs text-muted">Hilo destacado — sabado</span>
                  </div>
                  <p className="text-muted">Alerta sobre la complacencia del mercado: &quot;VIX en 13 con earnings season terminando y el acuerdo China ya descontado. El proximo catalizador es a la baja, no al alza. Historicamente, VIX sub-14 durante mas de 2 semanas precede correcciones.&quot; <span className="text-accent-light">Dato relevante para tu S&P 500.</span></p>
                </div>
                <div className="border-l-2 border-amber-500/40 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <SourceBadge name="Informe BBVA" type="bank" />
                    <span className="text-xs text-muted">Informe semanal — viernes</span>
                  </div>
                  <p className="text-muted">BBVA Research revisa al alza su prevision de PIB eurozona para 2026: de 1.1% a 1.4%. Mejora perspectivas para exportadoras alemanas y sector financiero europeo. Mantiene prevision de 2 recortes del BCE este ano (junio y septiembre).</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Paralelos historicos" icon="&#x1f4da;">
              <div className="space-y-4 text-sm text-muted">
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-foreground font-medium mb-2">Acuerdo comercial EEUU-China (2019 vs 2026)</p>
                  <p>En diciembre 2019, el acuerdo fase 1 impulso al S&P 500 un +3.2% en las 2 semanas siguientes. Sin embargo, los aranceles clave nunca se eliminaron realmente y el rally se agoto en febrero 2020 (antes del COVID). <span className="text-accent-light">Patron similar: el mercado celebra la reduccion de incertidumbre, pero los detalles importan.</span> Recomendacion: disfrutar el rally pero no perseguirlo — tomar beneficios parciales si sube un +3% adicional.</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-foreground font-medium mb-2">Iran volviendo al mercado (2015-2016)</p>
                  <p>Cuando se firmo el JCPOA en 2015, el Brent cayo de $65 a $45 en 6 meses (-30%). La produccion iraniana aumento en 1M barriles/dia. Arabia Saudi respondio manteniendo su produccion para defender cuota de mercado, lo que intensifico la caida. <span className="text-red">Si el patron se repite, tu posicion en Brent tiene riesgo significativo a la baja.</span> Diferencia clave: en 2026 la demanda global es mayor y la OPEC+ tiene mas disciplina que en 2015.</p>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Recomendaciones de hoy" icon="&#x1f3af;" tag="2 acciones" tagColor="bg-accent/15 text-accent-light">
              <div className="space-y-4 text-sm">
                <div className="bg-background rounded-lg p-4 border border-red/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Reducir Brent un 50%</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">Conviccion: 8/10</span>
                  </div>
                  <p className="text-muted mb-3">Las negociaciones Iran-EEUU, el paralelo historico de 2015, y la falta de reaccion de Arabia Saudi apuntan a mas caidas. Reducir a la mitad para limitar perdidas y mantener exposicion por si la OPEC+ reacciona.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-green mb-1 font-medium">A favor</p>
                      <p className="text-xs text-muted">Paralelo 2015 (Brent -30%). Iran puede anadir 1.5M bbl/dia. Polymarket da 58% a acuerdo. Tu portfolio ya tiene bastante riesgo energy.</p>
                    </div>
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-red mb-1 font-medium">En contra</p>
                      <p className="text-xs text-muted">La OPEC+ tiene mas disciplina hoy. La demanda global crece. Arabia Saudi podria recortar produccion. El acuerdo puede retrasarse meses.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-green/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Anadir SEMI en caidas (si baja &gt;2%)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">Conviccion: 7/10</span>
                  </div>
                  <p className="text-muted mb-3">El ciclo de semiconductores es expansivo (12-18 meses). Nvidia Blackwell Ultra confirma la demanda. TSMC aumenta capex. Pero el sector ya ha subido mucho — esperar una caida para comprar con mejor riesgo/recompensa.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-green mb-1 font-medium">A favor</p>
                      <p className="text-xs text-muted">Ciclo expansivo confirmado. Demanda IA insaciable. Capex TSMC +15%. Tu posicion actual es pequena (14% del portfolio).</p>
                    </div>
                    <div className="bg-card rounded p-3 border border-card-border">
                      <p className="text-xs text-red mb-1 font-medium">En contra</p>
                      <p className="text-xs text-muted">Sector ya +25% YTD. Aranceles tech EEUU-China aun no resueltos (Matt Levine). Valoraciones estiradas (P/E sector en 32x).</p>
                    </div>
                  </div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Alertas y proximos eventos" icon="&#x26a0;&#xfe0f;" tag="3 alertas" tagColor="bg-red/15 text-red">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-red mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-foreground font-medium">VIX en zona de complacencia (13.2)</p>
                    <p className="text-muted">Historicamente, VIX sub-14 durante +2 semanas precede correcciones del 3-5%. No vender, pero no anadir riesgo agresivamente. Tu S&P 500 es la posicion mas expuesta.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-foreground font-medium">Brent — vigilar nivel $72</p>
                    <p className="text-muted">Si rompe los $72 a la baja, el siguiente soporte esta en $68. Considerar stop-loss o reduccion de posicion antes de esa ruptura.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent-light mt-0.5">&#x25CF;</span>
                  <div>
                    <p className="text-foreground font-medium">Proximos eventos clave</p>
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
        <div className="grid grid-cols-3 gap-4">
          <NewsCard type="Interes personal" title="Acuerdo comercial EEUU-China: impacto en ETFs globales y tu posicion en MSCI World" tag="Tu portfolio" delay="animate-fade-in-up" />
          <NewsCard type="Interes personal" title="Negociaciones Iran-EEUU avanzan: Brent cae 4% en la semana" tag="Tu portfolio" delay="animate-fade-in-up-delay" />
          <NewsCard type="Informacion nueva" title="Nvidia presenta nueva arquitectura Blackwell Ultra: el mercado de semiconductores se reconfigura" tag="Nuevo" delay="animate-fade-in-up-delay-2" />
          <NewsCard type="Informacion nueva" title="India supera a China como mayor mercado emergente por flujo de capitales" tag="Nuevo" delay="animate-fade-in-up" />
          <NewsCard type="Vision futura" title="Regulacion IA en Europa: nuevo marco legal podria impactar al sector tech en 2027" tag="Futuro" delay="animate-fade-in-up-delay" />
          <NewsCard type="Vision futura" title="Escasez global de cobre: la proxima crisis silenciosa para la transicion energetica" tag="Futuro" delay="animate-fade-in-up-delay-2" />
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Portfolio */}
          <div className="bg-card border border-card-border rounded-xl p-6">
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
          </div>

          {/* Investor DNA + Learning */}
          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-xl p-6">
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
                    <span className="text-muted">Diversificacion</span>
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
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">Ultima leccion aprendida</h2>
              <div className="bg-background rounded-lg p-4 border border-card-border">
                <p className="text-xs text-accent-light mb-2">Hace 3 dias — Venta de BRT</p>
                <p className="text-sm text-muted leading-relaxed">
                  Vendiste parte de Brent tras caida del 2%. Resultado: siguio cayendo un 1.8% adicional.
                  <span className="text-green"> Buena decision.</span> Senal clave que detectaste: volumen de venta institucional inusualmente alto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-card-border">
        <h2 className="text-xl font-bold mb-2 text-center">Lo que hace diferente a FinPulse</h2>
        <p className="text-sm text-muted text-center mb-8">No es solo un tracker. Es tu copiloto financiero.</p>
        <div className="grid grid-cols-3 gap-4">
          <FeatureCard icon="&#x1f9ec;" title="Investor DNA" description="Tu perfil psicologico como inversor. Sesgos, fortalezas, debilidades. Evoluciona contigo." />
          <FeatureCard icon="&#x1f4d3;" title="Decision Journal" description="Cada operacion se registra con contexto: noticias, sentimiento, recomendacion IA. Review automatico." />
          <FeatureCard icon="&#x1f4e1;" title="Signal vs Noise" description="Mide que fuentes te hacen ganar dinero. Elimina el ruido, enfocate en lo que importa." />
          <FeatureCard icon="&#x1f300;" title="Stress Test" description="Simula escenarios historicos contra tu portfolio. Que pasa si se repite 2008? Y 2020?" />
          <FeatureCard icon="&#x1f6e4;&#xfe0f;" title="El camino no tomado" description="Registra oportunidades que descartaste. Ve como habrian ido. Aprende de lo que no hiciste." />
          <FeatureCard icon="&#x1f3af;" title="Conviction Tracker" description="Registra tu nivel de confianza en cada decision. Descubre cuando confiar en tu instinto." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <PulseIcon />
            <span>FinPulse — Aprende mientras inviertes</span>
          </div>
          <span>En desarrollo</span>
        </div>
      </footer>
    </main>
  );
}
