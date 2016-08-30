'use strict';

const BbPromise = require('bluebird');

module.exports = (args) => BbPromise.resolve(args)
  .then(require('./clean'))
  .then(require('./copy'))
  .then(require('./bundle'));
