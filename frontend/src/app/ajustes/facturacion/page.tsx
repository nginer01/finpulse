"use client";

import { SettingsHero, SectionCard, ActionButton } from "../ui";
import { sectionBySlug } from "../sections";
import { Icon } from "@/components/article/ArticleBits";

const PLANES = [
  {
    name: "Personal",
    price: "0 €",
    current: true,
    features: ["Briefing diario adaptativo", "Portfolio tracking", "10 documentos/mes", "1 fuente de email"],
  },
  {
    name: "Pro",
    price: "19 €/mes",
    current: false,
    features: ["Resúmenes ~1h diario / 2h+ semanal", "Documentos ilimitados + OCR", "Carpeta Synpulse con servicio local", "Alertas predictivas y API"],
  },
];

export default function FacturacionPage() {
  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("facturacion")!} />

      <div className="grid sm:grid-cols-2 gap-4">
        {PLANES.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 sm:p-8 ${p.current ? "border-white/[0.3] bg-card" : "border-card-border bg-card/50"}`}
          >
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-[18px] font-medium tracking-wide">{p.name}</h2>
              {p.current && (
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full bg-white text-black">Tu plan</span>
              )}
            </div>
            <p className="text-[2rem] font-extralight tracking-tight mb-5" style={{ fontVariantNumeric: "tabular-nums" }}>{p.price}</p>
            <ul className="space-y-2.5 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#c8c8cd] leading-relaxed">
                  <Icon name="check" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted" />
                  {f}
                </li>
              ))}
            </ul>
            {!p.current && <ActionButton primary>Mejorar a Pro</ActionButton>}
          </div>
        ))}
      </div>

      <SectionCard title="Método de pago">
        <div className="flex items-center gap-4 py-2">
          <span className="w-12 h-8 rounded-md border border-white/[0.15] bg-white/[0.04] flex items-center justify-center text-muted">
            <Icon name="card" className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm text-foreground">Sin método de pago</p>
            <p className="text-xs text-muted mt-0.5">El plan Personal es gratuito — añade una tarjeta al pasar a Pro</p>
          </div>
          <ActionButton>Añadir tarjeta</ActionButton>
        </div>
      </SectionCard>

      <SectionCard title="Facturas">
        <p className="text-[13px] text-muted py-4 text-center">Aún no hay facturas — estás en el plan gratuito.</p>
      </SectionCard>
    </div>
  );
}
