const config = require("./webpack.config.common.js");

config.mode = "development";
config.devtool = "source-map";

// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
let sourceMapLoader = {
  enforce: "pre",
  test: /\.js$/,
  use: {
    loader: "source-map-loader",
  },
};
config.module.rules.push(sourceMapLoader);

module.exports = config;
