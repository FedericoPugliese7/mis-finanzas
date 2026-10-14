/**
 * Generador de íconos PWA a partir de public/favicon.svg.
 *
 * Usa `sharp` para rasterizar el SVG a los tamaños necesarios, incluyendo
 * la variante maskable con zona segura del 60 %. Ejecutar con:
 *
 *   npm run icons
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const SVG_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'favicon.svg'
);

const BACKGROUND = { r: 12, g: 12, b: 10, alpha: 1 };

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const svgBuffer = readFileSync(SVG_PATH);

  const targets = [
    { name: 'pwa-192x192.png', size: 192, maskable: false },
    { name: 'pwa-512x512.png', size: 512, maskable: false },
    { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png', size: 180, maskable: false }
  ];

  for (const { name, size, maskable } of targets) {
    const outPath = resolve(OUT_DIR, name);

    if (maskable) {
      const iconSize = Math.round(size * 0.6);
      const iconPng = await sharp(svgBuffer)
        .resize(iconSize, iconSize, { fit: 'contain', background: BACKGROUND })
        .png()
        .toBuffer();

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: BACKGROUND
        }
      })
        .composite([{ input: iconPng, gravity: 'center' }])
        .png()
        .toFile(outPath);
    } else {
      await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
    }

    const stats = (await sharp(outPath).metadata()) ?? {};
    const kb = ((stats.size ?? 0) / 1024).toFixed(1);
    console.log(`✓ ${name} (${size}x${size}, ${kb} kB)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
