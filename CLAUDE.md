# ClaveON — CLAUDE.md

## Proyecto

Sitio web de marketing y contacto para **ClaveON**, servicio de ayuda técnica para
particulares en Colonia (Köln), Alemania. B2C puro — sin panel de admin, sin base de
datos, sin autenticación.

**Técnico:** Carlos (no Martin — nombre anterior, no usar)

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

---

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

---

## Stack

- **Astro 5** + **Tailwind CSS v4** (`@tailwindcss/vite`)
- Sin frameworks JS de UI — todo HTML estático generado en build
- **CF Pages Functions** (`/functions/`) para serverless en TypeScript
- **Brevo** para envío de emails transaccionales (`BREVO_API_KEY`)
- **SimpleLogin** para alias `info@claveon.de` → `outyp@proton.me`
- **i18n**: DE (default, sin prefijo) + EN (`/en/`)
- Sin dependencias JS de terceros en el cliente — todo vanilla script inline

---

## Estructura

```
src/
  layouts/
    Layout.astro          # HTML base, meta/SEO/OG, WA FAB, skip nav, scroll reveal, SW registro
  pages/
    index.astro           # Homepage DE
    impressum.astro       # Impressum DE (§19 UStG Kleinunternehmer)
    datenschutz.astro     # Datenschutz DE (DSGVO completo, Art.15-21)
    claveon/
      reply.astro         # Panel de respuesta interno — protegido con contraseña
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
    UeberMartin.astro     # Sobre el técnico (renombrar a UeberCarlos cuando se actualice)
    Kontakt.astro         # Formulario → POST /api/contact | toggle Privat/Unternehmen → WERIXO
    WerixoBridge.astro    # Sección cross-sell dedicada → werixo.de (B2B)
    Windows10.astro       # CTA específico migración W10→11
    Footer.astro          # Links legales, contacto, copyright
  styles/
    global.css            # Fuentes self-hosted, tokens CSS, utilidades
functions/
  api/
    contact.ts            # POST /api/contact — valida form, crea SL reverse alias, envía emails
    whatsapp.ts           # GET /api/whatsapp — redirect WA con WHATSAPP_NUMBER
  claveon/
    reply.ts              # POST /claveon/reply — panel interno para responder clientes con HTML
public/
  fonts/                  # IBM Plex Mono + IBM Plex Sans self-hosted (0 req externos)
  assets/                 # imágenes
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

---

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

**Fuentes self-hosted** (sin Google Fonts, 0 requests externos en el sitio web):
- `IBM Plex Mono` (400, 600, 700) — monoespaciada, usada en labels, precios, código, **logo**
- `IBM Plex Sans` (400–700 variable) — sans-serif, usada en cuerpo

**Logo:** `Clave` en `--text` (negro) + `ON` en `--terra` (#C1440E), font IBM Plex Mono 700.
En emails HTML: `Clave` blanco + `ON` crema `#fde8df` sobre header terracota `#C1440E`.
En emails se carga IBM Plex Mono via Google Fonts `@import` (fallback: `'Courier New'`).

**Estética:** minimalista, editorial, blanco/negro + terra. Sin sombras decorativas,
sin gradientes. Tipografía grande y bold. Estilo alemán/suizo.

---

## Negocio — Datos clave

**Contacto público:**
- Email: `info@claveon.de` (SimpleLogin alias → outyp@proton.me)
- WhatsApp: número en env var `WHATSAPP_NUMBER` (CF Pages secret)
- WA redirect: `/api/whatsapp` → CF Pages Function

**Técnico:** Carlos (idiomas: DE, ES, EN)
**Idiomas del sitio:** DE (principal) + EN (`/en/`)

**Área de servicio:** Köln (todos los barrios) + 15 km alrededor.
Cities en schema: Köln, Hürth, Frechen, Pulheim, Leverkusen, Bergisch Gladbach, Dormagen, Brühl.

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

---

## Sistema de Email — Arquitectura completa

### DNS de claveon.de (crítico)

| Registro | Tipo | Valor |
|---|---|---|
| MX | → SimpleLogin | Todo `@claveon.de` entra por SimpleLogin |
| SPF | TXT | `v=spf1 include:simplelogin.co include:spf.brevo.com ~all` |
| DKIM 1 | CNAME | `brevo1._domainkey` → `b1.claveon-de.dkim.brevo.com` |
| DKIM 2 | CNAME | Verificado en Brevo |
| DMARC | TXT | `v=DMARC1; p=quarantine; pct=100; adkim=r; aspf=r` |

**⚠️ IMPORTANTE — Regla SimpleLogin:**
SimpleLogin solo permite enviar FROM un alias (`info@claveon.de`) desde su buzón autorizado (`outyp@proton.me`). Si Brevo intenta enviar FROM `info@claveon.de`, SimpleLogin lo bloquea como spoofing.

**Solución aplicada:** Todos los emails salientes de Brevo usan `noreply@claveon.de` como sender. `info@claveon.de` solo se usa en `replyTo`.

### Flujo 1 — Formulario de contacto entrante

```
Cliente → POST /api/contact
  ↓
contact.ts:
  1. Valida campos (nombre ≥2, email RFC, mensaje 10-2000 chars)
  2. Llama SimpleLogin API → crea reverse alias para el email del cliente
     GET /api/v2/aliases?query=info@claveon.de → obtiene alias ID
     POST /api/aliases/{id}/contacts → { contact: "Nombre <email@cliente>" }
     → obtiene reverse_alias_address (ej: cliente_at_gmail_com_xyz@simplelogin.io)
  3. Brevo envía NOTIFICACIÓN a Carlos:
     From: noreply@claveon.de
     To: outyp@proton.me  ← DIRECTO, no pasa por SimpleLogin
     Reply-To: reverse_alias (o email directo del cliente como fallback)
     Botón "Antworten": enlace a /claveon/reply?to={email_directo}&name=...&msg=...
  4. Brevo envía AUTO-CONFIRMACIÓN al cliente:
     From: noreply@claveon.de
     To: email_del_cliente
     Reply-To: info@claveon.de
     HTML: "Vielen Dank, wir melden uns innerhalb von 24 Stunden"
```

**⚠️ Por qué `To: outyp@proton.me` y no `To: info@claveon.de`:**
Si se envía a `info@claveon.de`, SimpleLogin intercepta y crea un reverse alias para `noreply@claveon.de` (el sender de Brevo). Esto sobreescribe el Reply-To en el forward a Proton, causando que Carlos responda al reverse alias de `noreply` en lugar del del cliente. Solución: enviar directo al buzón real `outyp@proton.me`.

### Flujo 2 — Carlos responde al cliente (panel /claveon/reply)

```
Carlos recibe notificación en Proton
  ↓
Hace clic en "Antworten an {nombre}"
  ↓
Abre claveon.de/claveon/reply?to={email_cliente}&name={nombre}&subject=...&msg={mensaje_original}
  ↓
Panel pre-relleno con datos del cliente + mensaje original
Carlos escribe la respuesta + introduce contraseña
  ↓
POST /claveon/reply:
  - Valida REPLY_PASSWORD
  - Brevo envía:
    From: noreply@claveon.de
    To: email_directo_del_cliente  ← NO reverse alias (Brevo no puede usar SL reverse aliases)
    Reply-To: info@claveon.de
    HTML: template branded ClaveON con firma "Mit freundlichen Grüßen / ClaveON"
  ↓
Cliente recibe email HTML branded ✅
Si cliente responde → va a info@claveon.de → SimpleLogin → outyp@proton.me ✅
```

**⚠️ Por qué el `to` del panel es el email directo y NO el reverse alias:**
SimpleLogin solo permite usar reverse aliases enviando DESDE `outyp@proton.me`. Brevo envía desde `noreply@claveon.de` → SimpleLogin lo bloquea. El panel usa el email directo del cliente.

### Template HTML de emails

Todos los emails (notificación, confirmación, reply) comparten el mismo diseño:
- Header `<td bgcolor="#C1440E">` terracota (bgcolor para compatibilidad Gmail)
- Logo: `<span color=#fff>Clave</span><span color=#fde8df>ON</span>` IBM Plex Mono 700
- Google Fonts `@import` en `<head>` para IBM Plex Mono (fallback: Courier New)
- Body blanco, tipografía `Helvetica Neue, Arial`
- Accent terracota en bordes izquierdos, CTAs y firma
- Footer gris con `claveon.de · info@claveon.de`

---

## Backend — CF Pages Functions

### `functions/api/contact.ts`

```typescript
interface Env {
  BREVO_API_KEY: string;
  SIMPLELOGIN_API_KEY?: string;
  NOTIFICATION_EMAIL: string;  // outyp@proton.me — destino directo de la notificación
}
```

- `POST /api/contact`
- Body: `{ name, email, phone?, paket?, message, website? }`
- `website` es honeypot — si viene relleno, retorna 200 silenciosamente
- Validaciones: nombre 2–100, email RFC ≤254, teléfono ≤30, mensaje 10–2000, pakete whitelist
- Crea reverse alias de SimpleLogin para el cliente (fallback: usa email directo)
- Envía 2 emails via Brevo:
  1. Notificación a Carlos (`NOTIFICATION_EMAIL`)
  2. Auto-confirmación al cliente

### `functions/claveon/reply.ts`

```typescript
interface Env {
  BREVO_API_KEY: string;
  REPLY_PASSWORD: string;
}
```

- `POST /claveon/reply`
- Body: `{ password, to, name, subject?, message }`
- Valida `REPLY_PASSWORD`
- Envía email HTML branded al cliente via Brevo
- Sender: `noreply@claveon.de`, Reply-To: `info@claveon.de`

### `functions/api/whatsapp.ts`

- Redirect al número de WA
- Env var: `WHATSAPP_NUMBER`

---

## Panel de respuesta interno — `/claveon/reply`

**URL:** `https://claveon.de/claveon/reply`
**Protección:** contraseña (REPLY_PASSWORD en CF Pages secrets)
**Acceso típico:** desde el botón "Antworten" en la notificación de Proton

**Parámetros URL:**
| Param | Descripción |
|---|---|
| `to` | Email directo del cliente |
| `name` | Nombre del cliente |
| `subject` | Asunto pre-relleno (opcional) |
| `msg` | Mensaje original del cliente (opcional, para contexto) |

**Para responder a un cliente manualmente:**
```
https://claveon.de/claveon/reply?to=EMAIL&name=NOMBRE&subject=Re%3A%20Ihre%20Anfrage%20bei%20ClaveON
```

---

## Variables de entorno (CF Pages Secrets)

| Var | Descripción |
|---|---|
| `BREVO_API_KEY` | API key Brevo para envío transaccional |
| `SIMPLELOGIN_API_KEY` | API key SimpleLogin para crear reverse aliases |
| `NOTIFICATION_EMAIL` | `outyp@proton.me` — recibe notificaciones de formulario |
| `REPLY_PASSWORD` | Contraseña del panel `/claveon/reply` |
| `WHATSAPP_NUMBER` | Número WA formato internacional sin `+` |

---

## SimpleLogin — Configuración

- **Alias:** `info@claveon.de` → `outyp@proton.me` (Proton Mail)
- **Auto-create contacts:** activo (crea reverse alias automáticamente por sender)
- **Contacto `noreply@claveon.de`:** puede aparecer y eliminarse — es inofensivo
- **Buzón autorizado para enviar:** solo `outyp@proton.me`

**Reverse alias para responder clientes:**
- Creado por API en `contact.ts` al recibir cada formulario
- Permite a Carlos responder desde Proton y que el cliente reciba desde `info@claveon.de`
- El panel `/claveon/reply` NO usa reverse aliases (Brevo no tiene permiso)

---

## Brevo — Configuración

- **Cuenta:** ClaveON
- **Dominio verificado:** `claveon.de` (Authentifiziert ✅)
- **Sender usado:** `noreply@claveon.de` (NUNCA `info@claveon.de` — SimpleLogin lo bloquea)
- **DNS:** SPF ✅, DKIM1 ✅, DKIM2 ✅, DMARC ✅

---

## PWA

- `public/manifest.webmanifest` — name, short_name, display: standalone, theme: #C1440E
- `public/sw.js` — Cache-First para assets, Network-First para HTML, /api/* excluido
- `public/offline.html` — fallback offline con tel: y WA links
- Iconos: icon-192, icon-512, apple-touch-icon (180px), maskable-192/512
- Generación: `node scripts/generate-icons.mjs` (requiere sharp)

---

## Seguridad

- `public/_headers` — CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- Honeypot en formulario (campo `website` oculto)
- Validación y sanitización completa en `contact.ts`
- Panel `/claveon/reply` protegido por contraseña (REPLY_PASSWORD)
- `noindex, nofollow` en `reply.astro`

---

## SEO

- Schema.org: `LocalBusiness`, `FAQPage`, `OfferCatalog` en `index.astro`
- hreflang DE/EN + x-default en `Layout.astro`
- `sitemap.xml` y `robots.txt` en `/public`
- Fuentes self-hosted → 0 requests externos → Core Web Vitals optimizados
- Meta OG + Twitter Cards completos
- Canonical URLs configurados
- areaServed: 8 ciudades alrededor de Köln

---

## Desarrollo local

```bash
npm run dev      # localhost:4321
npm run build    # genera dist/
npm run preview  # preview del build estático
```

**Deploy:** `git push origin main` → CF Pages hace build automático (~1 min).

---

## Problemas conocidos y soluciones aplicadas

### SimpleLogin bloquea envíos FROM info@claveon.de
**Causa:** SimpleLogin detecta que Brevo (envelope from: `bounces-xxx@ha.d.sender-sib.com`) intenta enviar FROM el alias `info@claveon.de` sin ser el buzón autorizado (`outyp@proton.me`).
**Solución:** Todos los senders de Brevo usan `noreply@claveon.de`. `info@claveon.de` solo aparece en `replyTo`.

### SimpleLogin sobreescribe Reply-To en el forward
**Causa:** Cuando el form enviaba notificación a `info@claveon.de`, SimpleLogin auto-creaba un reverse alias para el sender de Brevo (`noreply@claveon.de`) y lo ponía como Reply-To en el forward a Proton, en lugar del reverse alias del cliente.
**Solución:** La notificación va directamente a `outyp@proton.me` (NOTIFICATION_EMAIL), saltando SimpleLogin por completo en esa dirección.

### Panel /claveon/reply no puede usar reverse aliases de SimpleLogin
**Causa:** Los reverse aliases solo pueden usarse enviando FROM `outyp@proton.me`. Brevo envía FROM `noreply@claveon.de` → SimpleLogin lo bloquea.
**Solución:** El panel envía al email directo del cliente. La URL del botón "Antworten" usa `safeEmail` (email real), no el reverse alias.

### bgcolor en Gmail
**Causa:** Gmail ignora `background-color` CSS en `<td>`.
**Solución:** Usar atributo HTML `bgcolor="#C1440E"` además del CSS style.

---

## Relación con otros proyectos

- **WERIXO** (`werixo.de`) — producto B2B hermano. ClaveON actúa como top-of-funnel:
  - `WerixoBridge.astro` — sección cross-sell entre form y footer
  - Toggle "Unternehmen" en el form → oculta form, muestra CTA a werixo.de
  - Pakete.astro → si selecciona empresa → redirect a werixo.de

---

## Roadmap pendiente

Ver `ROADMAP.md` para lista completa. Fases pendientes:
- **F0** CSS foundation (clamp, breakpoints)
- **F1** Copy hero/trustbar
- **F2** Responsive NavBar/Kontakt
- **F3–F5** Copy servicios, UeberCarlos (renombrar desde UeberMartin), footer
- **F6** Páginas de barrio, reseñas, Calendly, GSC
