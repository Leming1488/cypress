const inputServices = require("../fixtures/services/input/services.json");
const outputServices = require("../fixtures/services/output/services.json");
const usersInfo = require("../fixtures/users/input/users_info.json");
const usersBalances = require("../fixtures/users/input/balances.json");

const inputServicesLong = {
  records: [
    ...inputServices.records,
    ...inputServices.records.map((item) => ({ ...item, id: `${item.id}1` })),
    ...inputServices.records.map((item) => ({ ...item, id: `${item.id}2` })),
    ...inputServices.records.map((item) => ({ ...item, id: `${item.id}3` })),
    ...inputServices.records.map((item) => ({ ...item, id: `${item.id}4` })),
    ...inputServices.records.map((item) => ({ ...item, id: `${item.id}5` })),
    ...inputServices.records.map((item) => ({ ...item, id: `${item.id}6` }))
  ]
};

describe("Services", function () {
  describe("Есть данные", function () {
    before(function () {
      cy.clearCookies();
      cy.services(inputServices);
    });

    it(`Видим элементы = ${inputServices.records.length}`, () => {
      cy.get("[data-cy^=services__item--]").should(
        "have.length",
        inputServices.records.length
      );
    });

    [inputServices.records[0], inputServices.records[1], inputServices.records[3]].forEach((item) => {
      describe(`Элемент "${item.fields.key}"`, () => {
        beforeEach(() => {
          cy.get(`[data-cy=services__item--${item.fields.key}]`).as("card");
        });

        it("Есть все тэги", () => {
          cy.get("@card")
            .find("[data-cy=services__item-tag]")
            .should("have.length", item.fields.tags.length);
        });

        it("Показывается лого или заглушка", () => {
          if (item.fields.logo && item.fields.logo[0]) {
            cy.get("@card")
              .find("[data-cy=services__item-logo]")
              .should("have.attr", "src", item.fields.logo[0].url);
          } else {
            cy.get("@card")
              .find("[data-cy=services__item-logo__stub]")
              .should("exist");
          }
        });

        it("Правильный заголовок", () => {
          cy.get("@card")
            .find("[data-cy=services__item-title]")
            .should("have.text", item.fields.title);
        });

        it("Правильное описание", () => {
          cy.get("@card")
            .find("[data-cy=services__item-description]")
            .should("have.text", item.fields.description);
        });

        if (item.fields.bonus) {
          it("Есть html текст описания бонуса", () => {
            cy.get("@card")
              .find("[data-cy=services__item-bonus]")
              .should("have.html", item.fields.bonus);
          });
        } else {
          it("Нет html текста описания бонуса", () => {
            cy.get("@card")
              .find("[data-cy=services__item-bonus]")
              .should('not.exist');
          });
        }

        if (item.fields.conditions) {
          it("Есть html список условий", () => {
            cy.get("@card")
              .find("[data-cy=services__item-conditions]")
              .should("have.html", item.fields.conditions);
          });
        } else {
          it("Нет html списка условий", () => {
            cy.get("@card")
              .find("[data-cy=services__item-conditions]")
              .should('not.exist');
          });
        }

        it("У кнопки правильная ссылка", () => {
          cy.get("@card")
            .find("[data-cy=services__item-button]")
            .should("have.attr", "href", item.fields.button_link);
        });

        it("У кнопки правильный текст", () => {
          cy.get("@card")
            .find("[data-cy=services__item-button]")
            .should("have.text", item.fields.button_text);
        });

        it("Ссылка открывается в новом окне", () => {
          cy.get("@card")
            .find("[data-cy=services__item-button]")
            .should("have.attr", "target", "_blank");
        });

        if (item.fields.promo_label && item.fields.promo_value) {
          it("Показывается текст промо кода", () => {
            cy.get("@card")
              .find("[data-cy=services__item-promo]")
              .should("contain", item.fields.promo_label);
          });

          it("Показывается промо код на кнопке", () => {
            cy.get("@card")
              .find("[data-cy=services__item-promo] .copy-button")
              .should("have.text", item.fields.promo_value);
          });
        }
      });
    });

    describe("Фильтры", () => {
      describe("Базовое отображение", () => {
        before(function () {
          cy.clearCookies();
          cy.services(inputServices);
        });

        it("Фильтр-тэги строятся в нужном количестве", () => {
          cy.get(`[data-cy=filter_item__tag]`).should(
            "have.length",
            outputServices.tags.length
          );
        });

        it("Фильтр 'Все' активен", () => {
          cy.get("[data-cy=filter_item__tag]:eq(0) button").should(
            "have.class",
            "filter_tags-button--active"
          );
        });
      });

      describe("Работоспособность фильтров", () => {
        it("Кликаем по 1 тэгу", () => {
          cy.get(
            `[data-cy=filter_item__tag]:eq(1) .filter_tags-button`
          ).click();
        });

        it("'SEO' тэг активен", () => {
          cy.get(`[data-cy=filter_item__tag]:eq(1) .filter_tags-button`).should(
            "have.class",
            "filter_tags-button--active"
          );
        });

        it("Отображаются карточки, отфильтрованные по первому тэгу", () => {
          cy.get("[data-cy=services__item--logaster]").should("exist");
        });

        it("Кликаем по 2 тэгу", () => {
          cy.get(
            `[data-cy=filter_item__tag]:eq(2) .filter_tags-button`
          ).click();
        });

        it("Отображаются карточки, отфильтрованные по обоим тэгам", () => {
          cy.get("[data-cy=services__item--logaster]").should("exist");
          cy.get("[data-cy=services__item--appfollow]").should("exist");
        });

        it("Фильтр 'Все' не активен", () => {
          cy.get("[data-cy=filter_item__tag]:eq(0) button").should(
            "not.have.class",
            "filter_tags-button--active"
          );
        });

        it("Кликаем по 1 тэгу", () => {
          cy.get(
            `[data-cy=filter_item__tag]:eq(1) .filter_tags-button`
          ).click();
        });

        it("'Создание сайтов' тэг не активен", () => {
          cy.get(`[data-cy=filter_item__tag]:eq(1) .filter_tags-button`).should(
            "not.have.class",
            "filter_tags-button--active"
          );
        });

        it("Применённая фильтрация отображается в адресной строке", () => {
          cy.location("href").should("include", "tags=SDK");
        });
      });
    });

    describe("Постраничная навигация", () => {
      describe("Базовое отображение", () => {
        before(() => {
          cy.clearCookies();
          cy.services(inputServicesLong);

          cy.get("[data-cy=pagination]").should("exist");
        });

        it("Есть выбор количества строк на страницу", () => {
          cy.get("[data-cy=pagination-limit__select]").should("exist");
        });

        it("Есть инпут с текущим номером страницы", () => {
          cy.get("[data-cy=pagination-current__input]").should("exist");
        });

        it('Есть кнопка "назад"', () => {
          cy.get("[data-cy=pagination-prev]").should("exist");
        });

        it('Есть кнопка "вперед"', () => {
          cy.get("[data-cy=pagination-next]").should("exist");
        });
      });

      describe("Первая страница из нескольких", () => {
        before(() => {
          cy.clearCookies();
          cy.services(inputServicesLong);
        });

        it("Страница по-умолчанию = первая", () => {
          cy.get("[data-cy=pagination-current__input]").should(
            "have.value",
            "1"
          );
        });

        it('Кнопка "назад" не активна', () => {
          cy.get("[data-cy=pagination-prev]").should("have.attr", "disabled");
        });

        it('Кнопка "вперед" активна', () => {
          cy.get("[data-cy=pagination-next]").should(
            "not.have.attr",
            "disabled"
          );
        });
      });

      describe("Всего 1 страница", () => {
        before(() => {
          cy.clearCookies();
          cy.services(inputServices);
        });

        it("Постраничная навигация не показывается", () => {
          cy.get("[data-cy=pagination]").should("not.exist");
        });
      });

      describe("Работоспособность постраничной навигации", () => {
        describe("Изменение количества элементов на страницу", () => {
          const fieldName = "limit";
          const selectedLimit = "50";
          const expectedGetParams = `${fieldName}=${selectedLimit}`;

          before(() => {
            cy.clearCookies();
            cy.services(inputServicesLong);
          });

          it("Поле изменяется и применяется", () => {
            cy.get("[data-cy=pagination-limit__select]")
              .click({ force: true })
              .find("label")
              .eq(1)
              .click({ force: true });
          });

          it("Применённый лимит отображается в адресной строке", () => {
            cy.url().should("include", expectedGetParams);
          });
        });

        describe("Изменение номера страницы через поле", () => {
          const fieldName = "offset";
          const inputString = "30";
          const expectedGetParams = `${fieldName}=${inputString}`;

          before(() => {
            cy.clearCookies();
            cy.services(inputServicesLong);
          });

          it("Поле изменяется и применяется", () => {
            cy.get("[data-cy=pagination-current__input]")
              .type(`{selectall}2`, { force: true })
              .blur();
            cy.get("[data-cy=pagination-current__input]").should(
              "have.value",
              "2"
            );
          });

          it("Соответствующий offset отображается в адресной строке", () => {
            cy.url().should("include", expectedGetParams);
          });

          it('Кнопка "назад" становится активной', () => {
            cy.get("[data-cy=pagination-prev]").should(
              "not.have.attr",
              "disabled"
            );
          });
        });

        describe('Переход по кнопке "вперед"', () => {
          const fieldName = "offset";
          const inputString = "30";
          const expectedGetParams = `${fieldName}=${inputString}`;

          before(() => {
            cy.clearCookies();
            cy.services(inputServicesLong);
          });

          it("Клик по кнопке меняет номер страницы", () => {
            cy.get("[data-cy=pagination-next]").click({ force: true });
            cy.get("[data-cy=pagination-current__input]").should(
              "have.value",
              "2"
            );
          });

          it("Соответствующий offset отображается в адресной строке", () => {
            cy.url().should("include", expectedGetParams);
          });

          it('Кнопка "назад" становится активной', () => {
            cy.get("[data-cy=pagination-prev]").should(
              "not.have.attr",
              "disabled"
            );
          });
        });

        describe('Переход по кнопке "назад"', () => {
          const fieldName = "offset";
          const expectedGetParams = `${fieldName}=0`;

          before(() => {
            cy.clearCookies();

            cy.server();
            cy.route("GET", "/api/users/info.json", usersInfo).as("getInfo");
            cy.route(
              "GET",
              "/api/balances/current.json*",
              usersBalances.non_zero_values
            ).as("getBalance");
            cy.route("GET", "/api/services/airtable*", inputServicesLong).as(
              "services"
            );

            cy.visit("/services?offset=30", {
              onBeforeLoad(win) {
                delete win.fetch;
              },
            });

            cy.url().should("include", "/services");

            cy.wait(["@getInfo", "@getBalance", "@services"]);
          });

          it("Клик по кнопке меняет номер страницы", () => {
            cy.get("[data-cy=pagination-prev]").click({ force: true });
            cy.get("[data-cy=pagination-current__input]").should(
              "have.value",
              "1"
            );
          });

          it("Соответствующий offset отображается в адресной строке", () => {
            cy.url().should("not.include", expectedGetParams);
          });

          it('Кнопка "назад" становится не активной', () => {
            cy.get("[data-cy=pagination-prev]").should("have.attr", "disabled");
          });
        });
      });
    });
  });

  describe("Нет данных", () => {
    before(() => {
      cy.clearCookies();
      cy.services({ records: [] });
    });

    it('Видим ламу с текстом "нет данных"', () => {
      cy.get("[data-cy=services__empty]").should("exist");
    });
  });

  describe("Ошибка получения данных", () => {
    before(() => {
      cy.server();
      cy.route("GET", "/api/users/info.json", usersInfo).as("getInfo");
      cy.route(
        "GET",
        "/api/balances/current.json*",
        usersBalances.non_zero_values
      ).as("getBalance");

      cy.route({
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
        url: "/api/services/airtable*",
        response: inputServices,
        status: 500,
      }).as("services");

      cy.clearCookies();

      cy.visit("/services", {
        onBeforeLoad(win) {
          delete win.fetch;
        },
      });

      cy.url().should("include", "/services");

      cy.wait(["@getInfo", "@getBalance", "@services"]);
    });

    it("Видим уведомление об ошибке", () => {
      cy.get("[data-cy^=server_error_500]").should("exist");
    });

    it('Видим ламу с текстом "нет данных"', () => {
      cy.get("[data-cy=services__empty]").should("exist");
    });
  });
});
