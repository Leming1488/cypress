const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add('payments', (payments, actions, payment_infos) => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getUserInfo');
  cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');

  cy.route('GET', '/api/payments*', payments).as('getPayments');
  cy.route('GET', '/api/payment_infos/73521*', payment_infos).as('getPaymentInfo');
  cy.route('GET', '/api/payments/d7fe9880-aec5-4245-addd-cf5bd99eb0b8/actions*', actions).as('getPaymentActions');

  cy.visit('/finance/payments', {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  cy.url().should('include', '/finance/payments');

  cy.wait(['@getPayments', '@getPaymentActions', '@getPaymentInfo', '@getUserInfo', '@getBalance']);
});
