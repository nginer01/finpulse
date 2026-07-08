"use client";

import { useSyncExternalStore } from "react";

/**
 * Devuelve true si el usuario ha pedido reducir el movimiento
 * (prefers-reduced-motion: reduce). SSR-safe (snapshot de servidor = false)
 * y sin setState dentro de efectos.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export default function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
