/**
 * Created by josh on 2/12/16.
 */
var path = require('path');

module.exports = {
    context: __dirname + "",
    entry: {
        client: "./editor/main.jsx",
        web:    "./editor/index.html",
        css:    "./editor/semantic.css",
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.html$/,
                loader: "file?name=[name].[ext]",
            },
            {
                test: /\.css$/,
                loader: "file?name=[name].[ext]",
            }
        ]
    }
};

