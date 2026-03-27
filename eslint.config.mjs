import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {},
    rules: {
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'scripts/**']
  }
];
