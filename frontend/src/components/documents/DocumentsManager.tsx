"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/article/ArticleBits";
import { DocModal, FILE_ICON, ORIGIN_ICON, relevanceColor } from "@/components/documents/DocumentsPanel";
import {
  loadDocs,
  saveDocs,
  sortDocs,
  ORIGIN_LABEL,
  type UserDoc,
  type DocFileType,
} from "@/lib/documents";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const GMAIL_KEY = "finpulse-gmail-conn";

interface GmailConn {
  email: string;
  connectedAt: string;
  lastSync: string;
}

function nowLabel() {
  return new Date().toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function todayShort() {
  return new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
}

function extToType(name: string): DocFileType {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "img";
  if (["doc", "docx"].includes(ext)) return "docx";
  if (["txt", "md"].includes(ext)) return "txt";
  return "txt";
}

function mockProcessedDoc(partial: Partial<UserDoc> & Pick<UserDoc, "id" | "title" | "origin" | "sourceName" | "fileType">): UserDoc {
  return {
    snippet: "Procesado por la IA — resumen generado a partir del contenido extraído del documento.",
    summary:
      "Resumen simulado (mock). En el pipeline real, el contenido se extrae del documento (parsing de PDF, OCR de imágenes o lectura del HTML), se envía a Claude con el contexto de tu portfolio, y aquí aparece un resumen de 200-300 palabras con el tema principal, los datos clave, la relevancia para tus posiciones, la fuente y la fecha. Ver docs/documentos-pipeline.md para el contrato del backend.",
    date: todayShort(),
    dateISO: new Date().toISOString().slice(0, 10),
    relevance: 55 + Math.floor(Math.random() * 30),
    tags: ["pendiente de pipeline"],
    tickers: [],
    status: "procesado",
    ...partial,
  };
}

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  done: boolean;
}

/* ------------------------------------------------------------------ */
/*  Componente principal — sección "Mis Documentos" de /ajustes        */
/* ------------------------------------------------------------------ */

export default function DocumentsManager() {
  const [docs, setDocs] = useState<UserDoc[]>([]);
  const [gmail, setGmail] = useState<GmailConn | null>(null);
  const [gmailModal, setGmailModal] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("news.finpulse@gmail.com");
  const [syncing, setSyncing] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [synFolder, setSynFolder] = useState<string | null>(null);
  const [synFiles, setSynFiles] = useState<string[]>([]);
  const [synScanning, setSynScanning] = useState(false);
  const [synLastSync, setSynLastSync] = useState<string | null>(null);
  const [fsApiAvailable, setFsApiAvailable] = useState(false);
  const [openDoc, setOpenDoc] = useState<UserDoc | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  /* ---- init: estado persistido en localStorage, tras el primer paint ---- */
  useEffect(() => {
    const init = () => {
      setDocs(loadDocs());
      setFsApiAvailable("showDirectoryPicker" in window);
      try {
        const raw = localStorage.getItem(GMAIL_KEY);
        if (raw) setGmail(JSON.parse(raw));
        const syn = localStorage.getItem("finpulse-synpulse");
        if (syn) {
          const parsed = JSON.parse(syn);
          setSynFolder(parsed.folder ?? null);
          setSynLastSync(parsed.lastSync ?? null);
        }
      } catch {}
    };
    const t = setTimeout(init, 0);
    const timers = timersRef.current;
    return () => {
      clearTimeout(t);
      timers.forEach(clearInterval);
    };
  }, []);

  const persistDocs = useCallback((next: UserDoc[]) => {
    setDocs(next);
    saveDocs(next);
  }, []);

  /* ---- Gmail (mock OAuth) ---- */
  const connectGmail = () => {
    const conn: GmailConn = { email: gmailEmail.trim(), connectedAt: nowLabel(), lastSync: nowLabel() };
    setGmail(conn);
    try {
      localStorage.setItem(GMAIL_KEY, JSON.stringify(conn));
    } catch {}
    setGmailModal(false);
  };

  const disconnectGmail = () => {
    setGmail(null);
    try {
      localStorage.removeItem(GMAIL_KEY);
    } catch {}
  };

  const syncGmail = () => {
    if (!gmail) return;
    setSyncing(true);
    setTimeout(() => {
      const updated = { ...gmail, lastSync: nowLabel() };
      setGmail(updated);
      try {
        localStorage.setItem(GMAIL_KEY, JSON.stringify(updated));
      } catch {}
      setSyncing(false);
    }, 1800);
  };

  /* ---- Upload manual ---- */
  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((f, idx) => {
      const uid = `u-${Date.now()}-${idx}`;
      setUploads((prev) => [...prev, { id: uid, name: f.name, progress: 0, done: false }]);
      const timer = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) => {
            if (u.id !== uid || u.done) return u;
            const next = Math.min(100, u.progress + 8 + Math.random() * 18);
            if (next >= 100) {
              clearInterval(timer);
              // al completar: alta del documento + retirada de la barra tras un beat
              setTimeout(() => {
                persistDocs([
                  mockProcessedDoc({
                    id: `doc-${uid}`,
                    title: f.name,
                    origin: "upload",
                    sourceName: `Subida manual (${f.name.split(".").pop()?.toUpperCase()})`,
                    fileType: extToType(f.name),
                  }),
                  ...loadDocs(),
                ]);
                setUploads((p) => p.filter((x) => x.id !== uid));
              }, 900);
              return { ...u, progress: 100, done: true };
            }
            return { ...u, progress: next };
          })
        );
      }, 180);
      timersRef.current.push(timer);
    });
  };

  /* ---- URL ---- */
  const addUrl = () => {
    const raw = urlInput.trim();
    if (!raw) return;
    let parsed: URL;
    try {
      parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    } catch {
      setUrlError("URL no válida");
      return;
    }
    setUrlError("");
    persistDocs([
      mockProcessedDoc({
        id: `doc-url-${Date.now()}`,
        title: `Artículo: ${parsed.hostname}${parsed.pathname !== "/" ? parsed.pathname : ""}`,
        origin: "url",
        sourceName: parsed.hostname,
        fileType: "html",
        url: parsed.href,
      }),
      ...loadDocs(),
    ]);
    setUrlInput("");
  };

  /* ---- Carpeta Synpulse (File System Access API) ---- */
  const pickSynpulseFolder = async () => {
    try {
      // API solo en Chromium; feature-detect arriba
      const w = window as unknown as { showDirectoryPicker: (o?: object) => Promise<FileSystemDirectoryHandle> };
      const handle = await w.showDirectoryPicker({ mode: "read" });
      setSynScanning(true);
      const found: string[] = [];
      const dir = handle as unknown as { values: () => AsyncIterable<{ kind: string; name: string }> };
      for await (const entry of dir.values()) {
        if (entry.kind !== "file") continue;
        const ext = entry.name.split(".").pop()?.toLowerCase() || "";
        if (["pdf", "png", "jpg", "jpeg", "docx", "doc", "txt", "md"].includes(ext)) found.push(entry.name);
        if (found.length >= 50) break;
      }
      setSynFolder(handle.name);
      setSynFiles(found);
      setSynScanning(false);
      try {
        localStorage.setItem("finpulse-synpulse", JSON.stringify({ folder: handle.name, lastSync: synLastSync }));
      } catch {}
    } catch {
      setSynScanning(false); // usuario canceló el picker
    }
  };

  const processSynpulse = () => {
    if (!synFiles.length) return;
    persistDocs([
      ...synFiles.slice(0, 10).map((name, i) =>
        mockProcessedDoc({
          id: `doc-syn-${Date.now()}-${i}`,
          title: name,
          origin: "synpulse",
          sourceName: `Synpulse/${name}`,
          fileType: extToType(name),
        })
      ),
      ...loadDocs(),
    ]);
    const stamp = nowLabel();
    setSynLastSync(stamp);
    setSynFiles([]);
    try {
      localStorage.setItem("finpulse-synpulse", JSON.stringify({ folder: synFolder, lastSync: stamp }));
    } catch {}
  };

  /* ---- Acciones de tabla ---- */
  const deleteDoc = (id: string) => {
    persistDocs(loadDocs().filter((d) => d.id !== id));
    setConfirmDelete(null);
  };

  const reprocessDoc = (id: string) => {
    setReprocessing((prev) => new Set(prev).add(id));
    persistDocs(loadDocs().map((d) => (d.id === id ? { ...d, status: "procesando" as const } : d)));
    setTimeout(() => {
      persistDocs(loadDocs().map((d) => (d.id === id ? { ...d, status: "procesado" as const } : d)));
      setReprocessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1800);
  };

  const sorted = sortDocs(docs);
  const label = "text-[11px] uppercase tracking-[0.2em] font-semibold text-foreground";
  const btn =
    "inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold px-5 py-2.5 rounded-full border border-white/[0.2] text-foreground hover:border-white/50 transition-all duration-300 cursor-pointer";

  return (
    <div className="space-y-8">

      {/* ================= GMAIL ================= */}
      <div className="pb-8 border-b border-card-border">
        <div className="flex items-center gap-2.5 mb-2">
          <Icon name="mail" className="w-4 h-4 text-muted" />
          <h3 className={label}>Email conectado</h3>
          <span className={`w-2 h-2 rounded-full ${gmail ? "bg-green" : "bg-red"}`} />
          <span className="text-xs text-muted">{gmail ? "Conectado" : "No conectado"}</span>
        </div>
        <p className="text-[13px] text-muted leading-relaxed mb-4 max-w-[560px]">
          FinPulse lee los emails de tu cuenta dedicada (newsletters, informes, periódicos que reenvíes), los resume con IA y los
          integra en tu briefing diario ordenados por relevancia.
        </p>

        {gmail ? (
          <div className="rounded-xl border border-card-border bg-background/60 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{gmail.email}</p>
                <p className="text-[11px] text-muted mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                  Conectado el {gmail.connectedAt} · Última sincronización: {gmail.lastSync}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={syncGmail} className={btn} disabled={syncing}>
                  <Icon name="refresh" className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Sincronizando…" : "Sincronizar ahora"}
                </button>
                <button type="button" onClick={disconnectGmail} className={`${btn} border-red/30 text-red hover:border-red/60`}>
                  Desconectar
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Lectura automática cada hora (cron del backend). Los resúmenes nuevos aparecen en tu briefing de las 9:00.
            </p>
          </div>
        ) : (
          <button type="button" onClick={() => setGmailModal(true)} className={`${btn} bg-white !text-black border-white hover:tracking-[0.25em]`}>
            <Icon name="mail" className="w-3.5 h-3.5" />
            Conectar Gmail
          </button>
        )}
      </div>

      {/* ================= UPLOAD MANUAL ================= */}
      <div className="pb-8 border-b border-card-border">
        <div className="flex items-center gap-2.5 mb-2">
          <Icon name="upload" className="w-4 h-4 text-muted" />
          <h3 className={label}>Subir documentos</h3>
        </div>
        <p className="text-[13px] text-muted leading-relaxed mb-4 max-w-[560px]">
          PDF, imágenes (con OCR), Word y texto. La IA extrae el contenido, lo resume y calcula la relevancia para tu portfolio.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
            dragging ? "border-white/60 bg-white/[0.05]" : "border-white/[0.12] hover:border-white/[0.3] bg-background/40"
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-white/[0.15] flex items-center justify-center text-muted">
            <Icon name="upload" className="w-5 h-5" />
          </div>
          <p className="text-sm text-foreground font-medium mb-1">Arrastra archivos aquí o haz clic para subir</p>
          <p className="text-[11px] text-muted">PDF · PNG · JPG · DOCX · TXT — subida múltiple</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Progress bars */}
        {uploads.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {uploads.map((u) => (
              <div key={u.id} className="rounded-xl border border-card-border bg-background/60 px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[12px] text-foreground truncate">{u.name}</p>
                  <span className="text-[11px] font-semibold text-muted shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {u.done ? "Procesando con IA…" : `${Math.round(u.progress)}%`}
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${u.done ? "bg-[#ffd60a]" : "bg-white/70"}`}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* URL */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            placeholder="Pega una URL de artículo — https://…"
            className="flex-1 bg-background border border-card-border rounded-full px-5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-white/40 transition-colors"
          />
          <button type="button" onClick={addUrl} className={btn}>
            <Icon name="link" className="w-3 h-3" />
            Procesar URL
          </button>
        </div>
        {urlError && <p className="text-[11px] text-red mt-2">{urlError}</p>}
      </div>

      {/* ================= CARPETA SYNPULSE ================= */}
      <div className="pb-8 border-b border-card-border">
        <div className="flex items-center gap-2.5 mb-2">
          <Icon name="folder" className="w-4 h-4 text-muted" />
          <h3 className={label}>Carpeta Synpulse</h3>
          {synFolder && <span className="w-2 h-2 rounded-full bg-green" />}
          <span className="text-xs text-muted">
            {synFolder ? `Vinculada: ${synFolder}` : "Sin vincular"}
            {synLastSync && ` · última sync ${synLastSync}`}
          </span>
        </div>
        <p className="text-[13px] text-muted leading-relaxed mb-4 max-w-[560px]">
          Crea una carpeta <span className="text-foreground font-medium">Synpulse</span> en tu equipo y vuelca ahí informes, notas
          y capturas. Al sincronizar, FinPulse procesa los archivos nuevos.
        </p>

        {fsApiAvailable ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={pickSynpulseFolder} className={btn} disabled={synScanning}>
                <Icon name="folder" className="w-3 h-3" />
                {synScanning ? "Escaneando…" : synFolder ? "Re-escanear carpeta" : "Seleccionar carpeta"}
              </button>
              {synFiles.length > 0 && (
                <button type="button" onClick={processSynpulse} className={`${btn} bg-white !text-black border-white`}>
                  Procesar {Math.min(synFiles.length, 10)} archivo{synFiles.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
            {synFiles.length > 0 && (
              <p className="text-[11px] text-muted">
                Detectados: {synFiles.slice(0, 6).join(", ")}
                {synFiles.length > 6 && ` y ${synFiles.length - 6} más`}
              </p>
            )}
            <p className="text-[11px] text-muted/70 leading-relaxed max-w-[560px]">
              El navegador solo permite escaneo bajo demanda (pulsa re-escanear al añadir archivos). El monitoreo automático en
              segundo plano requiere el servicio local de FinPulse — documentado en docs/documentos-pipeline.md.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#ffd60a]/25 bg-background/60 p-4">
            <p className="text-[12px] text-[#ffd60a] font-medium mb-1.5">Tu navegador no soporta acceso a carpetas</p>
            <p className="text-[11px] text-muted leading-relaxed">
              La selección de carpeta usa la File System Access API, disponible en Chrome y Edge de escritorio. Alternativas:
              usa la zona de subida manual de arriba, o instala el servicio local de FinPulse (pendiente — ver
              docs/documentos-pipeline.md) para monitoreo automático real.
            </p>
          </div>
        )}
      </div>

      {/* ================= LISTA DE DOCUMENTOS ================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Icon name="doc" className="w-4 h-4 text-muted" />
            <h3 className={label}>Documentos procesados</h3>
          </div>
          <span className="text-[11px] text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
            {sorted.length} documento{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-2xl border border-card-border overflow-hidden">
          {sorted.map((d, i) => (
            <div
              key={d.id}
              className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-white/[0.02] transition-colors duration-300 ${
                i > 0 ? "border-t border-white/[0.05]" : ""
              }`}
            >
              <span className="w-9 h-9 shrink-0 rounded-lg border border-white/[0.1] flex items-center justify-center text-muted">
                <Icon name={FILE_ICON[d.fileType]} className="w-3.5 h-3.5" />
              </span>
              <button type="button" onClick={() => setOpenDoc(d)} className="flex-1 min-w-0 text-left cursor-pointer group">
                <p className="text-[13px] font-medium text-foreground truncate group-hover:underline underline-offset-4 decoration-white/30">
                  {d.title}
                </p>
                <p className="text-[11px] text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Icon name={ORIGIN_ICON[d.origin]} className="w-2.5 h-2.5" />
                    {ORIGIN_LABEL[d.origin]}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{d.date}</span>
                  {d.status === "procesando" && <span className="text-[#ffd60a]">· procesando…</span>}
                  {d.status === "error" && <span className="text-red">· error</span>}
                </p>
              </button>
              <span
                className="hidden sm:block text-[12px] font-semibold w-8 text-right shrink-0"
                style={{ color: relevanceColor(d.relevance), fontVariantNumeric: "tabular-nums" }}
                title="Relevancia"
              >
                {d.relevance}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => reprocessDoc(d.id)}
                  disabled={reprocessing.has(d.id)}
                  title="Re-procesar con IA"
                  aria-label={`Re-procesar ${d.title}`}
                  className="w-8 h-8 rounded-full border border-white/[0.12] flex items-center justify-center text-muted hover:text-foreground hover:border-white/40 transition-all duration-300 cursor-pointer disabled:opacity-40"
                >
                  <Icon name="refresh" className={`w-3 h-3 ${reprocessing.has(d.id) ? "animate-spin" : ""}`} />
                </button>
                {confirmDelete === d.id ? (
                  <button
                    type="button"
                    onClick={() => deleteDoc(d.id)}
                    onBlur={() => setConfirmDelete(null)}
                    className="h-8 px-3 rounded-full bg-red text-white text-[10px] uppercase tracking-[0.1em] font-semibold cursor-pointer"
                  >
                    ¿Borrar?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(d.id)}
                    title="Borrar documento"
                    aria-label={`Borrar ${d.title}`}
                    className="w-8 h-8 rounded-full border border-white/[0.12] flex items-center justify-center text-muted hover:text-red hover:border-red/50 transition-all duration-300 cursor-pointer"
                  >
                    <Icon name="trash" className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="px-5 py-8 text-[13px] text-muted">No hay documentos. Sube uno o conecta tu email.</p>
          )}
        </div>
      </div>

      {/* ================= MODAL GMAIL (mock OAuth) ================= */}
      {gmailModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={() => setGmailModal(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-carousel-fade" />
          <div
            className="relative w-full max-w-[480px] rounded-[20px] border border-white/[0.12] bg-[#131315] p-8 shadow-2xl shadow-black/70 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-full border border-white/[0.15] flex items-center justify-center text-muted">
                <Icon name="mail" className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-[17px] font-extralight tracking-wide text-foreground">Conectar Gmail</h3>
                <p className="text-[11px] text-muted">Acceso de solo lectura (gmail.readonly)</p>
              </div>
            </div>

            <ol className="space-y-3 mb-6">
              {[
                "Usa una cuenta DEDICADA (ej. news.finpulse@gmail.com) — no tu correo personal.",
                "Reenvía ahí tus newsletters, informes y periódicos.",
                "Autoriza el acceso de solo lectura. FinPulse nunca envía ni borra emails.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-white/[0.08] text-[10px] font-semibold text-foreground flex items-center justify-center mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {i + 1}
                  </span>
                  <p className="text-[12px] text-[#c8c8cd] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>

            <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-muted mb-2">Cuenta a conectar</label>
            <input
              type="email"
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
              className="w-full bg-background border border-card-border rounded-full px-5 py-2.5 text-sm text-foreground focus:outline-none focus:border-white/40 transition-colors mb-4"
            />

            <div className="rounded-xl border border-[#ffd60a]/25 bg-[#ffd60a]/[0.04] p-3.5 mb-6">
              <p className="text-[11px] text-[#ffd60a] leading-relaxed">
                Demo: la conexión se simula en local. El OAuth real requiere credenciales de Google Cloud y los endpoints del
                backend documentados en docs/documentos-pipeline.md.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={connectGmail}
                className="flex-1 inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold bg-white text-black rounded-full px-6 py-3.5 hover:tracking-[0.3em] transition-all duration-500 cursor-pointer"
              >
                Autorizar acceso
              </button>
              <button
                type="button"
                onClick={() => setGmailModal(false)}
                className="text-[10px] uppercase tracking-[0.25em] font-semibold text-muted hover:text-foreground px-4 transition-colors duration-300 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {openDoc && <DocModal doc={openDoc} onClose={() => setOpenDoc(null)} />}
    </div>
  );
}
