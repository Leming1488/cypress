require('cypress-plugin-retries');
const addContext = require('mochawesome/addContext');


let count = 0;

Cypress.on('test:after:run', (test) => {
  if (test.state === 'failed') {
    count = count + 1;
    const screenshotFileName = `file${count}-failed.png`;
    addContext({ test }, `assets/${Cypress.spec.name}/${screenshotFileName}`);
  }
});
