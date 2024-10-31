const { merge } = require('webpack-merge');
const commonConfig = require('./webpack-common');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CreateEnvConsts = require('./custom-plugins/create-env-consts');
const childProcess = require('child_process');
const Environments = require('./constants/environments');

const branchName =
    process.env.BRANCH ||
    childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

const isMaster = branchName === 'master';
const isStaging = branchName === 'staging';

let environment = '';
switch (true) {
    case isMaster: {
        environment = Environments.production;
        break;
    }
    case isStaging: {
        environment = Environments.staging;
        break;
    }
    default: {
        environment = Environments.production;
        break;
    }
}


module.exports = merge(commonConfig, {
    mode: 'production',
    devtool: false,
    module: {
        rules: [
            // SCSS and CSS files
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        // Generates index.html with scripts and styles included
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            },
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
            }),
        }),
        new CreateEnvConsts(environment),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'static', to: '' },
            ],
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        minimizer: [() => ({ terserOptions: { mangle: false } })]
    },
});
