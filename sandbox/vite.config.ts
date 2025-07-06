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
                sandbox: resolve('src/sandbox.ts'),
                plugin: resolve('src/client/plugin.ts'),
                main: resolve('index.html'),
                client: resolve('client.html'),
                embedded: resolve('embedded.html')
            }
        }
    }
})
