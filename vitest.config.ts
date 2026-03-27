import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['dist/**', 'src/index.ts', 'src/server/**', 'src/github/client.ts', '**/*.d.ts', '**/*.config.*', 'eslint.config.mjs', 'vitest.config.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 75,
        statements: 85
      }
    }
  }
});
