const path = require('path');

module.exports = {
  mode: "production",

  entry: "./src/components/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { 
        test: /\.tsx?$/, 
        use: {
          loader: "awesome-typescript-loader",
          options: {
            configFileName: "tsconfig.prod.json"
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