"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Reusable primitives                                                */
/* ------------------------------------------------------------------ */

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      } ${checked ? "bg-accent" : "bg-card-border"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SectionCard({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-6 sm:p-8 ${
        danger
          ? "border-red/40 bg-red/[0.03]"
          : "border-card-border bg-card"
      }`}
    >
      <h2
        className={`text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-6 ${
          danger ? "text-red" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-card-border last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <div className="sm:text-right">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled = false,
  badge,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-card-border last:border-0">
      <span className="text-sm text-foreground flex items-center gap-2">
        {label}
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent-light font-medium">
            {badge}
          </span>
        )}
      </span>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${className}`}
    />
  );
}

function SelectField({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors appearance-none cursor-pointer ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/*  Topic type                                                         */
/* ------------------------------------------------------------------ */

type Priority = "ALTA" | "MEDIA" | "BAJA";

interface Topic {
  name: string;
  priority: Priority;
}

const priorityColor: Record<Priority, string> = {
  ALTA: "bg-red/15 text-red border-red/30",
  MEDIA: "bg-amber-500/15 text-[#ffd60a] border-amber-500/30",
  BAJA: "bg-green/15 text-green border-green/30",
};

const priorityBadge: Record<Priority, string> = {
  ALTA: "bg-red/25 text-red",
  MEDIA: "bg-amber-500/25 text-[#ffd60a]",
  BAJA: "bg-green/25 text-green",
};

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AjustesPage() {
  // -- Perfil --
  const [nombre, setNombre] = useState("Nico Giner");
  const [email, setEmail] = useState("nico.giner@email.com");
  const [timezone, setTimezone] = useState("Europa/Madrid");
  const [idioma, setIdioma] = useState("Español");

  // -- Temas de seguimiento --
  const [topics, setTopics] = useState<Topic[]>([
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

  const addTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    setTopics((prev) => [...prev, { name: trimmed, priority: newPriority }]);
    setNewTopic("");
  };

  const removeTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  // -- Fuentes --
  const [gmailEmail, setGmailEmail] = useState("nico.giner@gmail.com");
  const [gmailConnected] = useState(true);
  const [podcastToggles, setPodcastToggles] = useState({
    "UBS On-Air": true,
    "Bloomberg Surveillance": false,
    "Odd Lots": false,
    "Macro Voices": false,
  });
  const [twitterAccounts, setTwitterAccounts] = useState([
    "@zerohedge",
    "@sentimentrader",
    "@MacroAlf",
  ]);
  const [newTwitter, setNewTwitter] = useState("");
  const [polymarket, setPolymarket] = useState(true);
  const [bankChecks, setBankChecks] = useState({
    BBVA: true,
    Santander: false,
    CaixaBank: false,
  });

  const addTwitter = () => {
    const trimmed = newTwitter.trim();
    if (!trimmed) return;
    const handle = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
    setTwitterAccounts((prev) => [...prev, handle]);
    setNewTwitter("");
  };

  const removeTwitter = (index: number) => {
    setTwitterAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  // -- Resumen diario --
  const [resumenHora, setResumenHora] = useState("09:00");
  const [resumenTimezone, setResumenTimezone] = useState("Europa/Madrid");
  const [históricos, setHistoricos] = useState(true);
  const [contraargumentos, setContraargumentos] = useState(true);
  const [resumenSemanal, setResumenSemanal] = useState(false);

  // -- Portfolio --
  const [broker, setBroker] = useState("revolut");
  const [syncAuto] = useState(false);
  const [benchmarks, setBenchmarks] = useState({
    "S&P 500": true,
    "MSCI World": true,
    "IBEX 35": false,
    Nasdaq: true,
  });
  const [divisa, setDivisa] = useState("EUR");

  // -- Notificaciónes --
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifRecomendaciones, setNotifRecomendaciones] = useState(true);
  const [notifResumen, setNotifResumen] = useState(true);
  const [notifTemas, setNotifTemas] = useState(false);

  // -- Danger --
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [exported, setExported] = useState(false);
  const { logout } = useAuth();

  const handleExport = () => {
    const data = {
      perfil: { nombre, email, timezone, idioma },
      temas: topics,
      fuentes: { gmail: gmailEmail, podcasts: podcastToggles, twitter: twitterAccounts, polymarket, bancos: bankChecks },
      resumenDiario: { hora: resumenHora, timezone: resumenTimezone, históricos, contraargumentos, resumenSemanal },
      portfolio: { broker, benchmarks, divisa },
      notificaciones: { alertas: notifAlerts, recomendaciones: notifRecomendaciones, resumen: notifResumen, temas: notifTemas },
      exportadoEl: new Date().toISOString(),
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

  return (
    <main className="min-h-screen">

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-extralight tracking-wide">
            Ajustes
          </h1>
          <p className="text-muted text-sm mt-1">
            Configura tu experiencia en FinPulse
          </p>
        </div>

        {/* ============================================================= */}
        {/* 1. PERFIL                                                      */}
        {/* ============================================================= */}
        <SectionCard title="Perfil">
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-card-border">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent-light shrink-0">
              NG
            </div>
            <div>
              <p className="font-semibold text-lg">{nombre}</p>
              <p className="text-sm text-muted">{email}</p>
            </div>
          </div>

          <div className="space-y-0">
            <FieldRow label="Nombre">
              <InputField
                value={nombre}
                onChange={setNombre}
                className="w-full sm:w-64"
              />
            </FieldRow>
            <FieldRow label="Email">
              <InputField
                value={email}
                onChange={setEmail}
                type="email"
                className="w-full sm:w-64"
              />
            </FieldRow>
            <FieldRow label="Zona horaria">
              <SelectField
                value={timezone}
                onChange={setTimezone}
                options={[
                  { value: "Europa/Madrid", label: "Europa/Madrid" },
                  { value: "Europa/Londres", label: "Europa/Londres" },
                  { value: "America/New_York", label: "America/New York" },
                  { value: "America/Buenos_Aires", label: "America/Buenos Aires" },
                  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
                ]}
                className="w-full sm:w-64"
              />
            </FieldRow>
            <FieldRow label="Idioma">
              <SelectField
                value={idioma}
                onChange={setIdioma}
                options={[
                  { value: "Español", label: "Español" },
                  { value: "English", label: "English" },
                  { value: "Portugues", label: "Portugues" },
                ]}
                className="w-full sm:w-64"
              />
            </FieldRow>
          </div>
        </SectionCard>

        {/* ============================================================= */}
        {/* 2. TEMAS DE SEGUIMIENTO                                        */}
        {/* ============================================================= */}
        <SectionCard title="Temas de seguimiento">
          {/* Existing topics */}
          <div className="flex flex-wrap gap-2 mb-6">
            {topics.map((topic, i) => (
              <span
                key={`${topic.name}-${i}`}
                className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${priorityColor[topic.priority]}`}
              >
                {topic.name}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${priorityBadge[topic.priority]}`}
                >
                  {topic.priority}
                </span>
                <button
                  onClick={() => removeTopic(i)}
                  className="ml-0.5 hover:opacity-70 transition-opacity text-current"
                  aria-label={`Eliminar ${topic.name}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 4l6 6M10 4l-6 6" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {/* Add topic */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <InputField
              value={newTopic}
              onChange={setNewTopic}
              placeholder="Nuevo tema..."
              className="flex-1"
            />
            <SelectField
              value={newPriority}
              onChange={(v) => setNewPriority(v as Priority)}
              options={[
                { value: "ALTA", label: "ALTA" },
                { value: "MEDIA", label: "MEDIA" },
                { value: "BAJA", label: "BAJA" },
              ]}
              className="sm:w-28"
            />
            <button
              onClick={addTopic}
              className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
            >
              Añadir
            </button>
          </div>

          <ToggleRow
            label="Permitir subida dinamica de prioridad"
            checked={dynamicPriority}
            onChange={setDynamicPriority}
          />
        </SectionCard>

        {/* ============================================================= */}
        {/* 3. FUENTES DE INFORMACION                                      */}
        {/* ============================================================= */}
        <SectionCard title="Fuentes de información">
          {/* Gmail */}
          <div className="mb-6 pb-6 border-b border-card-border">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 text-foreground">Gmail</h3>
              <span
                className={`w-2 h-2 rounded-full ${
                  gmailConnected ? "bg-green" : "bg-red"
                }`}
              />
              <span className="text-xs text-muted">
                {gmailConnected ? "Conectado" : "No conectado"}
              </span>
            </div>
            <InputField
              value={gmailEmail}
              onChange={setGmailEmail}
              type="email"
              className="w-full sm:w-80"
            />
          </div>

          {/* Podcasts */}
          <div className="mb-6 pb-6 border-b border-card-border">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 text-foreground mb-3">
              Podcasts
            </h3>
            {Object.entries(podcastToggles).map(([name, on]) => (
              <ToggleRow
                key={name}
                label={name}
                checked={on}
                onChange={(v) =>
                  setPodcastToggles((prev) => ({ ...prev, [name]: v }))
                }
              />
            ))}
          </div>

          {/* X (Twitter) */}
          <div className="mb-6 pb-6 border-b border-card-border">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 text-foreground mb-3">
              X (Twitter)
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {twitterAccounts.map((handle, i) => (
                <span
                  key={handle}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-card-border/50 text-foreground border border-card-border"
                >
                  {handle}
                  <button
                    onClick={() => removeTwitter(i)}
                    className="hover:opacity-70 transition-opacity text-muted"
                    aria-label={`Eliminar ${handle}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M4 4l6 6M10 4l-6 6" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <InputField
                value={newTwitter}
                onChange={setNewTwitter}
                placeholder="@usuario"
                className="flex-1 sm:flex-none sm:w-56"
              />
              <button
                onClick={addTwitter}
                className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
              >
                Añadir
              </button>
            </div>
          </div>

          {/* Polymarket */}
          <div className="mb-6 pb-6 border-b border-card-border">
            <ToggleRow
              label="Polymarket"
              checked={polymarket}
              onChange={setPolymarket}
            />
          </div>

          {/* Informes bancarios */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 text-foreground mb-3">
              Informes bancarios
            </h3>
            <div className="space-y-2">
              {Object.entries(bankChecks).map(([bank, checked]) => (
                <label
                  key={bank}
                  className="flex items-center gap-3 py-2 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      checked
                        ? "bg-accent border-accent"
                        : "border-card-border group-hover:border-muted"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setBankChecks((prev) => ({
                        ...prev,
                        [bank]: !prev[bank as keyof typeof prev],
                      }));
                    }}
                  >
                    {checked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground">{bank}</span>
                </label>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ============================================================= */}
        {/* 4. RESUMEN DIARIO                                              */}
        {/* ============================================================= */}
        <SectionCard title="Resumen diario">
          <FieldRow label="Hora de generacion">
            <InputField
              value={resumenHora}
              onChange={setResumenHora}
              type="time"
              className="w-full sm:w-40"
            />
          </FieldRow>
          <FieldRow label="Zona horaria">
            <SelectField
              value={resumenTimezone}
              onChange={setResumenTimezone}
              options={[
                { value: "Europa/Madrid", label: "Europa/Madrid" },
                { value: "Europa/Londres", label: "Europa/Londres" },
                { value: "America/New_York", label: "America/New York" },
                { value: "America/Buenos_Aires", label: "America/Buenos Aires" },
              ]}
              className="w-full sm:w-64"
            />
          </FieldRow>
          <ToggleRow
            label="Incluir paralelos históricos"
            checked={históricos}
            onChange={setHistoricos}
          />
          <ToggleRow
            label="Incluir contraargumentos en recomendaciones"
            checked={contraargumentos}
            onChange={setContraargumentos}
          />
          <ToggleRow
            label="Resumen semanal los domingos"
            checked={resumenSemanal}
            onChange={setResumenSemanal}
          />
        </SectionCard>

        {/* ============================================================= */}
        {/* 5. PORTFOLIO                                                   */}
        {/* ============================================================= */}
        <SectionCard title="Portfolio">
          <FieldRow label="Broker principal">
            <SelectField
              value={broker}
              onChange={setBroker}
              options={[
                { value: "revolut", label: "Revolut" },
                { value: "interactive_brokers", label: "Interactive Brokers" },
                { value: "degiro", label: "DEGIRO" },
                { value: "trade_republic", label: "Trade Republic" },
                { value: "etoro", label: "eToro" },
              ]}
              className="w-full sm:w-64"
            />
          </FieldRow>
          <ToggleRow
            label="Sincronizacion automatica"
            checked={syncAuto}
            onChange={() => {}}
            disabled
            badge="Proximamente"
          />
          <div className="py-3 border-b border-card-border">
            <span className="text-sm text-muted block mb-3">
              Benchmarks para comparar
            </span>
            <div className="flex flex-wrap gap-3">
              {Object.entries(benchmarks).map(([name, checked]) => (
                <label
                  key={name}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      checked
                        ? "bg-accent border-accent"
                        : "border-card-border group-hover:border-muted"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setBenchmarks((prev) => ({
                        ...prev,
                        [name]: !prev[name as keyof typeof prev],
                      }));
                    }}
                  >
                    {checked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-foreground">{name}</span>
                </label>
              ))}
            </div>
          </div>
          <FieldRow label="Divisa principal">
            <SelectField
              value={divisa}
              onChange={setDivisa}
              options={[
                { value: "EUR", label: "EUR" },
                { value: "USD", label: "USD" },
                { value: "GBP", label: "GBP" },
              ]}
              className="w-full sm:w-40"
            />
          </FieldRow>
        </SectionCard>

        {/* ============================================================= */}
        {/* 6. NOTIFICACIONES                                              */}
        {/* ============================================================= */}
        <SectionCard title="Notificaciónes">
          <ToggleRow
            label="Alertas de portfolio (caidas >3%)"
            checked={notifAlerts}
            onChange={setNotifAlerts}
          />
          <ToggleRow
            label="Nuevas recomendaciones"
            checked={notifRecomendaciones}
            onChange={setNotifRecomendaciones}
          />
          <ToggleRow
            label="Resumen diario listo"
            checked={notifResumen}
            onChange={setNotifResumen}
          />
          <ToggleRow
            label="Cambios en temas de seguimiento"
            checked={notifTemas}
            onChange={setNotifTemas}
          />
        </SectionCard>

        {/* ============================================================= */}
        {/* 7. DANGER ZONE                                                 */}
        {/* ============================================================= */}
        <SectionCard title="Zona de peligro" danger>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-red/20">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Exportar todos mis datos
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Descarga un archivo JSON con toda tu información
                </p>
              </div>
              <button onClick={handleExport} className="px-4 py-2 border border-card-border text-sm font-medium rounded-lg hover:bg-card-border/30 transition-colors text-foreground shrink-0">
                {exported ? "✓ Exportado" : "Exportar datos"}
              </button>
            </div>
            <div className="flex flex-col gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-red">Eliminar cuenta</p>
                <p className="text-xs text-muted mt-0.5">
                  Esta accion es irreversible. Se eliminaran todos tus datos,
                  configuraciónes y resumen histórico.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <InputField
                  value={deleteConfirm}
                  onChange={setDeleteConfirm}
                  placeholder='Escribe "ELIMINAR" para confirmar'
                  className="flex-1"
                />
                <button
                  onClick={() => { if (deleteConfirm === "ELIMINAR") logout(); }}
                  disabled={deleteConfirm !== "ELIMINAR"}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
                    deleteConfirm === "ELIMINAR"
                      ? "bg-red text-white hover:bg-red/80"
                      : "bg-red/20 text-red/40 cursor-not-allowed"
                  }`}
                >
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </main>
  );
}
