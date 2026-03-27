# ClaveON — CLAUDE.md

## Proyecto

Sitio web de marketing y contacto para **ClaveON**, servicio de ayuda técnica para
particulares y pequeñas empresas en Colonia (Köln), Alemania. B2C puro — sin panel de
admin, sin base de datos, sin autenticación.

## Infraestructura

| Elemento | Valor |
|---|---|
| **Dominio producción** | `claveon.de` |
| **CF Pages project** | `koeln-tech-helfer` |
| **Dominio Pages** | `koeln-tech-helfer.pages.dev` |
| **GitHub repo** | `github.com/clouitreee/claveon` |
| **Cuenta Cloudflare** | SolidMelon (`52db64bf68edecb9ff0443b0c7ba2fc1`) |
| **Deploy** | Push a `main` → build automático en CF Pages |
| **Build command** | `npm run build` (output: `dist/`) |
| **Output mode** | `static` |

## Stack

- **Astro 5** + **Tailwind CSS v4** (`@tailwindcss/vite`)
- Sin frameworks JS de UI — todo HTML estático generado en build
- **CF Pages Functions** (`/functions/api/`) para serverless
- **Resend** para envío de emails (API key en env var `RESEND_API_KEY`)
- **i18n**: DE (default, sin prefijo) + EN (`/en/`)
- Sin dependencias JS de terceros en el cliente — todo vanilla script inline

## Estructura

```
src/
  layouts/
    Layout.astro          # HTML base, meta/SEO/OG, WA FAB, scroll reveal
  pages/
    index.astro           # Homepage DE
    impressum.astro
    datenschutz.astro
    en/
      index.astro         # Homepage EN
      impressum.astro
      datenschutz.astro
  components/
    NavBar.astro          # Logo + EN/DE switcher + "Für Unternehmen" link
    Hero.astro            # Headline + price band (€29/€79/€99)
    TrustBar.astro        # 4 checkmarks de confianza
    Services.astro        # Grid de servicios (PC, WLAN, móvil, TV/impresora...)
    Pakete.astro          # Asistente interactivo 3 pasos → precio exacto
    UeberMartin.astro     # Sobre el técnico (foto martin.jpg)
    Kontakt.astro         # Formulario → POST /api/contact
    WerixoBridge.astro    # Sección cross-sell → werixo.de (B2B)
    Windows10.astro       # CTA específico migración W10→11
    Footer.astro          # Links legales, contacto, copyright
  styles/
    global.css            # Fuentes self-hosted, tokens CSS, utilidades
functions/
  api/
    whatsapp.js           # CF Pages Function — redirect WA con WHATSAPP_NUMBER
    contact.js            # CF Pages Function — envía email vía Resend
public/
  fonts/                  # IBM Plex Mono + IBM Plex Sans self-hosted (0 req externos)
  assets/                 # martin.jpg, imágenes
  favicon.svg / favicon-180.svg
  robots.txt / sitemap.xml
```

## Diseño — Tokens CSS

Definidos en `src/styles/global.css` como variables CSS:

| Token | Valor | Uso |
|---|---|---|
| `--terra` | `#C1440E` | Color principal (naranja ladrillo) — CTAs, precios, accent |
| `--terra-light` | `#FDF0EB` | Fondos suaves |
| `--terra-dark` | `#8B2E06` | Hover estados |
| `--green` | `#15803D` | Mensajes de confirmación |
| `--text` | negro/gris oscuro | Texto principal |
| `--muted` | gris medio | Texto secundario |
| `--subtle` | gris claro | Texto terciario |
| `--border` | gris suave | Bordes |
| `--bg-soft` | blanco roto | Fondos de secciones alternas |

**Fuentes self-hosted** (sin Google Fonts, 0 requests externos):
- `IBM Plex Mono` (400, 600, 700) — monoespaciada, usada en labels, precios, código
- `IBM Plex Sans` (400–700 variable) — sans-serif, usada en cuerpo

**Estética:** minimalista, editorial, blanco/negro + terra. Sin sombras decorativas,
sin gradientes. Tipografía grande y bold. Estilo alemán/suizo.

## Negocio — Datos clave

**Contacto:**
- Email: `info@claveon.de`
- WhatsApp: número en env var `WHATSAPP_NUMBER` (CF Pages secret)
- WA redirect: `/api/whatsapp` → CF Pages Function

**Idiomas:** DE (principal) + EN (`/en/`)
**Idiomas del técnico:** DE, ES, EN

**Área de servicio:** Köln (todos los barrios) + 15 km alrededor.
Cities en schema: Köln, Hürth, Frechen, Pulheim, Leverkusen, Bergisch Gladbach,
Dormagen, Brühl.

**Horario (schema):** Lun–Dom 09:00–20:00
**Respuesta garantizada:** dentro de 24h

**Precios actuales:**

| Servicio | Precio |
|---|---|
| Fernwartung (30 min) | €29 |
| Vor Ort / Einsatz (~1h) | €79 |
| Neustart-Paket (nuevo dispositivo + migración) | €89 |
| Windows 10 → 11 migration | €99 |
| Stundensatz | €59/h |

**Asistente de precios (`Pakete.astro`):** flujo 3 pasos interactivo
(¿para quién? → ¿qué dispositivo? → ¿qué problema?) que muestra el precio exacto.
Si selecciona "empresa" → redirige a WERIXO (B2B).

## Backend — CF Pages Functions

### `functions/api/contact.js`
- Método: `POST`
- Body JSON: `{ name, email, phone?, paket?, message }`
- Env var requerida: `RESEND_API_KEY`
- From: `noreply@send.claveon.de` → To: `info@claveon.de`
- Reply-to: email del usuario

### `functions/api/whatsapp.js`
- Redirect al número de WhatsApp
- Env var: `WHATSAPP_NUMBER`

## Variables de entorno (CF Pages Secrets)

| Var | Descripción |
|---|---|
| `RESEND_API_KEY` | API key de Resend para envío de emails |
| `WHATSAPP_NUMBER` | Número WA en formato internacional (sin +) |

## SEO

- Schema.org: `LocalBusiness`, `FAQPage`, `OfferCatalog` en `index.astro`
- hreflang DE/EN configurado en `Layout.astro`
- `sitemap.xml` y `robots.txt` en `/public`
- Fuentes self-hosted → 0 requests externos → Core Web Vitals optimizados
- Meta OG + Twitter Cards completos
- Canonical URLs configurados

## Desarrollo local

```bash
npm run dev      # localhost:4321
npm run build    # genera dist/
npm run preview  # preview del build estático
```

## Relación con otros proyectos

- **WERIXO** (`werixo.de`) — producto B2B hermano. `WerixoBridge.astro` hace
  cross-sell hacia él cuando el usuario es empresa.
- **ClaveON_B2C** (`/Users/rootml/Documents/Arbeitskram/claveon.de/ClaveON_B2C`) —
  versión anterior en React/Vite (Lovable), **obsoleta**. No está en producción.
  GitHub: `clouitreee/claveon-connect`.
