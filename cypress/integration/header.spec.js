const usersBalances = require('../fixtures/users/input/balances.json');

const welcome_bonus = { id: 1, currency: 'usd', bonus_amount: 25, payment_threshold: 50 };
const total_earnings_in_currency = { rub: 0, usd: 51, eur: 0 };

describe('Header', () => {
  describe('Нет данных', () => {
    before(() => {
      cy.clearCookies();
      cy.balances(usersBalances.zero_values);
    });

    it('не ломается с null и 0', () => {
      cy.get('[data-cy=headerUserBalance] a').should('contain', '0 ₽');
      cy.get('[data-cy=headerUserPayout] a').should('contain', '0 ₽');
    });

    it('Бонусного баланса нет', () => {
      cy.get('[data-cy="headerUserBonus"]').should('not.exist');
    });
  });

  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.balances({ ...usersBalances.non_zero_values, welcome_bonus }, '/programs');
    });

    describe('Баланс', () => {
      it('Форматированный баланс', () => {
        cy.get('[data-cy=headerUserBalance]').should('exist');
        cy.get('[data-cy=headerUserBalanceValue]').should('contain', '26 010.62 ₽');
      });

      it('Форматированный доход', () => {
        cy.get('[data-cy=headerUserPayout]').should('exist');
        cy.get('[data-cy=headerUserPayoutValue]').should('contain', '26 010.62 ₽');
      });

      it('Форматированный бонус', () => {
        cy.get('[data-cy="headerUserBonus"]').should('exist');
        cy.get('[data-cy=headerUserBonusValue]').should('contain', '25 $');
      });

      it('У бонуса есть тултип подсказки', () => {
        cy.get('[data-cy=headerUserBonusTooltip]').should('exist');
      });
    });

    describe('Ссылки', () => {
      it('Правильные сылки на баланс', () => {
        cy.get('[data-cy=headerUserBalanceValue]').should('have.attr', 'href', '/finance/balance');
        cy.get('[data-cy=headerUserPayoutValue]').should('have.attr', 'href', '/finance/balance');
      });

      it('Cтроится правильная ссылка на блог', () => {
        cy.get('[data-cy=headerNavBlog]').should('have.attr', 'target', '_blank');
      });

      it('Cтроится правильная ссылка на zendesk', () => {
        cy.get('[data-cy=headerNavSupport]').should('have.attr', 'target', '_blank');
      });
    });

    describe('Хлебные крошки', () => {
      it('Тайтл показывается', () => {
        cy.get('[data-cy=headerTitle').should('exist');
      });

      it('Хлебные крошки показываются', () => {
        cy.get('[data-cy=headerBreadcrumbs] > li').should('have.length', 2);
      });

      it('У первого элемента хлебных крошек есть ссылка', () => {
        cy.get('[data-cy=headerBreadcrumbs] li:eq(0) a').should('have.attr', 'href', '/');
      });
    });

    describe('Меню пользователя', () => {
      it('email подставляется правильно', () => {
        cy.get('[data-cy=headerUserEmail]').should('contain', 'affiliate@aviasales.ru');
      });

      it('id подставляется правильно', () => {
        cy.get('[data-cy=headerUserID]').should('contain', 'ID 11501');
      });
    });

    it('Серверное время', () => {
      cy.get('[data-cy=headerTime]').then($el => {
        expect($el.text()).to.be.not.empty;
      });
    });
  });

  describe('Модалка получения бонуса', () => {
    before(() => {
      cy.clearCookies();

      cy.balances({ ...usersBalances.non_zero_values, total_earnings_in_currency, welcome_bonus });
      cy.get('[data-cy=modal__bonus_reached]').should('exist');
    });

    it('Выводится правильный бонус к получению', () => {
      cy.get('[data-cy=bonus_reached__amount]').should('contain', '25 $');
    });

    it('По клику на кнопку уходит запрос и данные обновляются', () => {
      cy.server();

      cy.route({
        method: 'POST',
        url: '/api/balances/redeem_welcome_bonus*',
        response: {},
        delay: 500,
        status: 200
      }).as('redeem');

      cy.get('[data-cy=bonus_reached__button]').click();

      cy.wait(['@redeem']);

      cy.get('[data-cy=modal__bonus_reached]').should('not.exist');
      cy.get('[data-cy="headerUserBonus"]').should('not.exist');
    });
  });
});
