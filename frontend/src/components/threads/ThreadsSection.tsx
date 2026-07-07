"use client";

import { useEffect, useState } from "react";
import { Kicker } from "@/components/article/ArticleBits";
import { H2, P } from "@/components/article/Typography";
import { loadThreads, threadAgeWeeks, type Thread } from "@/lib/threads";

/*
 * Hilos temporales — la memoria acumulativa del briefing.
 * Cada tema recurrente muestra dónde estamos hoy y, al expandir, su
 * evolución completa fecha a fecha (sin re-explicar desde cero) + outlook.
 */

const SIG_STYLE: Record<string, { dot: string; ring: string }> = {
  positivo: { dot: "bg-green", ring: "ring-green/25" },
  negativo: { dot: "bg-red", ring: "ring-red/25" },
  clave: { dot: "bg-[#ffd60a]", ring: "ring-[#ffd60a]/25" },
  neutral: { dot: "bg-white/50", ring: "ring-white/15" },
};

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function ThreadCard({ thread }: { thread: Thread }) {
  const [open, setOpen] = useState(false);
  const weeks = threadAgeWeeks(thread);
  const latest = thread.entries[thread.entries.length - 1];

  return (
    <article className="rounded-2xl border border-card-border bg-card/40 p-6 sm:p-7 hover:border-white/[0.14] transition-colors duration-500">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
        <h3 className="text-[16px] font-medium text-foreground tracking-wide">{thread.title}</h3>
        <span className="text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border border-white/[0.12] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
          Semana {weeks} · desde {fmtDate(thread.first_seen)}
        </span>
        {thread.tickers.map((t) => (
          <span key={t} className="text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border border-white/[0.12] text-[#c8c8cd]">
            {t}
          </span>
        ))}
      </div>

      {/* Dónde estamos hoy */}
      <p className="text-[14px] leading-[1.85] text-[#c8c8cd]">{thread.summary}</p>

      {/* Evolución */}
      {open && (
        <div className="mt-6 animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/70 mb-4">Cómo hemos llegado hasta aquí</p>
          <div className="relative pl-5 space-y-5">
            {/* Línea vertical */}
            <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-white/[0.08]" aria-hidden />
            {thread.entries.map((e, i) => {
              const style = SIG_STYLE[e.significance] || SIG_STYLE.neutral;
              const isLatest = i === thread.entries.length - 1;
              return (
                <div key={e.id} className="relative">
                  <span
                    className={`absolute -left-5 top-1.5 w-[11px] h-[11px] rounded-full ring-4 ${style.dot} ${style.ring} ${isLatest ? "animate-pulse" : ""}`}
                    style={{ boxShadow: "0 0 0 3px #0a0a0a" }}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.1em] shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {fmtDate(e.date)}
                    </span>
                    <span className={`text-[13.5px] leading-snug ${isLatest ? "text-foreground font-medium" : "text-[#c8c8cd]"}`}>
                      {e.headline}
                    </span>
                    {e.source && (
                      <span className="text-[9px] uppercase tracking-[0.12em] font-semibold text-muted/60">[{e.source}]</span>
                    )}
                  </div>
                  {e.detail && <p className="text-[12.5px] leading-[1.75] text-muted mt-1">{e.detail}</p>}
                </div>
              );
            })}
          </div>

          {/* Qué puede pasar */}
          {thread.outlook && (
            <div className="mt-6 border-l-2 border-white/[0.15] pl-4">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted/70 mb-1.5">Qué puede pasar</p>
              <p className="text-[13px] leading-[1.8] text-[#c8c8cd]">{thread.outlook}</p>
            </div>
          )}
        </div>
      )}

      {/* Pie */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
        >
          {open ? "Ocultar evolución" : `Ver evolución · ${thread.entries.length} hitos`}
        </button>
        {!open && latest && (
          <span className="text-[11px] text-muted/70 truncate">Último: {latest.headline}</span>
        )}
      </div>
    </article>
  );
}

export default function ThreadsSection() {
  const [threads, setThreads] = useState<Thread[] | null>(null);

  useEffect(() => {
    loadThreads().then((d) => setThreads(d.threads));
  }, []);

  if (!threads || threads.length === 0) return null;

  return (
    <section data-track-topic="hilos" data-audio-skip>
      <Kicker icon="thread">Hilos abiertos</Kicker>
      <H2>La memoria de tu briefing</H2>
      <P className="mb-8">
        Estos temas llevan semanas evolucionando en tu radar. Aquí no se re-explican desde cero: cada hilo guarda su
        historia y solo te cuenta qué ha cambiado.
      </P>
      <div className="space-y-4">
        {threads.map((t) => (
          <ThreadCard key={t.id} thread={t} />
        ))}
      </div>
    </section>
  );
}
