import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Built output is committed to ../vr-hospital so the site deploys straight from
// the branch (this repo uses GitHub Pages "deploy from branch", not Actions).
// A relative base keeps the bundle working at any path it is served from.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../vr-hospital',
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
})
