# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# FinPulse — Project Instructions

## What is FinPulse
App personal de finanzas con dos pilares:
1. **Teorico**: Resumen diario de noticias, papers, newsletters. Aprendizaje continuo.
2. **Practico**: Seguimiento de inversiones, analisis de decisiones, recomendaciones IA.

La IA actua como "CEO de JP Morgan": recomienda activamente, registra historial de recomendaciones, aprende acumulativamente.

## Usuario
- Nico Giner (nginer01 en GitHub, nico.giner@hotmail.com)
- Basado en Espana (Europe/Madrid)
- Inversor intermedio, acciones/ETFs globales, broker Revolut
- Habla espanol nativo
- Prioriza que todo sea MUY VISUAL
- Prefiere hacer todas las tareas propuestas a la vez ("haz todas")
- Prefiere planificar bien antes de implementar

## Estructura del proyecto
```
finpulse/
  frontend/    — Next.js 16 + Tailwind (package.json aqui, NO en raiz)
  backend/     — FastAPI + Python 3.12 (venv en backend/venv)
  docs/        — documentacion
```

## Development commands

### Frontend (run from `frontend/`)
```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx vercel --prod --yes  # Manual deploy to Vercel
```

### Backend (run from `backend/`, activate venv first)
```bash
source venv/Scripts/activate   # Windows Git Bash
python run.py                  # Dev server at http://localhost:8000
pip install -r requirements.txt  # Install dependencies
```

## Next.js version warning
This project uses Next.js 16 which has breaking changes vs training data. ALWAYS read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing Next.js code.

## Stack tecnico

### Frontend
- Next.js 16.2.6 (Turbopack), Node v24.14.0
- Dev: http://localhost:3000
- Prod: https://frontend-nginer01s-projects.vercel.app
- Dependencias clave: lightweight-charts v5.2.0, font Sora (logo)
- IMPORTANTE: Leer docs en node_modules/next/dist/docs/ antes de escribir codigo Next.js
- lightweight-charts v5: usar chart.addSeries(CandlestickSeries, opts), NO addCandlestickSeries()
- lightweight-charts v5: usar createSeriesMarkers(series, markers), NO series.setMarkers()
- chart.remove() en useEffect: wrap con try/catch + innerHTML="" para React strict mode
- Env var en Vercel: NEXT_PUBLIC_API_URL = https://finpulse-production-8f64.up.railway.app

### Backend
- Python 3.12.10, FastAPI 0.115.12, uvicorn, SQLAlchemy 2.0.41 async, asyncpg
- yfinance 1.3.0, finnhub-python, fredapi, anthropic 0.52.0
- Dev: http://localhost:8000
- Prod: https://finpulse-production-8f64.up.railway.app
- yfinance es sync: usar asyncio.to_thread() en FastAPI
- Railway: root directory = backend, NO poner start command (usa nixpacks.toml)
- IMPORTANTE: hacer .strip() en env vars de Railway (mete newlines)

### Base de datos (Supabase)
- Proyecto: finpulse, Region: West EU (Ireland)
- Ref: vbmvjxourxmtnmlmuomu
- Pooler: aws-0-eu-west-1.pooler.supabase.com (port 5432, session mode)
- DB user: postgres.vbmvjxourxmtnmlmuomu
- DB password: FinPulseDB2026abc
- Driver: asyncpg con NullPool (pgbouncer compatible)
- IMPORTANTE: usar port 5432 (session mode), NO 6543 (transaction mode)
- Tablas: users (con supabase_id), positions, operations (con source/external_id), news_articles, daily_summaries, decisions (con operation_id/price_after_90d), recommendations (con price_at_decision/decided_at/fiction_amount), tracking_topics, behavior_events, interest_profile, thesis_alerts, quiz_cards, threads, thread_entries
- Migraciones aplicadas via scripts en backend/scripts/ (asyncpg con statement_cache_size=0): migrate_journal, migrate_thesis_alerts, migrate_paths, migrate_quiz, migrate_threads

### Auth (Supabase Auth)
- Supabase URL: https://vbmvjxourxmtnmlmuomu.supabase.co
- Email confirmation: DESACTIVADO (para desarrollo)
- Frontend: src/lib/auth.ts (login, register, tokens en localStorage)
- Frontend: src/context/AuthContext.tsx (AuthProvider, useAuth hook)
- Backend: app/api/auth.py (register, login, me, refresh endpoints)
- LoginGate: teaser visible + gradient fade + prompt "Crea tu cuenta" siempre visible (no depende de scroll)
- AuthRedirect: redirect a /login para paginas protegidas sin teaser
- Cuenta de test: nicolas@finpulse.es / FinPulse2026!

### Deploy
- Vercel: https://frontend-nginer01s-projects.vercel.app (deploy manual con `npx vercel --prod --yes`)
- Railway: https://finpulse-production-8f64.up.railway.app (auto-deploy desde GitHub)
- CORS: localhost:3000 + frontend-nginer01s-projects.vercel.app

## yfinance ticker mapping
- IWDA -> IWDA.AS, VUAA -> VUAA.DE (no VUAA.AS ni VUAA.L)
- EUNA -> EUNA.AS, SEMI -> SEMI.AS, BRT -> BZ=F
- US stocks/ETFs: pass-through (AAPL, MSFT, SPY, etc.)

## Design system app (unificado con landing)
- Fuente global: Helvetica Neue (-apple-system) — NO Geist (override en globals.css --font-sans)
- Fondo: negro puro #000000
- Cards: #1d1d1f/60 con borde white/8%
- Colores: verde #30d158, rojo #ff453a, amarillo #ffd60a
- Nav: FINPULSE uppercase tracking-[0.25em] scaleY(0.88), links uppercase tracking-[0.2em] 11px
- Titulos h1: font-extralight tracking-wide
- Section labels h2/h3: text-[11px] uppercase tracking-[0.2em] font-semibold text-muted/80
- NO hay seccion de marketing/features en el dashboard (eliminada)
- Cuerpo de articulo largo: 17px leading-[1.85] color #c8c8cd (mas claro que muted para legibilidad), max ~75 chars/linea

## Componentes compartidos (frontend/src/components/)
- `charts/` — SVG a medida, sin librerias (encajan con la Design Bible: marcas finas, gridlines hairline solidas, verde/rojo SOLO como direccion + siempre con signo):
  - `LineChart` — linea 2px con area wash 10%, draw-in animado, crosshair + tooltip hover, dot final con anillo
  - `BarsChart` — barras divergentes desde eje central (max 42% por lado para que quepan las etiquetas de valor)
  - `CandleChart` — velas OHLC animadas con tooltip por vela
  - `Sparkline` — mini linea inline para sidebars/tablas
- `article/ArticleBits.tsx` — Icon (set SVG stroke 1.5, no emojis), Kicker, PullQuote, InlineImage, VideoCard (placeholder), DataTip (dato con tooltip), ShareBar (Guardar en localStorage via useSyncExternalStore + Compartir), Breadcrumb, SectionDivider
- `article/Typography.tsx` — P/Lead/H2/Strong server-safe para articulos
- `article/SourceLink.tsx` — SourceLink (dato inline clickeable), SourceChip (badge) y SourceModal (monograma, tipo, fecha, snippet, "Leer articulo completo"). Estilo premium: SIN dotted/subrayado en reposo; hover azul #6cb2ff + bg rgba(0,102,204,0.12) + borde inferior 1px + icono fade-in, 300ms. Fuentes en src/lib/sources.ts
- `article/ReadingTime.tsx` — tiempo de lectura calculado sobre el contenido real del main (palabras/200); NO hardcodear tiempos de lectura
- `audio/AudioBriefing.tsx` + `src/lib/audio.ts` — AUDIO BRIEFING (TTS Web Speech API, sin API keys): pill flotante "Escuchar briefing · ~X min" → reproductor fijo inferior (sección actual, progreso, velocidad 1/1.25/1.5/0.9x persistente en finpulse-audio-rate, saltar sección, cerrar). extractScript() recorre el main (h1-h3/p/blockquote) excluyendo aside/[data-quiz]/[data-audio-skip]; chunking por frases ≤250 chars (los TTS fallan con textos largos); pickSpanishVoice prioriza voces neurales es-ES de Edge. La PAUSA es cancel+releer chunk actual (pause/resume nativos poco fiables). Duración = palabras/165wpm. En /resumen y /semanal/resumen. Para TTS de servidor futuro: sustituir la cola de utterances, el guión/chunks ya sirven
- `article/Term.tsx` + `src/lib/glossary.ts` — GLOSARIO CONTEXTUAL: `<Term k="vix">VIX</Term>` envuelve términos técnicos en los artículos. Reposo limpio; hover dorado #d9b984 (excepción deliberada: dorado = concepto, azul = fuente) + icono libro; popover con definición según nivel (Básico/Medio/Pro, cambiable al vuelo, persiste en finpulse-glossary-level; default del experience_level del usuario) + ejemplo ligado al portfolio. ~30 términos en glossary.ts. El popover usa PORTAL con posición fija (los Reveal llevan transform → stacking context → un popover absoluto queda bajo el navbar sticky); se cierra al scrollear. Consultar emite track expand del tema. OJO JSX: texto que termina en línea antes de <Term> pierde el espacio — usar {" "}
- `src/lib/tracking.ts` + `tracking/Trackers.tsx` — personalizacion adaptativa: track() en batch (15s + pagehide) con fallback local; interest vs concern (negativa+cartera=concern); computeProfile() con decay 14d; DwellTracker (IntersectionObserver sobre [data-track-topic]), TopicPulse (pulgar), SundayCheckin (domingos, 1x/semana, ignorable). Señales conectadas en SourceLink (mapa SOURCE_TOPICS), ShareBar (save) y DocumentsPanel (expand). Toggle de privacidad: finpulse-tracking-enabled
- `documents/` — DocumentsPanel (seccion "Mis documentos" de /resumen + DocModal) y DocumentsManager (gestion completa en /ajustes). Datos en src/lib/documents.ts: MOCK_DOCS + persistencia localStorage (finpulse-docs-v1) + sortDocs (relevancia, desempate por fecha)
- `Reveal`, `AnimatedCounter`, `Tooltip`, `ScrollProgress`, `BorderCard` — preexistentes, reutilizables

## Design system landing (estilo Rolex + cinematico)
- Fondo: #faf8f5 (crema calido)
- Cards: bg-white, border #e5e0db, shadow suave, rounded-[20px], glow on hover
- BorderCard trace: verde #006039 (Rolex green)
- Texto: #1a1a1a (titulos), #555 (cuerpo)
- Rojo: #c4001a, Verde: #006039, Oro: #b8860b
- Tipografia: Helvetica Neue, font-extralight para titulos
- Hero: Ken Burns animation + particles + film grain + split text letra por letra
- Imagenes cinematograficas: 3 variantes Ken Burns, film grain overlay
- Text reveal palabra por palabra al scrollear
- Marquee ticker con datos de mercado
- Botones magneticos (siguen cursor)
- Stats animados con contadores

## Paginas frontend (31 rutas + 404)
- `/` Dashboard — CONECTADO a datos reales (portfolio, precios, TradingChart OHLCV)
- `/landing` — Landing cinematica (punto de entrada para usuarios no logueados)
- `/login` — Login/registro con Supabase Auth (validacion, password strength, social login UI)
- `/resumen` — Briefing diario estilo articulo de periodico: hero cinematico + 2 columnas (articulo 17px/1.85 + sidebar sticky), 9 secciones con kickers SVG (incl. Politica & Economia Global, Portfolio Impact, Perspectivas Alternativas), datos/citas clickeables (SourceLink), "Mis documentos", ReadingTime dinamico, Guardar/Compartir (mock), QuizSection opcional al final (3 flashcards con repetición espaciada)
- `/noticia` — Deep-dive (mock)
- `/portfolio` — TradingView chart, heatmap (mock)
- `/aprendizaje` — Investor DNA radar SVG (mock)
- `/semanal` — Dashboard semanal: grid asimetrico 12-col, hero card con contadores animados, cards clickables con modal de detalle, selector de semana con 2 datasets (mock)
- `/semanal/resumen` — Reportaje semanal largo: timeline dia a dia, noticias mayores, sectores, analisis geografico, politica monetaria & dividendos, tecnico con velas, deep dive, perspectiva, ReadingTime dinamico (mock)
- `/recomendaciones` — Recomendaciones IA con fuentes clickeables (SourceChip); Seguir/Ignorar/Invertir-en-ficción PERSISTEN via /api/paths (registro automático con precio real del momento) y la sección "El camino no tomado" evalúa qué habría pasado: coste de la inacción vs ahorrado (1.000€ hipotéticos por ignorada), veredictos por decisión, ficción valorada con precios reales. Lib src/lib/paths.ts (fallback demo finpulse-paths-local-v1). Las 5 recomendaciones siguen siendo mock hasta el pipeline real
- `/journal` — Decision Journal con broker auto-sync: stats (acierto, convicción, % emocional), operaciones detectadas sin etiquetar (banner), QuickTagModal (tags 2s + convicción + tesis opcional), timeline de decisiones con evolución +7/30/90d y evaluación retrospectiva IA, sección sync Revolut (email/CSV/manual), bloque Investor DNA, botón "Vigilar tesis" por decisión (extrae niveles → crea alertas). API real con fallback demo (localStorage finpulse-journal-local-v1). Lib: src/lib/journal.ts; modal: components/journal/QuickTagModal.tsx
- `/alertas` — Tesis → alertas automáticas: la IA lee tesis (journal/manual), extrae niveles de invalidación y los vigila con precios reales. Stats, alertas disparadas (tesis tocada/rota), tesis bajo vigilancia con barra de margen por color (verde >10% / ámbar 3-10% / rojo <3%), escanear journal, NewThesisModal (analizar tesis → proposals seleccionables → vigilar). AlertsPanel (campana Navbar) conectado: disparadas + activas con margen, badge dinámico = disparadas. Lib: src/lib/alerts.ts (fallback demo localStorage finpulse-alerts-local-v1 + clientExtract heurístico)
- `/stress-test` — Simulacion crisis (mock)
- `/comparador` — Comparacion activos (mock)
- `/onboarding` — Wizard 5 pasos (mock)
- `/ajustes` — MODULAR: overview con 9 cards (incl. /intereses: perfil adaptativo visible, ajuste manual, toggle de tracking) + layout con sidebar (desktop) / pills 44px (mobile) + breadcrumb dinamico. Sub-paginas: /perfil (2FA, password), /fuentes (DocumentsManager: Gmail mock, drag&drop, URL, Synpulse + suscripciones + temas + hora briefing), /notificaciones, /tema (toggle claro/oscuro + preview en vivo), /privacidad (export GDPR, danger zone), /integraciones (broker, API key, logs), /facturacion, /ayuda (FAQs). Registro en sections.ts, kit UI en ui.tsx, SettingsHero por seccion (split light/dark en tema, collage prensa en fuentes, icono SVG + patron en el resto)

## Backend endpoints
### Auth (funcionando en prod):
- POST /api/auth/register — Supabase Auth signup + crear usuario en DB
- POST /api/auth/login — login, devuelve access_token + refresh_token
- GET /api/auth/me — datos del usuario autenticado
- POST /api/auth/refresh — renovar access token

### Market data (funcionando en prod):
- GET /api/market/quote/{ticker}
- GET /api/market/quotes?tickers=X,Y
- GET /api/market/history/{ticker}?timeframe=6M
- GET /api/market/indices
- GET /api/market/fundamentals/{ticker}
- GET /api/market/portfolio-snapshot?tickers=X,Y

### Portfolio:
- GET/POST/DELETE /api/portfolio/positions
- POST /api/portfolio/import-csv

### Decision Journal (broker auto-sync Revolut):
- GET /api/journal/tags — 21 tags rápidos (espejo en frontend TAG_GROUPS de src/lib/journal.ts; mantener sincronizados)
- POST/GET /api/journal/decisions — crear (acepta operation_id para heredar datos de la operación) / listar
- GET/PATCH /api/journal/decisions/{id} — detalle / actualizar result+lesson
- POST /api/journal/decisions/{id}/review — evaluación retrospectiva: precios reales a 7/30/90d (yfinance), result heurístico (±2% ajustado por buy/sell) + review IA de Claude centrada en el PROCESO (fallback sin API key: solo precios)
- POST /api/journal/sync/email — escanea el Gmail dedicado buscando confirmaciones de orden de Revolut (app/services/revolut.py, patrones EN/ES) y crea operations dedupe por external_id. Requiere GMAIL_ADDRESS+GMAIL_APP_PASSWORD
- POST /api/journal/sync/csv — importa extracto CSV de Revolut como operations (mismo dedupe)
- GET /api/journal/pending — operaciones sin decisión etiquetada (cola del QuickTagModal)
- GET /api/journal/stats — total/acierto/convicción media/tags más usados/mejor-peor ticker
- Modelo: operations tiene source (manual/csv/email) + external_id UNIQUE (hash ticker|tipo|qty|precio|fecha); decisions tiene operation_id FK + price_after_90d. Migración: backend/scripts/migrate_journal.py (aplicada 7 jul 2026)

### Tesis → alertas automáticas (app/api/alerts.py):
- POST /api/alerts/extract — la IA (Claude, fallback heurística regex) lee una tesis y propone condiciones de invalidación: {condition: price_below/above, level, severity: aviso/invalidacion, rationale}. Sin niveles explícitos y con precio actual: defaults ±8% aviso / ±15% invalidación (invertido para tesis bajistas)
- POST /api/alerts — persistir alertas (lista); GET /api/alerts?status=all|active|triggered|dismissed; PATCH /api/alerts/{id} (dismiss/reactivate)
- POST /api/alerts/check — EL VIGILANTE: evalúa activas contra get_quotes (yfinance), dispara las cruzadas (status=triggered + triggered_price/at), actualiza last_price/last_checked_at. Cron PENDIENTE — el frontend lo llama al cargar (loadAlerts)
- POST /api/alerts/scan-journal — recorre tesis del Decision Journal sin alertas y las crea (una extracción por tesis, dedupe por source_type=journal+source_id)
- Tabla thesis_alerts creada en Supabase (backend/scripts/migrate_thesis_alerts.py, aplicada 7 jul 2026)

### El camino no tomado (app/api/paths.py):
- POST /api/paths/decide — registra Seguir/Ignorar con snapshot del precio real (get_quote) en la tabla recommendations (status followed/ignored + price_at_decision + decided_at; fiction_amount opcional)
- GET /api/paths — decisiones evaluadas live: change_pct desde el snapshot y effect_pct = qué habría dado SEGUIRLA (signo orientado: Vender/Reducir invierten; Comprar/Mantener/Vigilar long)
- PATCH /api/paths/{id}/fiction — añade/ajusta inversión ficticia; DELETE /api/paths/{id} — deshacer
- Columnas nuevas en recommendations: name, price_at_decision, decided_at, fiction_amount (scripts/migrate_paths.py, aplicada 7 jul 2026)
- OJO: status es SAEnum — asignar RecommendationStatus(valor), no el string

### Hilos temporales (app/api/threads.py) — memoria acumulativa:
- GET /api/threads?status=active|all — hilos con su evolución completa (entries ordenadas por fecha)
- POST /api/threads/ingest — LA PIEZA CLAVE para el pipeline: upsert del hilo por (user, slug) + entry del día con dedupe (fecha+headline); summary/outlook se REEMPLAZAN (estado actual, no acumulación de texto); un hilo dormant que recibe entry revive. El briefing real la llamará cada mañana con los desarrollos
- PATCH /api/threads/{id} — active/resolved/dormant
- Tablas threads (slug UNIQUE por user) + thread_entries (scripts/migrate_threads.py, aplicada 7 jul 2026)
- Frontend: src/lib/threads.ts (mock de 4 hilos: aranceles desde 9 abr, ciclo IA, OPEC+, BCE dovish — con entries que referencian el journal del usuario) + components/threads/ThreadsSection.tsx (sección "Hilos abiertos" en /resumen entre Lo que viene y Perspectivas: card por hilo con Semana N/tickers/summary, timeline vertical expandible con dots por significance — clave ámbar/positivo verde/negativo rojo/neutral gris — fuentes [FT] y bloque "Qué puede pasar"). Lleva data-audio-skip (fuera del audio briefing)

### Modo quiz opcional (app/api/quiz.py):
- GET /api/quiz/session?limit=3 — repasos vencidos primero (is_review=true), después preguntas nuevas
- POST /api/quiz/cards/{id}/answer {correct} — repetición espaciada: intervalos 1/3/7/14 días; acierto avanza (nueva acertada a la primera = dominada, superar 14d = dominada), fallo reinicia a 1 día y suma lapse
- POST /api/quiz/generate {content} — Claude crea 3 MCQs del briefing (persiste como nuevas); sin API key devuelve vacío y el frontend usa su banco local
- POST /api/quiz/cards (bulk) + GET /api/quiz/stats (para Investor DNA)
- Tabla quiz_cards creada (scripts/migrate_quiz.py, aplicada 7 jul 2026)
- Frontend: src/lib/quiz.ts (motor ESPEJO del backend en localStorage finpulse-quiz-v1 + banco de 8 preguntas de la semana mock; toggle finpulse-quiz-enabled, default ON) + components/quiz/QuizSection.tsx (flashcards al final de /resumen: intro → opciones con feedback+explicación → resumen con nota DNA). Toggle en /ajustes/fuentes. Fallo → track explicit_interest del tema (señal deepen para el briefing)
- Los 21 tags del journal y los grupos TAG_GROUPS del frontend deben mantenerse sincronizados; ídem la heurística clientExtract de src/lib/alerts.ts con _heuristic_extract del backend

### Chat IA — "CEO de JP Morgan" (necesita ANTHROPIC_API_KEY):
- POST /api/chat/ask — Chat libre con CIO, soporta conversation_history (ultimos 10 msgs) y context
- POST /api/chat/recommend — 3 recomendaciones con conviccion 1-10, pro/contra, paralelos historicos, timeframe
- POST /api/chat/briefing — Briefing diario ADAPTATIVO (~1h lectura, 10 secciones flexibles segun fuentes+portfolio, max_tokens 16k)
- POST /api/chat/briefing-semanal — Resumen semanal ADAPTATIVO (~2h+ lectura, 17 secciones, max_tokens 32k)
- Ambos briefings aceptan deepen_topics/portfolio_topics (perfil adaptativo) y los inyectan en el prompt

### Tracking (personalizacion adaptativa):
- POST /api/tracking/events — ingesta batch de eventos de comportamiento (best-effort si no existen tablas)
- GET /api/tracking/profile — perfil interes/concern por tema con recency decay (14d half-life)
- Tablas behavior_events + interest_profile YA CREADAS en Supabase (7 jul 2026, SQL de referencia en el docstring de app/api/tracking.py). Verificado E2E en prod: POST events → stored, GET /profile → scores
- Cron nocturno PENDIENTE — mientras tanto GET /profile recalcula al vuelo; user_id aun null (sin auth en el endpoint)
- Nota asyncpg + pooler Supabase: usar statement_cache_size=0 (pgbouncer)
- POST /api/chat/analyze — Analiza noticia concreta + impacto en portfolio
- System prompt: CIO de elite, directo, fundamentado, anti sesgo confirmacion, paralelos historicos
- Model: claude-sonnet-4-20250514, max_tokens 2048-4000
- Fallback graceful si no hay API key

### News:
- GET /api/news/summary/today, /api/news/articles

## Holdings ficticios (cantidades inventadas, precios reales)
- IWDA: 35 uds, VUAA: 10 uds, BRT: 15 uds, EUNA: 50 uds, SEMI: 100 uds

## PRINCIPIO FUNDAMENTAL
La INFORMACION es el core de la app. Todo lo demas es secundario. Si la informacion no es excelente, la app no vale nada.

## Briefing diario — El corazon de FinPulse
- Se genera cada manana a las 9:00 AM (hora Espana)
- Lee TODOS los emails del Gmail dedicado (periodicos, newsletters, papers, informes)
- NO resume superficialmente: lee detenidamente, extrae toda la informacion relevante
- Cruza fuentes: si 3 fuentes hablan del mismo tema, junta toda la info, no repite
- Anade contexto: Polymarket (probabilidades), X (opiniones influyentes), datos de mercado
- ADAPTADO al usuario: si tiene Brent, petroleo va primero y con mas profundidad
- Recomendaciones fundamentadas: conviccion 1-10, pro/contra, paralelos historicos
- Memoria acumulativa: noticias que se repiten se profundizan, no se resumen desde cero
- NO INVENTAR NADA: solo informacion verificada de las fuentes
- Calidad > brevedad: puede ser largo, lo importante es que sea completo
- Tono: CEO de JP Morgan hablando a su cliente VIP

## Funcionalidades diferenciales (lo que nadie mas hace)
1. **Decision Journal** — HECHO (roadmap #1): broker auto-sync Revolut, tags rapidos 2s + tesis opcional, evaluacion IA a 7/30/90d centrada en el proceso.
2. **El camino no tomado** — HECHO (roadmap #3): Seguir/Ignorar/ficcion se registran con precio real; contrafactual con coste de la inaccion.
3. **Briefing que aprende de ti** — tracking + perfil adaptativo HECHOS; briefing real pendiente del #0.
4. **Anti sesgo confirmacion**: SIEMPRE caso a favor Y en contra con la misma fuerza (en prompts y en /recomendaciones).
5. **Investor DNA evolutivo**: radar mock en /aprendizaje; ya lo alimentan journal (disciplina/emocional) y quiz (comprension) — falta consolidarlo.
6. **Tesis → alertas de invalidacion** — HECHO (roadmap #2): la IA extrae niveles de las tesis y los vigila con precios reales. Las alertas predictivas (volumen, correlaciones) siguen pendientes.
7. **Noticias → Portfolio → Accion**: cadena completa con paralelos historicos y recomendacion concreta (pendiente del pipeline real).
8. **Hilos temporales** — HECHO (roadmap #7): memoria acumulativa de temas recurrentes, evolucion fecha a fecha sin re-explicar.

## Fuentes de informacion
### Newsletters (reenviar al Gmail news.FinPulse@gmail.com):
- Matt Levine — Money Stuff (Bloomberg, diario)
- The Daily Shot (macro, graficos, diario)
- Finimize (resumenes 3 min)
- Morning Brew (negocio y mercados)
- Chartr (datos visuales)

### Bancos/instituciones:
- BlackRock Weekly Commentary (miercoles, https://www.blackrock.com/es/profesionales/vision-de-mercado/comentario-semanal)
- UBS On-Air / Paul Donovan (diario, podcast)
- Goldman Sachs Briefings (gs.com/insights)
- JP Morgan Market Insights (am.jpmorgan.com/weekly-market-recap)
- BBVA Research (bbvaresearch.com, gratis, espanol)

### Periodicos:
- Financial Times — FirstFT newsletter (gratis)
- The Economist Espresso (diario)
- Expansion / Cinco Dias (Espana)

### Cuentas de X:
- @zerohedge (contrarian, riesgos)
- @sentimentrader (sentimiento, flujos)
- @MacroAlf — Alfonso Peccatiello (macro europeo)
- @jessefelder (valoraciones, fundamental)
- @LizAnnSonders (estratega Schwab)
- @HenrikZeberg (ciclos macro)

### Datos automaticos (integrados o por integrar):
- Polymarket API (integrado)
- yfinance (integrado)
- FRED API (instalado, no integrado)
- Finnhub news (instalado, no integrado)

## Bloqueantes para briefing real
1. ANTHROPIC_API_KEY — necesaria para que Claude genere el briefing
2. Gmail dedicado — necesario para recibir las fuentes del usuario

## Paginas de preview (rediseno dashboard)
- `/preview-light` — Ya aplicado como dashboard principal (page.tsx)
- `/preview-dark` — Variante oscura refinada (descartada, usuario prefiere light)
- `/showcase` — Reel cinematico 9 escenas para marketing (WIP: hacerlo mas rapido/continuo)
- `/demo` — Dashboard animado con datos en vivo

## Hero video
- Archivo: frontend/public/hero-video.mp4 (85MB, local only, en .gitignore)
- Usado en: dashboard hero (page.tsx). Landing usa foto original con Ken Burns.
- Implementacion: <video autoPlay muted loop playsInline> con poster fallback
- PENDIENTE: comprimir a ~5-10MB con ffmpeg para produccion
- PENDIENTE: las imagenes de los dividers deberian cambiar segun las noticias del dia (dinamicas con IA)

## Pipeline de documentos (frontend hecho, backend pendiente)
- Frontend completo con mock (jul 2026): fuentes clickeables, gestion de documentos en /ajustes, resumenes en /resumen
- Contrato backend COMPLETO en docs/documentos-pipeline.md: esquema Supabase (documents, email_connections), 10 endpoints FastAPI, prompt de Claude (resumen 200-300 palabras + tags + relevance 0-100 vs portfolio)
- Gmail: la UI simula OAuth; para el MVP personal la via recomendada es cuenta dedicada + app password + IMAP (sin Google Cloud)
- Carpeta Synpulse: escaneo bajo demanda ya funciona (File System Access API, Chrome/Edge); monitoreo automatico requiere servicio local (watchdog) o Electron

## Pendiente — FUNCIONALIDAD (prioridad)
ROADMAP jul 2026 (#1-#7) COMPLETO y en produccion. Lo que queda:
1. **BLOQUEANTE #0**: Crear Gmail dedicado + app password y ANTHROPIC_API_KEY → pegar GMAIL_ADDRESS/GMAIL_APP_PASSWORD/ANTHROPIC_API_KEY en Railway. Activa automaticamente: briefing real, sync journal por email, extraccion IA de alertas, reviews IA del journal, generacion de quiz y motor IA de recomendaciones.
2. **Pipeline mañanero (cron)** — el orquestador post-#0: leer Gmail → generar briefing (con deepen_topics del tracking) → ingest de hilos (POST /threads/ingest) → generar quiz (POST /quiz/generate) → check de alertas (POST /alerts/check) → reviews del journal a 30/90d → persistir briefing. Railway cron o GitHub Actions.
3. Conectar /resumen y /semanal al briefing real persistido (ahora mock coherente)
4. Posiciones en Supabase (no hardcoded) + user_id real en tracking
5. Alertas predictivas (volumen institucional, correlaciones) — mas alla de las de tesis
6. Consolidar Investor DNA en /aprendizaje con datos reales de journal + quiz + tracking
7. Backend del pipeline de documentos (contrato en docs/documentos-pipeline.md)

## Pendiente — TECNICO
- Eliminar /debug/db endpoint temporal del backend
- Quitar error details del login endpoint (solo para debug)
- Configurar Vercel auto-deploy desde GitHub
- LoginGate eliminado de /resumen en el rediseño jul 2026 — reintroducir si se quiere teaser para no logueados
- Comprimir hero-video.mp4 para produccion
- Imagenes dinamicas por noticias del dia
- Video marketing con Runway (prompts listos)

## Hecho
- Landing cinematica con Ken Burns, particles, text reveal, marquee
- Auth completo (Supabase Auth, frontend+backend, login/register)
- Deploy (Vercel frontend + Railway backend)
- Dashboard rediseñado estilo landing (preview-light aplicado como page.tsx)
- Tipografia unificada (Helvetica Neue)
- System prompt CEO JP Morgan (4 endpoints: ask, recommend, briefing, analyze)
- Resumen page cinematica
- Hero video en dashboard
- Design Bible documentada
- Rediseño periodico premium de /resumen, /semanal y /semanal/resumen (jul 2026): articulos extensos con charts SVG animados, dashboard asimetrico con modales, mock data coherente entre las 3 paginas (semana 29 jun - 3 jul 2026)
- Fuentes clickeables + sistema de documentos (7 jul 2026): SourceLink/SourceModal en 4 paginas, "Mis Documentos" en /ajustes (Gmail mock, drag&drop, URL, Synpulse), "Mis documentos" en /resumen, contrato backend en docs/documentos-pipeline.md
- Rediseno integral 7 jul 2026: resumenes adaptativos (prompts backend ~1h/~2h+ + endpoint briefing-semanal + ReadingTime dinamico + 6 secciones nuevas entre ambos articulos), /ajustes modular con 8 sub-paginas y heroes intencionales, SourceLink hover azul premium
- Personalizacion adaptativa (7 jul 2026): tracking implicito (clicks fuentes, dwell, save, expand) + explicito opcional (SundayCheckin, TopicPulse), perfil interes/cartera con decay, inyeccion en prompts del briefing, transparencia y toggle en /ajustes/intereses. Tablas Supabase creadas y verificadas E2E en prod. Pendiente: user_id real, cron nocturno, frontend pasando profileForPrompt() al briefing real
- Decision Journal con broker auto-sync (7 jul 2026, roadmap #1): parser Revolut (CSV + emails de confirmacion EN/ES) con dedupe por external_id, endpoints sync/pending/review, evaluacion retrospectiva IA a 7/30/90d (proceso vs resultado), pagina /journal (stats, cola de etiquetado, timeline, DNA), QuickTagModal 2s con señal de tracking (portfolio_view, concern si tags emocionales), migracion Supabase aplicada. Pendiente: Gmail dedicado para que el sync por email funcione en prod
- Tesis → alertas automaticas (7 jul 2026, roadmap #2): extraccion IA/heuristica de niveles de invalidacion, motor /alerts/check con yfinance, /alertas con barras de margen, campana del Navbar conectada con badge real, "Vigilar tesis" en el journal
- El camino no tomado (7 jul 2026, roadmap #3): Seguir/Ignorar/ficcion persisten con snapshot de precio real, seccion en /recomendaciones con coste de la inaccion vs ahorrado, veredictos y cartera de ficcion valorada
- Modo quiz opcional (7 jul 2026, roadmap #4): 3 flashcards post-briefing en /resumen, repeticion espaciada 1/3/7/14d (backend + espejo local), generacion Claude lista, fallos → señal deepen, toggle en /ajustes/fuentes
- Glosario contextual (7 jul 2026, roadmap #5): ~30 terminos con 3 niveles de profundidad, Term.tsx con popover en portal (hover dorado), integrado en ambos articulos
- Audio briefing (7 jul 2026, roadmap #6): Web Speech API sin keys, player flotante con secciones/velocidad/saltar, guion extraido del DOM
- Hilos temporales (7 jul 2026, roadmap #7): tablas threads+thread_entries, POST /threads/ingest idempotente para el pipeline, seccion "Hilos abiertos" en /resumen con timeline expandible
- ROADMAP jul 2026 COMPLETO: las 7 features verificadas (Playwright + E2E prod) y desplegadas el mismo dia 7 jul 2026

## Notas Windows
- Shell: Git Bash (usar sintaxis Unix)
- TASKKILL //PID X //F (doble slash por git bash)
- psycopg async no funciona en Windows (ProactorEventLoop), usar asyncpg

## Notas Railway
- Root directory: backend
- NO poner Start Command en Settings (usa nixpacks.toml → python run.py)
- run.py lee PORT de os.environ (Railway asigna su propio puerto)
- Variables con newlines: hacer .strip() en el codigo
- Region: EU West
