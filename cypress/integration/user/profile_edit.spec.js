const profileInfoEmpty = require('../../fixtures/profile/input/profile_info_empty.json');
const profileInfoFilled = require('../../fixtures/profile/input/profile_info_filled.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const promos = require('../../fixtures/dashboard/input/promos.json');
const news = require('../../fixtures/dashboard/input/news.json');
const campaigns_summary = require('../../fixtures/dashboard/input/campaigns_summary.json');
const recommended_offers = require('../../fixtures/dashboard/input/recommended_offers.json');

describe('Profile Edit', () => {
  describe('Роутинг', () => {
    it('По прямой ссылке', () => {
      cy.profileEdit(profileInfoFilled);
      cy.get('[data-cy=profileEdit]').should('exist');
    });

    it('По общей ссылке профиля (редирект)', () => {
      cy.profileEdit(profileInfoFilled, '/profile');
      cy.get('[data-cy=profileEdit]').should('exist');
    });

    it('Через меню в хедере', () => {
      cy.server();

      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current*', usersBalances.non_zero_values).as('getBalance');
      cy.route('GET', '/api/dashboard/promos*', promos.not_empty_value).as('getPromos');
      cy.route('GET', '/api/dashboard/news*', news.not_empty_news).as('getNews');
      cy.route('GET', '/api/statistics/campaigns_summary*', campaigns_summary.not_zero_values,).as('getCampaignsSummary');
      cy.route('GET', '/api/dashboard/recommended_offers*', recommended_offers).as('getRecommendedOffers');
      cy.route('GET', '/api/profile*', profileInfoFilled).as('getProfileInfo');

      cy.visit('/dashboard', {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.wait(['@getBalance', '@getInfo', '@getPromos', '@getNews', '@getCampaignsSummary', '@getRecommendedOffers']);

      cy.get('[data-cy=headerProfileLink]').click({ force: true });

      cy.url().should('include', '/profile/info');

      cy.wait(['@getProfileInfo']);

      cy.get('[data-cy=profileEdit]').should('exist');
    });
  });

  describe('Позитивные проверки', () => {
    beforeEach(() => {
      cy.profileEdit(profileInfoFilled);
    });

    it('Не заполненная форма', () => {
      cy.profileEdit(profileInfoEmpty);

      cy.get('[data-cy=profileEdit]').should('exist');

      cy.get('[data-cy=profileEditEmail]').should('have.value', profileInfoEmpty.email);
      cy.get('[data-cy=profileEditSubscribed] [data-testid=checkbox_element]').should(
        'be.checked',
        profileInfoEmpty.subscribed
      );
      cy.get('[data-cy=profileEditSubscriptionLocale]').should('have.value', '');
      cy.contains('[data-cy=profileEditRegDate]', profileInfoEmpty.registration_date);
      cy.get('[data-cy=profileEditFirstname]').should('have.value', '');
      cy.get('[data-cy=profileEditLastname]').should('have.value', '');
      cy.get('[data-cy=profileEditBirthdayDay]').should('have.value', '');
      cy.get('[data-cy=profileEditBirthdayMonth]').should('have.value', '');
      cy.get('[data-cy=profileEditBirthdayYear]').should('have.value', '');
      cy.get('[data-cy=profileEditCountry]').should('have.value', '');
      cy.get('[data-cy=profileEditWebsite]').should('have.value', '');
    });

    it('Заполненая форма', () => {
      cy.get('[data-cy=profileEdit]');
      cy.get('[data-cy=profileEditEmail]')
        .should('be.disabled')
        .and('have.value', profileInfoFilled.email);

      cy.get('[data-cy=profileEditSubscribed] [data-testid=checkbox_element]').should('be.not.checked');

      cy.contains('[data-cy=profileEditRegDate]', profileInfoFilled.registration_date);
      cy.get('[data-cy=profileEditFirstname]').should('have.value', profileInfoFilled.name);
      cy.get('[data-cy=profileEditLastname]').should('have.value', profileInfoFilled.lastname);
      cy.get('[data-cy=profileEditWebsite]').should('have.value', profileInfoFilled.website);
    });

    it('Успешное изменение и сабмит формы', () => {
      const expectedResponseDOBYear = new Date().getFullYear() - 15;

      cy.route({
        method: 'PUT',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile*',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        delay: 500,
        status: 200,
        onRequest: xhr => {
          expect(xhr.request.body.country).to.equal('AE');
          expect(xhr.request.body.date_of_birth).to.equal(`${expectedResponseDOBYear}-02-02`);
          expect(xhr.request.body.firstname).to.equal('Testname');
          expect(xhr.request.body.lastname).to.equal('Lastname');
          expect(xhr.request.body.subscribed).to.equal(true);
          expect(xhr.request.body.subscription_locale).to.equal('EN');
          expect(xhr.request.body.website).to.equal('https://aviasales.ru');
        }
      }).as('putProfileInfo200');

      cy.get('[data-cy=profileEdit]');
      cy.get('[data-cy=profileEditSubscribed]').click();
      cy.get('[data-cy=profileEditSubscriptionLocale]')
        .click()
        .find('label')
        .eq(1)
        .click();

      cy.get('[data-cy=profileEditFirstname]').type('{selectall}Testname');
      cy.get('[data-cy=profileEditLastname]').type('{selectall}Lastname');

      [
        'profileEditBirthdayDay',
        'profileEditBirthdayMonth',
        'profileEditBirthdayYear',
        'profileEditCountry'
      ].forEach(field => {
        cy.get(`[data-cy=${field}]`)
          .click()
          .find('label')
          .eq(1)
          .click();
      });

      cy.get('[data-cy=profileEditWebsite]').type('{selectall}https://aviasales.ru');

      cy.get('[data-cy=profileEditLocale]')
        .click()
        .find('input[value=en]')
        .click({ force: true });

      cy.get('[data-cy="profileEditLocale-input-value"]').should('have.value', 'en');

      cy.get('[data-cy=profileEdit] button[type=submit]').click({ force: true });

      cy.wait(['@putProfileInfo200']);
      cy.get('[data-cy=successProfileUpdate]');
      cy.get('html').should('have.attr', 'lang', 'en');
    });

    it('Меняем язык интерфейса', () => {
      cy.route({
        method: 'PUT',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        delay: 500,
        status: 200,
        onRequest: xhr => {
          expect(xhr.request.body.country).to.equal(profileInfoFilled.country);
          expect(xhr.request.body.date_of_birth).to.equal(profileInfoFilled.date_of_birth);
          expect(xhr.request.body.firstname).to.equal(profileInfoFilled.name);
          expect(xhr.request.body.lastname).to.equal(profileInfoFilled.lastname);
          expect(xhr.request.body.subscribed).to.equal(profileInfoFilled.subscribed);
          expect(xhr.request.body.subscription_locale).to.equal(profileInfoFilled.subscription_locale);
          expect(xhr.request.body.website).to.equal(profileInfoFilled.website);
        }
      }).as('putProfileInfo200');

      cy.get('[data-cy=profileEditLocale]')
        .click()
        .find('input[value=en]')
        .click({ force: true });

      cy.get('[data-cy=profileEdit]').submit();
      cy.wait(['@putProfileInfo200']);
      cy.get('[data-cy=successProfileUpdate]');
      cy.get('html').should('have.attr', 'lang', 'en');
    });
  });

  describe('Негативные проверки', () => {
    it('Ошибка 500 при загрузке', () => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current*', usersBalances.non_zero_values).as('getBalance');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile*',
        response: profileInfoEmpty,
        status: 500
      }).as('getProfileInfo');

      cy.visit('/profile/info', {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });
      cy.url().should('include', '/profile/info');
      cy.wait(['@getProfileInfo', '@getInfo']);

      cy.get('[data-cy=profileEdit]');
      cy.get('[data-cy^="server_error_500"][data-cy*="api/profile"]');
    });

    it('Заполняем поля, отправляем форму, видим ошибку 500', () => {
      cy.profileEdit(profileInfoFilled);

      cy.route({
        method: 'PUT',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        delay: 500,
        status: 500
      }).as('putProfileInfo500');

      cy.get('[data-cy=profileEdit]').submit();

      cy.wait(['@putProfileInfo500']);

      cy.get('[data-cy^="server_error_500"][data-cy*="api/profile"]');
    });

    it('Отправляем заполненую форму, видим страницу логина 401', () => {
      cy.profileEdit(profileInfoFilled);

      cy.route({
        method: 'PUT',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        delay: 500,
        status: 401
      }).as('putProfileInfo401');

      cy.get('[data-cy=profileEdit]').submit();

      cy.wait(['@putProfileInfo401']);

      cy.url().should('include', '/profile/info');

      cy.get('[data-cy=login]');
    });
  });
});
