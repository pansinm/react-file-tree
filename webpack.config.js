const HtmlWebpackPlugin = require("html-webpack-plugin");
const server = require("./server");

module.exports = {
  entry: [
    // Runtime code for hot module replacement
    "webpack/hot/dev-server.js",
    // Dev server client for web socket transport, hot and live reload logic
    "webpack-dev-server/client/index.js?hot=true&live-reload=true",
    __dirname + "/example/index.tsx",
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
      server(devServer.app);
    },
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "babel-loader" },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/index.html",
      title: "React File Tree",
    }),
  ],
};
