import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ffwtool: resolve(__dirname, 'ffwtool/index.html'),
        ffwpwa: resolve(__dirname, 'ffwpwa/index.html')
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
