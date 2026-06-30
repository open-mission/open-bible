/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Types permitidos no projeto
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação, sem mudança de lógica
        'refactor', // Refatoração sem fix/feat
        'perf',     // Melhoria de performance
        'improve',  // Melhoria em funcionalidade existente
        'test',     // Testes
        'chore',    // Tarefas de manutenção (CI, deps, build)
        'ci',       // Mudanças de CI/CD
        'revert',   // Reversão de commit
        'wip',      // Work in progress (apenas em branches locais)
      ],
    ],
    // Escopo opcional mas recomendado
    'scope-case': [2, 'always', 'lower-case'],
    // Assunto obrigatório
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    // Cabeçalho máximo de 100 chars
    'header-max-length': [2, 'always', 100],
    // Corpo e rodapé separados por linha em branco
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};

export default config;
