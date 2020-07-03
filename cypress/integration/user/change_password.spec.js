const profileInfoFilled = require('../../fixtures/profile/input/profile_info_filled.json');
const user = require('../../fixtures/user.json');

describe('Profile change password', () => {
  describe('Базовое поведение', () => {
    before(() => {
      cy.clearCookies();
      cy.profileEdit(profileInfoFilled);
    });

    it('Модалка открывается по кнопке в профиле', () => {
      cy.get('[data-cy=change_password_button]').click({ force: true });
      cy.get('[data-cy=change_password_modal]').should('exist');
    });

    it('Кликаем на крестик и модалка закрывается', () => {
      cy.get('[data-cy=modal-close]').click({ force: true });
      cy.get('[data-cy=change_password_modal]').should('not.exist');
    });

    it('В обоих инпутах есть кнопка, при клике на которую меняется отображение вводимых данных', () => {
      cy.get('[data-cy=change_password_button]').click({ force: true });

      cy.get('[data-cy=password_old]').type('12345old');
      cy.get('[data-cy=password_old]').should('have.attr', 'type', 'password');
      cy.get('[data-cy=password_old-button] > button').click();
      cy.get('[data-cy=password_old]').should('have.attr', 'type', 'text');

      cy.get('[data-cy=password_new]').type('12345new');
      cy.get('[data-cy=password_new]').should('have.attr', 'type', 'password');
      cy.get('[data-cy=password_new-button] > button').click();
      cy.get('[data-cy=password_new]').should('have.attr', 'type', 'text');
    });
  });

  describe('Позитивные проверки', () => {
    before(() => {
      cy.clearCookies();
      cy.profileEdit(profileInfoFilled);

      cy.get('[data-cy=change_password_button]').click({ force: true });
    });

    it('Пароль изменяется успешно', () => {
      cy.route({
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile/password',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        status: 200,
        onRequest: xhr => {
          expect(xhr.request.body).to.deep.equal({
            password_old: user.password,
            password_new: user.password_new
          });
        },
        onResponse: xhr => { }
      }).as('postChangePassword200');

      cy.get('[data-cy=password_old]')
        .clear()
        .type(user.password)
        .should('have.value', user.password);

      cy.get('[data-cy=password_new]')
        .clear()
        .type(user.password_new)
        .should('have.value', user.password_new);

      cy.get('[data-cy=change_password_modal]').submit();
      cy.wait(['@postChangePassword200']);
      cy.get('[data-cy=successChangePassword');
    });
  });

  describe('Негативные проверки', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.profileEdit(profileInfoFilled);

      cy.get('[data-cy=change_password_button]').click({ force: true });
    });

    it('Ошибка валидации - неправильный текущий пароль', () => {
      cy.route({
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile/password',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        status: 400
      }).as('postChangePassword400');

      cy.get('[data-cy=password_old]')
        .clear()
        .type(user.password_new)
        .should('have.value', user.password_new);

      cy.get('[data-cy=password_new]')
        .clear()
        .type(user.password_new)
        .should('have.value', user.password_new);

      cy.get('[data-cy=change_password_modal]').submit();
      cy.wait(['@postChangePassword400']);
      cy.get('[data-cy=change_password_modal]');
      cy.get('[data-cy=password_old-error]');
    });

    it('Ошибка валидации - короткий новый пароль', () => {
      cy.get('[data-cy=password_old]')
        .clear()
        .type(user.password)
        .should('have.value', user.password);

      cy.get('[data-cy=password_new]')
        .clear()
        .type(user.invalid_password)
        .should('have.value', user.invalid_password);

      cy.get('[data-cy=change_password_modal]').submit();
      cy.get('[data-cy=change_password_modal]').should('exist');
      cy.get('[data-cy=password_new-error]').should('exist');
    });

    it('Ошибка 500', () => {
      cy.route({
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/profile/password',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Token': null
        },
        response: {},
        status: 500
      }).as('postChangePassword500');

      cy.get('[data-cy=password_old]')
        .clear()
        .type(user.password)
        .should('have.value', user.password);

      cy.get('[data-cy=password_new]')
        .clear()
        .type(user.password_new)
        .should('have.value', user.password_new);

      cy.get('[data-cy=change_password_modal]').submit();
      cy.wait(['@postChangePassword500']);
      cy.get('[data-cy=chanvvge_password_modal]').should('not.exist');
      cy.get('[data-cy^="server_error_500"][data-cy*="api/profile"]');
    });
  });
});
