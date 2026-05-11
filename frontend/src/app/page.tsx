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

        {/* Daily Summary Card */}
        <div className="bg-card border border-card-border rounded-xl p-6 mb-8 animate-fade-in-up-delay-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="font-semibold">Resumen diario</h2>
            <span className="text-xs text-muted ml-auto">12 fuentes procesadas</span>
          </div>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Los mercados globales abren la semana con tono positivo tras el acuerdo comercial preliminar entre EEUU y China.
            El S&P 500 cerro el viernes en maximos historicos (+1.2%). <span className="text-accent-light">Tu posicion en MSCI World se beneficia directamente.</span> Sin embargo,
            el sector energetico muestra debilidad por las negociaciones Iran-EEUU que avanzan mas rapido de lo esperado.
            <span className="text-red"> Atencion: tu exposicion a petroleo podria verse afectada esta semana.</span>
          </p>
          <p className="text-sm text-muted leading-relaxed">
            UBS On-Air (Paul Donovan) destaca que la inflacion europea sigue contenida, favorable para tu posicion en bonos europeos.
            Polymarket situa al 73% la probabilidad de recorte de tipos del BCE en junio — <span className="text-green">esto podria impulsar tu portfolio un 3-5% adicional.</span>
          </p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent-light">Macro Global</span>
            <span className="text-xs px-2 py-1 rounded bg-green/10 text-green">Favorable para ti</span>
            <span className="text-xs px-2 py-1 rounded bg-red/10 text-red">1 alerta</span>
          </div>
        </div>
      </section>

      {/* 6 News Windows */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <h2 className="font-semibold mb-4">Noticias para profundizar</h2>
        <div className="grid grid-cols-3 gap-4">
          <NewsCard type="Interes personal" title="Acuerdo comercial EEUU-China: impacto en ETFs globales y tu posicion en MSCI World" tag="Tu portfolio" delay="animate-fade-in-up" />
          <NewsCard type="Interes personal" title="Negociaciones Iran-EEUU avanzan: Brent cae 4% en la semana" tag="Tu portfolio" delay="animate-fade-in-up-delay" />
          <NewsCard type="Informacion nueva" title="Nvidia presenta nueva arquitectura GPU: el mercado de semiconductores se reconfigura" tag="Nuevo" delay="animate-fade-in-up-delay-2" />
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
