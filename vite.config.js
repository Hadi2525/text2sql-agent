import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output build files directly to FastAPI static directory
    outDir: resolve(__dirname, '../app/static'),
    emptyOutDir: true, // Clear the output directory before building
    assetsDir: 'assets', // Put assets in a subdirectory
  },
  server: {
    proxy: {
      '/upload-file': 'http://localhost:8000',
      '/execute-query': 'http://localhost:8000',
      '/get-schema': 'http://localhost:8000'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
})