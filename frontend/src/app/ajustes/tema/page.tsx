"use client";

import { useState } from "react";
import { SettingsHero, SectionCard, ToggleRow, FieldRow } from "../ui";
import { sectionBySlug } from "../sections";

export default function TemaPage() {
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const [contrastHigh, setContrastHigh] = useState(false);
  const [fontSize, setFontSize] = useState(17);

  const light = mode === "light";

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("tema")!} />

      <SectionCard title="Apariencia">
        <FieldRow label="Modo">
          <div className="inline-flex rounded-full border border-card-border bg-background p-1">
            {(["dark", "light"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 cursor-pointer ${
                  mode === m ? "bg-white text-black" : "text-muted hover:text-foreground"
                }`}
              >
                {m === "dark" ? "Oscuro" : "Claro"}
              </button>
            ))}
          </div>
        </FieldRow>
        <ToggleRow label="Contraste alto" checked={contrastHigh} onChange={setContrastHigh} />
        <FieldRow label={`Tamaño de lectura — ${fontSize}px`}>
          <input
            type="range"
            min={15}
            max={21}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full sm:w-64 accent-white cursor-pointer"
            aria-label="Tamaño de fuente del cuerpo de artículo"
          />
        </FieldRow>
        <p className="text-[12px] text-muted leading-relaxed mt-4">
          El modo claro global está en beta — de momento se aplica a esta previsualización. El tamaño de lectura afectará al
          cuerpo de los resúmenes.
        </p>
      </SectionCard>

      {/* Preview en vivo */}
      <SectionCard title="Previsualización">
        <div
          className={`rounded-2xl border p-6 sm:p-8 transition-colors duration-500 ${
            light ? "bg-[#faf8f5] border-[#e5e0db]" : "bg-black border-white/[0.1]"
          }`}
        >
          <p className={`text-[11px] uppercase tracking-[0.4em] font-semibold mb-4 ${light ? "text-[#1a1a1a]/50" : "text-white/50"}`}>
            Briefing diario — vista previa
          </p>
          <h3
            className={`font-extralight tracking-tight leading-tight mb-4 ${contrastHigh ? "" : "opacity-95"} ${light ? "text-[#1a1a1a]" : "text-white"}`}
            style={{ fontSize: `${fontSize + 11}px` }}
          >
            El mercado laboral entierra el recorte de julio
          </h3>
          <p
            className={`leading-[1.85] tracking-wide ${light ? (contrastHigh ? "text-[#333]" : "text-[#555]") : contrastHigh ? "text-[#e8e8ed]" : "text-[#c8c8cd]"}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            La economía estadounidense creó 147.000 empleos en junio, muy por encima de las 110.000 que esperaba el consenso.
            El S&P 500 cerró en 6.284 puntos, nuevo máximo histórico, con el Nasdaq también en territorio inexplorado.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
