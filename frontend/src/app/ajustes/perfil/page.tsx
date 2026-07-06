"use client";

import { useState } from "react";
import { SettingsHero, SectionCard, FieldRow, InputField, SelectField, ToggleRow, ActionButton } from "../ui";
import { sectionBySlug } from "../sections";

export default function PerfilPage() {
  const [nombre, setNombre] = useState("Nico Giner");
  const [email, setEmail] = useState("nico.giner@email.com");
  const [timezone, setTimezone] = useState("Europa/Madrid");
  const [idioma, setIdioma] = useState("Español");
  const [twoFA, setTwoFA] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", repeat: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [saved, setSaved] = useState(false);

  const changePwd = () => {
    if (!pwd.current || pwd.next.length < 8) return setPwdMsg("La nueva contraseña debe tener al menos 8 caracteres.");
    if (pwd.next !== pwd.repeat) return setPwdMsg("Las contraseñas no coinciden.");
    setPwd({ current: "", next: "", repeat: "" });
    setPwdMsg("Contraseña actualizada (demo — pendiente de endpoint real).");
    setTimeout(() => setPwdMsg(""), 3500);
  };

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("perfil")!} />

      <SectionCard title="Identidad">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-card-border">
          <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-2xl font-extralight text-foreground shrink-0 tracking-wide">
            {nombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{nombre}</p>
            <p className="text-sm text-muted">{email}</p>
            <p className="text-[11px] text-muted/70 mt-1">Miembro desde enero 2026 · Plan Personal</p>
          </div>
        </div>
        <FieldRow label="Nombre">
          <InputField value={nombre} onChange={setNombre} className="w-full sm:w-64" />
        </FieldRow>
        <FieldRow label="Email">
          <InputField value={email} onChange={setEmail} type="email" className="w-full sm:w-64" />
        </FieldRow>
        <FieldRow label="Zona horaria">
          <SelectField
            value={timezone}
            onChange={setTimezone}
            options={["Europa/Madrid", "Europa/Londres", "America/New_York", "Asia/Tokyo"].map((v) => ({ value: v, label: v }))}
            className="w-full sm:w-64"
          />
        </FieldRow>
        <FieldRow label="Idioma">
          <SelectField
            value={idioma}
            onChange={setIdioma}
            options={["Español", "English", "Portugues"].map((v) => ({ value: v, label: v }))}
            className="w-full sm:w-64"
          />
        </FieldRow>
        <div className="pt-5">
          <ActionButton primary onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
            {saved ? "✓ Guardado" : "Guardar cambios"}
          </ActionButton>
        </div>
      </SectionCard>

      <SectionCard title="Seguridad">
        <ToggleRow
          label="Autenticación en dos pasos (2FA)"
          checked={twoFA}
          onChange={setTwoFA}
          badge={twoFA ? "Activada" : "Recomendado"}
        />
        <div className="pt-5">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Cambiar contraseña</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <InputField value={pwd.current} onChange={(v) => setPwd((p) => ({ ...p, current: v }))} type="password" placeholder="Contraseña actual" />
            <InputField value={pwd.next} onChange={(v) => setPwd((p) => ({ ...p, next: v }))} type="password" placeholder="Nueva contraseña" />
            <InputField value={pwd.repeat} onChange={(v) => setPwd((p) => ({ ...p, repeat: v }))} type="password" placeholder="Repite la nueva" />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <ActionButton onClick={changePwd}>Actualizar contraseña</ActionButton>
            {pwdMsg && <p className="text-[12px] text-muted">{pwdMsg}</p>}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
