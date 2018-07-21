const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: [
        '@webcomponents/webcomponentsjs/webcomponents-loader.js',
        './app.js'
    ],
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'head',
            template: './index.html',
        }),
    ],
    output: {
        // TODO: [chunkHash]
        filename: 'src/[name].[hash].immutable.js',
        hashFunction: 'sha512',
        hashDigestLength: 64,
    },
};
