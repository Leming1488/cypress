const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const common = require('../../fixtures/program/input/common.json');

Cypress.Commands.add('programNews', news => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/dashboard/news*', news).as('getNews');
  cy.route('GET', '/api/offers/91/common*', common).as('getCommon');

  cy.visit(`/programs/91/news`, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/programs/91/news');

  cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getNews']);
});
