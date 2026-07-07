"use client";

import { useState } from "react";
import Link from "next/link";
import { SettingsHero, SectionCard, FieldRow, SelectField, ActionButton } from "../ui";
import { sectionBySlug } from "../sections";

const CONNECTED = [
  { name: "Supabase", desc: "Base de datos y autenticación", status: "Operativo" },
  { name: "Railway API", desc: "Backend FastAPI (finpulse-production)", status: "Operativo" },
  { name: "yfinance", desc: "Precios y datos de mercado", status: "Operativo" },
  { name: "Polymarket", desc: "Probabilidades de eventos", status: "Operativo" },
  { name: "Claude API", desc: "Generación de briefings e IA", status: "Pendiente de API key" },
];

const LOGS = [
  { t: "09:00:12", ev: "GET /api/market/indices", st: "200" },
  { t: "09:00:08", ev: "POST /api/chat/briefing", st: "503" },
  { t: "08:59:41", ev: "GET /api/portfolio/positions", st: "200" },
  { t: "08:30:02", ev: "GET /api/market/quotes?tickers=IWDA,VUAA,BRT,EUNA,SEMI", st: "200" },
];

export default function IntegracionesPage() {
  const [broker, setBroker] = useState("revolut");
  const [benchmarks, setBenchmarks] = useState({ "S&P 500": true, "MSCI World": true, "IBEX 35": false, Nasdaq: true });
  const [divisa, setDivisa] = useState("EUR");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setApiKey(`fp_live_${rand}`);
  };

  const copyKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <SettingsHero section={sectionBySlug("integraciones")!} />

      <SectionCard title="Broker y portfolio">
        <FieldRow label="Broker principal">
          <SelectField
            value={broker}
            onChange={setBroker}
            options={[
              { value: "revolut", label: "Revolut" },
              { value: "interactive_brokers", label: "Interactive Brokers" },
              { value: "degiro", label: "DEGIRO" },
              { value: "trade_republic", label: "Trade Republic" },
            ]}
            className="w-full sm:w-64"
          />
        </FieldRow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-card-border">
          <div>
            <p className="text-sm text-foreground">Sincronización automática de operaciones</p>
            <p className="text-xs text-muted mt-0.5">
              Las compras/ventas entran solas al Decision Journal — por email de confirmación (Gmail dedicado) o CSV del historial.
            </p>
          </div>
          <Link
            href="/journal"
            className="shrink-0 text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/20 text-foreground rounded-full px-4 py-2 hover:bg-white hover:text-black transition-all duration-500"
          >
            Abrir Journal
          </Link>
        </div>
        <FieldRow label="Divisa principal">
          <SelectField value={divisa} onChange={setDivisa} options={["EUR", "USD", "GBP"].map((v) => ({ value: v, label: v }))} className="w-full sm:w-40" />
        </FieldRow>
        <div className="py-3">
          <span className="text-sm text-muted block mb-3">Benchmarks para comparar</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(benchmarks).map(([name, on]) => (
              <button
                key={name}
                onClick={() => setBenchmarks((p) => ({ ...p, [name]: !p[name as keyof typeof p] }))}
                className={`px-4 py-2 rounded-full border text-[11px] uppercase tracking-[0.15em] font-semibold transition-all duration-300 cursor-pointer ${
                  on ? "bg-white text-black border-white" : "border-card-border text-muted hover:text-foreground"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Servicios conectados">
        {CONNECTED.map((c, i) => (
          <div key={c.name} className={`flex items-center justify-between gap-4 py-3.5 ${i > 0 ? "border-t border-card-border" : ""}`}>
            <div>
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <p className="text-xs text-muted mt-0.5">{c.desc}</p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-1 rounded-full border ${
                c.status === "Operativo" ? "border-green/30 text-green" : "border-[#ffd60a]/30 text-[#ffd60a]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Operativo" ? "bg-green" : "bg-[#ffd60a]"}`} />
              {c.status}
            </span>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="API de FinPulse">
        <p className="text-[13px] text-muted leading-relaxed mb-4">
          Genera una clave para acceder a tus datos desde scripts propios (solo lectura). La clave se muestra una única vez.
        </p>
        {apiKey ? (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <code className="text-[12px] bg-background border border-card-border rounded-lg px-4 py-2.5 text-foreground break-all" style={{ fontVariantNumeric: "tabular-nums" }}>
              {apiKey}
            </code>
            <ActionButton onClick={copyKey}>{copied ? "✓ Copiada" : "Copiar"}</ActionButton>
          </div>
        ) : (
          <ActionButton primary onClick={generateKey}>Generar API key</ActionButton>
        )}
        <p className="text-[11px] text-muted/70 mt-3">Demo: la validación de claves requiere el endpoint del backend (pendiente).</p>
      </SectionCard>

      <SectionCard title="Últimas llamadas (log)">
        <div className="space-y-0">
          {LOGS.map((l, i) => (
            <div key={i} className={`flex items-center gap-4 py-2.5 text-[12px] ${i > 0 ? "border-t border-white/[0.05]" : ""}`} style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="text-muted w-16 shrink-0">{l.t}</span>
              <span className="flex-1 text-[#c8c8cd] truncate">{l.ev}</span>
              <span className={`shrink-0 font-semibold ${l.st === "200" ? "text-green" : "text-[#ffd60a]"}`}>{l.st}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
