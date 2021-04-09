/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable require-atomic-updates */

const path = require('path');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const findChrome = require('../node_modules/carlo/lib/find_chrome');
const proxy = require('../config/proxy');
const base = require('./webpack.base');

let cookies = null;
module.exports = merge.smart(base, {
    mode: 'development',
    cache: true,
    devtool: 'source-map',
    output: {
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[name].js',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].css',
            chunkFilename: 'static/css/[name].css',
            ignoreOrder: true,
        }),
    ],
    devServer: {
        port: 8080,
        host: 'localhost',
        contentBase: path.join(__dirname, ''),
        watchContentBase: true,
        publicPath: '/',
        compress: true,
        historyApiFallback: true,
        hot: true,
        clientLogLevel: 'error',
        open: false,
        openPage: 'micro',
        overlay: false,
        quiet: false,
        noInfo: false,
        proxy,
        writeToDisk: true,
        watchOptions: {
            ignored: /node_modules/
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        after(app, server, compiler) {
            (async () => {
                const findChromePath = await findChrome({});
                const {executablePath} = findChromePath;
                const userDataDir = '/Users/bjhl/Library/Application Support/Google/Chrome/Default';
                const browser = await puppeteer.launch({
                    executablePath,
                    defaultViewport: chromium.defaultViewport,
                    args: chromium.args,
                    userDataDir,
                    headless: false,
                });
                const page = await browser.newPage();
                await page.goto('https://test-mis.gaotu100.com/');
                await page.setRequestInterception(true);
                page.on('request', req => {
                    req.continue();
                });
                page.on('response', async res => {
                    if (res.url().indexOf('getAuth') > 0 && !cookies) {
                        const text = await res.json();
                        if (text.code === 0) {
                            cookies = await page.cookies();
                            await page.goto('http://localhost:8080/micro#/one');
                            cookies.forEach(async cookie => {
                                await page.setCookie({
                                    name: cookie.name,
                                    value: cookie.value
                                });
                            });
                        }
                    }
                });
            })();
        },
    },
    stats: {
        colors: true,
        children: false,
        chunks: false,
        chunkModules: false,
        modules: false,
        builtAt: false,
        entrypoints: false,
        assets: false,
        version: false
    }
});
