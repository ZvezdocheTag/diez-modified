#!/usr/bin/env node
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

const {spawnSync} = require('child_process');
const {resolve, join} = require('path');
const {copySync, existsSync, removeSync, mkdirpSync} = require('fs-extra');
const args = process.argv.slice(2);
const scriptIndex = args.findIndex((x) => x === 'start');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

switch (script) {
  case 'start': {
    const jsonPath = resolve('./tree.json');
    const searchIndexPath = resolve('./searchIndex.json');
    const app = resolve(__dirname, '..');
    const assets = join(app, 'dist', 'assets');
    const httpServer = require.resolve('http-server');
    const httpServerBin = resolve(httpServer, '..', '..', 'bin', 'http-server');

    copySync(jsonPath, join(assets, 'tree.json'));
    copySync(searchIndexPath, join(assets, 'searchIndex.json'));

    if (existsSync(resolve('./assets/'))) {
      copySync(resolve('./assets/'), assets);
    }
    const result = spawnSync(
      'node',
      [httpServerBin, 'dist/', '--proxy', 'http://localhost:8080?'],
      {stdio: 'inherit', cwd: app},
    );
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.',
        );
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.',
        );
      }
      process.exit(1);
    }
    process.exit(result.status);
  }
  case 'build': {
    const outDir = 'dist';
    const builtApp = resolve(__dirname, '..', 'dist');
    const assets = join(builtApp, 'assets');
    const treeJsonPath = resolve('./tree.json');
    const searchIndexPath = resolve('./searchIndex.json');
    removeSync(outDir);
    mkdirpSync(outDir);
    copySync(builtApp, outDir, {recursive: true});
    copySync(treeJsonPath, join(assets, 'tree.json'));
    copySync(searchIndexPath, join(assets, 'searchIndex.json'));
    console.log('\nBuild complete. The dist/ directory is ready to be deployed.');
    console.log('Check out deployment instructions at https://diez.org/releasing/docsgen.html\n');
    process.exit(0);
  }
  default:
    console.log('Unknown script "' + script + '".');
    break;
}
