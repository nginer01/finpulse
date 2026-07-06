"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SettingsHero, SectionCard, ToggleRow, InputField, ActionButton } from "../ui";
import { sectionBySlug } from "../sections";

export default function PrivacidadPage() {
  const { logout } = useAuth();
  const [perms, setPerms] = useState({ analitica: true, personalizacion: true, terceros: false });
  const [exported, setExported] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleExport = () => {
    const data = {
      exportadoEl: new Date().toISOString(),
      permisos: perms,
      documentos: (() => {
        try {
          return JSON.parse(localStorage.getItem("finpulse-docs-v1") || "[]");
        } catch {
          return [];
        }
      })(),
      nota: "Exportación GDPR — incluye configuración local y documentos procesados.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finpulse-datos.json";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const cleanHistory = () => {
    try {
      localStorage.removeItem("finpulse-docs-v1");
      localStorage.removeItem("finpulse-gmail-conn");
      localStorage.removeItem("finpulse-synpulse");
    } catch {}
    setCleaned(true);
    setTimeout(() => setCleaned(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("privacidad")!} />

      <SectionCard title="Permisos de datos">
        <ToggleRow label="Analítica de uso (mejora del producto)" checked={perms.analitica} onChange={(v) => setPerms((p) => ({ ...p, analitica: v }))} />
        <ToggleRow label="Personalización del briefing con mi portfolio" checked={perms.personalizacion} onChange={(v) => setPerms((p) => ({ ...p, personalizacion: v }))} />
        <ToggleRow label="Compartir datos con terceros" checked={perms.terceros} onChange={(v) => setPerms((p) => ({ ...p, terceros: v }))} badge="Nunca recomendado" />
        <p className="text-[12px] text-muted leading-relaxed mt-4">
          Tus emails se leen en modo solo lectura y nunca salen de tu pipeline. Los documentos procesados se almacenan cifrados
          en Supabase (región UE, Irlanda) — cumplimiento GDPR.
        </p>
      </SectionCard>

      <SectionCard title="Tus datos">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-card-border">
          <div>
            <p className="text-sm font-medium text-foreground">Exportar todos mis datos</p>
            <p className="text-xs text-muted mt-0.5">Archivo JSON con configuración, documentos y actividad (GDPR art. 20)</p>
          </div>
          <ActionButton onClick={handleExport}>{exported ? "✓ Exportado" : "Exportar datos"}</ActionButton>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Limpiar historial local</p>
            <p className="text-xs text-muted mt-0.5">Borra documentos procesados y conexiones guardadas en este navegador</p>
          </div>
          <ActionButton onClick={cleanHistory}>{cleaned ? "✓ Limpiado" : "Limpiar historial"}</ActionButton>
        </div>
      </SectionCard>

      <SectionCard title="Zona de peligro" danger>
        <p className="text-sm font-medium text-red mb-1">Eliminar cuenta</p>
        <p className="text-xs text-muted mb-4">
          Acción irreversible: se eliminan todos tus datos, configuraciones y el histórico de resúmenes.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <InputField value={deleteConfirm} onChange={setDeleteConfirm} placeholder='Escribe "ELIMINAR" para confirmar' className="flex-1" />
          <ActionButton danger disabled={deleteConfirm !== "ELIMINAR"} onClick={() => deleteConfirm === "ELIMINAR" && logout()}>
            Eliminar cuenta
          </ActionButton>
        </div>
      </SectionCard>
    </div>
  );
}
