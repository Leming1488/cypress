const additional = require('../../fixtures/program/input/additional.json');
const common = require('../../fixtures/program/input/common.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

describe('Program additional page', function () {
  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.programAdditional(additional);

      cy.get('[data-cy=program_additional]').should('exist');
    });

    it('Показывается правильный текст', () => {
      cy.get('[data-cy=program_additional]').contains(additional.additional_data);
    });
  });

  describe('Ошибка получения данных', () => {
    before(() => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
      cy.route('GET', '/api/offers/91/common*', common).as('getCommon');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/offers/91/additional*',
        response: additional,
        status: 500
      }).as('getAdditional');

      cy.clearCookies();

      cy.visit(`/programs/91/additional`, {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/91/additional');

      cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getAdditional']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });
  });
});
