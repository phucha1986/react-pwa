import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

import manifest from './manifest.json';
import archifyPlugin from './scripts/vite-plugin-archify.mjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    archifyPlugin(),
    react(),
    VitePWA({
      manifest,
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      // switch to "true" to enable sw on development
      devOptions: { enabled: false },
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html}', '**/*.{svg,png,jpg,gif}', '**/*.mp3'] },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    // Playwright writes its report/test-results into the repo while `npm run dev`
    // is running (playwright.config reuses the dev server), and the watcher can
    // hit EBUSY on those locked files.
    watch: { ignored: ['**/playwright-report/**', '**/test-results/**', '**/tmp-*'] },
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
