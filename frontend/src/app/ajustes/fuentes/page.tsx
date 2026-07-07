"use client";

import { useEffect, useState } from "react";
import DocumentsManager from "@/components/documents/DocumentsManager";
import { SettingsHero, SectionCard, ToggleRow, InputField, FieldRow, SelectField } from "../ui";
import { sectionBySlug } from "../sections";
import { isQuizEnabled, setQuizEnabled } from "@/lib/quiz";

type Priority = "ALTA" | "MEDIA" | "BAJA";
const priorityColor: Record<Priority, string> = {
  ALTA: "bg-red/15 text-red border-red/30",
  MEDIA: "bg-amber-500/15 text-[#ffd60a] border-amber-500/30",
  BAJA: "bg-green/15 text-green border-green/30",
};

export default function FuentesPage() {
  const [topics, setTopics] = useState<{ name: string; priority: Priority }[]>([
    { name: "Petróleo", priority: "ALTA" },
    { name: "Semiconductores", priority: "ALTA" },
    { name: "IA", priority: "MEDIA" },
    { name: "BCE/Tipos", priority: "MEDIA" },
    { name: "Renta variable EEUU", priority: "MEDIA" },
    { name: "Emergentes", priority: "BAJA" },
  ]);
  const [newTopic, setNewTopic] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("MEDIA");
  const [dynamicPriority, setDynamicPriority] = useState(true);
  const [podcasts, setPodcasts] = useState<Record<string, boolean>>({
    "UBS On-Air": true,
    "Bloomberg Surveillance": false,
    "Odd Lots": false,
    "Macro Voices": false,
  });
  const [twitter, setTwitter] = useState(["@zerohedge", "@sentimentrader", "@MacroAlf"]);
  const [newTwitter, setNewTwitter] = useState("");
  const [polymarket, setPolymarket] = useState(true);
  const [resumenHora, setResumenHora] = useState("09:00");
  const [semanalDomingos, setSemanalDomingos] = useState(true);
  const [quizOn, setQuizOn] = useState(true);

  useEffect(() => {
    setQuizOn(isQuizEnabled());
  }, []);

  const toggleQuiz = (v: boolean) => {
    setQuizOn(v);
    setQuizEnabled(v);
  };

  const addTopic = () => {
    const t = newTopic.trim();
    if (t) setTopics((p) => [...p, { name: t, priority: newPriority }]);
    setNewTopic("");
  };
  const addTwitter = () => {
    const t = newTwitter.trim();
    if (t) setTwitter((p) => [...p, t.startsWith("@") ? t : `@${t}`]);
    setNewTwitter("");
  };

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("fuentes")!} />

      {/* Gmail + documentos + Synpulse + historial */}
      <SectionCard title="Documentos e integraciones de lectura">
        <DocumentsManager />
      </SectionCard>

      <SectionCard title="Suscripciones activas">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted mb-3">Podcasts</p>
        {Object.entries(podcasts).map(([name, on]) => (
          <ToggleRow key={name} label={name} checked={on} onChange={(v) => setPodcasts((p) => ({ ...p, [name]: v }))} />
        ))}
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted mb-3 mt-7">X (Twitter)</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {twitter.map((h, i) => (
            <span key={h} className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-card-border/50 border border-card-border">
              {h}
              <button onClick={() => setTwitter((p) => p.filter((_, x) => x !== i))} className="text-muted hover:opacity-70 cursor-pointer" aria-label={`Eliminar ${h}`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <InputField value={newTwitter} onChange={setNewTwitter} placeholder="@usuario" className="flex-1 sm:flex-none sm:w-56" />
          <button onClick={addTwitter} className="px-4 py-2 bg-white text-black text-[11px] uppercase tracking-[0.15em] font-semibold rounded-lg cursor-pointer">
            Añadir
          </button>
        </div>
        <div className="mt-7">
          <ToggleRow label="Polymarket (probabilidades)" checked={polymarket} onChange={setPolymarket} />
        </div>
      </SectionCard>

      <SectionCard title="Temas de seguimiento">
        <div className="flex flex-wrap gap-2 mb-5">
          {topics.map((t, i) => (
            <span key={`${t.name}-${i}`} className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${priorityColor[t.priority]}`}>
              {t.name}
              <span className="text-[10px] font-semibold opacity-80">{t.priority}</span>
              <button onClick={() => setTopics((p) => p.filter((_, x) => x !== i))} className="cursor-pointer hover:opacity-70" aria-label={`Eliminar ${t.name}`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <InputField value={newTopic} onChange={setNewTopic} placeholder="Nuevo tema..." className="flex-1" />
          <SelectField value={newPriority} onChange={(v) => setNewPriority(v as Priority)} options={(["ALTA", "MEDIA", "BAJA"] as const).map((v) => ({ value: v, label: v }))} className="sm:w-28" />
          <button onClick={addTopic} className="px-4 py-2 bg-white text-black text-[11px] uppercase tracking-[0.15em] font-semibold rounded-lg cursor-pointer">
            Añadir
          </button>
        </div>
        <ToggleRow label="Permitir subida dinámica de prioridad" checked={dynamicPriority} onChange={setDynamicPriority} />
      </SectionCard>

      <SectionCard title="Generación del briefing">
        <FieldRow label="Hora del briefing diario">
          <InputField value={resumenHora} onChange={setResumenHora} type="time" className="w-full sm:w-40" />
        </FieldRow>
        <ToggleRow label="Resumen semanal los domingos" checked={semanalDomingos} onChange={setSemanalDomingos} />
        <ToggleRow label="Quiz post-briefing (3 preguntas, repetición espaciada de fallos)" checked={quizOn} onChange={toggleQuiz} />
        <p className="text-[12px] text-muted leading-relaxed mt-4">
          La extensión de los resúmenes es adaptativa: el diario apunta a ~1 hora de lectura y el semanal a 2+ horas, expandiendo
          cada sección según tus fuentes suscritas y la relevancia para tu portfolio.
        </p>
      </SectionCard>
    </div>
  );
}
