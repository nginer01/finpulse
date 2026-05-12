"use client";

import { useState, useRef, useCallback } from "react";

export type UserPosition = {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  buyPrice: number;
  date: string;
  broker: string;
};

type Tab = "manual" | "csv";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

/* ──────────────────────────────────────────────
   CSV PARSER — supports Revolut format
   ────────────────────────────────────────────── */

function parseCSV(text: string): UserPosition[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const results: UserPosition[] = [];

  // Detect Revolut format: Date,Ticker,Type,Quantity,Price per share,Total Amount,...
  const isRevolut = header.includes("ticker") && header.includes("quantity") && (header.includes("price per share") || header.includes("price"));

  // Generic format: ticker,name,quantity,price,date,broker
  const isGeneric = header.includes("ticker") && header.includes("quantity");

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length < 3) continue;

    if (isRevolut) {
      // Revolut: Date,Ticker,Type,Quantity,Price per share,Total Amount,Currency,FX Rate
      const headerCols = lines[0].split(",").map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ""));
      const dateIdx = headerCols.findIndex((h) => h === "date");
      const tickerIdx = headerCols.findIndex((h) => h === "ticker");
      const typeIdx = headerCols.findIndex((h) => h === "type");
      const qtyIdx = headerCols.findIndex((h) => h.includes("quantity"));
      const priceIdx = headerCols.findIndex((h) => h.includes("price per share") || h === "price");

      const type = cols[typeIdx]?.toLowerCase() || "";
      if (type !== "buy" && type !== "compra") continue; // Only import buys

      const ticker = cols[tickerIdx] || "";
      const quantity = parseFloat(cols[qtyIdx]) || 0;
      const price = parseFloat(cols[priceIdx]) || 0;
      const date = cols[dateIdx] || "";

      if (ticker && quantity > 0) {
        results.push({
          id: generateId(),
          ticker: ticker.toUpperCase(),
          name: ticker.toUpperCase(),
          quantity,
          buyPrice: price,
          date,
          broker: "Revolut",
        });
      }
    } else if (isGeneric) {
      const headerCols = lines[0].split(",").map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ""));
      const tickerIdx = headerCols.findIndex((h) => h === "ticker");
      const nameIdx = headerCols.findIndex((h) => h === "name" || h === "nombre");
      const qtyIdx = headerCols.findIndex((h) => h.includes("quantity") || h.includes("cantidad"));
      const priceIdx = headerCols.findIndex((h) => h.includes("price") || h.includes("precio"));
      const dateIdx = headerCols.findIndex((h) => h.includes("date") || h.includes("fecha"));
      const brokerIdx = headerCols.findIndex((h) => h.includes("broker") || h.includes("plataforma"));

      const ticker = cols[tickerIdx] || "";
      const quantity = parseFloat(cols[qtyIdx]) || 0;
      const price = parseFloat(cols[priceIdx]) || 0;

      if (ticker && quantity > 0) {
        results.push({
          id: generateId(),
          ticker: ticker.toUpperCase(),
          name: nameIdx >= 0 ? cols[nameIdx] : ticker.toUpperCase(),
          quantity,
          buyPrice: price,
          date: dateIdx >= 0 ? cols[dateIdx] : "",
          broker: brokerIdx >= 0 ? cols[brokerIdx] : "Otro",
        });
      }
    }
  }

  return results;
}

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */

export default function AddPosition({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (positions: UserPosition[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("manual");

  // Manual form state
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [date, setDate] = useState("");
  const [broker, setBroker] = useState("Revolut");

  // CSV state
  const [csvPositions, setCsvPositions] = useState<UserPosition[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTicker(""); setName(""); setQuantity(""); setBuyPrice(""); setDate(""); setBroker("Revolut");
  };

  const handleManualSubmit = () => {
    if (!ticker || !quantity || !buyPrice) return;
    onAdd([{
      id: generateId(),
      ticker: ticker.toUpperCase(),
      name: name || ticker.toUpperCase(),
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      date,
      broker,
    }]);
    resetForm();
  };

  const handleFile = useCallback((file: File) => {
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setCsvPositions(parsed);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleImportCSV = () => {
    if (csvPositions.length > 0) {
      onAdd(csvPositions);
      setCsvPositions([]);
      setCsvFileName("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-card-border rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-card-border">
          <h2 className="font-semibold text-lg">Añadir posiciones</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors text-xl leading-none">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-card-border">
          <button
            onClick={() => setTab("manual")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "manual" ? "text-accent-light border-b-2 border-accent" : "text-muted hover:text-foreground"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setTab("csv")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "csv" ? "text-accent-light border-b-2 border-accent" : "text-muted hover:text-foreground"
            }`}
          >
            Importar CSV
          </button>
        </div>

        <div className="p-5">
          {tab === "manual" ? (
            <div className="space-y-4">
              {/* Ticker + Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Ticker *</label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="Ej: AAPL"
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Apple Inc."
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Quantity + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Cantidad *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ej: 10"
                    step="any"
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Precio de compra *</label>
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder="Ej: 178.50"
                    step="any"
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Date + Broker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Fecha de compra</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Broker / Plataforma</label>
                  <select
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="Revolut">Revolut</option>
                    <option value="Interactive Brokers">Interactive Brokers</option>
                    <option value="Trade Republic">Trade Republic</option>
                    <option value="DEGIRO">DEGIRO</option>
                    <option value="XTB">XTB</option>
                    <option value="eToro">eToro</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              {ticker && quantity && buyPrice && (
                <div className="bg-background border border-card-border rounded-lg p-3 text-xs text-muted">
                  <span className="text-foreground font-medium">{ticker.toUpperCase()}</span>
                  {" — "}{quantity} uds. a {buyPrice} = <span className="text-foreground font-medium">{(parseFloat(quantity) * parseFloat(buyPrice)).toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                  {" via "}{broker}
                </div>
              )}

              <button
                onClick={handleManualSubmit}
                disabled={!ticker || !quantity || !buyPrice}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors bg-accent text-white hover:bg-accent-light disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Añadir posicion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-accent bg-accent/5" : "border-card-border hover:border-accent/40"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <div className="text-3xl mb-3">&#128196;</div>
                <p className="text-sm font-medium mb-1">
                  {csvFileName || "Arrastra tu CSV aqui"}
                </p>
                <p className="text-xs text-muted">
                  o haz click para seleccionar archivo
                </p>
              </div>

              {/* Format info */}
              <div className="bg-background border border-card-border rounded-lg p-4 text-xs text-muted space-y-2">
                <p className="text-foreground font-medium text-sm">Formatos soportados:</p>
                <div>
                  <span className="text-accent-light">Revolut:</span> Ve a Stocks &gt; Mas &gt; Extractos &gt; Exportar CSV
                </div>
                <div>
                  <span className="text-accent-light">Generico:</span> CSV con columnas: ticker, name, quantity, price, date, broker
                </div>
              </div>

              {/* Parsed results */}
              {csvPositions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {csvPositions.length} posicion{csvPositions.length !== 1 ? "es" : ""} detectada{csvPositions.length !== 1 ? "s" : ""}
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {csvPositions.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-background border border-card-border rounded-lg px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-accent-light font-mono font-medium">{p.ticker}</span>
                          <span className="text-muted">{p.quantity} uds.</span>
                        </div>
                        <div className="text-right">
                          <span className="text-foreground">{(p.quantity * p.buyPrice).toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                          <span className="text-muted ml-2">{p.broker}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleImportCSV}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors bg-accent text-white hover:bg-accent-light"
                  >
                    Importar {csvPositions.length} posicion{csvPositions.length !== 1 ? "es" : ""}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
