import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` path alias in tsconfig.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    // Tests must never live under src/pages: every file there becomes a Next.js route.
    include: ['src/**/*.test.ts'],
    exclude: ['src/pages/**', 'node_modules/**'],
    restoreMocks: true,
    unstubEnvs: true,
  },
});
