App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const _encodeID = id => id.replace(/[.@]/g, ""),
    _encodeValue = value => value.replace(/\./g, "%2E"),
    _decodeValue = value => value.replace(/%2E/g, ".");
  const STATE_OPENED = "opened",
    STATE_MONTH = "monthly",
    STATE_EVENT = "single-event",
    STATE_SEARCHED = "searched",
    STATES = [STATE_OPENED, STATE_MONTH, STATE_EVENT, STATE_SEARCHED];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, DB, _id, _table, _current;
  var _refresh, _goto;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Objects --> */
  var _dialog_Shortcuts = {
    tag: {
      "Confidentiality": {
        high: {
          populate: "Confidentiality|High",
          class: "btn-outline-danger",
          name: "High"
        },
        medium: {
          populate: "Confidentiality|Medium",
          class: "btn-outline-warning",
          name: "Medium"
        },
        low: {
          populate: "Confidentiality|Low",
          class: "btn-outline-success",
          name: "Low"
        },
        none: {
          populate: "Confidentiality|None",
          class: "btn-outline-info",
          name: "None"
        },
      },
      "Importance": {
        high: {
          populate: "Importance|High",
          class: "btn-outline-danger",
          name: "High"
        },
        medium: {
          populate: "Importance|Medium",
          class: "btn-outline-warning",
          name: "Medium"
        },
        low: {
          populate: "Importance|Low",
          class: "btn-outline-success",
          name: "Low"
        },
        none: {
          populate: "Importance|None",
          class: "btn-outline-info",
          name: "None"
        },
      },
      "Other": {
        highlight: {
          populate: "Highlight|TRUE",
          class: "btn-bright",
          name: "Highlight"
        },
      }
    }
  };
  /* <!-- Internal Objects --> */

  /* <!-- Internal Functions --> */
  var _format = {
      duration: (start, end) => `${start && end ? `For ${moment.duration(start.diff(end)).humanize()}` : ""}`,
      date: (start, end) => `${start ? start.format(start.hour() === 0 && start.minute() === 0 && start.second() === 0 && !end ? "LL" : "LLL") : ""}`,
    },
    _map = v => ({
      id: v.id,
      files: v.attachments,
      type: v.recurringEventId ? "Series" : "Single",
      when: _format.date(v.start ? v.start.dateTime ? moment(v.start.dateTime) : v.start.date ? moment(v.start.date) : null : null, v.end && v.end.dateTime ? moment(v.end.dateTime) : null),
      duration: _format.duration(v.start && v.start.dateTime ? moment(v.start.dateTime) : null, v.end && v.end.dateTime ? moment(v.end.dateTime) : null),
      what: v.summary,
      where: v.location,
      who: v.organizer ? v.organizer.displayName ? ಠ_ಠ.Display.username(v.organizer.displayName) : v.organizer.email : "",
      properties: v.extendedProperties && v.extendedProperties.shared ? v.extendedProperties.shared : {},
      with: v.attendees,
      url: v.htmlLink
    });

  var _loadEvent = (id, event) => ಠ_ಠ.Google.calendar.event(id, event);

  var _tagEvent = (id, event) => new Promise((resolve, reject) => {

    var _decode = values => ({
      name: _.find(values, v => v.name == "name") ? _.find(values, v => v.name == "name").value : null,
      value: _.find(values, v => v.name == "value") ? _.find(values, v => v.name == "value").value : null,
      remove: !!(_.find(values, v => v.name == "remove")),
      private: !!(_.find(values, v => v.name == "private"))
    });

    var _id = "tag_results",
      _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
      _tag = ಠ_ಠ.Display.modal("tag", {
        id: _id,
        target: ಠ_ಠ.container,
        title: `Tag: <strong>${event.what}</strong>`,
        instructions: ಠ_ಠ.Display.doc.get("TAG_INSTRUCTIONS"),
        shortcuts: _dialog_Shortcuts.tag,
        validate: values => {
          values = _decode(values);
          return values.name && (values.value || values.remove) && (values.name.length + (values.remove ? 0 : values.value.length)) <= 124;
        },
        handlers: {
          clear: _dialog.handlers.clear,
          populate: (target, dialog) => {
            var _populate = target.data("populate");
            if (_populate) {
              var _name = _populate.split("|")[0],
                _value = _populate.split("|")[1];
              if (_value === "@@NOW") _value = new Date().toISOString().split("T")[0];
              dialog.find("#tagName").val(_name) && dialog.find("#tagValue").val(_value);
            }
          }
        }
      }, dialog => autosize(dialog.find("textarea.resizable")));

    _tag.then(values => {

      if (values) {

        values = _decode(values);
        var _properties = {};
        _properties[values.name] = values.value;
        var _data = {
          extendedProperties: {
            shared: _properties
          }
        };

        ಠ_ಠ.Google.calendar.events.update(id, event.id, _data).then(event => {
          resolve(event);
        }).catch(e => ಠ_ಠ.Flags.error("Patch Error", e) && reject(e));

      } else {

        resolve(false);

      }

    }).catch(e => e ? (ಠ_ಠ.Flags.error("Tagging Error", e) && reject(e)) : (ಠ_ಠ.Flags.log("Tagging Cancelled") && resolve(false)));

  });

  var _deTagEvent = (id, event, property) => new Promise((resolve, reject) => {

    ಠ_ಠ.Display.confirm({
        id: "remove_Tag",
        target: ಠ_ಠ.container,
        message: `Please confirm that you wish to remove the <strong>${property}</strong> tag from <strong>${event.what}</strong>`,
        action: "Remove"
      })
      .then(confirm => {

        if (confirm) {
          var _properties = {};
          _properties[property] = null;
          var _data = {
            extendedProperties: {
              shared: _properties
            }
          };
          ಠ_ಠ.Google.calendar.events.update(id, event.id, _data).then(event => {
            resolve(event);
          }).catch(e => ಠ_ಠ.Flags.error("Patch Error", e) && reject(e));
        } else {
          resolve(false);
        }

      }).catch(e => e ? (ಠ_ಠ.Flags.error("De-Tagging Error", e) && reject(e)) : (ಠ_ಠ.Flags.log("De-Tagging Cancelled") && resolve(false)));
  });

  var _loadEvents = id => {
    ಠ_ಠ.Display.state().swap([STATE_EVENT, STATE_SEARCHED], STATE_MONTH);
    return ಠ_ಠ.Google.calendar.list(id, _current.toDate(), moment(_current).clone().add(1, "months").toDate());
  };

  var _findEvents = (id, query) => ಠ_ಠ.Google.calendar.search(id, null, query);

  var _searchEvents = (id, property, value) => ಠ_ಠ.Google.calendar.search(id, `${property}=${value}`);

  var _loadCalendar = id => ಠ_ಠ.Google.calendar.get(id).then(calendar => {
    if (calendar) {
      ಠ_ಠ.Display.state().enter(STATE_OPENED);
      return ಠ_ಠ.Recent.add(_encodeID(calendar.id), calendar.summary, `#google,load.calendar.${_encodeValue(calendar.id)}`).then(() => calendar);
    } else {
      return calendar;
    }
  });

  var _showData = (id, values, target) => {

    /* <!-- Display Column Headers --> */
    var headers = _.map(["Type", "ID", "When", "What", "Who", "Actions"], v => ({
      name: v,
      hide: function(initial) {
        return !!(initial && this.hide_initially);
      },
      set_hide: function(now, always, initially) {
        this.hide_initially = initially;
      },
      hide_always: false,
      hide_now: false,
      hide_initially: v === "ID" ? true : false,
      field: v.toLowerCase(),
    }));

    var _data = DB.addCollection(id, {
      unique: ["id"],
      indices: ["type", "when", "duration", "what", "who"]
    });

    _data.clear({
      removeIndices: false
    });

    _data.insert(values);

    var _update = target => {

        /* <!-- Hide popovers on second click --> */
        var _popped = null;
        target.find(".name-link[data-toggle='popover']").on("click.again", e => {
          var _$ = $(e.currentTarget),
            _popover = _$.attr("aria-describedby");
          if (_popover && _popover.indexOf("popover") === 0) {
            (_popover == _popped) ? _$.popover("hide"): _popped = _popover;
          }
        });

      },
      _return = ಠ_ಠ.Datatable(ಠ_ಠ, {
        id: _encodeID(id),
        name: id,
        data: _data,
        headers: headers,
      }, {
        advanced: false,
        collapsed: true,
        wrapper: {
          classes: ["pt-1"],
          id: "events",
          header: ಠ_ಠ.Display.state().in(STATE_MONTH) ? ಠ_ಠ.Display.template.get("header")({
            classes: ["ml-3", "ml-xl-4", "mt-1", "mb-0"],
            month: _current.format("MMM"),
            year: _current.format("YYYY")
          }) : "",
          action: {
            list: [{
              action: "search",
              icon: "search"
            }, {
              action: "backward",
              icon: "skip_previous"
            }, {
              action: "forward",
              icon: "skip_next"
            }, {
              action: "jump",
              icon: "fast_forward"
            }, {
              action: "today",
              icon: "today"
            }],
            icon: "navigation"
          },

        },
      }, target, target => _update(target));

    /* <!-- Wire-Up Events --> */
    _update(target);

    /* <!-- Swipe and Touch Controls --> */
    var swipe_control = new Hammer(target[0]);
    swipe_control.get("swipe").set({
      direction: Hammer.DIRECTION_HORIZONTAL
    });
    swipe_control.on("swipe", e => {
      if (e.pointerType == "touch") {
        if (e.type == "swipeleft" || (e.type == "swipe" && e.direction == 2)) {
          _goto(moment(_current).clone().add(1, "months"));
        } else if (e.type == "swiperight" || (e.type == "swipe" && e.direction == 4)) {
          _goto(moment(_current).clone().subtract(1, "months"));
        }
      }
    });

    return _return;

  };

  var _displayEvents = (id, events) => {

    ಠ_ಠ.Flags.log("Events:", events);

    _table = _showData(id, _.map(events, _map), ಠ_ಠ.container.empty());

  };

  var _openCalendars = () => new Promise((resolve, reject) => {

    var _busy = ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      fn: true
    });

    ಠ_ಠ.Google.calendars.list().then(calendars => {

      _busy();

      return ಠ_ಠ.Display.choose({
        id: "events_Calendars",
        title: "Please Choose a Calendar to Open ...",
        action: calendars && calendars.length > 0 ? "Open" : false,
        choices: _.map(calendars, calendar => ({
          id: calendar.id,
          name: calendar.summaryOverride ? calendar.summaryOverride : calendar.summary
        })),
        instructions: !calendars || calendars.length === 0 ? ಠ_ಠ.Display.doc.get("NO_CALENDARS") : ""
      }).then(option => {

        return option ? _loadCalendar(option.id).then(resolve) : Promise.resolve(false);

      }).catch(e => e ? ಠ_ಠ.Flags.error("Calendar Select:", e) : ಠ_ಠ.Flags.log("Team Drive Select Cancelled") && reject(e));

    }).catch(e => ಠ_ಠ.Flags.error("Calendars Load Failure", e ? e : "No Inner Error") && reject(e));

  });

  var _search = id => ಠ_ಠ.Display.text({
      message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
      title: "Enter Search Text",
      action: "Search",
      simple: true,
    }).then(query => {
      ಠ_ಠ.Flags.log(`Searching in ${id} for Events: ${query}`);
      var _finish = ಠ_ಠ.Display.busy({
        target: ಠ_ಠ.container,
        status: "Searching Events",
        fn: true
      });
      _findEvents(id, query)
        .then(events => ಠ_ಠ.Display.state().swap([STATE_EVENT, STATE_MONTH], STATE_SEARCHED) && _displayEvents(id, events))
        .catch(e => ಠ_ಠ.Flags.error("Events Loading Error:", e))
        .then(() => _finish ? _finish() : false);

    })
    .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"));

  var _process = (event, fn) => {
    var _data = DB.getCollection(_id),
      _item = _data.by("id", event);
    fn(_id, _item)
      .then(event => event ? _.defaults(_map(event), _item) : event)
      .catch(e => {
        ಠ_ಠ.Flags.error("Event Process Failure", e ? e : "No Inner Error");
        _item.__failure = true;
        return _item;
      })
      .then(event => {
        if (event) {
          _data.update(event);
          _table.update();
        }
      });
  };

  var _jump = () => {

    var _id = "ctrl_Jump";
    ಠ_ಠ.container.find(`#${_id}`).remove();
    var _input = $("<input />", {
      id: _id,
      type: "hidden",
      class: "d-none dt-picker",
      value: _current.format("YYYY-MM-DD")
    }).appendTo(ಠ_ಠ.container);

    _input.on("change", e => {
      var _date = new moment($(e.target).val());
      if (_date.isValid()) _goto(moment(_date).startOf("month"));
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

  };

  _refresh = id => {

    var _finish = ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      status: "Loading Calendar",
      fn: true
    });

    _loadCalendar(id)
      .then(calendar => {
        ಠ_ಠ.Flags.log("Loaded Calendar:", calendar);
        return (_id = calendar.id);
      })
      .then(_loadEvents)
      .then(events => _displayEvents(_id, events))
      .catch(e => ಠ_ಠ.Flags.error("Calendar Loading Error:", e))
      .then(() => _finish ? _finish() : false);

  };

  _goto = date => {
    if (ಠ_ಠ.Display.state().in([STATE_OPENED, STATE_MONTH]) || ಠ_ಠ.Display.state().in([STATE_OPENED, STATE_SEARCHED])) {
      _current = date;
      _refresh(_id);
    }
  };

  var _shortcuts = () => {

    /* <!-- Bind Keyboard shortcuts --> */
    Mousetrap.bind("t", () => _goto(moment().startOf("month")));
    Mousetrap.bind("T", () => _goto(moment().startOf("month")));
    Mousetrap.bind("<", () => _goto(moment(_current).clone().subtract(1, "months")));
    Mousetrap.bind(">", () => _goto(moment(_current).clone().add(1, "months")));

    Mousetrap.bind("g", () => _jump());
    Mousetrap.bind("G", () => _jump());

    Mousetrap.bind("j", () => _jump());
    Mousetrap.bind("J", () => _jump());

    Mousetrap.bind("s", () => _id ? _search(_id) : false);
    Mousetrap.bind("S", () => _id ? _search(_id) : false);

    Mousetrap.bind("f", () => _id ? _search(_id) : false);
    Mousetrap.bind("F", () => _id ? _search(_id) : false);

    Mousetrap.bind("r", () => _goto(_current));
    Mousetrap.bind("R", () => _goto(_current));

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
        name: "Events",
        states: STATES,
        test: () => _id && _table,
        clear: () => {
          _id = null;
          _table = null;
        },
        start: () => _shortcuts(),
        route: (handled, command) => {

          if (handled) return;
          var _finish, _data, _item;

          if ((/OPEN/i).test(command)) {

            ((/CALENDAR/i).test(command[1])) ?
            _openCalendars()
              .then(calendar => {
                _finish = ಠ_ಠ.Display.busy({
                  target: ಠ_ಠ.container,
                  status: "Loading Calendar",
                  fn: true
                });
                ಠ_ಠ.Flags.log("Loaded Calendar:", calendar);
                return (_id = calendar.id);
              })
              .then(_loadEvents)
              .then(events => _displayEvents(_id, events))
              .catch(e => ಠ_ಠ.Flags.error("Calendar Loading Error:", e))
              .then(() => _finish ? _finish() : false): false;

          } else if ((/CLOSE/i).test(command)) {

            if (_id && (/CALENDAR/i).test(command[1])) {
              ಠ_ಠ.Router.clean(true);
            }

          } else if ((/LOAD/i).test(command)) {

            var _calendar = command[2] ? _decodeValue(command[2]) : false,
              _event = command[3] ? _decodeValue(command[3]) : false;

            if ((/ITEM/i).test(command[1]) && _calendar && _event) {

              _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                status: "Loading Event",
                fn: true
              });

              _loadEvent(_calendar, _event)
                .then(event => {
                  ಠ_ಠ.Flags.log("Event:", event);
                  ಠ_ಠ.Display.state().swap([STATE_SEARCHED, STATE_MONTH], STATE_EVENT);
                  _displayEvents((_id = _calendar), [event]);
                })
                .catch(e => ಠ_ಠ.Flags.error("Event Loading Error:", e))
                .then(() => _finish ? _finish() : false);

            } else if ((/CALENDAR/i).test(command[1]) && _calendar) {

              _refresh(_calendar);

            }

          } else if ((/REMOVE/i).test(command)) {

            if ((/LIST/i).test(command[1]) && command[2]) {

              ಠ_ಠ.Flags.log(`Removing List Item: ${command[2]}`);
              _data = DB.getCollection(_id);
              _item = _data.by("id", command[2]);
              _data.remove(_item);
              _table.update();

            } else if ((/TAG/i).test(command[1])) {

              ಠ_ಠ.Flags.log(`Removing Tag (${command[3]}) from: ${command[2]}`);
              _process(command[2], (calendar, event) => _deTagEvent(calendar, event, command[3]));

            }

          } else if ((/TAG/i).test(command)) {

            if (_id && command[1]) {

              ಠ_ಠ.Flags.log(`Tagging Item: ${command[1]} in Calendar: ${_id}`);
              _process(command[1], _tagEvent);

            }

          } else if ((/SEARCH/i).test(command)) {

            if (_id && (/PROPERTIES/i).test(command[1]) && command[2]) {

              ಠ_ಠ.Flags.log(`Searching for Tag: ${command[2]} =  ${command[3]} in Calendar: ${_id}`);
              _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                status: "Loading Events",
                fn: true
              });
              _searchEvents(_id, command[2], command[3] ? command[3] : true)
                .then(events => ಠ_ಠ.Display.state().swap([STATE_EVENT, STATE_MONTH], STATE_SEARCHED) && _displayEvents(_id, events))
                .catch(e => ಠ_ಠ.Flags.error("Events Loading Error:", e))
                .then(() => _finish ? _finish() : false);

            } else if (_id) {

              _search(_id);

            }

          } else if ((/JUMP/i).test(command)) {

            _jump();

          } else if ((/TODAY/i).test(command)) {

            _goto(moment().startOf("month").toDate());

          } else if ((/FORWARD/i).test(command)) {

            _goto(moment(_current).clone().add(1, "months"));

          } else if ((/BACKWARD/i).test(command)) {

            _goto(moment(_current).clone().subtract(1, "months"));

          }

        },
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clear(false),

    start: () => {

      /* <!-- Setup Moment --> */
      moment().format();
      var locale = window.navigator.userLanguage || window.navigator.language;
      if (locale) moment.locale(locale);
      _current = moment().startOf("month");

      /* <!-- Create DB Reference --> */
      DB = new loki("events.db");
    },
  };

};