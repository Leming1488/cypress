const usersBalances = require('../../fixtures/users/input/balances.json');

Cypress.Commands.add(
  'dashboard',
  (usersInfo, promos, news, campaigns_summary, recommended_offers) => {
    cy.server();
    cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
    cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as('getBalance');
    cy.route('GET', '/api/dashboard/promos*', promos).as('getPromos');
    cy.route('GET', '/api/dashboard/news*', news).as('getNews');
    cy.route('GET', '/api/statistics/campaigns_summary*', campaigns_summary).as('getCampaignsSummary');
    cy.route('GET', '/api/dashboard/recommended_offers*', recommended_offers).as('getRecommendedOffers');

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

    cy.get('[data-cy=dashboard-page]');
  }
);
