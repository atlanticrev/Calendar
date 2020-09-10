#!/bin/bash

# git
git init
touch .gitignore

echo "
.idea
/node_modules/
dist
" > ./.gitignore

# webpack config
touch webpack.config.js;
echo "
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    { // use style-loader for development (styles in <style> tag)
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: true,
                            // reloadAll: true,
                            publicPath: path.resolve(__dirname, './dist')
                        },
                    },
                    // 'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('node-sass')
                        },
                    }
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader',
                ],
            },
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
        publicPath: path.resolve(__dirname, '/'),
        port: 3000,
        hot: true,
        // host: '0.0.0.0',
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new CleanWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css'
        }),
    ]
};
" > ./webpack.config.js

#npm
npm init -y
# webpack
npm install --save-dev webpack webpack-cli webpack-dev-server
# generate dynamic html with assets in it
npm install --save-dev html-webpack-plugin
# clean dist folder every rebuild
npm install --save-dev clean-webpack-plugin
# css, only style-loader work with HMR
npm install --save-dev style-loader css-loader mini-css-extract-plugin
# images/icons
npm install --save-dev file-loader
# sass, resolve-url-loader does not work?
npm install --save-dev node-sass sass-loader resolve-url-loader