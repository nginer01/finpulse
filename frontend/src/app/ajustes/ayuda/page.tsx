"use client";

import { useState } from "react";
import { SettingsHero, SectionCard, ActionButton } from "../ui";
import { sectionBySlug } from "../sections";
import { Icon } from "@/components/article/ArticleBits";

const FAQS = [
  {
    q: "¿De dónde salen los resúmenes diarios y semanales?",
    a: "La IA lee tus fuentes (emails reenviados a tu cuenta dedicada, documentos subidos, carpeta Synpulse) y genera un briefing adaptado a tu portfolio. La extensión es adaptativa: ~1 hora el diario y 2+ horas el semanal, expandiendo lo que te afecta y comprimiendo lo que no.",
  },
  {
    q: "¿FinPulse puede operar en mi broker?",
    a: "No. FinPulse analiza y recomienda con convicción y contraargumentos, pero nunca ejecuta órdenes. Las decisiones son siempre tuyas — y quedan registradas en tu Decision Journal para aprender de ellas.",
  },
  {
    q: "¿Qué pasa con la privacidad de mis emails?",
    a: "El acceso es de solo lectura sobre una cuenta DEDICADA (no tu correo personal). Los datos se almacenan en Supabase (región UE) y puedes exportarlos o borrarlos desde Privacidad & Datos.",
  },
  {
    q: "¿Por qué algunos datos del briefing son clickeables?",
    a: "Cada dato o cita con fuente enlaza a su origen: haz clic y verás el titular, un extracto, la fecha y el link al artículo completo. Transparencia total sobre de dónde sale cada afirmación.",
  },
  {
    q: "¿Cómo funciona la carpeta Synpulse?",
    a: "Crea una carpeta llamada Synpulse en tu equipo, vuelca informes y notas, y vincúlala desde Fuentes de Información (Chrome/Edge). FinPulse procesa los archivos al sincronizar; el monitoreo automático llegará con el servicio local.",
  },
];

export default function AyudaPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("ayuda")!} />

      <SectionCard title="Preguntas frecuentes">
        <div className="space-y-0">
          {FAQS.map((f, i) => (
            <div key={i} className={i > 0 ? "border-t border-card-border" : ""}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
              >
                <span className="text-[14px] font-medium text-foreground group-hover:text-white transition-colors">{f.q}</span>
                <span className={`shrink-0 text-muted transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              {open === i && <p className="text-[13px] text-muted leading-[1.8] pb-5 pr-8 animate-fade-in-up">{f.a}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Contacto">
          <p className="text-[13px] text-muted leading-relaxed mb-4">
            ¿Algo no funciona o tienes una idea? Escríbenos y te respondemos en menos de 24h.
          </p>
          <ActionButton primary onClick={() => { setSent(true); setTimeout(() => setSent(false), 2500); }}>
            <Icon name="mail" className="w-3.5 h-3.5" />
            {sent ? "✓ Abriendo email…" : "soporte@finpulse.es"}
          </ActionButton>
        </SectionCard>
        <SectionCard title="Documentación">
          <ul className="space-y-3">
            {[
              { t: "Guía del briefing diario", d: "Cómo se genera y cómo personalizarlo" },
              { t: "Pipeline de documentos", d: "docs/documentos-pipeline.md" },
              { t: "Design Bible", d: "El sistema visual de FinPulse" },
            ].map((d) => (
              <li key={d.t} className="flex items-start gap-3">
                <Icon name="doc" className="w-4 h-4 mt-0.5 shrink-0 text-muted" />
                <div>
                  <p className="text-[13px] font-medium text-foreground">{d.t}</p>
                  <p className="text-[12px] text-muted">{d.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <p className="text-[11px] text-muted/60 text-center pt-2" style={{ fontVariantNumeric: "tabular-nums" }}>
        FinPulse v0.9.0 (beta) · Next.js 16 · Desplegado en Vercel + Railway · Julio 2026
      </p>
    </div>
  );
}
