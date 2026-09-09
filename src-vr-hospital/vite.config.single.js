import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build for the standalone single-file bundle. Everything lands in one chunk
// because there is nowhere to fetch a second one from once the page is a single
// HTML file; `npm run build:single` then inlines that chunk, the CSS and every
// image into the markup.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../.single-build',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
