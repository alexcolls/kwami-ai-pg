import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat iconify-icon as a custom element (Web Component)
          isCustomElement: (tag) => tag === 'iconify-icon'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Force Vite to re-bundle kwami-ai when it changes
  optimizeDeps: {
    include: ['kwami-ai'],
    force: true  // Force re-bundling on every server start
  }
})
