const user = require('../../fixtures/user.json');

const types = {
  admin: {
    email: user.email,
    password: user.password
  },
  user: {
    email: user.email,
    password: user.password
  },
  badUser: {
    email: user.bad_email,
    password: user.bad_password
  }
};

Cypress.Commands.add('login', userType => {
  const currentUser = types[userType];

  cy.request({
    method: 'POST',
    mode: 'cors',
    credentials: 'same-origin',
    url: '/api/sessions.json',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: {
        email: currentUser.email,
        password: currentUser.password
      },
      mobile_app: 'true',
      locale: 'ru'
    }),
    failOnStatusCode: false
  }).then(response => {
    if (response.status === 400) {
      return response;
    }

    const token = response.headers['set-cookie'][0]
      .replace('app_remember_token=', '')
      .split(';')[0];

    cy.setCookie('app_remember_token', token);
    cy.setCookie('app_locale', 'ru');
  });
});
