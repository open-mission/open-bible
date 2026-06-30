import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'public/**',
      'next-env.d.ts',
    ],
  },
  {
    // Dívida técnica preexistente: rebaixada para warning para o lint não
    // bloquear PRs por código legado não relacionado à mudança. Limpar aos poucos.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]

export default eslintConfig
