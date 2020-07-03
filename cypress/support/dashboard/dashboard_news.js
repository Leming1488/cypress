const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('dashboardNews', news => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
  cy.route('GET', '/api/dashboard/news*', news).as('getNews');

  cy.visit('/dashboard/news', {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });
  cy.url().should('include', '/dashboard/news');
  cy.wait(['@getNews']);
});
