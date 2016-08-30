'use strict';

const BbPromise = require('bluebird');

module.exports = (args) => BbPromise.resolve(args)
  .then(args => args.only ? args : require('./build')(args))
  .then(args => {
    const colors = require('colors/safe');
    const fse = require('fs-extra');
    const path = require('path');
    const tar = require('tar-fs');
    const Docker = require('dockerode');
    const JSONStream = require('JSONStream');

    console.log(colors.yellow('Image...'));

    const options = Object.assign(
      {
        package: path.join(process.cwd(), './package.json'),
        tag: 'latest',
        outDir: path.join(process.cwd(), './dist'),
      },
      args || {}
    );

    const pkg = fse.readJsonSync(options.package);
    if (!options.repo) {
      options.repo = pkg.name.replace('-', '/');
    }

    if (options.tag === true) {
      options.tag = require('git-describe').gitDescribeSync({ match: /v?[0-9]+(\.[0-9]+)*/ }).tag || 'latest';
    }

    if (args.help) {
      console.log('  Create a Docker image. Options:');
      console.log(`  ${colors.gray('repo')}: Docker image repository/name (${options.repo})`);
      console.log(`  ${colors.gray('tag')}: Docker image tag or true to use git describe (${options.tag})`);
      console.log(`  ${colors.gray('package')}: The npm package.json (${options.package})`);
      console.log(`  ${colors.gray('outDir')}: The output directory (${options.outDir})`);
      return args;
    }

    const t = `${options.repo}:${options.tag}`;
    console.log(`  Build Docker image ${colors.gray(t)}`); // eslint-disable-line no-console
    const docker = new Docker();
    const tarStream = tar.pack(process.cwd(), {
      entries: [
        path.relative(process.cwd(), options.outDir),
        'Dockerfile'
      ],
    });

    return new BbPromise((resolve, reject) =>
      docker.buildImage(
        tarStream,
        { t },
        (err, stream) => {
          if (err) {
            return reject(err);
          }

          stream
            .pipe(JSONStream.parse('stream'))
            .pipe(process.stdout, {end: true});

          stream.on('end', function() {
            resolve(t);
          });

          stream.on('error', function(error) {
            reject(error);
          });
        }
      )
    ).then(() => args);
  });
