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
            // Uncomment when styles are integrated into components
            // { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!cssnext-loader!postcss-loader') }
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[local]!cssnext-loader!postcss-loader') }
        ]
    },

    postcss: [
        require('postcss-nested')
    ],

    resolve: {
        modulesDirectories: ['node_modules', 'src']
    },

    plugins: [
        new ExtractTextPlugin('style.css', { allChunks: true })
    ]
};
