// @ts-expect-error module not found
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        solidPlugin(),
        Icons({ autoInstall: true, compiler: 'solid' }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        tailwindcss(),
        visualizer({ gzipSize: true }),
    ],
});
