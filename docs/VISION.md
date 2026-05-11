# FinPulse - Documento de Visión del Proyecto

## Qué es FinPulse
Plataforma personal de aprendizaje financiero + gestión de inversiones. No es solo una app de inversión ni solo una app de noticias: es un **mix personalizado** que conecta información, decisiones de inversión y aprendizaje en un solo lugar.

**Filosofía**: Aprender mientras inviertes. Cada decisión (buena o mala) es una lección. Cada noticia se conecta con tu dinero real.

---

## Stack técnico
| Componente | Tecnología |
|---|---|
| Backend | Python (FastAPI) |
| Frontend | React o Next.js |
| Base de datos | PostgreSQL (Supabase o similar) |
| IA | Claude API (Anthropic SDK) |
| Búsqueda semántica | pgvector (extensión PostgreSQL) + embeddings |
| Deploy | Railway, Render o Vercel |
| Tipo de app | Web app responsive (PWA), accesible desde móvil y PC |
| Idioma | Resúmenes siempre en español (términos técnicos sin traducción cuando sea mejor) |

---

## Fuentes de información

Todas las fuentes las provee y controla el usuario. No hay scraping automático de fuentes externas no autorizadas.

| Fuente | Cómo llega | Estado |
|---|---|---|
| Newsletters | Gmail dedicado | Por crear el correo |
| Papers de fondos | Gmail dedicado | Por crear el correo |
| Periódicos | WhatsApp → reenviar a Gmail | Confirmado |
| Cuentas de X (Twitter) | Acceso a cuenta propia del usuario | Por definir cuentas |
| Informes semanales de bancos | Por definir | Por definir qué bancos |
| Polymarket | API pública | Por integrar |
| Podcasts | Transcripción automática | UBS On-Air (Paul Donovan, diario) confirmado |

### Podcasts confirmados
- **UBS On-Air** — Paul Donovan, diario, Spotify

### Fuentes recomendadas (por evaluar juntos)
**Podcasts:**
- Bloomberg Surveillance (macro global, diario)
- Odd Lots (Bloomberg, temas de nicho)
- The All-In Podcast (tech + inversión, semanal)
- Macro Voices (macro profundo, semanal)

**Newsletters:**
- Matt Levine / Money Stuff (Bloomberg, análisis de mercados)
- The Daily Shot (gráficos macro diarios)
- Finimize (resúmenes concisos)

**Cuentas de X y bancos:** pendiente de definir con el usuario.

---

## Estructura de la app: Dos zonas

La app se divide en **dos zonas principales**:

### ZONA 1: Información y Aprendizaje
Todo lo relacionado con noticias, resúmenes, análisis y conocimiento.

### ZONA 2: Portfolio de Inversiones
Todo lo relacionado con tu dinero: posiciones, rendimiento, oportunidades perdidas y futuras. Muy visual. Posibilidad de invertir directamente desde aquí.

---

## ZONA 1: Información y Aprendizaje

### 1. Resumen diario (9:00 AM hora España)
- Integra TODAS las fuentes: Gmail, X, Polymarket, podcasts, informes
- Priorizado según temas de seguimiento y portfolio del usuario
- **Memoria acumulativa** (pgvector + embeddings): Las noticias se almacenan con embeddings semánticos. Cuando llega una noticia nueva, el sistema busca noticias relacionadas anteriores y profundiza sobre lo ya conocido en vez de resumir desde cero. Esto también permite conectar automáticamente noticias con posiciones del portfolio sin configuración manual.
- X y Polymarket aportan: opiniones relevantes, argumentos predictivos, perspectivas complementarias

### 2. Seis ventanas de noticias (para profundizar individualmente)
| Tipo | Descripción |
|---|---|
| 2 de interés personal | Relacionadas con inversiones actuales o que se está considerando hacer |
| 2 de información nueva | Temas no tratados antes, interesantes y con conocimiento fresco |
| 2 de visión futura | Noticias que podrían tener mucho peso a futuro, para anticiparse |

**Interacción para profundizar:**
- **Click en una ventana** → se expande un preview rápido en la misma página (resumen, impacto en portfolio, datos clave)
- **Botón "Profundizar"** → abre una página completa dedicada con: análisis detallado, hilo temporal, paralelismos históricos, impacto en portfolio, contraargumentos

### 3. Todo conectado al portfolio
Cada noticia se vincula al portfolio cuando es relevante.

---

## ZONA 2: Portfolio de Inversiones

Zona muy visual, centrada en el dinero real del usuario.

### Entrada de datos
- **Manual**: Formulario (ticker, cantidad, precio de compra, fecha)
- **Importar**: CSV/Excel con historial de operaciones
- **Broker**: Revolut (sincronización automática si hay API disponible)
- **Invertir desde la app**: Posibilidad de ejecutar operaciones directamente (vía API del broker)

### Vista del portfolio
- Valor total, ganancia/pérdida por posición, % cambio diario
- Distribución por sector y geografía
- Rendimiento vs benchmarks (S&P500, MSCI World, etc.)
- Historial de decisiones
- Sugerencias de rebalanceo, alertas de riesgo, correlaciones entre posiciones
- **Conexión visual noticias ↔ inversiones**: Ver cómo cada noticia ha afectado a cada posición (ej: gráfico de precio con marcadores de noticias relevantes superpuestos)

### Inversiones no realizadas ("El camino no tomado")
- Registro de oportunidades que se descartaron o no se siguieron
- Simulación visual de cómo habrían evolucionado
- Análisis de qué señales había para prever que eran rentables
- Comparación lado a lado: "lo que hiciste" vs "lo que podrías haber hecho"

### Mercados
- Global (no solo US)
- Acciones y ETFs

---

## Rol de la IA: "CEO de JP Morgan"

La IA no solo informa, **recomienda activamente** como un director de inversiones de alto nivel.

### Historial de recomendaciones
- Registrar TODAS las recomendaciones
- Separar: las que el usuario siguió (y cómo fueron) vs las que NO siguió (y cómo habrían ido)
- **Aprendizaje acumulativo**: toda la información se acumula para que las recomendaciones mejoren con el tiempo

### Índice de convicción (1-10)
Cada recomendación lleva un score basado en:
- Número de fuentes que lo respaldan
- Sentimiento en Polymarket
- Paralelismos históricos

### Contraargumentos automáticos
Cada recomendación incluye el caso a favor Y el caso en contra. Anti sesgo de confirmación.

---

## Sistema de aprendizaje

### Post-decisión
Cuando una inversión sube o baja por una noticia, la app explica:
1. **¿Qué pasó?** El evento y por qué afectó al precio
2. **¿Qué se podría haber hecho?** Estrategias de defensa o cobertura
3. **¿Se podía haber previsto?** Señales previas que indicaban el movimiento

**Ejemplo**: Invertí 100€ en Brent → Trump anuncia negociaciones con Irán → Brent cae → La app explica: por qué bajó, cómo cubrir la posición (stop-loss, opciones), y qué señales había de que la tensión se iba a relajar.

### Escenarios alternativos
- "Si en vez de comprar X hubieras comprado Y, hoy tendrías Z"
- Simulación de caminos alternativos para cada decisión

### Lecciones aprendidas
- Cada decisión genera una lección (buena o mala)
- Se construye un historial personal de aprendizaje como inversor

---

## Factor social e histórico

### Paralelismos históricos
- Ante cualquier situación de mercado: ¿ha pasado algo parecido antes? ¿Cómo se desarrolló?
- Usar el pasado como herramienta predictiva

### Sentimiento social
- Medir: miedo, optimismo, euforia, pánico
- Polymarket como fuente clave de sentimiento y expectativas
- Contextualizar recomendaciones con estos datos

---

## Temas de seguimiento

### Sistema mixto (manual + automático)
- El usuario define temas a mano (ej: "petróleo", "IA", "semiconductores")
- La app sugiere temas automáticamente basados en el portfolio

### Prioridad dinámica
- El usuario asigna prioridad base: ALTA / MEDIA / BAJA
- La app puede subir la prioridad dinámicamente si hay eventos relevantes ese día
- Ej: Semiconductores está en MEDIA, pero si NVIDIA cae un 10%, sube a ALTA para ese resumen

### Impacto en la app
Los temas de seguimiento afectan:
- El orden y espacio en el resumen diario
- Qué noticias se seleccionan para las 6 ventanas
- Las alertas y análisis del portfolio

---

## Funcionalidades adicionales

1. **Hilo temporal de noticias**: Ver la evolución de una noticia a lo largo de días/semanas como línea temporal. Cómo empezó, cómo evolucionó, impacto en precios.

2. **Radar de oportunidades**: Detectar temas emergentes que aún no son mainstream pero podrían tener gran impacto.

3. **Resumen semanal (domingos)**: Qué aprendiste, qué decisiones tomaste, cómo van las recomendaciones, score de aprendizaje/progreso.

---

## Decisiones pendientes
- [x] ~~Idioma de los resúmenes~~ → Siempre español
- [x] ~~Cómo se accede a profundizar una noticia~~ → Preview expandible + página completa
- [x] ~~Memoria de noticias~~ → Embeddings + pgvector
- [ ] Diseño visual / layout de la interfaz
- [ ] Detalles de la API de Revolut para sincronización
- [ ] Qué cuentas de X seguir
- [ ] Qué bancos/informes semanales incluir
- [ ] Selección final de newsletters, periódicos y papers
- [ ] Selección final de podcasts adicionales
- [ ] Acceso a datos de Polymarket (API pública)
