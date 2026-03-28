/**
 * Genera el OG image (1200×630) para ClaveON.
 * Uso: node scripts/generate-og.mjs
 * Requiere: sharp (ya instalado)
 */
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#F9F7F5"/>

  <!-- Terra accent bar (left) -->
  <rect x="80" y="220" width="6" height="160" rx="3" fill="#C1440E"/>

  <!-- Brand name -->
  <text x="114" y="330"
        font-family="'Courier New', Courier, monospace"
        font-weight="700"
        font-size="112"
        letter-spacing="-2"
        fill="#1A1A1A">Clave<tspan fill="#C1440E">ON</tspan></text>

  <!-- Tagline -->
  <text x="114" y="400"
        font-family="'Courier New', Courier, monospace"
        font-size="36"
        fill="#6B7280">Technikhilfe Ko\u0308ln</text>

  <!-- Separator line -->
  <rect x="114" y="450" width="480" height="2" fill="#E5E7EB"/>

  <!-- Services row -->
  <text x="114" y="500"
        font-family="'Courier New', Courier, monospace"
        font-size="22"
        fill="#9CA3AF">PC · WLAN · Smartphone · Drucker · TV</text>

  <!-- URL badge (bottom right) -->
  <rect x="960" y="548" width="160" height="44" rx="4" fill="#C1440E"/>
  <text x="1040" y="576"
        font-family="'Courier New', Courier, monospace"
        font-weight="700"
        font-size="22"
        text-anchor="middle"
        fill="#FFFFFF">claveon.de</text>
</svg>`;

const outPath = resolve(root, 'public/assets/og-image.jpg');

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(outPath);

console.log(`✓ og-image.jpg (1200×630) → ${outPath}`);
