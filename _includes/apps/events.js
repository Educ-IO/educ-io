App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const _encodeID = id => id.replace(/[.@]/g, ""),
    _encodeValue = value => value.replace(/\./g, "%2E").replace(/@/g, "%40"),
    _decodeValue = value => value && value.replace ? value.replace(/%2E/g, ".").replace(/%40/g, "@") : value;

  const STATE_OPENED = "opened",
    /* <!-- Calendar has been opened --> */

    STATE_MONTH = "monthly",
    /* <!-- Month View --> */

    STATE_EVENT = "event",
    /* <!-- Single Event Opened --> */

    STATE_PROPERTY = "property",
    /* <!-- Property Filter --> */

    STATE_SEARCH = "searched",
    /* <!-- Free Text Search --> */

    STATE_DISPLAY = "display",
    /* <!-- Results Displaying --> */

    STATES = [STATE_OPENED, STATE_MONTH, STATE_EVENT, STATE_SEARCH, STATE_PROPERTY, STATE_DISPLAY];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, DB, _id, _table, _current, _query, _event, _property, _value;
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
      duration: (start, end) => `${start && end ? `For ${ಠ_ಠ.Dates.duration(start.diff(end)).humanize()}` : ""}`,
      date: (start, end) => `${start ? start.format(start.hour() === 0 && start.minute() === 0 && start.second() === 0 && !end ? "LL" : "LLL") : ""}`,
    },
    _map = v => ({
      id: v.id,
      files: v.attachments,
      type: v.recurringEventId ? "Series" : "Single",
      when: v.start ? v.start.dateTime ? ಠ_ಠ.Dates.parse(v.start.dateTime) : v.start.date ? ಠ_ಠ.Dates.parse(v.start.date) : null : null,
      when_display: _format.date(v.start ? v.start.dateTime ? ಠ_ಠ.Dates.parse(v.start.dateTime) : v.start.date ? ಠ_ಠ.Dates.parse(v.start.date) : null : null, v.end && v.end.dateTime ? ಠ_ಠ.Dates.parse(v.end.dateTime) : null),
      duration: _format.duration(v.start && v.start.dateTime ? ಠ_ಠ.Dates.parse(v.start.dateTime) : null, v.end && v.end.dateTime ? ಠ_ಠ.Dates.parse(v.end.dateTime) : null),
      what: v.summary,
      where: v.location,
      who: v.organizer ? v.organizer.displayName ? ಠ_ಠ.Display.username(v.organizer.displayName) : v.organizer.email : "",
      properties: v.extendedProperties && v.extendedProperties.shared ? v.extendedProperties.shared : {},
      with: v.attendees,
      url: v.htmlLink
    }),
    _process = (event, fn) => {
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


  /* <!-- Tag Processing Functions --> */
  var _tags = {

    update: () => chrome && chrome.runtime ? chrome.runtime.sendMessage("ekniapbebejhamindielmdgpceijdpff", {
      action: "update"
    }) : false,

    patch: (calendar, event, property, value) => new Promise((resolve, reject) => {

      var _properties = {};
      _properties[property] = value;
      var _data = {
        extendedProperties: {
          shared: _properties
        }
      };

      ಠ_ಠ.Google.calendar.events.update(calendar, event, _data)
        .then(event => {
          _tags.update();
          resolve(event);
        })
        .catch(e => ಠ_ಠ.Flags.error("Patch Error", e) && reject(e));

    }),

    add: (id, event) => new Promise((resolve, reject) => {

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

        values ?
          (values = _decode(values)) && _tags.patch(id, event.id, values.name, values.value).then(event => resolve(event)).catch(e => reject(e)) :
          resolve(false);

      }).catch(e => e ? (ಠ_ಠ.Flags.error("Tagging Error", e) && reject(e)) : (ಠ_ಠ.Flags.log("Tagging Cancelled") && resolve(false)));

    }),

    remove: (id, event, property) => new Promise((resolve, reject) => {

      ಠ_ಠ.Display.confirm({
          id: "remove_Tag",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to remove the <strong>${property}</strong> tag from <strong>${event.what}</strong>`,
          action: "Remove"
        })
        .then(confirm => {

          confirm ?
            _tags.patch(id, event.id, property, null).then(event => resolve(event)).catch(e => reject(e)) :
            resolve(false);

        }).catch(e => e ? (ಠ_ಠ.Flags.error("De-Tagging Error", e) && reject(e)) : (ಠ_ಠ.Flags.log("De-Tagging Cancelled") && resolve(false)));
    }),

  };


  /* <!-- Open, Load and Display --> */
  var _display = (id, events, parameters) => {
    ಠ_ಠ.Flags.log("Displaying Events:", events = _.isArray(events) ? events : [events]);

    var _show = (id, values, target, parameters) => {

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
        icons: v === "When" ? ["access_time"] : null
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
          classes: ["table-hover"],
          filters: parameters ? parameters.f : {},
          inverted_Filters: parameters ? parameters.e : {},
          sorts: parameters ? parameters.s : {},
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
              class: ಠ_ಠ.Display.state().in([STATE_EVENT, STATE_SEARCH, STATE_PROPERTY], true) ? "d-none btn-secondary" : null,
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

      return _return;

    };
    _table = _show(id, _.map(events, _map), ಠ_ಠ.container.empty(), parameters);

    ಠ_ಠ.Display.state()[events && events.length > 0 ? "enter" : "exit"](STATE_DISPLAY);
  };

  var _load = (load, state_Out, state_In, parameters) => {
    load.then(events => {
        ಠ_ಠ.Display.state().swap(state_Out, state_In);
        _display(_id, events, parameters);
      })
      .catch(e => ಠ_ಠ.Flags.error("Events Loading Error:", e))
      .then(ಠ_ಠ.Display.busy({
        target: ಠ_ಠ.container,
        status: "Loading Events",
        fn: true
      }));
  };

  var _load_Month = (calendar, date, parameters) => {
    ಠ_ಠ.Flags.log(`Loading Month From: ${_current = date} from Calendar: ${_id = calendar}`);
    return _load(ಠ_ಠ.Google.calendar.list(calendar, date.toDate(), ಠ_ಠ.Dates.parse(date).add(1, "months").toDate()), [STATE_EVENT, STATE_SEARCH, STATE_PROPERTY], STATE_MONTH, parameters);
  };

  var _load_Event = (calendar, event, parameters) => {
    ಠ_ಠ.Flags.log(`Loading Event: ${_event = event} from Calendar: ${_id = calendar}`);
    return _load(ಠ_ಠ.Google.calendar.events.get(calendar, event), [STATE_SEARCH, STATE_MONTH, STATE_PROPERTY], STATE_EVENT, parameters);
  };

  var _load_Properties = (calendar, prop, val, parameters) => {
    ಠ_ಠ.Flags.log(`Searching for Tag: ${_property = prop} = ${_value = val} in Calendar: ${_id = calendar}`);
    return _load(ಠ_ಠ.Google.calendar.search(calendar, `${prop}=${val}`), [STATE_EVENT, STATE_MONTH, STATE_SEARCH], STATE_PROPERTY, parameters);
  };

  var _load_Search = (calendar, query, parameters) => {
    ಠ_ಠ.Flags.log(`Searching for: ${_query = query} in Calendar: ${_id = calendar}`);
    return _load(ಠ_ಠ.Google.calendar.search(calendar, null, query), [STATE_EVENT, STATE_MONTH, STATE_PROPERTY], STATE_SEARCH, parameters);
  };

  var _open_Calendar = id => ಠ_ಠ.Google.calendar.get(id).then(calendar => {
    if (calendar) {
      ಠ_ಠ.Display.state().enter(STATE_OPENED);
      return ಠ_ಠ.Recent.add(_encodeID(calendar.id), calendar.summary, `#google,load.calendar.${_encodeValue(calendar.id)}`).then(() => calendar);
    } else {
      return calendar;
    }
  });

  var _open_Calendars = () => new Promise((resolve, reject) => {

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
        })
        .then(option => option ? _open_Calendar(option.id).then(resolve) : Promise.resolve(false))
        .catch(e => e ? ಠ_ಠ.Flags.error("Calendar Select:", e) : ಠ_ಠ.Flags.log("Calendar Select Cancelled") && reject(e));

    }).catch(e => ಠ_ಠ.Flags.error("Calendars Load Failure", e ? e : "No Inner Error") && reject(e));

  });


  /* <!-- UI Functions --> */
  var _search = id => ಠ_ಠ.Display.text({
      message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
      title: "Enter Search Text",
      action: "Search",
      simple: true,
    })
    .then(query => _load_Search(id, query))
    .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"));

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
      var _date = new ಠ_ಠ.Dates.parse($(e.target).val());
      if (_date.isValid()) _load_Month(_id, ಠ_ಠ.Dates.parse(_date).startOf("month"));
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
        routes: {
          open_calendar: {
            matches: [/OPEN/i, /CALENDAR/i],
            keys: ["o", "O"],
            fn: () => _open_Calendars()
              .then(calendar => _load_Month(calendar.id, ಠ_ಠ.Dates.now().startOf("month")))
          },
          close_calendar: {
            matches: [/CLOSE/i, /CALENDAR/i],
            state: STATE_OPENED,
            keys: ["c", "C"],
            fn: () => ಠ_ಠ.Router.clean(true)
          },
          jump: {
            matches: /JUMP/i,
            state: STATE_OPENED,
            keys: ["g", "G", "j", "J"],
            fn: _jump
          },
          today: {
            matches: /TODAY/i,
            state: STATE_OPENED,
            keys: ["t", "T"],
            fn: () => _load_Month(_id, ಠ_ಠ.Dates.now().startOf("month"))
          },
          refresh: {
            matches: /REFRESH/i,
            state: STATE_MONTH,
            keys: ["r", "R"],
            fn: () => _load_Month(_id, _current)
          },
          forward: {
            matches: /FORWARD/i,
            state: STATE_MONTH,
            keys: ">",
            actions: "swipeleft",
            fn: () => _load_Month(_id, ಠ_ಠ.Dates.parse(_current).add(1, "months"))
          },
          backward: {
            matches: /BACKWARD/i,
            state: STATE_MONTH,
            keys: "<",
            actions: "swiperight",
            fn: () => _load_Month(_id, ಠ_ಠ.Dates.parse(_current).subtract(1, "months"))
          },
          load_calendar: {
            matches: [/LOAD/i, /CALENDAR/i],
            length: 1,
            fn: command => _open_Calendar(_decodeValue(command))
              .then(calendar => _load_Month(calendar.id, ಠ_ಠ.Dates.now().startOf("month")))
          },
          load_item: {
            matches: [/LOAD/i, /ITEM/i],
            length: 2,
            fn: command => _load_Event(_decodeValue(command[0]), _decodeValue(command[1]))
          },
          remove_list: {
            matches: [/REMOVE/i, /LIST/i],
            state: STATE_DISPLAY,
            length: 1,
            fn: command => {
              ಠ_ಠ.Flags.log(`Removing List Item: ${command}`);
              var _data = DB.getCollection(_id),
                _item = _data.by("id", command);
              _data.remove(_item);
              _table.update();
            }
          },
          search_property: {
            matches: [/SEARCH/i, /PROPERTIES/i],
            state: STATE_DISPLAY,
            length: 1,
            fn: command => _load_Properties(_id, command, true),
          },
          search_properties: {
            matches: [/SEARCH/i, /PROPERTIES/i],
            state: STATE_DISPLAY,
            length: 2,
            fn: command => _load_Properties(_id, _decodeValue(command[0]), _decodeValue(command[1])),
          },
          search_properties_shortcut: {
            matches: [/SEARCH/i, /PROPERTIES/i],
            length: 3,
            fn: command => _load_Properties(_decodeValue(command[2]), _decodeValue(command[0]), _decodeValue(command[1])),
          },
          search: {
            matches: /SEARCH/i,
            length: 0,
            state: STATE_MONTH,
            keys: ["s", "S", "f", "F"],
            fn: () => _search(_id)
          },
          remove_tag: {
            matches: [/REMOVE/i, /TAG/i],
            state: STATE_DISPLAY,
            length: 2,
            fn: command => ಠ_ಠ.Flags.log(`Removing Tag (${command[1]}) from: ${command[0]}`) && _process(command[0], (calendar, event) => _tags.remove(calendar, event, command[1]))
          },
          tag_item: {
            matches: /TAG/i,
            state: STATE_DISPLAY,
            length: 1,
            fn: command => ಠ_ಠ.Flags.log(`Tagging Item: ${command} in Calendar: ${_id}`) && _process(command, _tags.add)
          },
          generate_link: {
            matches: /LINK/i,
            state: STATE_DISPLAY,
            length: 0,
            keys: ["l", "L"],
            fn: () => {
              var _data = _table.dehydrate();
              _data.i = {
                i: _id,
                e: ಠ_ಠ.Display.state().in(STATE_EVENT) ? _event : "",
                s: ಠ_ಠ.Display.state().in(STATE_SEARCH) ? _query : "",
                p: ಠ_ಠ.Display.state().in(STATE_PROPERTY) ? {
                  p: _property,
                  v: _value
                } : "",
                m: ಠ_ಠ.Display.state().in(STATE_MONTH) && _current ? _current.toISOString() : "",
              };

              ಠ_ಠ.Link({
                app: "events",
                route: "view",
                data: _data
              }, ಠ_ಠ).generate();
            }
          },
          view: {
            matches: /VIEW/i,
            length: 1,
            fn: command => {

              /* <!-- Clear the existing state --> */
              ಠ_ಠ.Router.clean(false, STATES);

              /* <!-- Show the View --> */
              try {
                var params = JSON.parse(ಠ_ಠ.Strings().base64.decode(command));
                params.i.e ?
                  _load_Event(params.i.i, params.i.e, params) :
                  params.i.s ?
                  _load_Search(params.i.i, params.i.s, params) :
                  params.i.p ?
                  _load_Properties(params.i.i, params.i.p.p, params.i.p.v, params) :
                  params.i.m ? _load_Month(params.i.i, ಠ_ಠ.Dates.parse(params.i.m), params) : false;
              } catch (e) {
                ಠ_ಠ.Flags.error("Failed to Parse Events Params", e ? e : "No Inner Error");
              }
            }
          },
        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clear(false),

    start: () => {

      /* <!-- Setup Date --> */
      _current = ಠ_ಠ.Dates.now().startOf("month");

      /* <!-- Create DB Reference --> */
      DB = new loki("events.db");
    },
  };

};