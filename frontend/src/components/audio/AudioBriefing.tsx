"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  extractScript,
  estimateMinutes,
  pickSpanishVoice,
  speechAvailable,
  getSavedRate,
  saveRate,
  RATES,
  type AudioScript,
} from "@/lib/audio";
import { track } from "@/lib/tracking";

/*
 * Audio briefing — el briefing como podcast (Web Speech API, sin API keys).
 * Pill flotante "Escuchar" → reproductor fijo inferior con sección actual,
 * progreso, velocidad y saltar sección. La pausa se implementa como
 * cancel + reanudar en el chunk actual (los pause/resume nativos son
 * poco fiables entre navegadores); cada chunk es ~una frase, así que
 * la pérdida es imperceptible.
 */

type Status = "idle" | "playing" | "paused" | "ended";

export default function AudioBriefing({ title }: { title: string }) {
  const [available, setAvailable] = useState(false);
  const [script, setScript] = useState<AudioScript | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const statusRef = useRef<Status>("idle");
  const indexRef = useRef(0);
  const rateRef = useRef(1);
  const scriptRef = useRef<AudioScript | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const trackedRef = useRef(false);

  statusRef.current = status;

  // Disponibilidad + guión (tras montar, cuando el artículo ya está en el DOM)
  useEffect(() => {
    if (!speechAvailable()) return;
    setAvailable(true);
    setRate(getSavedRate());
    rateRef.current = getSavedRate();
    const t = setTimeout(() => {
      const s = extractScript();
      setScript(s);
      scriptRef.current = s;
    }, 600);
    // Las voces cargan async
    const loadVoice = () => {
      voiceRef.current = pickSpanishVoice();
    };
    loadVoice();
    speechSynthesis.addEventListener?.("voiceschanged", loadVoice);
    return () => {
      clearTimeout(t);
      speechSynthesis.removeEventListener?.("voiceschanged", loadVoice);
      speechSynthesis.cancel();
    };
  }, []);

  // No dejar la síntesis sonando al salir de la página
  useEffect(() => {
    const stop = () => speechSynthesis.cancel();
    window.addEventListener("pagehide", stop);
    return () => window.removeEventListener("pagehide", stop);
  }, []);

  const speakFrom = useCallback((i: number) => {
    const s = scriptRef.current;
    if (!s || i >= s.chunks.length) {
      setStatus("ended");
      return;
    }
    speechSynthesis.cancel();
    indexRef.current = i;
    setIndex(i);
    setStatus("playing");

    const utter = new SpeechSynthesisUtterance(s.chunks[i].text);
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.lang = voiceRef.current?.lang || "es-ES";
    utter.rate = rateRef.current;
    utter.onend = () => {
      // Solo encadenar si seguimos en reproducción (no tras pausa/cierre)
      if (statusRef.current === "playing" && indexRef.current === i) {
        speakFrom(i + 1);
      }
    };
    utter.onerror = () => {
      if (statusRef.current === "playing" && indexRef.current === i) {
        speakFrom(i + 1); // saltar el chunk problemático
      }
    };
    speechSynthesis.speak(utter);
  }, []);

  const play = () => {
    if (!scriptRef.current || scriptRef.current.chunks.length === 0) return;
    if (!trackedRef.current) {
      trackedRef.current = true;
      track({ eventType: "expand", topic: "audio briefing", source: "audio" });
    }
    speakFrom(status === "ended" ? 0 : indexRef.current);
  };

  const pause = () => {
    setStatus("paused");
    speechSynthesis.cancel(); // el chunk actual se relee al reanudar
  };

  const close = () => {
    speechSynthesis.cancel();
    setStatus("idle");
    setIndex(0);
    indexRef.current = 0;
  };

  const skipSection = () => {
    const s = scriptRef.current;
    if (!s) return;
    const current = s.chunks[indexRef.current]?.section;
    const next = s.chunks.findIndex((c, j) => j > indexRef.current && c.section !== current);
    if (next !== -1) speakFrom(next);
    else {
      speechSynthesis.cancel();
      setStatus("ended");
    }
  };

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
    saveRate(next);
    if (statusRef.current === "playing") speakFrom(indexRef.current); // aplicar ya
  };

  if (!available || !script || script.chunks.length === 0) return null;

  const totalMins = estimateMinutes(script.words, rate);
  const progress = script.chunks.length ? index / script.chunks.length : 0;
  const remainingMins = Math.max(1, Math.round(totalMins * (1 - progress)));
  const section = script.chunks[Math.min(index, script.chunks.length - 1)]?.section || "";
  const active = status !== "idle";

  return (
    <div data-audio-skip className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] w-auto max-w-[calc(100vw-24px)]">
      {!active ? (
        /* Pill de invitación */
        <button
          onClick={play}
          className="group flex items-center gap-3 rounded-full border border-white/[0.14] bg-[#131315]/95 backdrop-blur-md pl-2 pr-5 py-2 shadow-2xl shadow-black/50 hover:border-white/30 transition-all duration-500 cursor-pointer"
          aria-label="Escuchar el briefing en audio"
        >
          <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="black">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-foreground">
            Escuchar briefing
          </span>
          <span className="text-[11px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
            ~{totalMins} min
          </span>
        </button>
      ) : (
        /* Reproductor */
        <div className="flex items-center gap-4 rounded-full border border-white/[0.14] bg-[#131315]/95 backdrop-blur-md pl-2 pr-4 py-2 shadow-2xl shadow-black/50 min-w-[320px] sm:min-w-[460px]">
          <button
            onClick={status === "playing" ? pause : play}
            className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
            aria-label={status === "playing" ? "Pausar" : "Reproducir"}
          >
            {status === "playing" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="black">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="black">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-foreground truncate">
                {status === "ended" ? "Briefing completado" : section || title}
              </p>
              <span className="text-[10px] text-muted shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
                {status === "ended" ? "" : `${remainingMins} min`}
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-500"
                style={{ width: `${Math.round((status === "ended" ? 1 : progress) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={cycleRate}
            className="shrink-0 text-[10px] font-semibold text-muted hover:text-foreground border border-white/[0.12] rounded-full px-2.5 py-1 transition-colors duration-300 cursor-pointer"
            style={{ fontVariantNumeric: "tabular-nums" }}
            aria-label="Cambiar velocidad"
          >
            {rate}x
          </button>
          <button
            onClick={skipSection}
            className="shrink-0 text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
            aria-label="Saltar a la siguiente sección"
            title="Siguiente sección"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4l10 8-10 8V4zM19 5v14" />
            </svg>
          </button>
          <button
            onClick={close}
            className="shrink-0 text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
            aria-label="Cerrar reproductor"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
