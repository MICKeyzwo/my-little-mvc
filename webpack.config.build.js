"use strict";

module.exports = {
    mode: "production",
    entry: {
        app: "./src/ts/index.ts"
    },
    output: {
        path: `${__dirname}/dist/js`,
        filename: "main.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: "/node_modules/",
                use: {
                    loader: "ts-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: [".ts"]
    }
};
