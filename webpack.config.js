const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, 'demo/src/index.html'),
  filename: './index.html',
});

const isDev = process.argv.indexOf('serve') > -1 ? true : false;

module.exports = {
  entry: [
    path.join(__dirname, 'demo/src/index.js'),
  ],
  mode: isDev ? 'development' : 'production',
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
    ],
  },
  plugins: [
    htmlWebpackPlugin,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(), // Use NoErrorsPlugin for webpack 1.x
    new CopyWebpackPlugin({
      patterns: [
        { from: './public' }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    port: 3001,
    liveReload: true,
    static: {
      directory: path.resolve(__dirname, "public")
    },
    proxy: {
      '/structure.json': {
        bypass: function(req, res) {
          if(req.method == 'POST' || req.method == 'HEAD') {
            res.send({ statusCode: 200, data: 'Success'})
          }
        },
      }
    }
  },
  devtool: 'source-map',
};
