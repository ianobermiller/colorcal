import eslint from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import solid from 'eslint-plugin-solid/configs/typescript';
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
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  perfectionist.configs['recommended-alphabetical'],
  solid,
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
      // Solid.js specific rules
      'solid/components-return-once': 'error',
      'solid/event-handlers': 'error',
      'solid/jsx-no-duplicate-props': 'error',
      'solid/jsx-no-script-url': 'error',
      'solid/jsx-no-undef': 'error',
      'solid/jsx-uses-vars': 'error',
      'solid/no-destructure': 'error', // Prevents destructuring props
      'solid/no-innerhtml': 'error',
      'solid/no-react-specific-props': 'error',
      'solid/no-unknown-namespaces': 'error',
      'solid/prefer-for': 'error',
      'solid/reactivity': 'error',
      'solid/style-prop': 'error',
    },
  },
  {
    // only js and mjs files
    files: ['*.js', '*.mjs', 'instant.perms.ts', 'instant.schema.ts'],
    languageOptions: { globals: globals.node },
    ...tseslint.configs.disableTypeChecked,
  },
);
