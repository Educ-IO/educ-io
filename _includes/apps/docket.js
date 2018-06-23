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

  var _pick = () => new Promise((resolve, reject) => {

    /* <!-- Open Sheet from Google Drive Picker --> */
    ಠ_ಠ.Google.pick(
      "Select a Docket Sheet to Open", false, true,
      () => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
      file => file ? ಠ_ಠ.Flags.log("Google Drive File Picked from Open", file) && resolve(file.id) : reject()
    );

  });

  var _config = {

    name: "config.json",

    mime: "application/json",

    id: false,

    config: false,

    clear: () => ಠ_ಠ.Google.appData.search(_config.name, _config.mime)
      .then(results => Promise.all(_.map(results, result => ಠ_ಠ.Google.files.delete(result.id))))
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

    /* <!-- Action Methods --> */
    get: target => (target.data("id") !== null && target.data("id") !== undefined) ? _show.db.get(target.data("id")) : false,

    hookup: container => {

      /* <!-- Ensure Links open new tabs --> */
      container.find("a:not([href^='#'])").attr("target", "_blank");

      /* <!-- Enable Button Links --> */
      container.find(".input-group button").on("click.action", e => {
        var target = $(e.currentTarget);
        if (target.data("action")) {
          var parent = target.parents("div.item");
          target.data("action") == "cancel" ?
            _show.cancel(parent) : target.data("action") == "delete" ?
            _show.delete(parent) : target.data("action") == "update" ?
            _show.update(parent) : target.data("action") == "move" ?
            _show.move(parent) : target.data("action") == "complete" ?
            _show.complete(parent) : false;
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
              _show.complete(_handle(e.currentTarget));
            } else {
              _show.update(_handle(e.currentTarget));
            }
          } else if (code == 27) {
            /* <!-- Escape Pressed / Cancel Update --> */
            e.preventDefault();
            _show.cancel(_handle(e.currentTarget));
          }
        });

      /* <!-- Enable Item Editing --> */
      (container.is("div.item") ? container : container.find("div.item"))
      .off("click.item").on("click.item", e => {
        var _target = $(e.currentTarget),
          _clicked = $(e.target);
        _target.find("textarea.resizable").on("focus.autosize", e => autosize(e.currentTarget));
        !_clicked.is("input, textarea, a, span") ?
          e.shiftKey ? e.preventDefault() || _show.clear() || _show.complete(_target) : _target.find("div.editing, div.display").toggleClass("d-none") : false;
        if (_target.find("div.editing").is(":visible")) _target.find("div.editing textarea").focus();
      });

      /* <!-- Enable Tooltips --> */
      ಠ_ಠ.Display.tooltips(container.find("[data-toggle='tooltip']"), {
        container: "body"
      });

    },

    busy: (target, item) => (clear => () => {
      if (clear && _.isFunction(clear)) clear();
      if (target && item) {
        var _new = $(ಠ_ಠ.Display.template.get(_.extend({
          template: "item",
          editable: true
        }, item)));
        target.replaceWith(_new);
        _show.hookup(_new);
      }
    })(ಠ_ಠ.Display.busy({
      target: target,
      class: "loader-small float-right",
      fn: true
    })),

    move: target => {
      var _item = _show.get(target),
        _input = target.find("input.dt-picker");
      _input.on("change", e => {
        var _finish = _show.busy(target, _item);

        /* <!-- Update Date --> */
        _item.FROM = new moment($(e.target).val());

        /* <!-- Process Item, Reconcile UI then Update Database --> */
        _tasks.items.process(_item).then(item => {
            _show.db.update(item);
            return _tasks.items.update(item);
          })
          .then(_finish)
          .then(() => _show.weekly(moment(_show.show ? _show.show : _show.today)));
      });
      _input.bootstrapMaterialDatePicker({
        format: "YYYY-MM-DD",
        cancelText: "Cancel",
        clearButton: false,
        nowButton: true,
        time: false,
        switchOnClick: true,
        triggerEvent: "dblclick"
      });

      _input.dblclick();

    },

    complete: target => {
      var _item = _show.get(target),
        _finish = _show.busy(target, _item);

      /* <!-- Update Item --> */
      _item._complete = !(_item._complete);
      _item.STATUS = _item._complete ? "COMPLETE" : "";
      _item.DONE = _item._complete ? moment() : "";

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return _tasks.items.process(_item).then(item => {
        _show.db.update(item);
        var _content = target.find("div.display p");
        item._complete ? _content.wrap($("<del />", {
          class: "text-muted"
        })) : _content.unwrap("del");
        return _tasks.items.update(item);
      }).then(_finish);
    },

    update: target => {
      var _item = _show.get(target),
        _finish = _show.busy(target, _item);

      /* <!-- Update Item --> */
      _item.DETAILS = target.find("div.editing textarea").val();
      _item.DISPLAY = _showdown.makeHtml(_item.DETAILS);

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return _tasks.items.process(_item).then(item => {
        _show.db.update(item);
        target.find("div.display p").html(item.DISPLAY);
        return _tasks.items.update(item);
      }).then(_finish);
    },

    delete: target => {

      var _item = _show.get(target);

      return ಠ_ಠ.Display.confirm({
          id: "delete_Item",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to delete this item: ${_item.DISPLAY}`,
          action: "Delete"
        })
        .then(confirm => {
          if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */

          /* <!-- Reconcile UI --> */
          target.remove();
          _show.db.remove(_item);

          /* <!-- Update Database --> */
          return _tasks.items.delete(_item);
        }).catch(e => e);
    },

    cancel: target => {

      /* <!-- Reconcile UI --> */
      target.find("div.editing textarea").val(_show.get(target).DETAILS);
      return Promise.resolve();
    },

    clear: () => {

      var s = window.getSelection ? window.getSelection() : document.selection;
      s ? s.removeAllRanges ? s.removeAllRanges() : s.empty ? s.empty() : false : false;

    },

    detag: (target, tag) => {

      return ಠ_ಠ.Display.confirm({
          id: "remove_Tag",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to remove the <strong>${tag}</strong> tag from this item`,
          action: "Remove"
        })
        .then(confirm => {
          if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */
          var _item = _show.get(target),
            _finish = _show.busy(target, _item);

          /* <!-- Update Item --> */
          _item.TAGS = (_item.BADGES = _.filter(_item.BADGES, badge => badge != tag)).join(";");

          /* <!-- Process Item, Reconcile UI then Update Database --> */
          return _tasks.items.process(_item).then(item => {
            _show.db.update(item);
            target.find(`span.badge a:contains('${tag}')`).filter(function() {
              return $(this).text() == tag;
            }).parents("span.badge").remove();
            return _tasks.items.update(item);
          }).then(_finish);
        }).catch(e => e);
    },
    /* <!-- Action Methods --> */

    /* <!-- Diary Methods --> */
    list: list => ಠ_ಠ.Display.modal("list", {
      target: ಠ_ಠ.container,
      id: `${ID}_list`,
      title: `${list.length} Docket Item${list.length > 1 ? "s" : ""}`,
      items: _.sortBy(_.each(list, item => {
        !item.DISPLAY && item.DETAILS ? item.DISPLAY = _showdown.makeHtml(item.DETAILS) : false;
        item._action = ((item._complete && item.DONE) ?
          item.DONE : (item._timed || item.FROM.isAfter(_show.today)) ?
          item.FROM : moment(_show.today)).format("YYYY-MM-DD");
      }), "FROM"),
    }).then(() => list),

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
        var _all = _show.db ? _tasks.query(focus, _show.db, focus.isSame(_show.today)) : [];
        _.each(_all, item => {
          (!item.DISPLAY && item.DETAILS) ? item.DISPLAY = _showdown.makeHtml(item.DETAILS): false;
          item._action = ((item._complete && item.DONE) ?
            item.DONE : (item._timed || item.FROM.isAfter(_show.today)) ?
            item.FROM : moment(_show.todayf)).format("YYYY-MM-DD");
        });
        var _diary = {
          tasks: _.filter(_all, item => !item._timed),
          events: _.filter(_all, item => item._timed),
        };

        _add(focus, {
          block: focus.isSame(_show.today) || (focus.isoWeekday() == 6 && focus.clone().add(1, "days").isSame(_show.today)) ?
            "present bg-highlight-gradient top-to-bottom" : focus.isSame(_show.show) ? "focussed" : focus.isBefore(_show.today) ? "past text-muted" : "future",
          title: focus.isSame(_show.today) ? "present" : ""
        }, focus.format("YYYY-MM-DD"), _diary.tasks, _diary.events);
      });
      _days.push({
        sizes: {
          xs: 12
        },
        title: "Future",
        class: "mt-2 bg-light text-muted"
      });

      var _diary = ಠ_ಠ.Display.template.show({
        template: "weekly",
        id: ID,
        days: _days,
        action: {
          list: [{
            action: "new.task",
            icon: "add"
          }, {
            action: "search",
            icon: "search"
          }, {
            action: "today",
            icon: "today"
          }],
          icon: "edit"
        },
        target: ಠ_ಠ.container,
        clear: true,
      });

      /* <!-- Hookup all relevant events --> */
      _show.hookup(_diary);

      /* <!-- Swipe and Touch Controls --> */
      var swipe_control = new Hammer(_diary[0]);
      swipe_control.get("swipe").set({
        direction: Hammer.DIRECTION_HORIZONTAL
      });
      swipe_control.on("swipe", e => {
        if (e.pointerType == "touch") {
          if (e.type == "swipeleft" || (e.type == "swipe" && e.direction == 2)) {
            _show.weekly(moment(_show.show ? _show.show : _show.today).clone().add(1, "weeks"));
          } else if (e.type == "swiperight" || (e.type == "swipe" && e.direction == 4)) {
            _show.weekly(moment(_show.show ? _show.show : _show.today).clone().subtract(1, "weeks"));
          }
        }
      });

      /* <!-- Scroll to today if visible --> */
      if (Element.prototype.scrollIntoView) {
        var _now = _diary.find("div.present");
        if (_now.length === 1 && _now[0].scrollIntoView) _now[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });
      }

      resolve(ಠ_ಠ.Display.state().enter(STATE_OPENED));

    }),

    tagged: tag => _show.list(_tasks.tagged(tag, _show.db)),
    /* <!-- Diary Methods --> */

  };

  var _new = {

    item: type => {

      var _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _template = "new",
        _id = "new";
      return ಠ_ಠ.Display.modal(_template, {
          target: ಠ_ಠ.container,
          id: _id,
          title: `Create New ${type}`,
          instructions: ಠ_ಠ.Display.doc.get("NEW_INSTRUCTIONS"),
          validate: values => values ? ಠ_ಠ.Flags.log("Values for Validation", values) && true : false,
          /* <!-- Do we need to validate? --> */
          date: moment(_show.show ? _show.show : _show.today).format("YYYY-MM-DD"),
          handlers: {
            clear: ಠ_ಠ.Dialog({}, ಠ_ಠ).handlers.clear,
          },
          updates: {
            extract: _dialog.handlers.extract(_tasks.regexes.EXTRACT_TIME)
          }
        }, dialog => {
          ಠ_ಠ.Fields().on(dialog);
          dialog.find(`#${_id}_details`).focus();

          /* <!-- Ctrl-Enter Pressed --> */
          dialog.keypress(e => ((e.keyCode ? e.keyCode : e.which) == 10 && e.ctrlKey) ? e.preventDefault() || dialog.find("button.btn-primary").click() : null);

        }).then(values => {
          if (!values) return false;
          ಠ_ಠ.Flags.log("Values for Creation", values);

          var _item = {
            FROM: values.From ? values.From.Value : null,
            TAGS: values.Tags ? values.Tags.Value : null,
            DETAILS: values.Details ? values.Details.Value : null,
          };

          return _tasks.items.process(_item).then(item => _tasks.items.create(_show.db.insert(item)));

        })
        .then(r => {
          if (r === false) return r;
          _show.db.update(r);
          return _show.weekly(moment(_show.show ? _show.show : _show.today));
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Create New Error", e) : ಠ_ಠ.Flags.log("Create New Cancelled"));
    },

    task: () => _new.item("Task"),

  };

  var _find = {

    search: () => ಠ_ಠ.Display.text({
        message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
        simple: true,
      }).then(query => query ? _show.list(_tasks.search(query, _show.db, !_show.show ? _show.today : _show.show >= _show.today ? _show.show : false)) : false)
      .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"))

  };

  var _archive = {

    show: () => {

      return Promise.resolve(true);

    }

  };

  var _start = (config, busy) => {

    _options.calendar(config.calendar);
    _options.issues(config.issues);
    _options.classes(config.classes);

    if (busy) busy({
      message: "Loading Data"
    });

    return _tasks.open(config.data)
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
              status: "Creating Config",
              fn: true
            });

            _tasks.create()
              .then(id => _config.create(id))
              .then(() => _start(_config.config, _finish))
              .then(_finish);

          } else if ((/OPEN/i).test(command)) {

            /* <!-- Pick, then Load the Selected File --> */
            var _picked;
            _pick()
              .then(id => _picked = id)
              .then(() => _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                status: "Loading Config",
                fn: true
              }))
              .then(() => _config.find())
              .then(config => config ? _config.update(config.id, {
                data: _picked
              }) : _config.create(_picked))
              .then(() => _start(_config.config, _finish))
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

          } else if ((/ARCHIVE/i).test(command)) {

            _archive.show();

          } else if ((/NEW/i).test(command) && command.length > 1 && (/TASK/i).test(command[1])) {

            _new.task();

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

            _show.weekly(moment(_show.show ? _show.show : _show.today).clone().add(1, "weeks"));

          } else if ((/BACKWARD/i).test(command)) {

            _show.weekly(moment(_show.show ? _show.show : _show.today).clone().subtract(1, "weeks"));

          } else if ((/REMOVE/i).test(command) && command.length == 4 && (/TAG/i).test(command[1])) {

            _show.detag($(`#item_${command[2]}`), command[3]);

          } else if ((/SEARCH/i).test(command)) {

            command.length > 1 && (/TAGS/i).test(command[1]) ?
              _show.tagged(command[2])
              .then(results => ಠ_ಠ.Flags.log(`Found Docket ${results.length} Item${results.length > 1 ? "s" : ""}`, results)) :
              _find.search();

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
      var _from = () => moment(_show.show ? _show.show : _show.today).clone();
      Mousetrap.bind("t", () => _show.weekly(moment(_show.today)));
      Mousetrap.bind("T", () => _show.weekly(moment(_show.today)));
      Mousetrap.bind("<", () => _show.weekly(moment(_show.show ? _show.show : _show.today).clone().subtract(1, "weeks")));
      Mousetrap.bind(">", () => _show.weekly(moment(_show.show ? _show.show : _show.today).clone().add(1, "weeks")));
      Mousetrap.bind(",", () => {
        var _start = _from();
        _show.weekly(_start.subtract(_start.isoWeekday() == 7 ? 2 : 1, "days"));
      });
      Mousetrap.bind(".", () => {
        var _start = _from();
        _show.weekly(_start.add(_start.isoWeekday() == 6 ? 2 : 1, "days"));
      });
      Mousetrap.bind("n", () => _new.task());
      Mousetrap.bind("N", () => _new.task());
      Mousetrap.bind("s", () => _find.search());
      Mousetrap.bind("S", () => _find.search());
      Mousetrap.bind("f", () => _find.search());
      Mousetrap.bind("F", () => _find.search());

      /* <!-- Create Tasks Reference --> */
      _tasks = ಠ_ಠ.Tasks(ಠ_ಠ);

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

  };

};