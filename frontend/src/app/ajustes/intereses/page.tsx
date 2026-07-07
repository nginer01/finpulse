"use client";

import { useEffect, useState } from "react";
import { SettingsHero, SectionCard, ToggleRow, ActionButton } from "../ui";
import { sectionBySlug } from "../sections";
import {
  computeProfile,
  adjustTopic,
  isTrackingEnabled,
  setTrackingEnabled,
  PROFILE_EVENT,
  type TopicScore,
} from "@/lib/tracking";

export default function InteresesPage() {
  const [profile, setProfile] = useState<TopicScore[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const refresh = () => {
      setProfile(computeProfile());
      setEnabled(isTrackingEnabled());
    };
    const t = setTimeout(refresh, 0);
    window.addEventListener(PROFILE_EVENT, refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener(PROFILE_EVENT, refresh);
    };
  }, []);

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("intereses")!} />

      <SectionCard title="Tracking de comportamiento">
        <ToggleRow
          label="Aprender de mi comportamiento en la app"
          checked={enabled}
          onChange={(v) => {
            setTrackingEnabled(v);
            setEnabled(v);
          }}
        />
        <p className="text-[12px] text-muted leading-relaxed mt-4">
          <span className="text-foreground font-medium">Qué registramos y para qué:</span> clicks en fuentes, tiempo de lectura
          por sección, secciones expandidas, guardados y tus respuestas del check-in dominical. Se usa exclusivamente para
          adaptar la profundidad de tus resúmenes — nada más. Distinguimos <span className="text-foreground">interés</span> (curiosidad,
          aprendizaje) de <span className="text-foreground">preocupación</span> (noticias negativas que tocan tu cartera): lo primero
          profundiza temas; lo segundo garantiza que lo que afecta a tu dinero siempre aparezca primero. Puedes apagarlo cuando
          quieras — la app funciona igual, solo que el briefing deja de adaptarse.
        </p>
      </SectionCard>

      <SectionCard title="Lo que la IA cree que te interesa">
        {profile.length === 0 ? (
          <p className="text-[13px] text-muted py-4">
            Aún no hay suficiente actividad. Lee el briefing, pincha en fuentes o responde al check-in del domingo y este perfil
            se irá construyendo solo.
          </p>
        ) : (
          <div className="space-y-5">
            {profile.map((t) => (
              <div key={t.topic}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[14px] font-medium text-foreground capitalize">{t.topic}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustTopic(t.topic, 15)}
                      title="Más interés"
                      className="w-7 h-7 rounded-full border border-white/[0.12] text-muted hover:text-foreground hover:border-white/40 transition-all cursor-pointer text-[13px]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTopic(t.topic, -15)}
                      title="Menos interés"
                      className="w-7 h-7 rounded-full border border-white/[0.12] text-muted hover:text-foreground hover:border-white/40 transition-all cursor-pointer text-[13px]"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTopic(t.topic, -999)}
                      title="Eliminar tema"
                      className="w-7 h-7 rounded-full border border-white/[0.12] text-muted hover:text-red hover:border-red/50 transition-all cursor-pointer text-[11px]"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted w-24 shrink-0">Interés</span>
                    <div className="flex-1 h-[4px] rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-[#6cb2ff] transition-all duration-700" style={{ width: `${t.interest}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground w-7 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{t.interest}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted w-24 shrink-0">Cartera</span>
                    <div className="flex-1 h-[4px] rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-[#ffd60a] transition-all duration-700" style={{ width: `${t.concern}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground w-7 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{t.concern}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-7 pt-5 border-t border-card-border flex items-center gap-4 flex-wrap">
          <ActionButton onClick={() => setProfile(computeProfile())}>Recalcular ahora</ActionButton>
          <p className="text-[11px] text-muted">
            Los scores suben con tu actividad y decaen solos (vida media: 14 días). Interés = profundiza el tema; Cartera = siempre
            se cubre primero.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
