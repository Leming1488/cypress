const payments = require('../fixtures/finance/payments/input/payments.json');
const actions = require('../fixtures/finance/payments/input/actions.json');
const payment_infos = require('../fixtures/finance/payments/input/payment_infos.json');
const actionDetails = require('../fixtures/statistics/input/action_details.json');

const outputExpectedPayments = require('../fixtures/finance/payments/output/payments.json');

const { defaultColumns, rowsCount, formattedCells } = outputExpectedPayments;

describe('Payments', () => {
  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.payments(payments.not_zero_values, actions.not_zero_values, payment_infos.wire_transfer_rus);

      cy.get('[data-cy=payments-data]').should('exist');
    });

    describe('Алерт про даты выплат', () => {
      it('Видим алерт, куки у пользователя нет', () => {
        cy.getCookie('hide_payment_alert').should('not.exist');
        cy.get('[data-cy=payments-alert_block]');
      });

      it('При клике на кнопку, алерт скрывается и больше не показывается', () => {
        cy.getCookie('hide_payment_alert').should('not.exist');
        cy.get('[data-cy=payments-data]');

        cy.get('[data-cy="payments-alert-action_button"]').click();

        cy.getCookie('hide_payment_alert').should('exist');
        cy.get('[data-cy="payments-alert_block"]').should('not.exist');

        cy.payments(payments.not_zero_values, actions.not_zero_values, payment_infos.wire_transfer_rus);

        cy.getCookie('hide_payment_alert').should('exist');
        cy.get('[data-cy="payments-alert_block"]').should('not.exist');
      });
    });

    describe('Слайдер по месяцам', () => {
      it.skip('Позитивная проверка: видим PaymentsSwitcher с тем кол-вом выплат, которые было у пользователя', () => { });
      it.skip('Содержимое: по умолчанию первый таб активный за последнюю выплату в нем есть инфа по дате выплаты и сколько было выплаченно, а в урле его uuid', () => { });
      it.skip('Взаимодействие: при клики на любой таб, меняется активный таб и информация в подробной инфе и детализации', () => { });
    });

    describe('Инфа про конкретную выплату', () => {
      it.skip('Позитивная проверка: видим строку относящуюся к последнюю выплате ', () => { });
      it.skip('Содержимое: строка про выплату содержит такую же сумму, дата выплата соответсвует месяцу выплаты, есть поля реквезиты и комментарии', () => { });
      it.skip('Взаимодействие: строка раскрывается и пользователь видит подробную инфу про реквезиты', () => { });
    });

    describe('Таблица', () => {
      beforeEach(() => {
        cy.get('[data-cy=payments-data] table').as('paymentsTable');
      });

      it('Заголовки колонок', () => {
        defaultColumns.forEach(key => {
          cy.get('@paymentsTable').get(`thead th.table-cell--${key}`);
        });
      });

      it('Строки таблицы', () => {
        defaultColumns.forEach(key => {
          cy.get('@paymentsTable').get(`tbody tr:first-child td.table-cell--${key}`);
        });
      });

      it(`Количество строк таблицы равно ${rowsCount}`, () => {
        cy.get('@paymentsTable').get('tbody tr').its('length').should('be', rowsCount);
      });

      it('Колонка кампаний, у ячейки есть лого и название кампании', () => {
        cy.get('@paymentsTable').get('.cell_campaign__link:eq(0)').as('campaignLink');
        cy.get('@campaignLink').children('img').should('have.attr', 'src').and('include', formattedCells.campaign.src);
        cy.get('@campaignLink').children('span').should('have.text', formattedCells.campaign.name);
      });

      it('Колонка кампаний, ссылка ведет на статистику кампании', () => {
        cy.get('@paymentsTable').get('.cell_campaign__link:eq(0)').should('have.attr', 'href').and('include', formattedCells.campaign.href);
      });

      it('Колонка ID действия; по клику на ID открывается модалка', () => {
        cy.server();
        cy.route({
          method: 'GET',
          mode: 'cors',
          credentials: 'same-origin',
          url: 'api/statistics/action_details*',
          response: actionDetails
        }).as('getActionDetails');

        cy.get('@paymentsTable').get('.cell__booking_id:eq(0)').click();

        cy.wait(['@getActionDetails']);

        cy.get('.modal-container--program_action_modal').should('be.visible');
      });
    });

    describe('Получатель платежа российское юр. лицо', () => {
      it('Ссылка на скачивание акта', () => {
        cy.get('[data-cy=payments-act]').should('exist');
      });

      it('Видим запятую', () => {
        cy.get('[data-cy=payments-comma]').should('exist');
      });

      it('Ссылка на скачивание счёта', () => {
        cy.get('[data-cy=payments-invoice]').should('exist');
      });

      it('Ссылка на скачивание счёта заканчивается на /invoice.pdf', () => {
        cy.get('[data-cy=payments-invoice]').then($el => {
          expect($el.attr('href')).to.match(/\/invoice.pdf/)
        });
      });
    });

    describe('Получатель платежа не российское юр. лицо', () => {
      before(() => {
        cy.payments(payments.not_zero_values, actions.not_zero_values, payment_infos.yandex_money);
      });

      it('Не видим ссылку на скачивание акта', () => {
        cy.get('[data-cy=payments-act]').should('not.exist');
      });

      it('Не видим запятую', () => {
        cy.get('[data-cy=payments-comma]').should('not.exist');
      });

      it('Видим ссылку на скачивание счёта', () => {
        cy.get('[data-cy=payments-invoice]').should('exist');
      });

      it('Урл ссылки на скачивание счёта заканчивается на /generic_invoice.pdf', () => {
        cy.get('[data-cy=payments-invoice]').then($el => {
          expect($el.attr('href')).to.match(/\/generic_invoice.pdf/)
        });
      });
    });
  });
});
