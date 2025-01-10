import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use Node's 'path' & 'url' in ES modules:
import * as path from 'path';
import { fileURLToPath } from 'url';

// Shim for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  server: {
    open: '/public/index.html',
    proxy: {
      '/app': {
        target: 'http://localhost:5173/public',
        rewrite: (pathString) => pathString.replace(/^\/app/, ''),
        secure: false,
      },
    },
  },

  build: {
    rollupOptions: {
      input: {
        website: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'public/index.html'),
        support: path.resolve(__dirname, 'public/support.html'),
        privacy: path.resolve(__dirname, 'public/privacy.html'),
        terms: path.resolve(__dirname, 'public/terms.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },

  esbuild: {
    logOverride: { 'module level directives cause errors': 'silent' },
  },

  publicDir: 'public',
});