import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from 'fs';

export default defineConfig({
    plugins: [
        react(), 
        tsconfigPaths(),
        // Custom plugin to copy data files to dist directory
        {
            name: 'copy-data-files',
            buildEnd() {
                // Create data directory in dist if it doesn't exist
                if (!fs.existsSync('dist/data')) {
                    fs.mkdirSync('dist/data', { recursive: true });
                }

                // Copy mapExport.json
                fs.copyFileSync(
                    resolve(__dirname, '../data/mapExport.json'),
                    resolve(__dirname, 'dist/data/mapExport.json')
                );

                // Copy colors.json
                fs.copyFileSync(
                    resolve(__dirname, '../data/colors.json'),
                    resolve(__dirname, 'dist/data/colors.json')
                );

                console.log('Data files copied to dist/data directory');
            }
        }
    ],
    base: "./",
    build: {
        minify: true,
        rollupOptions: {
            input: {
                embedded: resolve('embedded.html'),
                client: resolve('client.html')
            }
        }
    }
})
