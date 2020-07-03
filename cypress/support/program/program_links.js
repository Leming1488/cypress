const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const common = require('../../fixtures/program/input/common.json');
const tools_types = require('../../fixtures/program/input/tools_types.json');

Cypress.Commands.add('programLinks', data => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/offers/121/common*', common).as('getCommon');
  cy.route('GET', '/api/offers/121/tools_types*', tools_types).as('getTypes');
  cy.route('GET', '/api/offers/121/tools/links*', data).as('getLinks');

  cy.visit(`/programs/121/tools/links`, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/programs/121/tools/links');

  cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getTypes', '@getLinks']);
});
