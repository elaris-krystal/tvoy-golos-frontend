import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Твой Голос',
        short_name: 'Твой Голос',
        description: 'Инструмент для составления обращений в государственные органы на основе законодательства РФ',
        start_url: '/',
        display: 'standalone',
        background_color: '#F5F4F0',
        theme_color: '#1A1917',
        lang: 'ru',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // API-запросы НЕ кэшируем агрессивно — обращения/льготы должны быть актуальными,
        // а не отдаваться из устаревшего офлайн-кэша молча. Кэшируем только статику приложения
        // (JS/CSS/HTML), чтобы сам интерфейс открывался офлайн.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  build: { outDir: 'dist' },
});
