const news_input = require('../../fixtures/program/input/news.json');
const common = require('../../fixtures/program/input/common.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

describe('Program page header', function () {
  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.programNews(news_input.heavy_arr_news);

      cy.get('[data-cy=program_header]').should('exist');
    });

    it('Показывается правильный лого', () => {
      expect(Cypress.$('[data-cy=program_logo]').attr('src')).to.equal('https://pics.avs.io/travelpayouts/160/70/91.png');
    });

    it('Название программы правильное', () => {
      cy.get('[data-cy=program_name]').contains(common.name);
    });

    it('Лейбл о подключении указан', () => {
      cy.get('[data-cy=program_name_wrapper] .mark__text').should('exist');
    });

    it('Адрес сайта указан верно', () => {
      cy.get('[data-cy=program_sitelink]').should('have.attr', 'href', common.site_link);
    });

    it('Все ссылки на соц. сети проставлены', () => {
      cy.get('[data-cy=program_sociallink]').each($el => {
        expect(Object.values(common.social_links)).to.include($el.attr('href'));
      });
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
        url: '/api/offers/91/common*',
        response: common,
        status: 500
      }).as('getCommon');

      cy.clearCookies();

      cy.visit(`/programs/91/news`, {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/91/news');

      cy.wait(['@getInfo', '@getBalance', '@getCommon']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });
  });

  describe('Запрос за несуществующей программой', () => {
    before(() => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/offers/999/common*',
        response: {},
        status: 404
      }).as('getCommon');

      cy.clearCookies();

      cy.visit(`/programs/999/about`, {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/999/about');

      cy.wait(['@getInfo', '@getBalance', '@getCommon']);
    });

    it('Видим сообщение, что программа не найдена', () => {
      cy.get('[data-cy=program-not_found]').should('exist');
    });

    it('Видим сообщение о 404 ошибке', () => {
      cy.get('[data-cy^=server_error_404]').should('exist');
    });
  });
});
