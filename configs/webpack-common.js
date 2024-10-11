const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CreateBuildInfo = require('./custom-plugins/create-build-info');
const CreateImages = require('./custom-plugins/create-images');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');


module.exports = {
    entry: './src/components/App.jsx',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'scripts/[name].bundle.js',
        clean: true, // Clean the output directory before emit
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        fallback: {
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            util: false,
            url: false,
            buffer: require.resolve('buffer'),
            process: require.resolve('process/browser'),
        },
    },
    module: {
        rules: [
            // JSX and JS files (Babel)
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
            // Image handling (Images/Files)
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.imageminGenerate,
                options: {
                    plugins: [
                        ['gifsicle', { interlaced: true }],
                        ['jpegtran', { progressive: true }],
                        ['optipng', { optimizationLevel: 5 }],
                        ['svgo', { plugins: [{ removeViewBox: false }] }],
                    ],
                },
            },
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new CreateBuildInfo(),
        new CreateImages(),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};
