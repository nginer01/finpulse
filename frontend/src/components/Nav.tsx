"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AlertsPanel, { AlertsBadge } from "./AlertsPanel";

function PulseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="inline-block">
      <circle cx="16" cy="16" r="14" stroke="#6366f1" strokeWidth="2" opacity="0.3" />
      <circle cx="16" cy="16" r="8" stroke="#6366f1" strokeWidth="2" opacity="0.6" />
      <circle cx="16" cy="16" r="3" fill="#6366f1" />
    </svg>
  );
}

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

  return (
    <>
      <header className="border-b border-card-border sticky top-0 bg-background/80 backdrop-blur-md z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PulseIcon />
            <span className="text-lg font-semibold tracking-tight hidden sm:inline">FinPulse</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3 text-sm">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href === "/" && (isResumen || isNoticia));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-foreground bg-accent/10"
                      : "text-muted hover:text-foreground hover:bg-white/[0.03]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-1 ml-1 sm:ml-2">
              <AlertsBadge count={3} onClick={() => setAlertsOpen(!alertsOpen)} />
              <Link
                href="/ajustes"
                className={`p-1.5 rounded-lg transition-colors ${
                  pathname === "/ajustes" ? "bg-accent/10" : "hover:bg-white/[0.03]"
                }`}
                title="Ajustes"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" stroke={pathname === "/ajustes" ? "#818cf8" : "#71717a"} strokeWidth="1.5" />
                  <path d="M14.55 11.25a1.237 1.237 0 0 0 .248 1.365l.045.045a1.5 1.5 0 1 1-2.123 2.122l-.045-.045a1.237 1.237 0 0 0-1.365-.247 1.237 1.237 0 0 0-.75 1.132v.128a1.5 1.5 0 1 1-3 0v-.068a1.237 1.237 0 0 0-.81-1.132 1.237 1.237 0 0 0-1.365.247l-.045.045a1.5 1.5 0 1 1-2.122-2.122l.045-.045a1.237 1.237 0 0 0 .247-1.365 1.237 1.237 0 0 0-1.132-.75H2.25a1.5 1.5 0 0 1 0-3h.068a1.237 1.237 0 0 0 1.132-.81 1.237 1.237 0 0 0-.247-1.365l-.045-.045A1.5 1.5 0 1 1 5.28 3.158l.045.045a1.237 1.237 0 0 0 1.365.247h.06a1.237 1.237 0 0 0 .75-1.132V2.25a1.5 1.5 0 0 1 3 0v.068a1.237 1.237 0 0 0 .75 1.132 1.237 1.237 0 0 0 1.365-.247l.045-.045a1.5 1.5 0 1 1 2.122 2.122l-.045.045a1.237 1.237 0 0 0-.247 1.365v.06a1.237 1.237 0 0 0 1.132.75h.128a1.5 1.5 0 0 1 0 3h-.068a1.237 1.237 0 0 0-1.132.75z" stroke={pathname === "/ajustes" ? "#818cf8" : "#71717a"} strokeWidth="1.5" />
                </svg>
              </Link>
              <Link href="/ajustes" className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent-light font-medium">NG</Link>
            </div>
          </nav>
        </div>
      </header>
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </>
  );
}
