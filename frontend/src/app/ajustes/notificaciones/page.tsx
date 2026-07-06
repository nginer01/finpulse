"use client";

import { useState } from "react";
import { SettingsHero, SectionCard, ToggleRow, FieldRow, SelectField } from "../ui";
import { sectionBySlug } from "../sections";

export default function NotificacionesPage() {
  const [channels, setChannels] = useState({ email: true, push: false });
  const [alerts, setAlerts] = useState({
    caidas: true,
    recomendaciones: true,
    resumen: true,
    temas: false,
    documentos: true,
    eventos: true,
  });
  const [frecuencia, setFrecuencia] = useState("inmediata");
  const [silencio, setSilencio] = useState("22:00-08:00");

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("notificaciones")!} />

      <SectionCard title="Canales">
        <ToggleRow label="Email" checked={channels.email} onChange={(v) => setChannels((p) => ({ ...p, email: v }))} />
        <ToggleRow label="Push (navegador)" checked={channels.push} onChange={(v) => setChannels((p) => ({ ...p, push: v }))} badge="Beta" />
        <FieldRow label="Frecuencia de avisos">
          <SelectField
            value={frecuencia}
            onChange={setFrecuencia}
            options={[
              { value: "inmediata", label: "Inmediata" },
              { value: "horaria", label: "Resumen cada hora" },
              { value: "diaria", label: "Solo con el briefing diario" },
            ]}
            className="w-full sm:w-64"
          />
        </FieldRow>
        <FieldRow label="Horario de silencio">
          <SelectField
            value={silencio}
            onChange={setSilencio}
            options={[
              { value: "off", label: "Sin silencio" },
              { value: "22:00-08:00", label: "22:00 — 08:00" },
              { value: "00:00-07:00", label: "00:00 — 07:00" },
            ]}
            className="w-full sm:w-64"
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Qué te avisamos">
        <ToggleRow label="Alertas de portfolio (caídas >3%)" checked={alerts.caidas} onChange={(v) => setAlerts((p) => ({ ...p, caidas: v }))} />
        <ToggleRow label="Nuevas recomendaciones de la IA" checked={alerts.recomendaciones} onChange={(v) => setAlerts((p) => ({ ...p, recomendaciones: v }))} />
        <ToggleRow label="Briefing diario listo" checked={alerts.resumen} onChange={(v) => setAlerts((p) => ({ ...p, resumen: v }))} />
        <ToggleRow label="Nuevos documentos procesados" checked={alerts.documentos} onChange={(v) => setAlerts((p) => ({ ...p, documentos: v }))} />
        <ToggleRow label="Eventos del calendario (Fed, earnings...)" checked={alerts.eventos} onChange={(v) => setAlerts((p) => ({ ...p, eventos: v }))} />
        <ToggleRow label="Cambios en temas de seguimiento" checked={alerts.temas} onChange={(v) => setAlerts((p) => ({ ...p, temas: v }))} />
      </SectionCard>
    </div>
  );
}
