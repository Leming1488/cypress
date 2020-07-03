const linksInput = require('../../fixtures/program/input/links.json');
const constants = require('../../fixtures/program/output/tools_sub_id.json');

describe('Program - Tools - Sub ID', function() {
  describe('Общее отображение', () => {
    before(() => {
      cy.clearLocalStorage();
      cy.programLinks(linksInput.not_zero_values);
    });

    it('Поле ввода Sub ID пустое', () => {
      cy.get('[data-cy=tools_sub_id]').should('have.value', '');
    });

    it('В поле ввода нет иконки крестика', () => {
      cy.get(`[data-cy=tools_sub_id_clear_btn]`).should('not.exist');
    });
  });

  describe('Взаимодействие', () => {
    it('Значение инпута записывается в Local Storage', () => {
      cy.get(`[data-cy=tools_sub_id]`)
        .clear()
        .type(constants.input_value)
        .should(() => {
          cy.wait(constants.typing_delay);
          expect(localStorage.getItem(constants.sub_id_field)).to.eq(constants.input_value);
        });
    });

    it('SubID поле удаляется из Local Storage, если инпут становится пустым', () => {
      cy.get(`[data-cy=tools_sub_id]`)
        .clear()
        .should(() => {
          cy.wait(constants.typing_delay);
          expect(localStorage.getItem(constants.sub_id_field)).to.eq(null);
        });
    });

    it('При вводе текста отображается лоадер в инпуте', () => {
      cy.get(`[data-cy=tools_sub_id]`).type(constants.input_value);
      cy.get(`[data-cy=tools_sub_id_loader]`).should('exist');
    });

    it('Очищаем инпут, нажимая на крестик', () => {
      cy.get(`[data-cy=tools_sub_id_clear_btn]`).click();
      cy.get(`[data-cy=tools_sub_id]`).should('have.value', '');
    });

    describe('Загрузка страницы с существуюшим Sub ID в Local Storage', () => {
      before(() => {
        localStorage.setItem(constants.sub_id_field, constants.input_value_2);
        cy.programLinks(linksInput.not_zero_values);
      });

      it('Инпут содержит значение Sub ID из Local Storage', () => {
        cy.get('[data-cy=tools_sub_id]').should('have.value', constants.input_value_2);
      });

      it('В поле ввода есть иконка крестика', () => {
        cy.get(`[data-cy=tools_sub_id_clear_btn]`).should('exist');
      });
    });
  });
});
