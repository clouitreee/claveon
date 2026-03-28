# ClaveON — CLAUDE.md

## Proyecto

Sitio web de marketing y contacto para **ClaveON**, servicio de ayuda técnica para
particulares en Colonia (Köln), Alemania. B2C puro — sin panel de admin, sin base de
datos, sin autenticación.

### Estrategia ClaveON → WERIXO (top-of-funnel B2B)

claveon.de no es solo B2C — actúa como **embudo de captación hacia werixo.de**:

- Usuarios que se identifican como "empresa" en el asistente de precios (`Pakete.astro`)
  son redirigidos a werixo.de en lugar de mostrar precios de particulares.
- El formulario de contacto tiene un toggle **Privat / Unternehmen**: al seleccionar
  "Unternehmen" se oculta el form y aparece el bloque WERIXO con CTA a werixo.de.
- `WerixoBridge.astro` es una sección dedicada de cross-sell que aparece entre el
  formulario y el footer en todas las páginas.
- **Estrategia:** ClaveON captura visibilidad local en Köln → cualifica leads →
  traspasa empresas a WERIXO (Managed Service B2B con monitoring, backups, Evidence Pack).

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
- **CF Pages Functions** (`/functions/api/`) para serverless en TypeScript
- **Brevo** para envío de emails transaccionales (`BREVO_API_KEY`)
- **SimpleLogin** para gestión de alias `info@claveon.de` con reverse alias automático
- **i18n**: DE (default, sin prefijo) + EN (`/en/`)
- Sin dependencias JS de terceros en el cliente — todo vanilla script inline

## Estructura

```
src/
  layouts/
    Layout.astro          # HTML base, meta/SEO/OG, WA FAB, skip nav, scroll reveal, SW registro
  pages/
    index.astro           # Homepage DE
    impressum.astro       # Impressum DE (§19 UStG Kleinunternehmer)
    datenschutz.astro     # Datenschutz DE (DSGVO completo, Art.15-21)
    en/
      index.astro         # Homepage EN
      impressum.astro     # Impressum EN
      datenschutz.astro   # Privacy Policy EN
  components/
    NavBar.astro          # Logo + EN/DE switcher + "Für Unternehmen" link → werixo.de
    Hero.astro            # Headline + price band (€29/€79/€99)
    TrustBar.astro        # 4 checkmarks de confianza
    Services.astro        # Grid de servicios (PC, WLAN, móvil, TV/impresora...)
    Pakete.astro          # Asistente interactivo 3 pasos → precio exacto / WERIXO redirect
    UeberMartin.astro     # Sobre el técnico (foto martin.jpg)
    Kontakt.astro         # Formulario → POST /api/contact | toggle Privat/Unternehmen → WERIXO
    WerixoBridge.astro    # Sección cross-sell dedicada → werixo.de (B2B)
    Windows10.astro       # CTA específico migración W10→11
    Footer.astro          # Links legales, contacto, copyright
  styles/
    global.css            # Fuentes self-hosted, tokens CSS, utilidades
functions/
  api/
    whatsapp.ts           # CF Pages Function — redirect WA con WHATSAPP_NUMBER
    contact.ts            # CF Pages Function — valida, crea SL reverse alias, envía via Brevo
public/
  fonts/                  # IBM Plex Mono + IBM Plex Sans self-hosted (0 req externos)
  assets/                 # martin.jpg, imágenes
  icons/                  # PWA icons: icon-192/512, apple-touch-icon, maskable-192/512
  manifest.webmanifest    # PWA manifest
  sw.js                   # Service Worker (Cache-First assets / Network-First HTML)
  offline.html            # Página offline con contacto directo
  favicon.svg
  robots.txt / sitemap.xml
  _headers                # Security headers: CSP, HSTS, X-Frame-Options, Permissions-Policy
scripts/
  generate-icons.mjs      # Genera PWA icons desde SVG usando sharp
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
- Email: `info@claveon.de` (SimpleLogin alias → outyp@proton.me)
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

## Email Stack

| Capa | Servicio | Rol |
|---|---|---|
| Envío transaccional | **Brevo** (`api.brevo.com/v3/smtp/email`) | Manda notificación al recibir form |
| Sender | `noreply@claveon.de` | Dominio verificado en Brevo |
| Destino | `info@claveon.de` | Alias en SimpleLogin |
| Buzón real | `outyp@proton.me` | Proton Mail premium |
| Reply automático | **SimpleLogin API** | `contact.ts` crea reverse alias por cliente |

**Flujo de respuesta:**
1. Cliente envía formulario → Brevo notifica a `info@claveon.de`
2. `contact.ts` llama a SimpleLogin API → crea contacto para el email del cliente → obtiene reverse alias
3. El reverse alias va en `replyTo` del email y en el botón "Antworten"
4. Martin responde desde Proton (botón o reply directo) → SimpleLogin intercepta → cliente recibe desde `info@claveon.de`

## Backend — CF Pages Functions

### `functions/api/contact.ts`
- Método: `POST`
- Body JSON: `{ name, email, phone?, paket?, message }`
- Validación: nombre 2–100 chars, email RFC, teléfono ≤30, mensaje 10–2000, whitelist pakete
- Honeypot: campo `website` invisible — si viene relleno, silently return
- Llama a SimpleLogin API para crear reverse alias del cliente
- Env vars requeridas: `BREVO_API_KEY`, `SIMPLELOGIN_API_KEY`
- From: `noreply@claveon.de` → To: `info@claveon.de`
- Reply-To: reverse alias de SimpleLogin (fallback: email directo del cliente)
- Email en HTML con template branded ClaveON

### `functions/api/whatsapp.js`
- Redirect al número de WhatsApp
- Env var: `WHATSAPP_NUMBER`

## Variables de entorno (CF Pages Secrets)

| Var | Descripción |
|---|---|
| `BREVO_API_KEY` | Brevo API key para envío de emails transaccionales |
| `SIMPLELOGIN_API_KEY` | SimpleLogin API key — crea reverse alias automático por cliente |
| `WHATSAPP_NUMBER` | Número WA en formato internacional (sin +) |

## PWA

- `public/manifest.webmanifest` — name, short_name, display: standalone, theme: #C1440E
- `public/sw.js` — Cache-First para assets estáticos (fonts, icons, CSS/JS), Network-First para HTML, /api/* excluido
- `public/offline.html` — fallback offline con tel: y WA links
- `public/icons/` — icon-192.png, icon-512.png, apple-touch-icon.png (180px), maskable-192/512
- Generación: `node scripts/generate-icons.mjs` (requiere sharp)
- Service Worker registrado en `Layout.astro` via DOMContentLoaded

## Seguridad

- `public/_headers` — aplica a todas las rutas:
  - `Content-Security-Policy` — default-src 'self', sin CDNs externos
  - `Strict-Transport-Security` — max-age=31536000; includeSubDomains
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — camera, microphone, geolocation, payment bloqueados
- Honeypot en formulario (campo oculto `website`)
- Validación y sanitización completa en `contact.ts` antes de llamar a Brevo

## SEO

- Schema.org: `LocalBusiness`, `FAQPage`, `OfferCatalog` en `index.astro` (DE y EN)
- hreflang DE/EN + x-default configurado en `Layout.astro`
- `sitemap.xml` y `robots.txt` en `/public`
- Fuentes self-hosted → 0 requests externos → Core Web Vitals optimizados
- Meta OG + Twitter Cards completos
- Canonical URLs configurados
- areaServed: 8 ciudades alrededor de Köln

## Desarrollo local

```bash
npm run dev      # localhost:4321
npm run build    # genera dist/
npm run preview  # preview del build estático
```

## Relación con otros proyectos

- **WERIXO** (`werixo.de`) — producto B2B hermano. ClaveON actúa como top-of-funnel:
  - `WerixoBridge.astro` — sección cross-sell entre form y footer
  - Toggle "Unternehmen" en el form → oculta form, muestra CTA a werixo.de
  - Pakete.astro → si selecciona empresa → redirect a werixo.de
