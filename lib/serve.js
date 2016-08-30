'use strict';

const BbPromise = require('bluebird');

module.exports = (args) => BbPromise.resolve(args)
  .then(require('./build'))
  .then(args => {
    const colors = require('colors/safe');
    const path = require('path');
    const fse = require('fs-extra');
    const cp = require('child_process');
    const watchFile = require('./utils/watch');

    console.log(colors.yellow('Serve...'));

    const options = Object.assign(
      {
        package: path.join(process.cwd(), './package.json'),
        config: path.join(process.cwd(), './webpack.config.js'),
        watch: false,
        devProxy: false,
      },
      args || {}
    );

    if (options.devProxy === true) {
      options.devProxy = 5000;
    }

    if (args.help) {
      console.log('  Start the server. Options:');
      console.log(`  ${colors.gray('package')}: The npm package.json (${options.package})`);
      console.log(`  ${colors.gray('config')}: The Webpack configuration file (${options.config})`);
      console.log(`  ${colors.gray('watch')}: Restart the server on changes (${options.watch})`);
      console.log(`  ${colors.gray('devProxy')}: Local port to proxy with Webpack Dev Server (${options.devProxy})`);
      return args;
    }

    const pkg = fse.readJsonSync(options.package);
    const mainFile = pkg.main;
    const mainFilePath = path.join(process.cwd(), mainFile);

    console.log(`  Starting file ${colors.gray(mainFilePath)}`);

    function start() {
      const server = cp.fork(mainFilePath, {
        env: Object.assign({ NODE_ENV: 'development' }, process.env),
        silent: false,
      });

      // server.once('message', message => {
      //   if (message.match(/^online$/)) {
      //     resolve(args);
      //   }
      // });

      server.once('error', err => reject(err));
      process.on('exit', () => server.kill('SIGTERM'));
      return server;
    }

    let server = start();

    if (options.watch) {
      watchFile(mainFilePath).then(watcher => {
        watcher.on('changed', () => {
          server.kill('SIGTERM');
          server = start();
        });
      });
    }

    //

    if (options.devProxy) {
      // TODO a way to select a subconfig is needed
      const webpack = require('webpack');
      const webpackDevServer = require('webpack-dev-server');
      const config = require(options.config);
      const bundler = webpack(config);
      const proxyUrl = `http://localhost:${options.devProxy}`;

      const devServer = new webpackDevServer(bundler, {
        hot: true,
        historyApiFallback: true,
        compress: false,
        proxy: {
          '**': proxyUrl,
        },
        quiet: false,
        noInfo: false,
        watchOptions: {
          aggregateTimeout: 300,
          poll: 1000,
        },
        publicPath: '/public/',
        stats: {
          colors: true,
          chunks: false,
          children: true,
        },
      });

      devServer.listen(9000, 'localhost', (err) => {
        if (err) {
          console.log(err);
        }
        console.log(`  Starting Webpack Dev Server proxy at ${colors.gray('http://localhost:9000')}`);
      });
    }
  });
