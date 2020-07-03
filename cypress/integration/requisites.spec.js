const payment_infos = require('../fixtures/finance/requisites/input/payment_infos.json');
const tableDataOutput = require('../fixtures/finance/requisites/output/table_data.json');
const currentRequisite = require('../fixtures/finance/requisites/output/wire_transfer_rus.json');

describe('Requisites', function() {
  describe('Переходим в раздел реквизитов без существующих реквизитов', function() {
    before(function() {
      cy.clearCookies();
      cy.requisites(payment_infos.empty_value);
    });

    it('Видим welcome page c кнопкой ссылкой', () => {
      cy.get('[data-cy=requisites-welcome-page] > a');
    });
  });

  describe('Переходим в раздел реквизитов c имеющимися реквизитами', function() {
    before(function() {
      cy.clearCookies();
      cy.requisites(payment_infos.not_empty_value);
    });

    it('видим текущие реквизиты и они заполнены', () => {
      cy.get('[data-cy=curent-requisite]');

      Object.keys(currentRequisite).forEach(field => {
        cy.get(`[data-cy=curent-requisite-type-${field}]`).should(
          'have.text',
          `${currentRequisite[field]}`
        );
      });
    });

    it('видим историю изменения реквизитов', () => {
      cy.get('[data-cy=requisites-history]');

      tableDataOutput.forEach((item, index) => {
        cy.get(`[data-cy=requisites-history] tbody tr:eq(${index}) td:eq(0) span`).should('have.class', `type__logo--${item.type}`);
        cy.get(`[data-cy=requisites-history] tbody tr:eq(${index}) td:eq(1)`).should('include.text', item.min_payout);
        cy.get(`[data-cy=requisites-history] tbody tr:eq(${index}) td:eq(2)`).should('have.text', item.updated_at);
      });
    });

    it('Можем раскрыть подробную информацию в таблице реквизитов', () => {
      cy.get('[data-cy=requisites-history]');

      cy.get('[data-cy=requisites-history] tbody tr:eq(0)').click({ force: true });

      Object.keys(tableDataOutput[0].expanded).forEach(key => {
        cy.get(`[data-cy=requisites-history] tbody tr:eq(1) td .expander_${key}_value`).should('have.text', tableDataOutput[0].expanded[key]);
      })
    });
  });
});
