const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: "./src/ts/components/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!LocalFileManifest.json'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "html", "index.html")
    })
  ],

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { 
        test: /\.tsx?$/, 
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.dev.json"
          }
        } 
      },

      // Load all CSS files and allow importing styles in JavaScript files.
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ]
  },
};