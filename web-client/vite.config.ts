import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        react(), 
        tsconfigPaths()
    ],
    base: "./",
    build: {
        minify: false,
        sourcemap: true,
        rollupOptions: {
            input: {
                plugin: resolve('src/plugin.ts'),
                client: resolve('index.html'),
            }
        }
    }
})
