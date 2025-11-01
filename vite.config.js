import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Vercel dev server (nếu chạy vercel dev)
        changeOrigin: true,
        secure: false,
        // Fallback nếu không có vercel dev server
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('Vercel dev server not running. Using development fallback mode.');
          });
        }
      }
    }
  }
})
