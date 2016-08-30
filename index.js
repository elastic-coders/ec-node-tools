'use strict';

const BbPromise = require('bluebird');
const colors = require('colors/safe');
const getArgs = require('./lib/get-args');

const tools = {
  'build': require('./lib/build'),
  'bundle': require('./lib/bundle'),
  'clean': require('./lib/clean'),
  'copy': require('./lib/copy'),
  'image': require('./lib/image'),
  'serve': require('./lib/serve'),
};

const argv = process.argv.slice(
  process.argv.findIndex(a => /ec-tools/.test(a)) + 1
);

function startTools(extra) {
  if (argv.length === 0 || argv[0] === 'help') {
    console.log('Usage TODO');
    return BbPromise.reject();
  }
  return getArgs(argv.slice(1))
    .then(args => Object.assign(args, { tool: argv[0] }, extra))
    .then(args => {
      if (args.tool && tools[args.tool]) {
        args.tool = tools[args.tool];
      }
      return args;
    });
}

startTools.tools = tools;

module.exports = startTools;
