import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    // The date of the build, for WebSite.dateModified on the home page
    // (pages/Home.tsx). Without it the page used the visitor's date.
    define: {
      'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      // React Compiler in annotation mode: only files/functions that opt in
      // with a `'use memo'` directive are compiled. This keeps the rollout
      // incremental — un-annotated files behave exactly as before. To compile
      // the whole app later, drop compilationMode. (Audit NOV-10: since
      // @vitejs/plugin-react 6 the compiler runs through this Babel plugin;
      // the `babel` option of react() is gone.)
      babel({ presets: [reactCompilerPreset({ compilationMode: 'annotation' })] }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // PERF-3: pin a modern baseline so Vite/esbuild stop emitting legacy
      // down-levelling for syntax all supported browsers already handle,
      // shaving a little output size. (Default is a broad 'modules' target.)
      target: 'es2022',
      rolldownOptions: {
        output: {
          // Two shared chunks beside the pages' own: React with the router,
          // which every page needs, and the markdown renderer, which only an
          // article needs. Audit NOV-10: written as rolldown's groups, not as
          // a manualChunks function. A group takes in what its modules import
          // as well, so with the old function the markdown chunk (through
          // react-markdown) swallowed React itself, and every page then had
          // to download the markdown renderer to start. The higher priority
          // gives React and the router to react-vendor first.
          // scripts/check-chunks.ts fails the build if that ever recurs.
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|cookie|set-cookie-parser)[\\/]/,
                priority: 20,
              },
              {
                name: 'markdown-vendor',
                test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|remark-directive|rehype-sanitize|unist-util-visit)[\\/]/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
  };
});
