const news_input = require('../../fixtures/program/input/news.json');
const common = require('../../fixtures/program/input/common.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');

describe('Program News page', function() {
  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.programNews(news_input.heavy_arr_news);

      cy.get('[data-cy=program_news]').should('exist');
    });

    it('Новости заполнены правильными данными', () => {
      cy.get('[data-cy=news_item]').each(($el, index) => {
        expect($el.find('[data-cy=news_item-header_link]').attr('href')).to.not.exist;

        expect($el.find('[data-cy=news_item-header_link]').text()).equal(
          news_input.heavy_arr_news.offers_news[index].title
        );

        cy.get($el.find('[data-cy=news_item-date]')).should('exist');
      });
    });

    it('Видим 30 элементов на страницу', () => {
      cy.get('[data-cy=news_item]').should('have.length', 30);
    });

    it('Есть постраничная навигация', () => {
      cy.get('[data-cy=pagination]').should('exist');
    });

    it('Кол-во страниц соответствует кол-ву данных', () => {
      const pagesTotal = Math.ceil(news_input.heavy_arr_news.offers_news.length / 30);

      cy.get('[data-cy=pagination-pages_total]').should('have.length', pagesTotal);
    });

    it('Кол-во элементов меньше 30, постраничной навигации нет', () => {
      cy.programNews(news_input.not_empty_news);
      cy.get('[data-cy=pagination]').should('not.exist');
    });
  });

  describe('Нет данных', () => {
    before(() => {
      cy.clearCookies();
      cy.programNews(news_input.empty_news);
    });

    it('Есть уведомление, что новостей нет', () => {
      cy.get('[data-cy=program_news-empty]').should('exist');
    });

    it('Не видим постраничную навигацию', () => {
      cy.get('[data-cy=pagination]').should('not.exist');
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
        url: '/api/dashboard/news*',
        response: news_input.empty_news,
        status: 500
      }).as('getNews');

      cy.clearCookies();

      cy.visit(`/programs/91/news`, {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/91/news');

      cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getNews']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });

    it('Видим уведомление, что данных нет', () => {
      cy.get('[data-cy=program_news-empty]').should('exist');
    });

    it('Не видим постраничную навигацию', () => {
      cy.get('[data-cy=pagination]').should('not.exist');
    });
  });
});
