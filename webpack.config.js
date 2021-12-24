const path = require('path');

const libraryWindowName = 'PollUntil';
const plugins = [];
const outputFile = `index.js`;

const config = {
  mode: 'production',
  entry: path.resolve('./src/index.ts'),
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
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins,
};

module.exports = config;
