const baseExtends = [
  "eslint:recommended",
  "plugin:react/recommended",
  "plugin:import/errors",
  "plugin:import/warnings",
  "prettier",
  "prettier/react",
];

const tsExtends = baseExtends.concat([
  "plugin:@typescript-eslint/recommended",
  "plugin:@typescript-eslint/recommended-requiring-type-checking",
  "plugin:import/typescript",
  "prettier/@typescript-eslint",
]);

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: baseExtends,
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      files: ["*.js"],
      extends: baseExtends.concat(["plugin:node/recommended"]),
      rules: {
        "node/no-unpublished-require": "off",
      },
    },
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        tsConfigRootDir: __dirname,
        project: ["./tsconfig.dev.json"],
      },
      plugins: ["@typescript-eslint"],
      extends: tsExtends,
    },
  ],
};
