import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, {resolve} from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@extension': path.resolve(__dirname, '../extension'),
      '@client': path.resolve(__dirname, '../client'),
      '@map': path.resolve(__dirname, '../map')
    },
  },
  base: ".",
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        search: resolve('embedded.html')
      }
    }
  }
})
