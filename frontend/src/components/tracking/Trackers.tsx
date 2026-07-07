"use client";

import { useEffect, useState } from "react";
import { track, isTrackingEnabled } from "@/lib/tracking";
import { Icon } from "@/components/article/ArticleBits";

/* ------------------------------------------------------------------ */
/*  DwellTracker — dwell time por sección via IntersectionObserver.    */
/*  Observa todos los nodos con [data-track-topic]; acumula segundos   */
/*  visibles (muestreo 1s, sin listeners de scroll) y emite el evento  */
/*  al salir de la página. data-track-tickers / data-track-negative    */
/*  clasifican interest vs concern.                                    */
/* ------------------------------------------------------------------ */

export function DwellTracker() {
  useEffect(() => {
    if (!isTrackingEnabled()) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-track-topic]"));
    if (!nodes.length) return;

    const visible = new Set<HTMLElement>();
    const seconds = new Map<HTMLElement, number>();

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting && e.intersectionRatio >= 0.4) visible.add(el);
          else visible.delete(el);
        }
      },
      { threshold: [0, 0.4] }
    );
    nodes.forEach((n) => obs.observe(n));

    // muestreo debounced: 1 tick/segundo, solo si la pestaña está activa
    const tick = setInterval(() => {
      if (document.hidden) return;
      visible.forEach((el) => seconds.set(el, (seconds.get(el) || 0) + 1));
    }, 1000);

    const emit = () => {
      seconds.forEach((secs, el) => {
        if (secs < 4) return; // pasó de largo
        track({
          eventType: "dwell",
          topic: el.dataset.trackTopic!,
          tickers: el.dataset.trackTickers?.split(",").filter(Boolean),
          negative: el.dataset.trackNegative === "1",
          durationSeconds: secs,
        });
      });
      seconds.clear();
    };

    window.addEventListener("pagehide", emit);
    return () => {
      clearInterval(tick);
      obs.disconnect();
      window.removeEventListener("pagehide", emit);
      emit();
    };
  }, []);

  return null;
}

/* ------------------------------------------------------------------ */
/*  TopicPulse — micro-feedback discreto (¿te interesa este tema?)     */
/* ------------------------------------------------------------------ */

export function TopicPulse({ topic }: { topic: string }) {
  const [voted, setVoted] = useState<null | "up" | "down">(null);

  const vote = (dir: "up" | "down") => {
    setVoted(dir);
    track({ eventType: dir === "up" ? "feedback_up" : "feedback_down", topic });
  };

  if (voted) {
    return <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted/60">Gracias — ajustamos tu briefing</span>;
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted/50">¿Te interesa este tema?</span>
      {(["up", "down"] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => vote(d)}
          aria-label={d === "up" ? "Me interesa" : "No me interesa"}
          className="w-7 h-7 rounded-full border border-white/[0.1] flex items-center justify-center text-muted/60 hover:text-foreground hover:border-white/30 transition-all duration-300 cursor-pointer"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={d === "down" ? { transform: "rotate(180deg)" } : undefined}>
            <path d="M7 11l5-7c1.2 0 2 .9 2 2v4h5.2c1 0 1.7.9 1.5 1.9l-1.2 6A2 2 0 0117.5 20H9a2 2 0 01-2-2v-7zM7 11H4v9h3" />
          </svg>
        </button>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SundayCheckin — pregunta dominical opcional y ligera               */
/* ------------------------------------------------------------------ */

const SUNDAY_TOPICS = ["semiconductores", "energía", "política monetaria", "aranceles", "biotech", "crypto", "defensa", "renta fija"];

function weekKey() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-w${Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)}`;
}

export function SundayCheckin() {
  const [show, setShow] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (new Date().getDay() !== 0) return; // solo domingos
        if (localStorage.getItem(`finpulse-sunday-${weekKey()}`)) return;
        setShow(true);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(`finpulse-sunday-${weekKey()}`, "1");
    } catch {}
    setShow(false);
  };

  const submit = () => {
    const topics = [...picked, ...(custom.trim() ? [custom.trim()] : [])];
    topics.forEach((t) => track({ eventType: "explicit_interest", topic: t }));
    setDone(true);
    setTimeout(dismiss, 1600);
  };

  return (
    <div className="rounded-2xl border border-card-border bg-card/60 p-6 sm:p-7 mb-12 animate-fade-in-up relative">
      <button type="button" onClick={dismiss} aria-label="Cerrar" className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors cursor-pointer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {done ? (
        <p className="text-[14px] text-foreground">Anotado — la próxima semana profundizamos ahí. Buen domingo.</p>
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-muted mb-2">Check-in dominical · opcional</p>
          <p className="text-[15px] text-foreground font-light mb-4">¿Qué temas quieres que profundicemos la próxima semana?</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUNDAY_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}
                className={`px-4 py-1.5 rounded-full border text-[11px] uppercase tracking-[0.12em] font-semibold transition-all duration-300 cursor-pointer ${
                  picked.includes(t) ? "bg-white text-black border-white" : "border-card-border text-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Otro tema (ej: uranio, small caps...)"
              className="flex-1 bg-background border border-card-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-white/40"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!picked.length && !custom.trim()}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white text-black rounded-full px-6 py-2.5 disabled:opacity-40 cursor-pointer"
            >
              <Icon name="check" className="w-3 h-3" /> Guardar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
