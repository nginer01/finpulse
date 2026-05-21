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
- Dependencias clave: lightweight-charts v5.2.0, font Sora (logo)
- IMPORTANTE: Leer docs en node_modules/next/dist/docs/ antes de escribir codigo Next.js
- lightweight-charts v5: usar chart.addSeries(CandlestickSeries, opts), NO addCandlestickSeries()
- lightweight-charts v5: usar createSeriesMarkers(series, markers), NO series.setMarkers()
- chart.remove() en useEffect: wrap con try/catch + innerHTML="" para React strict mode

### Backend
- Python 3.12.10, FastAPI 0.115.12, uvicorn, SQLAlchemy 2.0.41 async, asyncpg
- yfinance 1.3.0, finnhub-python, fredapi, anthropic 0.52.0
- Dev: http://localhost:8000
- yfinance es sync: usar asyncio.to_thread() en FastAPI

### Base de datos (Supabase)
- Proyecto: finpulse, Region: West EU (Ireland)
- Ref: vbmvjxourxmtnmlmuomu
- Pooler: aws-0-eu-west-1.pooler.supabase.com (port 5432, session mode)
- DB user: postgres.vbmvjxourxmtnmlmuomu
- Driver: asyncpg con NullPool (pgbouncer compatible)
- IMPORTANTE: usar port 5432 (session mode), NO 6543 (transaction mode)
- Tablas: users, positions, operations, news_articles, daily_summaries, decisions, recommendations, tracking_topics

### Deploy
- Vercel: https://frontend-nginer01s-projects.vercel.app (auto-deploy NO conectado aun)
- Backend: pendiente (Railway)

## yfinance ticker mapping
- IWDA -> IWDA.AS, VUAA -> VUAA.DE (no VUAA.AS ni VUAA.L)
- EUNA -> EUNA.AS, SEMI -> SEMI.AS, BRT -> BZ=F
- US stocks/ETFs: pass-through (AAPL, MSFT, SPY, etc.)

## Design system app (Apple Minimal)
- Fondo: negro puro #000000
- Cards: #1d1d1f/60 con borde white/8%
- Colores: verde #30d158, rojo #ff453a, amarillo #ffd60a
- Nav: fondo BLANCO, texto #1d1d1f

## Design system landing (estilo Rolex)
- Fondo: #faf8f5 (crema calido)
- Cards: bg-white, border #e5e0db, shadow suave, rounded-[20px]
- BorderCard trace: verde #006039 (Rolex green)
- Texto: #1a1a1a (titulos), #555 (cuerpo)
- Rojo: #c4001a, Verde: #006039, Oro: #b8860b
- Tipografia: Helvetica Neue, font-extralight para titulos
- Hero: fixed image con scroll-linked opacity + scale
- Imagenes cinematograficas: parallax (speed 0.12, scale 1.15)

## Paginas frontend (17 rutas + 404)
- `/` Dashboard — CONECTADO a datos reales (portfolio, precios, TradingChart OHLCV)
- `/landing` — Landing estilo Rolex con parallax, 3D tilt, BorderCard trace
- `/resumen` — Briefing diario (mock)
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
### Market data (funcionando):
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

## Pendiente
1. Landing: mas efectos cinematograficos, posiblemente videos reales
2. Conectar mas paginas a datos reales (portfolio, comparador, stress-test)
3. Posiciones en Supabase (no hardcoded)
4. ANTHROPIC_API_KEY + system prompt "CEO de JP Morgan"
5. Integracion Gmail (correo dedicado aun NO creado)
6. Integracion X (Twitter)
7. Polymarket API
8. FRED API para datos macro (instalado, no integrado)
9. Finnhub WebSocket para precios real-time (instalado, no integrado)
10. Autenticacion de usuario
11. Vercel auto-deploy + deploy backend Railway
12. Seleccionar mejores fuentes (newsletters, cuentas X, bancos)

## Notas Windows
- Shell: Git Bash (usar sintaxis Unix)
- TASKKILL //PID X //F (doble slash por git bash)
- psycopg async no funciona en Windows (ProactorEventLoop), usar asyncpg
