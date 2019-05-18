App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const STATE_READY = "ready",
    STATE_CONFIG = "config",
    STATE_OPENED = "opened",
    STATE_WEEKLY = "weekly",
    STATE_DAILY = "daily",
    STATE_CALENDARS = "calendars",
    STATE_ISSUES = "issues",
    STATE_CLASSES = "classes",
    STATES = [STATE_READY, STATE_CONFIG, STATE_OPENED,
      STATE_WEEKLY, STATE_DAILY,
      STATE_CALENDARS, STATE_ISSUES, STATE_CLASSES
    ];
  const SCOPE_CALENDARS = "https://www.googleapis.com/auth/calendar.readonly",
    SCOPE_CLASSWORK = "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
    SCOPE_COURSEWORK = "https://www.googleapis.com/auth/classroom.coursework.me.readonly";
  const ID = "diary",
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */


  /* <-- Helper Functions --> */
  FN.helper = {

    choose: {

      prompt: (name, map, list) => list()
        .catch(e => ಠ_ಠ.Flags.error(`${name} List`, e).negative())
        .then(ಠ_ಠ.Main.busy(`Loading ${name}s`))
        .then(options => options === false || options.length === 0 ||
          (options.length == 1 && options[0] === undefined) ? false : ಠ_ಠ.Display.choose({
            id: `choose_${name}`,
            title: `Please Choose a ${name} to Open ...`,
            action: options && options.length > 0 ? "Open" : false,
            choices: _.map(options, map),
            multiple: true
          })
          .catch(FN.helper.choose.error(name))
          .then(FN.helper.choose.result)),

      error: name => e => (e ?
        ಠ_ಠ.Flags.error(`${name} Select:`, e) :
        ಠ_ಠ.Flags.log(`${name} Select Cancelled`)).negative(),

      result: results => results ?
        _.isArray(results) ?
        results.length === 0 ?
        false : results : [results] : false,

    },

  };
  /* <-- Helper Functions --> */


  /* <-- Config Functions --> */
  FN.config = {

    name: "config.json",

    mime: "application/json",

    clear: () => ಠ_ಠ.Google.appData.search(FN.config.name, FN.config.mime)
      .then(results => Promise.all(_.map(results, result => ಠ_ಠ.Google.files.delete(result.id))))
      .then(result => result ? ರ‿ರ.config = false || ಠ_ಠ.Flags.log("Docket Config Deleted") : result),

    create: data => ಠ_ಠ.Google.appData.upload({
        name: FN.config.name
      }, JSON.stringify(ರ‿ರ.config = {
        data: data,
        calendar: false,
        issues: false,
        classes: false
      }), FN.config.mime)
      .then(uploaded => {
        ಠ_ಠ.Flags.log(`Docket Config (${FN.config.name}) Saved`, uploaded);
        ರ‿ರ.id = uploaded.id;
        ಠ_ಠ.Display.state().enter(STATE_CONFIG);
        return uploaded;
      })
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error")),

    find: () => ಠ_ಠ.Google.appData.search(FN.config.name, FN.config.mime).then(results => {
      if (results && results.length == 1) {
        ಠ_ಠ.Flags.log(`Found Docket Config [${results[0].name} / ${results[0].id}]`);
        return results[0];
      } else {
        ಠ_ಠ.Flags.log("No Existing Docket Config");
        return false;
      }
    }).catch(e => ಠ_ಠ.Flags.error("Config Error", e ? e : "No Inner Error")),

    get: () => FN.config.find().then(result => result ? FN.config.load(result) : result),

    load: file => ಠ_ಠ.Google.files.download(file.id).then(loaded => {
      return ಠ_ಠ.Google.reader().promiseAsText(loaded).then(parsed => {
        ಠ_ಠ.Flags.log(`Loaded Docket Config [${file.name} / ${file.id}]: ${parsed}`);
        ರ‿ರ.id = file.id;
        return parsed;
      }).then(parsed => ರ‿ರ.config = JSON.parse(parsed));
    }),

    update: (id, config) => ಠ_ಠ.Google.appData.upload({
        name: FN.config.name
      }, JSON.stringify(ರ‿ರ.config = _.defaults(config, ರ‿ರ.config)), FN.config.mime, id)
      .then(uploaded => {
        ಠ_ಠ.Flags.log(`Docket Config (${FN.config.name}) Updated`, uploaded);
        return uploaded;
      })
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))

  };
  /* <-- Config Functions --> */


  /* <-- Option Functions --> */
  FN.options = {

    action: (force, state) => new Promise(resolve => {
      var _state = force || (force === undefined && !ಠ_ಠ.Display.state().in(state)) ?
        ಠ_ಠ.Display.state().enter(state) : ಠ_ಠ.Display.state().exit(state);
      resolve(_state.state().in(state));
    }),

    calendars: force => FN.options.action(force, STATE_CALENDARS),

    issues: force => FN.options.action(force, STATE_ISSUES),

    classes: force => FN.options.action(force, STATE_CLASSES),

    process: type => () => FN.options[type]()
      .then(result => (result ? FN[type].choose() : Promise.resolve(false))
        .then(results => _.tap(results, results => {
          var _config = {};
          results ? _config[type] = results : delete ರ‿ರ.config[type];
          FN.config.update(ರ‿ರ.id, _config);
        }))
        .then(results => FN.options[type](!!results).then(FN.action.refresh))),
    
  };
  /* <-- Option Functions --> */


  /* <-- Items Functions --> */
  FN.items = {

    get: target => (target.data("id") !== null && target.data("id") !== undefined) ?
      ರ‿ರ.db.get(target.data("id")) : false,

    hookup: container => {

      var _return = promise => promise;

      /* <!-- Ensure Links open new tabs --> */
      container.find("a:not([href^='#'])").attr("target", "_blank").attr("rel", "noopener");

      /* <!-- Enable Button Links --> */
      container.find(".input-group button").on("click.action", e => {
        var target = $(e.currentTarget);
        if (target.data("action")) {
          var parent = target.parents("div.item");
          _return(target.data("action") == "cancel" ?
            FN.items.cancel(parent) : target.data("action") == "delete" ?
            FN.items.delete(parent) : target.data("action") == "update" ?
            FN.items.update(parent) : target.data("action") == "move" ?
            FN.items.move(parent) : target.data("action") == "complete" ?
            FN.items.complete(parent) : target.data("action") == "edit" ?
            FN.interact.edit(parent) : Promise.reject());
        }
      });

      /* <!-- Enable Keyboard Shortcuts --> */
      container.find("div.edit textarea")
        .keydown(e => {
          var code = e.keyCode ? e.keyCode : e.which;
          if (code == 13 || code == 27) e.preventDefault(); /* <!-- Enter or Escape Pressed --> */
        })
        .keyup(e => {
          var code = e.keyCode ? e.keyCode : e.which;
          var _handle = target => {
            var parent = $(target).parents("div.item");
            parent.find("div.edit, div.display").toggleClass("d-none");
            parent.toggleClass("editable").toggleClass("editing")
              .attr("draggable", (i, attr) =>
                attr === undefined || attr === null || attr === false || attr === "false" ?
                "true" : "false");
            return parent;
          };
          if (code == 13) {
            /* <!-- Enter Pressed --> */
            e.preventDefault();
            _return(e.shiftKey ?
              FN.items.complete(_handle(e.currentTarget)) : FN.items.update(_handle(e.currentTarget)));
          } else if (code == 27) {
            /* <!-- Escape Pressed / Cancel Update --> */
            e.preventDefault();
            _return(FN.items.cancel(_handle(e.currentTarget)));
          }
        });

      /* <!-- Enable Item Editing --> */
      (container.is("div.item") ?
        container : container.find("div.item.editable, div.item.editing"))
      .off("click.item").on("click.item", e => {
        var _target = $(e.currentTarget),
          _clicked = $(e.target);
        _target.find("textarea.resizable").on("focus.autosize", e => autosize(e.currentTarget));
        !_clicked.is("input, textarea, a, span, a > i") ?
          e.shiftKey ? e.preventDefault() || FN.items.clear() || FN.items.complete(_target) :
          _target.find("div.edit, div.display").toggleClass("d-none") &&
          _target.toggleClass("editable").toggleClass("editing")
          .attr("draggable", (i, attr) =>
            attr === undefined || attr === null || attr === false || attr === "false" ?
            "true" : "false") : false;
        if (_target.find("div.edit").is(":visible")) {

          /* <!-- Focus Cursor on Text Area --> */
          _target.find("div.edit textarea").focus();

          /* <!-- Scroll to target if possible --> */
          if (Element.prototype.scrollIntoView && _target[0].scrollIntoView) {
            _return = (top => promise => promise.then($("html, body").animate({
              scrollTop: top
            }, 400)))(ಠ_ಠ.Display.top());

            _target[0].scrollIntoView({
              block: "start",
              inline: "nearest"
            });
          }

          if (_target.attr("draggable")) {

            var _movable = new Hammer(_target.find("div.edit")[0]);
            _movable.get("pan").set({
              direction: Hammer.DIRECTION_VERTICAL,
              threshold: _target.height() / 2
            });
            _movable.on("pan", e => {
              if (e.pointerType == "touch") {
                var _destination = $(document.elementFromPoint(e.center.x, e.center.y));
                _destination = _destination.is("div.item[draggable=true]") ? _destination : _destination.parents("div.item[draggable=true]");
                if (_destination && _destination.length == 1) {
                  var _source = $(e.target);
                  _source = _source.is("div.item") ? _source : _source.parents("div.item");
                  if (_source.parents(".group")[0] == _destination.parents(".group")[0]) _source.insertBefore(_destination);
                }
              }
            });
            _movable.on("panend", e => {
              var _source = $(e.target);
              _source = _source.is("div.item") ? _source : _source.parents("div.item");
              var _list = [];
              _source.parent().children("div.item[draggable=true]").each((i, el) => {
                var _el = $(el),
                  _item = ರ‿ರ.db.get(_el.data("id")),
                  _order = i + 1;
                _el.data("order", _order);
                if (_item && _item.ORDER != _order)(_item.ORDER = _order) && _list.push(_item);
              });
              /* <!-- Save List --> */
              if (_list.length > 0) ಠ_ಠ.Flags.log("LIST TO SAVE:", _list);
            });
          }
        }
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
        FN.items.hookup(_new);
      }
    })(ಠ_ಠ.Display.busy({
      target: target,
      class: "loader-small float-right",
      fn: true
    })),

    move: target => {
      var _item = FN.items.get(target),
        _input = target.find("input.dt-picker");
      _input.on("change", e => {
        var _finish = FN.items.busy(target, _item);

        /* <!-- Update Date --> */
        _item.FROM = new moment($(e.target).val());

        /* <!-- Process Item, Reconcile UI then Update Database --> */
        ರ‿ರ.tasks.items.process(_item).then(item => {
            ರ‿ರ.db.update(item);
            return item;
          })
          .then(item => ರ‿ರ.tasks.items.update(item))
          .then(_finish)
          .then(() => FN.show.weekly(moment(ರ‿ರ.show || ರ‿ರ.today)))
          .catch(FN.items.errors.update);
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
      var _item = FN.items.get(target),
        _finish = FN.items.busy(target, _item);

      /* <!-- Update Item --> */
      _item._complete = !(_item._complete);
      _item.STATUS = _item._complete ? "COMPLETE" : "";
      _item.DONE = _item._complete ? moment() : "";

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return ರ‿ರ.tasks.items.process(_item).then(item => {
          ರ‿ರ.db.update(item);
          var _content = target.find("div.display p");
          item._complete ? _content.wrap($("<del />", {
            class: "text-muted"
          })) : _content.unwrap("del");
          return item;
        })
        .then(item => ರ‿ರ.tasks.items.update(item))
        .catch(FN.items.errors.update)
        .then(_finish);

    },

    update: target => {
      var _item = FN.items.get(target);

      /* <!-- Update Item --> */
      _item.DETAILS = target.find("div.edit textarea").val();
      _item.DISPLAY = ಱ.showdown.makeHtml(_item.DETAILS);

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return ರ‿ರ.tasks.items.process(_item)
        .then(item => {
          ರ‿ರ.db.update(item);
          target.find("div.display p").html(item.DISPLAY);
          return item;
        })
        .then(item => ರ‿ರ.tasks.items.update(item))
        .then(FN.items.busy(target, _item))
        .catch(FN.items.errors.update);
    },

    delete: target => {

      var _item = FN.items.get(target),
        _finish;

      return ಠ_ಠ.Display.confirm({
          id: "delete_Item",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to delete this item: ${_item.DISPLAY}`,
          action: "Delete"
        })
        .then(confirm => {
          if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */

          _finish = FN.items.busy(target, _item);

          /* <!-- Update Database --> */
          return ರ‿ರ.tasks.items.delete(_item).then(() => {
            /* <!-- Reconcile UI --> */
            target.remove();
            ರ‿ರ.db.remove(_item);
            return true;
          });
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Delete Error", e) : ಠ_ಠ.Flags.log("Delete Cancelled"))
        .then(() => _finish ? _finish() : false);
    },

    cancel: target => {

      /* <!-- Reconcile UI --> */
      target.find("div.edit textarea").val(FN.items.get(target).DETAILS);
      return Promise.resolve();
    },

    clear: () => {

      var s = window.getSelection ? window.getSelection() : document.selection;
      s ? s.removeAllRanges ? s.removeAllRanges() : s.empty ? s.empty() : false : false;

    },

    errors: {

      update: e => ಠ_ಠ.Flags.error("Update Error", e) && ಠ_ಠ.Display.alert({
        type: "danger",
        headline: "Update Failed",
        details: ಠ_ಠ.Display.doc.get("FAILED_UPDATE"),
        scroll: true
      }),

    },

  };
  /* <-- Items Functions --> */

  /* <-- Interact Functions --> */
  FN.interact = {

		edit: target => {

      if (!target) return;

      var _item = FN.items.get(target),
          _tags = _item.TAGS,
          _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
          _template = "tag",
          _id = "tag";

      var _reconcile = target => {
        var _new = $(ಠ_ಠ.Display.template.get({
          template: "tags",
          tags: _item.TAGS,
          badges: _item.BADGES
        }));
        target.empty().append(_new);
        return target;
      };

      var _handleRemove = target => target.find("span.badge a").on("click.remove", e => {
        e.preventDefault();
        var _target = $(e.currentTarget),
            _tag = _target.parents("span.badge").text().replace("×", "");
        if (_tag) {
          _item.TAGS = (_item.BADGES = _.filter(_item.BADGES, badge => badge != _tag)).join(";");
          _handleRemove(_reconcile(_target.parents("form")));
        }
      });

      return ಠ_ಠ.Display.modal(_template, {
        target: ಠ_ಠ.container,
        id: _id,
        title: "Edit Tags",
        instructions: ಠ_ಠ.Display.doc.get("TAG_INSTRUCTIONS"),
        validate: values => values ? ಠ_ಠ.Flags.log("Values for Validation", values) && true : false,
        /* <!-- Do we need to validate? --> */
        handlers: {
          clear: _dialog.handlers.clear,
        },
        tags: _item.TAGS,
        badges: _item.BADGES,
        all: ರ‿ರ.tasks.badges(ರ‿ರ.db)
      }, dialog => {

        /* <!-- General Handlers --> */
        ಠ_ಠ.Fields().on(dialog);

        /* <!-- Handle CTRL Enter to Save --> */
        _dialog.handlers.keyboard.enter(dialog);

        /* <!-- Handle Click to Remove --> */
        _handleRemove(dialog);

        /* <!-- Handle Click to Add --> */
        dialog.find("li button").on("click.add", e => {
          e.preventDefault();
          var _input = $(e.currentTarget).parents("li").find("span[data-type='tag'], input[data-type='tag']");
          var _val = _input.val() || _input.text();
          if (_input.is("input")) _input.val("") && _input.focus();
          if (_val && (_item.BADGES ? _item.BADGES : _item.BADGES = []).indexOf(_val) < 0) {
            _item.BADGES.push(_val);
            _item.TAGS = _item.BADGES.join(";");
            _handleRemove(_reconcile(dialog.find("form")));
          }
        });

        /* <!-- Handle Enter on textbox to Add --> */
        dialog.find("li input[data-type='tag']")
          .keypress(e => ((e.keyCode ? e.keyCode : e.which) == 13) ? e.preventDefault() || $(e.currentTarget).siblings("button[data-action='add']").click() : null).focus();

      })
        .then(values => {
        if (values) {
          /* <!-- Apply the Update --> */
          var _finish = FN.items.busy(target, _item);
          /* <!-- Process Item, Reconcile UI then Update Database --> */
          return ರ‿ರ.tasks.items.process(_item).then(item => {
            ರ‿ರ.db.update(item);
            return item;
          })
            .then(item => ರ‿ರ.tasks.items.update(item))
            .catch(FN.items.errors.update)
            .then(_finish);
        } else {
          /* <!-- Cancel the Update --> */
          _item.TAGS = _tags;
          return ರ‿ರ.tasks.items.process(_item);
        }
      })
        .catch(e => e ? ಠ_ಠ.Flags.error("Edit Tags Error", e) : ಠ_ಠ.Flags.log("Edit Tags Cancelled"));

    },

    detag: (target, tag) => ಠ_ಠ.Display.confirm({
      id: "remove_Tag",
      target: ಠ_ಠ.container,
      message: ಠ_ಠ.Display.doc.get({
        name: "CONFIRM_DETAG",
        content: tag
      }),
      action: "Remove"
    })
    .then(confirm => {
      if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */
      var _item = FN.items.get(target),
          _finish = FN.items.busy(target, _item);

      /* <!-- Update Item --> */
      _item.TAGS = (_item.BADGES = _.filter(_item.BADGES, badge => badge != tag)).join(";");

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return ರ‿ರ.tasks.items.process(_item).then(item => {
        ರ‿ರ.db.update(item);
        target.find(`span.badge a:contains('${tag}')`).filter(function() {
          return $(this).text() == tag;
        }).parents("span.badge").remove();
        return item;
      })
        .then(item => ರ‿ರ.tasks.items.update(item))
        .catch(FN.items.errors.update)
        .then(_finish);
    }).catch(e => e)

  },
  /* <-- Interact Functions --> */


  /* <-- Show Functions --> */
	FN.show = {

    /* <!-- Internal Methods --> */
    prepare: list => _.each(list, item => {
      !item.DISPLAY && item.DETAILS ? item.DISPLAY = ಱ.showdown.makeHtml(item.DETAILS) : false;
      item._action = ((item._complete && item.DONE) ?
                      item.DONE : (item._timed || item.FROM.isAfter(ರ‿ರ.today)) ?
                      item.FROM : moment(ರ‿ರ.today)).format("YYYY-MM-DD");
      item.__hash = ರ‿ರ.tasks.hash(item);
    }),
    /* <!-- Interal Methods --> */

    /* <!-- Date Methods --> */
    date: () => ರ‿ರ.show || ರ‿ರ.today,

    from: () => moment(FN.show.date()).clone(),
    /* <!-- Date Methods --> */

    /* <!-- Diary Methods --> */
    list: list => ಠ_ಠ.Display.modal("list", {
      target: ಠ_ಠ.container,
      id: `${ID}_list`,
      title: `${list.length} Docket Item${list.length > 1 ? "s" : ""}`,
      items: _.sortBy(FN.show.prepare(list), "FROM"),
    }).then(() => list),

    daily: focus => new Promise(resolve => {
      ರ‿ರ.show = focus.startOf("day").toDate();
      resolve(ಠ_ಠ.Display.state().enter([STATE_OPENED, STATE_DAILY]));
    }),

    weekly: focus => new Promise(resolve => {

      ರ‿ರ.show = focus.startOf("day").toDate();
      focus = focus.isoWeekday() == 7 ? focus.subtract(1, "days") : focus;

      var _days = [],
          _add = (date, css, action, tasks, events, extras, type) => {
            _days.push({
              sizes: date.isoWeekday() >= 6 ? {
                xs: 12
              } : {
                lg: type.large ? 9 : type.small.before ? 3 : 6,
                xl: type.large ? 6 : type.small.before || type.small.after ? 3 : 4
              },
              row_sizes: date.isoWeekday() == 6 ? {
                lg: type.large ? 9 : type.small.before ? 3 : 6,
                xl: type.large ? 6 : type.small.before || type.small.after ? 3 : 4
              } : false,
              title: date.format("ddd"),
              date: date.toDate(),
              instruction: date.isoWeekday() == 6 ? "row-start" : date.isoWeekday() == 7 ? "row-end" : false,
              class: date.isoWeekday() >= 6 ? `p-0 ${css.block}` : css.block,
              action: action,
              title_class: css.title,
              wide: css.wide,
              tasks: tasks,
              events: events,
              extras: extras
            });
          };

      focus.add(focus.isoWeekday() == 1 ? -3 : -2, "days");
      var _weekStart = focus.toDate(),
        _weekEnd = focus.clone().add(1, "weeks").toDate(),
        _calendars = (ಠ_ಠ.Display.state().in([STATE_CALENDARS, STATE_CLASSES], true) && 
                      (ರ‿ರ.config.calendars || ರ‿ರ.config.classes) ?
          ಠ_ಠ.Main.authorise(SCOPE_CALENDARS)
          .then(result => result === true ? Promise.all(
              _.map([].concat(ರ‿ರ.config.calendars || [],
                  _.filter(ರ‿ರ.config.classes || [], item => item.calendar)), item => ಠ_ಠ.Google.calendar.list(item.calendar || item.id, _weekStart, _weekEnd)
                .then(events => _.tap(events,
                  events => _.each(events, event => event._title = `CALENDAR: ${item.name}`, events)))))
            .catch(e => ಠ_ಠ.Flags.error("Events Loading:", e).reflect([])) :
            false).then(ಠ_ಠ.Main.busy("Loading Events")) : Promise.resolve(false));

      _calendars.then(overlay => {

        /* <!-- Prepare Overlays --> */
        overlay = overlay && overlay.length > 0 ?
          _.each((overlay = _.flatten(overlay)), item => {
          if (item.start.dateTime) item._timed = true;
          item.start = moment(item.start.dateTime || item.start.date);
          item.end = moment(item.end.dateTime || item.end.date);
          if (item._timed) item.TIME = `${item.start.format("HH:mm")} - ${item.end.format("HH:mm")}`;
          item.DISPLAY = ಱ.showdown.makeHtml(item.summary);
          item._link = item.htmlLink;
          item._icon = "calendar_today";
        }) : [];

        /* <!-- Filter Deadlines --> */
        if (ಠ_ಠ.Display.state().in(STATE_CLASSES) && ರ‿ರ.deadlines && ರ‿ರ.deadlines.length > 0)
          overlay = overlay.concat(_.filter(ರ‿ರ.deadlines,
                                            deadline => deadline.due.isSameOrAfter(_weekStart) &&
                                            deadline.due.isSameOrBefore(_weekEnd)));

        _.times(7, () => {
          focus.add(1, "days");
          var _day = focus.isoWeekday(),
              _diff = focus.diff(ರ‿ರ.show, "days"),
              _lg = _diff === 0 || (_day == 6 && _diff == -1) || (_day == 7 && _diff == 1),
              _sm_Before = !_lg && (_diff == -1 || (_day == 5 && _diff == -2) || (_day == 6 && _diff == -2)),
              _sm_After = !_lg && (_diff == 1 || (_day == 1 && _diff == 2)),
              _sizes = {
                large: _lg,
                small: {
                  before: _sm_Before,
                  after: _sm_After,
                }
              },
              _display = focus.format("YYYY-MM-DD"),
              _start = focus.clone().startOf("day"),
              _end = focus.clone().endOf("day"),
              _all = FN.show.prepare(ರ‿ರ.db ?
                                     ರ‿ರ.tasks.query(focus, ರ‿ರ.db, focus.isSame(ರ‿ರ.today)) : []),
              _diary = {
                tasks: _.chain(_all).filter(item => !item._timed).sortBy("DETAILS").sortBy("GHOST").sortBy("ORDER").sortBy("_countdown").value(),
                events: _.chain(_all).filter(item => item._timed).sortBy(item => moment(item.TIME, ["h:m a", "H:m", "h:hh A"]).toDate()).value(),
                extras: _.chain(overlay)
                .filter(item => (item.due || item.end).isSameOrAfter(_start) &&
                        (item.due || item.start).isSameOrBefore(_end))
                .sortBy(item => (item.due || item.start).toDate())
                .value()
              };
          _add(focus, {
            block: focus.isSame(ರ‿ರ.today) || (focus.isoWeekday() == 6 && focus.clone().add(1, "days").isSame(ರ‿ರ.today)) ?
            "present bg-highlight-gradient top-to-bottom" : _diff === 0 ? "focussed bg-light" : focus.isBefore(ರ‿ರ.today) ? "past text-muted" : "future",
            title: focus.isSame(ರ‿ರ.today) ? "present" : _diff === 0 ? "bg-bright-gradient left-to-right" : "",
            wide: _diff === 0
          },
               _display, _diary.tasks, _diary.events, _diary.extras, _sizes);
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
              action: "jump",
              icon: "fast_forward"
            }, {
              action: "jump.today",
              icon: "today"
            }],
            icon: "edit"
          },
          target: ಠ_ಠ.container,
          clear: true,
        });

        /* <!-- Hookup all relevant events --> */
        FN.items.hookup(_diary);

        /* <!-- Drag / Drop --> */
        var _get = data => !data || data.indexOf("item_") !== 0 ? false : $(`#${data}`),
            _items = _diary.find("div.item[draggable=true]"),
            _clear = _.debounce(items => items.removeClass("drop-target"), 100);
        _items
          .on("dragstart.item", e => e.originalEvent.dataTransfer.setData("text/plain", e.target.id))
          .on("dragend.item", () => _clear($("div.item.drop-target")))
          .on("dragover.item", e => e.preventDefault())
          .on("dragenter.item", e => {
          var _destination = $(e.target);
          _destination = _destination.is("div.item[draggable=true]") ? _destination : _destination.parents("div.item[draggable=true]");
          if (!_destination.hasClass("drop-target")) {
            _clear($("div.item.drop-target").not(`#${_destination[0].id}`));
            _destination.addClass("drop-target");
          }
        })
          .on("drop.item", e => {
          e.preventDefault();
          var _id = e.originalEvent.dataTransfer.getData("text/plain"),
              _source = _get(_id);
          var _destination = $(e.target);
          _destination = _destination.is("div.item[draggable=true]") ? _destination : _destination.parents("div.item[draggable=true]");
          if (!_source || _id == _destination.id) return;
          if (_source.parents(".group")[0] == _destination.parents(".group")[0]) {
            _source.insertBefore(_destination);
            _source.addClass("bg-bright");
            setTimeout(() => _source.removeClass("bg-bright"), 1000);
            var _list = [];
            _source.parent().children("div.item[draggable=true]").each((i, el) => {
              var _el = $(el),
                  _item = ರ‿ರ.db.get(_el.data("id")),
                  _order = i + 1;
              _el.data("order", _order);
              if (_item && _item.ORDER != _order)(_item.ORDER = _order) && _list.push(_item);
            });
            /* <!-- Save List --> */
            if (_list.length > 0) {
              ಠ_ಠ.Flags.log("LIST TO UPDATE:", _list);
              _.each(_list, item => ರ‿ರ.tasks.items.update(item)
                     .then(r => (r === false) ? ಠ_ಠ.Flags.error("Update Item Failed", item) : true));
            }
          }
        });

        /* <!-- Scroll to today if visible --> */
        if (Element.prototype.scrollIntoView && !ಠ_ಠ.Flags.debug()) {
          var _now = _diary.find("div.focussed").length == 1 ? _diary.find("div.focussed") : _diary.find("div.present");
          if (_now.length === 1 && _now[0].scrollIntoView) {
            _now[0].scrollIntoView({
              block: "start",
              inline: "nearest"
            });
            if (window.scrollBy && _diary.outerHeight(true) > $(window).height()) window.scrollBy(0, -10);
          }
        }

        resolve(ಠ_ಠ.Display.state().enter([STATE_OPENED, STATE_WEEKLY]));

      });



    }),

    tagged: tag => FN.show.list(ರ‿ರ.tasks.tagged(tag, ರ‿ರ.db)),
    /* <!-- Diary Methods --> */

  };
  /* <-- Show Functions --> */


  /* <-- New Functions --> */
  FN.new = {

    item: type => {

      var _item, _error, _save, _retried = false;
      _error = () => ಠ_ಠ.Display.alert({
        type: "danger",
        headline: "Save Failed",
        details: _retried ? false : ಠ_ಠ.Display.doc.get("FAILED_SAVE"),
        action: _retried ? false : "Retry",
        scroll: true
      }).then(result => result === true ? (_retried = true) && _save(_item) : Promise.resolve(true));

      _save = item => ರ‿ರ.tasks.items.create(item).then(r => {
          if (r === false) return r;
          ರ‿ರ.db.update(r);
          return FN.show.weekly(moment(FN.show.date()));
        })
        .catch(e => ಠ_ಠ.Flags.error("Create New Error", e) && !_retried && _error())
        .then(r => r === false ? _error() : Promise.resolve(true));

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
          date: moment(FN.show.date()).format("YYYY-MM-DD"),
          handlers: {
            clear: _dialog.handlers.clear,
          },
          updates: {
            extract: _dialog.handlers.extract({
              time: ರ‿ರ.tasks.regexes.EXTRACT_TIME,
              date: ರ‿ರ.tasks.regexes.EXTRACT_DATE,
            })
          }
        }, dialog => {
          ಠ_ಠ.Fields().on(dialog);
          _dialog.handlers.keyboard.enter(dialog);
          dialog.find(`#${_id}_details`).focus();
        }).then(values => {
          if (!values) return false;
          ಠ_ಠ.Flags.log("Values for Creation", values);
          _item = {
            FROM: values.From ? values.From.Value : null,
            TAGS: values.Tags ? values.Tags.Value : null,
            DETAILS: values.Details ? values.Details.Value : null,
          };
          return ರ‿ರ.tasks.items.process(_item).then(item => _save(ರ‿ರ.db.insert(item)));
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Create New Error", e) : ಠ_ಠ.Flags.log("Create New Cancelled"));
    },

    task: () => FN.new.item("Task"),

  };
  /* <-- New Functions --> */


  /* <-- Find Functions --> */
  FN.find = {

    search: () => ಠ_ಠ.Display.text({
        message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
        action: "Search",
        simple: true,
      }).then(query => query ? FN.show.list(ರ‿ರ.tasks.search(query, ರ‿ರ.db, !ರ‿ರ.show ?
        ರ‿ರ.today : ರ‿ರ.show >= ರ‿ರ.today ?
        ರ‿ರ.show : false)) : false)
      .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"))

  };
  /* <-- Find Functions --> */


  /* <-- Action Functions --> */
  FN.action = {

    load: config => Promise.all([].concat(
        ರ‿ರ.tasks.open((config || ರ‿ರ.config).data),
        ರ‿ರ.config.classes ? FN.classes.load(ರ‿ರ.config.classes) : []))
      .then(results => {
        ರ‿ರ.db = results[0];
        if (results[1]) ರ‿ರ.deadlines = results[1];
      })
      .then(ಠ_ಠ.Main.busy("Loading Data"))
      .then(() => FN.show.weekly(moment(FN.show.date())))
      .catch(e => ಠ_ಠ.Flags.error("Data Error", e ? e : "No Inner Error").negative()),

    archive: () => {

      var _template = "archive",
        _id = "archive";
      return ಠ_ಠ.Display.modal(_template, {
          target: ಠ_ಠ.container,
          id: _id,
          title: "Archive Docket Items",
          instructions: ಠ_ಠ.Display.doc.get("ARCHIVE_INSTRUCTIONS"),
          years: ರ‿ರ.tasks.years(ರ‿ರ.db),
        })
        .then(values => {
          if (_.isEmpty(values)) return false;
          var _years = _.reduce(values.Archive.Values, (list, value, year) => (value === true) ? list.concat([year]) : list, []);
          return Promise.all(_.map(_years, year => ರ‿ರ.tasks.archive(year, ರ‿ರ.db)))
            .then(items => {
              var _items = _.sortBy(_.compact(_.flatten(items, true)), "__ROW").reverse();
              if (!_items || _items.length === 0) return false;
              var _batches = _.reduce(_items, (groups, item, index, all) => {
                  (index === 0 || all[index - 1].__ROW == (item.__ROW + 1)) ?
                  groups[groups.length - 1].push(item):
                    groups.push([item]);
                  return groups;
                }, [
                  []
                ]),
                _results = [];

              var _complete = () => _.reduce(_batches, (promise, items) => {
                return promise
                  .then(() => ರ‿ರ.tasks.items.remove(items).then(result => _results.push(result)));
              }, Promise.resolve());

              return _complete().then(() => _results);

            })
            .then(ಠ_ಠ.Main.busy("Archiving Data"))
            .then(() => FN.action.load());
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Archive Error", e) : ಠ_ಠ.Flags.log("Archive Cancelled"));

    },

    jump: () => {

      var _id = "ctrl_Jump";
      ಠ_ಠ.container.find(`#${_id}`).remove();
      var _input = $("<input />", {
        id: _id,
        type: "hidden",
        class: "d-none dt-picker",
        value: moment(FN.show.date()).format("YYYY-MM-DD")
      }).appendTo(ಠ_ಠ.container);

      _input.on("change", e => {
        var _date = new moment($(e.target).val());
        if (_date.isValid()) FN.show.weekly(_date);
      });

      _input.bootstrapMaterialDatePicker({
        format: "YYYY-MM-DD",
        cancelText: "Cancel",
        clearButton: false,
        cancelButton: true,
        nowButton: true,
        time: false,
        switchOnClick: true,
        triggerEvent: "dblclick"
      });

      _input.dblclick();
    },

    refresh: () => {

      /* <!-- Reset State to Today --> */
      ರ‿ರ.today = moment().startOf("day").toDate();

      /* <-- Open and render data --> */
      return FN.action.load();

    },

    start: config => {

      /* <-- Remove old and unused config settings --> */
      delete config.calendar;
      _.each(config, (value, key) => value === false ? delete config[key] : null);

      /* <-- Set States from Config --> */
      FN.options.calendars(!!config.calendars);
      FN.options.issues(!!config.issues);
      FN.options.classes(!!config.classes);

      /* <-- Open and render data --> */
      return FN.action.load(config);

    }

  };
  /* <-- Action Functions --> */


  /* <-- Calendars Functions --> */
  FN.calendars = {

    choose: () => FN.helper.choose.prompt("Calendar", calendar => ({
      id: calendar.id,
      name: calendar.summaryOverride ? calendar.summaryOverride : calendar.summary
    }), ಠ_ಠ.Google.calendars.list),

  };
  /* <-- Calendars Functions --> */


  /* <-- Classes Functions --> */
  FN.classes = {

    load: classes => ಠ_ಠ.Main.authorise([].concat(
        _.filter(classes, course => course.teacher).length > 0 ? SCOPE_CLASSWORK : [],
        _.filter(classes, course => !course.teacher).length > 0 ? SCOPE_COURSEWORK : []))
      .then(result => result === true ?
        Promise.all(_.map(classes, course => ಠ_ಠ.Google.classrooms.work(course).list()
          .then(results => _.each(results, result => result ? 
																		result._title = `COURSE: ${course.name}` : null))))
        .then(_.flatten)
        .then(_.compact)
        .then(results => _.tap(results, results => _.each(results, result => {
          result.due = result.dueDate ? moment([
            result.dueDate.year,
            result.dueDate.month - 1,
            result.dueDate.day,
            result.dueTime ? result.dueTime.hours : 0,
            result.dueTime ? result.dueTime.minutes : 0,
            result.dueTime && result.dueTime.seconds ? result.dueTime.seconds : 0,
          ]) : moment();
          if (result.dueTime) {
            result._timed = true;
            result.TIME = result.due.format("HH:mm");
          }
          result.DISPLAY = ಱ.showdown.makeHtml(result.title);
          result._link = result.alternateLink;
          result._icon = result.workType == "ASSIGNMENT" ?
            "assignment" : result.workType == "SHORT_ANSWER_QUESTION" ?
            "question_answer" : result.workType == "MULTIPLE_CHOICE_QUESTION" ?
            "assessment" : "class";

        })))
        .catch(e => ಠ_ಠ.Flags.error("Classroom Course Work List:", e).negative()) :
        Promise.resolve(false)),

    choose: () => FN.helper.choose.prompt("Course", course => ({
      id: course.id,
      name: course.section ? `${course.section} | ${course.name}` : course.name,
      calendar: course.calendarId,
      teacher: !!course.teacherFolder
    }), ಠ_ಠ.Google.classrooms.list),

  };
  /* <-- Classes Functions --> */

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
        state: ರ‿ರ,
        states: STATES,
        recent: false,
        simple: true,
        start: () => FN.config.get()
          .then(ಠ_ಠ.Main.busy("Loading Config"))
          .then(config => !config ?
            ಠ_ಠ.Router.run(STATE_READY) :
            FN.action.start(config)
            .then(result => result ?
              true : ಠ_ಠ.Router.run(STATE_CONFIG))),
        routes: {

          /* <!-- Default Overrides --> */
          create: () => FN.config.clear()
            .then(() => ರ‿ರ.tasks.create())
            .then(id => FN.config.create(id))
            .then(ಠ_ಠ.Main.busy("Creating Config"))
            .then(() => FN.action.start(ರ‿ರ.config)),

          open: {
            options: {
              title: "Select a Docket Sheet to Open",
              view: "SPREADSHEETS",
            },
            success: value => FN.config.find()
              .then(config => config ? FN.config.update(config.id, {
                data: value.id
              }) : FN.config.create(value.id))
              .then(ಠ_ಠ.Main.busy("Loading Config"))
              .then(() => FN.action.start(ರ‿ರ.config)),
          },
          /* <!-- Default Overrides --> */


          /* <!-- Custom Routes --> */
          jump: {
            matches: /JUMP/i,
            length: 0,
            keys: ["j", "J", "g", "G"],
            state: STATE_OPENED,
            fn: FN.action.jump,
            routes: {
              today: {
                matches: /TODAY/i,
                length: 0,
                keys: ["t", "T"],
                fn: () => FN.show.weekly(moment(ರ‿ರ.today)),
              },
              forward: {
                matches: /FORWARD/i,
                length: 0,
                keys: ">",
                actions: "swipeleft",
                fn: () => FN.show.weekly(FN.show.from().add(1, "weeks")),
                routes: {
                  day: {
                    matches: /DAY/i,
                    length: 0,
                    keys: ".",
                    fn: () => {
                      var _start = FN.show.from();
                      FN.show.weekly(_start.add(_start.isoWeekday() == 6 ? 2 : 1, "days"));
                    },
                  }
                }
              },
              backward: {
                matches: /BACKWARD/i,
                length: 0,
                keys: "<",
                actions: "swiperight",
                fn: () => FN.show.weekly(FN.show.from().subtract(1, "weeks")),
                routes: {
                  day: {
                    matches: /DAY/i,
                    length: 0,
                    keys: ",",
                    fn: () => {
                      var _start = FN.show.from();
                      FN.show.weekly(_start.subtract(_start.isoWeekday() == 7 ? 2 : 1, "days"));
                    },
                  }
                }
              },

            },
          },

          show: {
            matches: /SHOW/i,
            state: STATE_OPENED,
            routes: {
              classes: {
                matches: /CLASSES/i,
                fn: FN.options.process("classes")
              },
              calendars: {
                matches: /CALENDARS/i,
                fn: FN.options.process("calendars")
              },
              issues: {
                matches: /ISSUES/i,
                fn: () => FN.options.issues().then(result => FN.config.update(ರ‿ರ.id, {
                  issues: result
                }))
              },
            }
          },

          config: {
            matches: /CONFIG/i,
            routes: {
              clear: {
                matches: /CLEAR/i,
                fn: () => () => ಠ_ಠ.Display.confirm({
                    id: "clear_Config",
                    target: ಠ_ಠ.container,
                    message: ಠ_ಠ.Display.doc.get("CLEAR_CONFIGURATION"),
                    action: "Clear"
                  })
                  .then(confirm => confirm ?
                    ಠ_ಠ.Display.busy() && FN.config.clear() : false)
                  .then(cleared => cleared ?
                    ಠ_ಠ.Display.state().exit([STATE_CONFIG, STATE_OPENED]) && ಠ_ಠ.Router.run(STATE_READY) : false)
                  .catch(e => e ?
                    ಠ_ಠ.Flags.error("Clear Config Error", e) : ಠ_ಠ.Flags.log("Clear Config Cancelled"))
              },
              show: {
                matches: /SHOW/i,
                fn: () => {
                  var _details = {};
                  FN.config.find()
                    .then(result => result ? FN.config.load(_details.file = result) : result)
                    .then(config => config ? _details.config = config : config)
                    .then(ಠ_ಠ.Main.busy("Loading Config"))
                    .then(config => config ? ಠ_ಠ.Display.inform({
                      id: "show_Config",
                      target: ಠ_ಠ.container,
                      code: _.escape(JSON.stringify(_details, null, 4))
                    }) : config);
                }
              }
            }
          },

          search: {
            state: STATE_OPENED,
            keys: ["s", "S", "f", "F"],
            fn: FN.find.search,
            routes: {
              tags: {
                matches: /TAGS/i,
                length: 1,
                fn: command => FN.show.tagged(command)
                  .then(results => ಠ_ಠ.Flags.log(`Found Docket ${results.length} Item${results.length > 1 ? "s" : ""}`, results))
              }
            }
          },

          edit: {
            matches: /EDIT/i,
            state: STATE_OPENED,
            routes: {
              tags: {
                matches: /TAGS/i,
                length: 1,
                fn: command => FN.interact.edit($(`#item_${command}`))
              },
            }
          },

          new: {
            matches: /NEW/i,
            state: STATE_OPENED,
            routes: {
              task: {
                matches: /TASK/i,
                length: 0,
                keys: ["n", "N"],
                fn: FN.new.task
              },
            }
          },

          remove: {
            matches: /REMOVE/i,
            state: STATE_OPENED,
            routes: {
              tag: {
                matches: /TAG/i,
                length: 2,
                fn: command => FN.interact.detag($(`#item_${command[0]}`), command[1])
              },
            }
          },

          archive: {
            matches: /ARCHIVE/i,
            state: STATE_OPENED,
            length: 0,
            fn: FN.action.archive
          },

          refresh: {
            matches: /REFRESH/i,
            state: STATE_OPENED,
            length: 0,
            keys: ["r", "R"],
            fn: FN.action.refresh
          },
          /* <!-- Custom Routes --> */

        },
        route: (handled, command) => {
          if (handled) return;
          var _parsed = moment(command);
          if (_parsed.isValid()) FN.show.weekly(_parsed);
        }
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Start App after fully loaded --> */
    start: () => {

      /* <!-- Setup Moment --> */
      moment().format();
      var locale = window.navigator.userLanguage || window.navigator.language;
      if (locale) moment.locale(locale);

      /* <!-- Setup Today | Override every 15mins --> */
      var _today = () => {
        ರ‿ರ.today = moment().startOf("day").toDate();
        _.delay(_today, 900000);
      };
      _today();

      /* <!-- Setup Showdown --> */
      ಱ.showdown = new showdown.Converter({
        strikethrough: true
      });

      /* <!-- Create Tasks Reference --> */
      ರ‿ರ.tasks = ಠ_ಠ.Tasks(ಠ_ಠ);

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

  };

};