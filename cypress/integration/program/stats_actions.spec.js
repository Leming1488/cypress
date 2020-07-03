const campaingCommon = require('../../fixtures/program/input/common.json');
const statisticsActions = require('../../fixtures/program/input/stats_actions.json');
const statisticsActionsZero = require('../../fixtures/program/input/stats_actions_zero.json');
const outputExpectedActions = require('../../fixtures/program/output/stats_actions.json');
const actionDetails = require('../../fixtures/statistics/input/action_details.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

const { defaultColumns, dropdownList, rowsCount, totals, formattedCells } = outputExpectedActions;

describe('Program Stats Actions', function () {
  describe('Ошибка получения данных', () => {
    before(() => {
      cy.server();

      cy.route('GET', '/api/users/info*', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current*', usersBalances.non_zero_values).as('getBalance');
      cy.route('GET', '/api/offers/100/common*', campaingCommon).as('common');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/statistics/campaign_actions*',
        response: statisticsActionsZero,
        status: 500
      }).as('actions');

      cy.clearCookies();

      cy.visit('/programs/100/stats/actions', {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/100/stats/actions');

      cy.wait(['@getInfo', '@getBalance', '@common', '@actions']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });

    it('Не видим фильтры', () => {
      cy.get('[data-cy=filters]').should('not.exist');
    });

    it('Видим уведомление, что данных нет', () => {
      cy.get('[data-cy=stats_actions] .table-no_data__wrapper').should('exist');
    });

    it('Не видим постраничную навигацию', () => {
      cy.get('[data-cy=pagination]').should('not.exist');
    });
  });

  describe('Нет данных', () => {
    before(() => {
      cy.clearCookies();
      cy.programStatsActions(statisticsActionsZero);
    });

    it('Видим фильтры', () => {
      cy.get('[data-cy=filters]').should('exist');
    });

    it('Видим уведомление, что данных нет', () => {
      cy.get('[data-cy=stats_actions] .table-no_data__wrapper').should('exist');
    });

    it('Не видим постраничную навигацию', () => {
      cy.get('[data-cy=pagination]').should('not.exist');
    });
  });

  describe('Есть данные', () => {
    describe('Таблица', () => {
      before(() => {
        cy.clearCookies();
        cy.programStatsActions(statisticsActions);
      });

      beforeEach(() => {
        cy.get('[data-cy=stats_actions] table').as('statTable');
      });

      it('Видим заголовки колонок', () => {
        defaultColumns.forEach(key => {
          cy.get('@statTable').get(`thead th.table-cell--${key}`);
        });
      });

      it('Видим строки таблицы', () => {
        defaultColumns.forEach(key => {
          cy.get('@statTable').get(`tbody tr:first-child td.table-cell--${key}`);
        });
      });

      it(`Видим что количество строк таблицы равно ${rowsCount}`, () => {
        cy.get('@statTable').get('tbody tr').its('length').should('be', rowsCount);
      });

      it('Видим строку с правильным ИТОГО', () => {
        Object.keys(totals).forEach(key => {
          cy.get('@statTable').get(`.table-totals .table-cell--${key}`).should('have.text', totals[key]);
        });
      });

      it('Видим колонку описания; у нее есть тултип с полным описанием', () => {
        cy.get('@statTable').get('.cell__description:eq(0)').as('descriptionCell');
        cy.get('@descriptionCell').find('.tooltip').invoke('show').should('be.visible').and('have.text', formattedCells.description.text);
      });

      it('Видим колонку описания; по клику на "Открыть описание" - открывается модалка', () => {
        cy.server();
        cy.route({
          method: 'GET',
          mode: 'cors',
          credentials: 'same-origin',
          url: 'api/statistics/action_details*',
          response: actionDetails
        }).as('getActionDetails');

        cy.get('@statTable').get('.cell__description:eq(0)').as('descriptionCell');
        cy.get('@descriptionCell').find('.cell__description--button').invoke('show').click();

        cy.wait(['@getActionDetails']);

        cy.get('.modal-container--program_action_modal').should('be.visible');
      });
    });

    describe('Отображение колонок', () => {
      before(() => {
        cy.clearCookies();

        cy.programStatsActions(statisticsActions);
        cy.get('[data-cy=button_columns]').click();
      });

      it('В выпадающем списке есть элементы, выбранные пункты соответствуют колонкам', () => {
        dropdownList.forEach(key => {
          cy.get('[data-cy=button_columns-dropdown]')
            .get(`[data-cy=button_columns-dropdown--${key}] input:checkbox`).then($checkbox => {
              if ($checkbox.prop("checked")) {
                cy.get(`[data-cy=stats_actions] table thead tr th.table-cell--${key}`).should('exist');
              } else {
                cy.get(`[data-cy=stats_actions] table thead tr th.table-cell--${key}`).should('not.exist');
              }
            });
        });
      });

      it('Кликаем каждый чекбокс, в таблице соответственно меняется отображение колонок', () => {
        dropdownList.forEach(key => {
          cy.get('[data-cy=button_columns-dropdown]')
            .get(`[data-cy=button_columns-dropdown--${key}]`).click().then($button => {
              if ($button.find('input:checkbox').prop('checked')) {
                cy.get(`[data-cy=stats_actions] table thead tr th.table-cell--${key}`).should('exist');
              } else {
                cy.get(`[data-cy=stats_actions] table thead tr th.table-cell--${key}`).should('not.exist');
              }
            });
        });
      });

      it('Меняем видимость колонки, перезагружаем страницу и видим, что состояние сохранилось', () => {
        cy.clearCookies();
        cy.programStatsActions(statisticsActions);

        cy.get('[data-cy=button_columns]').click();

        cy.get(`[data-cy=button_columns-dropdown--${dropdownList[0]}]`).click();
        cy.get(`[data-cy=stats_actions] table thead tr th.table-cell--${dropdownList[0]}`).should('not.exist');

        cy.programStatsActions(statisticsActions);

        cy.get('[data-cy=stats_actions]').should('exist');
        cy.get(`[data-cy=stats_actions] table thead tr th.table-cell--${dropdownList[0]}`).should('not.exist');
      });
    });

    describe('Фильтры', () => {
      describe('Базовое отображение', () => {
        before(() => {
          cy.clearCookies();
          cy.programStatsActions(statisticsActions);

          cy.get('[data-cy=filters]').should('exist');
        });

        it('Фильтры строятся в нужном количестве', () => {
          statisticsActions.options.forEach(({ name }) => {
            cy.get(`[data-cy=filter_item__${name}]`).should('exist');
          })
        });

        it('Есть кнопка "Применить"', () => {
          cy.get('[data-cy=filtersButtonApply]').should('exist');
        });

        it('Кнопка "Сбросить" показывается только, если выбрано какое-нибудь значение', () => {
          const inputTypeField = statisticsActions.options.filter(({ type }) => type === 'value')[0];

          cy.get('[data-cy=filtersButtonReset]').should('not.exist');

          cy.get(`[data-cy=filter_item__${inputTypeField.name}__input`).type('{selectall}test');

          cy.get('[data-cy=filtersButtonReset]').should('exist');
        });

        it('Есть кнопка "Скачать CSV"', () => {
          cy.get('[data-cy=button_download_csv]').should('exist');
        });
      });

      describe('Работоспособность фильтров', () => {
        const routeProps = {
          method: 'GET',
          url: '/api/statistics/campaign_actions*',
          status: 200,
          onResponse: () => { }
        };

        describe('Выбор дат', () => {
          const fieldName = 'period';
          const todays = Cypress.moment();
          const displayDate = todays.format('DD.MM.YYYY');
          const queryDate = todays.format('YYYY-MM-DD');
          const expectedGetParams = `from=${queryDate}&until=${queryDate}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));
          const filter = clonedActions.options.find(({ name }) => name === fieldName);

          filter.current_value = {
            from: queryDate,
            until: queryDate
          };

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Даты выбираются', () => {
            cy.get(`[data-cy=filter_item__${fieldName}] [data-cy=datepicker]`).click();
            cy.get('[data-cy=DayPickerNav--Today]').click();

            cy.get(`[data-cy=filter_item__${fieldName}] [data-cy=datepicker] .input_element`).should('have.value', `${displayDate} – ${displayDate}`)
          });

          it('Уходит правильный запрос', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=filtersButtonApply]').click({ force: true });

            cy.wait(['@getActions']);
          });

          it('Применённая фильтрация отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });

          it('Применённая фильтрация влияет на url для CSV', () => {
            expect(Cypress.$('[data-cy=button_download_csv]').attr('href')).to.include(expectedGetParams)
          });
        });

        describe('Изменение SUB ID', () => {
          const fieldName = 'sub_id_1';
          const inputString = 'test_id';
          const expectedGetParams = `${fieldName}=${inputString}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));
          const filter = clonedActions.options.find(({ name }) => name === fieldName);

          filter.current_value = inputString;

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Поле изменяется', () => {
            cy.get(`[data-cy=filter_item__${fieldName}__input]`).type(inputString);
            cy.get(`[data-cy=filter_item__${fieldName}__input]`).should('have.value', inputString);
          });

          it('Уходит правильный запрос', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=filtersButtonApply]').click({ force: true });

            cy.wait(['@getActions']);
          });

          it('Применённая фильтрация отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });

          it('Применённая фильтрация влияет на url для CSV', () => {
            expect(Cypress.$('[data-cy=button_download_csv]').attr('href')).to.include(expectedGetParams)
          });
        });

        describe('Выбор статуса', () => {
          const fieldName = 'action_state';
          const pos = 0;
          const selectedValue = statisticsActions.options.find(({ name }) => name === fieldName).available_values[pos].value;
          const expectedGetParams = `${fieldName}=${selectedValue}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));
          const filter = clonedActions.options.find(({ name }) => name === fieldName);

          filter.current_value = selectedValue;

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Поле изменяется', () => {
            cy.get(`[data-cy=filter_item__${fieldName}__select_single]`)
              .click()
              .find('label')
              .eq(pos + 1)
              .click();

            cy.get(`[data-cy=filter_item__${fieldName}__select_single-input-value]`).should('have.value', `${selectedValue}`);
          });

          it('Уходит правильный запрос', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(`${fieldName}=${selectedValue}`);
              }
            }).as('getActions');

            cy.get('[data-cy=filtersButtonApply]').click({ force: true });

            cy.wait(['@getActions']);
          });

          it('Применённая фильтрация отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });

          it('Применённая фильтрация влияет на url для CSV', () => {
            expect(Cypress.$('[data-cy=button_download_csv]').attr('href')).to.include(expectedGetParams)
          });
        });

        describe('Выбор хоста', () => {
          const fieldName = 'host';
          const pos = 0;
          const selectedValue = statisticsActions.options.find(({ name }) => name === fieldName).available_values[pos].value;
          const expectedGetParams = `${fieldName}=${selectedValue}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));
          const filter = clonedActions.options.find(({ name }) => name === fieldName);

          filter.current_value = selectedValue;

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Поле изменяется', () => {
            cy.get(`[data-cy=filter_item__${fieldName}__select_single]`)
              .click()
              .find('label')
              .eq(pos + 1)
              .click();

            cy.get(`[data-cy=filter_item__${fieldName}__select_single-input-value]`).should('have.value', `${selectedValue}`);
          });

          it('Уходит правильный запрос', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=filtersButtonApply]').click({ force: true });

            cy.wait(['@getActions']);
          });

          it('Применённая фильтрация отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });

          it('Применённая фильтрация влияет на url для CSV', () => {
            expect(Cypress.$('[data-cy=button_download_csv]').attr('href')).to.include(expectedGetParams);
          });
        });
      });
    });

    describe('Постраничная навигация', () => {
      describe('Базовое отображение', () => {
        before(() => {
          cy.clearCookies();
          cy.programStatsActions(statisticsActions);

          cy.get('[data-cy=pagination]').should('exist');
        });

        it('Есть выбор количества строк на страницу', () => {
          cy.get('[data-cy=pagination-limit__select]').should('exist');
        });

        it('Есть инпут с текущим номером страницы', () => {
          cy.get('[data-cy=pagination-current__input]').should('exist');
        });

        it('Количество страниц определяется верно', () => {
          const { total_items, limit } = statisticsActions;

          cy.get('[data-cy=pagination-pages_total]').should('have.text', `${Math.ceil(total_items / limit)}`);
        });

        it('Есть кнопка "назад"', () => {
          cy.get('[data-cy=pagination-prev]').should('exist');
        });

        it('Есть кнопка "вперед"', () => {
          cy.get('[data-cy=pagination-next]').should('exist');
        });
      });

      describe('Первая страница из нескольких', () => {
        before(() => {
          cy.clearCookies();
          cy.programStatsActions(statisticsActions);
        });

        it('Страница по-умолчанию = первая', () => {
          cy.get('[data-cy=pagination-current__input]').should('have.value', '1');
        });

        it('Кнопка "назад" не активна', () => {
          cy.get('[data-cy=pagination-prev]').should('have.attr', 'disabled');
        });

        it('Кнопка "вперед" активна', () => {
          cy.get('[data-cy=pagination-next]').should('not.have.attr', 'disabled');
        });
      });

      describe('Всего 1 страница', () => {
        const columns = statisticsActions.columns.map(col => ({
          ...col,
          values: [col.values[0]]
        }));

        before(() => {
          cy.clearCookies();
          cy.programStatsActions({
            ...statisticsActions,
            total_items: 1,
            columns
          });
        });

        it('Постраничная навигация не показывается', () => {
          cy.get('[data-cy=pagination]').should('not.exist');
        });
      });

      describe('Работоспособность постраничной навигации', () => {
        const routeProps = {
          method: 'GET',
          url: '/api/statistics/campaign_actions*',
          status: 200,
          onResponse: () => { }
        };

        describe('Изменение количества элементов на страницу', () => {
          const fieldName = 'limit';
          const selectedLimit = '50';
          const expectedGetParams = `${fieldName}=${selectedLimit}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));

          clonedActions[fieldName] = Number(selectedLimit);

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Поле изменяется и применяется', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=pagination-limit__select]')
              .click({ force: true })
              .find('label')
              .eq(1)
              .click({ force: true });

            cy.wait(['@getActions']);
          });

          it('Применённый лимит отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });
        });

        describe('Изменение номера страницы через поле', () => {
          const fieldName = 'offset';
          const inputString = '30';
          const expectedGetParams = `${fieldName}=${inputString}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));

          clonedActions[fieldName] = Number(inputString);

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Поле изменяется и применяется', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=pagination-current__input]').type(`{selectall}2`, { force: true }).blur();
            cy.get('[data-cy=pagination-current__input]').should('have.value', '2');

            cy.wait(['@getActions']);
          });

          it('Соответствующий offset отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });

          it('Кнопка "назад" становится активной', () => {
            cy.get('[data-cy=pagination-prev]').should('not.have.attr', 'disabled');
          });
        });

        describe('Переход по кнопке "вперед"', () => {
          const fieldName = 'offset';
          const inputString = '30';
          const expectedGetParams = `${fieldName}=${inputString}`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));

          clonedActions[fieldName] = Number(inputString);

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(statisticsActions);
          });

          it('Клик по кнопке меняет номер страницы', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: clonedActions,
              onRequest: xhr => {
                expect(xhr.url).to.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=pagination-next]').click({ force: true });
            cy.get('[data-cy=pagination-current__input]').should('have.value', '2');

            cy.wait(['@getActions']);
          });

          it('Соответствующий offset отображается в адресной строке', () => {
            cy.url().should('include', expectedGetParams);
          });

          it('Кнопка "назад" становится активной', () => {
            cy.get('[data-cy=pagination-prev]').should('not.have.attr', 'disabled');
          });
        });

        describe('Переход по кнопке "назад"', () => {
          const fieldName = 'offset';
          const inputString = '30';
          const expectedGetParams = `${fieldName}=0`;
          const clonedActions = JSON.parse(JSON.stringify(statisticsActions));

          clonedActions[fieldName] = Number(inputString);

          before(() => {
            cy.clearCookies();
            cy.programStatsActions(clonedActions, '/programs/100/stats/actions?offset=30');
          });

          it('Клик по кнопке меняет номер страницы', () => {
            cy.server();
            cy.route({
              ...routeProps,
              response: statisticsActions,
              onRequest: xhr => {
                expect(xhr.url).to.not.include(expectedGetParams);
              }
            }).as('getActions');

            cy.get('[data-cy=pagination-prev]').click({ force: true });
            cy.get('[data-cy=pagination-current__input]').should('have.value', '1');

            cy.wait(['@getActions']);
          });

          it('Соответствующий offset отображается в адресной строке', () => {
            cy.url().should('not.include', expectedGetParams);
          });

          it('Кнопка "назад" становится не активной', () => {
            cy.get('[data-cy=pagination-prev]').should('have.attr', 'disabled');
          });
        });
      });
    });
  });
});
