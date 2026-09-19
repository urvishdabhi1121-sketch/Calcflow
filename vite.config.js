import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
  ],
  define: {
    'import.meta.env.VITE_BASE44_APP_ID': JSON.stringify('6aaef4b5d1dd0d215b647eb5'),
    'import.meta.env.VITE_BASE44_APP_BASE_URL': JSON.stringify('https://app.base44.com'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
