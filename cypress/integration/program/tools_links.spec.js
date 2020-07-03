const common = require('../../fixtures/program/input/common.json');
const tools_types = require('../../fixtures/program/input/tools_types.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const linksInput = require('../../fixtures/program/input/links.json');
const linksOutput = require('../../fixtures/program/output/links.json');

const { columns } = linksOutput;
const rowsCount = linksInput.not_zero_values.links.length;

describe('Program - Tools - Links', function () {
  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.programLinks(linksInput.not_zero_values);

      cy.get('[data-cy=program_links]').should('exist');
    });

    describe('Общее отображение', () => {
      it('Подсвечен правильный пункт меню', () => {
        cy.get('[data-cy=tools_submenu_links]').should('have.class', 'active');
      });

      it('Есть уведомление об особенностях ссылок', () => {
        cy.get('[data-cy=program_links_notification]').should('exist');
      });
    });

    describe('Таблица', () => {
      it('Видим заголовки колонок', () => {
        columns.forEach(key => {
          cy.get(`[data-cy=table] thead th.table-cell--${key}`).should('exist');
        });
      });

      it('Видим строки таблицы', () => {
        columns.forEach(key => {
          cy.get(`[data-cy=table] tbody tr:first-child td.table-cell--${key}`).should('exist');
        });
      });

      it(`Видим что количество строк таблицы равно ${rowsCount}`, () => {
        cy.get('[data-cy=table] tbody tr').its('length').should('be', rowsCount);
      });

      it('У каждой строки есть кнопка "скопировать ссылку"', () => {
        cy.get('[data-cy=program_links_button_copy]').should('have.length', rowsCount);
      });
    });

    describe('Модалка', () => {
      const value = 'SUB_ID_TEST';

      it('Открываем модалку создания ссылки для первой строки', () => {
        cy.get('[data-cy=table] tbody tr:first-child [data-cy=program_links_button_modal]').click();
        cy.get('[data-cy=modal__program_links_create_link_modal]').should('exist');
      });

      it('Есть поле "sub_id" и оно изменяемое', () => {
        cy.get('[data-cy=program_links_modal__sub_id]').type(`{selectall}${value}`);
      });

      it('Есть поле "адрес целевой страницы" и оно не редактируемое', () => {
        cy.get('[data-cy=program_links_modal__target]').should('have.attr', 'disabled');
      });

      it('Есть поле "партнёрская ссылка" и оно только для чтения', () => {
        cy.get('[data-cy=program_links_modal__link]').should('have.attr', 'readonly');
      });

      it('У поля "партнёрская ссылка" есть кнопка скопировать', () => {
        cy.get('[data-cy=program_links_modal__link-button] .copy').should('exist');
      });

      it('При изменении поля "sub_id" - меняется содержимое поля "партнёрская ссылка"', () => {
        expect(Cypress.$('[data-cy=program_links_modal__link]').val()).to.contain(value);
      });

      it('Модалка закрывается', () => {
        cy.get('[data-cy=modal-close]').click();
        cy.get('[data-cy=modal__program_links_create_link_modal]').should('not.exist');
      })
    });

    describe('Фильтры', () => {
      describe('Базовое отображение', () => {
        it('Есть фильтр по названию', () => {
          cy.get('[data-cy=filter_item__title]').should('exist');
        });

        it('Есть фильтр по языку', () => {
          cy.get('[data-cy=filter_item__language]').should('exist');
        });

        it('Нет кнопки "Применить"', () => {
          cy.get('[data-cy=filtersButtonApply]').should('not.exist');
        });

        it('Нет кнопки "Сбросить"', () => {
          cy.get('[data-cy=filtersButtonReset]').should('not.exist');
        });
      });

      describe('Работоспособность фильтров', () => {
        describe('Поле "Поиск"', () => {
          const value = 'Homepage';

          it('Поле изменяется', () => {
            cy.get(`[data-cy=filter_item__title__input]`).type(value);
            cy.get(`[data-cy=filter_item__title__input]`).should('have.value', value);
          });

          it('Список фильтруется в соответствии с измененным полем', () => {
            cy.get('[data-cy=table] tbody tr').each($el => {
              expect($el.find('.table-cell--title').text()).contain(value);
            });
          });

          it('Если очистить поле, покажется список по умолчанию', () => {
            cy.get(`[data-cy=filter_item__title__input]`).clear();
            cy.get('[data-cy=table] tbody tr').should('have.length', rowsCount);
          });
        });

        describe('Выбор языка', () => {
          const value = 'ru';

          it('Поле изменяется', () => {
            cy.get(`[data-cy=filter_item__language__select_single]`)
              .click()
              .find('label')
              .eq(1)
              .click();

            cy.get(`[data-cy=filter_item__language__select_single-input-value]`).should('have.value', value);
          });

          it('Список фильтруется в соответствии с измененным полем', () => {
            cy.get('[data-cy=table] tbody tr').each($el => {
              expect($el.find('.table-cell--language').text()).contain(value.toUpperCase());
            });
          });
        });
      });
    });
  });

  describe('Нет данных', () => {
    before(() => {
      cy.clearCookies();
      cy.programLinks(linksInput.zero_values);

      cy.get('[data-cy=program_links]').should('exist');
    });

    it('Подсвечен правильный пункт меню', () => {
      cy.get('[data-cy=tools_submenu_links]').should('have.class', 'active');
    });

    it('Нет уведомления об особенностях ссылок', () => {
      cy.get('[data-cy=program_links_notification]').should('not.exist');
    });

    it('Нет фильтров', () => {
      cy.get('[data-cy=filters]').should('not.exist');
    });

    it('Есть уведомление об отсутствующих данных', () => {
      cy.get('[data-cy=program_links] .table-no_data__wrapper').should('exist');
    });
  });

  describe('Ошибка получения данных', () => {
    before(() => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
      cy.route('GET', '/api/offers/121/common*', common).as('getCommon');
      cy.route('GET', '/api/offers/121/tools_types*', tools_types).as('getTypes');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/offers/121/tools/links*',
        response: linksInput.zero_values,
        status: 500
      }).as('getLinks');

      cy.clearCookies();

      cy.visit(`/programs/121/tools/links`, {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/121/tools/links');

      cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getTypes', '@getLinks']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });

    it('Нет фильтров', () => {
      cy.get('[data-cy=filters]').should('not.exist');
    });

    it('Есть уведомление об отсутствующих данных', () => {
      cy.get('[data-cy=program_links] .table-no_data__wrapper').should('exist');
    });
  });
});
