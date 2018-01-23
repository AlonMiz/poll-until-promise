const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const env = process.env.WEBPACK_ENV;

const libraryName = 'poll-until-promise';
const plugins = [];
let outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    minimize: true
  }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

const config = {
  entry: path.resolve('./index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve('./lib'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }, {
      test: /(\.jsx|\.js)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }]
  },
  plugins
};

module.exports = config;
