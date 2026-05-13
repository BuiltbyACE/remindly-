// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * ESLint Configuration
 * Zero-tolerance policy with strict rules
 */

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      
      // Angular rules
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/no-forward-ref': 'error',
      '@angular-eslint/no-host-metadata-property': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/no-queries-metadata-property': 'error',
      '@angular-eslint/use-component-view-encapsulation': 'warn',
      
      // Best practices
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Accessibility rules
      '@angular-eslint/template/accessibility-alt-text': 'error',
      '@angular-eslint/template/accessibility-elements-content': 'error',
      '@angular-eslint/template/accessibility-label-has-associated-control': 'error',
      '@angular-eslint/template/accessibility-table-scope': 'error',
      '@angular-eslint/template/accessibility-valid-aria': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
      
      // Template best practices
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/no-interpolation-in-attributes': 'warn',
    },
  },
  {
    // Ignore patterns
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      '.angular/',
      '*.config.js',
      '*.config.ts',
      'playwright.config.ts',
      'vitest.config.ts',
    ],
  }
);
