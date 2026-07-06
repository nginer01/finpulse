"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Breadcrumb } from "@/components/article/ArticleBits";
import { SETTINGS_SECTIONS, sectionBySlug } from "./sections";

export default function AjustesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/")[2] || "";
  const current = sectionBySlug(slug);

  return (
    <main className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb */}
        <Breadcrumb
          items={
            current
              ? [{ label: "Dashboard", href: "/" }, { label: "Ajustes", href: "/ajustes" }, { label: current.short }]
              : [{ label: "Dashboard", href: "/" }, { label: "Ajustes" }]
          }
        />

        {/* Header */}
        <div className="mt-8 mb-10">
          <h1 className="text-[2.2rem] sm:text-[2.6rem] font-extralight tracking-tight leading-none">Ajustes</h1>
          <p className="text-muted text-sm mt-3 tracking-wide">Configura tu experiencia en FinPulse</p>
        </div>

        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          {/* Sidebar (desktop) */}
          <nav className="hidden lg:block lg:sticky lg:top-24 lg:self-start" aria-label="Secciones de ajustes">
            <ul className="space-y-1">
              {SETTINGS_SECTIONS.map((s) => {
                const active = slug === s.slug;
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/ajustes/${s.slug}`}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[12px] uppercase tracking-[0.15em] font-semibold transition-all duration-300 ${
                        active ? "bg-white/[0.07] text-foreground" : "text-muted hover:text-foreground hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon name={s.icon} className="w-4 h-4 shrink-0" />
                      {s.short}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Nav mobile — pills scrollables, targets táctiles 44px+ */}
          <nav className="lg:hidden -mx-4 px-4 mb-8 overflow-x-auto" aria-label="Secciones de ajustes">
            <div className="flex gap-2 w-max pb-1">
              {SETTINGS_SECTIONS.map((s) => {
                const active = slug === s.slug;
                return (
                  <Link
                    key={s.slug}
                    href={`/ajustes/${s.slug}`}
                    className={`inline-flex items-center gap-2 min-h-[44px] rounded-full border px-5 text-[11px] uppercase tracking-[0.15em] font-semibold whitespace-nowrap transition-all duration-300 ${
                      active ? "bg-white text-black border-white" : "border-card-border text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon name={s.icon} className="w-3.5 h-3.5" />
                    {s.short}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Contenido */}
          <div className="min-w-0 pb-16">{children}</div>
        </div>
      </div>
    </main>
  );
}
