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
- Tablas: users (con supabase_id), positions, operations, news_articles, daily_summaries, decisions, recommendations, tracking_topics

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

## Paginas frontend (18 rutas + 404)
- `/` Dashboard — CONECTADO a datos reales (portfolio, precios, TradingChart OHLCV)
- `/landing` — Landing cinematica (punto de entrada para usuarios no logueados)
- `/login` — Login/registro con Supabase Auth (validacion, password strength, social login UI)
- `/resumen` — Briefing diario (mock, con LoginGate teaser)
- `/noticia` — Deep-dive (mock)
- `/portfolio` — TradingView chart, heatmap (mock)
- `/aprendizaje` — Investor DNA radar SVG (mock)
- `/semanal` — Timeline semana (mock)
- `/semanal/resumen` — Articulo columna (mock)
- `/recomendaciones` — Recomendaciones IA (mock)
- `/stress-test` — Simulacion crisis (mock)
- `/comparador` — Comparacion activos (mock)
- `/onboarding` — Wizard 5 pasos (mock)
- `/ajustes` — Configuracion (mock)

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

### Chat IA — "CEO de JP Morgan" (necesita ANTHROPIC_API_KEY):
- POST /api/chat/ask — Chat libre con CIO, soporta conversation_history (ultimos 10 msgs) y context
- POST /api/chat/recommend — 3 recomendaciones con conviccion 1-10, pro/contra, paralelos historicos, timeframe
- POST /api/chat/briefing — Briefing diario completo: macro, mercados, impacto por posicion
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
1. **Decision Journal**: al comprar/vender, tags rapidos obligatorios (2s) + texto libre opcional. La IA analiza retrospectivamente si acertaste y por que.
2. **El camino no tomado**: registra oportunidades descartadas y muestra que habria pasado.
3. **Briefing que aprende de ti**: se adapta al portfolio, prioriza por tus intereses, profundiza en tus temas.
4. **Anti sesgo confirmacion**: SIEMPRE caso a favor Y en contra con la misma fuerza.
5. **Investor DNA evolutivo**: score de disciplina, timing, diversificacion, control emocional. Sube/baja con decisiones.
6. **Alertas predictivas**: avisa ANTES de que algo pase (volumen institucional, Polymarket, correlaciones historicas).
7. **Noticias → Portfolio → Accion**: cadena completa con paralelos historicos y recomendacion concreta.

## Fuentes de informacion (por prioridad)
1. Gmail dedicado — periodicos, newsletters, papers, informes (el usuario los envia). AUN NO CREADO.
2. Newsletters fondos/bancos — UBS On-Air, BBVA Research, Matt Levine, FT Alphaville
3. Polymarket API — probabilidades de eventos (recorte BCE, acuerdo Iran, etc)
4. X (Twitter) — opiniones de politicos, economistas, analistas, gestores
5. Datos de mercado — yfinance (ya implementado)
6. Podcasts — UBS On-Air (Paul Donovan, diario) + otros por definir
7. BlackRock comentario semanal — https://www.blackrock.com/es/profesionales/vision-de-mercado/comentario-semanal — cada miercoles por la tarde

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

## Pendiente — FUNCIONALIDAD (prioridad)
1. **BLOQUEANTE**: Crear Gmail dedicado + app password
2. **BLOQUEANTE**: Obtener ANTHROPIC_API_KEY
3. Gmail reader: leer y procesar todos los emails del correo dedicado
4. Polymarket API: integrar datos de probabilidades
5. Generador de briefing: Claude recibe TODO (emails + Polymarket + mercado + portfolio) y genera briefing
6. Memoria acumulativa: guardar noticias procesadas en Supabase, no repetir
7. Decision Journal: tags rapidos + texto libre al operar
8. Alertas predictivas: detectar senales antes de que el mercado reaccione
9. Posiciones en Supabase (no hardcoded)
10. Conectar mas paginas a datos reales

## Pendiente — TECNICO
- Eliminar /debug/db endpoint temporal del backend
- Quitar error details del login endpoint (solo para debug)
- Configurar Vercel auto-deploy desde GitHub
- LoginGate temporalmente desactivado en /resumen — reactivar
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
