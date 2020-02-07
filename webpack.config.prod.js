const config = require("./webpack.config.common.js");

config.mode = "production";

config.optimization = {
  splitChunks: {
    chunks: "all",
  },
};

module.exports = config;
