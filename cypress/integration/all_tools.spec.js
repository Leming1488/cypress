const inputAllTools = require('../fixtures/all_tools/input/all_tools.json');
const outputAllTools = require('../fixtures/all_tools/output/all_tools.json');
const outputChromeExt = require('../fixtures/all_tools/output/chrome_extention.json');
const usersInfo = require('../fixtures/users/input/users_info.json');
const usersBalances = require('../fixtures/users/input/balances.json');

describe('All Tools', function() {
  describe('Есть данные', function() {
    before(function() {
      cy.clearCookies();
      cy.allTools(inputAllTools);
    });

    it(`Видим элементов = ${inputAllTools.records.length}`, () => {
      cy.get('[data-cy^=all_tools__item--]').should('have.length', inputAllTools.records.length);
    });

    outputAllTools.forEach(item => {
      describe(`Элемент "${item.title}"`, () => {
        beforeEach(() => {
          cy.get(`[data-cy=all_tools__item--${item.key}]`).as('card');
        });

        it(`Лейбл${item.badge_name ? ' есть' : 'а нет'}`, () => {
          cy.get('@card').find('[data-cy=all_tools__item-badge]').should(item.badge_name ? 'exist' : 'not.exist');
        });

        it('Правильный заголовок', () => {
          cy.get('@card').find('[data-cy=all_tools__item-title]').should('have.text', item.title);
        });

        it('Правильное описание', () => {
          cy.get('@card').find('[data-cy=all_tools__item-description]').should('have.text', item.description);
        });

        it(`${item.external_link && item.external_button ? 'Внешняя ссылка есть' : 'Внешней ссылки нет'}`, () => {
          cy.get('@card').find('[data-cy=all_tools__item-external]').should(item.external_link && item.external_button ? 'exist' : 'not.exist');
        });

        if (item.external_link && item.external_button) {
          it('Внешняя ссылка открывается в новом окне', () => {
            cy.get('@card').find('[data-cy=all_tools__item-external]').should('have.attr', 'target', '_blank');
          });
        }

        it('Есть html список преимуществ', () => {
          cy.get('@card').find('[data-cy=all_tools__item-features]').should('have.html', item.features);
        });

        it('Есть кнопка "подробнее"', () => {
          cy.get('@card').find('[data-cy=all_tools__item-button]').should('have.text', item.button_text);
        });

        it('У кнопки "подробнее" правильная ссылка', () => {
          cy.get('@card').find('[data-cy=all_tools__item-button]').should('have.attr', 'href', item.button_link);
        });

        if (item.button_link.includes('http')) {
          it('Кнопка "подробнее" открывается в новом окне', () => {
            cy.get('@card').find('[data-cy=all_tools__item-button]').should('have.attr', 'target', '_blank');
          });
        }
      });
    });

    describe(`Элемент "Расширение для Chrome"`, () => {
      beforeEach(() => {
        cy.get(`[data-cy=all_tools__item--${outputChromeExt.key}]`).as('card');
      });

      it('Лейбла нет', () => {
        cy.get('@card').find('[data-cy=all_tools__item-badge]').should('not.exist');
      });

      it('Правильный заголовок', () => {
        cy.get('@card').find('[data-cy=all_tools__item-title]').should('have.text', outputChromeExt.title);
      });

      it('Правильное описание', () => {
        cy.get('@card').find('[data-cy=all_tools__item-description]').should('have.html', outputChromeExt.description);
      });

      it('Внешней ссылки нет', () => {
        cy.get('@card').find('[data-cy=all_tools__item-external]').should('not.exist');
      });

      it('Нет списка преимуществ', () => {
        cy.get('@card').find('[data-cy=all_tools__item-features]').should('not.exist');
      });

      it('Есть кнопка "подробнее"', () => {
        cy.get('@card').find('[data-cy=all_tools__item-button]').should('have.text', outputChromeExt.button_text);
      });

      it('У кнопки "подробнее" правильная ссылка', () => {
        cy.get('@card').find('[data-cy=all_tools__item-button]').should('have.attr', 'href', outputChromeExt.button_link);
      });

      it('Кнопка "подробнее" открывается в новом окне', () => {
        cy.get('@card').find('[data-cy=all_tools__item-button]').should('have.attr', 'target', '_blank');
      });
    });
  });

  describe('Нет данных', () => {
    before(() => {
      cy.clearCookies();
      cy.allTools({ records: [] });
    });

    it('Видим ламу с текстом "нет данных"', () => {
      cy.get('[data-cy=all_tools__empty]').should('exist');
    });
  });

  describe('Ошибка получения данных', () => {
    before(() => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/tools/airtable*',
        response: inputAllTools,
        status: 500
      }).as('allTools');

      cy.clearCookies();

      cy.visit('/all_tools', {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/all_tools');

      cy.wait(['@getInfo', '@getBalance', '@allTools']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });

    it('Видим ламу с текстом "нет данных"', () => {
      cy.get('[data-cy=all_tools__empty]').should('exist');
    });
  });
});
