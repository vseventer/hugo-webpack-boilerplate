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

// Package modules.
const uncss = require('uncss');

// Configure.
const htmlLoader = require.resolve('html-loader');

// Exports.
class UnCSSPlugin {
  constructor (options) {
    this.options = options;
  }

  apply (compiler) {
    const options = this.options;

    compiler.plugin('compilation', function (compilation) {
      // Gather all HTML resources.
      const html = [ ]; // Init.
      compilation.plugin('normal-module-loader', function(loaderContext, module) {
        const length = module.loaders.length;
        for(let i = 0; i < length; i += 1) {
          const loader = module.loaders[i].loader;
          if(loader === htmlLoader) { // Resource is HTML.
            return html.push(module.resource);
          }
        }
      });

      // Append UnCSS plugin to PostCSS.
      compilation.plugin('postcss-loader-before-processing', function (plugins) {
        // Merge options.
        const opts = Object.assign({ }, options, { html });

        // Add the plugin and return.
        plugins.push(uncss.postcssPlugin(opts));
        return plugins;
      });
    });
  }
}

// Exports.
module.exports = UnCSSPlugin;