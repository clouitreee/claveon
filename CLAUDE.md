# ClaveON — CLAUDE.md

> Última actualización: 2026-03-29
> Estado: producción activa en claveon.de

---

## Proyecto

Sitio web de marketing y contacto para **ClaveON**, servicio de ayuda técnica para
particulares en Colonia (Köln), Alemania. B2C puro — sin panel de admin, sin base de
datos, sin autenticación.

**Técnico:** Carlos (DE · ES · EN)

### Estrategia ClaveON → WERIXO (top-of-funnel B2B)

claveon.de actúa como embudo de captación hacia werixo.de:

- Toggle **Privat / Unternehmen** en el form: "Unternehmen" oculta el form y muestra CTA a werixo.de
- `WerixoBridge.astro` — sección cross-sell dedicada entre form y footer
- `Pakete.astro` — si selecciona empresa → redirect a werixo.de
- Footer → `WERIXO — werixo.de ↗`

---

## Infraestructura

| Elemento | Valor |
|---|---|
| **Dominio** | `claveon.de` |
| **CF Pages project** | `koeln-tech-helfer` |
| **CF Account** | SolidMelon (`52db64bf68edecb9ff0443b0c7ba2fc1`) |
| **GitHub repo** | `clouitreee/claveon` |
| **Deploy** | `git push origin main` → build automático (~1 min) |
| **Build** | `npm run build` → `dist/` |

---

## Stack

- **Astro 5** + **Tailwind CSS v4** (`@tailwindcss/vite`)
- Sin frameworks JS de UI — HTML estático generado en build
- **CF Pages Functions** (`/functions/`) — serverless TypeScript
- **Brevo** — envío transaccional (`BREVO_API_KEY`)
- **Zoho Mail** — buzón `info@claveon.de` (MX → Zoho EU)
- **i18n**: DE (default, sin prefijo) + EN (`/en/`)
- Sin dependencias JS de terceros en el cliente

---

## Estructura de archivos

```
src/
  layouts/
    Layout.astro          # HTML base, meta/SEO/OG, WA FAB, SW registro
  pages/
    index.astro           # Homepage DE
    impressum.astro       # Impressum DE (§19 UStG Kleinunternehmer)
    datenschutz.astro     # Datenschutz DE (DSGVO, Art.15-21)
    en/
      index.astro         # Homepage EN
      impressum.astro     # Impressum EN
      datenschutz.astro   # Privacy Policy EN
  components/
    NavBar.astro          # Logo + EN/DE + "Für Unternehmen" → werixo.de
    Hero.astro            # Headline + price band (€29/€79/€99)
    TrustBar.astro        # 4 checkmarks de confianza
    Services.astro        # Grid desktop / accordion mobile (11 servicios)
    Pakete.astro          # Asistente 3 pasos → precio exacto / WERIXO redirect
    UeberCarlos.astro     # Sobre el técnico (foto: /assets/martin.jpg)
    Kontakt.astro         # Formulario → POST /api/contact
    WerixoBridge.astro    # Cross-sell B2B → werixo.de
    Windows10.astro       # CTA migración W10→11
    Footer.astro          # Links legales + WERIXO link
    BrandTicker.astro     # Ticker marcas compatibles (Apple, Samsung, etc.)
  styles/
    global.css            # Fuentes self-hosted, tokens CSS, utilidades, responsive
functions/
  api/
    contact.ts            # POST /api/contact — valida + envía emails via Brevo
    whatsapp.ts           # GET /api/whatsapp — redirect WA
public/
  fonts/                  # IBM Plex Mono + IBM Plex Sans self-hosted
  assets/                 # Imágenes (martin.jpg = foto de Carlos)
  icons/                  # PWA icons
  manifest.webmanifest
  sw.js                   # Service Worker Cache-First/Network-First
  offline.html
  _headers                # Security headers
  robots.txt / sitemap.xml
```

---

## Diseño — Tokens CSS

| Token | Valor | Uso |
|---|---|---|
| `--terra` | `#C1440E` | Color principal — CTAs, precios, accent |
| `--terra-light` | `#FDF0EB` | Fondos suaves |
| `--terra-dark` | `#8B2E06` | Hover |
| `--green` | `#15803D` | Confirmaciones |
| `--text` | `#111111` | Texto principal |
| `--muted` | `#4B5563` | Texto secundario |
| `--border` | `#E5E7EB` | Bordes |
| `--bg-soft` | `#F9F7F5` | Fondos alternos |

**Fuentes self-hosted** (0 requests externos en el sitio):
- `IBM Plex Mono` 400/600/700 — logo, headings, labels, precios
- `IBM Plex Sans` 400–700 variable — cuerpo

**Logo:** `Clave` negro (`--text`) + `ON` terracota (`--terra`), IBM Plex Mono 700.
**Logo en emails:** `Clave` blanco + `ON` crema `#fde8df` sobre header `bgcolor="#C1440E"`.
**Emails:** IBM Plex Mono via Google Fonts `@import` (fallback: Courier New).

**Estética:** minimalista editorial, blanco/negro + terra. Sin sombras decorativas ni gradientes.

---

## Negocio — Datos clave

**Contacto público:**
- Email: `info@claveon.de` (Zoho Mail)
- WhatsApp: `WHATSAPP_NUMBER` env var → `/api/whatsapp`

**Área:** Köln + 15 km. Schema: Köln, Hürth, Frechen, Pulheim, Leverkusen, Bergisch Gladbach, Dormagen, Brühl.
**Horario schema:** Lun–Dom 09:00–20:00

**Precios:**

| Servicio | Precio |
|---|---|
| Fernwartung / 30 min | €29 |
| Vor-Ort / Einsatz | €79 |
| Neustart-Paket | €89 |
| Windows 10 → 11 | €99 |
| Stundensatz | €59/h |

---

## Sistema de Email — Arquitectura actual

### Stack de correo

| Capa | Servicio | Rol |
|---|---|---|
| **Buzón** | Zoho Mail | `info@claveon.de` — recibe y envía |
| **Transaccional** | Brevo | Notificaciones de formulario + confirmaciones a clientes |
| **Sender** | `noreply@claveon.de` | Dominio verificado en Brevo |

### Flujo — Formulario de contacto

```
Cliente → POST /api/contact
  ↓
contact.ts valida campos
  ↓
Brevo envía 2 emails:

  1. NOTIFICACIÓN a Carlos
     From:     noreply@claveon.de
     To:       info@claveon.de  (Zoho)
     Reply-To: email directo del cliente
     Body:     HTML branded con nombre, email, teléfono, paket, mensaje

  2. CONFIRMACIÓN al cliente
     From:     noreply@claveon.de
     To:       email del cliente
     Reply-To: info@claveon.de
     Body:     "Vielen Dank — wir melden uns innerhalb von 24 Stunden"
```

### Flujo — Carlos responde al cliente

```
Carlos recibe notificación en Zoho
  ↓
Responde directamente desde Zoho (info@claveon.de)
  ↓
Cliente recibe respuesta desde info@claveon.de ✅
Si cliente responde → llega a Zoho ✅
Hilo completo en Zoho ✅
```

### Template HTML de emails

- Header `<td bgcolor="#C1440E">` — terracota (bgcolor obligatorio para Gmail)
- Logo: `<span #fff>Clave</span><span #fde8df>ON</span>` IBM Plex Mono 700
- Body blanco, `Helvetica Neue, Arial`
- Accent terracota en bordes izquierdos y firma
- Footer: `claveon.de · info@claveon.de`

---

## DNS — claveon.de (estado actual)

| Tipo | Nombre | Valor | Notas |
|---|---|---|---|
| MX | `@` | `mx.zoho.eu` (10) | Zoho EU |
| MX | `@` | `mx2.zoho.eu` (20) | Zoho EU |
| MX | `@` | `mx3.zoho.eu` (50) | Zoho EU |
| CNAME | `@` | `koeln-tech-helfer.pages.dev` | CF Pages |
| CNAME | `brevo1._domainkey` | `b1.claveon-de.dkim.brevo.com` | DKIM Brevo |
| CNAME | `brevo2._domainkey` | `b2.claveon-de.dkim.brevo.com` | DKIM Brevo |
| TXT | `zoho._domainkey` | `v=DKIM1; k=rsa; p=...` | DKIM Zoho |
| TXT | `@` | `v=spf1 include:spf.brevo.com include:zoho.eu ~all` | SPF |
| TXT | `@` | `zoho-verification=zb53642112.zmverify.zoho.eu` | Verificación Zoho |
| TXT | `@` | `brevo-code:370a26085d623e5957435c52e235e7ab` | Verificación Brevo |
| TXT | `@` | `google-site-verification=...` | GSC |
| TXT | `_dmarc` | `v=DMARC1; p=reject; pct=100; adkim=r; aspf=r; rua=mailto:info@claveon.de` | DMARC estricto |

### Cloudflare Zone — Seguridad

| Setting | Valor |
|---|---|
| SSL | Full (Strict) |
| TLS mínimo | 1.3 |
| HSTS | on · 1 año · preload · includeSubDomains |
| Always HTTPS | on |
| HTTPS Rewrites | on |
| Security level | high |

---

## CF Pages Functions

### `functions/api/contact.ts`

```typescript
interface Env {
  BREVO_API_KEY: string;
  NOTIFICATION_EMAIL: string;  // info@claveon.de
}
```

- `POST /api/contact`
- Body: `{ name, email, phone?, paket?, message, website? }`
- `website` = honeypot (bot → retorna 200 silencioso)
- Validaciones: nombre 2–100, email RFC ≤254, teléfono ≤30, mensaje 10–2000, pakete whitelist
- Envía 2 emails via Brevo: notificación a Carlos + confirmación al cliente

### `functions/api/whatsapp.ts`

- `GET /api/whatsapp` → redirect a WA
- Env: `WHATSAPP_NUMBER`

---

## Variables de entorno (CF Pages)

| Var | Tipo | Descripción |
|---|---|---|
| `BREVO_API_KEY` | Secret | API key Brevo |
| `NOTIFICATION_EMAIL` | Plain text | `info@claveon.de` — recibe notificaciones |
| `WHATSAPP_NUMBER` | Secret | Número WA sin `+` |
| `REPLY_PASSWORD` | Secret | Obsoleto — puede eliminarse |

---

## Zoho Mail — Configuración

- **Buzón:** `info@claveon.de`
- **Plan:** Free (dominio propio)
- **DKIM:** activo (`zoho._domainkey.claveon.de`)
- **MX:** Zoho EU (`mx.zoho.eu` / `mx2` / `mx3`)
- **Carlos responde** directamente desde Zoho — hilo completo en Zoho

---

## Brevo — Configuración

- **Sender:** `noreply@claveon.de` (NUNCA `info@claveon.de` — Zoho lo rechazaría como spoof)
- **Dominio verificado:** `claveon.de` ✅
- **DNS:** SPF ✅ · DKIM1 ✅ · DKIM2 ✅ · DMARC ✅
- **Uso:** solo emails transaccionales salientes (notificación + confirmación)

---

## PWA

- `manifest.webmanifest` — theme `#C1440E`, display standalone
- `sw.js` — Cache-First assets, Network-First HTML, `/api/*` excluido
- `offline.html` — fallback con tel: y WA
- Iconos: 192, 512, apple-touch-icon (180px), maskable

---

## Seguridad

- `public/_headers` — CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- Honeypot en formulario (campo `website` oculto)
- Validación y sanitización completa en `contact.ts`
- TLS 1.3, SSL Full Strict, HSTS preload en CF Zone

---

## SEO

- Schema.org: `LocalBusiness`, `FAQPage`, `OfferCatalog`
- hreflang DE/EN + x-default en `Layout.astro`
- `sitemap.xml` + `robots.txt`
- 0 requests externos → Core Web Vitals optimizados
- Meta OG + Twitter Cards
- areaServed: 8 ciudades Köln

---

## Desarrollo local

```bash
npm run dev      # localhost:4321
npm run build    # genera dist/
npm run preview  # preview estático
```

---

## Roadmap

- **F0–F5** — ✅ COMPLETADO (CSS, copy, responsive, cross-sell)
- **F6** — pendiente decisión:
  - Páginas de barrio (`/koeln/ehrenfeld/` etc.) — hyperlocal SEO
  - Schema `AggregateRating` + reseñas reales de Google
  - Booking directo (cal.com / Calendly)
  - Google Search Console — verificar indexación post-migración DNS
  - Blog long-tail (`Windows 10 läuft aus — was tun?`)

---

## Historial de migraciones importantes

### 2026-03 — Migración email: SimpleLogin + Proton → Zoho Mail

**Antes:** Brevo → `info@claveon.de` (SimpleLogin) → `outyp@proton.me` (Proton)
**Problema:** SimpleLogin bloqueaba envíos FROM `info@claveon.de` via Brevo; sobreescribía Reply-To.
**Solución:** Zoho Mail con dominio propio. MX apuntan a Zoho EU directamente.
**Resultado:** Carlos responde desde Zoho, hilo completo, sin intermediarios.

DNS eliminados: SimpleLogin MX, DKIM SL x3, Amazon SES (Resend), Resend DKIM.
DNS añadidos: Zoho MX x3, DKIM Zoho, SPF actualizado.

---

## Relación con otros proyectos

- **WERIXO** (`werixo.de`) — B2B hermano. ClaveON es top-of-funnel.
- **Credentials CF:** `/Users/rootml/.werixo-cf.env`
