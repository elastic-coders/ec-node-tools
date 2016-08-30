'use strict';

const BbPromise = require('bluebird');

module.exports = (args) => new BbPromise((resolve, reject) => {
  const colors = require('colors/safe');
  const path = require('path');
  const webpack = require('webpack');

  console.log(colors.yellow('Bundle...'));

  const options = Object.assign(
    {
      config: path.join(process.cwd(), './webpack.config.js'),
      watch: false,
    },
    args || {}
  );

  if (args.help) {
    console.log('  Use Webpack to create the output bundle. Options:');
    console.log(`  ${colors.gray('config')}: The Webpack configuration file (${options.config})`);
    console.log(`  ${colors.gray('watch')}: Use Webpack watch (${options.watch})`);
    return resolve(args);
  }

  console.log(`  Using Webpack config at ${colors.gray(options.config)}`);

  const config = require(options.config);
  const bundler = webpack(config);
  let bundlerRunCount = 0;

  function bundle(err, stats) {
    if (err) {
      return reject(err);
    }

    console.log(stats.toString({
      colors: true,
      hash: false,
      version: false,
      chunks: false,
      children: true,
    }));

    if (++bundlerRunCount === (options.watch ? config.length : 1)) {
      return resolve(args);
    }
  }

  if (options.watch) {
    bundler.watch(200, bundle);
  } else {
    bundler.run(bundle);
  }
});
