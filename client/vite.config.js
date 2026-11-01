import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // When React asks for "/api/...", Vite sends the request to our Express
    // server on port 3001. So in React we can just write axios.get("/api/shelf").
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})