"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Resumen",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
        <rect x="12" y="3" width="7" height="7" rx="1.5" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
        <rect x="3" y="12" width="7" height="7" rx="1.5" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
        <rect x="12" y="12" width="7" height="7" rx="1.5" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 17V9l4-3 4 5 4-7 4 4v9" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 19h16" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/aprendizaje",
    label: "Aprender",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
        <path d="M11 7v4l3 2" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/semanal",
    label: "Semanal",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="14" rx="2" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
        <path d="M3 8h16" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" />
        <path d="M7 4V2M15 4V2" stroke={active ? "#f5f5f7" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/ajustes",
    label: "Mas",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="5" r="1.5" fill={active ? "#f5f5f7" : "#86868b"} />
        <circle cx="11" cy="11" r="1.5" fill={active ? "#f5f5f7" : "#86868b"} />
        <circle cx="11" cy="17" r="1.5" fill={active ? "#f5f5f7" : "#86868b"} />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Don't show on onboarding
  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-card/95 backdrop-blur-md border-t border-card-border">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href === "/" && pathname === "/resumen");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-accent-light" : "text-muted"
              }`}
            >
              {tab.icon(isActive)}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
