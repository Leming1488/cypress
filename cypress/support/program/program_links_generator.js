const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const common = require('../../fixtures/program/input/common.json');
const tools_types = require('../../fixtures/program/input/tools_types.json');

Cypress.Commands.add('programLinksGenerator', generator => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/offers/91/common*', common).as('getCommon');
  cy.route('GET', '/api/offers/91/tools_types*', tools_types).as('getToolsTypes');
  cy.route('GET', '/api/offers/91/tools/generator_links*', generator).as('getLinksGenerator');

  cy.visit(`/programs/91/tools/links_generator`, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/programs/91/tools/links_generator');

  cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getToolsTypes', '@getLinksGenerator']);
});
