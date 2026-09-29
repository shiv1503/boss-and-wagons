import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel serves from the domain root, so it needs absolute asset paths.
// GitHub Pages / other subpath hosts keep relative paths.
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : './',
})
