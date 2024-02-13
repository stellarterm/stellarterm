module.exports = {
  extends: ["../.eslintrc.js"],
  overrides: [
    {
      files: ["*.ts", "*.test.js"],
      rules: {
        "import/no-extraneous-dependencies": [0, { packageDir: "@shared/*" }],
      },
    },
    {
      files: ["*/**/ducks/*.ts"],
      rules: {
        "no-param-reassign": "off",
      },
    },
  ],
};
