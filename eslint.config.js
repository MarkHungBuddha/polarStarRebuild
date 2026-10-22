import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'test-results', 'playwright-report', 'vite.config.js', 'vite.config.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.spec.ts'],
    rules: {
      // Specs get fixed randomness from the shared fixture; see CODING_STANDARDS.md "測試".
      'no-restricted-imports': ['error', {
        paths: [{ name: '@playwright/test', importNames: ['test'], message: "Import test from './support/fixtures' so scenario picks are reproducible." }],
      }],
      'no-restricted-syntax': ['error',
        {
          selector: "CallExpression[callee.object.name='localStorage'][callee.property.name='getItem']",
          message: 'Specs reach saved state through user flows, not by reading localStorage.',
        },
        {
          selector: "BinaryExpression[operator='<='][left.property.name='scrollWidth']",
          message: 'Use expectNoHorizontalScroll from tests/support.',
        },
      ],
    },
  },
);
