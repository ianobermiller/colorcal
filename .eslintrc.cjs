module.exports = {
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'sort-keys-fix', 'sort-destructure-keys', 'import'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/sort-type-constituents': 'warn',
    '@typescript-eslint/sort-type-union-intersection-members': 'warn',
    '@typescript-eslint/unbound-method': 'off',
    'import/order': 'warn',
    'react/jsx-sort-props': 'warn',
    'sort-destructure-keys/sort-destructure-keys': 'warn',
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],
    'sort-keys-fix/sort-keys-fix': 'warn',
  },
  ignorePatterns: ['*.cjs', '*.config.ts'],
};
