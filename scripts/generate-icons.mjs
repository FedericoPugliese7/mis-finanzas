/**
 * Generador de íconos PWA placeholder sin dependencias externas.
 *
 * Escribe PNGs (RGBA) directly usando solo `node:zlib`, para no depender de
 * `sharp` ni de herramientas de sistema. Ejecutar con:
 *
 *   npm run icons
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const PALETTE = {
  background: [79, 70, 229, 255], // indigo-600
  barLow: [165, 180, 252, 255],
  barMid: [199, 210, 254, 255],
  barHigh: [255, 255, 255, 255],
  baseline: [255, 255, 255, 230],
  transparent: [0, 0, 0, 0]
};

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(width, height, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function createCanvas(size) {
  const pixels = Buffer.alloc(size * size * 4, 0);
  return {
    size,
    pixels,
    set(x, y, [r, g, b, a]) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const i = (y * size + x) * 4;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = a;
    },
    fillRect(x0, y0, w, h, color, radius = 0) {
      for (let y = y0; y < y0 + h; y += 1) {
        for (let x = x0; x < x0 + w; x += 1) {
          if (radius > 0 && !insideRoundedRect(x, y, x0, y0, w, h, radius)) continue;
          this.set(x, y, color);
        }
      }
    }
  };
}

function insideRoundedRect(px, py, x0, y0, w, h, radius) {
  const x1 = x0 + w - 1;
  const y1 = y0 + h - 1;
  const cx = Math.min(Math.max(px, x0 + radius), x1 - radius);
  const cy = Math.min(Math.max(py, y0 + radius), y1 - radius);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function drawIcon(size, { maskable = false } = {}) {
  const canvas = createCanvas(size);
  const full = maskable;
  const cornerRadius = full ? 0 : Math.round(size * 0.22);
  const margin = full ? 0 : Math.round(size * 0.06);

  canvas.fillRect(
    margin,
    margin,
    size - margin * 2,
    size - margin * 2,
    PALETTE.background,
    cornerRadius
  );

  // Motivo: tres barras ascendentes + línea base (gráfico de ingresos/gastos)
  const area = full ? 0.6 : 0.72; // zona segura del ícono maskable
  const inner = size * area;
  const offset = Math.round((size - inner) / 2);
  const barWidth = Math.round(inner * 0.18);
  const gap = Math.round(inner * 0.08);
  const heights = [0.3, 0.5, 0.72];
  const colors = [PALETTE.barLow, PALETTE.barMid, PALETTE.barHigh];
  const baseY = offset + inner * 0.78;
  const barRadius = Math.round(barWidth / 2.6);

  heights.forEach((ratio, index) => {
    const height = Math.round(inner * ratio);
    const x = offset + index * (barWidth + gap) + Math.round(gap / 2);
    canvas.fillRect(x, baseY - height, barWidth, height, colors[index], barRadius);
  });

  const baselineWidth = heights.length * barWidth + (heights.length - 1) * gap + gap;
  canvas.fillRect(
    offset + Math.round(gap / 2),
    baseY + Math.round(inner * 0.06),
    baselineWidth,
    Math.max(2, Math.round(inner * 0.035)),
    PALETTE.baseline,
    barRadius
  );

  return encodePng(size, size, canvas.pixels);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const targets = [
    ['pwa-192x192.png', 192, {}],
    ['pwa-512x512.png', 512, {}],
    ['pwa-maskable-512x512.png', 512, { maskable: true }],
    ['apple-touch-icon.png', 180, {}]
  ];

  for (const [name, size, options] of targets) {
    const png = drawIcon(size, options);
    writeFileSync(resolve(OUT_DIR, name), png);
    console.log(`✓ ${name} (${size}x${size}, ${(png.length / 1024).toFixed(1)} kB)`);
  }
}

main();
