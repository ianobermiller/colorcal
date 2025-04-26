import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist'] },
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: 'detect' } },
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  perfectionist.configs['recommended-alphabetical'],
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      // Disallows one-line arrow functions that return void
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // Disallows passing an async function to an event handler
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Annoying when destructuring props with handlers
      '@typescript-eslint/unbound-method': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    // only js and mjs files
    files: ['*.js', '*.mjs', 'instant.perms.ts', 'instant.schema.ts'],
    languageOptions: { globals: globals.node },
    ...tseslint.configs.disableTypeChecked,
  },
);
