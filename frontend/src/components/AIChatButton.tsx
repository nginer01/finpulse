"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const suggestions = [
  "Que es el VIX?",
  "Que significa P/E ratio?",
  "Que es un ETF?",
  "Que es el Sharpe ratio?",
  "Que significa dovish?",
  "Que es un stop-loss?",
];

// Mock AI responses — will be replaced by Claude API
const mockResponses: Record<string, string> = {
  "vix": "El **VIX** (Volatility Index) es conocido como el \"indice del miedo\". Mide la volatilidad esperada del S&P 500 en los próximos 30 dias.\n\n- **VIX < 15**: Mercado tranquilo, baja volatilidad (complacencia)\n- **VIX 15-25**: Volatilidad normal\n- **VIX 25-35**: Alta volatilidad, nerviosismo\n- **VIX > 35**: Panico en el mercado\n\nAhora mismo esta en 13.2, lo que indica complacencia extrema. Históricamente, esto suele preceder correcciones moderadas del 3-5%.",
  "p/e": "El **P/E ratio** (Price-to-Earnings) es la relacion entre el precio de una accion y sus beneficios por accion.\n\n**Formula**: Precio / Beneficio por accion\n\nEjemplo: Si una accion cuesta 100€ y gana 5€ por accion, su P/E es 20x.\n\n- **P/E < 15**: Barato (value)\n- **P/E 15-25**: Normal\n- **P/E > 25**: Caro (growth)\n\nTu posición en SEMI tiene un P/E de 32x — esta cara, pero los semiconductores en ciclo expansivo suelen justificar valoraciones altas.",
  "etf": "Un **ETF** (Exchange-Traded Fund) es un fondo de inversión que cotiza en bolsa como si fuera una accion.\n\n**Ventajas**:\n- Diversificación instantanea (un ETF puede tener cientos de acciones)\n- Comisiones muy bajas (0.07% - 0.50% anual)\n- Liquidez: compras y vendes en segundos\n\n**Tus ETFs**:\n- IWDA: replica el MSCI World (1.500+ empresas globales)\n- VUAA: replica el S&P 500 (500 mayores empresas EEUU)\n- EUNA: bonos gobierno europeo\n- SEMI: empresas de semiconductores",
  "sharpe": "El **Sharpe ratio** mide cuanto rendimiento extra obtienes por cada unidad de riesgo que asumes.\n\n**Formula**: (Rendimiento - Tasa libre de riesgo) / Volatilidad\n\n- **< 0.5**: Malo\n- **0.5 - 1.0**: Aceptable\n- **1.0 - 1.5**: Bueno\n- **> 1.5**: Excelente\n\nEn tu comparador, SEMI tiene Sharpe de 1.4 (bueno) vs VUAA con 1.2 (bueno). SEMI da mas retorno por unidad de riesgo, aunque es mas volatil.",
  "dovish": "**Dovish** (paloma) describe una postura de politica monetaria que favorece tipos de interes bajos y estimulos economicos. Lo opuesto es **hawkish** (halcon).\n\n- **Dovish**: \"La inflacion esta controlada, podemos bajar tipos\" → Bueno para bolsa y bonos\n- **Hawkish**: \"La inflacion es un problema, subimos tipos\" → Malo para bolsa\n\nEl BCE esta siendo dovish ahora — por eso Polymarket da un 73% a un recorte de tipos en junio. Esto beneficia a tu posición en EUNA (bonos europeos).",
  "stop-loss": "Un **stop-loss** es una orden automatica para vender un activo cuando su precio cae hasta un nivel que tu defines.\n\n**Ejemplo**: Tienes Brent a $76. Pones un stop-loss en $72. Si el precio baja a $72, se vende automaticamente.\n\n**Ventajas**: Limita perdidas, elimina la emocion de la decision\n**Desventajas**: Puede ejecutarse por volatilidad temporal y perderte la recuperacion\n\nPara tu posición en BRT, un stop-loss en $72 habria sido buena idea — es el soporte tecnico clave que mencionamos en el resumen diario.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("vix")) return mockResponses["vix"];
  if (lower.includes("p/e") || lower.includes("pe ratio") || lower.includes("price to earning") || lower.includes("price-to-earning")) return mockResponses["p/e"];
  if (lower.includes("etf")) return mockResponses["etf"];
  if (lower.includes("sharpe")) return mockResponses["sharpe"];
  if (lower.includes("dovish") || lower.includes("hawkish")) return mockResponses["dovish"];
  if (lower.includes("stop-loss") || lower.includes("stoploss") || lower.includes("stop loss")) return mockResponses["stop-loss"];
  if (lower.includes("brent") || lower.includes("petróleo") || lower.includes("oil")) {
    return "El **Brent** es el precio de referencia del petróleo crudo en Europa y buena parte del mundo (el equivalente en EEUU es el WTI).\n\nAhora mismo esta cayendo por las negociaciones Iran-EEUU. Si Iran vuelve al mercado con plena capacidad, añadira ~1.5M barriles/dia, lo que presionaria el precio a la baja.\n\nTu posición en BRT esta siendo afectada directamente. El paralelo histórico de 2015 (JCPOA) es preocupante: entonces el Brent cayo un 30% en 6 meses.";
  }
  if (lower.includes("bce") || lower.includes("tipo") || lower.includes("interes")) {
    return "El **BCE** (Banco Central Europeo) es quien decide los tipos de interes en la eurozona.\n\n**Tipos de interes**: Es el \"precio\" del dinero. Cuando el BCE sube tipos, pedir prestado es mas caro, y eso enfria la economia (y la bolsa). Cuando los baja, ocurre lo contrario.\n\nAhora el BCE esta en modo dovish (ver: que significa dovish). Polymarket da un 73% a un recorte de 25pb en junio. Esto seria positivo para tus bonos europeos (EUNA) y para la renta variable europea dentro de IWDA.";
  }
  return "Buena pregunta. Cuando conectemos la API de Claude, podre darte una respuesta detallada y personalizada sobre este tema, relacionandolo con tu portfolio y las noticias actuales.\n\nMientras tanto, puedes preguntarme sobre: VIX, P/E ratio, ETFs, Sharpe ratio, dovish/hawkish, stop-loss, Brent, BCE, o tipos de interes.";
}

function formatTime(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function renderMarkdown(text: string) {
  // Simple markdown: **bold** and \n\n for paragraphs, \n- for lists
  const parts = text.split("\n\n");
  return parts.map((block, i) => {
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="list-disc list-inside space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: item.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
    );
  });
}

const HIDDEN_ROUTES = ["/landing", "/login"];

export default function AIChatButton() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hola! Soy tu asistente financiero de FinPulse. Preguntame cualquier concepto que no entiendas — te lo explico conectado con tu portfolio y las noticias del dia.",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAIResponse(msg);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        time: formatTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  if (HIDDEN_ROUTES.includes(pathname) || !isLoggedIn) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
          open
            ? "bg-card border border-card-border rotate-0"
            : "bg-gradient-to-br from-accent to-accent-light shadow-accent/30"
        }`}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="#86868b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C7.03 3 3 6.58 3 11c0 2.52 1.37 4.76 3.5 6.2V21l3.2-1.78c.73.18 1.5.28 2.3.28 4.97 0 9-3.58 9-8s-4.03-8-9-8z" fill="white" />
            <circle cx="8.5" cy="11" r="1" fill="#f5f5f7" />
            <circle cx="12" cy="11" r="1" fill="#f5f5f7" />
            <circle cx="15.5" cy="11" r="1" fill="#f5f5f7" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[360px] max-w-[calc(100vw-40px)] bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in-up flex flex-col" style={{ height: "500px" }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-card-border flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C7.03 3 3 6.58 3 11c0 2.52 1.37 4.76 3.5 6.2V21l3.2-1.78c.73.18 1.5.28 2.3.28 4.97 0 9-3.58 9-8s-4.03-8-9-8z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">FinPulse IA</p>
              <p className="text-xs text-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-accent/20 rounded-2xl rounded-br-sm"
                    : "bg-background border border-card-border rounded-2xl rounded-bl-sm"
                } px-4 py-2.5`}>
                  <div className="text-xs text-muted leading-relaxed">
                    {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                  <p className="text-[10px] text-muted/50 mt-1 text-right">{msg.time}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background border border-card-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestións */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent-light hover:bg-accent/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-card-border flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Pregunta lo que no entiendas..."
              className="flex-1 bg-background border border-card-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center hover:bg-accent-light transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2l-4.5 12-2-5.5L2 6.5 14 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
