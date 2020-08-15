const baseExtends = [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:import/errors',
  'plugin:import/warnings',
]

const tsExtends = baseExtends.concat([
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
  'plugin:import/typescript',
])

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsConfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: baseExtends,
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.js'],
      extends: baseExtends.concat([
        'plugin:node/recommended'
      ]),
    },
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      extends: tsExtends
    },
  ]
};
