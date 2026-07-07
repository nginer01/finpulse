"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AlertsPanel, { AlertsBadge } from "./AlertsPanel";
import SearchModal from "./SearchModal";

type NavChild = { label: string; href: string };
type NavGroup = { label: string; href: string; children?: NavChild[] };

const NAV_GROUPS: NavGroup[] = [
  { label: "Dashboard", href: "/" },
  {
    label: "Resumen",
    href: "/resumen",
    children: [
      { label: "Semanal", href: "/semanal" },
      { label: "Columna semanal", href: "/semanal/resumen" },
    ],
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    children: [
      { label: "Journal", href: "/journal" },
      { label: "Comparador", href: "/comparador" },
      { label: "Stress Test", href: "/stress-test" },
    ],
  },
  { label: "Recomendaciones", href: "/recomendaciones" },
  { label: "Aprendizaje", href: "/aprendizaje" },
];

const PUBLIC_ROUTES = ["/landing", "/login"];

function isGroupActive(group: NavGroup, pathname: string): boolean {
  if (group.href === "/") {
    return pathname === "/" || pathname.startsWith("/noticia");
  }
  if (pathname === group.href) return true;
  return (group.children ?? []).some((c) => pathname === c.href);
}

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close the mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (PUBLIC_ROUTES.includes(pathname) || !isLoggedIn) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity duration-300 shrink-0">
            <span
              className="text-[16px] tracking-[0.25em] uppercase font-semibold text-[#1d1d1f]"
              style={{ transform: "scaleY(0.88)", display: "inline-block" }}
            >
              FinPulse
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group, pathname);
              const hasChildren = !!group.children?.length;
              return (
                <div
                  key={group.href}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenDropdown(group.href)}
                  onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                >
                  <Link
                    href={group.href}
                    className={`relative inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 py-5 ${
                      active
                        ? "text-[#1d1d1f] after:absolute after:bottom-[14px] after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] after:bg-[#1d1d1f] after:rounded-full"
                        : "text-[#999] hover:text-[#1d1d1f]"
                    }`}
                  >
                    {group.label}
                    {hasChildren && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 10 10"
                        fill="none"
                        className={`transition-transform duration-300 ${openDropdown === group.href ? "rotate-180" : ""}`}
                      >
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown */}
                  {hasChildren && openDropdown === group.href && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-0 min-w-[210px]">
                      <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] py-2 overflow-hidden">
                        <Link
                          href={group.href}
                          className={`block px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-200 ${
                            pathname === group.href ? "text-[#1d1d1f] bg-black/[0.04]" : "text-[#999] hover:text-[#1d1d1f] hover:bg-black/[0.03]"
                          }`}
                        >
                          {group.label}
                        </Link>
                        <div className="h-px bg-[#f0f0f0] mx-4 my-1" />
                        {group.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-200 ${
                              pathname === child.href ? "text-[#1d1d1f] bg-black/[0.04]" : "text-[#999] hover:text-[#1d1d1f] hover:bg-black/[0.03]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 rounded-lg hover:bg-black/[0.05] transition-colors hidden sm:flex items-center gap-2"
              title="Buscar (Ctrl+K)"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#86868b" strokeWidth="1.5" />
                <path d="M12.5 12.5L16 16" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <AlertsBadge count={3} onClick={() => setAlertsOpen(!alertsOpen)} />
            <Link
              href="/ajustes"
              className={`hidden lg:block p-1.5 rounded-lg transition-colors ${
                pathname === "/ajustes" ? "bg-black/[0.05]" : "hover:bg-black/[0.05]"
              }`}
              title="Ajustes"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" stroke={pathname === "/ajustes" ? "#1d1d1f" : "#86868b"} strokeWidth="1.5" />
                <path d="M14.55 11.25a1.237 1.237 0 0 0 .248 1.365l.045.045a1.5 1.5 0 1 1-2.123 2.122l-.045-.045a1.237 1.237 0 0 0-1.365-.247 1.237 1.237 0 0 0-.75 1.132v.128a1.5 1.5 0 1 1-3 0v-.068a1.237 1.237 0 0 0-.81-1.132 1.237 1.237 0 0 0-1.365.247l-.045.045a1.5 1.5 0 1 1-2.122-2.122l.045-.045a1.237 1.237 0 0 0 .247-1.365 1.237 1.237 0 0 0-1.132-.75H2.25a1.5 1.5 0 0 1 0-3h.068a1.237 1.237 0 0 0 1.132-.81 1.237 1.237 0 0 0-.247-1.365l-.045-.045A1.5 1.5 0 1 1 5.28 3.158l.045.045a1.237 1.237 0 0 0 1.365.247h.06a1.237 1.237 0 0 0 .75-1.132V2.25a1.5 1.5 0 0 1 3 0v.068a1.237 1.237 0 0 0 .75 1.132 1.237 1.237 0 0 0 1.365-.247l.045-.045a1.5 1.5 0 1 1 2.122 2.122l-.045.045a1.237 1.237 0 0 0-.247 1.365v.06a1.237 1.237 0 0 0 1.132.75h.128a1.5 1.5 0 0 1 0 3h-.068a1.237 1.237 0 0 0-1.132.75z" stroke={pathname === "/ajustes" ? "#1d1d1f" : "#86868b"} strokeWidth="1.5" />
              </svg>
            </Link>
            <button
              onClick={logout}
              className="hidden lg:inline-flex ml-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#999] hover:text-[#c4001a] border border-[#e5e5e5] hover:border-[#c4001a]/40 rounded-lg px-3.5 py-1.5 transition-all duration-300"
              title="Cerrar sesión"
            >
              Salir
            </button>

            {/* Hamburger (mobile / tablet) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-black/[0.05] transition-colors"
              aria-label="Menú"
              aria-expanded={mobileOpen}
            >
              <div className="w-[18px] flex flex-col gap-[4px]">
                <span className={`h-[1.5px] bg-[#1d1d1f] rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[5.5px]" : ""}`} />
                <span className={`h-[1.5px] bg-[#1d1d1f] rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`h-[1.5px] bg-[#1d1d1f] rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[5.5px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[#f0f0f0] max-h-[calc(100vh-60px)] overflow-y-auto">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col">
              {NAV_GROUPS.map((group) => {
                const active = isGroupActive(group, pathname);
                return (
                  <div key={group.href} className="border-b border-[#f5f5f5] last:border-0">
                    <Link
                      href={group.href}
                      className={`block py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors ${
                        active ? "text-[#1d1d1f]" : "text-[#999]"
                      }`}
                    >
                      {group.label}
                    </Link>
                    {group.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block py-2.5 pl-5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors border-l border-[#e5e5e5] ml-1 mb-2 ${
                          pathname === child.href ? "text-[#1d1d1f]" : "text-[#bbb]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
              <Link
                href="/ajustes"
                className={`py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold border-b border-[#f5f5f5] ${
                  pathname === "/ajustes" ? "text-[#1d1d1f]" : "text-[#999]"
                }`}
              >
                Ajustes
              </Link>
              <button
                onClick={logout}
                className="py-3.5 text-left text-[11px] uppercase tracking-[0.2em] font-semibold text-[#c4001a]"
              >
                Cerrar sesión
              </button>
            </nav>
          </div>
        )}
      </header>
      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
