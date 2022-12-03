const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { pathToFileURL } = require("url");
const express = require("express");
const { LocalFileService, createMiddleware } = require("./server");

module.exports = {
  entry: [
    // Runtime code for hot module replacement
    "webpack/hot/dev-server.js",
    // Dev server client for web socket transport, hot and live reload logic
    "webpack-dev-server/client/index.js?hot=true&live-reload=true",
    __dirname + "/explorer/index.tsx",
  ],
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
  },

  mode: "development",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"],
  },

  devServer: {
    open: true,
    compress: true,
    port: 9000,
    onBeforeSetupMiddleware: function (devServer) {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      devServer.app.use(express.json());
      devServer.app.get("/root", (req, res) => {
        res.send({
          uri: pathToFileURL("."),
          async: "unload",
        });
      });
      devServer.app.post("/action", createMiddleware(new LocalFileService()));
    },
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.jsx?$/, loader: "babel-loader" },
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new HtmlWebpackPlugin({
      template: __dirname + "/index.html",
      title: "React File Tree",
    }),
  ],
};
