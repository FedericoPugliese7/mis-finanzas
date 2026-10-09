import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.config.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/motion.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Property[key.name=/^(stiffness|damping|mass)$/] > Literal",
          message: 'Los parámetros de spring deben salir de src/shared/motion.ts'
        },
        {
          selector: "Property[key.name=/^(duration|delay|staggerChildren|delayChildren)$/] > Literal",
          message: 'Las duraciones y delays de animación deben salir de src/shared/motion.ts'
        },
        {
          selector: "Literal[value=/cubic-bezier\\(/]",
          message: 'Las curvas de easing deben salir de src/shared/motion.ts'
        }
      ]
    }
  }
);
