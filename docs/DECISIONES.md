# Registro de decisiones - FinPulse

Historial cronológico de todas las decisiones tomadas durante el diseño del proyecto.

---

## 2026-05-08 — Sesión 1: Definición inicial

### Decisión 1: Stack tecnológico
- **Python** para backend
- **Decidido por**: usuario

### Decisión 2: Tipo de inversiones
- **Acciones/ETFs**, mercados globales
- **Decidido por**: usuario

### Decisión 3: IA para análisis
- **Claude API** (Anthropic SDK)
- **Decidido por**: usuario

### Decisión 4: Fuentes de información
- El usuario las provee él mismo via Gmail dedicado
- NO scraping automático de fuentes externas
- Periódicos de WhatsApp se reenvían al Gmail
- Cuentas de X (acceso a cuenta propia)
- Informes semanales de bancos
- Polymarket para sentimiento
- Podcasts (UBS On-Air confirmado)
- **Decidido por**: usuario

### Decisión 5: Calidad > brevedad
- Los resúmenes pueden ser tan extensos como sea necesario
- Lo que importa es la calidad y profundidad
- **Decidido por**: usuario

### Decisión 6: Tipo de app
- Web app responsive (PWA) desplegada en la nube
- Acceso desde móvil (navegador/PWA) y PC
- Stack: FastAPI + React/Next.js + PostgreSQL
- **Decidido por**: usuario (con recomendación)

### Decisión 7: Portfolio — entrada de datos
- Manual + CSV/Excel + sincronización con Revolut
- **Decidido por**: usuario

### Decisión 8: Vista del portfolio
- Completa + análisis + lecciones y escenarios alternativos
- **Decidido por**: usuario

### Decisión 9: Temas de seguimiento
- Manual + automático, con prioridad dinámica (mixta)
- **Decidido por**: usuario

### Decisión 10: Horario del resumen
- Todos los días a las 9:00 AM (hora Argentina)
- **Decidido por**: usuario

### Decisión 11: Memoria acumulativa
- No resumir noticias repetidas, sino profundizar sobre lo ya conocido
- **Decidido por**: usuario

### Decisión 12: Rol de la IA
- Actuar como "CEO de JP Morgan": recomendar activamente
- Historial de recomendaciones (seguidas vs no seguidas)
- Aprendizaje acumulativo
- **Decidido por**: usuario

### Decisión 13: Factor social e histórico
- Paralelismos históricos + sentimiento social (Polymarket)
- **Decidido por**: usuario

### Decisión 14: Funcionalidades adicionales aceptadas
- Hilo temporal de noticias
- Índice de convicción (1-10)
- Radar de oportunidades
- Contraargumentos automáticos
- Resumen semanal (domingos)
- **Propuesto por**: IA — **Aceptado por**: usuario

## 2026-05-08 — Sesión 2: Decisiones técnicas clave

### Decisión 15: Idioma de los resúmenes
- Siempre en **español**
- Términos técnicos financieros se dejan en inglés cuando no tienen buena traducción
- **Decidido por**: usuario (con recomendación)

### Decisión 16: Interacción para profundizar noticias
- **Preview expandible** al hacer click (resumen rápido en la misma página)
- **Botón "Profundizar"** que abre página completa con análisis detallado, hilo temporal, impacto en portfolio
- **Decidido por**: usuario (con recomendación)

### Decisión 17: Memoria de noticias — embeddings + pgvector
- Usar **pgvector** (extensión de PostgreSQL) con embeddings semánticos
- Permite encontrar noticias relacionadas automáticamente
- Conecta noticias con posiciones del portfolio sin configuración manual
- Base para: memoria acumulativa, hilos temporales, radar de oportunidades
- **Decidido por**: usuario (con recomendación)

### Decisión 18: Dos zonas en la app
- **Zona 1 — Información y Aprendizaje**: Noticias, resúmenes, 6 ventanas, análisis, lecciones
- **Zona 2 — Portfolio de Inversiones**: Posiciones, rendimiento visual, noticias vinculadas a inversiones, invertir desde la app, inversiones no realizadas ("el camino no tomado")
- **Decidido por**: usuario

### Decisión 19: Invertir desde la app
- Posibilidad de ejecutar operaciones directamente desde la Zona 2 (vía API del broker/Revolut)
- **Decidido por**: usuario

### Decisión 20: Inversiones no realizadas ("El camino no tomado")
- Registrar oportunidades descartadas y simular cómo habrían ido
- Comparación visual: "lo que hiciste" vs "lo que podrías haber hecho"
- Análisis de qué señales previas indicaban que era rentable
- **Decidido por**: usuario

### Decisión 21: Conexión visual noticias ↔ inversiones
- Gráficos de precio con marcadores de noticias relevantes superpuestos
- Ver cómo cada noticia afectó a cada posición
- **Decidido por**: usuario
