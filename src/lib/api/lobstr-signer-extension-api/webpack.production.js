const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");

const prodConfig = {};

module.exports = merge(prodConfig, commonConfig);
