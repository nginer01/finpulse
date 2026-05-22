"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AlertsPanel, { AlertsBadge } from "./AlertsPanel";
import SearchModal from "./SearchModal";

const links = [
  { href: "/", label: "Resumen" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/aprendizaje", label: "Aprendizaje" },
  { href: "/semanal", label: "Semanal" },
];

export default function Nav() {
  const pathname = usePathname();
  const isResumen = pathname === "/resumen";
  const isNoticia = pathname.startsWith("/noticia");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-[16px] tracking-[0.25em] uppercase font-semibold text-[#1d1d1f]" style={{ transform: "scaleY(0.88)", display: "inline-block" }}>
              FinPulse
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href === "/" && (isResumen || isNoticia));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 py-1.5 ${
                    isActive
                      ? "text-[#1d1d1f] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] after:bg-[#1d1d1f] after:rounded-full"
                      : "text-[#999] hover:text-[#1d1d1f]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-1 ml-1 sm:ml-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-1.5 rounded-lg hover:bg-black/[0.05] transition-colors hidden sm:flex items-center gap-2"
                title="Buscar (Ctrl+K)"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="8" cy="8" r="5.5" stroke="#86868b" strokeWidth="1.5" />
                  <path d="M12.5 12.5L16 16" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <kbd className="text-[10px] text-[#86868b] bg-black/[0.05] px-1.5 py-0.5 rounded hidden lg:inline">Ctrl+K</kbd>
              </button>
              <AlertsBadge count={3} onClick={() => setAlertsOpen(!alertsOpen)} />
              <Link
                href="/ajustes"
                className={`p-1.5 rounded-lg transition-colors ${
                  pathname === "/ajustes" ? "bg-black/[0.05]" : "hover:bg-black/[0.05]"
                }`}
                title="Ajustes"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" stroke={pathname === "/ajustes" ? "#1d1d1f" : "#86868b"} strokeWidth="1.5" />
                  <path d="M14.55 11.25a1.237 1.237 0 0 0 .248 1.365l.045.045a1.5 1.5 0 1 1-2.123 2.122l-.045-.045a1.237 1.237 0 0 0-1.365-.247 1.237 1.237 0 0 0-.75 1.132v.128a1.5 1.5 0 1 1-3 0v-.068a1.237 1.237 0 0 0-.81-1.132 1.237 1.237 0 0 0-1.365.247l-.045.045a1.5 1.5 0 1 1-2.122-2.122l.045-.045a1.237 1.237 0 0 0 .247-1.365 1.237 1.237 0 0 0-1.132-.75H2.25a1.5 1.5 0 0 1 0-3h.068a1.237 1.237 0 0 0 1.132-.81 1.237 1.237 0 0 0-.247-1.365l-.045-.045A1.5 1.5 0 1 1 5.28 3.158l.045.045a1.237 1.237 0 0 0 1.365.247h.06a1.237 1.237 0 0 0 .75-1.132V2.25a1.5 1.5 0 0 1 3 0v.068a1.237 1.237 0 0 0 .75 1.132 1.237 1.237 0 0 0 1.365-.247l.045-.045a1.5 1.5 0 1 1 2.122 2.122l-.045.045a1.237 1.237 0 0 0-.247 1.365v.06a1.237 1.237 0 0 0 1.132.75h.128a1.5 1.5 0 0 1 0 3h-.068a1.237 1.237 0 0 0-1.132.75z" stroke={pathname === "/ajustes" ? "#1d1d1f" : "#86868b"} strokeWidth="1.5" />
                </svg>
              </Link>
              <Link href="/ajustes" className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-xs text-white font-medium">NG</Link>
            </div>
          </nav>
        </div>
      </header>
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
