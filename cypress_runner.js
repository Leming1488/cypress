const cypress = require('cypress');
const yargs = require('yargs');
const { merge } = require('mochawesome-merge');
const marge = require('mochawesome-report-generator');
const rm = require('rimraf');
const ls = require('ls');

const cypressConfig = require('./cypress');

const argv = yargs.options({
  'browser': {
    alias: 'b',
    describe: 'choose browser that you wanna run tests on',
    default: 'chrome',
    choices: ['chrome', 'electron']
  },
  'spec': {
    alias: 's',
    describe: 'run test with specific spec file',
    default: 'cypress/integration/**/*.spec.js'
  }
}).help().argv;

const reportDir = cypressConfig.reporterOptions.reportDir;
const reportFiles = `${reportDir}/*.json`;

const red = '\u001b[31m';
const blue = '\u001b[34m';
const reset = '\u001b[0m';

async function runTests() {
  const timeStart = new Date().getTime();

  // delete all existing report files
  console.log(`${blue}1. Delete old existing report files${reset}`);

  await ls(reportFiles, { recurse: true }, file => {
    console.log(`  ${red}removed:${reset} ${file.full}`)
  });

  await rm(reportFiles, (error) => {
    if (error) {
      console.error(`Error while removing existing report files: ${error}`);
      process.exit(1);
    }
  });

  console.log(`${blue}2. All existing report files removed successfully!${reset}`);

  console.log(`${blue}3. Run Cypress tests${reset}`);

  const results = await cypress.run({
    browser: argv.browser,
    spec: argv.spec,
    headless: true
  });

  const reportDir = results.config.reporterOptions.reportDir;

  console.log(`${blue}4. Generate reports from:${reset} ${reportDir}`);

  const report = await merge({ files: [`${reportDir}/*.json`] });
  await marge.create(report, { reportDir });

  const timeEnd = new Date().getTime();

  let totalTime = (timeEnd - timeStart) / 1000;

  console.log(`${blue}5. Finished.${reset} Total time: ${totalTime.toFixed(2)} sec.`);

  await process.exit(results.totalFailed);
}

runTests();

