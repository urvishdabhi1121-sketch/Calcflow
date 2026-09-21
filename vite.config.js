import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',

  plugins: [react()],

  define: {
    'import.meta.env.VITE_BASE44_APP_ID': JSON.stringify('6aaef4b5d1dd0d215b647eb5'),
    'import.meta.env.VITE_BASE44_APP_BASE_URL': JSON.stringify('https://app.base44.com'),
  },

  resolve: {
    alias: {
      '@': `${rootDir}src`,
    },
  },
});