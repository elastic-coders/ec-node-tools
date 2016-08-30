'use strict';

const BbPromise = require('bluebird');

module.exports = (argv) => BbPromise.resolve(argv).then(argv => {
  const args = {};
  (argv || process.argv).forEach(arg => {
    const argParts = arg.split(':');
    let val = argParts.slice(1).join(':') || true;
    if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }
    args[argParts[0]] = val;
  });
  return args;
});
