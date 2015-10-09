var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/client/app.js',

    output: {
        filename: 'bundle.js',
        path: './public'
    },

    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!cssnext-loader') }
        ]
    },

    postcss: [
        require('postcss-nested'),
        require('lost')
    ],

    resolve: {
        modulesDirectories: ['node_modules', 'src']
    },

    plugins: [
        new ExtractTextPlugin('style.css', { allChunks: true })
    ]
};
