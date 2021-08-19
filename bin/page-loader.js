#!/usr/bin/env node
import program from 'commander';
import main from '../index.js';

const currentDir = process.cwd();

program
  .version('0.0.1')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', currentDir)
  .action((url) => main(url, program.opts().output)
    .then((path) => {
      console.log(`Page was downloaded: ${path}`);
      // process.exit(0);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    }));

program.parse(process.argv);
