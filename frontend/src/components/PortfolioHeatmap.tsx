"use client";

const positions = [
  { ticker: "IWDA", name: "MSCI World", value: 4230, weight: 32.9, change: 1.8 },
  { ticker: "VUAA", name: "S&P 500", value: 3150, weight: 24.5, change: 2.1 },
  { ticker: "EUNA", name: "Euro Gov Bond", value: 2400, weight: 18.7, change: 0.5 },
  { ticker: "SEMI", name: "Semiconductor", value: 1867, weight: 14.5, change: 4.2 },
  { ticker: "BRT", name: "Brent Oil", value: 1200, weight: 9.3, change: -3.8 },
];

function getColor(change: number): string {
  if (change >= 3) return "from-green/40 to-green/20";
  if (change >= 1) return "from-green/25 to-green/10";
  if (change >= 0) return "from-green/15 to-green/5";
  if (change >= -2) return "from-red/15 to-red/5";
  return "from-red/30 to-red/15";
}

function getTextColor(change: number): string {
  if (change >= 0) return "text-green";
  return "text-red";
}

export default function PortfolioHeatmap() {
  const total = positions.reduce((s, p) => s + p.value, 0);

  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Mapa de calor</h3>
        <span className="text-xs text-muted">Tamaño = peso, color = rendimiento</span>
      </div>

      {/* Treemap layout */}
      <div className="flex flex-wrap gap-1.5" style={{ height: "200px" }}>
        {positions.map((p) => {
          const widthPct = (p.value / total) * 100;
          return (
            <div
              key={p.ticker}
              className={`relative rounded-lg bg-gradient-to-br ${getColor(p.change)} border border-white/5 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-accent/30 transition-all duration-300 hover:scale-[1.02]`}
              style={{ width: `calc(${widthPct}% - 6px)`, height: "100%" }}
            >
              <span className="text-sm font-bold">{p.ticker}</span>
              <span className="text-xs text-muted">{p.name}</span>
              <span className={`text-lg font-bold mt-1 ${getTextColor(p.change)}`}>
                {p.change >= 0 ? "+" : ""}{p.change}%
              </span>
              <span className="text-xs text-muted">{p.value.toLocaleString("es-ES")}</span>
              <span className="text-[10px] text-muted/60 mt-0.5">{p.weight}%</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-red/30 to-red/15" /> Caida &gt;2%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-red/15 to-red/5" /> Caida leve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-green/15 to-green/5" /> Subida leve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-green/40 to-green/20" /> Subida &gt;3%
        </span>
      </div>
    </div>
  );
}
