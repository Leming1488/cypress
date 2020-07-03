const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('requisites', payment_infos => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/payment_infos*', payment_infos).as('payment_infos');

  cy.visit('/finance/requisites', {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/finance/requisites');

  cy.wait(['@getInfo', '@getBalance', '@payment_infos']);
});
