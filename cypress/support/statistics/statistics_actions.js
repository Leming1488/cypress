const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('statisticsActions', (campaignsActions, path = '/statistics/actions') => {
  cy.server();
  cy.route('GET', '/api/statistics/campaigns_actions*', campaignsActions).as('actions');
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.visit(path, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', path);

  cy.wait(['@getInfo', '@actions', '@getBalance']);
  cy.get('[data-cy=stats_actions]');
});
