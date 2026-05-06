import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'non-blocking-entry-css',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            return html.replace(
              /<link rel="stylesheet" crossorigin href="([^"]*\/assets\/index-[^"]+\.css)">/,
              `<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`,
            );
          },
        },
      },
    ],
    test: {
      globals: true,
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            const normalizedId = id.replace(/\\/g, '/');

            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/react-router-dom/')
            ) {
              return 'react-vendor';
            }

            if (normalizedId.includes('/node_modules/lucide-react/')) {
              return 'ui-vendor';
            }

            if (
              normalizedId.includes('/node_modules/react-markdown/') ||
              normalizedId.includes('/node_modules/remark-gfm/') ||
              normalizedId.includes('/node_modules/remark-directive/') ||
              normalizedId.includes('/node_modules/rehype-sanitize/') ||
              normalizedId.includes('/node_modules/unist-util-visit/')
            ) {
              return 'markdown-vendor';
            }
          },
        },
      },
    },
  };
});
