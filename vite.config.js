import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT) || 3000,
    open: true,
    proxy: {
      '/api': {
        // Use environment variable for proxy target
        // In development: Set VITE_API_PROXY to your backend URL
        // Note: Proxy chỉ hoạt động trong development mode
        // Trong production, frontend sẽ gọi API trực tiếp qua VITE_API_URL
        // Default fallback for development: localhost:5000
        target: process.env.VITE_API_PROXY || 
                (process.env.VITE_API_URL && !process.env.VITE_API_URL.startsWith('/') && process.env.VITE_API_URL.replace('/api', '')) || 
                'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
})
