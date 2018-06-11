App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const STATE_OPENED = "opened",
    STATE_CALENDAR = "calendar",
    STATE_ISSUES = "issues",
    STATE_CLASSES = "classes",
    STATES = [STATE_OPENED, STATE_CALENDAR, STATE_ISSUES, STATE_CLASSES];
  const ID = "diary";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _tasks, _showdown;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _getTasks = () => (_tasks ? _tasks : _tasks = ಠ_ಠ.Tasks(ಠ_ಠ));

  var _config = {

    name: "config.json",

    mime: "application/json",

    id: false,

    config: false,

    clear: () => _config.find()
      .then(result => result && result.id ? ಠ_ಠ.Google.files.delete(result.id) : result)
      .then(result => result ? _config.config = false || ಠ_ಠ.Flags.log("Docket Config Deleted") : result),

    create: data => ಠ_ಠ.Google.appData.upload({
        name: _config.name
      }, JSON.stringify(_config.config = {
        data: data,
        calendar: false,
        issues: false,
        classes: false
      }), _config.mime)
      .then(uploaded => {
        ಠ_ಠ.Flags.log(`Docket Config (${_config.name}) Saved`, uploaded);
        _config.id = uploaded.id;
        return uploaded;
      })
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error")),

    find: () => ಠ_ಠ.Google.appData.search(_config.name, _config.mime).then(results => {
      if (results && results.length == 1) {
        ಠ_ಠ.Flags.log(`Found Docket Config [${results[0].name} / ${results[0].id}]`);
        return results[0];
      } else {
        ಠ_ಠ.Flags.log("No Existing Docket Config");
        return false;
      }
    }).catch(e => ಠ_ಠ.Flags.error("Config Error", e ? e : "No Inner Error")),

    get: () => _config.find().then(result => result ? _config.load(result) : result),

    load: file => ಠ_ಠ.Google.download(file.id).then(loaded => {
      return ಠ_ಠ.Google.reader().promiseAsText(loaded).then(parsed => {
        ಠ_ಠ.Flags.log(`Loaded Docket Config [${file.name} / ${file.id}]: ${parsed}`);
        _config.id = file.id;
        return parsed;
      }).then(parsed => _config.config = JSON.parse(parsed));
    }),

    update: (id, config) => ಠ_ಠ.Google.appData.upload({
        name: _config.name
      }, JSON.stringify(_config.config = _.defaults(config, _config.config)), _config.mime, id)
      .then(uploaded => {
        ಠ_ಠ.Flags.log(`Docket Config (${_config.name}) Updated`, uploaded);
        return uploaded;
      })
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))

  };

  var _options = {

    _action: (force, state) => new Promise(resolve => {
      var _state = force || (force === undefined && !ಠ_ಠ.Display.state().in(state)) ?
        ಠ_ಠ.Display.state().enter(state) : ಠ_ಠ.Display.state().exit(state);
      resolve(_state.state().in(state));
    }),

    calendar: force => _options._action(force, STATE_CALENDAR),

    issues: force => _options._action(force, STATE_ISSUES),

    classes: force => _options._action(force, STATE_CLASSES),

  };

  var _show = {

    db: false,

    today: false,

    show: false,

    weekly: focus => new Promise(resolve => {

      focus = focus.isoWeekday() == 7 ? focus.subtract(1, "days") : focus;
      _show.show = focus.startOf("day").toDate();

      var _days = [],
        _add = (date, css, action, tasks, events) => {
          _days.push({
            sizes: date.isoWeekday() >= 6 ? {
              xs: 12
            } : {
              lg: 6,
              xl: 4
            },
            row_sizes: date.isoWeekday() == 6 ? {
              lg: 6,
              xl: 4
            } : false,
            title: date.format("ddd"),
            date: date.toDate(),
            instruction: date.isoWeekday() == 6 ? "row-start" : date.isoWeekday() == 7 ? "row-end" : false,
            class: date.isoWeekday() >= 6 ? `p-0 ${css.block}` : css.block,
            action: action,
            title_class: css.title,
            tasks: tasks,
            events: events
          });
        };

      focus.add(focus.isoWeekday() == 1 ? -3 : -2, "days");
      _.times(7, () => {
        focus.add(1, "days");
        var _all = _show.db ? _getTasks().query(focus, _show.db, focus.isSame(_show.today)) : [];
        _.each(_all, item => (item.DISPLAY = _showdown.makeHtml(item.DETAILS)));
        var _tasks = _.filter(_all, item => !item._timed),
          _events = _.filter(_all, item => item._timed);
        _add(focus, {
          block: focus.isSame(_show.today) || (focus.isoWeekday() == 6 && focus.clone().add(1, "days").isSame(_show.today)) ?
            "present bg-highlight-gradient top-to-bottom" : focus.isBefore(_show.today) ? "past text-muted" : "future",
          title: focus.isSame(_show.today) ? "present" : ""
        }, focus.format("YYYY-MM-DD"), _tasks, _events);
      });
      _days.push({
        sizes: {
          xs: 12
        },
        title: "Future",
        class: "mt-2 bg-light text-muted"
      });

      /* <!-- Action Methods --> */
      var _get = target => _show.db.get(target.data("id")),
        _busy = (target, item) => {
          var _clearBusy = ಠ_ಠ.Display.busy({
            target: target,
            class: "loader-small",
            fn: true
          });
          return () => {
            if (_clearBusy) _clearBusy();
            if (target && item) {
              var _new = $(ಠ_ಠ.Display.template.get(_.extend({
                template: "item",
              }, item)));
              target.replaceWith(_new);
              _hookup(_new);
            }
          };
        },
        _complete = target => {
          var _item = _get(target),
            _finish = _busy(target, _item);
          _item._complete = !(_item._complete);
          _item.STATUS = _item._complete ? "COMPLETE" : "";
          _item.DONE = _item._complete ? moment() : "";
          var _content = target.find("div.display div p");
          _item._complete ? _content.wrap($("<del />", {
            class: "text-muted"
          })) : _content.unwrap("del");
          return _getTasks().items.update(_item, _show.db).then(_finish);
        },
        _update = target => {
          var _item = _get(target),
            _finish = _busy(target, _item);
          _item.DETAILS = target.find("div.editing textarea").val();
          _item.DISPLAY = _showdown.makeHtml(_item.DETAILS);
          target.find("div.display div").html(_item.DISPLAY);
          return _getTasks().items.update(_item, _show.db).then(_finish);
        },
        _delete = target => {
          var _item = _get(target),
            _finish = _busy(target, _item);
          target.remove();
          _show.db.remove(_item);
          return _getTasks().items.delete(_item, _show.db).then(_finish);
        },
        _cancel = target => {
          target.find("div.editing textarea").val(_get(target).DETAILS);
          return Promise.resolve();
        },
        _clear = () => {
          var s = window.getSelection ? window.getSelection() : document.selection;
          return s ? s.removeAllRanges ? s.removeAllRanges() : s.empty ? s.empty() : false : false;
        };

      var _diary = ಠ_ಠ.Display.template.show({
        template: "weekly",
        id: ID,
        days: _days,
        target: ಠ_ಠ.container,
        clear: true,
      });

      function _hookup(container) {

        /* <!-- Ensure Links open new tabs --> */
        container.find("a:not([href^='#'])").attr("target", "_blank");

        /* <!-- Enable Button Links --> */
        container.find("button").on("click.action", e => {
          var target = $(e.currentTarget);
          if (target.data("action")) {
            var parent = target.parents("div.item");
            target.data("action") == "cancel" ?
              _cancel(parent) : target.data("action") == "delete" ?
              _delete(parent) : target.data("action") == "update" ?
              _update(parent) : target.data("action") == "complete" ?
              _complete(parent) : false;
          }
        });

        /* <!-- Enable Keyboard Shortcuts --> */
        container.find("div.editing textarea")
          .keydown(e => {
            var code = e.keyCode ? e.keyCode : e.which;
            if (code == 13 || code == 27) e.preventDefault(); /* <!-- Enter or Escape Pressed --> */
          })
          .keyup(e => {
            var code = e.keyCode ? e.keyCode : e.which;
            var _handle = target => {
              var parent = $(target).parents("div.item");
              parent.find("div.editing, div.display").toggleClass("d-none");
              return parent;
            };
            if (code == 13) {
              /* <!-- Enter Pressed --> */
              e.preventDefault();
              if (e.shiftKey) {
                _complete(_handle(e.currentTarget));
              } else {
                _update(_handle(e.currentTarget));
              }
            } else if (code == 27) {
              /* <!-- Escape Pressed / Cancel Update --> */
              e.preventDefault();
              _cancel(_handle(e.currentTarget));
            }
          });

        /* <!-- Enable Item Editing --> */
        (container.is("div.item") ? container : container.find("div.item"))
        .off("click.item").on("click.item", e => {
          var _target = $(e.currentTarget),
            _clicked = $(e.target);
          _target.find("textarea.resizable").on("focus.autosize", e => autosize(e.currentTarget));
          !_clicked.is("input, textarea, a") ?
            e.shiftKey ? e.preventDefault() || (_complete(_target) && _clear()) : _target.find("div.editing, div.display").toggleClass("d-none") : false;
          if (_target.find("div.editing").is(":visible")) _target.find("div.editing textarea").focus();
        });

      }

      /* <!-- Hookup all relevant events --> */
      _hookup(_diary);

      resolve(ಠ_ಠ.Display.state().enter(STATE_OPENED));

    })

  };

  var _start = (config, busy) => {

    _options.calendar(config.calendar);
    _options.issues(config.issues);
    _options.classes(config.classes);

    if (busy) busy({
      message: "Loading Data"
    });

    return _getTasks().open(config.data)
      .then(db => {
        _show.db = db;
        if (busy) busy({
          message: "Loaded Data"
        });
        _show.weekly(moment());
      })
      .catch(e => ಠ_ಠ.Flags.error("Data Error", e ? e : "No Inner Error"));

  };
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Docket",
        states: STATES,
        recent: false,
        simple: true,
        start: () => {

          var _busy = ಠ_ಠ.Display.busy({
            target: ಠ_ಠ.container,
            status: "Loading Config",
            fn: true
          });

          _config.get()
            .then(config => !config ? ಠ_ಠ.Router.start() : _busy({
              message: "Loaded Config"
            }) && _start(config, _busy))
            .then(_busy);

        },
        test: () => ಠ_ಠ.Display.state().in(STATE_OPENED),
        clear: () => {},
        route: (handled, command) => {

          if (handled) return;
          var _finish;

          if ((/CREATE/i).test(command)) {

            _finish = ಠ_ಠ.Display.busy({
              target: ಠ_ಠ.container,
              fn: true
            });

            _getTasks().create()
              .then(id => _config.create(id))
              .then(() => _start(_config.config))
              .then(_finish);

          } else if ((/OPEN/i).test(command)) {

            /* <!-- Pick, then Load the Selected File --> */
            var _picked;
            _getTasks().pick()
              .then(id => _picked = id)
              .then(() => _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                fn: true
              }))
              .then(() => _config.find())
              .then(config => config ? _config.update(config.id, {
                data: _picked
              }) : _config.create(_picked))
              .then(() => _start(_config.config))
              .catch(e => ಠ_ಠ.Flags.error("Picking Error", e ? e : "No Inner Error"));

          } else if ((/CONFIG/i).test(command)) {

            if (command.length > 1 && (/CLEAR/i).test(command[1])) {

              ಠ_ಠ.Display.confirm({
                  id: "clear_Config",
                  target: ಠ_ಠ.container,
                  message: "Please confirm that you wish to <strong>clear</strong> the configuration. This will <strong>not delete</strong> your data.",
                  action: "Clear"
                })
                .then(confirm => confirm ? ಠ_ಠ.Display.busy() && _config.clear() : false)
                .then(cleared => cleared ? ಠ_ಠ.Router.start() : false);

            } else if (command.length > 1 && (/SHOW/i).test(command[1])) {

              var _details = {};
              _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                fn: true
              });

              _config.find()
                .then(result => result ? _config.load(_details.file = result) : result)
                .then(config => config ? _details.config = config : config)
                .then(config => _finish() && config ? ಠ_ಠ.Display.inform({
                  id: "show_Config",
                  target: ಠ_ಠ.container,
                  code: _.escape(JSON.stringify(_details, null, 4))
                }) : config);

            }

          } else if ((/CALENDAR/i).test(command)) {

            _options.calendar().then(result => _config.update(_config.id, {
              calendar: result
            }));

          } else if ((/ISSUES/i).test(command)) {

            _options.issues().then(result => _config.update(_config.id, {
              issues: result
            }));

          } else if ((/CLASSES/i).test(command)) {

            _options.classes().then(result => _config.update(_config.id, {
              classes: result
            }));

          } else if ((/TODAY/i).test(command)) {

            _show.weekly(moment(_show.today));

          } else if ((/FORWARD/i).test(command)) {

            _show.weekly(moment(_show.show ? _show.show : _show.today).add(1, "weeks"));

          } else if ((/BACKWARD/i).test(command)) {

            _show.weekly(moment(_show.show ? _show.show : _show.today).subtract(1, "weeks"));

          } else {

            var _parsed = moment(command);
            if (_parsed.isValid()) _show.weekly(_parsed);

          }

        }
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Start App after fully loaded --> */
    start: () => {

      /* <!-- Setup Moment --> */
      moment().format();
      _show.today = moment().startOf("day").toDate();

      /* <!-- Setup Showdown --> */
      _showdown = new showdown.Converter({
        strikethrough: true
      });

      /* <!-- Bind Keyboard shortcuts --> */
      Mousetrap.bind("t", () => _show.weekly(moment(_show.today)));
      Mousetrap.bind("<", () => _show.weekly(moment(_show.show ? _show.show : _show.today).subtract(1, "weeks")));
      Mousetrap.bind(">", () => _show.weekly(moment(_show.show ? _show.show : _show.today).add(1, "weeks")));

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

  };

};