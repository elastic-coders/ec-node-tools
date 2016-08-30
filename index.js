#!/usr/bin/env node

'use strict';

const colors = require('colors/safe');
const getArgs = require('./lib/get-args');

const commands = {
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

if (argv.length === 0 || argv[0] === 'help' || typeof commands[argv[0]] === 'undefined') {
  console.log('Usage TODO');
  return;
}

const command = commands[argv[0]];

getArgs(argv.slice(1)).then(command);
