"use client";

/** Kit UI compartido de Ajustes — primitivas extraídas del antiguo monolito + hero por sección. */

import { Icon } from "@/components/article/ArticleBits";
import type { SettingsSection } from "./sections";

export function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      } ${checked ? "bg-accent" : "bg-card-border"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export function SectionCard({ title, children, danger = false }: { title?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-2xl border p-6 sm:p-8 ${danger ? "border-red/40 bg-red/[0.03]" : "border-card-border bg-card"}`}>
      {title && (
        <h2 className={`text-[11px] uppercase tracking-[0.2em] font-semibold mb-6 ${danger ? "text-red" : "text-foreground"}`}>{title}</h2>
      )}
      {children}
    </section>
  );
}

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-card-border last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <div className="sm:text-right">{children}</div>
    </div>
  );
}

export function ToggleRow({
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
        {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent-light font-medium">{badge}</span>}
      </span>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function InputField({
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

export function SelectField({
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

export function ActionButton({ children, onClick, primary = false, danger = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; primary?: boolean; danger?: boolean; disabled?: boolean }) {
  const base = "inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold px-5 py-2.5 rounded-full border transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const look = primary
    ? "bg-white text-black border-white hover:tracking-[0.25em]"
    : danger
    ? "border-red/40 text-red hover:border-red hover:bg-red/10"
    : "border-white/[0.2] text-foreground hover:border-white/50";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${look}`}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SettingsHero — cabecera visual por sección (SVG intencional,       */
/*  estilo Rolex: no stock photos genéricas)                           */
/* ------------------------------------------------------------------ */

export function SettingsHero({ section }: { section: SettingsSection }) {
  return (
    <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-card-border mb-8">
      {/* fondo por sección */}
      {section.slug === "tema" ? (
        // split light/dark — mitad crema (landing), mitad negro (app)
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-[#faf8f5] flex items-center justify-center">
            <span className="text-[13px] tracking-[0.3em] uppercase font-semibold text-[#1a1a1a]" style={{ transform: "scaleY(0.88)" }}>
              FinPulse
            </span>
          </div>
          <div className="w-1/2 bg-black flex items-center justify-center border-l border-white/10">
            <span className="text-[13px] tracking-[0.3em] uppercase font-semibold text-white" style={{ transform: "scaleY(0.88)" }}>
              FinPulse
            </span>
          </div>
        </div>
      ) : section.slug === "fuentes" ? (
        // collage tipográfico de cabeceras de prensa
        <div className="absolute inset-0 bg-gradient-to-br from-[#141416] to-black flex items-start justify-center pt-7">
          <div className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-3 px-8 opacity-50">
            <span className="text-[22px] text-white/80" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}>Financial Times</span>
            <span className="text-[20px] text-white/60 font-semibold tracking-tight">Bloomberg</span>
            <span className="text-[22px] text-white/75" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>THE WALL STREET JOURNAL.</span>
            <span className="text-[18px] text-white/55 font-bold tracking-widest">CNBC</span>
            <span className="text-[19px] text-white/65 font-semibold">Reuters</span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#161618] via-[#0c0c0d] to-black">
          {/* patrón de líneas finas */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden="true">
            <defs>
              <pattern id={`grid-${section.slug}`} width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0v48" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${section.slug})`} />
          </svg>
          {/* icono grande de la sección */}
          <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 text-white/[0.14]">
            <Icon name={section.icon} className="w-28 h-28 sm:w-32 sm:h-32" />
          </div>
        </div>
      )}

      {/* texto */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-6 sm:p-8 ${
          section.slug === "tema" || section.slug === "fuentes" ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent" : ""
        }`}
      >
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-semibold mb-2">Ajustes</p>
        <h1 className="text-[1.7rem] sm:text-[2.1rem] font-extralight tracking-tight text-white leading-none">{section.title}</h1>
      </div>
    </div>
  );
}
