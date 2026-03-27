/**
 * Genera los PNG icons necesarios para PWA a partir del favicon SVG.
 * Uso: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// SVG base — rect naranja + texto "ON"
const svgBase = readFileSync(resolve(root, 'public/favicon.svg'));

// SVG maskable: mismo diseño pero con padding del 10% (safe zone spec)
const svgMaskable = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" fill="#C1440E"/>
  <rect x="4" y="4" width="32" height="32" rx="5" fill="#C1440E"/>
  <text x="20" y="27" text-anchor="middle"
        font-family="'Courier New', monospace"
        font-weight="900"
        font-size="14"
        letter-spacing="-0.5"
        fill="#ffffff">ON</text>
</svg>`);

const icons = [
  // Standard icons
  { src: svgBase,      out: 'public/icons/icon-192.png',          size: 192 },
  { src: svgBase,      out: 'public/icons/icon-512.png',          size: 512 },
  // Apple Touch Icon (iOS home screen)
  { src: svgBase,      out: 'public/icons/apple-touch-icon.png',  size: 180 },
  // Maskable icons (Android adaptive icons)
  { src: svgMaskable,  out: 'public/icons/icon-maskable-192.png', size: 192 },
  { src: svgMaskable,  out: 'public/icons/icon-maskable-512.png', size: 512 },
];

mkdirSync(resolve(root, 'public/icons'), { recursive: true });

for (const { src, out, size } of icons) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(resolve(root, out));
  console.log(`✓ ${out} (${size}x${size})`);
}

console.log('\nDone. Icons in public/icons/');
