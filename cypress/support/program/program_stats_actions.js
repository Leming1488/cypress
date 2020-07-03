const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const campaingCommon = require('../../fixtures/program/input/common.json');

Cypress.Commands.add('programStatsActions', (campaignsActions, path = '/programs/100/stats/actions') => {
  cy.server();
  cy.route('GET', '/api/users/info*', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/statistics/campaign_actions*', campaignsActions).as('actions');
  cy.route('GET', '/api/offers/100/common*', campaingCommon).as('common');

  cy.visit(path, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', path);

  cy.wait(['@getInfo', '@actions', '@getBalance', '@common']);
});
