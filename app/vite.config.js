import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '/static/', // Match FastAPI's static route
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, '../app/static'),
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/upload-file': 'http://localhost:8000',
      '/execute-query': 'http://localhost:8000',
      '/get-schema': 'http://localhost:8000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});