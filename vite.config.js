import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: 'https://smart-store.devamer.online',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})