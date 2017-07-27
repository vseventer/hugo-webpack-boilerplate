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

// Standard lib.
import { resolve } from 'path';

// Package modules.
import CopyPlugin from 'copy-webpack-plugin';
import { sync as glob } from 'glob';
import InertEntryPlugin from 'inert-entry-webpack-plugin';
import UnCSSPlugin from 'uncss-webpack-plugin';
import webpack from 'webpack';

// Configuration.
import cssNano from './cssnano';
import htmlMinifier from './html-minifier';
import imagemin from './imagemin';
import postCSS from './postcss';

// Ideally, replace extricate-loader with Extract Text Plugin, as it is more
// mature. This is pending #159, #268, #470.
// @see https://github.com/webpack-contrib/extract-text-webpack-plugin

// Constants.
const TMP_DIR = 'public/'; // Hugo `publishDir` default.
const PUBLISH_DIR = 'dist/'; // Our publish default.

// Exports.
export const fromConfig = ({ hugoPublishDir = TMP_DIR, outDir = PUBLISH_DIR }) => {
  // Ensure paths are absolute.
  hugoPublishDir = resolve(hugoPublishDir);
  outDir = resolve(outDir);

  // Return configuration.
  return {
    // @see https://webpack.js.org/configuration/entry-context/
    context: hugoPublishDir,
    entry: () => glob('*.html', {
      absolute: true, // Receive absolute paths for matched files.
      cwd: hugoPublishDir, // The current working directory in which to search.
      matchBase: true, // Perform a basename-only match.
      nodir: true, // Do not match directories, only files.
      nosort: true // Do not sort the results.
    }),

    // @see https://webpack.js.org/configuration/output/
    output: {
      filename: '[path][name].[ext]',
      path: outDir,
      publicPath: '/'
    },

    // @see https://webpack.js.org/configuration/dev-server/
    devServer: {
      contentBase: hugoPublishDir,
      inline: false,
      watchContentBase: true
    },

    // @see https://webpack.js.org/configuration/module/
    module: {
      rules: [
        {
          test: /.html$/i,
          use: [
            'extricate-loader',
            {
              loader: 'html-loader',
              options: Object.assign({ interpolate: 'require' }, htmlMinifier)
            }
          ]
        },
        {
          test: /.(gif|jpe?g|png|svg|tiff|webp)$/i,
          use: [
            {
              loader: 'file-loader',
              options: { name: 'img/[name].[hash:4].[ext]' }
            },
            {
              loader: 'image-webpack-loader',
              options: Object.assign({ bypassOnDebug: true }, imagemin)
            },
            'sharp-image-loader'
          ]
        },
        {
          test: /.jsx?$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'spawn-loader',
              options: { name: 'js/[name].js' }
            },
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [ 'es2015', { modules: false } ]
                ]
              }
            }
          ]
        },
        {
          test: /.(css|sass|scss)$/i,
          use: [
            {
              loader: 'file-loader',
              options: { name: 'css/[name].[hash:4].css' }
            },
            {
              loader: 'extricate-loader',
              options: { resolve: '\\.js$' }
            },
            {
              loader: 'css-loader',
              options: Object.assign({ sourceMap: true }, cssNano)
            },
            {
              loader: 'postcss-loader',
              options: Object.assign({ sourceMap: 'inline' }, postCSS)
            },
            {
              loader: 'sass-loader',
              options: { outputStyle: 'nested', sourceMap: true }
            }
          ]
        }
      ]
    },

    // @see https://webpack.js.org/configuration/resolve/
    resolve: {
      modules: [
        hugoPublishDir,
        resolve('bower_components/'),
        resolve('node_modules/')
      ]
    },

    // @see https://webpack.js.org/configuration/plugins/
    plugins: [
      new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
      new InertEntryPlugin(),
      new UnCSSPlugin(),
      new CopyPlugin([{ from: '**/*' }], {
        ignore: [ // Ignore assets processed by loaders above.
          '*.html',
          '*.{gif,jpeg,jpg,png,svg,tiff,webp}',
          '*.{js,jsx}',
          '*.{css,sass,scss}'
        ]
      })
    ]
  };
};

// Default exports.
export default fromConfig({ });
