const promos = require('../fixtures/dashboard/input/promos.json');
const news = require('../fixtures/dashboard/input/news.json');
const campaigns_summary = require('../fixtures/dashboard/input/campaigns_summary.json');
const recommended_offers = require('../fixtures/dashboard/input/recommended_offers.json');
const usersInfo = require('../fixtures/users/input/users_info.json');
const usersInfoNew = require('../fixtures/users/input/users_info_new.json');
const usersBalances = require('../fixtures/users/input/balances.json');

describe('Email confirmation', () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  describe('Емейл подтвержден', () => {
    it('Плашки с уведомлением о подтверждении нет', () => {
      cy.dashboard(
        usersInfo,
        promos.not_empty_value,
        news.not_empty_news,
        campaigns_summary.not_zero_values,
        recommended_offers
      );

      cy.get('[data-cy=unconfirmed_email]').should('not.exist');
    });
  });

  describe('Переход по ссылке из письма', () => {
    beforeEach(() => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
      cy.route('GET', '/api/dashboard/promos*', promos.not_empty_value).as('getPromos');
      cy.route('GET', '/api/dashboard/news*', news.not_empty_news).as('getNews');
      cy.route('GET', '/api/statistics/campaigns_summary*', campaigns_summary.not_zero_values).as(
        'getCampaignsSummary'
      );
      cy.route('GET', '/api/dashboard/recommended_offers*', recommended_offers).as(
        'getRecommendedOffers'
      );
    });

    it('Позитивное подтверждение емейла - есть сообщение об успешной активации аккаунта', () => {
      cy.visit('/dashboard?email_confirmed=true', {
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

      cy.get('[data-cy=email_confirmation_success]').should('exist');
    });

    it('Негативное подтверждение емейла - есть сообщение об ошибке активации со ссылкой на повторную отправку письма', () => {
      cy.visit('/dashboard?email_confirmed=false', {
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

      cy.get('[data-cy=email_confirmation_error]').should('exist');
      cy.get('[data-cy=email_confirmation_error] .alert-action').should('exist');
    });
  });

  describe('Емейл не подтвержден', () => {
    it('Письмо еще не отправлялось; плашка есть, ссылка на отправку есть', () => {
      cy.dashboard(
        usersInfoNew,
        promos.not_empty_value,
        news.not_empty_news,
        campaigns_summary.not_zero_values,
        recommended_offers
      );

      cy.get('[data-cy=unconfirmed_email]').should('exist');
      cy.get('[data-cy=unconfirmed_email] .alert-action').should('exist');
    });

    it('Письмо отправилось менее 10 минут назад, кнопки повторной отправки нет', () => {
      const time = Cypress.moment().subtract(5, 'minutes');

      cy.dashboard(
        {
          ...usersInfoNew,
          confirmation_sent_at: time.toISOString()
        },
        promos.not_empty_value,
        news.not_empty_news,
        campaigns_summary.not_zero_values,
        recommended_offers
      );

      cy.get('[data-cy=unconfirmed_email] .alert-action').should('not.exist');
    });

    it('Письмо отправилось более 10 минут назад, кнопка повторной отправки есть', () => {
      const time = Cypress.moment().subtract(15, 'minutes');

      cy.dashboard(
        {
          ...usersInfoNew,
          confirmation_sent_at: time.toISOString()
        },
        promos.not_empty_value,
        news.not_empty_news,
        campaigns_summary.not_zero_values,
        recommended_offers
      );

      cy.get('[data-cy=unconfirmed_email] .alert-action').should('exist');
    });

    it('Клик по кнопке отправки письма, запрос уходит, уведомление соответственно меняется', () => {
      cy.dashboard(
        usersInfoNew,
        promos.not_empty_value,
        news.not_empty_news,
        campaigns_summary.not_zero_values,
        recommended_offers
      );

      cy.route('GET', '/api/users/send_another_confirmation_email*', { message: 'test' }).as('sendRequest');

      cy.get('[data-cy=unconfirmed_email] .alert-action').click();

      cy.wait(['@sendRequest']);

      cy.get('[data-cy=unconfirmed_email]').should('not.exist');
      cy.get('[data-cy=email_confirmation_sent]').should('exist');
    });
  });
});
