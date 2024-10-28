// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  name: 'server',
  entry: './bin/www.ts',
  target: 'node',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'server.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(__dirname, 'web.config'), to: path.join(__dirname, 'dist') },
        { from: path.join(__dirname, 'public'), to: path.join(__dirname, 'dist/public') }
      ]
    })
  ]
};

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export default config;
