import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ffwtool: resolve(__dirname, 'ffwtool/index.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('primevue') || id.includes('@primeuix')) {
            return 'vendor-primevue';
          }
          if (id.includes('zod') || id.includes('cal-parser')) {
            return 'vendor-utils';
          }
          if (id.includes('node_modules')) {
            return 'vendor-others';
          }
        }
      }
    }
  }
})
