const usersInfo = require('../fixtures/users/input/users_info.json');
const usersBalances = require('../fixtures/users/input/balances.json');
const offerSingleFullData = require('../fixtures/programs/input/offers_single_full_data.json');
const offersZero = require('../fixtures/programs/input/offers_zero.json');
const offers = require('../fixtures/programs/input/offers.json');

describe('Programs List', function () {
  describe('Ошибка получения данных; Переходим в раздел Программы', () => {
    before(() => {
      cy.server();

      cy.route('GET', '/api/users/info*', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current*', usersBalances.non_zero_values).as('getBalance');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/offers*',
        response: offersZero,
        status: 500
      }).as('actions');

      cy.clearCookies();

      cy.visit('/programs', {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs');

      cy.wait(['@getInfo', '@actions', '@getBalance']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });

    it('Не видим фильтры', () => {
      cy.get('[data-cy=filters]').should('not.exist');
    });

    it('Видим уведомление, что данных нет', () => {
      cy.get('[data-cy=programs] .empty-card').should('exist');
    });

    it('Не видим постраничную навигацию', () => {
      cy.get('[data-cy=pagination]').should('not.exist');
    });
  });

  describe('Нет данных; Переходим в раздел Программы', () => {
    before(() => {
      cy.clearCookies();
      cy.programs(offersZero);
    });

    it('Не видим фильтры', () => {
      cy.get('[data-cy=programs] [data-cy=filters]').should('not.exist');
    });

    it('Видим уведомление, что данных нет', () => {
      cy.get('[data-cy=programs] .empty-card').should('exist');
    });

    it('Не видим постраничную навигацию', () => {
      cy.get('[data-cy=programs] [data-cy=pagination]').should('not.exist');
    });
  });

  describe('Есть данные; Переходим в раздел Программы', () => {
    describe('Общая проверка списка программ', () => {
      before(() => {
        cy.clearCookies();
        cy.programs(offers);
      });

      it('Видим фильтры', () => {
        cy.get('[data-cy=programs] [data-cy=filters]').should('exist');
      });

      it('Видим список программ, показываются 30 элементов на страницу', () => {
        cy.get('[data-cy=programs] .program_card').should('have.length', 30);
      });

      it('Видим постраничную навигацию', () => {
        cy.get('[data-cy=programs] [data-cy=pagination]').should('exist');
      });
    });

    describe('Полные данные по карточке программы', () => {
      const stub = offerSingleFullData.offers[0];

      before(() => {
        cy.clearCookies();
        cy.programs(offerSingleFullData);
      });

      describe('Карточка программы, колонка слева', () => {
        beforeEach(() => {
          cy.get('[data-cy="program_card--100"] .program_card-short_details').as('left');
        });

        it('Видим логотип со ссылкой на страницу программы', () => {
          cy.get('@left').get('a.program_card-logo').should('have.attr', 'href', `/programs/${stub.id}/about`);
          cy.get('@left').get('a.program_card-logo img').should('have.attr', 'src', `https://pics.avs.io/travelpayouts/160/70/${stub.id}.png`);
          cy.get('@left').get('a.program_card-logo img').should('have.attr', 'srcset', `https://pics.avs.io/travelpayouts/160/70/${stub.id}@2x.png 2x`);
          cy.get('@left').get('a.program_card-logo img').should('have.attr', 'alt', stub.name_short);
        });

        it('Под логотипом есть саммари данных', () => {
          const performance = [
            { value: `${(stub.affiliate_comission * 100).toFixed(2)}%` },
            ...stub.performance
          ];

          cy.get('@left').get('.program_card-performance').each((item, index) => {
            cy.get(item).children('dd').should('have.text', performance[index].value);
          });
        });

        it('Есть ссылка на инструменты', () => {
          cy.get('@left').get('[data-cy=program_card_link_tools]').should('have.attr', 'href', `/programs/${stub.id}/tools`);
        });

        it('Есть ссылка на статистику', () => {
          cy.get('@left').get('[data-cy=program_card_link_stats]').should('have.attr', 'href', `/programs/${stub.id}/stats/summary`);
        });
      });

      describe('Карточка программы, центральная область', () => {
        beforeEach(() => {
          cy.get('[data-cy="program_card--100"] .program_card-description').as('center');
        });

        it('Видим название программы со ссылкой на страницу программы', () => {
          cy.get('@center').get('.title a').should('have.text', stub.name_short);
          cy.get('@center').get('.title a').should('have.attr', 'href', `/programs/${stub.id}/about`);
        });

        it('Рядом с названием видим уведомление, что подключены к этой программе', () => {
          cy.get('@center').get('.title .mark').should('exist');
        });

        it('Есть описание программы', () => {
          cy.get('@center').get('.program_card-description__short').should('have.text', stub.description_short);
        });

        it('Есть еще одно описание (саммари) программы', () => {
          cy.get('@center').get('.styled_content').should('have.text', stub.summary);
        });
      });

      describe('Карточка программы, колонка справа', () => {
        beforeEach(() => {
          cy.get('[data-cy="program_card--100"] .program_card-tags').as('right');
        });

        it('Видим категории', () => {
          stub.categories.forEach((item, index) => {
            cy.get('@right').get(`[data-cy="program_card_right--categories"] .tag:eq(${index})`).should('have.text', item.label);
          })
        });

        it('Видим инструменты', () => {
          stub.tools.forEach((item, index) => {
            cy.get('@right').get(`[data-cy="program_card_right--tools"] .tag:eq(${index})`).should('have.text', item.label);
          });
        });

        it('Видим языки, показывается 10, остальные скрыты под тултипом', () => {
          cy.get('@right').get('[data-cy="program_card_right--languages"] .tag').should('have.length', 10);

          stub.languages.slice(0,10).forEach((item, index) => {
            cy.get('@right').get(`[data-cy="program_card_right--languages"] .tag:eq(${index})`).should('have.text', item.value);
          });

          const tooltipText = stub.languages.reduce((curr, next) => [...curr, next.label], []).join(', ');

          cy.get('@right').get('[data-cy="program_card_right--languages"] .program_card-tags__more .tooltip').should('have.text', tooltipText);
        });

        it('Видим языки, показывается 4, остальные скрыты под тултипом', () => {
          cy.get('@right').get('[data-cy="program_card_right--geo"] .tag').should('have.length', 4);

          stub.geo.slice(0, 4).forEach((item, index) => {
            cy.get('@right').get(`[data-cy="program_card_right--geo"] .tag:eq(${index})`).should('have.text', item.label);
          });

          const tooltipText = stub.geo.reduce((curr, next) => [...curr, next.label], []).join(', ');

          cy.get('@right').get('[data-cy="program_card_right--geo"] .program_card-tags__more .tooltip').should('have.text', tooltipText);
        });
      });
    });

    describe('Частичная проверка; Не полные данные по карточке программы', () => {
      const stub = {
        ...offerSingleFullData.offers[0],
        subscription_status: 'banned',
        tools: [],
        languages: [],
        geo: []
      };

      before(() => {
        cy.clearCookies();

        cy.programs({ offers: [stub] });
      });

      beforeEach(() => {
        cy.get('[data-cy="program_card--100"]').as('card');
      });

      it('Нет данных по инструментам', () => {
        cy.get('@card').get('[data-cy="program_card_right--tools"]').should('not.exist');
      });

      it('Нет данных по языкам', () => {
        cy.get('@card').get('[data-cy="program_card_right--languages"]').should('not.exist');
      });

      it('Нет данных по геотаргетингу', () => {
        cy.get('@card').get('[data-cy="program_card_right--geo"]').should('not.exist');
      });

      it('Забанен, нет ссылок на инструменты и статистику, есть только переход на страницу программы', () => {
        cy.get('@card').get('[data-cy=program_card_link_tools]').should('not.exist');
        cy.get('@card').get('[data-cy=program_card_link_stats]').should('not.exist');
        cy.get('@card').get('[data-cy="program_card_link_about"]').should('have.attr', 'href', `/programs/${stub.id}/about`);
      });
    });

    describe('Если не подписан на программу', () => {
      const stub = {
        ...offerSingleFullData.offers[0],
        subscribed: false
      };

      before(() => {
        cy.clearCookies();

        cy.programs({ offers: [stub] });
      });

      it('Есть кнопка перехода на страницу программы', () => {
        cy.get('[data-cy="program_card--100"]').get('[data-cy="program_card_link_about"]').should('have.attr', 'href', `/programs/${stub.id}/about`);
      });

      it('Нет плашки уведомления, что подключены к этой программе', () => {
        cy.get('[data-cy="program_card--100"]').get('.title .mark').should('not.exist');
      });

      it('Подключение с премодерацией, есть соответствующее уведомление', () => {
        cy.get('[data-cy="program_card--100"]').get('[data-cy="program_card-alert_premoderation"]').should('exist');
      });

      it('Подключение без премодерации, нет плашки уведомления', () => {
        cy.programs({ offers: [{ ...stub, premoderation: false }] });

        cy.get('[data-cy="program_card--100"]').get('[data-cy="program_card-alert_premoderation"]').should('not.exist');
      });
    });
  });
});
