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

### Chat/News:
- POST /api/chat/ask (necesita ANTHROPIC_API_KEY)
- GET /api/news/summary/today, /api/news/articles

## Holdings ficticios (cantidades inventadas, precios reales)
- IWDA: 35 uds, VUAA: 10 uds, BRT: 15 uds, EUNA: 50 uds, SEMI: 100 uds

## Funcionalidades clave del producto
- Resumen diario a las 9:00 AM (hora Espana), integra TODAS las fuentes
- Memoria acumulativa: noticias repetidas se profundizan, no se resumen desde cero
- 6 ventanas de noticias: 2 interes personal, 2 informacion nueva, 2 vision futura
- Sistema de aprendizaje post-decision (que paso, que se podia hacer, se podia prever)
- Hilo temporal de noticias (evolucion en el tiempo)
- Indice de conviccion 1-10 por recomendacion
- Radar de oportunidades emergentes
- Contraargumentos automaticos (anti sesgo de confirmacion)
- Resumen semanal (domingos)
- Paralelismos historicos en lecciones/recomendaciones
- Sentimiento social via Polymarket

## Fuentes de informacion
- Gmail dedicado (newsletters, papers, periodicos via WhatsApp)
- X (Twitter): cuentas especificas por definir
- Polymarket: sentimiento y expectativas
- Podcasts: UBS On-Air (Paul Donovan, diario) + mas por definir
- Informes semanales de bancos

## Paginas de preview (rediseno dashboard)
- `/preview-light` — Dashboard rediseñado estilo landing: hero con video, dividers cinematicos 65vh, titulos 5rem, spacing py-40, news cards con imagenes 360px. ESTA ES LA REFERENCIA para el dashboard final.
- `/preview-dark` — Variante oscura refinada (descartada, usuario prefiere light)
- `/showcase` — Reel cinematico 9 escenas para marketing (WIP: hacerlo mas rapido/continuo)
- `/demo` — Dashboard animado con datos en vivo

## Hero video
- Archivo: frontend/public/hero-video.mp4 (85MB, local only, en .gitignore)
- Usado en: landing hero + preview-light hero
- Implementacion: <video autoPlay muted loop playsInline> con poster fallback
- PENDIENTE: comprimir a ~5-10MB con ffmpeg para produccion
- PENDIENTE: las imagenes de los dividers deberian cambiar segun las noticias del dia (dinamicas con IA)

## Pendiente
1. ~~Landing cinematica~~ HECHO
2. Aplicar /preview-light como dashboard principal (reemplazar page.tsx actual)
3. Conectar mas paginas a datos reales (portfolio, comparador, stress-test)
4. Posiciones en Supabase (no hardcoded)
5. ANTHROPIC_API_KEY + system prompt "CEO de JP Morgan"
6. Integracion Gmail (correo dedicado aun NO creado)
7. Integracion X (Twitter)
8. Polymarket API
9. FRED API para datos macro (instalado, no integrado)
10. Finnhub WebSocket para precios real-time (instalado, no integrado)
11. ~~Autenticacion de usuario~~ HECHO (Supabase Auth, frontend+backend)
12. ~~Deploy frontend Vercel + backend Railway~~ HECHO
13. Seleccionar mejores fuentes (newsletters, cuentas X, bancos)
14. Eliminar /debug/db endpoint temporal del backend
15. Quitar error details del login endpoint (solo para debug)
16. Configurar Vercel auto-deploy desde GitHub
17. ~~Unificar tipografia app con landing~~ HECHO (Helvetica Neue, uppercase labels)
18. LoginGate temporalmente desactivado en /resumen — reactivar cuando auth este completo
19. ~~Resumen page rediseñada~~ HECHO (hero full-width, section dividers diamante, image headers centrados)
20. Comprimir hero-video.mp4 para produccion
21. Imagenes dinamicas por noticias del dia (cuando IA este integrada)
22. Video marketing con Runway (prompts listos en conversacion)

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
