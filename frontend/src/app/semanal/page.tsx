"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const weekStats = [
  { label: "Portfolio", value: "+2.4%", sub: "+$308,12", icon: "chart" },
  { label: "Decisiones tomadas", value: "2", sub: "1 buena / 1 neutral", icon: "check" },
  { label: "Noticias procesadas", value: "87", sub: "de 142 relevantes", icon: "news" },
  { label: "Aprendizaje score", value: "72/100", sub: "+5 vs semana anterior", icon: "brain" },
];

type TimelineColor = "green" | "red" | "amber";

interface TimelineEvent {
  day: string;
  date: string;
  text: string;
  color: TimelineColor;
  impact: string;
}

const timeline: TimelineEvent[] = [
  { day: "Lunes", date: "5 mayo", text: "Mercados abren al alza tras rumores de acuerdo EEUU-China", color: "green", impact: "+0.8%" },
  { day: "Martes", date: "6 mayo", text: "IPC EEUU en linea con expectativas, mercados estables", color: "amber", impact: "+0.1%" },
  { day: "Miercoles", date: "7 mayo", text: "Nvidia presenta Blackwell Ultra, semiconductores disparan", color: "green", impact: "+1.2%" },
  { day: "Jueves", date: "8 mayo", text: "Financial Times filtra actas BCE, vendiste parte de BRT", color: "red", impact: "-0.3%" },
  { day: "Viernes", date: "9 mayo", text: "Acuerdo EEUU-China oficial, S&P máximos históricos", color: "green", impact: "+0.6%" },
];

const decisions = [
  {
    title: "Venta BRT",
    description: "Tu tesis fue correcta: Brent siguio cayendo despues de tu venta. Detectaste el volumen institucional de venta a tiempo.",
    score: 9,
    badge: "green" as const,
    badgeLabel: "Buena decision",
  },
  {
    title: "No compraste mas SEMI pese a la subida",
    description: "Decisión prudente. Esperas una caida para aumentar posicion. El sector sigue volatil y tu estrategia de esperar tiene sentido.",
    score: 7,
    badge: "amber" as const,
    badgeLabel: "Neutral",
  },
];

const recommendations = [
  { text: 'Semana pasada recomendamos "mantener VUAA"', result: "+2.1% esta semana", status: "ACERTADA" as const },
  { text: 'Semana pasada recomendamos "vigilar petróleo"', result: "Brent -3.8%", status: "ACERTADA" as const },
  { text: 'Hace 2 semanas recomendamos "comprar SEMI"', result: "+4.2% acumulado", status: "ACERTADA" as const },
];

const dnaTraits = [
  { name: "Disciplina", now: 78, lastWeek: 74, monthAgo: 65 },
  { name: "Control emocional", now: 65, lastWeek: 62, monthAgo: 58 },
  { name: "Analisis tecnico", now: 71, lastWeek: 66, monthAgo: 54 },
  { name: "Gestión de riesgo", now: 82, lastWeek: 80, monthAgo: 75 },
  { name: "Paciencia", now: 60, lastWeek: 58, monthAgo: 50 },
];

const objectives = [
  { text: "Vigilar IPC EEUU (martes 13)", priority: "alta" },
  { text: "Decidir si reducir mas BRT antes de OPEC+ (1 junio)", priority: "media" },
  { text: "Esperar caida en SEMI para aumentar posicion", priority: "media" },
  { text: "Revisar tesis sobre bonos europeos antes de reunion BCE", priority: "baja" },
];

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                             */
/* ------------------------------------------------------------------ */

function StatIcon({ type }: { type: string }) {
  if (type === "chart")
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 3h4v4" />
      </svg>
    );
  if (type === "check")
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (type === "news")
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    );
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

const dotColor: Record<TimelineColor, string> = {
  green: "bg-[var(--color-green)]",
  red: "bg-[var(--color-red)]",
  amber: "bg-amber-500",
};

const impactColor: Record<TimelineColor, string> = {
  green: "text-[var(--color-green)]",
  red: "text-[var(--color-red)]",
  amber: "text-amber-500",
};

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-[var(--color-card-border)]">
      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function SemanalPage() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [doneObjectives, setDoneObjectives] = useState<number[]>([]);

  const toggleObjective = (i: number) => {
    setDoneObjectives((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}>

      {/* ---- 1. HERO ---- */}
      <section className="relative w-full h-[340px] md:h-[400px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=400&fit=crop"
          alt="Financial markets"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.92) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <Link
            href="/semanal/resumen"
            className="group inline-flex items-center gap-3 px-6 py-3 mb-5 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
            style={{ background: "linear-gradient(135deg, rgba(245,245,247,0.15) 0%, rgba(245,245,247,0.08) 100%)", border: "1px solid rgba(245,245,247,0.2)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
              <rect x="2" y="3" width="16" height="14" rx="2" stroke="#f5f5f7" strokeWidth="1.5" />
              <path d="M2 7h16" stroke="#f5f5f7" strokeWidth="1.5" />
              <path d="M6 3V1M14 3V1" stroke="#f5f5f7" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 11h4M6 14h7" stroke="#f5f5f7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-accent-light">Leer resumen semanal completo</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#f5f5f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-2xl font-extralight tracking-wide mb-3">Semana del 5 al 11 de mayo 2026</h1>
          <p className="text-lg md:text-xl" style={{ color: "var(--color-muted)" }}>
            Tu semana en numeros
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 pb-24 -mt-10 relative z-20 space-y-16">
        {/* Breadcrumb */}
        <div className="pt-14">
          <Link href="/resumen" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver al briefing diario
          </Link>
        </div>

        {/* ---- 2. WEEK IN NUMBERS ---- */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weekStats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-5 border transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-card-border)" }}
              >
                <div className="flex items-center gap-3 mb-3" style={{ color: "var(--color-accent-light)" }}>
                  <StatIcon type={s.icon} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                    {s.label}
                  </span>
                </div>
                <p className="text-2xl font-extralight tracking-tight">{s.value}</p>
                <p className="text-sm mt-1" style={{ color: "var(--color-green)" }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 3. TIMELINE ---- */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-8">Lo que paso esta semana</h2>
          <div className="relative pl-8 md:pl-12">
            {/* vertical line */}
            <div className="absolute left-3 md:left-5 top-0 bottom-0 w-0.5" style={{ backgroundColor: "var(--color-card-border)" }} />

            <div className="space-y-6">
              {timeline.map((evt, i) => (
                <div
                  key={i}
                  className="relative cursor-pointer group"
                  onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                >
                  {/* dot */}
                  <div
                    className={`absolute -left-5 md:-left-7 top-1.5 w-4 h-4 rounded-full border-2 border-[var(--color-background)] ${dotColor[evt.color]} ring-4 ring-[var(--color-background)]`}
                  />
                  <div
                    className="rounded-xl p-5 border transition-all group-hover:border-[var(--color-accent)]"
                    style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-card-border)" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-semibold">
                        {evt.day} {evt.date}
                      </span>
                      <span className={`text-sm font-bold ${impactColor[evt.color]}`}>{evt.impact}</span>
                    </div>
                    <p style={{ color: "var(--color-muted)" }}>{evt.text}</p>
                    {expandedDay === i && (
                      <div className="mt-3 pt-3 text-sm" style={{ borderTop: "1px solid var(--color-card-border)", color: "var(--color-muted)" }}>
                        Impacto en tu portfolio: <span className={`font-semibold ${impactColor[evt.color]}`}>{evt.impact}</span> en el dia.{" "}
                        <Link href="/noticia/acuerdo-eeuu-china" onClick={(e) => e.stopPropagation()} className="text-accent-light hover:text-accent underline underline-offset-4 transition-colors">
                          Ver el analisis completo →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- 4. DECISIONS ---- */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-8">Tus decisiones esta semana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decisions.map((d) => (
              <div
                key={d.title}
                className="rounded-xl p-6 border"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-card-border)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80">{d.title}</h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      backgroundColor: d.badge === "green" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                      color: d.badge === "green" ? "var(--color-green)" : "#f59e0b",
                    }}
                  >
                    {d.badgeLabel}
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
                  {d.description}
                </p>
                {/* score bar */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                    Score
                  </span>
                  <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: "var(--color-card-border)" }}>
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${d.score * 10}%`,
                        backgroundColor: d.score >= 8 ? "var(--color-green)" : "var(--color-accent)",
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold">{d.score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 5. RECOMMENDATION TRACK RECORD ---- */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-2">Recomendaciones: como fueron</h2>
          <p className="mb-8 text-sm" style={{ color: "var(--color-muted)" }}>
            Score global: <span className="font-bold" style={{ color: "var(--color-green)" }}>78% acierto</span> (14/18)
          </p>
          <div className="space-y-4">
            {recommendations.map((r, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-5 border"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-card-border)" }}
              >
                <div>
                  <p className="font-medium">{r.text}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
                    Resultado: <span style={{ color: "var(--color-green)" }}>{r.result}</span>
                  </p>
                </div>
                <span
                  className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "var(--color-green)" }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 6. INVESTOR DNA ---- */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-8">Investor DNA - Evolucion</h2>
          <div
            className="rounded-xl p-6 border space-y-6"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-card-border)" }}
          >
            {/* legend */}
            <div className="flex flex-wrap gap-4 text-xs font-medium" style={{ color: "var(--color-muted)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} /> Esta semana
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-accent-light)", opacity: 0.5 }} /> Semana pasada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-card-border)" }} /> Hace 1 mes
              </span>
            </div>

            {dnaTraits.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{t.name}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--color-accent-light)" }}>
                    {t.now}%{" "}
                    <span className="text-xs font-normal" style={{ color: "var(--color-green)" }}>
                      (+{t.now - t.lastWeek})
                    </span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  <ProgressBar value={t.now} color="var(--color-accent)" />
                  <ProgressBar value={t.lastWeek} color="rgba(129,140,248,0.4)" />
                  <ProgressBar value={t.monthAgo} color="var(--color-card-border)" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- 7. LESSON OF THE WEEK ---- */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-8">Leccion de la semana</h2>
          <div
            className="relative rounded-xl overflow-hidden border"
            style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-card)" }}
          >
            {/* accent top bar */}
            <div className="h-1 w-full" style={{ backgroundColor: "var(--color-accent)" }} />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: "rgba(99,102,241,0.2)" }}
                >
                  <svg className="w-5 h-5" style={{ color: "var(--color-accent-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80">La importancia del timing en ventas</h3>
              </div>
              <p className="leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Tu venta de BRT el jueves fue excelente: detectaste el volumen institucional de venta antes de la caida.
                Esto demuestra que tu analisis tecnico esta mejorando.{" "}
                <span style={{ color: "var(--color-foreground)" }}>
                  Hace 2 meses, habrias mantenido la posición por miedo a vender demasiado pronto.
                </span>{" "}
                El crecimiento es claro y tu instinto cada vez esta mas alineado con los datos.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: "var(--color-green)" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Tu analisis tecnico mejoro un 17% en los ultimos 2 meses
              </div>
            </div>
          </div>
        </section>

        {/* ---- 8. OBJECTIVES ---- */}
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-8">Objetivos para la próxima semana</h2>
          <div className="space-y-4">
            {objectives.map((obj, i) => {
              const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
                alta: { bg: "rgba(239,68,68,0.15)", text: "var(--color-red)", label: "Alta" },
                media: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", label: "Media" },
                baja: { bg: "rgba(99,102,241,0.15)", text: "var(--color-accent-light)", label: "Baja" },
              };
              const ps = priorityStyles[obj.priority];
              const done = doneObjectives.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleObjective(i)}
                  className="w-full text-left flex items-center gap-4 rounded-xl p-5 border transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: done ? "rgba(48,209,88,0.35)" : "var(--color-card-border)",
                  }}
                >
                  {/* checkbox circle */}
                  <div
                    className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    style={{
                      borderColor: done ? "var(--color-green)" : "var(--color-card-border)",
                      backgroundColor: done ? "rgba(48,209,88,0.15)" : "transparent",
                    }}
                  >
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <p className={`flex-1 font-medium transition-all duration-300 ${done ? "line-through opacity-50" : ""}`}>{obj.text}</p>
                  <span
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{ backgroundColor: ps.bg, color: ps.text }}
                  >
                    {ps.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
