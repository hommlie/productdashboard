import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:4000';
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
