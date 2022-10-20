module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
      },
    ],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-parameter-properties': [
      'error',
      {
        allows: ['public', 'public readonly', 'private readonly'],
      },
    ],
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    'arrow-parens': ['error', 'as-needed', {requireForBlockBody: true}],
    'brace-style': 'error',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    curly: 'error',
    indent: 'off',
    'lines-between-class-members': ['error', 'always'],
    'no-useless-constructor': 'off',
    quotes: 'off',
    'space-before-blocks': 'error',
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        groups: ['external', 'builtin', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
    'object-curly-spacing': ['error', 'never'],
    semi: ['error', 'always'],
    'comma-spacing': ['error', {'before': false, 'after': true}],
    'eol-last': ['error', 'always'],
  },
  overrides: [
    {
      files: [
        'test/**/*.ts',
        '**/*.spec.ts',
      ],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'max-nested-callbacks': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
