const path = require("path");

module.exports = {
    mode: "development",
    output: {
        path: path.resolve(__dirname, "public"),
        publicPath: "/public/",
        filename: "app.js",
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },

        ],
    },
}