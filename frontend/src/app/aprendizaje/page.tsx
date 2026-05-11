"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

/* ------------------------------------------------------------------ */
/*  RADAR / SPIDER CHART (SVG)                                        */
/* ------------------------------------------------------------------ */

const dnaAxes = [
  { label: "Disciplina", value: 0.78 },
  { label: "Control emocional", value: 0.65 },
  { label: "Diversificacion", value: 0.82 },
  { label: "Timing", value: 0.54 },
  { label: "A. fundamental", value: 0.71 },
  { label: "Gestion riesgo", value: 0.68 },
];

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RadarChart() {
  const cx = 150,
    cy = 150,
    maxR = 110;
  const levels = [0.25, 0.5, 0.75, 1];
  const angleStep = 360 / dnaAxes.length;

  const dataPoints = dnaAxes.map((a, i) => {
    const angle = i * angleStep;
    return polarToXY(cx, cy, maxR * a.value, angle);
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto">
      {/* Grid rings */}
      {levels.map((l) => {
        const pts = dnaAxes
          .map((_, i) => {
            const p = polarToXY(cx, cy, maxR * l, i * angleStep);
            return `${p.x},${p.y}`;
          })
          .join(" ");
        return (
          <polygon
            key={l}
            points={pts}
            fill="none"
            stroke="var(--card-border)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines + labels */}
      {dnaAxes.map((a, i) => {
        const angle = i * angleStep;
        const outer = polarToXY(cx, cy, maxR + 2, angle);
        const labelPt = polarToXY(cx, cy, maxR + 22, angle);
        return (
          <g key={a.label}>
            <line
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--card-border)"
              strokeWidth="1"
            />
            <text
              x={labelPt.x}
              y={labelPt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--muted)"
              fontSize="9"
              fontFamily="inherit"
            >
              {a.label}
            </text>
            <text
              x={polarToXY(cx, cy, maxR * a.value + 12, angle).x}
              y={polarToXY(cx, cy, maxR * a.value + 12, angle).y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--accent-light)"
              fontSize="8"
              fontWeight="bold"
              fontFamily="inherit"
            >
              {Math.round(a.value * 100)}%
            </text>
          </g>
        );
      })}

      {/* Data polygon */}
      <defs>
        <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path d={dataPath} fill="url(#radarGrad)" stroke="var(--accent)" strokeWidth="2" />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--accent-light)" />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  DECISION JOURNAL                                                  */
/* ------------------------------------------------------------------ */

type DecisionStatus = "good" | "neutral" | "risky";

interface Decision {
  date: string;
  action: "Compra" | "Venta";
  ticker: string;
  price: string;
  conviction: number;
  sentiment: string;
  thesis: string;
  result: string;
  status: DecisionStatus;
  note?: string;
}

const decisions: Decision[] = [
  {
    date: "8 mayo 2026",
    action: "Venta",
    ticker: "BRT",
    price: "$74.20",
    conviction: 8,
    sentiment: "Bearish en energia",
    thesis: "Iran negotiations advancing, oil likely to drop",
    result: "+1.8% saved",
    status: "good",
  },
  {
    date: "2 mayo 2026",
    action: "Compra",
    ticker: "SEMI",
    price: "$312.50",
    conviction: 7,
    sentiment: "Bullish semiconductores",
    thesis: "Semiconductor cycle expanding, Nvidia event coming",
    result: "+4.2% so far",
    status: "good",
  },
  {
    date: "25 abril 2026",
    action: "Compra",
    ticker: "EUNA",
    price: "$48.30",
    conviction: 6,
    sentiment: "Neutral / dovish BCE",
    thesis: "BCE likely to cut rates in June",
    result: "+0.5% so far",
    status: "neutral",
  },
  {
    date: "15 abril 2026",
    action: "Compra",
    ticker: "VUAA",
    price: "$98.10",
    conviction: 5,
    sentiment: "Bullish rally",
    thesis: "FOMO after S&P rally",
    result: "+2.1%",
    status: "risky",
    note: "Tu conviction era baja. Historicamente tus compras con conviction <6 pierden el 60% de las veces.",
  },
  {
    date: "1 abril 2026",
    action: "Compra",
    ticker: "IWDA",
    price: "$82.40",
    conviction: 9,
    sentiment: "Neutral / DCA",
    thesis: "Core position, DCA mensual",
    result: "+1.8%",
    status: "good",
  },
];

const statusConfig: Record<DecisionStatus, { label: string; color: string; bg: string }> = {
  good: { label: "GOOD", color: "text-green", bg: "bg-green/15" },
  neutral: { label: "NEUTRAL", color: "text-amber-400", bg: "bg-amber-400/15" },
  risky: { label: "RISKY ENTRY", color: "text-amber-400", bg: "bg-amber-400/15" },
};

function ConvictionDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < level
              ? level >= 8
                ? "bg-green"
                : level >= 6
                ? "bg-amber-400"
                : "bg-red"
              : "bg-card-border"
          }`}
        />
      ))}
      <span className="ml-2 text-xs text-muted">{level}/10</span>
    </div>
  );
}

function DecisionCard({ d }: { d: Decision }) {
  const s = statusConfig[d.status];
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted">{d.date}</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            d.action === "Compra"
              ? "bg-green/15 text-green"
              : "bg-red/15 text-red"
          }`}
        >
          {d.action}
        </span>
        <span className="text-lg font-bold">{d.ticker}</span>
        <span className="text-sm text-muted">@ {d.price}</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
          {s.label}
        </span>
      </div>

      <ConvictionDots level={d.conviction} />

      <div className="text-xs text-muted">
        Sentimiento: <span className="text-foreground">{d.sentiment}</span>
      </div>

      <div className="bg-background/60 border border-card-border rounded-lg p-3">
        <p className="text-xs text-muted mb-1">Tesis</p>
        <p className="text-sm italic text-accent-light">&ldquo;{d.thesis}&rdquo;</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Resultado:</span>
        <span className={`text-sm font-semibold ${d.result.startsWith("+") ? "text-green" : "text-red"}`}>
          {d.result}
        </span>
      </div>

      {d.note && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-3 text-xs text-amber-300">
          <span className="font-bold">Alerta: </span>
          {d.note}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SESGOS DETECTADOS                                                 */
/* ------------------------------------------------------------------ */

interface Bias {
  name: string;
  count: number;
  description: string;
  severity: "high" | "medium" | "low";
}

const biases: Bias[] = [
  {
    name: "FOMO",
    count: 3,
    description:
      "Tiendes a comprar despues de subidas del +5%. Estas compras pierden dinero el 60% de las veces.",
    severity: "medium",
  },
  {
    name: "Venta prematura",
    count: 5,
    description:
      "Vendes ganadores demasiado pronto. En 7 de 10 casos, la posicion siguio subiendo despues.",
    severity: "high",
  },
  {
    name: "Aversion a perdidas",
    count: 2,
    description:
      "Mantienes posiciones perdedoras demasiado tiempo esperando recuperacion.",
    severity: "low",
  },
];

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "text-red", bg: "bg-red/15 border-red/30", label: "Alta" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/15 border-amber-400/30", label: "Media" },
  low: { color: "text-green", bg: "bg-green/15 border-green/30", label: "Baja (mejorando)" },
};

function BiasCard({ b }: { b: Bias }) {
  const s = severityConfig[b.severity];
  return (
    <div className={`border rounded-xl p-5 space-y-3 ${s.bg}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-lg">{b.name}</h4>
        <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
      </div>
      <p className="text-xs text-muted">
        Detectado <span className="text-foreground font-semibold">{b.count} veces</span>
      </p>
      <p className="text-sm text-foreground/80">{b.description}</p>
      {/* severity bar */}
      <div className="w-full h-1.5 bg-card-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            b.severity === "high"
              ? "bg-red"
              : b.severity === "medium"
              ? "bg-amber-400"
              : "bg-green"
          }`}
          style={{ width: b.severity === "high" ? "85%" : b.severity === "medium" ? "50%" : "25%" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ESCENARIOS ALTERNATIVOS                                           */
/* ------------------------------------------------------------------ */

function ScenarioNvidia() {
  // Mini comparison bar chart
  const sold = 820;
  const now = 1150;
  const max = 1200;
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1639754390580-2e7437267698?w=800&h=250&fit=crop"
        alt="GPU / Nvidia"
        className="w-full h-40 object-cover"
      />
      <div className="p-5 space-y-4">
        <h4 className="font-bold">Si hubieras mantenido NVIDIA en vez de vender en marzo...</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Tu venta: ${sold}</span>
            </div>
            <div className="w-full h-5 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full bg-red/70 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(sold / max) * 100}%` }}
              >
                <span className="text-[10px] font-bold text-white">${sold}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Precio actual: ${now.toLocaleString()}</span>
            </div>
            <div className="w-full h-5 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full bg-green/70 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(now / max) * 100}%` }}
              >
                <span className="text-[10px] font-bold text-white">${now.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-red text-sm font-semibold">
          Ganancia perdida: +{Math.round(((now - sold) / sold) * 100)}% ($
          {(now - sold).toLocaleString()} por accion)
        </p>
        <p className="text-xs text-muted">
          Leccion: la venta prematura es tu sesgo mas frecuente. Considera usar trailing stops en vez
          de vender manualmente.
        </p>
      </div>
    </div>
  );
}

function ScenarioBitcoin() {
  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=250&fit=crop"
        alt="Bitcoin"
        className="w-full h-40 object-cover"
      />
      <div className="p-5 space-y-4">
        <h4 className="font-bold">Si hubieras comprado Bitcoin ETF en enero...</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Precio enero: $42,500</span>
            </div>
            <div className="w-full h-5 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full bg-muted/50 rounded-full flex items-center justify-end pr-2"
                style={{ width: "55%" }}
              >
                <span className="text-[10px] font-bold text-white">$42,500</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Precio actual: $71,200</span>
            </div>
            <div className="w-full h-5 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent/70 rounded-full flex items-center justify-end pr-2"
                style={{ width: "92%" }}
              >
                <span className="text-[10px] font-bold text-white">$71,200</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-accent-light text-sm font-semibold">Ganancia potencial: +67.5%</p>
        <p className="text-xs text-muted">
          Con una inversion de $1,000 en enero, hoy tendrias $1,675. Considera si un pequeno % en
          crypto encaja en tu perfil de riesgo.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SIGNAL VS NOISE                                                   */
/* ------------------------------------------------------------------ */

interface Source {
  name: string;
  accuracy: number;
  signals: number;
  correct: number;
  tag?: string;
}

const sources: Source[] = [
  { name: "Polymarket", accuracy: 81, signals: 15, correct: 12, tag: "BEST" },
  { name: "UBS On-Air", accuracy: 72, signals: 12, correct: 8 },
  { name: "Matt Levine", accuracy: 68, signals: 8, correct: 5 },
  { name: "Financial Times", accuracy: 65, signals: 9, correct: 6 },
  { name: "@zerohedge", accuracy: 45, signals: 10, correct: 4, tag: "WORST" },
];

function SourceBar({ s, maxAccuracy }: { s: Source; maxAccuracy: number }) {
  const barColor =
    s.accuracy >= 75
      ? "bg-green"
      : s.accuracy >= 60
      ? "bg-accent"
      : "bg-red";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{s.name}</span>
          {s.tag && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                s.tag === "BEST" ? "bg-green/20 text-green" : "bg-red/20 text-red"
              }`}
            >
              {s.tag}
            </span>
          )}
        </div>
        <span className="text-xs text-muted">
          {s.correct}/{s.signals} correctas
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-card-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${(s.accuracy / maxAccuracy) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold w-12 text-right">{s.accuracy}%</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION HEADER HELPER                                             */
/* ------------------------------------------------------------------ */

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <span className="text-xs font-mono text-accent mb-1 block">{number}</span>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-muted mt-1">{subtitle}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */

export default function AprendizajePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const totalScore = dnaAxes.reduce((sum, a) => sum + a.value, 0) / dnaAxes.length;

  return (
    <main className="min-h-screen">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="relative rounded-xl overflow-hidden mt-6 mb-10">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop"
            alt="Data analytics"
            className="w-full h-52 sm:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-muted text-sm mb-1">Centro de aprendizaje</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Tu perfil inversor</h1>
            <p className="text-muted text-sm mt-2">
              Analisis de comportamiento, sesgos y calidad de tus decisiones
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  1 . INVESTOR DNA                                            */}
        {/* ============================================================ */}
        <section className="mb-14 animate-fade-in-up">
          <SectionHeader
            number="01"
            title="Investor DNA"
            subtitle="Tu perfil multidimensional como inversor"
          />

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Chart */}
            <div className="bg-card border border-card-border rounded-xl p-6 flex items-center justify-center">
              <RadarChart />
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-lg">
                  Score total:{" "}
                  <span className="text-accent-light">{(totalScore * 100).toFixed(1)}%</span>
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green mt-0.5">&#9650;</span>
                    <div>
                      <span className="font-semibold">Fortalezas:</span>{" "}
                      <span className="text-muted">
                        Diversificacion (82%) y Disciplina (78%). Mantienes un portfolio balanceado
                        y seguis tu plan.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red mt-0.5">&#9660;</span>
                    <div>
                      <span className="font-semibold">Debilidades:</span>{" "}
                      <span className="text-muted">
                        Timing (54%) y Control emocional (65%). Tus puntos de entrada pueden mejorar
                        y a veces las emociones afectan tus decisiones.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-light mt-0.5">&#8594;</span>
                    <div>
                      <span className="font-semibold">Tendencia:</span>{" "}
                      <span className="text-muted">Mejora sostenida en los ultimos 3 meses.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolution card */}
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
                <p className="text-sm">
                  <span className="font-bold text-accent-light">Evolucion:</span> Hace 3 meses tu
                  score total era{" "}
                  <span className="font-bold text-muted line-through">58%</span>. Hoy es{" "}
                  <span className="font-bold text-accent-light">
                    {(totalScore * 100).toFixed(1)}%
                  </span>
                  .
                </p>
                <p className="text-green font-bold text-lg mt-2">Mejora del +20%</p>
                <div className="w-full h-2 bg-card-border rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-green rounded-full"
                    style={{ width: "69.7%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-1">
                  <span>Feb 2026: 58%</span>
                  <span>May 2026: 69.7%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-card-border mb-14" />

        {/* ============================================================ */}
        {/*  2 . DECISION JOURNAL                                        */}
        {/* ============================================================ */}
        <section className="mb-14 animate-fade-in-up-delay">
          <SectionHeader
            number="02"
            title="Decision Journal"
            subtitle="Tus ultimas 5 decisiones de inversion, analizadas"
          />

          <div className="space-y-4">
            {decisions.map((d, i) => (
              <DecisionCard key={i} d={d} />
            ))}
          </div>
        </section>

        <div className="h-px bg-card-border mb-14" />

        {/* ============================================================ */}
        {/*  3 . SESGOS DETECTADOS                                       */}
        {/* ============================================================ */}
        <section className="mb-14 animate-fade-in-up-delay-2">
          <SectionHeader
            number="03"
            title="Sesgos detectados"
            subtitle="Patrones de comportamiento que afectan tus decisiones"
          />

          <div className="grid sm:grid-cols-3 gap-4">
            {biases.map((b) => (
              <BiasCard key={b.name} b={b} />
            ))}
          </div>
        </section>

        <div className="h-px bg-card-border mb-14" />

        {/* ============================================================ */}
        {/*  4 . ESCENARIOS ALTERNATIVOS                                 */}
        {/* ============================================================ */}
        <section className="mb-14">
          <SectionHeader
            number="04"
            title="Escenarios alternativos"
            subtitle="Que habria pasado si..."
          />

          <div className="grid md:grid-cols-2 gap-6">
            <ScenarioNvidia />
            <ScenarioBitcoin />
          </div>
        </section>

        <div className="h-px bg-card-border mb-14" />

        {/* ============================================================ */}
        {/*  5 . SIGNAL VS NOISE                                         */}
        {/* ============================================================ */}
        <section className="mb-20">
          <SectionHeader
            number="05"
            title="Signal vs Noise Score"
            subtitle="Calidad de tus fuentes de informacion, rankeadas por precision"
          />

          <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Fuente</span>
              <span className="text-xs text-muted">Precision</span>
            </div>

            {sources.map((s) => (
              <SourceBar key={s.name} s={s} maxAccuracy={100} />
            ))}

            <div className="border-t border-card-border pt-4 mt-4">
              <p className="text-xs text-muted">
                <span className="text-green font-semibold">Polymarket</span> es tu fuente mas
                confiable con un 81% de precision.{" "}
                <span className="text-red font-semibold">@zerohedge</span> acierta menos del 50%
                de las veces — considera reducir su peso en tu proceso de decision.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
