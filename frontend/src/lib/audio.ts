/**
 * Audio briefing — TTS del briefing diario con la Web Speech API.
 * Sin dependencias ni API keys: las voces neurales de Edge/Windows en
 * español dan calidad podcast. La arquitectura (guión → chunks → cola)
 * permite enchufar un TTS de servidor (OpenAI/ElevenLabs) más adelante
 * sin tocar el reproductor.
 */

export type AudioChunk = {
  text: string;
  section: string; // kicker/título de la sección a la que pertenece
};

export type AudioScript = {
  chunks: AudioChunk[];
  sections: string[]; // orden de secciones (para saltar)
  words: number;
};

const RATE_KEY = "finpulse-audio-rate";
export const RATES = [1, 1.25, 1.5, 0.9];
const WPM_BASE = 165; // palabras/minuto aprox. de las voces es-ES a 1x

export function getSavedRate(): number {
  try {
    const r = parseFloat(localStorage.getItem(RATE_KEY) || "1");
    return RATES.includes(r) ? r : 1;
  } catch {
    return 1;
  }
}

export function saveRate(rate: number) {
  try {
    localStorage.setItem(RATE_KEY, String(rate));
  } catch {}
}

/** Divide un texto en frases de tamaño manejable para el sintetizador. */
export function chunkText(text: string, maxLen = 250): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  // Separar por frases conservando el delimitador
  const sentences = clean.match(/[^.!?…]+[.!?…]+["»)]*\s*|[^.!?…]+$/g) || [clean];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
    // Frase individual larguísima: cortar por comas
    while (current.length > maxLen * 1.6) {
      const cut = current.lastIndexOf(",", maxLen);
      if (cut < 40) break;
      chunks.push(current.slice(0, cut + 1).trim());
      current = current.slice(cut + 1);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Extrae el guión del artículo actual: recorre el <main> en orden de
 * documento tomando titulares y párrafos, y salta lo que no se lee
 * (sidebar, quiz, reproductor, charts, tablas de datos).
 */
export function extractScript(): AudioScript {
  const main = document.querySelector("main");
  if (!main) return { chunks: [], sections: [], words: 0 };

  const nodes = main.querySelectorAll<HTMLElement>("h1, h2, h3, p, blockquote");
  const chunks: AudioChunk[] = [];
  const sections: string[] = [];
  let currentSection = "Introducción";
  let words = 0;

  nodes.forEach((el) => {
    // Excluir sidebar, quiz, el propio reproductor y bloques marcados
    if (el.closest("aside, [data-audio-skip], [data-quiz], nav, header, footer")) return;
    if (el.closest("blockquote") && el.tagName === "P") return; // el blockquote entero se procesa una vez

    const text = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (!text || text.length < 3) return;

    const tag = el.tagName.toLowerCase();
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      // Ignorar labels/kickers cortos en mayúsculas repetitivos (ya se leerá el H2)
      if (text.length < 4) return;
      currentSection = text;
      if (!sections.includes(text)) sections.push(text);
      chunks.push({ text: `${text}.`, section: text });
      words += text.split(/\s+/).length;
      return;
    }

    // Párrafos muy cortos de UI (botones/etiquetas) fuera
    if (text.length < 45 && !/[.!?…]$/.test(text)) return;

    for (const piece of chunkText(text)) {
      chunks.push({ text: piece, section: currentSection });
      words += piece.split(/\s+/).length;
    }
  });

  return { chunks, sections, words };
}

/** Duración estimada en minutos para un nº de palabras y velocidad. */
export function estimateMinutes(words: number, rate = 1): number {
  return Math.max(1, Math.round(words / (WPM_BASE * rate)));
}

/** Mejor voz en español disponible (neurales de Edge primero). */
export function pickSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    if (lang === "es-es") s += 40;
    else if (lang.startsWith("es")) s += 25;
    if (name.includes("natural") || name.includes("online")) s += 20; // neurales de Edge
    if (name.includes("elvira") || name.includes("alvaro") || name.includes("dario")) s += 5;
    if (v.localService) s += 1;
    return s;
  };
  const best = [...voices].sort((a, b) => score(b) - score(a))[0];
  return score(best) > 0 ? best : best || null;
}

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
