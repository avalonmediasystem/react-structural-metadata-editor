const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, 'demo/src/index.html'),
  filename: './index.html',
});
module.exports = {
  entry: [
    'webpack-hot-middleware/client?reload=true',
    path.join(__dirname, 'demo/src/index.js'),
  ],
  mode: 'development',
  output: {
    path: path.join(__dirname, 'demo/dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.mp4$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: './demo/assets/media.mp4'
            }
          }
        ],
      },
    ],
  },
  plugins: [
    htmlWebpackPlugin,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(), // Use NoErrorsPlugin for webpack 1.x
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    // contentBase: path.join(__dirname, 'public'),
    port: 3001,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:3001',
        router: () => 'http://localhost:9000',
      },
    }
  },
  devtool: 'source-map',
};
