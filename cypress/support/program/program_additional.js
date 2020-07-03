const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const common = require('../../fixtures/program/input/common.json');

Cypress.Commands.add('programAdditional', additional => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/offers/91/common*', common).as('getCommon');
  cy.route('GET', '/api/offers/91/additional*', additional).as('getAdditional');

  cy.visit(`/programs/91/additional`, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/programs/91/additional');

  cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getAdditional']);
});
