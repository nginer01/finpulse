import Link from "next/link";
import ScrollProgress from "@/components/ScrollProgress";
import BorderCard from "@/components/BorderCard";

function SourceBadge({ name, type }: { name: string; type: string }) {
  const colors: Record<string, string> = {
    newsletter: "bg-blue-500/15 text-blue-400",
    podcast: "bg-purple-500/15 text-purple-400",
    polymarket: "bg-emerald-500/15 text-emerald-400",
    x: "bg-zinc-500/15 text-zinc-400",
    bank: "bg-amber-500/15 text-[#ffd60a]",
    news: "bg-rose-500/15 text-rose-400",
    finpulse: "bg-accent/15 text-accent-light",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[type] || "bg-card-border text-muted"}`}>{name}</span>
  );
}

export default function ResumenSemanalCompleto() {
  return (
    <main className="min-h-screen">
      <ScrollProgress />

      {/* Hero */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1400&h=500&fit=crop"
          alt="Mercados financieros"
          className="w-full h-72 sm:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-3xl mx-auto px-6 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-3 py-1 rounded-full bg-accent/25 text-accent-light font-medium">Resumen Semanal</span>
              <span className="text-xs text-muted">12 mayo 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight leading-[1.15] mb-3">La semana que cambio el tablero: acuerdo China, Nvidia, y un mercado en máximos</h1>
            <p className="text-muted text-sm">87 noticias procesadas — 14 fuentes — Tiempo de lectura: ~12 min</p>
          </div>
        </div>
      </div>

      {/* Article body — newspaper column style */}
      <article className="max-w-3xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <Link href="/semanal" className="mb-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al resumen semanal
        </Link>

        {/* Lead paragraph */}
        <p className="text-lg leading-8 mb-8">
          Ha sido, sin exagerar, una de las semanas mas importantes del año para los mercados globales. Dos eventos de gran calado convergieron en apenas 48 horas: el anuncio de la arquitectura Blackwell Ultra de Nvidia y la confirmacion del acuerdo comercial fase 1 entre Estados Unidos y China. El resultado: el S&P 500 cerrando en máximos históricos, tu portfolio subiendo un <span className="text-green font-semibold">+2.4%</span>, y una lección valiosa sobre el timing de las decisiones.
        </p>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3 my-10 py-6 border-y border-card-border">
          <div className="text-center">
            <p className="text-2xl font-extralight tracking-tight text-green">+2.4%</p>
            <p className="text-xs text-muted">Tu portfolio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extralight tracking-tight">5.847</p>
            <p className="text-xs text-muted">S&P 500 (max)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extralight tracking-tight text-[#ffd60a]">13.2</p>
            <p className="text-xs text-muted">VIX (complacencia)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extralight tracking-tight text-accent-light">72/100</p>
            <p className="text-xs text-muted">Tu score aprendizaje</p>
          </div>
        </div>

        {/* Section 1 */}
        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">El lunes arranco con un susurro</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          Los primeros rumores de un posible acuerdo comercial entre Washington y Pekin empezaron a circular el domingo por la noche en circulos diplomaticos asiaticos. Para cuando abrio Wall Street el lunes, el S&P 500 ya descontaba parte de la noticia con una subida del 0.4%. Tu posición en IWDA capturo el movimiento inmediatamente — es la ventaja de tener exposición global diversificada.
        </p>
        <p className="text-sm text-muted leading-7 mb-4">
          Pero el verdadero catalizador del lunes no fue China, sino algo mucho mas sutil: los flujos de capital. Segun datos de EPFR que recoge The Daily Shot, los ETFs de renta variable global recibieron $12.800 millones en la semana — el mayor flujo desde enero. El dinero institucional estaba posicionandose antes del anuncio oficial.
        </p>

        {/* Pull quote */}
        <blockquote className="border-l-4 border-accent pl-6 py-4 my-8">
          <p className="text-base italic leading-relaxed">&ldquo;Los mercados celebran la reduccion de incertidumbre, no los terminos especificos del acuerdo. Es un acuerdo para seguir negociando, que es mejor que no tener acuerdo.&rdquo;</p>
          <footer className="mt-3 flex items-center gap-2">
            <SourceBadge name="Matt Levine" type="newsletter" />
            <span className="text-xs text-muted">Money Stuff, viernes</span>
          </footer>
        </blockquote>

        {/* Image break */}
        <figure className="my-10 -mx-6 sm:mx-0">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&h=400&fit=crop"
            alt="Trading floor"
            className="w-full h-56 sm:h-72 object-cover rounded-none sm:rounded-xl"
          />
          <figcaption className="text-xs text-muted mt-2 px-6 sm:px-0">Wall Street cerro la semana en máximos históricos tras el acuerdo comercial. Foto: Financial Times</figcaption>
        </figure>

        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">Nvidia encendio la mecha el miercoles</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          Si el acuerdo comercial fue el evento macro de la semana, el anuncio de Nvidia fue el evento sectorial. La presentacion de Blackwell Ultra el miercoles no fue una mejora incremental — fue un salto generacional. Rendimiento 4x superior en inferencia de IA. Los hyperscalers (Amazon, Google, Microsoft) confirmaron pedidos masivos antes de que Jensen Huang bajara del escenario.
        </p>
        <p className="text-sm text-muted leading-7 mb-4">
          Tu posición en SEMI (VanEck Semiconductor) fue la gran beneficiada: <span className="text-green font-semibold">+4.2% en la semana</span>, la mejor de tu portfolio. Pero lo mas interesante no es el rendimiento en si, sino la decisión que tomaste: compraste SEMI el 2 de mayo, cinco dias antes del evento, con una convicción de 7/10. Tu tesis era que el ciclo de semiconductores se estaba acelerando. Los datos te dieron la razon.
        </p>

        {/* Inline chart — portfolio week performance */}
        <BorderCard padding="p-5" className="my-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Rendimiento de tu portfolio esta semana</span>
            <span className="text-xs text-green font-medium">+2.4%</span>
          </div>
          <svg viewBox="0 0 600 120" className="w-full h-28" preserveAspectRatio="none">
            <defs>
              <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#30d158" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#30d158" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid */}
            <line x1="0" y1="30" x2="600" y2="30" stroke="#2d2d2d" strokeWidth="0.5" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="#2d2d2d" strokeWidth="0.5" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="#2d2d2d" strokeWidth="0.5" />
            {/* Area */}
            <polygon points="0,120 0,80 100,85 200,70 300,55 400,75 500,40 600,30 600,120" fill="url(#weekGrad)" />
            <polyline points="0,80 100,85 200,70 300,55 400,75 500,40 600,30" fill="none" stroke="#30d158" strokeWidth="2" />
            {/* Event markers */}
            <circle cx="100" cy="85" r="4" fill="#86868b" />
            <circle cx="200" cy="70" r="5" fill="#30d158" />
            <circle cx="300" cy="55" r="4" fill="#30d158" />
            <circle cx="400" cy="75" r="4" fill="#ff453a" />
            <circle cx="500" cy="40" r="5" fill="#30d158" />
            <circle cx="600" cy="30" r="4" fill="#f5f5f7" />
          </svg>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>Lun 5</span>
            <span>Mar 6</span>
            <span>Mie 7</span>
            <span>Jue 8</span>
            <span>Vie 9</span>
            <span>Dom 11</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green" /> Nvidia / Acuerdo China</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red" /> Venta BRT</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted" /> IPC neutral</span>
          </div>
        </BorderCard>

        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">La decisión de la semana: vender Brent</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          El jueves por la mañana, Financial Times publico las actas filtradas del BCE. Pero tu atención estaba en otro sitio: las negociaciones entre Iran y Estados Unidos avanzaban mas rapido de lo esperado. El secretario de Estado confirmo &ldquo;avances significativos&rdquo; — el lenguaje mas positivo hasta la fecha.
        </p>
        <p className="text-sm text-muted leading-7 mb-4">
          Tomaste la decisión de vender el 50% de tu posición en Brent a $76.20. Tu convicción era alta (8/10) y tu tesis clara: si Iran vuelve al mercado con plena capacidad, el petróleo caera significativamente. <span className="text-green font-semibold">Resultado: el Brent cerro la semana en $74.30, cayendo un 1.8% adicional despues de tu venta.</span> Fue una buena decision.
        </p>

        {/* Decision card */}
        <div className="bg-card border border-green/20 rounded-xl p-5 my-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green/15 flex items-center justify-center text-green text-lg">&#10003;</div>
              <div>
                <p className="text-sm font-semibold">Venta parcial BRT — Score: 9/10</p>
                <p className="text-xs text-muted">8 mayo — Convicción: 8/10</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-green/15 text-green font-medium">Buena decision</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Lo que hizo esta decisión especialmente buena: detectaste el volumen de venta institucional antes de que la noticia se reflejara en el precio. Hace dos meses, habrias mantenido la posición por miedo a vender demasiado pronto. Tu timing esta mejorando.
          </p>
        </div>

        <figure className="my-10 -mx-6 sm:mx-0">
          <img
            src="https://images.unsplash.com/photo-1513828583688-c52646db42da?w=900&h=400&fit=crop"
            alt="Oil refinery"
            className="w-full h-56 sm:h-72 object-cover rounded-none sm:rounded-xl"
          />
          <figcaption className="text-xs text-muted mt-2 px-6 sm:px-0">Las negociaciones Iran-EEUU presionan al sector energetico. El Brent cae un 4.2% en la semana. Foto: Reuters</figcaption>
        </figure>

        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">Lo que dicen las fuentes clave</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          Paul Donovan, economista jefe de UBS, dedico su podcast del domingo a analizar el acuerdo comercial. Su lectura es cauta pero constructiva: celebra la reduccion de incertidumbre, pero advierte que los aranceles tecnologicos — semiconductores, IA, datos — se negociaran por separado en el tercer trimestre. Para tu posición en SEMI, esto es un matiz relevante que Matt Levine tambien destaca en su newsletter del viernes.
        </p>

        <blockquote className="border-l-4 border-purple-500/40 pl-6 py-4 my-8">
          <p className="text-base italic leading-relaxed">&ldquo;La inflacion europea esta contenida. Los datos de salarios del Q1 confirman que no hay presion alcista significativa. El BCE tiene via libre para recortar en junio sin arriesgar su credibilidad.&rdquo;</p>
          <footer className="mt-3 flex items-center gap-2">
            <SourceBadge name="UBS On-Air" type="podcast" />
            <span className="text-xs text-muted">Paul Donovan, domingo</span>
          </footer>
        </blockquote>

        <p className="text-sm text-muted leading-7 mb-4">
          Polymarket, por su parte, sigue siendo la fuente mas fiable para medir expectativas. Esta semana ha movido tres indicadores importantes: la probabilidad de recorte del BCE en junio sube al 73% (+8 puntos), la de acuerdo Iran-EEUU antes de agosto al 58% (+15 puntos), y la de recesion en EEUU baja al 12%, mínimo del año. Los tres movimientos son consistentes con un escenario de &ldquo;goldilocks&rdquo; — ni demasiado caliente, ni demasiado frio.
        </p>

        {/* Polymarket data */}
        <BorderCard padding="p-5" className="my-8">
          <div className="flex items-center gap-2 mb-4">
            <SourceBadge name="Polymarket" type="polymarket" />
            <span className="text-xs text-muted">Datos de la semana</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Recorte BCE junio</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-card-border overflow-hidden">
                  <div className="h-full rounded-full bg-green" style={{ width: "73%" }} />
                </div>
                <span className="text-sm text-green font-medium w-12 text-right">73%</span>
                <span className="text-xs text-green">+8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Acuerdo Iran antes agosto</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-card-border overflow-hidden">
                  <div className="h-full rounded-full bg-[#ffd60a]" style={{ width: "58%" }} />
                </div>
                <span className="text-sm text-[#ffd60a] font-medium w-12 text-right">58%</span>
                <span className="text-xs text-green">+15</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Recesion EEUU 2026</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-card-border overflow-hidden">
                  <div className="h-full rounded-full bg-green" style={{ width: "12%" }} />
                </div>
                <span className="text-sm text-green font-medium w-12 text-right">12%</span>
                <span className="text-xs text-green">-3</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">S&P sobre 6.000 antes dic</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-card-border overflow-hidden">
                  <div className="h-full rounded-full bg-[#ffd60a]" style={{ width: "61%" }} />
                </div>
                <span className="text-sm text-[#ffd60a] font-medium w-12 text-right">61%</span>
                <span className="text-xs text-green">+5</span>
              </div>
            </div>
          </div>
        </BorderCard>

        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">La señal de precaucion que no debes ignorar</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          Con todo lo positivo de la semana, hay un dato que merece atención: el VIX cerro en 13.2, niveles de complacencia no vistos desde enero de 2024. Tanto The Daily Shot como @zerohedge coinciden en la misma señal: cuando el VIX se mantiene por debajo de 14 durante mas de dos semanas, el S&P 500 sufre una correccion media del 4.2% en las siguientes seis semanas. Ya llevamos ocho sesiones.
        </p>
        <p className="text-sm text-muted leading-7 mb-4">
          Esto no significa que debas vender. @sentimentrader aporta un matiz importante: su indicador compuesto de sentimiento esta en &ldquo;optimismo elevado&rdquo; pero no extremo. Históricamente, este nivel produce retornos mediocres a un mes (+0.3%) pero buenos a tres meses (+4.2%). <span className="text-[#ffd60a] font-semibold">La traduccion practica: no es momento de comprar agresivamente, pero tampoco de vender.</span>
        </p>

        <figure className="my-10 -mx-6 sm:mx-0">
          <img
            src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=900&h=400&fit=crop"
            alt="Market analysis"
            className="w-full h-56 sm:h-72 object-cover rounded-none sm:rounded-xl"
          />
          <figcaption className="text-xs text-muted mt-2 px-6 sm:px-0">El VIX en zona de complacencia: una señal que históricamente precede correcciones moderadas. Fuente: The Daily Shot</figcaption>
        </figure>

        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">Tu evolucion como inversor</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          Esta semana tu score de aprendizaje sube a 72/100, cinco puntos mas que la semana anterior. El mayor avance esta en disciplina (78%, +4) y en timing (54%, +3). La venta de Brent es el ejemplo perfecto: hace tres meses habrias dudado, habrias esperado &ldquo;un poco mas&rdquo;, y habrias visto como la caida se comia tus beneficios. Esta vez actuaste con decision, basandote en datos (volumen institucional, Polymarket, paralelo histórico 2015).
        </p>

        {/* Investor DNA mini */}
        <BorderCard padding="p-5" className="my-8">
          <p className="text-sm font-semibold mb-4">Investor DNA — esta semana vs anterior</p>
          <div className="space-y-3">
            {[
              { name: "Disciplina", now: 78, prev: 74, color: "#f5f5f7" },
              { name: "Control emocional", now: 65, prev: 62, color: "#f59e0b" },
              { name: "Diversificación", now: 82, prev: 82, color: "#30d158" },
              { name: "Timing", now: 54, prev: 51, color: "#ff453a" },
            ].map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{t.name}</span>
                  <span className="text-foreground">{t.now}% <span className="text-green text-[10px]">(+{t.now - t.prev})</span></span>
                </div>
                <div className="relative h-2 rounded-full bg-card-border overflow-hidden">
                  <div className="absolute h-full rounded-full opacity-30" style={{ width: `${t.prev}%`, backgroundColor: t.color }} />
                  <div className="absolute h-full rounded-full" style={{ width: `${t.now}%`, backgroundColor: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </BorderCard>

        <p className="text-sm text-muted leading-7 mb-4">
          El area que mas necesita trabajo sigue siendo el control emocional (65%). La compra de VUAA el 15 de abril con convicción 5/10 es el ejemplo: fue una compra por FOMO, y aunque ha subido un 2.1%, el proceso de decisión no fue el correcto. Tus compras con convicción menor a 6 pierden dinero el 60% de las veces. Esta vez tuviste suerte, pero la estadistica no esta a tu favor.
        </p>

        <h2 className="text-2xl sm:text-3xl font-extralight tracking-wide mt-12 mb-6">La semana que viene</h2>

        <p className="text-sm text-muted leading-7 mb-4">
          Hay cuatro eventos que pueden mover tu portfolio significativamente. El martes 13 sale el IPC de Estados Unidos — si sorprende al alza, el rally se frena. El 22 de mayo, earnings de TSMC: si confirman el aumento de capex del 15%, tu posición en SEMI tiene mas recorrido. El 30 de mayo, dato de inflacion eurozona — el último antes de la reunion del BCE del 5 de junio, donde se decidira si recortan tipos.
        </p>
        <p className="text-sm text-muted leading-7 mb-4">
          Y en el fondo, la pregunta que define las próximas semanas: <span className="text-accent-light font-semibold">&iquest;ha descontado ya el mercado todo lo bueno, o queda mas recorrido?</span> Matt Levine diria que el mercado celebra la reduccion de incertidumbre, no los terminos. @zerohedge diria que el próximo catalizador es a la baja. La verdad, como siempre, estara en algun punto intermedio.
        </p>

        {/* Calendar */}
        <BorderCard padding="p-5" className="my-8">
          <p className="text-sm font-semibold mb-4">Calendario — próxima semana</p>
          <div className="space-y-3">
            {[
              { date: "Mar 13", event: "IPC EEUU", impact: "Puede frenar el rally si sale alto", priority: "alta" },
              { date: "Jue 22", event: "Earnings TSMC", impact: "Clave para tu posición en SEMI", priority: "alta" },
              { date: "Vie 30", event: "Inflacion eurozona", impact: "Ultimo dato antes del BCE", priority: "media" },
              { date: "Dom 1 jun", event: "Reunion OPEC+", impact: "Reaccion de Arabia Saudi a Iran", priority: "alta" },
              { date: "Jue 5 jun", event: "Reunion BCE", impact: "Decision sobre recorte de tipos", priority: "alta" },
            ].map((e) => (
              <div key={e.date} className="flex items-center gap-4 text-sm">
                <span className="font-mono text-xs text-foreground w-20 shrink-0">{e.date}</span>
                <span className="font-medium w-40 shrink-0">{e.event}</span>
                <span className="text-muted text-xs flex-1">{e.impact}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  e.priority === "alta" ? "bg-red/15 text-red" : "bg-amber-500/15 text-[#ffd60a]"
                }`}>{e.priority}</span>
              </div>
            ))}
          </div>
        </BorderCard>

        {/* Closing */}
        <div className="border-t border-card-border pt-10 mt-12">
          <p className="text-sm text-muted leading-7 mb-6">
            Esta semana te deja con un portfolio mas fuerte (+2.4%), una lección aprendida sobre timing, y tres oportunidades en el radar (cobre, India, nuclear) que podrian definir los próximos meses. El score de aprendizaje sube a 72. La tendencia es clara: estas mejorando como inversor. La clave ahora es no dejar que la euforia del mercado te haga bajar la guardia.
          </p>

          {/* Sources used */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-xs text-muted mr-2">Fuentes:</span>
            <SourceBadge name="UBS On-Air" type="podcast" />
            <SourceBadge name="Matt Levine" type="newsletter" />
            <SourceBadge name="The Daily Shot" type="newsletter" />
            <SourceBadge name="Polymarket" type="polymarket" />
            <SourceBadge name="@zerohedge" type="x" />
            <SourceBadge name="@sentimentrader" type="x" />
            <SourceBadge name="Informe BBVA" type="bank" />
            <SourceBadge name="Financial Times" type="news" />
            <SourceBadge name="Reuters" type="news" />
            <SourceBadge name="Bloomberg" type="news" />
            <SourceBadge name="FinPulse IA" type="finpulse" />
          </div>

          <p className="text-xs text-muted text-center">Resumen generado el 12 de mayo de 2026 — 87 noticias analizadas — 14 fuentes</p>

          <div className="text-center mt-6">
            <Link href="/semanal" className="text-sm text-accent-light hover:text-accent transition-colors">
              ← Volver al resumen semanal
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
