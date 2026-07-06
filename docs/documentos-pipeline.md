# Pipeline de documentos — contrato backend

Estado: **frontend implementado con mock** (localStorage `finpulse-docs-v1`). Este documento define lo que
el backend real debe implementar para sustituir el mock. El frontend ya consume la estructura `UserDoc`
de `frontend/src/lib/documents.ts` — el contrato JSON de la API debe coincidir con ella.

## Flujo end-to-end

```
[Email dedicado]──┐
[Upload manual]───┤
[URL pegada]──────┼──> EXTRACCIÓN ──> CLAUDE API ──> Supabase ──> GET /api/documents ──> /resumen + /ajustes
[Carpeta Synpulse]┘    (texto)        (resumen+tags)  (persistencia)
```

1. **Extracción** de contenido según tipo:
   - PDF → `pypdf` (texto) + fallback `pdfplumber` para tablas
   - Imagen → `pytesseract` (OCR) o la visión de Claude directamente (más simple: enviar la imagen a la API)
   - URL → `trafilatura` (readability) sobre el HTML
   - Email → Gmail API / IMAP + `email.parser`, extraer HTML→texto con `beautifulsoup4`
   - DOCX → `python-docx`
2. **Resumen con Claude** (modelo de la app, ver `app/api/chat.py`). Prompt base:
   > "Resume este documento en 200-300 palabras. Extrae: tema principal, datos clave (cifras concretas),
   > relevancia para el portfolio del usuario (posiciones: {tickers}), fuente y fecha. Devuelve JSON:
   > `{title, snippet (1 frase), summary, tags (5-8 palabras clave), tickers_afectados, relevance (0-100)}`.
   > relevance pondera: menciones directas de posiciones (peso alto), sector/tema en seguimiento (medio),
   > macro general (bajo). NO inventes datos que no estén en el documento."
3. **Guardar** en Supabase y exponer por API.
4. El frontend ordena por `relevance` y desempata por fecha (ya implementado en `sortDocs`).

## Esquema Supabase (tabla `documents`)

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  origin text not null check (origin in ('email','upload','url','synpulse')),
  source_name text not null,          -- "Money Stuff (Bloomberg)", "Synpulse/tesis.docx"…
  file_type text not null check (file_type in ('pdf','img','html','eml','docx','txt')),
  title text not null,
  snippet text,                        -- 1 frase para listados
  summary text,                        -- 200-300 palabras
  tags jsonb default '[]',
  tickers jsonb default '[]',
  relevance int default 0,             -- 0-100
  status text default 'procesando' check (status in ('procesado','procesando','error')),
  original_url text,                   -- si viene de URL o newsletter con link
  storage_path text,                   -- Supabase Storage para uploads (bucket 'documents')
  raw_text text,                       -- contenido extraído (para re-procesar sin re-extraer)
  created_at timestamptz default now(),
  processed_at timestamptz
);
create index on documents (user_id, relevance desc, created_at desc);
```

Tabla auxiliar `email_connections`: `user_id, email, provider ('gmail'), auth_mode ('oauth'|'app_password'),
credentials (encriptado), last_sync_at, active`.

## Endpoints necesarios (FastAPI)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/documents?order=relevance&limit=50` | Lista de documentos del usuario (contrato = `UserDoc`) |
| POST | `/api/documents/upload` | Multipart (varios archivos). Sube a Storage, encola procesamiento, devuelve ids con status `procesando` |
| POST | `/api/documents/url` | `{url}` → descarga, extrae, procesa |
| DELETE | `/api/documents/{id}` | Borra documento (y archivo de Storage) |
| POST | `/api/documents/{id}/reprocess` | Re-ejecuta el paso Claude sobre `raw_text` (útil tras cambiar portfolio) |
| POST | `/api/integrations/gmail/connect` | Inicia OAuth → redirect a Google |
| GET | `/api/integrations/gmail/callback` | Callback OAuth, guarda refresh_token |
| GET | `/api/integrations/gmail/status` | `{connected, email, last_sync_at}` |
| POST | `/api/integrations/gmail/sync` | Fuerza lectura de emails nuevos |
| DELETE | `/api/integrations/gmail` | Desconecta y borra credenciales |

Procesamiento asíncrono: los endpoints de alta devuelven inmediatamente con `status: "procesando"`;
un worker (asyncio task o cron) hace extracción+Claude y actualiza el registro. El frontend ya pinta
el estado `procesando`.

## Gmail: dos vías

1. **OAuth (lo que simula la UI)** — requiere proyecto en Google Cloud Console: OAuth consent screen,
   credenciales web (client_id/secret en Railway), scope `gmail.readonly`. Es lo correcto para multiusuario.
2. **Cuenta dedicada + app password (atajo recomendado para el MVP personal)** — ya planeado en CLAUDE.md:
   `news.FinPulse@gmail.com` con contraseña de aplicación e IMAP (`imaplib`). Sin OAuth, sin consent screen.
   La UI de "Conectar Gmail" puede apuntar a esta vía cambiando solo el backend.

Cron de lectura: Railway no tiene cron nativo en el plan actual → usar un loop asyncio en el propio
proceso FastAPI (cada 60 min) o un cron job externo llamando a `POST /api/integrations/gmail/sync`.

## Carpeta Synpulse — estado y camino

- **Implementado (navegador)**: selección de carpeta con File System Access API (Chrome/Edge escritorio),
  escaneo bajo demanda con botón "Re-escanear". Limitación del navegador: no hay watch en background y el
  permiso no persiste entre sesiones de forma fiable.
- **Para monitoreo automático real** hace falta un proceso local: opción A, mini-servicio Python
  (`watchdog` observando la carpeta → POST a `/api/documents/upload`); opción B, app Electron/Tauri.
  La UI ya muestra esta limitación al usuario.
- Instrucciones de usuario (ya en la UI): crear carpeta `Synpulse`, volcar PDFs/notas/capturas,
  pulsar "Seleccionar carpeta" y luego "Procesar".

## Qué es mock hoy (para sustituir)

- `frontend/src/lib/documents.ts`: `MOCK_DOCS` + persistencia localStorage → sustituir por fetch a la API.
- `DocumentsManager`: conexión Gmail simulada (localStorage `finpulse-gmail-conn`), progreso de subida
  simulado, resúmenes de docs nuevos con texto placeholder.
- `frontend/src/lib/sources.ts`: registro estático de fuentes → en real, cada resumen/insight guardará
  `source_id` apuntando a la fuente procesada.
