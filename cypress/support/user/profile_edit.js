const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('profileEdit', (profile, path = '/profile/info') => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/profile*', profile).as('getProfileInfo');

  cy.visit(path, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/profile/info');

  cy.wait(['@getInfo', '@getBalance', '@getProfileInfo']);
});
