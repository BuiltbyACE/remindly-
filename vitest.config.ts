/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { getTestBedConfig } from '@angular/core/testing';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mocks/**',
        '**/*.mock.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@app': './src/app',
      '@core': './src/app/core',
      '@shared': './src/app/shared',
      '@events': './src/app/events',
      '@approvals': './src/app/approvals',
      '@notifications': './src/app/notifications',
      '@reminders': './src/app/reminders',
      '@ai': './src/app/ai',
      '@voice': './src/app/voice',
      '@integrations': './src/app/integrations',
      '@audit': './src/app/audit',
      '@analytics': './src/app/analytics',
      '@settings': './src/app/settings',
    },
  },
});
