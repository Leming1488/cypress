require('cypress-plugin-retries');
const addContext = require('mochawesome/addContext');

import './header/balances';
import './dashboard/dashboard';
import './dashboard/dashboard_news';
import './programs/programs';
import './program/program_news';
import './program/program_additional';
import './program/program_links';
import './program/program_stats_actions';
import './program/program_links_generator';
import './statistics/statistics_actions';
import './payments/payments';
import './requisites/requisites';
import './user/profile_edit';
import './user/login';
import './all_tools/all_tools';
import './courses/courses';
import './services/services';

let count = 0;

Cypress.on('test:after:run', (test) => {
  if (test.state === 'failed') {
    count = count + 1;
    const screenshotFileName = `file${count}-failed.png`;
    addContext({ test }, `assets/${Cypress.spec.name}/${screenshotFileName}`);
  }
});
