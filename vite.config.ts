/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

/** Chunks that must start downloading with the HTML, not after entry evaluation. */
const CRITICAL_CHUNKS = [
  /^assets\/dashboard\.page-.+\.js$/,
  /^assets\/motion-features-.+\.js$/
];

/**
 * Critical-path optimizer for the production HTML: injects
 * `<link rel="modulepreload">` for the first-route chunk graph, so the
 * dashboard/motion chunks download in parallel with the entry bundle instead
 * of after its evaluation. Runs in `writeBundle` because that is where Vite
 * has already emitted the final `index.html` with hashed asset URLs.
 */
function criticalHtml(): Plugin {
  return {
    name: 'critical-html',
    apply: 'build',
    writeBundle(options, bundle) {
      const outDir = options.dir ?? '.';
      const htmlFile = path.resolve(outDir, 'index.html');
      let html = readFileSync(htmlFile, 'utf8');

      const preloads = new Set<string>();
      for (const fileName of Object.keys(bundle)) {
        if (CRITICAL_CHUNKS.some((pattern) => pattern.test(fileName)))
          preloads.add(fileName);
      }

      const base = process.env.VITE_BASE ?? '/';
      const prefix = base.endsWith('/') ? base : `${base}/`;
      const tags = [...preloads]
        .sort()
        .map((fileName) => `<link rel="modulepreload" href="${prefix}${fileName}" />`)
        .join('');
      html = html.replace('</head>', `${tags}</head>`);

      writeFileSync(htmlFile, html);
    }
  };
}

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    tailwindcss(),
    react(),
    criticalHtml(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Mis Finanzas — Control de Gastos e Ingresos',
        short_name: 'Mis Finanzas',
        description:
          'App local-first para registrar ingresos y gastos en ARS y USD con privacidad total.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.VITE_BASE ?? '/',
        start_url: process.env.VITE_BASE ?? '/',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  }
});
