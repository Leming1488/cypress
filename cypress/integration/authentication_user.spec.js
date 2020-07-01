const user = require('../fixtures/user.json');

describe('Authentication User', () => {
  before(() => {
    cy.clearCookies();

    cy.visit('/', {
      onBeforeLoad(window) {
        delete window.fetch;
      }
    });
    cy.url().should('include', 'login');
    cy.get('[data-cy=login]').should('exist');
  });

  describe('Если не авторизован', () => {
    it('Переходим на главную страницу, попадаем на страницу логина', () => {
      cy.visit('/');
      cy.url().should('include', 'login');
      cy.get('[data-cy=login]').should('exist');
    });
  });

  describe('Авторизация', () => {
    before(() => {
      cy.visit('/login');
      cy.url().should('include', 'login');
      cy.get('[data-cy=login]').should('exist');
    });

    it('Видим поля формы и они пустые, не видим ошибки', () => {
      cy.get('[data-cy=password]').should('have.value', '');
      cy.get('[data-cy=email]').should('have.value', '');
      cy.get('[data-cy="email-error"]').should('not.visible');
    });

    it('Заполняем поле email не валидным значением, кликаем по кнопке войти, видим тект ошибки', () => {
      cy.get('[data-cy=email]')
        .type(user.invalid_email)
        .should('have.value', user.invalid_email);

      cy.get('[data-cy=auth_form_submit]').click();
      cy.get('[data-cy="email-error"]').should('be.visible');
    });

    it('Заполняем поле password, кликаем по кнопке войти, видим тект ошибки', () => {
      cy.get('[data-cy=email]')
        .clear()
        .type(user.email)
        .should('have.value', user.email);

      cy.get('[data-cy=password]')
        .type(user.invalid_password)
        .should('have.value', user.invalid_password);

      cy.get('[data-cy=auth_form_submit]').click();
      cy.get('[data-cy="password-error"]').should('be.visible');
    });

    it('Заполняем поле email валидным значением, кликаем по кнопке войти, не видим ошибку', () => {
      cy.get('[data-cy=email]')
        .clear()
        .type(user.email)
        .should('have.value', user.email);

      cy.get('[data-cy=auth_form_submit]').click();
      cy.get('[data-cy="email-error"]').should('not.visible');
    });

    it('Заполняем поле password валидным значением (> 6 символов), кликаем по кнопке войти, не видим ошибку', () => {
      cy.get('[data-cy=password]')
        .clear()
        .type(user.password)
        .should('have.value', user.password);

      cy.get('[data-cy=auth_form_submit]').click();
      cy.get('[data-cy="password-error"]').should('not.visible');
    });
  });
});
