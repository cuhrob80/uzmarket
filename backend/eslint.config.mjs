import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] }, eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.ts'], languageOptions: { globals: { ...globals.node, ...globals.jest } } },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    files: ['test/health.e2e-spec.ts'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
