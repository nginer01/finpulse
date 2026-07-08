"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  isQuizEnabled,
  setQuizEnabled,
  loadQuizSession,
  answerQuiz,
  type QuizQuestion,
} from "@/lib/quiz";

/*
 * Modo quiz — 3 flashcards al final del briefing diario.
 * Opcional (toggle en Ajustes → Fuentes). Los fallos vuelven mañana
 * (repetición espaciada) y los temas fallados se profundizan en
 * próximos briefings via tracking.
 */

export default function QuizSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const on = isQuizEnabled();
    setEnabled(on);
    if (on) loadQuizSession(3).then((s) => setQuestions(s.questions));
  }, []);

  if (!enabled || questions === null || questions.length === 0) return null;

  const q = questions[Math.min(idx, questions.length - 1)];
  const finished = results.length === questions.length && picked === null;
  const correctCount = results.filter(Boolean).length;

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.correct_index;
    setResults((prev) => [...prev, correct]);
    answerQuiz(q, correct);
  };

  const next = () => {
    setPicked(null);
    if (idx < questions.length - 1) setIdx(idx + 1);
  };

  const disable = () => {
    setQuizEnabled(false);
    setEnabled(false);
  };

  return (
    <section className="max-w-[760px] mx-auto mt-16 mb-4" data-track-topic="quiz" data-quiz>
      <div className="rounded-2xl data-card p-7 sm:p-9">
        {/* Kicker */}
        <div className="flex items-center gap-4 mb-6">
          <span className="w-9 h-9 shrink-0 rounded-full border border-white/[0.12] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8c8cd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </span>
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted/80">Confirma tu comprensión</p>
          <div className="flex-1 h-px bg-white/[0.06]" />
          {/* Progreso */}
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                  i < results.length ? (results[i] ? "bg-green" : "bg-red") : i === idx && started ? "bg-white" : "bg-white/[0.15]"
                }`}
              />
            ))}
          </div>
        </div>

        {!started ? (
          /* Intro */
          <div>
            <p className="text-[17px] leading-[1.85] text-[#c8c8cd] mb-6">
              {questions.some((x) => x.is_review) ? (
                <>Hoy tienes <span className="text-foreground font-medium">{questions.filter((x) => x.is_review).length} repaso{questions.filter((x) => x.is_review).length > 1 ? "s" : ""}</span> de fallos anteriores y preguntas nuevas del briefing. </>
              ) : (
                <>{questions.length} preguntas sobre lo esencial del briefing de hoy. </>
              )}
              30 segundos — lo que falles volverá mañana hasta que lo domines.
            </p>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setStarted(true)}
                className="text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-7 py-3 hover:tracking-[0.3em] transition-all duration-500 cursor-pointer"
              >
                Empezar
              </button>
              <button
                onClick={disable}
                className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted/60 hover:text-muted transition-colors cursor-pointer"
              >
                No me interesa
              </button>
            </div>
          </div>
        ) : !finished ? (
          /* Pregunta */
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted/60" style={{ fontVariantNumeric: "tabular-nums" }}>
                {idx + 1} / {questions.length}
              </span>
              {q.is_review && (
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border border-[#ffd60a]/40 text-[#ffd60a]">
                  Repaso
                </span>
              )}
              {q.topic && (
                <span className="text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border border-white/[0.12] text-muted">
                  {q.topic}
                </span>
              )}
            </div>

            <p className="text-[19px] sm:text-[21px] font-extralight tracking-tight text-foreground leading-[1.5] mb-6">
              {q.question}
            </p>

            <div className="space-y-2.5 mb-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correct_index;
                const isPicked = picked === i;
                let cls = "border-white/[0.1] text-[#c8c8cd] hover:border-white/30 hover:text-foreground cursor-pointer";
                if (picked !== null) {
                  if (isCorrect) cls = "border-green/50 bg-green/[0.08] text-foreground";
                  else if (isPicked) cls = "border-red/50 bg-red/[0.08] text-foreground";
                  else cls = "border-white/[0.06] text-muted/50";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handlePick(i)}
                    disabled={picked !== null}
                    className={`w-full text-left flex items-center gap-3.5 rounded-xl border px-5 py-3.5 text-[14px] leading-relaxed transition-all duration-300 ${cls}`}
                  >
                    <span className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center text-[11px] font-semibold ${
                      picked !== null && isCorrect ? "border-green text-green" : picked !== null && isPicked ? "border-red text-red" : "border-white/20 text-muted"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="mt-5 animate-fade-in-up">
                <div className={`rounded-xl border px-5 py-4 mb-5 ${picked === q.correct_index ? "border-green/25 bg-green/[0.04]" : "border-red/25 bg-red/[0.04]"}`}>
                  <p className={`text-[10px] uppercase tracking-[0.25em] font-semibold mb-1.5 ${picked === q.correct_index ? "text-green" : "text-red"}`}>
                    {picked === q.correct_index ? "Correcto" : "No exactamente"}
                  </p>
                  <p className="text-[13px] leading-[1.8] text-[#c8c8cd]">{q.explanation}</p>
                  {picked !== q.correct_index && (
                    <p className="text-[11px] text-muted mt-2">Esta pregunta volverá mañana — y el briefing profundizará en {q.topic || "este tema"}.</p>
                  )}
                </div>
                <button
                  onClick={next}
                  className="text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-6 py-2.5 hover:tracking-[0.3em] transition-all duration-500 cursor-pointer"
                >
                  {results.length === questions.length ? "Ver resultado" : "Siguiente"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Resumen */
          <div>
            <p className="text-[34px] font-extralight tracking-tight text-foreground mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
              {correctCount} <span className="text-[16px] text-muted">de {questions.length}</span>
            </p>
            <p className="text-[14px] leading-[1.85] text-[#c8c8cd] mb-5 max-w-[520px]">
              {correctCount === questions.length
                ? "Comprensión sólida — las tres dominadas. Esto sube el eje de conocimiento de tu Investor DNA."
                : `${questions.length - correctCount} ${questions.length - correctCount === 1 ? "pregunta volverá" : "preguntas volverán"} mañana (repetición espaciada) y esos temas se profundizarán en tus próximos briefings.`}
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/aprendizaje"
                className="text-[10px] uppercase tracking-[0.25em] font-semibold border border-white/20 text-foreground rounded-full px-6 py-2.5 hover:bg-white hover:text-black transition-all duration-500"
              >
                Ver mi Investor DNA
              </Link>
              <button
                onClick={disable}
                className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted/60 hover:text-muted transition-colors cursor-pointer"
              >
                Desactivar quiz
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted/50 mt-2.5 text-center">
        Modo quiz opcional · se desactiva aquí o en Ajustes → Fuentes
      </p>
    </section>
  );
}
