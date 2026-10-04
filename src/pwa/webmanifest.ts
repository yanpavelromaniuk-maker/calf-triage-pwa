import type { ManifestOptions } from 'vite-plugin-pwa';

/**
 * PWA manifest as a plain data object so tests can assert its fields.
 * Icon paths are relative to the manifest URL, which vite-plugin-pwa
 * places at the configured base — correct on GitHub Pages subpaths too.
 */
export const webManifest: Partial<ManifestOptions> & { icons: { src: string; sizes: string; type: string; purpose?: string }[] } = {
  id: 'calf-triage',
  name: 'Calf Triage — Триаж телят КРС',
  short_name: 'Триаж телят',
  description:
    'Офлайн-помощник для первичной оценки состояния теленка КРС до 6 месяцев: уровень срочности обращения к ветеринару и вероятные направления для обсуждения со специалистом. Не является диагнозом.',
  lang: 'ru',
  dir: 'ltr',
  start_url: '.',
  scope: '.',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#F0FDF4',
  theme_color: '#166534',
  categories: ['medical', 'productivity'],
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
