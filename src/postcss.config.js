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
import { parse as urlParse } from 'url';

// Package modules.
import at2x from 'postcss-at2x';
import cssnext from 'postcss-cssnext';
import sprites from 'postcss-sprites';

// Sprite helpers.
const filterBy = (image) => {
  return new Promise((resolve, reject) => {
    const { query } = urlParse(image.originalUrl, true);
    return 'sprite' in query ? resolve() : reject();
  });
};
const groupBy = (image) => {
  return new Promise((resolve, reject) => {
    const { query } = urlParse(image.originalUrl, true);
    return 'sprite' in query && query.sprite.length ? resolve(query.sprite) : reject();
  });
};

// Exports.
// We got to use `module.exports` here, as `postcss-load-config` is not
// compatible with es6 `export default`.
module.exports = ({ file, options, env }) => ({
  plugins: [
    at2x(),
    sprites({
      filterBy, // Only create sprites for ./file?sprite.
      groupBy, // Group by ./file?sprite=<group>.
      retina: true, // Search for retina mark in the filename.
      spritePath: options.spritePath
    }),
    cssnext()
  ]
});
