const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/ts/components/index.tsx",
  },

  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!LocalFileManifest.json"],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "html", "index.html"),
    }),
  ],

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },

  module: {
    rules: [
      // Handle Typescript files with Babel first, then ts-loader
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-react", "@babel/preset-env"],
            },
          },
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.dev.json",
            },
          },
        ],
      },

      // Resolve all imports with css-loader, and apply them to the files that require those styles with the style-loader
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
