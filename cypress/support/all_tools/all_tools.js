const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('allTools', payload => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/tools/airtable*', payload).as('allTools');

  cy.visit('/all_tools', {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/all_tools');

  cy.wait(['@getInfo', '@getBalance', '@allTools']);
});
