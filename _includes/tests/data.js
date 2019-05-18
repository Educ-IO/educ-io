Data = function() {
  "use strict";

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DISPLAY = FACTORY.Display,
    DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    PAUSE = () => DELAY(RANDOM(200, 500)),
    LONG_PAUSE = () => DELAY(RANDOM(1000, 3000)),
    GEN = FACTORY.App.generate,
    RACE = FACTORY.App.race(240000),
    GENERATE = fn => {
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
      fn && _.isFunction(fn) ?
        _add(fn()) : _.times(GEN.i(4, 10), () => _add(_.sample(fn)()));
      return _return;
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var debug, expect, dialog, data;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _modal = (template, options, populate, check) => DISPLAY.modal(template, _.extend({
      backdrop: false,
      class: DISPLAY.state().in("traces") ? "" : "d-none",
    }, options), modal => {
      FACTORY.Fields({
        me: FACTORY.me ? FACTORY.me.full_name : undefined,
        templater: DISPLAY.template.get
      }, FACTORY).on(modal);
      dialog.handlers.keyboard.enter(modal);
      Promise.resolve(populate ? populate(modal) : true)
        .then(debug ? LONG_PAUSE : PAUSE)
        .then(() => modal.find(".modal-footer > .btn.btn-primary")[0].click());
    })
    .then(values => check ? check(values) : values)
    .then(result => {
      if (result === false) throw "CHECK method failed";
      return result;
    });
  /* <!-- Internal Functions --> */

  /* <!-- Scaffolding Functions --> */
  var _showdown = window.showdown ? new showdown.Converter({
      tables: true
    }) : false,
    _markdown = markdown => _showdown ? _showdown.makeHtml(markdown) : markdown,
    _checks = {
      list: (list, map, field, items) => (name, values) => {
        list.length > 0 ?
          list.length == 1 ?
          values.to.have.deep.nested.property(
            `${name}.Values${field ? `.${field}` : ""}.${items ? items : "Items"}`, map(list[0])) :
          values.to.have.deep.nested.property(
            `${name}.Values${field ? `.${field}` : ""}.${items ? items : "Items"}`)
          .to.have.ordered.members(_.map(list, map)) &&
          values.to.have.deep.nested.property(`${name}.Values.Value`, true) :
          values.to.have.deep.nested.property(`${name}.Value`, false);
      },
    },
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
          span: "d",
          value: "Daily",
          name: "Daily"
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
      strings: () => _.map(_.range(GEN.i(4, 20)), () => GEN.t(GEN.i(10, 30))),
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
      children: (level, options, evidence) => {
        if (level > GEN.i(1, 5)) return null;
        return _.map(_.range(1, GEN.i(2, 8)), number => {
          var _return = {
            value: number,
            details: GEN.t(GEN.i(0, 60)),
          };
          if (GEN.b(40)) _return.children = _blocks.children(level + 1, options, evidence);
          if (_return.children === null) delete _return.children;
          if (_return.children === undefined) { /* <!-- Evidence only if a Leaf --> */
            if (GEN.b(40)) {
              _return.evidence = true;
              if (GEN.b(80) && evidence !== false)
                _return._data = {
                  options: _.map(_.range(GEN.i(0, 4)), () => _.sample(options)),
                  details: GEN.t(GEN.i(0, 100))
                };
            }
          }
          return _return;
        });
      },
      scale: (options, evidence) => ({
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
          if (GEN.b(90)) _return.children = _blocks.children(1, options, evidence);
          if (_return.children === null) delete _return.children;
          return _return;
        })
      }),
      types: {
        textual_Me: () => {
          var _return = _.extend(_blocks.basic("Current User (Click)"), {
            template: "field_textual",
            icon: "face",
            button: "Me!",
            action: "me",
          });
          _return._value = (value => value)(FACTORY.me.full_name());
          _return._populate = (id => modal => {
            modal.find(`[data-id='${id}'] [data-action='me']`)[0].click();
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
            modal.find(`[data-id='${id}'] button.btn-primary`)[0].click();
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
            modal.find(`[data-id='${id}'] button.btn-primary`)[0].click();
            modal.find(`[data-id='${id}'] textarea`).val(details);
            if (!value) modal.find(`[data-id='${id}'] button.btn-info`)[0].click();
          })(_return.id, _value, _return.details);
          return _return;
        },
        range_Empty: () => _.extend(_blocks.basic("Empty Range"), {
          template: "field_range",
          details: true,
          _value: null,
        }),
        range_Numeric: () => {
          var _number = GEN.i(1, 100),
            _return = _.extend(_blocks.basic("Numeric Range"), {
              template: "field_range",
              details: true,
            });
          _return._value = (value => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Values.Details`, String(value));
            values.to.have.deep.nested.property(`${name}.Values.Value`, String(value));
          })(_number);
          _return._populate = (id => modal => {
            modal.find(`[data-id='${id}'] input[type='range']`).val(_number)[0].click();
          })(_return.id);
          return _return;
        },
        range_Stepped: () => {
          var _number = GEN.i(0, 10),
            _range = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
            _return = _.extend(_blocks.basic("Stepped Range"), {
              template: "field_range",
              min: 0,
              max: 10,
              step: 1,
              range: _range.join(";"),
              details: true,
            });
          _return._value = ((value, details) => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Values.Details`, details);
            values.to.have.deep.nested.property(`${name}.Values.Value`, String(value));
          })(_number, _range[_number]);
          _return._populate = (id => modal => {
            modal.find(`[data-id='${id}'] input[type='range']`).val(_number).trigger("click");
          })(_return.id);
          return _return;
        },
        span_Empty: () => {
          var _default = "Custom",
            _return = _.extend(_blocks.basic("Empty Date Span"), {
              template: "field_span",
              icon: "query_builder",
              type: _default,
              options: _blocks.spans,
              _value: null,
            });
          return _return;
        },
        span_Selected: () => {
          var _default = "Custom",
            _return = _.extend(_blocks.basic("Selected Date Span"), {
              template: "field_span",
              icon: "query_builder",
              type: _default,
              options: _blocks.spans
            }),
            _span = GEN.i(1, _blocks.spans.length - 1);
          _return._value = ((span, start) => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Values.Type`, span.value);
            values.to.have.deep.nested.property(`${name}.Values.Start`,
              start.format("YYYY-MM-DD"));
            values.to.have.deep.nested.property(`${name}.Values.End`,
              start.clone().add(1, span.span).add(-1, "d").format("YYYY-MM-DD"));
          })(_blocks.spans[_span], moment(new Date()));
          _return._populate = ((id, span) => modal => {
            modal.find(`[data-id='${id}'] a.dropdown-item[data-value='${$.escapeSelector(span.value)}']`).click();
          })(_return.id, _blocks.spans[_span]);
          return _return;
        },
        span_Date: () => {
          var _start = moment(new Date()),
            _end = _start.clone().add(7, "d"),
            _default = "Custom",
            _details = GEN.t(GEN.i(10, 30)),
            _return = _.extend(_blocks.basic("Date Span"), {
              template: "field_span",
              icon: "query_builder",
              type: _default,
              options: _blocks.spans,
              details: _details
            });
          _return._value = ((value, start, end, details) => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Values.Start`,
              start.format("YYYY-MM-DD"));
            values.to.have.deep.nested.property(`${name}.Values.End`,
              end.format("YYYY-MM-DD"));
            values.to.have.deep.nested.property(`${name}.Values.Details`, details);
          })(_default, _start, _end, _details);
          _return._populate = ((id, start, end, details) => modal => {
            modal.find(`#${id}_START`).val(start.format("YYYY-MM-DD"));
            modal.find(`#${id}_END`).val(end.format("YYYY-MM-DD"));
            modal.find(`#${id}_DETAILS`).val(details);
          })(_return.id, _start, _end, _details);
          return _return;
        },
        radio_Empty: () => _.extend(_blocks.basic("Un-Selected Options"), {
          template: "field_radio",
          options: _blocks.options(),
          _value: null,
        }),
        radio_Options: () => {
          var _options = _blocks.options(),
            _option = _.sample(_options),
            _return = _.extend(_blocks.basic("Selected Options"), {
              template: "field_radio",
              icon: "gavel",
              options: _options,
              required: true,
            });
          _return._value = (option => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Value`, option.value);
          })(_option);
          _return._populate = ((id, option) => modal => {
            modal.find(`[data-id='${id}'] input[data-value='${$.escapeSelector(option.value)}']`).first()
              .parent("label")[0].click();
          })(_return.id, _option);
          return _return;
        },
        radio_OptionsWithDetails: () => {
          var _options = _blocks.options(),
            _option = _.sample(_options),
            _details = GEN.t(GEN.i(10, 50)),
            _return = _.extend(_blocks.basic("Selected Options (with Details)"), {
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
            modal.find(`[data-id='${id}'] input[data-value='${$.escapeSelector(option.value)}']`).first()
              .parent("label")[0].click();
            modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(details);
          })(_return.id, _option, _details);
          return _return;
        },
        select_Empty: () => _.extend(_blocks.basic("No Selection"), {
          template: "field_select",
          options: [{
            value: "",
            name: ""
          }].concat(_blocks.pairs()),
          _value: null,
        }),
        select_Default: () => {
          var _options = _blocks.pairs(),
            _option = _.sample(_options);
          var _return = _.extend(_blocks.basic("Default Selection"), {
            template: "field_select",
            options: _options,
            default: _option,
          });
          _return._value = (option => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Value`, option.value);
          })(_option);
          return _return;
        },
        select_Placeholder: () => {
          var _options = _blocks.pairs(),
            _placeholder = _.sample(_options);
          _placeholder.value = "";
          var _return = _.extend(_blocks.basic("Placeholder Selection"), {
            template: "field_select",
            options: _options,
            default: _placeholder,
            _value: null,
          });
          _return._populate = ((id, option) => modal => {
            modal.find(`[data-id='${id}'] select#${id}`).val(option).trigger("change");
          })(_return.id, _placeholder);
          return _return;
        },
        select_String: () => {
          var _options = _blocks.strings(),
            _default = _options[0],
            _option = _.sample(_.reject(_options, option => option == _default));
          var _return = _.extend(_blocks.basic("String Selection"), {
            template: "field_select",
            options: _options,
            default: _default,
          });
          _return._value = (option => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Value`, option);
          })(_option);
          _return._populate = ((id, option) => modal => {
            modal.find(`[data-id='${id}'] select#${id}`).val(option).trigger("change");
          })(_return.id, _option);
          return _return;
        },
        select_NonDefault: () => {
          var _options = _blocks.pairs(),
            _default = _.sample(_options),
            _option = _.sample(_.reject(_options, option => option.name == _default.name && option.value == _default.value));
          var _return = _.extend(_blocks.basic("Non-Default Selection"), {
            template: "field_select",
            options: _options,
            default: _default,
          });
          _return._value = (option => (name, values) => {
            values.to.have.deep.nested.property(`${name}.Value`, option.value);
          })(_option);
          _return._populate = ((id, option) => modal => {
            modal.find(`[data-id='${id}'] select#${id}`).val(option.value).trigger("change");
          })(_return.id, _option);
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
            modal.find(`[data-id='${id}'] select#${id}`).val(option.value).trigger("change");
            if (details) modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(details);
          })(_return.id, _option, _details);
          return _return;
        },
        complex_Empty: () => _.extend(_blocks.basic("Empty Complex"), {
          template: "field_complex",
          _value: null,
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
          _return._value = ((additions, type) => additions && additions.length > 0 ?
            _checks.list(additions, item => ({
              Value: item.details.trim(),
              Type: type.trim(),
              __type: "list_item",
            })) : null)(_.filter(_additions, "details"), _return.type);
          _return._populate = ((id, additions) => modal => {
            _.each(additions, addition => {
              if (addition.details)
                modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(addition.details);
              modal.find(`[data-id='${id}'] button.btn-success`).delay(100)[0].click();
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
              prefix: GEN.t(GEN.i(5, 10)),
              list_field: GEN.a(GEN.i(5, 10))
            });
          _return._value = ((additions, prefix, field) => additions && additions.length > 0 ?
            _checks.list(additions, item => ({
              Value: (`${item.details} | ${prefix.trim()}: ${item.option.value}`).trim(),
              Type: "Item",
              __type: "list_item",
            }), field) : null)(_.filter(_additions, "details"), _return.prefix, _return.list_field);
          _return._populate = ((id, additions) => modal => {
            _.each(additions, addition => {
              modal.find(`[data-id='${id}'] > div > div`).first()
                .find(`[data-value='${addition.option.value}']`)[0].click();
              if (addition.details)
                modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(addition.details);
              modal.find(`[data-id='${id}'] button.btn-success`).first().delay(100)[0].click();
            });
          })(_return.id, _additions);
          return _return;
        },
        durations_Add: () => {
          var _type = GEN.a(GEN.i(5, 10)),
            _increment = GEN.o([0.25, 0.5, 0.75, 1, 1.5, 2, 2.5]),
            _additions = _.map(_.range(GEN.i(1, 10)), () => ({
              date: moment(GEN.d()),
              total: GEN.i(1, 10),
              details: GEN.b() ? GEN.t(GEN.i(10, 50)) : "",
              type: _type,
              increment: _increment,
            })),
            _return = _.extend(_blocks.basic("Durations"), {
              template: "field_durations",
              icon_date: "calendar_today",
              icon_number: "alarm_add",
              details: GEN.t(GEN.i(10, 50)),
              suffix: GEN.t(GEN.i(5, 10)),
              list_field: GEN.a(GEN.i(5, 10)),
              items: GEN.a(GEN.i(5, 10)),
              type: _type,
              increment: _increment,
            });
          _return._value = ((additions, prefix, field, type, total, suffix, items) => additions &&
            additions.length > 0 ?
            (name, values) => {
              values.to.have.deep.nested.property(`${name}.Values.Total`, total);
              values.to.have.deep.nested.property(`${name}.Values.Display`, `${total} ${suffix}`);
              return _checks.list(additions, item => {
                var _item = {
                  Date: item.date.format("YYYY-MM-DD"),
                  Type: item.type,
                  Number: String(item.total * item.increment),
                  __type: "list_item",
                };
                if (item.details) _item.Value = item.details.trim();
                return _item;
              }, field, items)(name, values);
            } : null)(_additions, _return.prefix, _return.list_field, _return.type,
            _.reduce(_additions, (total, add) => total + (add.total * add.increment), 0),
            _return.suffix, _return.items);
          _return._populate = ((id, additions) => modal => {
            _.each(additions, addition => {
              modal.find(`[data-id='${id}'] input#${id}_DATE`).val(addition.date.format("YYYY-MM-DD"));
              _.times(addition.total, () =>
                modal.find(`[data-id='${id}'] button.alter-numerical.btn-primary`)[0].click());
              if (addition.details)
                modal.find(`[data-id='${id}'] textarea#${id}_DETAILS`).val(addition.details);
              modal.find(`[data-id='${id}'] button.btn-success`).delay(100)[0].click();
              modal.find(`[data-id='${id}'] button.eraser`)[0].click();
            });
          })(_return.id, _additions);
          return _return;
        },
        scale_Empty: (title, evidence) => {
          var _options = _blocks.lists(),
            _scale = _blocks.scale(_options, evidence),
            _return = _.extend(_blocks.basic(title ? title : "Empty Evidence Scale"), {
              template: "field_scale",
              type: GEN.t(GEN.i(5, 10)),
              items_details: GEN.t(GEN.i(10, 50)),
              list_template: "field_items",
              list_field: GEN.b() ? GEN.a(GEN.i(5, 20)) : null,
              scale: _scale,
              markers: _scale.scale,
              options: _options,
              _value: null,
            });
          return _return;
        },
        scale_Evidence: (title, evidence) => {

          var _return = _blocks.types.scale_Empty(title ?
              title : "Evidence Scale", evidence),
            _test = (value, marker) => value === true ?
            value : marker.evidence ?
            true : marker.children ?
            _.reduce(marker.children, _test, value) : false,
            _value = _.reduce(_return.scale.scale, _test, false);

          _return._value = ((scale, type, list_field, value, test) => value ? (name, values) => {

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

              var _path = _.reduce(__parents, (memo, parent) =>
                `${memo ? `${memo}.` : ""}${_safe(parent)}`, "");

              if (marker.evidence || marker.children && _.reduce(marker.children, test, false))
                values.to.have.deep.nested.property(`${_path}.Value`, true);

              if (marker._data) {

                var _data = marker._data;

                if (_data.details)
                  values.to.have.deep.nested.property(`${_path}.Details`, _data.details);

                if (_data.options) {

                  _.each(_data.options, (option, index, list) => {

                    var _prefix = `${_path}${list_field ? `.${list_field}` : ""}.Items`;

                    values.to.have.deep.nested.property(
                      `${_prefix}${list.length > 1 ? `[${index}]`: ""}.Icon`, "local_printshop");

                    values.to.have.deep.nested.property(
                      `${_prefix}${list.length > 1 ? `[${index}]`: ""}.Value`, option.class.endsWith("paper") ? "Paper" : "Offline");

                    values.to.have.deep.nested.property(
                      `${_prefix}${list.length > 1 ? `[${index}]`: ""}.Type`, type);

                  });
                }

              }

              if (marker.children) _.each(marker.children, _check(__parents, __numbers));

            };

            _.each(scale.scale, _check([], []));

          } : null)(_return.scale, _return.type.trim(), _return.list_field ? _return.list_field.trim() : "", _value, _test);

          _return._populate = ((id, scale, test) => modal => {

            var _marker = parent => marker => {

              var _name = `${parent ? `${parent}.` : ""}${marker.number ? 
                                                      marker.number : marker.value}`,
                _output = `${_name}${marker.name ? ` ${marker.name}`: ""}`;

              var _el = modal
                .find(`[data-id='${id}'] li[data-output-name='${$.escapeSelector(_output)}']`);

              if (marker.evidence || marker.children && _.reduce(marker.children, test, false)) {
                _el.find("> div > label.material-switch").delay(100)[0].click();
                if (marker.children) {
                  _.each(marker.children, _marker(_name));
                } else if (marker._data) {
                  _el.find("textarea").val(marker._data.details);
                  _.each(marker._data.options, option => {
                    var __el = _el.find("div.dropdown-menu")
                      .find(`.dropdown-item[data-value='${$.escapeSelector(option.value)}']`);
                    __el.delay(100)[0].click();
                  });
                }
              }

            };

            _.each(scale.scale, _marker());

          })(_return.id, _return.scale, _test);

          _return._interact = (field, modal, state) => {

            var _test = (value, marker) => value === true ?
              value : marker.evidence ? true : marker.children ?
              _.reduce(marker.children, _test, value) : false;

            var _marker = parent => marker => {

              var _name = `${parent ? 
                  `${parent}.` : ""}${marker.number ? marker.number : marker.value}`,
                _output = `${_name}${marker.name ? ` ${marker.name}`: ""}`;
              var _el = field.find(`li[data-output-name='${$.escapeSelector(_output)}']`);

              if (marker.evidence || marker.children && _.reduce(marker.children, _test, false)) {

                expect(_el.find("> div.float-right > input").prop("checked")).to.be.true;

                var _child = _el.children("ul, div.list-holder");
                expect(_child.css("display") === "none").to.be.false;

                if (marker.children) {
                  _.each(marker.children, _marker(_name));
                } else if (marker._data) {
                  var _items = _child.find("div.list-data").children("div.list-item");
                  expect(_items.length).to.equal(marker._data.options.length);
                  _.each(marker._data.options, (option, index) => {
                    var _item = $(_items[index]);
                    expect(_item.find("span[data-output-name='Value']").text())
                      .to.be.a("string")
                      .that.equals(option.class.endsWith("paper") ? "Paper" : "Offline");
                    expect(_item.find("span[data-output-name='Type']").text())
                      .to.be.a("string")
                      .that.equals(state.type);
                  });
                }

              }

            };

            _.each(state.markers, _marker());

          };

          return _return;

        },
        scale_NoEvidence: () => _blocks.types.scale_Evidence("No Evidence Scale", false),
      }
    },
    _populate = state => modal => {
      if (debug) FACTORY.Flags.log("Populating Fields with:", state);
      _.each(state, value => value._populate ? value._populate(modal) : false);
      if (debug) FACTORY.Flags.log("Populating COMPLETE", modal);
    },
    _check = (state, err) => values => {

      /* <!-- Test Conditions --> */
      var _expect = expect(values).to.be.an("object");

      var _error = _.find(state, value => {

        try {

          var _name = value.field ? value.field : value.id;

          if (_name !== value.id) _expect.to.not.have.a.property(value.id);

          if (value._value === null) {

            /* <!-- Test there is no value --> */
            _expect.to.not.have.a.property(_name);

          } else {

            /* <!-- Test Order --> */
            var _order = value.order ? value.order : false;
            _expect.to.have.deep.nested.property(`${_name}.__order`, _order);

            /* <!-- Test Value/s --> */
            value._value !== undefined ? _.isFunction(value._value) ?
              value._value(_name, _expect) :
              _expect.to.have.deep.nested.property(`${_name}.Value`, value._value) :
              _expect.to.have.deep.nested.property(`${_name}.Value`);

          }

        } catch (e) {
          err(e);
          return true;
        }

      });

      return _error ?
        FACTORY.Flags.error(
          `** FAILED ** ${_error._title ? _error._title : _error.template}`,
          _.extend(_error, {
            __values: values
          })).reflect(false) : true;

    };
  /* <!-- Scaffolding Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      /* <!-- Set Up Testing Framework --> */
      debug = FACTORY.Flags.debug();
      expect = chai.expect;
      dialog = FACTORY.Dialog({}, FACTORY),
        data = FACTORY.Data({}, FACTORY);

      return FACTORY.Flags.log("START Called").reflect(true);

    },

    dialogs: () => RACE(new Promise(resolve => {

      PAUSE().then(() => {

        var _fail = e => resolve(FACTORY.Flags.error("Dialogs Test FAILED", e)
            .reflect(false)),
          _succeed = () => resolve(FACTORY.Flags.log("Dialogs Test SUCCEEDED")
            .reflect(true));

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
                values.to.have.deep.nested.property(`${key}.__order`, false);
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
                    values.to.have.deep.nested.property(`${_name}.__order`, _order);

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
            .then(_succeed)
            .catch(_fail);

        } catch (err) {
          _fail(err);
        }

      });

    })),

    forms: () => RACE(new Promise(resolve => {

      PAUSE().then(() => {

        var _fail = e => resolve(FACTORY.Flags.error("Forms Test FAILED", e)
            .reflect(false)),
          _succeed = () => resolve(FACTORY.Flags.log("Forms Test SUCCEEDED")
            .reflect(true));

        var _form = (fields, populate, check, title) => _modal("form", {
            id: "forms_form",
            title: `Testing ${title ? title : "Form"}`,
            fields: fields,
          }, populate, check),
          _test = type => {
            var _data = GENERATE(type);
            return _form(
              _data.fields.join("\n").trim(),
              _populate(_data.state),
              _check(_data.state, _fail),
              _data.state.length === 1 && _data.state[0]._title ?
              _data.state[0]._title : false);
          };

        try {

          Promise.each(_.map(_blocks.types, type => () => _test(type)))
            .then(() => _test(_blocks.types))
            .then(_succeed)
            .catch(_fail);

        } catch (err) {
          _fail(err);
        }

      });

    })),

    interactions: () => RACE(new Promise(resolve => {

      PAUSE().then(() => {

        var _fail = e => resolve(FACTORY.Flags.error("Interactions Test FAILED", e)
            .reflect(false)),
          _succeed = () => resolve(FACTORY.Flags.log("Interactions Test SUCCEEDED")
            .reflect(true));

        var _interactions = {
            text: (input, clear) => {
              var value = GEN.t(GEN.i(1, 100));
              input.val(value);
              FACTORY.Flags.log("Set Field Value to:", value);
              expect(input.val()).to.be.a("string").that.equals(value);
              if (clear && clear.length > 0) {
                clear[0].click();
                FACTORY.Flags.log("Cleared Field");
              } else {
                input.val("");
              }
              expect(input.val()).to.be.empty;
            }
          },
          _form = (fields, interact, title) => _modal("form", {
            id: "interactions_form",
            title: `Testing ${title ? title : "Interaction"}`,
            fields: fields,
          }, interact),
          _types = {
            textual: () => _.extend(_blocks.basic("Textbox Field"), {
              template: "field_textual",
              _interact: field => {
                var input = field.find("input[type='text'], textarea");
                _.times(GEN.i(1, 10), () => _interactions.text(input));
              }
            }),
            textual_eraser: () => _.extend(_blocks.basic("Textbox Field (with Eraser)"), {
              template: "field_textual",
              clear: true,
              _interact: field => {
                var input = field.find("input[type='text'], textarea"),
                  clear = field.find("button.eraser");
                _.times(GEN.i(1, 10), () => _interactions.text(input, clear));
              }
            }),
            numeric: () => _.extend(_blocks.basic("Stepped Numeric Field"), {
              template: "field_numeric",
              increment: GEN.i(2, 20),
              min: 0,
              max: GEN.i(200, 300),
              suffix: GEN.t(GEN.i(5, 10)),
              details: GEN.t(GEN.i(5, 10)),
              _interact: (field, modal, state) => {
                var details = field.find("textarea"),
                  display = field.find("input[type='text']"),
                  value = field.find("input[type='number']"),
                  increase = field.find("button.alter-numerical.btn-primary").first(),
                  decrease = field.find("button.alter-numerical.btn-info").first(),
                  clear = field.find("button.eraser").first(),
                  _cleared = () => {
                    /* <!-- Clear Inputs --> */
                    clear[0].click();
                    expect(value.val()).to.be.empty;
                    expect(display.val()).to.be.empty;
                  };
                _.times(GEN.i(1, 10), () => _interactions.text(details));
                _.times(GEN.i(1, 10), () => {

                  /* <!-- Test Increases (Up to / Above Potential Maximum) --> */
                  _.times(GEN.i(1, Math.round((state.max * 2) / state.increment)), index => {
                    increase[0].click();
                    var _value = Math.min((index + 1) * state.increment, state.max);
                    expect(Number(value.val())).to.be.a("number")
                      .that.equals(_value);
                    expect(display.val()).to.be.a("string")
                      .that.equals(`${_value} ${state.suffix}`);
                  });

                  /* <!-- Clear Inputs --> */
                  _cleared();

                  /* <!-- Test Max Value --> */
                  _.times(Math.round((state.max / state.increment) + 1), () => increase[0].click());
                  expect(Number(value.val())).to.be.a("number")
                    .that.equals(state.max);

                  /* <!-- Test Decreases (Down to / Below Minimum) --> */
                  _.times(GEN.i(1, Math.round((state.max * 2) / state.increment)), index => {
                    decrease[0].click();
                    var _value = Math.max(state.max - ((index + 1) * state.increment), state.min);
                    expect(Number(value.val())).to.be.a("number")
                      .that.equals(_value);
                    _value === 0 ?
                      expect(display.val()).to.be.empty :
                      expect(display.val()).to.be.a("string")
                      .that.equals(`${_value} ${state.suffix}`);

                  });

                  /* <!-- Clear Inputs --> */
                  _cleared();

                });
              }
            }),
            span: () => _.extend(_blocks.basic("Date Span Field"), {
              template: "field_span",
              icon: "query_builder",
              type: "Weekly",
              span: "w",
              options: _blocks.spans,
              details: GEN.t(GEN.i(10, 30)),
              _interact: (field, modal, state) => {

                var start = field.find(`input[type='text']#${state.id}_START`),
                  end = field.find(`input[type='text']#${state.id}_END`),
                  details = field.find(`textarea#${state.id}_DETAILS`),
                  clear = field.find("button.eraser"),
                  increase = field.find("button.alter-numerical.btn-primary"),
                  decrease = field.find("button.alter-numerical.btn-info"),
                  format = "YYYY-MM-DD",
                  _start = moment(new Date()),
                  _end = moment(new Date(_start));
                /* <!-- Check details textarea --> */
                _.times(GEN.i(1, 10), () => _interactions.text(details));

                /* <!-- Check initial date --> */
                _end.add(6, "d");
                start.val(_start.format(format)).change();

                expect(start.val()).to.be.a("string")
                  .that.equals(_start.format(format));
                expect(end.val()).to.be.a("string")
                  .that.equals(_end.format(format));

                /* <!-- Check increase/decrease date --> */
                increase[0].click();
                _start.add(7, "d");
                _end.add(7, "d");
                expect(start.val()).to.be.a("string")
                  .that.equals(_start.format(format));
                expect(end.val()).to.be.a("string")
                  .that.equals(_end.format(format));
                decrease[0].click();
                _start.add(-7, "d");
                _end.add(-7, "d");
                expect(start.val()).to.be.a("string")
                  .that.equals(_start.format(format));
                expect(end.val()).to.be.a("string")
                  .that.equals(_end.format(format));

                /* <!-- Check clear --> */
                clear[0].click();
                expect(start.val()).to.be.empty;
                expect(end.val()).to.be.empty;

                /* <!-- Test Each Option --> */
                start.val(_start.format(format)).change();
                _.each(_blocks.spans, span => {
                  field.find(`a.dropdown-item[data-value='${$.escapeSelector(span.value)}']`)[0].click();
                  expect(start.val()).to.be.a("string")
                    .that.equals(_start.format(format));
                  span.value == "Custom" ?
                    expect(end.val()).to.be.a("string").that.equals(_end.format(format)) :
                    expect(end.val()).to.be.a("string")
                    .that.equals(_start.clone()
                      .add(1, span.span ? span.span : "d")
                      .add(-1, "d").format(format));

                });

              },
            }),
            radio: () => _.extend(_blocks.basic("Radio Options Field"), {
              template: "field_radio",
              icon: "gavel",
              options: _blocks.options(),
              details: GEN.t(GEN.i(10, 50)),
              _interact: (field, modal, state) => {
                var display = field.find(`textarea#${state.id}`),
                  details = field.find(`textarea[name='${state.id}_DETAILS']`);

                /* <!-- Check each option --> */
                _.each(state.options, option => {
                  field.find(`input[type='radio'][data-value='${$.escapeSelector(option.value)}']`)
                    .first().parent("label")[0].click();
                  expect(display.val()).to.be.a("string")
                    .that.equals(option.value);
                });

                /* <!-- Check clear option --> */
                field.find("input[type='radio']:not([data-value])")
                  .first().parent("label")[0].click();
                expect(display.val()).to.be.empty;

                /* <!-- Check details textarea --> */
                _.times(GEN.i(1, 10), () => _interactions.text(details));

              },
            }),
            select: () => {
              var _options = _blocks.strings(),
                _default = _options[0];
              return _.extend(_blocks.basic("Select Field"), {
                template: "field_select",
                options: _options,
                default: _default,
                _interact: (field, modal, state) => {
                  var selector = field.find(`select#${state.id}`);
                  /* <!-- Check each option --> */
                  _.each(state.options, option => {
                    selector.val(option).trigger("change");
                    expect(selector.val()).to.be.a("string")
                      .that.equals(option);
                  });
                },
              });
            },
            range: () => {
              var _suffix = GEN.t(GEN.i(5, 10));
              return _.extend(_blocks.basic("Numeric Range"), {
                template: "field_range",
                details: true,
                suffix: _suffix,
                _interact: (field, modal, state) => {
                  var selector = field.find(`input#${state.id}`),
                    details = field.find(`input#${state.id}_DETAILS`);
                  selector.val(60);
                  expect(details.val()).to.be.empty;
                  selector[0].click();
                  expect(selector.val()).to.be.a("string")
                    .that.equals("60");
                  expect(details.val()).to.be.a("string")
                    .that.equals(`60 ${_suffix}`);
                },
              });
            },
            complex: () => _.extend(_blocks.basic("Complex (with Options Selection)"), {
              template: "field_complex",
              icon: "query_builder",
              options: _blocks.pairs(),
              details: GEN.t(GEN.i(10, 50)),
              prefix: GEN.t(GEN.i(5, 10)),
              type: GEN.an(GEN.i(10, 15)),
              _interact: (field, modal, state) => {
                var _additions = _.map(_.range(GEN.i(1, 10)), () => ({
                    option: _.sample(state.options),
                    details: GEN.t(GEN.i(10, 50)),
                  })),
                  details = field.find(`textarea#${state.id}_DETAILS`),
                  button = field.find(`button#${state.id}_TYPE_LG`),
                  list = field.find(`div#${state.id}_LIST`),
                  add = field.find("button.btn-success");

                /* <!-- Check details textarea --> */
                _.times(GEN.i(1, 10), () => _interactions.text(details));

                /* <!-- Check default button text --> */
                expect(button.first().text().trim()).to.be.a("string")
                  .that.equals(state.prefix.trim());

                /* <!-- Check missing details --> */
                add[0].click();
                expect(details.hasClass("invalid")).to.equal(true);

                /* <!-- Add Basic Item --> */
                var _details = GEN.t(GEN.i(10, 50));
                details.val(_details);
                add[0].click();
                var _item = list.find(".list-item").last();
                expect(_item.find("span[data-output-name='Value']").text())
                  .to.be.a("string")
                  .that.equals(_details);
                expect(_item.find("span[data-output-name='Type']").text())
                  .to.be.a("string")
                  .that.equals(state.type);
                expect(details.val()).to.be.empty;

                /* <!-- Check each addition --> */
                _.each(_additions, addition => {

                  var _option = field
                    .find(`a.dropdown-item[data-value='${$.escapeSelector(addition.option.value)}']`);
                  expect(_option.first().text().trim()).to.be.a("string")
                    .that.equals(addition.option.name.trim());
                  _option[0].click();
                  expect(button.first().text().trim()).to.be.a("string")
                    .that.equals(addition.option.value.trim());

                  details.val(addition.details);
                  add[0].click();

                  var _item = list.find(".list-item").last();
                  expect(_item.find("span[data-output-name='Value']").text())
                    .to.be.a("string")
                    .that.equals(`${addition.details} | ${state.prefix.trim()}: ${addition.option.value}`);
                  expect(_item.find("span[data-output-name='Type']").text())
                    .to.be.a("string")
                    .that.equals(state.type);

                });

                /* <!-- Remove all List Items --> */
                var _items = list.find(".list-item");
                _.each(_items, item => {
                  var _count = list.find(".list-item").length;
                  $(item).find("a.delete")[0].click();
                  expect(list.find(".list-item").length)
                    .to.be.a("number")
                    .that.equals(_count - 1);
                });

              },
            }),
            files: () => _.extend(_blocks.basic("Files"), {
              template: "field_files",
              options: _blocks.lists(),
              details: GEN.t(GEN.i(10, 50)),
              type: GEN.an(GEN.i(10, 15)),
              _interact: (field, modal, state) => {

                var _additions = _.map(_.range(GEN.i(1, 10)), () => (_.sample(state.options))),
                  details = field.find(`textarea#${state.id}_FILES_DETAILS`),
                  button = field.find(`button#${state.id}_FILES_TYPE`),
                  list = field.find(`div#${state.id}_FILES_LIST`);

                /* <!-- Check details textarea --> */
                _.times(GEN.i(1, 10), () => _interactions.text(details));

                /* <!-- Check default button text --> */
                expect(button.first().text().trim()).to.be.a("string")
                  .that.equals(state.type.trim());

                /* <!-- Check each addition --> */
                _.each(_additions, addition => {

                  var _option = field
                    .find(`a.dropdown-item[data-value='${$.escapeSelector(addition.value)}']`);
                  expect(_option.first().text().trim()).to.be.a("string")
                    .that.equals(addition.name.trim());
                  _option[0].click();

                  var _item = list.find(".list-item").last();
                  expect(_item.find("span[data-output-name='Value']").text())
                    .to.be.a("string")
                    .that.equals(addition.class.endsWith("paper") ? "Paper" : "Offline");
                  expect(_item.find("span[data-output-name='Type']").text())
                    .to.be.a("string")
                    .that.equals(state.type);

                });

                /* <!-- Remove all List Items --> */
                var _items = list.find(".list-item");
                _.each(_items, item => {
                  var _count = list.find(".list-item").length;
                  $(item).find("a.delete")[0].click();
                  expect(list.find(".list-item").length)
                    .to.be.a("number")
                    .that.equals(_count - 1);
                });

              },
            }),
            duration: () => _.extend(_blocks.basic("Durations"), {
              template: "field_durations",
              icon_date: "calendar_today",
              icon_number: "alarm_add",
              details: GEN.t(GEN.i(10, 50)),
              suffix: GEN.t(GEN.i(5, 10)),
              type: GEN.an(GEN.i(10, 15)),
              items: GEN.n(GEN.i(10, 15)),
              increment: GEN.o([0.25, 0.5, 0.75, 1, 1.5, 2]),
              _interact: (field, modal, state) => {
                var _additions = _.map(_.range(GEN.i(1, 10)), () => ({
                    date: moment(GEN.d()),
                    total: GEN.i(1, 10),
                    details: GEN.t(GEN.i(10, 50)),
                  })),
                  duration = field.find(`input#${state.id}_DURATION`),
                  details = field.find(`textarea#${state.id}_DETAILS`),
                  total = field.find(`input#${state.id}_TOTAL`),
                  display = field.find(`input#${state.id}_DISPLAY`),
                  increase = field.find("button.alter-numerical.btn-primary").first(),
                  value = field.find(`input#${state.id}_NUMERIC`),
                  clear = field.find("button.eraser").first(),
                  format = "YYYY-MM-DD",
                  start = moment(GEN.d()),
                  date = field.find(`input#${state.id}_DATE`),
                  list = field.find(`div#${state.id}_LIST`),
                  add = field.find("button.btn-success");

                /* <!-- Check details textarea --> */
                _.times(GEN.i(1, 10), () => _interactions.text(details));

                /* <!-- Test Increases --> */
                var _total = GEN.i(1, 10);
                _.times(_total, index => {
                  increase[0].click();
                  var _value = (index + 1) * state.increment;
                  expect(Number(value.val())).to.be.a("number")
                    .that.equals(_value);
                  expect(duration.val()).to.be.a("string")
                    .that.equals(`${_value} ${state.suffix}`);
                });

                /* <!-- Add Basic Item --> */
                var _details = GEN.t(GEN.i(10, 50));
                details.val(_details);
                date.val(start.format(format));
                _total = _total * state.increment;

                add[0].click();

                var _check = (dt, d, t) => {
                  var _item = list.find(".list-item").last();
                  expect(_item.find("span[data-output-name='Date']").text())
                    .to.be.a("string")
                    .that.equals(dt.format(format));
                  expect(_item.find("span[data-output-name='Value']").text())
                    .to.be.a("string")
                    .that.equals(d);
                  expect(_item.find("span[data-output-name='Number']").text())
                    .to.be.a("string")
                    .that.equals(String(t));
                  expect(_item.find("span[data-output-name='Type']").text())
                    .to.be.a("string")
                    .that.equals(state.type);
                  expect(details.val()).to.be.empty;
                };
                _check(start, _details, _total);

                /* <!-- Check clear --> */
                clear[0].click();
                expect(date.val()).to.be.empty;
                expect(duration.val()).to.be.empty;

                /* <!-- Check Totals --> */
                expect(Number(total.val()))
                  .to.be.a("number")
                  .that.equals(_total);
                expect(display.val())
                  .to.be.a("string")
                  .that.equals(`${_total} ${state.suffix}`);

                /* <!-- Remove Item --> */
                list.find(".list-item").last().find("a.delete")[0].click();

                /* <!-- Check Totals --> */
                expect(Number(total.val()))
                  .to.be.a("number")
                  .that.equals(0);
                expect(display.val()).to.be.empty;

                /* <!-- Check each addition --> */
                var _running = 0;
                _.each(_additions, addition => {

                  details.val(addition.details);
                  date.val(addition.date.format(format));
                  _.times(addition.total, () => increase[0].click());
                  add[0].click();

                  var _total = addition.total * state.increment;
                  _check(addition.date, addition.details, _total);

                  expect(Number(total.val()))
                    .to.be.a("number")
                    .that.equals(_running += _total);

                  /* <!-- Clear Inputs --> */
                  clear[0].click();

                });

                /* <!-- Remove all List Items --> */
                var _items = list.find(".list-item");
                _.each(_items, item => {
                  var _count = list.find(".list-item").length;
                  $(item).find("a.delete")[0].click();
                  expect(list.find(".list-item").length)
                    .to.be.a("number")
                    .that.equals(_count - 1);
                  expect(Number(total.val()))
                    .to.be.a("number")
                    .that.equals(_running -= Number($(item).find("span[data-output-name='Number']").text()));
                });

              },
            }),
            evidence: () => {
              var _options = _blocks.lists(),
                _scale = _blocks.scale(_options, true);
              return _.extend(_blocks.basic("Evidence Scale"), {
                template: "field_scale",
                type: GEN.t(GEN.i(5, 10)),
                items_details: GEN.t(GEN.i(10, 50)),
                list_template: "field_items",
                list_field: GEN.b() ? "Evidence" : null,
                scale: _scale,
                markers: _scale.scale,
                options: _options,
                _interact: (field, modal, state) => {

                  var _test = (value, marker) => value === true ?
                    value : marker.evidence ? true : marker.children ?
                    _.reduce(marker.children, _test, value) : false;

                  var _marker = parent => marker => {

                    var _name = `${parent ? 
                        `${parent}.` : ""}${marker.number ? marker.number : marker.value}`,
                      _output = `${_name}${marker.name ? ` ${marker.name}`: ""}`;
                    var _el = field.find(`li[data-output-name='${$.escapeSelector(_output)}']`);

                    return marker.evidence || marker.children && _.reduce(marker.children, _test, false) ?
                      new Promise((resolve, reject) => {

                        try {

                          var _child = _el.children("ul, div.list-holder");
                          expect(_child.css("display") === "none").to.be.true;
                          _el.find("> div > label.material-switch")[0].click();

                          PAUSE().then(() => {

                            expect(_child.css("display") === "none").to.be.false;

                            if (marker.children) {
                              return Promise.each(_.map(marker.children, _marker(_name)));
                            } else if (marker._data) {
                              return Promise.each(_.map(marker._data.options, (option, index) => {
                                var __el = _el.find("div.dropdown-menu")
                                  .find(`.dropdown-item[data-value='${$.escapeSelector(option.value)}']`);
                                __el[0].click();
                                var _items = _child.find("div.list-data").children("div.list-item");
                                expect(_items.length).to.equal(index + 1);
                                expect(_items.last().find("span[data-output-name='Value']").text())
                                  .to.be.a("string")
                                  .that.equals(option.class.endsWith("paper") ? "Paper" : "Offline");
                                expect(_items.last().find("span[data-output-name='Type']").text())
                                  .to.be.a("string")
                                  .that.equals(state.type);
                                return Promise.resolve();
                              }));
                            }

                          }).then(resolve).catch(e => reject(e));

                        } catch (e) {
                          reject(e);
                        }

                      }) : Promise.resolve();

                  };

                  return Promise.each(_.map(state.markers, _marker()));

                },
              });
            },
          },
          _test = type => {
            var _run = (f, modal) => {
              try {
                var _return = f._interact && _.isFunction(f._interact) ?
                  f._interact(modal.find(`[data-id='${f.id}']`), modal, f) : true;
                return Promise.resolve(_return);
              } catch (e) {
                return Promise.reject(e);
              }
            };
            var _data = GENERATE(type);
            return _form(_data.fields.join("\n").trim(), modal => Promise.each(_.map(_data.state,
                f => _run(f, modal).catch(_fail))),
              _data.state.length === 1 && _data.state[0]._title ? _data.state[0]._title : false);
          };

        try {

          Promise.each(_.map(_types, type => () => _test(type)))
            .then(() => _test(_types))
            .then(_succeed)
            .catch(_fail);

        } catch (err) {
          _fail(err);
        }

      });

    })),

    persistence: () => RACE(new Promise(resolve => {

      PAUSE().then(() => {

        var _fail = e => resolve(FACTORY.Flags.error("Persistence Test FAILED", e)
            .reflect(false)),
          _succeed = () => resolve(FACTORY.Flags.log("Persistence Test SUCCEEDED")
            .reflect(true));

        var _form = (fields, populate, check) => _modal("form", {
            id: "persistence_form",
            title: "Testing Form",
            fields: fields,
          }, populate, check),
          _test = type => {
            var _data = GENERATE(type),
              _process = fields => values => {

                /* <!-- Test Conditions --> */
                expect(values).to.be.an("object");

                /* <!-- Load, Populate and Test new Form --> */
                return _form(
                  fields.join("\n").trim(),
                  modal => {
                    try {
                      data.rehydrate(modal.find("form"), values);
                      return Promise.each(_.map(_data.state,
                        f => Promise.resolve(f._interact && _.isFunction(f._interact) ?
                          f._interact(modal.find(`[data-id='${f.id}']`), modal, f) : true).catch(_fail)));
                    } catch (e) {
                      _fail(e);
                    }
                  },
                  _check(_data.state, _fail)
                );
              };

            return _form(
              _data.fields.join("\n").trim(),
              _populate(_data.state),
              _process(_data.fields, _data.state, _fail)
            );

          },
          _types = {
            me: _blocks.types.textual_Me,
            textual: _blocks.types.textual_General,
            numeric: _blocks.types.numeric_Complex,
            date: _blocks.types.span_Date,
            radio: _blocks.types.radio_OptionsWithDetails,
            string: _blocks.types.select_String,
            select: _blocks.types.select_Options,
            items: _blocks.types.complex_Add,
            complex: _blocks.types.complex_AddWithOptions,
            durations: _blocks.types.durations_Add,
            scale: _blocks.types.scale_Evidence
          };

        try {

          Promise.each(_.map(_types, type => () => _test(type)))
            .then(() => _test(_types))
            .then(_succeed)
            .catch(_fail);

        } catch (err) {
          _fail(err);
        }

      });

    })),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};