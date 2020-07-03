// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
const fs = require('fs');
const path = require('path');
let count = 0;

module.exports = (on, _) => {
  // ref: https://docs.cypress.io/api/plugins/browser-launch-api.html#Usage
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-dev-shm-usage');
      return launchOptions;
    }

    return launchOptions;
  });

  on('after:screenshot', details => {
    count = count + 1;
    const dirName = path.dirname(details.path);
    const extName = path.extname(details.path);
    const newPath = path.format({
      root: '/',
      dir: dirName,
      base: `file${count}-failed.png`,
      ext: extName
    });
    return new Promise((resolve, reject) => {
      fs.rename(details.path, newPath, err => {
        if (err) return reject(err);
        resolve({ path: newPath });
      });
    });
  });
};
