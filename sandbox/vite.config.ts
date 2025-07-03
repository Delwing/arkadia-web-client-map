import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    base: "./",
    build: {
        minify: false,
        rollupOptions: {
            input: {
                embedded: resolve('embedded.html'),
                client: resolve('client.html')
            }
        }
    }
})
