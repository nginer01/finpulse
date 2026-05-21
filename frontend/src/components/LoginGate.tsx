"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * LoginGate — overlay that blocks scrolling after a certain percentage
 * of the page, prompting the user to log in.
 *
 * Usage: wrap a page's content with <LoginGate> to give a teaser.
 * The `teaserHeight` prop controls how much content is visible (in vh).
 */
export default function LoginGate({ children, teaserHeight = 60 }: { children: React.ReactNode; teaserHeight?: number }) {
  const [showGate, setShowGate] = useState(false);

  // TODO: replace with real auth check
  const isLoggedIn = false;

  useEffect(() => {
    if (isLoggedIn) return;
    const onScroll = () => {
      const threshold = window.innerHeight * (teaserHeight / 100);
      setShowGate(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [teaserHeight, isLoggedIn]);

  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="relative">
      <div style={{ maxHeight: `${teaserHeight + 30}vh`, overflow: "hidden" }} className="relative">
        {children}
        {/* Gradient fade at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-40" />
      </div>

      {/* Login prompt overlay */}
      <div className={`sticky bottom-0 left-0 right-0 z-50 transition-all duration-700 ${showGate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-8 sm:py-10">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-8 h-8 mx-auto mb-4 rounded-full border border-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.2" />
                <path d="M5 7V5a3 3 0 016 0v2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-white text-[16px] font-semibold tracking-wide mb-2">Contenido exclusivo para miembros</h3>
            <p className="text-white/50 text-[13px] leading-[1.8] mb-6 max-w-sm mx-auto">
              Inicia sesion o crea una cuenta para acceder al briefing completo, tu portfolio y todas las herramientas.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/login" className="bg-white text-[#1a1a1a] text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-3 rounded-lg hover:bg-white/90 transition-all duration-300">
                Iniciar sesion
              </Link>
              <Link href="/login" className="text-white/60 border border-white/20 text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-all duration-300">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
