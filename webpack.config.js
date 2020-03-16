const path = require('path');

const env = process.env.WEBPACK_ENV;

const libraryWindowName = 'PollUntil';
const libraryName = 'poll-until-promise';
const plugins = [];
let outputFile;

if (env === 'build') {
  outputFile = `${libraryName}.min.js`;
} else {
  outputFile = `${libraryName}.js`;
}

const config = {
  mode: 'production',
  entry: path.resolve('./index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve('./lib'),
    filename: outputFile,
    library: libraryWindowName,
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
