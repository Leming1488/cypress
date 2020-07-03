const links_generator_input = require('../../fixtures/program/input/links_generator.json');
const links_generator_output = require('../../fixtures/program/output/links_generator.json');
const common = require('../../fixtures/program/input/common.json');
const usersInfo = require('../../fixtures/users/input/users_info.json');
const usersBalances = require('../../fixtures/users/input/balances.json');
const tools_types = require('../../fixtures/program/input/tools_types.json');

describe('Program tools links generator', function() {
  describe('Есть данные', () => {
    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.programLinksGenerator(links_generator_input.with_data);
    });

    it('Страница отображается', () => {
      cy.get('[data-cy=links_generator]').should('exist');
    });

    it('Первый заголовок скрыт', () => {
      cy.get('[data-cy=links_generator]:nth-of-type(1) [data-cy=links_generator_header]').should(
        'not.exist'
      );
    });

    it('Второй заголовок отображается', () => {
      cy.get('[data-cy=links_generator]:nth-of-type(2) [data-cy=links_generator_header]').should(
        'exist'
      );
    });

    it('Видим все элементы на странице', () => {
      cy.get('[data-cy=links_generator]').each(($el, i) => {
        expect($el.find('[data-cy=custom_link]'))
          .attr('value')
          .to.equal(links_generator_input.with_data.generator_links[i].default_link);

        expect($el.find('[data-cy=sub_id]'))
          .attr('value')
          .to.equal('');

        expect($el.find('[data-cy=generated_link]')).attr('readonly');

        expect($el.find('[data-cy=generated_link]')).to.contain(
          links_generator_output.generated_links[i].no_sub_id
        );

        expect($el.find('[data-cy=generated_link-wrapper] .copy')).to.exist;

        if (!i) {
          expect($el.find('[data-cy=html_message]')).to.exist;
          expect($el.find('[data-cy=html_message]')).to.contain(
            links_generator_input.with_data.generator_links[i].html_message
          );
        } else {
          expect($el.find('[data-cy=html_message]')).to.not.exist;
        }
      });
    });
  });

  describe('Нет данных', () => {
    before(() => {
      cy.clearCookies();
      cy.programLinksGenerator(links_generator_input.no_data);
    });

    it('Страница пустая', () => {
      cy.get('[data-cy=links_generator]').should('not.exist');
    });
  });

  describe('Ошибка получения данных', () => {
    before(() => {
      cy.server();
      cy.route('GET', '/api/users/info.json', usersInfo).as('getInfo');
      cy.route('GET', '/api/balances/current.json*', usersBalances.non_zero_values).as(
        'getBalance'
      );
      cy.route('GET', '/api/offers/91/common*', common).as('getCommon');
      cy.route('GET', '/api/offers/91/tools_types*', tools_types).as('getToolsTypes');

      cy.route({
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        url: '/api/offers/91/tools/generator_links*',
        response: {},
        status: 500
      }).as('getLinksGenerator');

      cy.clearCookies();

      cy.visit(`/programs/91/tools/links_generator`, {
        onBeforeLoad(win) {
          delete win.fetch;
        }
      });

      cy.url().should('include', '/programs/91/tools/links_generator');

      cy.wait(['@getInfo', '@getBalance', '@getCommon', '@getLinksGenerator']);
    });

    it('Видим уведомление об ошибке', () => {
      cy.get('[data-cy^=server_error_500]').should('exist');
    });
  });

  describe('Взаимодействие', () => {
    before(() => {
      cy.clearLocalStorage();
      cy.programLinksGenerator(links_generator_input.with_data);
    });

    it('Меняем адрес целевой страницы', () => {
      cy.get('[data-cy=links_generator]').each(($el, i) => {
        cy.get($el.find('[data-cy=custom_link]'))
          .clear()
          .type(links_generator_input.changed_custom_link);

        cy.get($el.find('[data-cy=generated_link]')).should(
          'have.text',
          links_generator_output.generated_links[i].with_changed_custom_link
        );
      });
    });

    it('Меняем sub id у генератора', () => {
      cy.get('[data-cy=links_generator]').each(($el, i) => {
        cy.get($el.find('[data-cy=custom_link]'))
          .clear()
          .type(links_generator_input.with_data.generator_links[i].default_link);

        cy.get($el.find('[data-cy=sub_id]'))
          .clear()
          .type(links_generator_input.generator_sub_id_value);

        cy.get($el.find('[data-cy=generated_link]')).should(
          'have.text',
          links_generator_output.generated_links[i].with_generator_sub_id
        );
      });
    });
  });

  describe('Глобальный sub id существует при заходе на страницу', () => {
    before(() => {
      localStorage.setItem(
        links_generator_input.global_sub_id_field,
        links_generator_input.global_sub_id_value
      );
      cy.programLinksGenerator(links_generator_input.with_data);
    });

    it('Глобальный sub id подставляется по умолчанию в поле sub_id генератора', () => {
      cy.get('[data-cy=links_generator]').each(($el, i) => {
        expect($el.find('[data-cy=sub_id]'))
          .attr('value')
          .to.equal(localStorage.getItem(links_generator_input.global_sub_id_field));

        cy.get($el.find('[data-cy=generated_link]')).should(
          'have.text',
          links_generator_output.generated_links[i].with_global_sub_id
        );
      });
    });

    it('Очищаем значение sub id генератора', () => {
      cy.get('[data-cy=links_generator]').each(($el, i) => {
        cy.get($el.find('[data-cy=sub_id]')).clear();

        cy.get($el.find('[data-cy=generated_link]')).should(
          'have.text',
          links_generator_output.generated_links[i].no_sub_id
        );
      });
    });
  });
});
