import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base works in Vite preview and in /RonaldoRiska/prato-textile-world/.
  base: './',
  build: { target: 'es2022', outDir: 'dist' },
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
});
