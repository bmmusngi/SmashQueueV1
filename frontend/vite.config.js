import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows accessing the dev server from other devices on the network
    port: 5173
  }
})
