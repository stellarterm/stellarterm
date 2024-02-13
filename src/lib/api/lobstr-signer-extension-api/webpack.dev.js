const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");

const devConfig = {};

module.exports = merge(devConfig, commonConfig);
