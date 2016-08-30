'use strict';

const BbPromise = require('bluebird');

module.exports = (args) => BbPromise.resolve(args).then(args => {
  const colors = require('colors/safe');
  const fse = require('fs-extra');
  const path = require('path');

  console.log(colors.yellow('Copy...'));

  const options = Object.assign(
    {
      package: path.join(process.cwd(), './package.json'),
      outDir: path.join(process.cwd(), './dist'),
    },
    args || {}
  );

  if (args.help) {
    console.log('  Copy package json in dist directory.');
    console.log(`  ${colors.gray('package')}: The npm package.json (${options.package})`);
    console.log(`  ${colors.gray('outDir')}: The output directory (${options.outDir})`);
    return args;
  }

  const pkg = fse.readJsonSync(options.package);

  // Copy static files
  if (
    !pkg['ec-tools'] ||
    typeof pkg['ec-tools'].copy !== 'object'
  ) {
    console.log('  Nothing to copy');
  } else {
    const copyConf = pkg['ec-tools'].copy;
    for (let f in copyConf) {
      const fromPath = path.join(process.cwd(), f);
      const toPath = path.join(process.cwd(), copyConf[f]);
      console.log(`  Copying ${colors.gray(fromPath)} to ${colors.gray(toPath)}`);
      fse.copySync(fromPath, toPath);
    }
  }

  // Copy package json
  if (
    !pkg['ec-tools'] ||
    typeof pkg['ec-tools'].copyPackage !== 'object'
  ) {
    console.log('  No package.json copy');
  } else {
    const pkgChanges = pkg['ec-tools'].copyPackage;
    const newPkg = Object.assign({}, pkg, pkgChanges);
    const pkgOutPath = path.join(options.outDir, 'package.json');
    console.log(`  Copying package.json to ${colors.gray(pkgOutPath)}`);
    fse.writeJsonSync(pkgOutPath, newPkg);
  }

  return args;
});
