"use client";

import Link from "next/link";
import { Icon } from "@/components/article/ArticleBits";
import { SETTINGS_SECTIONS } from "./sections";

/** Overview de Ajustes — acceso rápido a las 8 secciones. */
export default function AjustesOverview() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {SETTINGS_SECTIONS.map((s, i) => (
        <Link
          key={s.slug}
          href={`/ajustes/${s.slug}`}
          className="group relative rounded-2xl border border-card-border bg-card/60 p-6 overflow-hidden transition-all duration-300 hover:border-white/[0.2] hover:-translate-y-0.5 hover:shadow-[0_14px_50px_rgba(0,0,0,0.5)]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="absolute -right-4 -bottom-6 text-white/[0.05] transition-all duration-500 group-hover:text-white/[0.09] group-hover:scale-110">
            <Icon name={s.icon} className="w-24 h-24" />
          </div>
          <div className="relative">
            <span className="w-10 h-10 rounded-full border border-white/[0.12] flex items-center justify-center text-muted mb-5 transition-colors duration-300 group-hover:text-foreground group-hover:border-white/30">
              <Icon name={s.icon} className="w-4 h-4" />
            </span>
            <h2 className="text-[16px] font-medium tracking-wide text-foreground mb-1.5">{s.title}</h2>
            <p className="text-[13px] text-muted leading-relaxed">{s.desc}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold text-muted transition-all duration-300 group-hover:text-foreground group-hover:gap-3">
              Abrir
              <Icon name="arrow-right" className="w-3 h-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
