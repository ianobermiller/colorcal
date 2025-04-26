import preact from '@preact/preset-vite';
// @ts-expect-error module not found
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    tailwindcss(),
  ],
});
