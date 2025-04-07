import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

console.log("🧪 Vite is building with env:", process.env.VITE_BACKEND_URL);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: [/__test__/],
    },
  },
});
