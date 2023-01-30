const path = require("path");

module.exports = {
    mode: "production",
    entry: ["@babel/polyfill", "./src/index.js"],
    output: {
        path: path.resolve(__dirname, "public"),
        publicPath: "/public/",
        filename: "app.js",
    },
    watchOptions: {
        ignored: /node_modules/,
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