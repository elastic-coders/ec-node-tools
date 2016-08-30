'use strict';

const BbPromise = require('bluebird');

module.exports = (pattern) => new BbPromise((resolve, reject) => {
  const gaze = require('gaze');
  gaze(pattern, (err, watcher) => err ? reject(err) : resolve(watcher));
});
