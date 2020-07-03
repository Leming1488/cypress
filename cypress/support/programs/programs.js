const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('programs', (offersList) => {
  cy.server();
  cy.route('GET', '/api/offers*', offersList).as('offers');
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');

  cy.visit('/programs', {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/programs');

  cy.wait(['@getInfo', '@offers', '@getBalance']);
  cy.get('[data-cy=programs]');
});
