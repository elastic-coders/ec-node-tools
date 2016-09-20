'use strict';

const BbPromise = require('bluebird');
const relative = require('./utils/relative-path');

module.exports = (args) => BbPromise.resolve(args).then(args => {
  const colors = require('colors/safe');
  const path = require('path');
  const fse = require('fs-extra');

  console.log(colors.yellow('Clean...'));

  const options = Object.assign(
    {
      package: './package.json',
      outDir: './dist',
    },
    args || {}
  );

  options.package = relative(options.package);
  options.outDir = relative(options.outDir);

  if (args.help) {
    console.log('  Removes dist files.');
    console.log(`  ${colors.gray('package')}: The npm package.json (${options.package})`);
    console.log(`  ${colors.gray('outDir')}: The output directory (${options.outDir})`);
    return args;
  }

  const pkg = fse.readJsonSync(options.package);
  const cleanDirs = new Set([
    path.join(options.outDir, '*')
  ].concat((
    pkg.ecTools &&
    Array.isArray(pkg.ecTools.clean) &&
    pkg.ecTools.clean ||
    []
  ).map(p => path.join(process.cwd(), p))));

  cleanDirs.forEach(pathTemplate => {
    console.log(`  Cleaning ${colors.gray(pathTemplate)}`);
    fse.removeSync(pathTemplate);
  });

  return args;
});
