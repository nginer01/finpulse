"use client";

import { useState } from "react";
import Nav from "@/components/Nav";

/* ──────────────────────────────────────────────
   TYPES & MOCK DATA
   ────────────────────────────────────────────── */

interface PositionImpact {
  ticker: string;
  name: string;
  currentValue: number;
  change: number; // percentage
  note: string;
  sparkline: number[]; // y-values for mini decline chart
}

interface ActionCard {
  title: string;
  simulatedLoss: number;
  description: string;
}

interface Scenario {
  id: string;
  name: string;
  dates: string;
  index: string;
  drawdown: number;
  image: string;
  portfolioBefore: number;
  portfolioAfter: number;
  portfolioChange: number;
  recoveryMonths: number;
  positions: PositionImpact[];
  actions: ActionCard[];
  riskScore: number;
  riskLabel: string;
  declineCurve: number[];
  recommendations: string[];
}

const scenarios: Scenario[] = [
  {
    id: "2008",
    name: "Crisis financiera 2008",
    dates: "Sep 2008 – Mar 2009",
    index: "S&P 500",
    drawdown: -56,
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
    portfolioBefore: 12847,
    portfolioAfter: 5652,
    portfolioChange: -55.6,
    recoveryMonths: 14,
    positions: [
      { ticker: "IWDA", name: "iShares MSCI World", currentValue: 4230, change: -52, note: "Correlación alta con mercado", sparkline: [100, 88, 72, 60, 55, 50, 48] },
      { ticker: "VUAA", name: "Vanguard S&P 500", currentValue: 3150, change: -56, note: "Epicentro de la crisis", sparkline: [100, 82, 65, 52, 48, 45, 44] },
      { ticker: "BRT", name: "Brent Crude Oil", currentValue: 1200, change: -68, note: "Petróleo colapsa", sparkline: [100, 75, 55, 42, 35, 33, 32] },
      { ticker: "EUNA", name: "iShares Euro Govt Bond", currentValue: 2467, change: 8, note: "Bonos como refugio", sparkline: [100, 102, 103, 105, 106, 107, 108] },
      { ticker: "SEMI", name: "Semiconductors ETF", currentValue: 1800, change: -62, note: "Tech golpeada", sparkline: [100, 78, 60, 48, 42, 39, 38] },
    ],
    actions: [
      { title: "Reducir exposición a renta variable al 50%", simulatedLoss: -32, description: "Rebalancear hacia activos defensivos antes del colapso" },
      { title: "Aumentar bonos al 40%", simulatedLoss: -28, description: "Los bonos gubernamentales actuaron como refugio seguro" },
      { title: "Stop-loss al -15%", simulatedLoss: -15, description: "Limita perdidas pero pierde la recuperacion posterior" },
    ],
    declineCurve: [100, 92, 80, 68, 58, 52, 48, 45, 44.4],
    riskScore: 6.2,
    riskLabel: "Riesgo moderado-alto",
    recommendations: [
      "Considera aumentar tu exposición a bonos de gobierno (10-15%) para amortiguar caidas severas.",
      "Tu concentracion en renta variable (>80%) te expone a perdidas superiores al 50% en crisis sistemicas.",
      "Implementa un rebalanceo trimestral automatico para mantener tu perfil de riesgo objetivo.",
    ],
  },
  {
    id: "2020",
    name: "COVID Crash 2020",
    dates: "Feb – Mar 2020",
    index: "S&P 500",
    drawdown: -34,
    image:
      "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=200&fit=crop",
    portfolioBefore: 12847,
    portfolioAfter: 8479,
    portfolioChange: -34.0,
    recoveryMonths: 5,
    positions: [
      { ticker: "IWDA", name: "iShares MSCI World", currentValue: 4230, change: -33, note: "Caida rapida y global", sparkline: [100, 92, 78, 68, 67] },
      { ticker: "VUAA", name: "Vanguard S&P 500", currentValue: 3150, change: -34, note: "Panico generalizado", sparkline: [100, 90, 75, 66, 66] },
      { ticker: "BRT", name: "Brent Crude Oil", currentValue: 1200, change: -65, note: "Demanda colapsa por lockdowns", sparkline: [100, 70, 45, 36, 35] },
      { ticker: "EUNA", name: "iShares Euro Govt Bond", currentValue: 2467, change: 4, note: "Refugio moderado", sparkline: [100, 101, 103, 104, 104] },
      { ticker: "SEMI", name: "Semiconductors ETF", currentValue: 1800, change: -28, note: "Cadena de suministro afectada", sparkline: [100, 88, 76, 72, 72] },
    ],
    actions: [
      { title: "Reducir exposición a renta variable al 50%", simulatedLoss: -20, description: "Menor exposición limita el golpe inicial" },
      { title: "Aumentar bonos al 40%", simulatedLoss: -17, description: "Bonos compensan parcialmente las perdidas" },
      { title: "Stop-loss al -15%", simulatedLoss: -15, description: "Venta temprana pero pierdes el rally histórico posterior" },
    ],
    declineCurve: [100, 93, 82, 70, 66],
    riskScore: 5.4,
    riskLabel: "Riesgo moderado",
    recommendations: [
      "En crashes rapidos como COVID, la velocidad de caida no permite reaccionar. Preparate antes.",
      "Mantener 3-6 meses de liquidez te permite comprar en las caidas en vez de vender en panico.",
      "Los semiconductores se recuperaron con fuerza post-COVID. Diversificación temporal es clave.",
    ],
  },
  {
    id: "2000",
    name: "Burbuja tech 2000",
    dates: "Mar 2000 – Oct 2002",
    index: "Nasdaq",
    drawdown: -78,
    image:
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop",
    portfolioBefore: 12847,
    portfolioAfter: 4496,
    portfolioChange: -65.0,
    recoveryMonths: 48,
    positions: [
      { ticker: "IWDA", name: "iShares MSCI World", currentValue: 4230, change: -45, note: "Arrastrado por tech global", sparkline: [100, 90, 78, 68, 60, 56, 55] },
      { ticker: "VUAA", name: "Vanguard S&P 500", currentValue: 3150, change: -49, note: "S&P menos afectado que Nasdaq", sparkline: [100, 88, 74, 62, 55, 52, 51] },
      { ticker: "BRT", name: "Brent Crude Oil", currentValue: 1200, change: -30, note: "Energia relativamente estable", sparkline: [100, 92, 82, 76, 72, 70, 70] },
      { ticker: "EUNA", name: "iShares Euro Govt Bond", currentValue: 2467, change: 15, note: "Gran refugio durante la burbuja", sparkline: [100, 103, 106, 109, 112, 114, 115] },
      { ticker: "SEMI", name: "Semiconductors ETF", currentValue: 1800, change: -82, note: "Epicentro absoluto de la burbuja", sparkline: [100, 72, 50, 32, 22, 19, 18] },
    ],
    actions: [
      { title: "Reducir exposición a renta variable al 50%", simulatedLoss: -38, description: "Aun asi doloroso por la magnitud de la burbuja" },
      { title: "Aumentar bonos al 40%", simulatedLoss: -30, description: "Bonos brillaron durante este periodo" },
      { title: "Stop-loss al -15%", simulatedLoss: -15, description: "Proteccion temprana pero la recuperacion tardo 4 anios" },
    ],
    declineCurve: [100, 90, 78, 65, 52, 42, 38, 35],
    riskScore: 7.8,
    riskLabel: "Riesgo alto",
    recommendations: [
      "Tu exposición a semiconductores (SEMI) habria sufrido perdidas del 82%. Considera reducir concentracion sectorial.",
      "En burbujas prolongadas, la recuperacion puede tardar anios. Asegura tener horizonte temporal largo.",
      "Aumentar bonos al 25%+ habria reducido significativamente la volatilidad de tu cartera.",
    ],
  },
  {
    id: "2022",
    name: "Crisis energetica 2022",
    dates: "Ene – Oct 2022",
    index: "S&P 500",
    drawdown: -25,
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=200&fit=crop",
    portfolioBefore: 12847,
    portfolioAfter: 9892,
    portfolioChange: -23.0,
    recoveryMonths: 8,
    positions: [
      { ticker: "IWDA", name: "iShares MSCI World", currentValue: 4230, change: -20, note: "Caida moderada global", sparkline: [100, 94, 88, 83, 80] },
      { ticker: "VUAA", name: "Vanguard S&P 500", currentValue: 3150, change: -25, note: "Inflacion y subida de tasas", sparkline: [100, 92, 84, 78, 75] },
      { ticker: "BRT", name: "Brent Crude Oil", currentValue: 1200, change: 35, note: "Petróleo sube por crisis energetica", sparkline: [100, 115, 128, 132, 135] },
      { ticker: "EUNA", name: "iShares Euro Govt Bond", currentValue: 2467, change: -18, note: "Bonos caen por subida de tasas", sparkline: [100, 95, 88, 84, 82] },
      { ticker: "SEMI", name: "Semiconductors ETF", currentValue: 1800, change: -35, note: "Tech castigada por tasas altas", sparkline: [100, 88, 76, 68, 65] },
    ],
    actions: [
      { title: "Reducir exposición a renta variable al 50%", simulatedLoss: -14, description: "Menor exposición en entorno de tasas altas" },
      { title: "Aumentar commodities al 20%", simulatedLoss: -10, description: "Energia sube cuando todo baja" },
      { title: "Stop-loss al -15%", simulatedLoss: -15, description: "Venta antes del piso pero perdidas similares" },
    ],
    declineCurve: [100, 94, 86, 80, 77],
    riskScore: 4.8,
    riskLabel: "Riesgo moderado",
    recommendations: [
      "En 2022, bonos y acciones cayeron juntos. Diversificar con commodities habria sido mas efectivo.",
      "Tu posición en BRT habria sido la unica ganadora. Considera mantener algo de exposición a energia.",
      "Las crisis de tasas afectan diferente. No siempre los refugios clasicos funcionan.",
    ],
  },
];

/* ──────────────────────────────────────────────
   HELPER: format currency
   ────────────────────────────────────────────── */

function fmt(n: number) {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

/* ──────────────────────────────────────────────
   SVG: Decline curve (large)
   ────────────────────────────────────────────── */

function DeclineCurve({ data, color = "var(--color-red)" }: { data: number[]; color?: string }) {
  const w = 480;
  const h = 160;
  const pad = 16;
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((maxVal - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const areaPath = `M${points[0]} ${points.map((p) => `L${p}`).join(" ")} L${pad + ((data.length - 1) / (data.length - 1)) * (w - pad * 2)},${h - pad} L${pad},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[520px]" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="declineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#declineGrad)" />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* start & end dots */}
      {[0, data.length - 1].map((idx) => {
        const x = pad + (idx / (data.length - 1)) * (w - pad * 2);
        const y = pad + ((maxVal - data[idx]) / range) * (h - pad * 2);
        return <circle key={idx} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

/* ──────────────────────────────────────────────
   SVG: Mini sparkline for position cards
   ────────────────────────────────────────────── */

function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 100;
  const h = 36;
  const color = positive ? "var(--color-green)" : "var(--color-red)";
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = 4 + ((maxVal - v) / range) * (h - 8);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[100px] h-[36px]" preserveAspectRatio="none">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   SVG: Risk gauge arc
   ────────────────────────────────────────────── */

function RiskGauge({ score, label }: { score: number; label: string }) {
  const cx = 120;
  const cy = 110;
  const r = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalArc = endAngle - startAngle; // 240 degrees
  const needleAngle = startAngle + (score / 10) * totalArc;

  function polarToCart(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number, radius: number) {
    const start = polarToCart(startDeg, radius);
    const end = polarToCart(endDeg, radius);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M${start.x},${start.y} A${radius},${radius} 0 ${largeArc} 1 ${end.x},${end.y}`;
  }

  // Color segments: green -> yellow -> orange -> red
  const segments = [
    { from: 0, to: 3, color: "var(--color-green)" },
    { from: 3, to: 5, color: "#eab308" },
    { from: 5, to: 7, color: "#f97316" },
    { from: 7, to: 10, color: "var(--color-red)" },
  ];

  const needle = polarToCart(needleAngle, r - 10);

  return (
    <svg viewBox="0 0 240 140" className="w-full max-w-[280px] mx-auto">
      {/* Background arc */}
      <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="var(--color-card-border)" strokeWidth="14" strokeLinecap="round" />
      {/* Color segments */}
      {segments.map((seg, i) => {
        const segStart = startAngle + (seg.from / 10) * totalArc;
        const segEnd = startAngle + (seg.to / 10) * totalArc;
        return (
          <path key={i} d={arcPath(segStart, segEnd, r)} fill="none" stroke={seg.color} strokeWidth="14" strokeLinecap="butt" opacity={0.85} />
        );
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="var(--color-foreground)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="var(--color-foreground)" />
      {/* Score */}
      <text x={cx} y={cy + 30} textAnchor="middle" fill="var(--color-foreground)" fontSize="22" fontWeight="bold">
        {score.toFixed(1)}
      </text>
      <text x={cx} y={cy + 46} textAnchor="middle" fill="var(--color-muted)" fontSize="10">
        / 10
      </text>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */

export default function StressTestPage() {
  const [selectedId, setSelectedId] = useState<string>("2008");
  const scenario = scenarios.find((s) => s.id === selectedId)!;

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* ── HERO ── */}
        <section className="relative rounded-2xl overflow-hidden mb-12">
          <img
            src="https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=400&fit=crop"
            alt="Stress Test hero"
            className="w-full h-[220px] sm:h-[300px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/70 to-transparent" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
            <h1 className="text-3xl sm:text-5xl font-bold text-[var(--color-foreground)] tracking-tight">
              Stress Test
            </h1>
            <p className="mt-2 text-base sm:text-lg text-[var(--color-muted)] max-w-md">
              Que pasaria con tu portfolio si la historia se repitiera?
            </p>
          </div>
        </section>

        {/* ── SCENARIO SELECTOR ── */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-4">
            Selecciona un escenario histórico
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((s) => {
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`group relative rounded-xl overflow-hidden text-left transition-all duration-300 border-2 ${
                    active
                      ? "border-[var(--color-accent)] shadow-[0_0_24px_rgba(99,102,241,0.35)]"
                      : "border-[var(--color-card-border)] hover:border-[var(--color-accent-light)]/50"
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-28 object-cover brightness-75 group-hover:brightness-90 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] via-transparent to-transparent" />
                  <div className="relative p-3 bg-[var(--color-card)]">
                    <p className="font-semibold text-sm text-[var(--color-foreground)]">{s.name}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{s.dates}</p>
                    <p className="text-xs font-bold text-[var(--color-red)] mt-1">
                      {s.index} {s.drawdown}%
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── SIMULATION RESULTS ── */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-6">
            Impacto simulado: {scenario.name}
          </h2>

          {/* Impact summary */}
          <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 sm:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Big numbers */}
              <div className="flex-1 space-y-4">
                <div className="flex items-end gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Valor actual</p>
                    <p className="text-2xl font-bold text-[var(--color-foreground)]">
                      US$ {fmt(scenario.portfolioBefore)}
                    </p>
                  </div>
                  <svg width="32" height="32" viewBox="0 0 32 32" className="mb-1 shrink-0">
                    <path d="M8 16 L24 16 M18 10 L24 16 L18 22" fill="none" stroke="var(--color-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Valor simulado</p>
                    <p className="text-2xl font-bold text-[var(--color-red)]">
                      US$ {fmt(scenario.portfolioAfter)}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-red)]/10 border border-[var(--color-red)]/20">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M10 4 L10 12 M10 15 L10 16" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                  <span className="text-3xl font-black text-[var(--color-red)]">
                    {scenario.portfolioChange}%
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  Perdida estimada: US$ {fmt(scenario.portfolioBefore - scenario.portfolioAfter)}
                </p>
              </div>

              {/* Decline chart */}
              <div className="flex-1">
                <DeclineCurve data={scenario.declineCurve} />
              </div>
            </div>
          </div>

          {/* Position-by-position impact */}
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
            Impacto por posicion
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {scenario.positions.map((pos) => {
              const positive = pos.change >= 0;
              const simValue = Math.round(pos.currentValue * (1 + pos.change / 100));
              return (
                <div
                  key={pos.ticker}
                  className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[var(--color-foreground)]">{pos.ticker}</span>
                      <span className="text-xs text-[var(--color-muted)] ml-2">{pos.name}</span>
                    </div>
                    <span
                      className={`text-lg font-black ${positive ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}
                    >
                      {positive ? "+" : ""}{pos.change}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <MiniChart data={pos.sparkline} positive={positive} />
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-muted)]">Simulado</p>
                      <p className={`text-sm font-semibold ${positive ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}>
                        US$ {fmt(simValue)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] italic">{pos.note}</p>
                </div>
              );
            })}
          </div>

          {/* Recovery timeline */}
          <div className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-green)]/10 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--color-green)" strokeWidth="2" />
                <path d="M12 7 L12 12 L16 14" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                Tiempo de recuperacion estimado
              </p>
              <p className="text-[var(--color-green)] font-bold text-lg">
                ~{scenario.recoveryMonths} meses
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Tu portfolio tardaria ~{scenario.recoveryMonths} meses en recuperarse si mantienes posiciones
              </p>
            </div>
          </div>

          {/* What you could do — action cards */}
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
            Que podrias hacer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {scenario.actions.map((action, i) => {
              const colors = [
                { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", text: "var(--color-accent-light)" },
                { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "var(--color-green)" },
                { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)", text: "#eab308" },
              ];
              const c = colors[i];
              return (
                <div
                  key={i}
                  className="rounded-xl p-5 border transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                >
                  <p className="text-sm font-semibold text-[var(--color-foreground)] mb-2">{action.title}</p>
                  <p className="text-2xl font-black mb-2" style={{ color: c.text }}>
                    {action.simulatedLoss}%
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{action.description}</p>
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${c.border}` }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.abs(action.simulatedLoss)}%`,
                        backgroundColor: c.text,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--color-muted)] mt-1">
                    <span>0%</span>
                    <span>-100%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── RISK SCORE ── */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-6">
            Nivel de riesgo de tu portfolio
          </h2>
          <div className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 sm:p-8 flex flex-col items-center gap-4">
            <RiskGauge score={scenario.riskScore} label={scenario.riskLabel} />
            <p className="text-lg font-bold text-[var(--color-foreground)]">{scenario.riskLabel}</p>
            <p className="text-sm text-[var(--color-muted)] text-center max-w-md">
              Basado en la composición actual de tu portfolio y su comportamiento histórico frente a {scenario.name.toLowerCase()}.
            </p>
          </div>
        </section>

        {/* ── RECOMMENDATIONS ── */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-4">
            Recomendaciones para reducir riesgo
          </h2>
          <div className="space-y-3">
            {scenario.recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 flex items-start gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.12)",
                    color: "var(--color-accent-light)",
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
