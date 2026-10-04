/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';
import { webManifest } from './src/pwa/webmanifest';
import { resolveBase } from './src/pwa/basePath';

/**
 * Base path logic lives in src/pwa/basePath.ts (shared with tests).

/** Emits a 404.html that redirects visitors of stale deep links to the app root. */
function ghPages404(base: string): Plugin {
  const source = [
    '<!doctype html>',
    '<html lang="ru">',
    '<head>',
    '<meta charset="utf-8" />',
    '<title>Calf Triage — перенаправление</title>',
    '<script>',
    `location.replace(${JSON.stringify(base)});`,
    '</script>',
    `<meta http-equiv="refresh" content="1; url=${base}" />`,
    '</head>',
    '<body><p>Открываем приложение… <a href="' + base + '">Перейти вручную</a></p></body>',
    '</html>',
  ].join('\n');
  return {
    name: 'gh-pages-404-redirect',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '404.html', source });
    },
  };
}

export default defineConfig(({ mode }) => {
  const base = resolveBase();
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
        manifest: webManifest,
        workbox: {
          // Precache the whole app shell + knowledge base; the app is fully offline.
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/^\/404\.html$/],
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
      }),
      ghPages404(base),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(mode === 'test' ? 'test' : process.env.npm_package_version ?? '0.0.0'),
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
