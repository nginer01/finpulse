"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getRelated } from "@/lib/news";

const sourceColors: Record<string, string> = {
  news: "border-rose-500/20 text-rose-400/80",
  newsletter: "border-blue-500/20 text-blue-400/80",
  podcast: "border-purple-500/20 text-purple-400/80",
  polymarket: "border-emerald-500/20 text-emerald-400/80",
  bank: "border-amber-500/20 text-[#ffd60a]/80",
  x: "border-white/10 text-white/40",
};

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-14">
      <div className="w-14 h-[1px] bg-white/[0.08]" />
      <div className="w-1.5 h-1.5 rounded-full border border-white/[0.12]" />
      <div className="w-14 h-[1px] bg-white/[0.08]" />
    </div>
  );
}

export default function NoticiaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const article = getArticle(id);
  if (!article) notFound();

  const related = getRelated(article);
  const relevanceColor = article.relevance.score >= 80 ? "#30d158" : article.relevance.score >= 60 ? "#ffd60a" : "#86868b";

  return (
    <main className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="w-full h-full will-change-transform animate-ken-burns">
            <img src={article.image} alt={article.headline} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 film-grain opacity-[0.03] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-6 pb-10 sm:pb-14 animate-fade-in-up">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60 font-semibold mb-4">
              {article.category} — {article.source.name}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-[3.2rem] font-extralight text-white tracking-tight leading-[1.15]">
              {article.headline}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* ── METADATA ── */}
        <section className="py-8 border-b border-white/[0.06] flex flex-wrap items-center gap-x-8 gap-y-4 animate-fade-in-up-delay">
          <span className={`text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-1 rounded-full border ${sourceColors[article.source.type] || "border-card-border text-muted"}`}>
            {article.source.name}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted/70 font-semibold">{article.date}</span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted/70 font-semibold">~{article.readingMinutes} min de lectura</span>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted/70 font-semibold">Relevancia para ti</span>
            <div className="w-20 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${article.relevance.score}%`, backgroundColor: relevanceColor }} />
            </div>
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: relevanceColor }}>{article.relevance.score}</span>
          </div>
        </section>

        {/* Why it matters to you */}
        <section className="py-8 border-b border-white/[0.06] animate-fade-in-up-delay">
          <div className="bg-card/60 border border-card-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-2">Por qué te importa</p>
              <p className="text-sm leading-7 text-foreground/90">{article.relevance.reason}</p>
            </div>
            {article.relevance.tickers.length > 0 && (
              <div className="flex gap-2 shrink-0">
                {article.relevance.tickers.map((t) => (
                  <Link key={t} href="/portfolio" className="text-[11px] px-3 py-1.5 rounded-full border border-white/[0.12] text-foreground/80 font-semibold hover:border-white/30 hover:text-foreground transition-colors duration-300">
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── BODY ── */}
        <article className="py-12 max-w-3xl mx-auto">
          {article.body.map((paragraph, i) => (
            <div key={i}>
              <p className={`leading-8 tracking-wide mb-7 ${i === 0 ? "text-[17px] text-foreground/90" : "text-[15px] text-muted"}`}>
                {paragraph}
              </p>
              {article.quote && i === Math.min(1, article.body.length - 2) && (
                <blockquote className="border-l-2 border-white/20 pl-6 py-3 my-10">
                  <p className="text-[17px] font-extralight italic leading-[1.9] text-foreground/85">&ldquo;{article.quote.text}&rdquo;</p>
                  <footer className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted/70 font-semibold">
                    {article.quote.author} — {article.quote.source}
                  </footer>
                </blockquote>
              )}
            </div>
          ))}
        </article>

        {/* ── IMPACT ON PORTFOLIO ── */}
        {article.impacts.length > 0 && (
          <>
            <SectionDivider />
            <section className="pb-4">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-6">Impacto en tu portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.impacts.map((impact) => (
                  <Link
                    key={impact.ticker}
                    href="/portfolio"
                    className={`bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:border-white/25 ${
                      impact.changePct > 0 ? "border-green/25" : impact.changePct < 0 ? "border-red/25" : "border-card-border"
                    } ${article.impacts.length % 2 !== 0 && impact === article.impacts[article.impacts.length - 1] ? "md:col-span-2" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-[11px] font-bold text-foreground">
                          {impact.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold">{impact.ticker}</p>
                          <p className="text-[12px] text-muted">{impact.name}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-semibold tabular-nums ${impact.changePct > 0 ? "text-green" : impact.changePct < 0 ? "text-red" : "text-muted"}`}>
                        {impact.changePct > 0 ? "+" : ""}{impact.changePct === 0 ? "~0" : impact.changePct.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[13px] text-muted leading-[1.8]">{impact.comment}</p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── RELATED ── */}
        <SectionDivider />
        <section className="pb-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80 mb-6">Noticias relacionadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/noticia/${rel.id}`}
                className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:border-white/25 transition-all duration-300"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={rel.image}
                    alt={rel.headline}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted/70 font-semibold mb-2">{rel.category} — {rel.source.name}</p>
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-white transition-colors line-clamp-3">
                    {rel.headline}
                  </h3>
                  <p className="text-[11px] text-muted mt-2">{rel.date} — {rel.readingMinutes} min</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BACK ── */}
        <div className="pb-16 pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground border border-white/[0.12] hover:border-white/30 rounded-lg px-8 py-3.5 transition-all duration-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver al dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
