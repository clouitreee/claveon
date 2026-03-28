# ClaveON — Roadmap de mejoras (2026-03)

Basado en auditoría de copy + responsive design. Orden por impacto en conversión y corrección técnica.

---

## FASE 0 — Fundación CSS (prerequisito para todo lo demás)
> Archivos: `src/styles/global.css`
> Impacto: afecta TODOS los componentes

| ID | Tarea | Severidad | Archivo |
|----|-------|-----------|---------|
| F0-1 | `font-size: 20px` → `clamp(16px, 4.5vw, 20px)` en `body` | Crítica | global.css |
| F0-2 | `.btn-primary`, `.btn-ghost` → añadir `min-height: 44px` (WCAG 2.1 AA) | Crítica | global.css |
| F0-3 | `.field` (inputs) → añadir `min-height: 44px` | Crítica | global.css |
| F0-4 | `.section` padding → `clamp(2.5rem, 6vw, 6rem) 0` en lugar de valor fijo | Media | global.css |
| F0-5 | Añadir breakpoint tablet `641px–1024px` en global.css (actualmente ausente) | Media | global.css |

---

## FASE 1 — Copy crítico (mayor impacto en conversión)
> Archivos: `Hero.astro`, `TrustBar.astro`
> Impacto: primeros 3 segundos del usuario

### Hero.astro
| ID | Actual | Propuesto | Justificación |
|----|--------|-----------|---------------|
| C1-1 | `"Technikprobleme? Wir lösen sie."` | `"Ihr Laptop ist zu langsam? Wir kommen zu Ihnen — und erklären alles."` | Específico, diferenciador, empático |
| C1-2 (EN) | `"Tech problems? We solve them."` | `"Your laptop is slow? We come to you — and explain everything."` | Mismo concepto en inglés |
| C1-3 | CTA: `"Was kostet mein Problem? →"` | `"In 60 Sekunden zum Preis →"` | Urgencia + valor explícito |
| C1-4 (EN) | `"What does my problem cost? →"` | `"Get your price in 60 seconds →"` | |
| C1-5 | `"Kein Konzernpreis. Kein Minutentakt."` | `"Feste Preise. Klare Ansage vorher."` | Positivo > negativo |
| C1-6 (EN) | `"No corporate pricing. No per-minute billing."` | `"Fixed prices. Full transparency upfront."` | |

### TrustBar.astro
| ID | Actual | Propuesto | Justificación |
|----|--------|-----------|---------------|
| C1-7 | `"Kein Konzernpreis"` | `"Fester Preis — keine Überraschungen"` | Beneficio emocional (ansiedad de costes) |
| C1-8 | `"Kein Minutentakt"` | `"Ein Techniker — derselbe Mensch"` | Humanización vs. call center |
| C1-9 | `"Köln & 15 km Umgebung"` | `"Antwort in 24 Stunden — garantiert"` | Promesa concreta |
| C1-10 | `"Antwort in 24h"` | `"Sie verstehen alles, was wir tun"` | Propuesta única diferenciadora |

---

## FASE 2 — Responsive crítico
> Archivos: `NavBar.astro`, `Kontakt.astro`
> Impacto: UX en iPhone SE (375px) y accesibilidad

### NavBar.astro
| ID | Problema | Fix | Breakpoint |
|----|----------|-----|------------|
| R2-1 | Items navbar se apilan/rompen en < 375px | Reducir font-sizes a `0.75rem` y `1rem` en `@media (max-width: 375px)` | Mobile S |
| R2-2 | `h-16` (64px) fijo en todos los breakpoints | `min-height: 56px` en mobile | Mobile S/M |

### Kontakt.astro
| ID | Problema | Fix | Breakpoint |
|----|----------|-----|------------|
| R2-3 | Grid form `gap: 4rem` no se resetea en mobile | Añadir `gap: 2rem` en `@media (max-width: 640px)` | Mobile |
| R2-4 | Checkbox consentimiento sin tap target 44px | `input[type="checkbox"] { width: 20px; height: 20px; }` | Todos |
| R2-5 | Selector de grid email+phone frágil (`nth-child(2)`) | Refactorizar a clase `.form-row-2col` | Mobile |

---

## FASE 3 — Copy medio impacto
> Archivos: `Services.astro`, `UeberMartin.astro`, `Kontakt.astro`

### Services.astro — Reorganización por categorías
| ID | Tarea |
|----|-------|
| C3-1 | Reorganizar 12 servicios en 3 categorías: "Reparieren", "Einrichten", "Sichern & Upgraden" |
| C3-2 | Cambiar headline: `"Wenn es Strom hat, schauen wir es uns an."` → `"Was funktioniert nicht? Wir lösen es — fast jedes Gerät."` |
| C3-3 | Revisar descripciones de cada servicio: síntomas concretos en lugar de tecnicismos |

### UeberMartin.astro — Humanización
| ID | Tarea |
|----|-------|
| C3-4 | Añadir años de experiencia al texto (ej: "Seit über 10 Jahren repariert Martin Geräte") |
| C3-5 | Añadir subtítulo bajo foto con especialidades: `"PC · WLAN · Smartphones"` |
| C3-6 | Cambiar texto a algo más concreto y menos abstracto que "Leidenschaft für Technik" |

### Kontakt.astro — Formulario más humano
| ID | Tarea |
|----|-------|
| C3-7 | Cambiar intro del form: `"Schreiben Sie uns."` → `"Schreiben Sie kurz was los ist — Martin meldet sich in 24 Stunden."` |
| C3-8 | Mejorar placeholder de Nachricht: añadir ejemplo concreto ("z.B.: Seit gestern ist mein PC sehr langsam") |
| C3-9 | Label del select de paket: `"Paket (optional)"` → `"Worum geht es? (optional)"` |

---

## FASE 4 — Responsive medio impacto
> Archivos: `Services.astro`, `Pakete.astro`, `BrandTicker.astro`, `UeberMartin.astro`, `Footer.astro`

### Services.astro
| ID | Problema | Fix |
|----|----------|-----|
| R4-1 | Grid 5 cols sin breakpoint 641–767px (tablet angosta) | `@media (641px–767px) { grid-template-columns: repeat(3, 1fr); }` |
| R4-2 | Tile font-sizes fijos 0.7–0.8rem | Aplicar `clamp(0.65rem, 2vw, 0.9rem)` |
| R4-3 | Accordion `padding-left: 2.5rem` excesivo en mobile S | Reducir a `1.5rem` en `@media (max-width: 640px)` |

### Pakete.astro
| ID | Problema | Fix |
|----|----------|-----|
| R4-4 | Tiles `minmax(150px, 1fr)` causa overflow en Mobile S | `minmax(100px, 1fr)` + `repeat(2, 1fr)` en `@media (max-width: 640px)` |
| R4-5 | Result card sin `max-width` en Wide (>1440px) | `max-width: 600px; margin: auto;` |

### BrandTicker.astro
| ID | Problema | Fix |
|----|----------|-----|
| R4-6 | Font-size y SVG fijos en mobile | `font-size: 0.7rem; svg: 18px` en `@media (max-width: 640px)` |
| R4-7 | Padding `2.5rem` excesivo en mobile | `padding: 1.5rem 0` en `@media (max-width: 640px)` |

### UeberMartin.astro
| ID | Problema | Fix |
|----|----------|-----|
| R4-8 | Imagen `200px` fija sin breakpoint tablet | `160px` en `@media (641px–1024px)` |

### Footer.astro
| ID | Problema | Fix |
|----|----------|-----|
| R4-9 | Links footer < 44px tap target | `min-height: 44px; display: inline-flex; align-items: center; padding: 0.5rem` |
| R4-10 | Flex gap no se resetea en mobile | `flex-direction: column; gap: 1rem` en `@media (max-width: 640px)` |

---

## FASE 5 — Copy bajo impacto + cross-sell
> Archivos: `Footer.astro`, `NavBar.astro`

| ID | Tarea |
|----|-------|
| C5-1 | Footer: separar visualmente sección WERIXO del footer principal |
| C5-2 | Footer: texto de privacidad → más humano: "Ihre Daten sind sicher. Kein Tracking." |
| C5-3 | NavBar: "Für Unternehmen ↗" → badge visual con fondo `terra-light` más visible |

---

## FASE 6 — Funcionalidades nuevas (futuro)
> Requieren decisión y datos externos antes de implementar

| ID | Tarea | Dependencia |
|----|-------|-------------|
| F6-1 | Páginas de barrio: `/koeln/ehrenfeld/`, `/koeln/nippes/` etc. (hyperlocal SEO) | Contenido a redactar |
| F6-2 | Schema `AggregateRating` + mostrar reseñas reales | Reseñas Google/reales |
| F6-3 | Embed Calendly/cal.com para reserva directa | Cuenta cal.com |
| F6-4 | Google Search Console: verificar indexación real | Acceso GSC |
| F6-5 | Blog/FAQ: artículos long-tail ("Windows 10 läuft aus — was tun?") | Tiempo redacción |

---

## Orden de ejecución recomendado

```
FASE 0  →  FASE 1  →  FASE 2  →  FASE 3  →  FASE 4  →  FASE 5  →  FASE 6
(CSS)     (Copy★)   (Resp★)    (Copy)     (Resp)     (Cross)    (Futuro)
```

**★ Prioridad máxima** — Fases 0, 1 y 2 tienen el mayor ROI inmediato.

---

## Estimación de esfuerzo

| Fase | Archivos tocados | Complejidad | Riesgo de regresión |
|------|-----------------|-------------|---------------------|
| F0 | 1 (global.css) | Baja | Bajo (solo CSS) |
| F1 | 2 (Hero, TrustBar) | Baja | Nulo |
| F2 | 2 (NavBar, Kontakt) | Media | Bajo |
| F3 | 3 (Services, UeberMartin, Kontakt) | Media | Nulo (solo copy) |
| F4 | 5 (varios) | Baja-Media | Bajo |
| F5 | 2 (Footer, NavBar) | Baja | Nulo |
| F6 | Nuevos archivos | Alta | Bajo |

---

_Generado: 2026-03-28 · Basado en auditoría de copy + responsive design_
