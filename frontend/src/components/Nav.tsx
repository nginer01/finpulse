"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header className="border-b border-card-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <PulseIcon />
          <span className="text-lg font-semibold tracking-tight hidden sm:inline">FinPulse</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4 text-sm">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href === "/" && isResumen);
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
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent-light font-medium ml-1 sm:ml-2">NG</div>
        </nav>
      </div>
    </header>
  );
}
