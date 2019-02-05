Data = function() {
  "use strict";

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DISPLAY = FACTORY.Display,
    DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    PAUSE = () => DELAY(RANDOM(200, 500)),
    LONG_PAUSE = () => DELAY(RANDOM(1000, 3000)),
    GEN = {
      b: p => chance.bool({
        likelihood: p ? p : 50
      }),
      s: l => l === undefined ? chance.string() : chance.string({
        length: l
      }),
      p: (l, p) => chance.string(
        _.extend(l === undefined ? {} : {
          length: l
        }, p === undefined ? {} : {
          pool: p
        })),
      a: l => GEN.p(l, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
      n: l => GEN.p(l, "0123456789"),
      an: l => GEN.p(l, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
      t: l => GEN.p(l, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 _-.,:;()!?'"),
      i: (min, max) => min === undefined || max === undefined ? chance.integer : chance.integer({
        min: min,
        max: max
      }),
      c: () => GEN.p(6, "0123456789abcdef")
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var debug, expect, dialog;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _modal = (template, options, populate, check) => DISPLAY.modal(template, _.extend({
    backdrop: false,
    class: debug ? "" : "d-none",
  }, options), modal => {
    FACTORY.Fields({
      me: FACTORY.me ? FACTORY.me.full_name : undefined,
      templater: DISPLAY.template.get
    }, FACTORY).on(modal);
    dialog.handlers.keyboard.enter(modal);
    if (populate) populate(modal);
    (debug ? LONG_PAUSE : PAUSE)().then(
      () => modal.find(".modal-footer > .btn.btn-primary").click()
    );
  }).then(values => check ? check(values) : values);
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      /* <!-- Set Up Testing Framework --> */
      debug = FACTORY.Flags.debug();
      expect = chai.expect;
      dialog = FACTORY.Dialog({}, FACTORY);

      return FACTORY.Flags.log("START Called").reflect(true);

    },

    dialogs: () => new Promise(resolve => {

      PAUSE().then(() => {

        var _err = e => resolve(FACTORY.Flags.error("Dialogs Test FAILED", e).reflect(false));

        var _dialog = (populate, check, state) => _modal("dialog", {
          id: "dialogs_dialog",
          title: "Testing Dialog",
          validate: values => values ? true : false,
          state: state,
        }, populate, check);

        var _set = {
          text: (el, val) => el.val(val),
          check: (el, val) => el.prop("checked", val),
          number: (el, val) => el.val(val),
        };

        var _values = () => ({
          text_1: {
            id: "textEntry1",
            type: "text",
            order: 1,
            value: GEN.s()
          },
          text_2: {
            id: "textEntry2",
            type: "text",
            order: 2,
            value: GEN.s(10)
          },
          text_3: {
            id: "textEntry3",
            type: "text",
            order: 3,
            value: GEN.t(10)
          },
          number_1: {
            id: "numberEntry1",
            type: "number",
            order: 11,
            name: "number___1",
            value: GEN.i(1, 99)
          },
          number_2: {
            id: "numberEntry2",
            type: "number",
            order: 11,
            name: "number___2",
            value: GEN.i(-10, 10),
            default: 0
          },
          check_1: {
            id: "checkEntry1",
            type: "check",
            name: "check___1",
            value: GEN.b(60),
            default: false,
          },
          drive_1: {
            id: "driveEntry1",
            type: "text",
            value: GEN.an(16)
          }
        });

        try {

          /* <!-- Test Generic Empty Dialog --> */
          _dialog(false, values => {

              /* <!-- Test Conditions --> */
              values = expect(values).to.be.an("object");
              var _state = _.pick(_values(), value => value.default !== undefined);
              _.each(_state, (value, key) => {
                values.to.have.deep.nested.property(`${key}.Value`, value.default);
                values.to.have.deep.nested.property(`${key}.Order`, false);
              });

              return true;

            })

            /* <!-- Test State Filled Dialog --> */
            .then(() => {
              var _state = _.omit(_values(), "drive_1");
              return _dialog(modal => {

                  /* <!-- Override Output Ordering --> */
                  _.each(
                    _.pick(_state, value => value.order !== undefined),
                    value => modal.find(`#${value.id}`).data("output-order", value.order));

                  /* <!-- Override Output Field Names --> */
                  _.each(
                    _.pick(_state, value => value.name !== undefined),
                    value => modal.find(`#${value.id}`).data("output-field", value.name));

                }, values => {

                  /* <!-- Test Conditions --> */
                  values = expect(values).to.be.an("object");
                  _.each(_state, (value, key) => {
                    var _name = value.name ? value.name : key,
                      _order = value.order ? value.order : false;
                    values.to.have.deep.nested.property(`${_name}.Value`, value.value);
                    values.to.have.deep.nested.property(`${_name}.Order`, _order);
                  });

                  return true;
                },
                _.reduce(_state,
                  (memo, value, key) => _.tap(memo, memo => memo[key] = value.value), {}));
            })

            /* <!-- Test Populated Dialog --> */
            .then(() => {
              var _state = _values();

              return _dialog(modal => {

                /* <!-- Populate Values --> */
                _.each(_state, value => _set[value.type](modal.find(`#${value.id}`), value.value));

              }, values => {

                /* <!-- Test Conditions --> */
                values = expect(values).to.be.an("object");
                _.each(_state, (value, key) => {
                  values.to.have.deep.nested.property(`${key}.Value`, value.value);
                });

                return true;

              });
            })
            .then(() => resolve(FACTORY.Flags.log("Dialogs Test SUCCEEDED").reflect(true)))
            .catch(_err);

        } catch (err) {
          _err(err);
        }

      });

    }),

    forms: () => new Promise(resolve => {

      PAUSE().then(() => {

        var _err = e => resolve(FACTORY.Flags.error("Forms Test FAILED", e).reflect(false));

        var _showdown = new showdown.Converter({
            tables: true
          }),
          _markdown = markdown => _showdown.makeHtml(markdown),
          _blocks = {
            basic: title => {
              if (title && debug) FACTORY.Flags.log("Generating Test FORM for:", title);
              return {
                id: `__${GEN.an(GEN.i(20, 30))}`,
                field: GEN.a(GEN.i(10, 15)),
                title: GEN.t(GEN.i(5, 25)),
                help: _markdown(GEN.t(GEN.i(10, 40))),
                large: GEN.b(),
                required: GEN.b(),
                _title: title,
              };
            },
            spans: [{
                value: "Custom",
                name: "Custom"
              },
              {
                span: "w",
                value: "Weekly",
                name: "Weekly"
              },
              {
                span: "M",
                value: "Monthly",
                name: "Monthly"
              },
              {
                span: "y",
                value: "Yearly",
                name: "Yearly"
              }
            ],
            options: () => _.map(_.range(GEN.i(2, 10)), () => ({
              class: `btn-${_.sample(
                              ["primary","info","success","warning","danger","dark"])}`,
              value: GEN.an(GEN.i(10, 30)),
              icon: _.sample(["", "visibility_off"])
            })),
            pairs: () => _.map(_.range(GEN.i(4, 20)), () => ({
              value: GEN.a(GEN.i(5, 10)),
              name: GEN.t(GEN.i(10, 30)),
            })),
            lists: () => _.map(_.range(GEN.i(4, 8)), () => ({
              value: GEN.a(GEN.i(5, 10)),
              name: GEN.t(GEN.i(10, 30)),
              class: `${GEN.a(GEN.i(5, 10))} ${GEN.b() ? "offline" : "paper"}`,
              divider: GEN.b(10)
            })),
            children: (level, options) => {
              if (level > GEN.i(1, 5)) return null;
              return _.map(_.range(1, GEN.i(2, 8)), number => {
                var _return = {
                  value: number,
                  details: GEN.t(GEN.i(0, 60)),
                };
                if (GEN.b(40)) _return.children = _blocks.children(level + 1, options);
                if (_return.children === null) delete _return.children;
                if (_return.children === undefined) { /* <!-- Evidence only if a Leaf --> */
                  if (GEN.b(90)) {
                    _return.evidence = true;
                    if (GEN.b(70))
                      _return._data = {
                        options: _.map(_.range(GEN.i(0, 4)), () => _.sample(options)),
                        details: GEN.t(GEN.i(0, 100))
                      };
                  }
                }
                return _return;
              });
            },
            scale: options => ({
              name: GEN.t(GEN.i(5, 20)),
              title: GEN.t(GEN.i(10, 30)),
              scale: _.map(_.range(1, GEN.i(2, 11)), number => {
                var _return = {
                  number: number,
                  type: GEN.t(GEN.i(5, 10)),
                  name: GEN.an(GEN.i(10, 20)),
                  details: GEN.t(GEN.i(0, 50)),
                  colour: `#${GEN.c()}`,
                  criteria: _.map(_.range(1, GEN.i(1, 6)), number => ({
                    value: number,
                    name: GEN.t(GEN.i(10, 30)),
                    details: _markdown(GEN.t(GEN.i(0, 200))),
                  })),
                };
                if (GEN.b(90)) _return.children = _blocks.children(1, options);
                if (_return.children === null) delete _return.children;
                return _return;
              })
            }),
          },
          _checks = {
            list: (list, map) => (name, values) => {
              list.length > 0 ?
                list.length == 1 ?
                values.to.have.deep.nested.property(`${name}.Values.Items`, map(list[0])) :
                values.to.have.deep.nested.property(`${name}.Values.Items`)
                .to.have.ordered.members(_.map(list, map)) :
                values.to.have.deep.nested.property(`${name}.Value`, false);
            },
          },
          _types = {
            textual_Me: () => {
              var _return = _.extend(_blocks.basic("Current User (Click)"), {
                template: "field_textual",
                icon: "face",
                button: "Me!",
                action: "me",
              });
              _return._value = (value => value)(FACTORY.me.full_name());
              _return._populate = (id => modal => {
                modal.find(`[data-id='${id}'] [data-action='me']`).first().click();
              })(_return.id);
              return _return;
            },
            textual_General: () => {
              var _return = _.extend(_blocks.basic("Textbox"), {
                template: "field_textual",
              });
              _return._value = GEN.b(70) ? GEN.t(GEN.i(1, 50)) : null;
              _return._populate = ((id, value) => modal => {
                value ? modal.find(`[data-id='${id}'] input[type='text']`).val(value) : false;
              })(_return.id, _return._value);
              return _return;
            },
            textual_Default: () => {
              var _return = _.extend(_blocks.basic("Current User (Default)"), {
                template: "field_textual",
                default: "me",
              });
              _return._value = FACTORY.me.full_name();
              return _return;
            },
            textual_Empty: () => {
              var _return = _.extend(_blocks.basic("Empty Value"), {
                template: "field_textual",
                value: "",
              });
              _return._value = null;
              return _return;
            },
            textual_Value: () => {
              var _return = _.extend(_blocks.basic("Default Value"), {
                template: "field_textual",
                value: GEN.b(90) ? GEN.t(GEN.i(1, 10)) : null,
              });
              _return._value = _return.value;
              return _return;
            },
            textual_Large: () => {
              var _return = _.extend(_blocks.basic("Textarea"), {
                template: "field_textual",
                rows: GEN.i(3, 6),
                wide: GEN.b(70),
                button: "Load",
                action: "load-g-doc",
              });
              _return._value = GEN.b(90) ? GEN.t(GEN.i(100, 500)) : null;
              _return._populate = ((id, value) => modal => {
                value ? modal.find(`[data-id='${id}'] textarea`).val(value) : false;
              })(_return.id, _return._value);
              return _return;
            },
            numeric_Empty: () => _.extend(_blocks.basic("Empty Numeric"), {
              template: "field_numeric",
              _value: null
            }),
            numeric_Stepped: () => {
              var _number = GEN.i(1, 2000),
                _return = _.extend(_blocks.basic("Numeric"), {
                  template: "field_numeric",
                  increment: _number,
                });
              _return._value = (value => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Values.Number`, value);
                values.to.have.deep.nested.property(`${name}.Values.Value`, String(value));
              })(_number);
              _return._populate = (id => modal => {
                modal.find(`[data-id='${id}'] button.btn-primary`).first().click();
              })(_return.id);
              return _return;
            },
            numeric_Complex: () => {
              var _number = GEN.i(2, 20),
                _value = GEN.b(80),
                _return = _.extend(_blocks.basic("Numeric (with suffix/details)"), {
                  template: "field_numeric",
                  increment: _number,
                  min: 0,
                  max: _number,
                  suffix: GEN.t(GEN.i(5, 10)),
                  details: GEN.t(GEN.i(10, 50)),
                });
              _return._value = ((value, suffix, details) => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Values.Number`, value);
                value ?
                  values.to.have.deep.nested.property(`${name}.Values.Value`, `${value} ${suffix}`) :
                  values.to.not.have.deep.nested.property(`${name}.Values.Value`);
                values.to.have.deep.nested.property(`${name}.Values.Details`, details);
              })(_value ? _number : 0, _return.suffix, _return.details);
              _return._populate = ((id, value, details) => modal => {
                modal.find(`[data-id='${id}'] button.btn-primary`).first().click();
                modal.find(`[data-id='${id}'] textarea`).val(details);
                if (!value) modal.find(`[data-id='${id}'] button.btn-info`).first().click();
              })(_return.id, _value, _return.details);
              return _return;
            },
            span_Empty: () => {
              var _default = "Custom",
                _return = _.extend(_blocks.basic("Empty Date Span"), {
                  template: "field_span",
                  icon: "query_builder",
                  type: _default,
                  options: _blocks.spans,
                });
              _return._value = (value => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Values.Type[0]`, value);
                values.to.have.deep.nested.property(`${name}.Values.Type[1]`, value);
              })(_default);
              return _return;
            },
            span_Date: () => {
              var _start = new Date(),
                _end = new Date(_start),
                _default = "Weekly",
                _details = GEN.t(GEN.i(10, 30)),
                _return = _.extend(_blocks.basic("Date Span"), {
                  template: "field_span",
                  icon: "query_builder",
                  type: _default,
                  options: _blocks.spans,
                  details: GEN.t(GEN.i(10, 30))
                });
              _end.setDate(_end.getDate() + 7);
              _return._value = ((value, start, end, details) => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Values.Type[0]`, value);
                values.to.have.deep.nested.property(`${name}.Values.Type[1]`, value);
                values.to.have.deep.nested.property(`${name}.Values.Start`,
                  start.toISOString().split("T")[0]);
                values.to.have.deep.nested.property(`${name}.Values.End`,
                  end.toISOString().split("T")[0]);
                values.to.have.deep.nested.property(`${name}.Values.Details`, details);
              })(_default, _start, _end, _details);
              _return._populate = ((id, start, end, details) => modal => {
                modal.find(`#${id}_START`).val(start.toISOString().split("T")[0]);
                modal.find(`#${id}_END`).val(end.toISOString().split("T")[0]);
                modal.find(`#${id}_DETAILS`).val(details);
              })(_return.id, _start, _end, _details);
              return _return;
            },
            radio_Empty: () => _.extend(_blocks.basic("Un-Selected Options"), {
              template: "field_radio",
              options: _blocks.options(),
              _value: false,
            }),
            radio_Options: () => {
              var _options = _blocks.options(),
                _option = _.sample(_options),
                _details = GEN.t(GEN.i(10, 50)),
                _return = _.extend(_blocks.basic("Selected Options"), {
                  template: "field_radio",
                  icon: "gavel",
                  options: _options,
                  details: GEN.t(GEN.i(10, 50)),
                });
              _return._value = ((option, details) => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Values.Value`, option.value);
                values.to.have.deep.nested.property(`${name}.Values.Details`, details);
              })(_option, _details);
              _return._populate = ((id, option, details) => modal => {
                modal.find(`[data-id='${id}'] input[data-value='${option.value}']`).first()
                  .parent("label").click();
                modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(details);
              })(_return.id, _option, _details);
              return _return;
            },
            select_Empty: () => {
              var _options = _blocks.pairs(),
                _option = _options[0],
                _return = _.extend(_blocks.basic("No Selection"), {
                  template: "field_select",
                  options: _options,
                });
              _return._value = (option => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Value`, option.value);
              })(_option);
              return _return;
            },
            select_Options: () => {
              var _options = _blocks.pairs(),
                _option = _.sample(_options),
                _details = GEN.b() ? GEN.t(GEN.i(10, 50)) : "",
                _return = _.extend(_blocks.basic("Selection"), {
                  template: "field_select",
                  icon: "query_builder",
                  options: _options,
                  details: GEN.t(GEN.i(10, 50)),
                });
              _return._value = ((option, details) => (name, values) => {
                values.to.have.deep.nested.property(`${name}.Values.Value`, option.value);
                if (details) values.to.have.deep.nested.property(`${name}.Values.Details`, details);
              })(_option, _details);
              _return._populate = ((id, option, details) => modal => {
                modal.find(`[data-id='${id}'] select#${id}_SELECT`).val(option.value).trigger("change");
                modal.find(`[data-id='${id}'] input#${id}`).val(option.value);
                if (details) modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(details);
              })(_return.id, _option, _details);
              return _return;
            },
            complex_Empty: () => _.extend(_blocks.basic("Empty Complex"), {
              template: "field_complex",
              _value: false,
            }),
            complex_Add: () => {
              var _additions = _.map(_.range(GEN.i(1, 10)), () => ({
                  details: GEN.b(90) ? GEN.t(GEN.i(10, 50)) : "",
                })),
                _return = _.extend(_blocks.basic("Complex"), {
                  template: "field_complex",
                  icon: "query_builder",
                  details: GEN.t(GEN.i(10, 50)),
                  type: GEN.t(GEN.i(5, 10)),
                });
              _return._value = ((additions, type) => _checks.list(additions, item => ({
                Value: item.details.trim(),
                Type: type.trim()
              })))(_.filter(_additions, "details"), _return.type);
              _return._populate = ((id, additions) => modal => {
                _.each(additions, addition => {
                  if (addition.details)
                    modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(addition.details);
                  modal.find(`[data-id='${id}'] button.btn-primary`).first().delay(100).click();
                });
              })(_return.id, _additions);
              return _return;
            },
            complex_AddWithOptions: () => {
              var _options = _blocks.pairs(),
                _additions = _.map(_.range(GEN.i(1, 10)), () => ({
                  option: _.sample(_options),
                  details: GEN.b() ? GEN.t(GEN.i(10, 50)) : "",
                })),
                _return = _.extend(_blocks.basic("Complex (with Options Selection)"), {
                  template: "field_complex",
                  icon: "query_builder",
                  options: _options,
                  details: GEN.t(GEN.i(10, 50)),
                  prefix: GEN.t(GEN.i(5, 10))
                });
              _return._value = ((additions, prefix) => _checks.list(additions, item => ({
                Value: (`${item.details} [${prefix}: ${item.option.value}]`).trim(),
                Type: "Item"
              })))(_.filter(_additions, "details"), _return.prefix);
              _return._populate = ((id, additions) => modal => {
                _.each(additions, addition => {
                  modal.find(`[data-id='${id}'] > div > div`).first()
                    .find(`[data-value='${addition.option.value}']`).click();
                  if (addition.details)
                    modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(addition.details);
                  modal.find(`[data-id='${id}'] button.btn-primary`).first().delay(100).click();
                });
              })(_return.id, _additions);
              return _return;
            },
            scale_Empty: title => {
              var _options = _blocks.lists(),
                _scale = _blocks.scale(_options),
                _return = _.extend(_blocks.basic(title ? title : "Empty Evidence Scale"), {
                  template: "field_scale",
                  type: GEN.t(GEN.i(5, 10)),
                  items_details: GEN.t(GEN.i(10, 50)),
                  list_field: "Evidence",
                  scale: _scale,
                  markers: _scale.scale,
                  options: _options,
                  _value: null,
                });
              return _return;
            },
            scale_Evidence: () => {

              var _return = _types.scale_Empty("Evidence Scale");
              _return._value = ((scale, type, list_field) => (name, values) => {

                values = values.to.have.deep.nested.property(`${name}.Values`);
                values.to.be.an("object");

                var _check = (parents, numbers) => marker => {

                  var _safe = value => value.replace(/\./g, "\\.");
                  var _number = `${marker.number ? marker.number : marker.value}`,
                    _numbers = _.reduce(numbers, (memo, number) =>
                      `${memo ? `${memo}.` : ""}${number}`, ""),
                    _name = `${_numbers ? `${_numbers}.`:""}${_number}${marker.name?
                      ` ${marker.name}`:""}`;

                  var __parents = _.tap(_.clone(parents), p => p.push(_name));
                  var __numbers = _.tap(_.clone(numbers), n => n.push(_number));

                  if (marker._data) {

                    var _data = marker._data,
                      _path = _.reduce(__parents, (memo, parent) =>
                        `${memo ? `${memo}.` : ""}${_safe(parent)}`, "");

                    if (_data.details)
                      values.to.have.deep.nested.property(`${_path}.Details`, _data.details);

                    if (_data.options) {

                      _.each(_data.options, (option, index, list) => {

                        values.to.have.deep.nested.property(
                          `${_path}.${list_field}.Items${list.length > 1 ? `[${index}]`: ""}.Icon`,
                          "local_printshop");

                        values.to.have.deep.nested.property(
                          `${_path}.${list_field}.Items${list.length > 1 ? `[${index}]`: ""}.Value`,
                          option.class.endsWith("paper") ? "Paper" : "Offline");

                        values.to.have.deep.nested.property(
                          `${_path}.${list_field}.Items${list.length > 1 ? `[${index}]`: ""}.Type`,
                          type);

                      });
                    }

                  }

                  if (marker.children) _.each(marker.children, _check(__parents, __numbers));

                };

                _.each(scale.scale, _check([], []));

              })(_return.scale, _return.type.trim(), _return.list_field.trim());
              _return._populate = ((id, scale) => modal => {

                var _marker = parent => marker => {

                  var _name = `${parent ? `${parent}.` : ""}${marker.number ? 
                       marker.number : marker.value}`,
                    _output = `${_name}${marker.name ? ` ${marker.name}`: ""}`;
                  var _el = modal.find(`[data-id='${id}'] li[data-output-name='${_output}']`);

                  if (marker.children || marker._data) {
                    _el.find("> div > label.material-switch").delay(100).click();
                    if (marker.children) {
                      _.each(marker.children, _marker(_name));
                    } else {
                      _el.find("textarea").val(marker._data.details);
                      _.each(marker._data.options, option => {
                        _el.find("div.dropdown-menu")
                          .find(`.dropdown-item[data-value='${option.value}']`)
                          .delay(100).click();
                      });
                    }
                  }

                };

                _.each(scale.scale, _marker());

              })(_return.id, _return.scale);
              return _return;
            },
          };

        var _generate = fn => {

          var _return = {
              state: [],
              fields: []
            },
            _order = 0;

          var _add = field => {
            if (field.order === undefined) field.order = ++_order;
            _return.state.push(field);
            _return.fields.push(DISPLAY.template.get(field).trim());
          };

          fn ? _add(fn()) : _.times(GEN.i(1, 10), () => _add(_.sample(_types)()));

          return _return;

        };

        var _form = (fields, populate, check, title) => _modal("form", {
            id: "forms_form",
            title: `Testing ${title ? title : "Form"}`,
            fields: fields,
          }, populate, check),
          _test = type => {
            var _data = _generate(type);
            return _form(_data.fields.join("\n").trim(),
              modal => {

                if (debug) FACTORY.Flags.log("Populating Fields with:", _data.state);
                _.each(_data.state, value => value._populate ? value._populate(modal) : false);

              }, values => {

                /* <!-- Test Conditions --> */
                values = expect(values).to.be.an("object");

                _.each(_data.state, value => {

                  var _name = value.field ? value.field : value.id;

                  if (_name !== value.id) values.to.not.have.a.property(value.id);

                  if (value._value === null) {

                    /* <!-- Test there is no value --> */
                    values.to.not.have.a.property(_name);

                  } else {

                    /* <!-- Test Order --> */
                    var _order = value.order ? value.order : false;
                    values.to.have.deep.nested.property(`${_name}.Order`, _order);

                    /* <!-- Test Value/s --> */
                    value._value !== undefined ? _.isFunction(value._value) ?
                      value._value(_name, values) :
                      values.to.have.deep.nested.property(`${_name}.Value`, value._value) :
                      values.to.have.deep.nested.property(`${_name}.Value`);

                  }

                });

                return true;

              }, _data.state.length === 1 && _data.state[0]._title ? _data.state[0]._title : false);
          };

        try {

          const run = promises => _.reduce(promises, (all, promise) => all.then(
            result => promise().then(Array.prototype.concat.bind(result))), Promise.resolve([]));

          run(_.map(_types, type => () => _test(type)))
            .then(() => _test())
            .then(() => resolve(FACTORY.Flags.log("Forms Test SUCCEEDED").reflect(true)))
            .catch(_err);

        } catch (err) {
          _err(err);
        }

      });

    }),

    interactions: () => new Promise(resolve => {

      PAUSE().then(() => {

        var _err = e => resolve(FACTORY.Flags.error("Interactions Test FAILED", e).reflect(false));

        try {

          resolve(FACTORY.Flags.log("Interactions Test SUCCEEDED").reflect(true));

        } catch (err) {
          _err(err);
        }

      });

    }),

    persistence: () => new Promise(resolve => {

      PAUSE().then(() => {

        var _err = e => resolve(FACTORY.Flags.error("Persistence Test FAILED", e).reflect(false));

        try {

          resolve(FACTORY.Flags.log("Persistence Test SUCCEEDED").reflect(true));

        } catch (err) {
          _err(err);
        }

      });

    }),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};