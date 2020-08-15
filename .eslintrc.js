const baseExtends = [
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
  'plugin:react/recommended',
  'plugin:import/errors',
  'plugin:import/warnings',
  'plugin:import/typescript',
]

module.exports = {
  root: true,
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
      files: ['*.js', 'src/ts/BuildLocalManifest.ts'],
      extends: baseExtends.concat(['plugin:node/recommended']),
    }
  ]
};
