import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: '.',
  base: '/burlyhab/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        asteroid: resolve(__dirname, 'asteroid.html'),
        editor: resolve(__dirname, 'asteroid_editor.html'),
        publications: resolve(__dirname, 'publications.html'),
      },
    },
    minify: 'terser',
    sourcemap: true,
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({ preset: 'default' }),
      ],
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
});
