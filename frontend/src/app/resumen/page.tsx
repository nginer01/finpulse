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

function SourceBadge({ name, type }: { name: string; type: string }) {
  const colors: Record<string, string> = {
    newsletter: "bg-blue-500/15 text-blue-400",
    podcast: "bg-purple-500/15 text-purple-400",
    polymarket: "bg-emerald-500/15 text-emerald-400",
    x: "bg-zinc-500/15 text-zinc-400",
    bank: "bg-amber-500/15 text-amber-400",
    news: "bg-rose-500/15 text-rose-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[type] || "bg-card-border text-muted"}`}>{name}</span>
  );
}

function SectionDivider() {
  return <div className="h-px bg-card-border my-10" />;
}

export default function ResumenDiario() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-card-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PulseIcon />
            <span className="text-lg font-semibold tracking-tight">FinPulse</span>
          </Link>
          <span className="text-xs text-muted">Resumen diario completo</span>
        </div>
      </header>

      {/* Reading progress indicator */}
      <div className="max-w-3xl mx-auto px-6">

        {/* Hero image */}
        <div className="relative rounded-xl overflow-hidden mt-8 mb-6">
          <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=400&fit=crop" alt="Mercados globales" className="w-full h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-muted text-sm mb-1">Domingo, 11 de mayo 2026 — 9:00 AM</p>
            <h1 className="text-3xl font-bold">Resumen diario</h1>
          </div>
        </div>

        {/* Title block */}
        <div className="pb-8 border-b border-card-border">
          <p className="text-muted text-sm mb-4">14 fuentes procesadas — Tiempo de lectura: ~8 min</p>
          <div className="flex flex-wrap gap-2">
            <SourceBadge name="UBS On-Air" type="podcast" />
            <SourceBadge name="Matt Levine" type="newsletter" />
            <SourceBadge name="The Daily Shot" type="newsletter" />
            <SourceBadge name="Polymarket" type="polymarket" />
            <SourceBadge name="@zerohedge" type="x" />
            <SourceBadge name="@sentimentrader" type="x" />
            <SourceBadge name="Informe BBVA" type="bank" />
            <SourceBadge name="Financial Times" type="news" />
          </div>
        </div>

        {/* Quick status bar */}
        <div className="grid grid-cols-4 gap-3 py-6 border-b border-card-border">
          <div>
            <p className="text-xs text-muted">Portfolio</p>
            <p className="text-lg font-bold">12.847,32</p>
            <p className="text-xs text-green">+2.4%</p>
          </div>
          <div>
            <p className="text-xs text-muted">Sentimiento</p>
            <p className="text-lg font-bold text-amber-400">62/100</p>
            <p className="text-xs text-muted">Optimismo moderado</p>
          </div>
          <div>
            <p className="text-xs text-muted">Recomendacion</p>
            <p className="text-lg font-bold">Mantener</p>
            <p className="text-xs text-accent-light">Conviccion 7/10</p>
          </div>
          <div>
            <p className="text-xs text-muted">Alertas</p>
            <p className="text-lg font-bold text-red">3</p>
            <p className="text-xs text-muted">1 critica, 2 moderadas</p>
          </div>
        </div>

        {/* === BODY === */}

        {/* 1. Lo esencial */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=250&fit=crop" alt="Trading floor" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Lo esencial</h2>
              <p className="text-xs text-muted">Financial Times / Bloomberg</p>
            </div>
          </div>
          <div className="text-sm leading-7 text-muted space-y-4">
            <p>
              Semana clave para los mercados globales. El acuerdo comercial preliminar entre EEUU y China impulsa la renta variable mundial, con el <span className="text-foreground font-medium">S&P 500 cerrando en maximos historicos (+1.2%)</span> y los mercados europeos y asiaticos al alza. Es la primera senal concreta de distension comercial desde que se reiniciaron los aranceles a principios de ano, y los mercados lo celebran con volumen.
            </p>
            <p>
              Sin embargo, no todo es positivo. El <span className="text-red font-medium">sector energetico se debilita significativamente</span> tras los avances en las negociaciones entre Iran y EEUU. El Brent cae un 4.2% en la semana hasta los $74.30 — si Iran vuelve al mercado con plena capacidad, se estiman entre 1 y 1.5 millones de barriles diarios adicionales que presionarian los precios hacia los $68-70.
            </p>
            <p>
              En Europa, el BCE mantiene un tono claramente dovish. Las actas filtradas por Financial Times confirman que la mayoria del consejo apoya un <span className="text-green font-medium">recorte de 25 puntos basicos en junio</span>. Polymarket lo cifra al 73%, ocho puntos mas que la semana pasada. Esto es directamente favorable para bonos europeos y para el componente europeo de tu MSCI World.
            </p>
            <p className="bg-card border border-card-border rounded-lg p-4 text-foreground">
              <span className="font-medium">Balance para tu portfolio:</span> neto positivo (+2.4% semanal). Tus posiciones en MSCI World, S&P 500 y semiconductores capturan la subida. El unico punto debil es tu exposicion a Brent, que pierde 45,60 esta semana y podria seguir cayendo. Semiconductores es tu mejor posicion (+4.2%) tras el evento de Nvidia.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* 2. Mercados en detalle */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&h=250&fit=crop" alt="Stock market screens" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Mercados en detalle</h2>
              <p className="text-xs text-muted">The Daily Shot / Reuters</p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-7 text-muted">
            <div>
              <h3 className="text-foreground font-semibold text-base mb-3">Estados Unidos</h3>
              <p>
                El S&P 500 cerro el viernes en 5.847 puntos (+1.2%), impulsado por el anuncio del acuerdo comercial fase 1 con China. Las mega-caps tecnologicas lideraron el rally — Apple +2.4%, Nvidia +5.1%, Microsoft +1.8%. El Nasdaq subio un +1.8% con semiconductores como sector estrella de la semana.
              </p>
              <p className="mt-3">
                Los futuros apuntan a apertura plana el lunes. El mercado ya ha descontado gran parte de la noticia — como apunta Matt Levine, <span className="text-accent-light">&quot;los mercados celebran la reduccion de incertidumbre, no los terminos especificos del acuerdo&quot;</span>. La letra pequena muestra que los aranceles a semiconductores e inteligencia artificial se negociaran por separado en Q3.
              </p>
              <p className="mt-3">
                <span className="text-amber-400 font-medium">Senal de precaucion:</span> El VIX cayo a 13.2, niveles de complacencia no vistos desde enero 2024. @zerohedge advierte en un hilo muy compartido: &quot;VIX sub-14 durante mas de 2 semanas historicamente precede correcciones del 3-5% en las siguientes 4-6 semanas.&quot; No es momento de entrar agresivamente.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold text-base mb-3">Europa</h3>
              <p>
                Stoxx 600 +0.8% en la semana. El motor no es solo el acuerdo comercial sino las expectativas de recorte del BCE. Las actas de la ultima reunion, filtradas por Financial Times el jueves, confirman que una mayoria amplia del consejo de gobierno apoya un recorte de 25 puntos basicos en la reunion del 5 de junio.
              </p>
              <p className="mt-3">
                El euro se debilita frente al dolar hasta 1.076, lo cual es positivo para exportadoras europeas — especialmente alemanas, donde el DAX sube un +1.1%. El Bund aleman cae a 2.31% de rentabilidad, confirmando que el mercado de renta fija tambien descuenta el recorte.
              </p>
              <p className="mt-3">
                Paul Donovan en el UBS On-Air de hoy: <span className="text-accent-light">&quot;La inflacion europea esta contenida. Los datos de salarios del Q1 confirman que no hay presion alcista significativa. El BCE tiene via libre para recortar en junio sin arriesgar su credibilidad.&quot;</span> Tambien advierte que el acuerdo EEUU-China es &quot;fase 1 — los aranceles tech siguen sobre la mesa.&quot;
              </p>
              <p className="mt-3">
                BBVA Research revisa al alza su prevision de PIB eurozona para 2026: de 1.1% a 1.4%. Mantiene prevision de 2 recortes del BCE este ano (junio y septiembre).
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold text-base mb-3">Asia</h3>
              <p>
                Nikkei +1.5%, beneficiado por un yen debil que favorece a las exportadoras japonesas. Toyota y Sony lideran las subidas. El Shanghai Composite sube un +2.3% celebrando el acuerdo comercial — es el mayor beneficiario directo de la reduccion de tensiones.
              </p>
              <p className="mt-3">
                Dato interesante: India (Nifty 50) cierra plana. Despues de meses de outperformance frente a China, los inversores empiezan a rotar capital de India hacia China aprovechando el acuerdo. Esto podria ser el inicio de un cambio de liderazgo entre mercados emergentes que vale la pena vigilar.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold text-base mb-3">Renta fija y divisas</h3>
              <p>
                Treasury 10Y en 4.28% (-5 puntos basicos en la semana). La curva de tipos se normaliza gradualmente — la inversion que persistia desde 2023 practicamente ha desaparecido, lo cual reduce las senales de recesion. Polymarket situa la probabilidad de recesion en EEUU en 2026 en solo el 12%, minimo del ano.
              </p>
              <p className="mt-3">
                El dolar se fortalece (DXY 104.8) por el diferencial de tipos con Europa. Esto presiona ligeramente a las commodities denominadas en dolares — otro factor negativo para el petroleo.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 3. Tu portfolio hoy */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=250&fit=crop" alt="Portfolio charts" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Tu portfolio hoy</h2>
              <p className="text-xs text-muted">Datos de mercado en tiempo real</p>
            </div>
          </div>
          <div className="space-y-6 text-sm leading-7">

            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-sm font-mono text-accent-light">IW</div>
                  <div>
                    <p className="font-medium">IWDA — iShares MSCI World</p>
                    <p className="text-xs text-muted">4.230,00 — 32.9% del portfolio</p>
                  </div>
                </div>
                <span className="text-green font-medium">+1.8%</span>
              </div>
              <p className="text-muted">
                Se beneficia directamente del rally global. El acuerdo EEUU-China reduce el riesgo geopolitico que era el principal freno para mercados desarrollados. Con el BCE dovish, el componente europeo tambien tira al alza. Esta posicion esta en su mejor momento en 3 meses. Continua siendo el nucleo solido de tu portfolio — no requiere accion.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-sm font-mono text-accent-light">VU</div>
                  <div>
                    <p className="font-medium">VUAA — Vanguard S&P 500</p>
                    <p className="text-xs text-muted">3.150,00 — 24.5% del portfolio</p>
                  </div>
                </div>
                <span className="text-green font-medium">+2.1%</span>
              </div>
              <p className="text-muted">
                Maximos historicos. El acuerdo comercial elimina la incertidumbre que pesaba sobre mega-caps con exposicion a China (Apple, Nvidia, Tesla). <span className="text-amber-400">Atencion: el VIX en 13.2 indica complacencia extrema — historicamente, niveles sub-14 preceden correcciones del 3-5% en las siguientes 4-6 semanas.</span> No vender, pero tampoco anadir aqui ahora. Dejar correr.
              </p>
            </div>

            <div className="bg-card border border-red/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red/10 flex items-center justify-center text-sm font-mono text-red">BR</div>
                  <div>
                    <p className="font-medium">BRT — Brent Crude Oil</p>
                    <p className="text-xs text-muted">1.200,00 — 9.3% del portfolio</p>
                  </div>
                </div>
                <span className="text-red font-medium">-3.8%</span>
              </div>
              <p className="text-muted">
                La posicion mas problematica esta semana. Las negociaciones Iran-EEUU avanzan mas rapido de lo esperado. Si Iran vuelve al mercado con plena capacidad, se estiman 1.5 millones de barriles diarios adicionales que presionarian al Brent hacia los $68-70.
              </p>
              <p className="text-muted mt-3">
                <span className="text-red font-medium">Perdida esta semana: -45,60.</span> Arabia Saudi aun no ha reaccionado — si recorta produccion, el impacto se amortigua. Si no, la caida continuara. La OPEC+ se reune el 1 de junio, fecha clave. Mientras tanto, el nivel a vigilar es $72: si lo rompe a la baja, el siguiente soporte esta en $68.
              </p>
              <div className="mt-4 bg-background rounded-lg p-4 border border-card-border">
                <p className="text-xs text-red font-medium mb-1">Recomendacion: reducir posicion un 50%</p>
                <p className="text-xs text-muted">Conviccion 8/10. El paralelo historico de 2015 (cuando se firmo el JCPOA, el Brent cayo de $65 a $45 en 6 meses), la tendencia de Polymarket (58% a acuerdo Iran antes de agosto), y tu nivel de exposicion actual sugieren que es prudente reducir. Mantener la otra mitad por si la OPEC+ reacciona con recortes.</p>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-sm font-mono text-accent-light">EU</div>
                  <div>
                    <p className="font-medium">EUNA — iShares Euro Gov Bond</p>
                    <p className="text-xs text-muted">2.400,00 — 18.7% del portfolio</p>
                  </div>
                </div>
                <span className="text-green font-medium">+0.5%</span>
              </div>
              <p className="text-muted">
                Movimiento contenido pero en la direccion correcta. Beneficiado directamente por el tono dovish del BCE. Si se confirma el recorte en junio (73% segun Polymarket), esta posicion podria subir un 1-2% adicional. Paul Donovan confirma que la inflacion europea no sera problema hasta Q4 2026 como minimo. Posicion de proteccion que esta funcionando bien — mantener.
              </p>
            </div>

            <div className="bg-card border border-green/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center text-sm font-mono text-green">SE</div>
                  <div>
                    <p className="font-medium">SEMI — VanEck Semiconductor</p>
                    <p className="text-xs text-muted">1.867,32 — 14.5% del portfolio</p>
                  </div>
                </div>
                <span className="text-green font-medium">+4.2%</span>
              </div>
              <p className="text-muted">
                <span className="text-green font-medium">Mejor posicion de la semana.</span> Nvidia presento la nueva arquitectura Blackwell Ultra el miercoles: promete un rendimiento 4x superior en inferencia de IA. Los pedidos anticipados de los hyperscalers (Amazon, Google, Microsoft) superan todas las expectativas. TSMC confirma un aumento de capex del 15% para responder a la demanda.
              </p>
              <p className="text-muted mt-3">
                El ciclo expansivo de semiconductores tiene pinta de durar 12-18 meses mas. La cadena de valor entera sube: ASML +3.2%, SK Hynix +4.8%, Samsung +2.1%. Tu posicion actual es relativamente pequena (14.5% del portfolio).
              </p>
              <div className="mt-4 bg-background rounded-lg p-4 border border-card-border">
                <p className="text-xs text-green font-medium mb-1">Recomendacion: anadir en caidas (si baja &gt;2%)</p>
                <p className="text-xs text-muted">Conviccion 7/10. El ciclo es favorable, pero el sector ya sube un +25% en lo que va de ano y las valoraciones estan estiradas (P/E sector en 32x). Ademas, Matt Levine recuerda que los aranceles tech EEUU-China se negociaran por separado en Q3. Mejor esperar un retroceso para mejorar el precio de entrada.</p>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 4. Temas de seguimiento */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1640955014216-75201056c829?w=800&h=250&fit=crop" alt="Semiconductores" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Temas de seguimiento</h2>
              <p className="text-xs text-muted">3 temas activos esta semana</p>
            </div>
          </div>
          <div className="space-y-6 text-sm leading-7 text-muted">

            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-foreground font-semibold text-base">Semiconductores</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red/15 text-red">ALTA — subida dinamica</span>
              </div>
              <p>
                Prioridad base: MEDIA. Se ha subido a ALTA esta semana por el evento de Nvidia. La nueva arquitectura Blackwell Ultra no es una mejora incremental — es un salto generacional que reconfigura la cadena de valor. Los hyperscalers ya han confirmado pedidos masivos para H2 2026.
              </p>
              <p className="mt-3">
                Implicaciones mas alla de Nvidia: TSMC necesita mas capacidad (de ahi el +15% capex), ASML vendera mas maquinas EUV, y los fabricantes de memoria HBM (SK Hynix, Samsung) no dan abasto. Es un ciclo que se retroalimenta.
              </p>
              <p className="mt-3">
                <span className="text-foreground font-medium">Proximos catalistas:</span> Earnings de TSMC (22 mayo) y guidance de ASML (28 mayo). Ambos confirmaran o desmentiran la tesis del ciclo expansivo. Tu posicion en SEMI te da exposicion directa a todo esto.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-foreground font-semibold text-base">Petroleo y energia</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red/15 text-red">ALTA — subida dinamica</span>
              </div>
              <p>
                Prioridad base: MEDIA. Subida a ALTA por la caida del Brent esta semana. El driver principal son las negociaciones Iran-EEUU: el secretario de Estado confirmo el jueves que &quot;se han logrado avances significativos&quot; — el lenguaje mas positivo hasta la fecha.
              </p>
              <p className="mt-3">
                El escenario base ahora es que se alcance algun tipo de acuerdo preliminar antes de agosto (Polymarket: 58%, +15% en una semana). Si eso ocurre, Iran podria empezar a aumentar produccion en Q4 2026, con impacto real en precios en Q1 2027.
              </p>
              <p className="mt-3">
                Arabia Saudi es la variable clave. En 2015, cuando se firmo el JCPOA, Arabia mantuvo produccion para defender cuota de mercado y el Brent cayo un 30% en 6 meses. Hoy la OPEC+ tiene mas disciplina, pero no es seguro que sacrifiquen cuota por precio. La reunion del 1 de junio sera decisiva.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-foreground font-semibold text-base">Politica monetaria BCE</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">MEDIA</span>
              </div>
              <p>
                Sin cambios de prioridad esta semana, pero la probabilidad de recorte sigue subiendo. Polymarket: 73% para junio (+8% en una semana). Las actas filtradas y las declaraciones de Donovan lo confirman. El dato de inflacion eurozona del 30 de mayo sera la ultima pieza del puzzle — si sale en linea o por debajo de lo esperado, el recorte es practicamente seguro.
              </p>
              <p className="mt-3">
                <span className="text-foreground font-medium">Impacto en tu portfolio:</span> Positivo para EUNA (bonos europeos) y para el componente europeo de IWDA. Neutral para el resto de posiciones. Si tienes cash disponible y quieres mas exposicion a Europa, una opcion seria anadir a EUNA antes de la reunion del 5 de junio.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 5. Lo que dicen las fuentes */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=250&fit=crop" alt="News sources" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Lo que dicen tus fuentes</h2>
              <p className="text-xs text-muted">8 fuentes analizadas hoy</p>
            </div>
          </div>
          <div className="space-y-6 text-sm leading-7 text-muted">

            <div className="border-l-2 border-purple-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="UBS On-Air" type="podcast" />
                <span className="text-xs text-muted">Paul Donovan — hoy, 7:30 AM</span>
              </div>
              <p>
                Episodio centrado en el acuerdo EEUU-China y la politica del BCE. Donovan celebra la reduccion de incertidumbre pero advierte: &quot;Es un framework, no un tratado. Los detalles importan y aun no los tenemos. Los aranceles tecnologicos — semiconductores, IA, datos — se negociaran por separado y ahi esta el verdadero pulso geopolitico.&quot;
              </p>
              <p className="mt-3">
                Sobre el BCE: &quot;La inflacion europea esta contenida. Los datos de salarios del Q1 confirman que no hay presion alcista significativa. El BCE tiene via libre para recortar en junio sin arriesgar su credibilidad. Espero dos recortes este ano: junio y septiembre.&quot;
              </p>
            </div>

            <div className="border-l-2 border-blue-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="Matt Levine" type="newsletter" />
                <span className="text-xs text-muted">Money Stuff — viernes</span>
              </div>
              <p>
                Analisis profundo del acuerdo comercial con su estilo habitual. Lo mas relevante: &quot;Los mercados suben porque hay menos incertidumbre, no porque los terminos sean especialmente buenos. Es un acuerdo para seguir negociando, que es mejor que no tener acuerdo.&quot;
              </p>
              <p className="mt-3">
                Dato importante que rescata: la lista de excepciones incluye semiconductores avanzados, equipos de IA, y ciertos materiales estrategicos. Esto significa que empresas como Nvidia siguen sin poder vender sus chips mas potentes a China. Para tu posicion en SEMI, esto es un matiz relevante — el rally del sector esta impulsado por demanda occidental, no china.
              </p>
            </div>

            <div className="border-l-2 border-blue-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="The Daily Shot" type="newsletter" />
                <span className="text-xs text-muted">Viernes</span>
              </div>
              <p>
                Grafico destacado del dia: la correlacion entre VIX bajo y correcciones posteriores. En los ultimos 20 anos, cuando el VIX ha estado por debajo de 14 durante mas de 10 sesiones consecutivas, el S&P 500 ha sufrido una correccion media del 4.2% en las siguientes 6 semanas. Ya llevamos 8 sesiones.
              </p>
            </div>

            <div className="border-l-2 border-emerald-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="Polymarket" type="polymarket" />
                <span className="text-xs text-muted">Datos en tiempo real</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between bg-card rounded-lg px-4 py-2 border border-card-border">
                  <span>Recorte BCE en junio</span>
                  <span className="text-green font-medium">73% <span className="text-xs text-muted">(+8%)</span></span>
                </div>
                <div className="flex items-center justify-between bg-card rounded-lg px-4 py-2 border border-card-border">
                  <span>Acuerdo Iran-EEUU antes de agosto</span>
                  <span className="text-amber-400 font-medium">58% <span className="text-xs text-muted">(+15%)</span></span>
                </div>
                <div className="flex items-center justify-between bg-card rounded-lg px-4 py-2 border border-card-border">
                  <span>Recesion EEUU en 2026</span>
                  <span className="text-green font-medium">12% <span className="text-xs text-muted">(-3%)</span></span>
                </div>
                <div className="flex items-center justify-between bg-card rounded-lg px-4 py-2 border border-card-border">
                  <span>S&P 500 sobre 6.000 antes de diciembre</span>
                  <span className="text-amber-400 font-medium">61% <span className="text-xs text-muted">(+5%)</span></span>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-zinc-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="@zerohedge" type="x" />
                <span className="text-xs text-muted">Hilo destacado — sabado</span>
              </div>
              <p>
                Hilo viral sobre la complacencia del mercado. Argumento principal: con earnings season terminando, el acuerdo China ya descontado, y sin catalistas positivos en el horizonte cercano, el proximo movimiento grande es mas probable a la baja que al alza. Cita datos historicos del VIX que coinciden con los de The Daily Shot. Tono bearish, pero con datos solidos.
              </p>
            </div>

            <div className="border-l-2 border-zinc-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="@sentimentrader" type="x" />
                <span className="text-xs text-muted">Viernes</span>
              </div>
              <p>
                Su indicador compuesto de sentimiento esta en zona de &quot;optimismo elevado&quot; (no extremo todavia). Historicamente, este nivel produce retornos mediocres a 1 mes (+0.3% medio) pero buenos a 3 meses (+4.2% medio). Traduccion: no es momento de comprar agresivamente, pero tampoco de vender.
              </p>
            </div>

            <div className="border-l-2 border-amber-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="Informe BBVA" type="bank" />
                <span className="text-xs text-muted">Informe semanal — viernes</span>
              </div>
              <p>
                BBVA Research revisa al alza PIB eurozona 2026 (de 1.1% a 1.4%). Destacan la mejora de las condiciones financieras y la confianza empresarial como motores. Mantienen prevision de 2 recortes del BCE (junio y septiembre). Ven riesgos al alza para la inflacion en Q4 si el petroleo rebota, pero lo consideran &quot;un escenario de baja probabilidad dado el contexto Iran.&quot;
              </p>
            </div>

            <div className="border-l-2 border-rose-500/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge name="Financial Times" type="news" />
                <span className="text-xs text-muted">Jueves</span>
              </div>
              <p>
                Articulo exclusivo con las actas filtradas del BCE. Lo mas relevante: 19 de 26 miembros del consejo apoyaron explicitamente un recorte en junio durante la ultima reunion. Solo 4 se opusieron citando &quot;incertidumbre sobre los salarios negociados en Q2.&quot; El dato de salarios del 30 de mayo despejara esta ultima duda.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 6. Paralelos historicos */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=250&fit=crop" alt="Historical data" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Paralelos historicos</h2>
              <p className="text-xs text-muted">Lecciones del pasado para el presente</p>
            </div>
          </div>
          <div className="space-y-6 text-sm leading-7 text-muted">

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="text-foreground font-semibold text-base mb-3">Acuerdo comercial EEUU-China: 2019 vs 2026</h3>
              <p>
                En diciembre 2019, el anuncio del acuerdo fase 1 impulso al S&P 500 un +3.2% en las dos semanas siguientes. El rally fue amplio — todos los sectores subieron, liderados por industriales y tecnologia. Los mercados emergentes asiaticos fueron los mayores beneficiarios.
              </p>
              <p className="mt-3">
                Sin embargo, los aranceles clave nunca se eliminaron realmente. El acuerdo establecio compromisos de compra que China nunca cumplio plenamente. El rally se agoto en febrero 2020 (antes de que el COVID cambiara todo).
              </p>
              <p className="mt-3">
                <span className="text-accent-light font-medium">Patron aplicable hoy:</span> El mercado celebra la reduccion de incertidumbre, no los terminos especificos. La euforia inicial puede durar 2-3 semanas, pero sin progreso real en los temas pendientes (aranceles tech), el impulso se desvanecera. Recomendacion: disfrutar el rally pero no perseguirlo. Si el S&P sube un +3% adicional desde aqui, considerar tomar beneficios parciales en VUAA.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="text-foreground font-semibold text-base mb-3">Iran volviendo al mercado: 2015-2016</h3>
              <p>
                Cuando se firmo el JCPOA (acuerdo nuclear con Iran) en julio 2015, el Brent estaba en $65. En los 6 meses siguientes cayo hasta $45 — una caida del 30%. La produccion iraniana aumento en aproximadamente 1 millon de barriles diarios.
              </p>
              <p className="mt-3">
                El factor agravante fue Arabia Saudi: en vez de recortar produccion para defender el precio, mantuvo su nivel para defender cuota de mercado. Esto creo una guerra de precios que hundio al sector energetico global.
              </p>
              <p className="mt-3">
                <span className="text-foreground font-medium">Diferencias con 2026:</span> La demanda global es significativamente mayor hoy. La OPEC+ tiene una estructura de coordinacion mas solida que en 2015. Y las energias renovables absorben parte de la demanda incremental, lo que podria amortiguar el impacto.
              </p>
              <p className="mt-3">
                <span className="text-red font-medium">Similitudes preocupantes:</span> El lenguaje diplomatico es casi identico al de 2015. La velocidad de las negociaciones es mayor de lo esperado. Y Arabia Saudi aun no se ha pronunciado sobre como reaccionara.
              </p>
              <p className="mt-3">
                <span className="text-accent-light">Conclusion:</span> El riesgo bajista para el Brent es real y significativo. Incluso si el escenario no es tan extremo como 2015, una caida del 10-15% es plausible si el acuerdo avanza. Tu posicion actual de 1.200 podria bajar a 1.020-1.080.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 7. Recomendaciones */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=250&fit=crop" alt="Investment strategy" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Recomendaciones</h2>
              <p className="text-xs text-muted">2 acciones sugeridas hoy</p>
            </div>
          </div>
          <div className="space-y-6 text-sm leading-7">

            <div className="bg-card border border-red/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold text-base">1. Reducir Brent un 50%</h3>
                <span className="text-sm px-3 py-1 rounded-full bg-accent/15 text-accent-light font-medium">Conviccion: 8/10</span>
              </div>
              <p className="text-muted">
                Las negociaciones Iran-EEUU, el paralelo historico de 2015, Polymarket al 58% de acuerdo antes de agosto, y tu nivel actual de perdidas apuntan en la misma direccion: reducir exposicion. Vender la mitad (600) limita el dano si la caida continua, pero te mantiene posicionado por si la OPEC+ reacciona con recortes en la reunion del 1 de junio.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-xs text-green font-medium mb-2">Caso a favor (reducir)</p>
                  <ul className="text-xs text-muted space-y-1">
                    <li>Paralelo 2015: Brent cayo 30% tras JCPOA</li>
                    <li>Iran puede anadir 1.5M bbl/dia al mercado</li>
                    <li>Polymarket: 58% probabilidad de acuerdo</li>
                    <li>Dolar fuerte presiona commodities</li>
                    <li>Ya pierdes 45,60 esta semana</li>
                  </ul>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-xs text-red font-medium mb-2">Caso en contra (mantener)</p>
                  <ul className="text-xs text-muted space-y-1">
                    <li>OPEC+ tiene mas disciplina que en 2015</li>
                    <li>Demanda global es mayor</li>
                    <li>Arabia Saudi podria recortar produccion</li>
                    <li>El acuerdo puede retrasarse o fracasar</li>
                    <li>9.3% del portfolio es exposicion moderada</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card border border-green/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold text-base">2. Anadir SEMI en proxima caida (&gt;2%)</h3>
                <span className="text-sm px-3 py-1 rounded-full bg-accent/15 text-accent-light font-medium">Conviccion: 7/10</span>
              </div>
              <p className="text-muted">
                El ciclo de semiconductores es expansivo y confirmado por multiples fuentes (Nvidia, TSMC, ASML). Tu posicion actual es relativamente pequena (14.5%) para un tema tan fuerte. Pero el sector ya sube +25% YTD y las valoraciones estan estiradas. No perseguir el precio — esperar un retroceso del 2-3% para mejorar el punto de entrada.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-xs text-green font-medium mb-2">Caso a favor (comprar en caida)</p>
                  <ul className="text-xs text-muted space-y-1">
                    <li>Ciclo expansivo 12-18 meses</li>
                    <li>Nvidia Blackwell Ultra confirma demanda</li>
                    <li>TSMC capex +15%</li>
                    <li>Tu posicion actual es pequena (14.5%)</li>
                    <li>IA como megatendencia estructural</li>
                  </ul>
                </div>
                <div className="bg-background rounded-lg p-4 border border-card-border">
                  <p className="text-xs text-red font-medium mb-2">Caso en contra (esperar)</p>
                  <ul className="text-xs text-muted space-y-1">
                    <li>Sector +25% YTD, valoraciones estiradas</li>
                    <li>Aranceles tech EEUU-China sin resolver</li>
                    <li>P/E sector en 32x (historicamente alto)</li>
                    <li>VIX bajo sugiere posible correccion general</li>
                    <li>Concentrar mas en tech aumenta riesgo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* 8. Alertas */}
        <section className="py-10">
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=250&fit=crop" alt="Calendar events" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="text-xl font-bold">Alertas y proximos eventos</h2>
              <p className="text-xs text-muted">3 alertas activas — 6 eventos esta semana</p>
            </div>
          </div>
          <div className="space-y-4 text-sm leading-7">
            <div className="flex items-start gap-4 bg-card border border-red/20 rounded-xl p-5">
              <div className="w-3 h-3 rounded-full bg-red mt-1.5 shrink-0" />
              <div>
                <p className="text-foreground font-medium">VIX en zona de complacencia (13.2)</p>
                <p className="text-muted mt-1">Historicamente, VIX sub-14 durante mas de 2 semanas precede correcciones del 3-5%. Ya llevamos 8 sesiones. No es senal de venta, pero si de no anadir riesgo agresivamente. Tu S&P 500 es la posicion mas expuesta a una correccion tecnica.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-card border border-amber-500/20 rounded-xl p-5">
              <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-foreground font-medium">Brent — vigilar nivel $72</p>
                <p className="text-muted mt-1">Soporte tecnico clave. Si el Brent cierra por debajo de $72 en las proximas sesiones, el siguiente soporte esta en $68. Esto representaria una caida adicional del 5-8% desde el nivel actual. Si tienes intencion de reducir posicion, mejor hacerlo antes de que rompa ese soporte.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-card border border-card-border rounded-xl p-5">
              <div className="w-3 h-3 rounded-full bg-accent mt-1.5 shrink-0" />
              <div>
                <p className="text-foreground font-medium">Calendario de eventos clave</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3 text-muted">
                    <span className="text-xs text-foreground font-mono w-20 shrink-0">13 mayo</span>
                    <span>IPC EEUU — dato clave para la Fed. Si sale alto, frena el rally.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <span className="text-xs text-foreground font-mono w-20 shrink-0">22 mayo</span>
                    <span>Earnings TSMC — confirmara (o no) el ciclo de semiconductores.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <span className="text-xs text-foreground font-mono w-20 shrink-0">28 mayo</span>
                    <span>Guidance ASML — segunda confirmacion del ciclo semi.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <span className="text-xs text-foreground font-mono w-20 shrink-0">30 mayo</span>
                    <span>Inflacion eurozona — ultimo dato antes de la reunion del BCE.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <span className="text-xs text-foreground font-mono w-20 shrink-0">1 junio</span>
                    <span>Reunion OPEC+ — reaccion de Arabia Saudi al contexto Iran.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <span className="text-xs text-foreground font-mono w-20 shrink-0">5 junio</span>
                    <span>Reunion BCE — decision sobre recorte de tipos.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final note */}
        <div className="py-10 border-t border-card-border text-center">
          <p className="text-xs text-muted">Resumen generado a las 9:00 AM del 11 de mayo de 2026</p>
          <p className="text-xs text-muted mt-1">14 fuentes procesadas — 247 noticias analizadas — 12 vinculadas a tu portfolio</p>
          <Link href="/" className="inline-block mt-4 text-sm text-accent-light hover:text-accent transition-colors">
            Volver al dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}
