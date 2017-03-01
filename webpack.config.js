/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Mark van Seventer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Strict mode.
'use strict';

// Standard lib.
const path = require('path');

// Package modules.
const glob = require('glob');
const webpack = require('webpack');

// Local modules.
const UnCSSPlugin = require('./plugins/uncss');

// Constants.
const PUBLISH_DIR = path.resolve('public/'); // Hugo default.

// Configure.
const cssNano = require('./config/cssnano');
const htmlMinifier = require('./config/html-minifier');
const imagemin = require('./config/imagemin');
const postCSS = require('./config/postcss');

// Exports.
module.exports = {
  // @see https://webpack.js.org/configuration/entry-context/#context
  context: PUBLISH_DIR,

  // @see https://webpack.js.org/configuration/entry-context/#entry
  entry: function () {
    return glob.sync('*.html', {
      absolute: true, // Receive absolute paths for matched files.
      cwd: this.context, // The current working directory in which to search.
      matchBase: true, // Perform a basename-only match.
      nodir: true, // Do not match directories, only files.
      nosort: true // Don't sort the results.
    });
  },

  // @see https://webpack.js.org/configuration/output/
  output: {
    filename: 'js/bundle.js',
    path: PUBLISH_DIR,
    publicPath: '/'
  },

  // @see https://webpack.js.org/configuration/dev-server/
  devServer: {
    contentBase: PUBLISH_DIR,
    inline: false,
    watchContentBase: true
  },

  // @see https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'eval-source-map',

  // @see https://webpack.js.org/loaders/
  module: {
    rules: [
      {
        test: /.(gif|jpe?g|png|svg|tiff|webp)$/i,
        use: [
          'file-loader?name=img/[name].[hash:4].[ext]',
          {
            loader: 'image-webpack-loader',
            options: Object.assign({ bypassOnDebug: true }, imagemin)
          },
          'sharp-image-loader'
        ]
      },
      {
        test: /.html$/i,
        use: [
          'file-loader?name=[path][name].[ext]',
          'extricate-loader',
          {
            loader: 'html-loader',
            options: Object.assign({
              attrs: [ 'img:src', 'link:href', 'script:src' ]
            }, htmlMinifier)
          }
        ]
      },
      {
        test: /.js$/i,
        exclude: /node_modules/,
        use: [
          'entry-loader?name=js/[name].[hash:4].js',
          'babel-loader'
        ]
      },
      {
        enforce: 'post',
        test: /.(css|sass|scss)$/i,
        use: [
          'file-loader?name=css/[name].[hash:4].css',
          'extricate-loader?resolve=\\.js$', // extract-loader.
          { loader: 'css-loader', options: cssNano },
          { loader: 'postcss-loader', options: postCSS },
          'sass-loader?outputStyle=nested'
        ]
      }
    ]
  },

  // @see https://webpack.js.org/configuration/resolve/
  resolve: {
    modules: [
      path.resolve('static-src/'), // Search only in the given directory.
      path.resolve('themes/default/static-src/'), // Theme dir.
      'bower_components/',
      'node_modules/'
    ]
  },

  // @see https://webpack.js.org/plugins/
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
    new UnCSSPlugin()
  ]
};
