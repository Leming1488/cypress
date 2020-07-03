const usersInfo = require('../../fixtures/users/input/users_info.json');
const promos = require('../../fixtures/dashboard/input/promos.json');
const news = require('../../fixtures/dashboard/input/news.json');
const campaigns_summary = require('../../fixtures/dashboard/input/campaigns_summary.json');
const recommended_offers = require('../../fixtures/dashboard/input/recommended_offers.json');
const offerSingleFullData = require('../../fixtures/programs/input/offers_single_full_data.json');

Cypress.Commands.add('balances', (values, routePath = '/dashboard') => {
  cy.server();
  cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
  cy.route('GET', '/api/dashboard/promos*', promos.empty_value).as('getPromos');
  cy.route('GET', '/api/dashboard/news*', news.not_empty_news).as('getNews');
  cy.route('GET', '/api/statistics/campaigns_summary*', campaigns_summary.not_zero_values).as('getCampaignsSummary');
  cy.route('GET', '/api/dashboard/recommended_offers*', recommended_offers).as('getRecommendedOffers');
  cy.route('GET', '/api/offers*', offerSingleFullData).as('getOffers');
  cy.route('GET', '/api/balances/current.json*', values).as('getBalance');

  cy.visit(routePath, {
    onBeforeLoad(win) {
      delete win.fetch;
    }
  });

  if (routePath === '/programs') {
    cy.wait([
      '@getInfo',
      '@getBalance',
      '@getOffers'
    ]);
  } else {
    cy.wait([
      '@getInfo',
      '@getBalance',
      '@getPromos',
      '@getNews',
      '@getCampaignsSummary',
      '@getRecommendedOffers'
    ]);
  }
});
