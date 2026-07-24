import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/**', '.cache/**'],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  {
    // The asset pipeline is a plain Node script, not part of the Next bundle.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
]

export default config
