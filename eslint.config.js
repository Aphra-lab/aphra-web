import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'packages/*/storybook-static/**',
      'packages/*/sources/**',
    ],
  },

  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // TypeScript parser options for source files
  {
    files: [
      'src/**/*.{ts,tsx}',
      'tests/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
      'packages/*/tests/**/*.{ts,tsx}',
      'packages/*/.storybook/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // Worker sources
  {
    files: ['worker/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  // React plugins
  {
    files: [
      'src/**/*.{ts,tsx}',
      'packages/*/src/**/*.{ts,tsx}',
      'packages/*/tests/**/*.{ts,tsx}',
      'packages/*/.storybook/**/*.ts',
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // Stylistic rules
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    },
  },

  // General rules for TypeScript files
  {
    files: [
      'src/**/*.{ts,tsx}',
      'tests/**/*.{ts,tsx}',
      'worker/**/*.ts',
      'packages/*/src/**/*.{ts,tsx}',
      'packages/*/tests/**/*.{ts,tsx}',
      'packages/*/.storybook/**/*.ts',
    ],
    rules: {
      'spaced-comment': [
        'error',
        'always',
        { line: { markers: ['/'] }, block: { markers: ['!'], balanced: true } },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      // Relaxed for React components
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Allow unsafe assignment for asset imports
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  // Test files - relaxed rules
  {
    files: [
      'tests/**/*.{ts,tsx}',
      'packages/*/tests/**/*.{ts,tsx}',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },

  // Config files - disable type checking
  {
    files: [
      '*.config.{js,mjs,cjs,ts}',
      'vite.config.ts',
      'vitest.config.ts',
      'packages/*/scripts/**/*.mjs',
    ],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: { ...globals.node },
    },
  },

  // Stories - meta and story exports are not components
  {
    files: ['packages/*/src/**/*.stories.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Prettier must be last
  prettier,
);
