const path = require("path");
const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { DEFAULT_STATS } = require("../config/webpack");

const BUILD_PATH = path.resolve(__dirname, "./build");

const config = {
  entry: {
    index: path.resolve(__dirname, "./src/index.ts"),
  },
  devtool: "source-map",
  output: {
    globalObject: "this",
    library: "lobstrSignerExtensionApi",
    libraryTarget: "umd",
    path: BUILD_PATH,
    filename: "[name].min.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "./tsconfig.json"),
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: ["ts-loader"],
      },
    ],
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, "../node_modules")],
  },
  plugins: [
    new webpack.DefinePlugin({
      DEV_SERVER: false,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /webextension-polyfill/,
      path.resolve(__dirname, "../config/shims/webextension-polyfill.ts")
    ),
  ],
  stats: DEFAULT_STATS,
};

module.exports = config;
