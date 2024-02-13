module.exports = {
  plugins: ["dynamic-import-node", "@babel/plugin-proposal-optional-chaining"],
  presets: [
    "@babel/preset-typescript",
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
};
