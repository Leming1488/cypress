const user = require('../fixtures/user.json');
const usersInfo = require('../fixtures/users/input/users_info.json');
const errors = require('../fixtures/errors.json');

describe('Authentication User', () => {
  before(() => {
    cy.server();

    cy.route({
      method: 'GET',
      url: '/api/users/info*',
      response: errors.error_401,
      status: 401
    }).as('userInfo');

    cy.clearCookies();

    cy.visit('/dashboard', {
      onBeforeLoad(win) {
        delete win.fetch;
      }
    });

    cy.wait(['@userInfo']);
  });

  describe('401 - Если не авторизован', () => {
    it('Переходим на главную страницу, попадаем на страницу логина', () => {
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=login]').should('exist');
    });
  });

  describe('Регистрация', () => {
    before(() => {
      cy.visit('auth/registration');
      cy.url().should('include', 'auth/registration');
      cy.get('[data-cy=registration]').should('exist');
    });

    it('Переходим по ссылке логин, видим форму; возвращаемся обратно', () => {
      cy.get('[data-cy=login-link]').click({ force: true });
      cy.url().should('include', 'auth/login');
      cy.get('[data-cy=login]').should('exist');
      cy.go('back');
    });

    it('Видим поля формы и они пустые', () => {
      cy.get('[data-cy=password]').should('have.value', '');
      cy.get('[data-cy=email]').should('have.value', '');
      cy.get('[data-cy="email-error"]').should('not.exist');
      cy.get('[data-cy="password-error"]').should('not.exist');
    });

    it('Заполняем поле email не валидным значением, пытаемся зарегистрироваться, видим ошибку', () => {
      cy.get('[data-cy=email]')
        .type(`{selectall}${user.invalid_email}`)
        .should('have.value', user.invalid_email);

      cy.get('[data-cy=registration_form_submit]').click();
      cy.get('[data-cy="email-error"]').should('exist');
    });

    it('Заполняем поля существующими данными, пытаемся зарегистрироваться, видим ошибку', () => {
      cy.get('[data-cy=email]')
        .clear()
        .type(`{selectall}${user.email}`)
        .should('have.value', user.email);

      cy.get('[data-cy=password]')
        .clear()
        .type(`{selectall}${user.password}`)
        .should('have.value', user.password);

      cy.get('[data-cy=registration_form_submit]').click();
      cy.get('[data-cy="email-error"]').should('exist');
    });

    it('Заполняем недействительный "промокод", видим ошибку', () => {
      cy.get('[data-cy=email]').type(`{selectall}${user.email}`);
      cy.get('[data-cy=password]').type(`{selectall}${user.password}`);
      cy.get('[data-cy=promo-link]').click();

      cy.get('[data-cy=promotion_code_name]')
        .type(`{selectall}${user.invalid_promotion_code_name}`)
        .should('have.value', user.invalid_promotion_code_name);

      cy.get('[data-cy=registration_form_submit]').click();
      cy.get('[data-cy=promotion_code_name-error]').should('exist');
    });

    it('Заполняем поля, регистрируемся; не видим ошибки', () => {
      cy.get('[data-cy=email]').type(`{selectall}${user.email}`);
      cy.get('[data-cy=password]').type(`{selectall}${user.password}`);

      cy.get('[data-cy=promotion_code_name]')
        .type(`{selectall}${user.promotion_code_name}`)
        .should('have.value', user.promotion_code_name);

      cy.get('[data-cy=registration_form_submit]').click();
      cy.get('[data-cy=promotion_code_name-error]').should('not.exist');
    });

    it('Если есть кука `promotion_code` - ее значение подставляется в поле промо кода', () => {
      cy.setCookie('promotion_code', user.promotion_code_name);
      cy.visit('/auth/registration');
      cy.get('[data-cy=promotion_code_name]').should('have.value', user.promotion_code_name);
    });

    it('Если в урл есть `promotion_code` - ее значение подставляется в поле промо кода', () => {
      cy.visit(`/auth/registration?promotion_code=${user.promotion_code_name}`);
      cy.get('[data-cy=promotion_code_name]').should('have.value', user.promotion_code_name);
    });

    it('При отправке формы регистрации с промо-кодом, данные уходят корректно', () => {
      cy.server();

      cy.route({
        method: 'GET',
        url: '/api/users/info*',
        response: errors.error_401,
        status: 401
      }).as('userInfo');

      cy.route({
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/users*',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        delay: 500,
        status: 200,
        onRequest: xhr => {
          expect(xhr.request.body.user).to.deep.equal({
            email: user.email,
            password: user.password,
            promotion_code_name: user.promotion_code_name,
            read_agreement: true
          });
        },
        onResponse: () => {}
      }).as('sendRequest');

      cy.setCookie('promotion_code', user.promotion_code_name);

      cy.visit('/auth/registration', {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.wait(['@userInfo']);

      cy.get('[data-cy=email]').type(`{selectall}${user.email}`);
      cy.get('[data-cy=password]').type(`{selectall}${user.password}`);

      cy.get('[data-cy=registration_form_submit]').click();

      cy.wait(['@sendRequest']);
    });
  });
});
