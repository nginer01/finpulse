"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

function PulseLogoLarge() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke="#6366f1" strokeWidth="2.5" opacity="0.25" />
      <circle cx="40" cy="40" r="22" stroke="#6366f1" strokeWidth="2.5" opacity="0.55" />
      <circle cx="40" cy="40" r="9" fill="#6366f1" />
    </svg>
  );
}

function BeginnerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IntermediateIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="18" width="4" height="6" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="14" y="12" width="4" height="12" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="22" y="8" width="4" height="16" rx="1" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function AdvancedIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <polyline points="4,24 10,16 16,20 22,10 28,6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="6" r="2.5" fill="currentColor" />
    </svg>
  );
}

function RevolutIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="24" height="24" rx="6" stroke="#818cf8" strokeWidth="1.5" />
      <text x="14" y="18" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="700">R</text>
    </svg>
  );
}

function BrokerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <path d="M4 12h20" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function ManualIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 8v12M8 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckmarkAnimated() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-6">
      <svg width="80" height="80" viewBox="0 0 80 80" className="animate-[scale-in_0.5s_ease-out_forwards]">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          className="animate-[circle-draw_0.6s_ease-out_forwards]"
          strokeDasharray="226"
          strokeDashoffset="226"
          style={{ animation: "circle-draw 0.6s ease-out forwards" }}
        />
        <path
          d="M24 40l10 10 22-22"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="50"
          strokeDashoffset="50"
          style={{ animation: "check-draw 0.4s ease-out 0.5s forwards" }}
        />
      </svg>
    </div>
  );
}

function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const experienceLevels = [
  { id: "principiante", label: "Principiante", desc: "Estoy empezando a invertir", Icon: BeginnerIcon },
  { id: "intermedio", label: "Intermedio", desc: "Tengo experiencia con acciones y ETFs", Icon: IntermediateIcon },
  { id: "avanzado", label: "Avanzado", desc: "Uso opciones, futuros y analisis tecnico", Icon: AdvancedIcon },
] as const;

const portfolioOptions = [
  { id: "revolut", label: "Revolut", desc: "Importar CSV de operaciones", Icon: RevolutIcon, badge: "Recomendado" },
  { id: "broker", label: "Otro broker", desc: "Interactive Brokers, DEGIRO, Trade Republic...", Icon: BrokerIcon, badge: null },
  { id: "manual", label: "Empezar de cero", desc: "Añadire posiciones manualmente", Icon: ManualIcon, badge: null },
] as const;

const allTopics = [
  "Renta variable EEUU",
  "Renta variable Europa",
  "Mercados emergentes",
  "Semiconductores",
  "Inteligencia artificial",
  "Energia y petróleo",
  "Criptomonedas",
  "Renta fija",
  "Materias primas",
  "Inmobiliario",
  "Biotecnologia",
  "Sector financiero",
];

const experienceLabels: Record<string, string> = {
  principiante: "inversor principiante",
  intermedio: "inversor intermedio",
  avanzado: "inversor avanzado",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("intermedio");
  const [portfolio, setPortfolio] = useState("revolut");
  const [topics, setTopics] = useState<Set<string>>(
    new Set(["Renta variable EEUU", "Inteligencia artificial", "Semiconductores", "Renta variable Europa", "Energia y petróleo", "Criptomonedas"])
  );

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }
  function toggleTopic(t: string) {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <>
      {/* Inline keyframes for checkmark animation */}
      <style>{`
        @keyframes circle-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes check-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-slide-in {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .step-enter {
          animation: fade-slide-in 0.45s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Progress bar */}
        <div className="h-1 bg-card-border w-full">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 pt-8 pb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 h-2 bg-accent"
                  : i < step
                    ? "w-2 h-2 bg-accent/50"
                    : "w-2 h-2 bg-card-border"
              }`}
            />
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-lg">

            {/* -------- Step 1: Welcome -------- */}
            {step === 0 && (
              <div key="step0" className="step-enter text-center space-y-6">
                <div className="flex justify-center mb-2">
                  <PulseLogoLarge />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Bienvenido a <span className="text-accent">FinPulse</span>
                </h1>
                <p className="text-lg text-foreground/80">
                  Tu plataforma personal de inteligencia financiera
                </p>
                <p className="text-sm text-muted">
                  Aprende mientras inviertes
                </p>
                <div className="pt-4">
                  <button
                    onClick={next}
                    className="px-10 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-accent-light hover:opacity-90 transition-opacity text-base shadow-lg shadow-accent/20 cursor-pointer"
                  >
                    Empezar
                  </button>
                </div>
              </div>
            )}

            {/* -------- Step 2: Profile -------- */}
            {step === 1 && (
              <div key="step1" className="step-enter space-y-8">
                <div>
                  <button onClick={back} className="flex items-center gap-1 text-muted hover:text-foreground transition-colors text-sm cursor-pointer mb-6">
                    <ArrowLeft /> Atras
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Sobre ti
                  </h1>
                  <p className="text-muted text-sm mt-1">Personaliza tu experiencia</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted" htmlFor="onb-name">Tu nombre</label>
                  <input
                    id="onb-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Nicolas"
                    className="w-full bg-card border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/60 transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-muted">Nivel de experiencia</label>
                  <div className="grid gap-3">
                    {experienceLevels.map(({ id, label, desc, Icon }) => (
                      <button
                        key={id}
                        onClick={() => setExperience(id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          experience === id
                            ? "border-accent bg-accent/10 shadow-md shadow-accent/5"
                            : "border-card-border bg-card hover:border-muted/30"
                        }`}
                      >
                        <div className={experience === id ? "text-accent-light" : "text-muted"}>
                          <Icon />
                        </div>
                        <div>
                          <div className="font-medium text-foreground text-sm">{label}</div>
                          <div className="text-xs text-muted mt-0.5">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={next}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-accent-light hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            )}

            {/* -------- Step 3: Portfolio -------- */}
            {step === 2 && (
              <div key="step2" className="step-enter space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <button onClick={back} className="flex items-center gap-1 text-muted hover:text-foreground transition-colors text-sm cursor-pointer mb-6">
                      <ArrowLeft /> Atras
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Conecta tu portfolio
                    </h1>
                    <p className="text-muted text-sm mt-1">Importa tus posiciones o empieza de cero</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {portfolioOptions.map(({ id, label, desc, Icon, badge }) => (
                    <button
                      key={id}
                      onClick={() => setPortfolio(id)}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        portfolio === id
                          ? "border-accent bg-accent/10 shadow-md shadow-accent/5"
                          : "border-card-border bg-card hover:border-muted/30"
                      }`}
                    >
                      <div className={portfolio === id ? "text-accent-light" : "text-muted"}>
                        <Icon />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm flex items-center gap-2">
                          {label}
                          {badge && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-green/15 text-green px-2 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={next}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-accent-light hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 cursor-pointer"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={next}
                    className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    Saltar este paso
                  </button>
                </div>
              </div>
            )}

            {/* -------- Step 4: Topics -------- */}
            {step === 3 && (
              <div key="step3" className="step-enter space-y-8">
                <div>
                  <button onClick={back} className="flex items-center gap-1 text-muted hover:text-foreground transition-colors text-sm cursor-pointer mb-6">
                    <ArrowLeft /> Atras
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Que te interesa seguir?
                  </h1>
                  <p className="text-muted text-sm mt-1">Selecciona los temas para tu resumen diario</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allTopics.map((t) => {
                    const active = topics.has(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleTopic(t)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                          active
                            ? "bg-accent text-white shadow-md shadow-accent/20"
                            : "bg-card-border/50 text-muted hover:text-foreground hover:bg-card-border"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm text-muted">
                  <span className="text-accent font-semibold">{topics.size}</span> temas seleccionados
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={next}
                    disabled={topics.size === 0}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-accent-light hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={next}
                    className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    Saltar este paso
                  </button>
                </div>
              </div>
            )}

            {/* -------- Step 5: Done -------- */}
            {step === 4 && (
              <div key="step4" className="step-enter text-center space-y-6">
                <CheckmarkAnimated />

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Todo listo{name ? `, ${name}` : ""}!
                </h1>

                <div className="space-y-2 text-sm text-muted">
                  <p>Tu resumen diario se generara cada dia a las <span className="text-foreground font-medium">9:00 AM</span></p>
                  <p>Hemos configurado tu perfil como <span className="text-foreground font-medium">{experienceLabels[experience] ?? experience}</span></p>
                </div>

                {topics.size > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-muted mb-3 uppercase tracking-wider font-medium">Tus temas</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[...topics].map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 rounded-full text-xs bg-accent/15 text-accent-light font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Link
                    href="/"
                    className="inline-block px-10 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-accent-light hover:opacity-90 transition-opacity text-base shadow-lg shadow-accent/20"
                  >
                    Ir al dashboard
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
