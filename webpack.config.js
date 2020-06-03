const path = require('path');

const libraryWindowName = 'PollUntil';
const libraryName = 'poll-until-promise';
const plugins = [];
const outputFile = `${libraryName}.js`;


const config = {
  mode: 'production',
  entry: path.resolve('./index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve('./lib'),
    filename: outputFile,
    library: libraryWindowName,
    globalObject: 'this',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
      },
    }],
  },
  plugins,
};

module.exports = config;
