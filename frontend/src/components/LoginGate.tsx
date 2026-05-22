"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * LoginGate — shows a teaser of the content with a login prompt.
 * The `teaserHeight` prop controls how much content is visible (in vh).
 */
export default function LoginGate({ children, teaserHeight = 60 }: { children: React.ReactNode; teaserHeight?: number }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <>{children}</>;
  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="relative">
      <div style={{ maxHeight: `${teaserHeight + 20}vh`, overflow: "hidden" }} className="relative">
        {children}
        {/* Gradient fade at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-background via-background/98 to-transparent pointer-events-none z-40" />
      </div>

      {/* Login prompt — always visible */}
      <div className="relative z-50 -mt-16">
        <div className="max-w-md mx-auto px-6 text-center py-12">
          <div className="w-12 h-12 mx-auto mb-5 rounded-full border border-white/15 flex items-center justify-center bg-white/[0.03]">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.2" />
              <path d="M5 7V5a3 3 0 016 0v2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-white text-[18px] font-extralight tracking-wide mb-3">Crea tu cuenta para continuar</h3>
          <p className="text-white/40 text-[13px] leading-[1.9] mb-8 max-w-xs mx-auto">
            Accede al briefing completo, tu portfolio personalizado y todas las herramientas de FinPulse.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="bg-white text-[#1a1a1a] text-[11px] uppercase tracking-[0.2em] font-semibold px-10 py-3.5 rounded-lg hover:bg-white/90 transition-all duration-300">
              Crear cuenta
            </Link>
            <Link href="/login" className="text-white/50 text-[11px] uppercase tracking-[0.2em] font-semibold px-10 py-3.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all duration-300">
              Iniciar sesion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
