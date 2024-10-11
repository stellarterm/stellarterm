// development config
const dotenv = require('dotenv');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const commonConfig = require('./webpack-common');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CreateEnvConsts = require('./custom-plugins/create-env-consts');
const DevelopLocalAPI = require('./custom-plugins/develop-local-api');
const Environments = require('./constants/environments');

const wcProjectId = dotenv.config().parsed
    ? dotenv.config().parsed.WALLET_CONNECT_PROJECT_ID
    : null;


const hasApiKey = !!process.env.COIN_MARKET_CUP_KEY;

if (!hasApiKey) {
    console.warn('No COIN_MARKET_CUP_KEY found. Can not use local environment. Staging env will be used');
}

const environment = hasApiKey ? Environments.local : Environments.staging;

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-source-map',
    module: {
        rules: [
            // SCSS and CSS files
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            minify: false,
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                WALLET_CONNECT_PROJECT_ID: wcProjectId,
            }),
        }),
        new CreateEnvConsts(environment),
        new DevelopLocalAPI(hasApiKey),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 3000,
        hot: true, // Enable hot module replacement
        open: true, // Automatically open browser
        historyApiFallback: {
            disableDotRule: true,
        }, // For SPA routing
    },
});
