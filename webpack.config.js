var path = require("path");
module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "commonjs2" // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ["url-loader?limit=10000", "img-loader"]
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "src"),
        exclude: /(node_modules|bower_components|build|dist)/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, "src"),
        exclude: /(node_modules|bower_components|build|dist)/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  externals: {
    react: "commonjs react" // this line is just to use the React dependency of our parent-testing-project instead of using our own React.
  }
};
