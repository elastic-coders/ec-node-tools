'use strict';

const BbPromise = require('bluebird');
const colors = require('colors/safe');
const fse = require('fs-extra');
const path = require('path');
const glob = require('glob');
const watchFiles = require('./utils/watch');
const relative = require('./utils/relative-path');

const copyWatcher = (fromDir, toDir) => (watcher) => watcher.on('changed', (filePath) => {
  const toPath = path.join(toDir, path.relative(fromDir, filePath));
  fse.copySync(filePath, toPath);
  console.log(`  Copying ${colors.gray(filePath)} to ${colors.gray(toPath)}`);
});

module.exports = (args) => BbPromise.resolve(args).then(args => {
  console.log(colors.yellow('Copy...'));

  const options = Object.assign(
    {
      package: './package.json',
      outDir: './dist',
      watch: false,
    },
    args || {}
  );

  options.package = relative(options.package);
  options.outDir = relative(options.outDir);

  if (args.help) {
    console.log('  Copy package json in dist directory as well as static files.');
    console.log(`  ${colors.gray('package')}: The npm package.json (${options.package})`);
    console.log(`  ${colors.gray('outDir')}: The output directory (${options.outDir})`);
    console.log(`  ${colors.gray('watch')}: Copy again on files changes (${options.watch})`);
    return args;
  }

  const pkg = fse.readJsonSync(options.package);

  fse.ensureDirSync(options.outDir);

  // Copy static files
  if (
    !pkg.ecTools ||
    typeof pkg.ecTools.copy !== 'object'
  ) {
    console.log('  Nothing to copy');
  } else {
    const copyConf = pkg.ecTools.copy;
    for (let sourcePath in copyConf) {
      const fromPath = relative(sourcePath);
      const copyGlobs = copyConf[sourcePath];
      if (typeof copyGlobs === 'string') {
        // Copy a folder content to another folder
        const toPath = relative(copyGlobs);
        console.log(`  Copying ${colors.gray(fromPath)} to ${colors.gray(toPath)}`);
        fse.copySync(fromPath, toPath);
        if (options.watch) {
          watchFiles(path.join(fromPath, '*')).then(copyWatcher(fromPath, toPath));
        }
      } else {
        // copyGlobs has the form { 'glob': 'dest folder' }
        for (let sourceGlob in copyGlobs) {
          const fromGlob = path.join(fromPath, sourceGlob);
          const toPath = copyGlobs[sourceGlob];
          glob
            .sync(fromGlob)
            .map((src) => ([src, path.join(toPath, path.relative(fromPath, src))]))
            .forEach((srcDst) => fse.copySync.apply(null, srcDst));
          console.log(`  Copying ${colors.gray(fromGlob)} to ${colors.gray(toPath)}`);
          if (options.watch) {
            watchFiles(fromGlob).then(copyWatcher(fromPath, toPath));
          }
        }
      }
    }
  }

  // Copy package json
  if (
    !pkg.ecTools ||
    typeof pkg.ecTools.copyPackage !== 'object'
  ) {
    console.log('  No package.json copy');
  } else {
    const pkgChanges = pkg.ecTools.copyPackage;
    const newPkg = Object.assign({}, pkg, pkgChanges);
    const pkgOutPath = path.join(options.outDir, 'package.json');
    console.log(`  Copying package.json to ${colors.gray(pkgOutPath)}`);
    fse.writeJsonSync(pkgOutPath, newPkg);
  }

  return args;
});
