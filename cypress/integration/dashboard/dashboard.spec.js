const promos = require('../../fixtures/dashboard/input/promos.json');
const news = require('../../fixtures/dashboard/input/news.json');
const settings = require('../../fixtures/dashboard/input/dashboard_settings.json');
const newSettings = require('../../fixtures/dashboard/output/dashboard_settings.json');
const campaigns_summary = require('../../fixtures/dashboard/input/campaigns_summary.json');
const recommended_offers = require('../../fixtures/dashboard/input/recommended_offers.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const rowsSorted = require('../../fixtures/dashboard/output/rows_sorting.json');
const usersInfoCustom = require('../../fixtures/users/input/users_info_custom.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const tabs = require('../../fixtures/dashboard/output/tabs.json');
const table = require('../../fixtures/dashboard/output/table.json');

const { expectedColumns, rowsCount, expectedTotals, expectedTotalsZero } = table;

const saveSettingsRouteProps = (new_property) => ({
  method: 'POST',
  mode: 'cors',
  credentials: 'same-origin',
  url: '/api/dashboard/update_settings*',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Token': null
  },
  response: {
    dashboard_settings: {
      ...settings.dashboard_settings,
      ...new_property
    }
  },
  delay: 500,
  status: 200,
  onRequest: () => {},
  onResponse: () => {}
});

describe('Dashboard page', () => {
  describe('Cлайд-шоу', () => {
    describe('При нулевых значениях', () => {
      before(() => {
        cy.clearCookies();

        cy.dashboard(
          usersInfo,
          promos.empty_value,
          news.not_empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );
      });

      it('Не видит слайд-шоу.', () => {
        cy.get('[data-cy=dashboard-slider]').should('not.exist');
      });
    });

    describe('При ненулевых значениях', () => {
      const imageArr = promos.not_empty_value.dashboard_promos.map(item => item.image);
      const linkArr = promos.not_empty_value.dashboard_promos.map(item => item.link);

      before(() => {
        cy.clearCookies();

        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.not_empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-slider]').should('exist');
      });

      it('Картинки завернуты в ссылки', () => {
        cy.get('[data-cy=dashboard-slider] a img').should('exist');
      });

      it('В слайдшоу ссылки соответствуют информации с сервера', () => {
        cy.get('[data-cy=dashboard-slider] a').each($el => {
          expect(linkArr).to.include($el.attr('href'));
        });
      });

      it('В слайдшоу src картинок соответствуют информации с сервера', () => {
        cy.get('[data-cy=dashboard-slider] img').each($el => {
          const src = $el.attr('src');
          const data = imageArr.find(image => src.includes(image));
          expect(data).to.exist;
        });
      });
    });
  });

  describe('Блок новостей', () => {
    describe('При нулевых значениях', () => {
      before(() => {
        cy.clearCookies();

        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-news]').should('exist');
      });

      it('Не видит список новостей', () => {
        cy.get('[data-cy=dashboard-news-item]').should('have.length', 0);
      });

      it('Видит ссылку на блог', () => {
        cy.get('[data-cy=dashboard-blog-link]').should('exist');
      });
    });

    describe('При ненулевых значениях', () => {
      before(() => {
        cy.clearCookies();

        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.not_empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-news]').should('exist');
      });

      it('Видим список новостей', () => {
        cy.get('[data-cy=dashboard-news-item]').each(($el, index) => {
          expect($el.find('[data-cy=dashboard-news-item-link]').attr('href')).equal(
            news.not_empty_news.blog_news[index].link
          );

          expect($el.find('[data-cy=news_item-title]').text()).equal(
            news.not_empty_news.blog_news[index].title
          );

          cy.get($el.find('[data-cy=dashboard-news-item-details]')).should('exist')
        });
      });

      it('Ссылка ведёт на блог', () => {
        expect(Cypress.$('[data-cy=dashboard-blog-link]').attr('href')).to.include('https://blog.travelpayouts.com')
      });

      it('Переключаем вкладку новостей программ, видим список новостей программ', () => {
        cy.get('[data-cy=dashboard-news] [data-cy=tabs-item]:not(.active):eq(0)').click();

        cy.get('[data-cy=dashboard-news-item]').each(($el, index) => {
          const id = news.not_empty_news.offers_news[index].campaign_id;

          expect($el.find('[data-cy=news_list-item__program-image]').attr('src')).equal(
            `https://pics.avs.io/travelpayouts_square/16/16/${id}.png`
          );

          expect($el.find('[data-cy=news_list-item__program-image]').attr('srcset')).equal(
            `https://pics.avs.io/travelpayouts_square/16/16/${id}@2x.png 2x`
          );

          expect($el.find('[data-cy=news_list-item__program-name]').text()).equal(
            news.not_empty_news.offers_news[index].campaign_name
          );

          expect($el.find('[data-cy=dashboard-news-item-program]').attr('href')).equal(
            `/programs/${id}/news`
          );
        });
      });

      it('Во вкладке новостей правильная ссылка на список новостей', () => {
        expect(Cypress.$('[data-cy=dashboard-blog-link]').attr('href')).to.include('/dashboard/news')
      });

      it('Видим уведомление о новых записях для неактивной вкладки', () => {
        cy.get('[data-cy=dashboard-news] [data-cy=tabs-item]:not(.active) [data-cy=dashboard-news-dot]').should('exist');
      });

      it('Для активной вкладки кружка-уведомления о новых записях нет', () => {
        cy.get('[data-cy=dashboard-news] [data-cy=tabs-item].active [data-cy=dashboard-news-dot]').should('not.exist');
      });

      it('Переключаем вкладку новостей блога, состояние сохраняется при перезагрузке страницы', () => {
        cy.get('[data-cy=dashboard-news] [data-cy=tabs-item]:not(.active):eq(0)').click();

        cy.reload();

        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.not_empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-news] [data-cy=tabs-item]:eq(0)').should('have.class', 'active');
      });
    });
  });

  describe('Таблица', () => {
    describe('При ошибке 500', () => {
      before(() => {
        cy.server();
        cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
        cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
        cy.route('GET', '/api/dashboard/promos*', promos.not_empty_value).as('getPromos');
        cy.route('GET', '/api/dashboard/news*', news.empty_news).as('getNews');
        cy.route('GET', '/api/dashboard/recommended_offers*', recommended_offers).as('getRecommendedOffers');

        cy.route({
          method: 'GET',
          mode: 'cors',
          credentials: 'same-origin',
          url: '/api/statistics/campaigns_summary*',
          response: campaigns_summary.zero_values,
          status: 500
        }).as('getCampaignsSummary');

        cy.clearCookies();

        cy.visit('/dashboard', {
          onBeforeLoad(win) {
            delete win.fetch;
          }
        });

        cy.url().should('include', '/dashboard');
        cy.wait([
          '@getInfo',
          '@getBalance',
          '@getPromos',
          '@getNews',
          '@getCampaignsSummary',
          '@getRecommendedOffers'
        ]);
      });

      it('Есть сообщение об ошибке', () => {
        cy.get('[data-cy*="server_error_5"]').should('exist');
      });

      it('Таблицы нет', () => {
        cy.get('[data-cy=dashboard-table]').should('not.exist');
      });
    });

    describe('При нулевых значениях', () => {
      before(() => {
        cy.clearCookies();

        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.empty_news,
          campaigns_summary.zero_values,
          settings
        );

        cy.get('[data-cy=dashboard-table]').should('exist');
      });

      it('Видим правильно сформированные заголовки', () => {
        expectedColumns.forEach(key => {
          cy.get(`[data-cy=dashboard-table--th-${key}]`).should('exist');
        });
      });

      it(`Видим что количество строк таблицы равно ${rowsCount}`, () => {
        cy.get('[data-cy=dashboard-table-row]').should('have.length', rowsCount);
      });

      it('Видим правильно сформированную строку Итого', () => {
        Object.keys(expectedTotalsZero).forEach(key => {
          cy.get(`[data-cy=dashboard-table-totals--${key}]`).invoke('text').then((text) => {
            expect(text.replace(/\u00a0/g, ' ')).equal(expectedTotalsZero[key]);
          });
        });
      });
    });

    describe('При ненулевых значениях', () => {
      before(() => {
        cy.clearCookies();

        cy.dashboard(
          usersInfoCustom.dashboard_settings_default,
          promos.not_empty_value,
          news.empty_news,
          campaigns_summary.not_zero_values,
          settings
        );

        cy.get('[data-cy=dashboard-table]').should('exist');
      });

      it('Первая колонка первой строки содержит ссылку на статистику', () => {
        const row_clicked = 0;

        cy.get('[data-cy=dashboard-table-row]').then(rows => {
          cy.wrap(rows[row_clicked])
            .find('[data-cy=stats]')
            .and('have.attr', 'href')
            .and('include', `/programs/${rowsSorted.id_default[row_clicked]}/stats/summary`);
        });
      });

      it('У ссылки на статистику есть search параметры дат и типа действия', () => {
        const row_clicked = 0;
        const monthStartDate = Cypress.moment().format('YYYY-MM-01');
        const todaysDate = Cypress.moment().format('YYYY-MM-DD');

        cy.get('[data-cy=dashboard-table-row]').then(rows => {
          cy.wrap(rows[row_clicked])
            .find('[data-cy=stats]')
            .and('have.attr', 'href')
            .and('include', `from=${monthStartDate}&until=${todaysDate}`);

          cy.wrap(rows[row_clicked])
            .find('a[data-cy=dashboard-table-cell--value]')
            .and('have.attr', 'href')
            .and('include', `from=${monthStartDate}&until=${todaysDate}`);
        });
      });

      it('Первая колонка второй строки содержит ссылку на инструменты', () => {
        const row_clicked = 1;

        cy.get('[data-cy=dashboard-table-row]').then(rows => {
          cy.wrap(rows[row_clicked])
            .find('[data-cy=tools]')
            .and('have.attr', 'href')
            .and('include', `/programs/${rowsSorted.id_default[row_clicked]}/tools`);
        });
      });

      it('Закрепляем (pin) третью строку', () => {
        cy.server();

        const row_clicked = 2;
        const params = saveSettingsRouteProps({
          pinned: [rowsSorted.id_default[row_clicked]]
        });

        cy.route(params).as('postDashboardSettings');

        cy.get('[data-cy=dashboard-table-row]').then(rows => {
          cy.wrap(rows[row_clicked])
            .find('[data-cy=cell_offer-buttons-item__pinned]')
            .find('svg')
            .click({ force: true });
        });

        cy.wait(['@postDashboardSettings']);
      });

      it('Видим правильно сформированные заголовки', () => {
        expectedColumns.forEach(key => {
          cy.get(`[data-cy=dashboard-table--th-${key}]`).should('exist');
        });
      });

      it(`Видим что количество строк таблицы равно ${rowsCount}`, () => {
        cy.get('[data-cy=dashboard-table-row]').should('have.length', rowsCount);
      });

      it('Видим правильно сформированную строку Итого', () => {
        Object.keys(expectedTotals).forEach(key => {
          cy.get(`[data-cy=dashboard-table-totals--${key}]`).invoke('text').then((text) => {
            expect(text.replace(/\u00a0/g, ' ')).equal(expectedTotals[key]);
          });
        });
      });
    });

    describe('Фильтрация таблицы', () => {
      before(() => {
        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-table]').should('exist');
      });

      it('Переключаемся на показ только закрепленных строк в таблице', () => {
        const params = saveSettingsRouteProps({
          shown: newSettings.shown_change.pinned
        });

        cy.server();
        cy.route(params).as('postDashboardSettings');

        cy.get('[data-cy=table-filter]').click();

        cy.get('[data-cy=table-filter-select]')
          .click()
          .find(`:checkbox[value=${newSettings.shown_change.pinned}]`)
          .click({ force: true });

        cy.wait(['@postDashboardSettings']);

        cy.get('[data-cy=dashboard-table-cell--offer').should(
          'have.length',
          settings.dashboard_settings.pinned.length
        );
      });

      it('Есть фильтрация данных', () => {
        cy.get('[data-cy=table-filter]').click();
        cy.get('[data-cy=table-filter-select]')
          .click()
          .get(`:checkbox[value=${newSettings.shown_change.pinned}]`)
          .get(`:checkbox[value=${newSettings.shown_change.all}]`)
          .get(`:checkbox[value=${newSettings.shown_change.with_data}]`);
      });

      it('Фильтрация по "есть данные"', () => {
        const params = saveSettingsRouteProps({
          shown: newSettings.shown_change.with_data
        });

        cy.server();
        cy.route(params).as('postDashboardSettings');

        cy.get('[data-cy=table-filter]').click();
        cy.get('[data-cy=table-filter-select]')
          .find(`:checkbox[value=${newSettings.shown_change.with_data}]`)
          .click({ force: true });

        cy.wait(['@postDashboardSettings']);

        cy.get('[data-cy=dashboard-table-cell--offer').should('have.length', 3);
      });

      it('Отображение всех программ', () => {
        const params = saveSettingsRouteProps({
          shown: newSettings.shown_change.all
        });

        cy.server();
        cy.route(params).as('postDashboardSettings');

        cy.get('[data-cy=table-filter-select]')
          .find(`:checkbox[value=${newSettings.shown_change.all}]`)
          .click({ force: true });
        cy.wait(['@postDashboardSettings']);
        cy.get('[data-cy=dashboard-table-cell--offer').should('have.length', 3);
      });
    });

    describe('Сортировка таблицы', () => {
      before(() => {
        cy.dashboard(
          usersInfoCustom.dashboard_settings_null,
          promos.not_empty_value,
          news.empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-table]').should('exist');
      });

      it('По-умолчанию сортировано по столбцу offers по убыванию (от А до Я)', () => {
        cy.get('[data-cy=dashboard-table-row]').each(($row, rowIndex) => {
          cy.wrap($row)
            .find('[data-cy=dashboard-table-cell--value]')
            .each(($el, position) => {
              cy.wrap($el)
                .invoke('text')
                .should(text => {
                  expect(text.replace(/\u00a0/g, ' ')).to.eq(
                    rowsSorted.rows_default[rowIndex][position]
                  );
                });
            });
        });
      });

      it('Сортируем по второму столбцу, сортировка актуальная', () => {
        const params = saveSettingsRouteProps({
          sort_by: newSettings.sort_by_change.inits
        });

        cy.server();
        cy.route(params).as('postDashboardSettings');

        cy.get('[data-cy=dashboard-table-head]')
          .get('[data-cy=dashboard-table-cell]')
          .then($header => {
            cy.wrap($header[1]).click();
            cy.wait(['@postDashboardSettings']);
          });

        cy.get('[data-cy=dashboard-table-row]').each(($row, rowIndex) => {
          cy.wrap($row)
            .find('[data-cy=dashboard-table-cell--value]')
            .each(($el, position) => {
              cy.wrap($el)
                .invoke('text')
                .should(text => {
                  expect(text.replace(/\u00a0/g, ' ')).to.eq(
                    rowsSorted.rows_sort_second[rowIndex][position]
                  );
                });
            });
        });
      });

      it('Сортируем второй столбец еще раз, сортировка актуальная', () => {
        const params = saveSettingsRouteProps({
          sort_order: newSettings.sort_order.asc
        });

        cy.server();
        cy.route(params).as('postDashboardSettings');

        cy.get('[data-cy=dashboard-table-head]')
          .get('[data-cy=dashboard-table-cell]')
          .then($header => {
            cy.wrap($header[1]).click();
            cy.wait(['@postDashboardSettings']);
          });
      });

      it('Запиненные строки сортируются отдельно', () => {
        cy.dashboard(
          usersInfo,
          promos.not_empty_value,
          news.empty_news,
          campaigns_summary.not_zero_values,
          recommended_offers
        );

        cy.get('[data-cy=dashboard-table-row]').each(($row, rowIndex) => {
          cy.wrap($row)
            .find('[data-cy=dashboard-table-cell--value]')
            .each(($el, position) => {
              cy.wrap($el)
                .invoke('text')
                .should(text => {
                  expect(text.replace(/\u00a0/g, ' ')).to.eq(
                    rowsSorted.rows_sort_pinned[rowIndex][position]
                  );
                });
            });
        });
      });
    });
  });

  describe('Табы', () => {
    before(() => {
      cy.clearCookies();

      cy.dashboard(
        usersInfoCustom.dashboard_settings_null,
        promos.not_empty_value,
        news.empty_news,
        campaigns_summary.not_zero_values,
        recommended_offers
      );
    });

    it(`Над таблицей присутствуют ${campaigns_summary.not_zero_values.tabs.length} таба`, () => {
      cy.get('[data-cy=dashboard-table-tabs] [data-cy=tabs-item]').should('have.length', campaigns_summary.not_zero_values.tabs.length);
    });

    it('По умолчанию выбраны данные за месяц', () => {
      cy.get('[data-cy=dashboard-table-tabs] [data-cy=tabs-item]:eq(2)').should('have.class', 'active');
    });

    it('Переключаемся на 1 таб, данные отображаются верно', () => {
      cy.get('[data-cy=dashboard-table-tabs] [data-cy=tabs-item]:eq(0)').click();

      cy.get('[data-cy=dashboard-table-row]').each(($row, rowIndex) => {
        cy.wrap($row)
          .find('[data-cy=dashboard-table-cell--value]')
          .each(($el, position) => {
            cy.wrap($el)
              .invoke('text')
              .should(text => {
                expect(text.replace(/\u00a0/g, ' ')).to.eq(tabs.first[rowIndex][position]);
              });
          });
      });
    });
  });
});
