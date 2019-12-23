Manage = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id: {
        manage: "MANAGE",
        edit: "EDIT_RESOURCE",
        add: "ADD_RESOURCE",
        parent: "PARENT_NAME",
        feature: "FEATURE_NAME"
      },
      loaned: "LOANED",
      returned: "RETURNED",
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Scope Constants --> */
  const SCOPE_DRIVE_FILE = "https://www.googleapis.com/auth/drive.file",
    SCOPE_DRIVE_APPDATA = "https://www.googleapis.com/auth/drive.appdata";
  /* <!-- Scope Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {
      calendars: [],
      data: [],
      list: [],
    },
    /* <!-- State --> */
    ಱ = {
      db: new loki("manage.db"),
    }; /* <!-- Persistant --> */
  /* <!-- Internal Variables --> */

  /* <!-- Helper Functions --> */
  FN.loader = () => ({
    mime: factory.Google.files.natives()[1],
    properties: _.object([options.state.application.schema.property.name], [options.state.application.schema.property.value]),
  });

  FN.picker = () => _.extend({
    title: "Select a Booking Log Sheet to Open",
    view: "SPREADSHEETS",
    all: true,
    recent: true,
    team: true,
  }, FN.loader());

  FN.empty = () => "";
  /* <!-- Helper Functions --> */

  /* <!-- Internal Functions --> */
  FN.resource = data => ({
    resourceId: data.ID.Value,
    resourceName: data.Name.Value,
    resourceCategory: "OTHER",
    resourceDescription: data.Description ? data.Description.Value : "",
    resourceType: data.Type ? data.Type.Value : "",
    userVisibleDescription: data["User Description"] ? data["User Description"].Value : "",
    featureInstances: _.map((data.Features ? _.isArray(data.Features.Values) ? data.Features.Values : [data.Features.Values] : [])
                            .concat(data.Parent ? [data.Parent.Value] : []), value => ({
                              feature: {
                                name: value,
                              },
                            })),
  });
  
  FN.resources = () => FN.admin()
      .then(FN.empty)
      .then(options.functions.source.resources)
      .then(resources => options.functions.render.simple("calendars", options.id.manage, "Resources", "", "manage.resources", {
        data: resources,
        selectable: (ರ‿ರ.selectable = false),
        simple: (ರ‿ರ.simple = false)
      }))
      .then(FN.hookup.edit)
      .then(FN.hookup.search)
      .then(() => $("#search_Text").focus());

  FN.access = events => {

    if (!events || events.length === 0) return Promise.resolve(events);
    var source = _.find(ರ‿ರ.list, item => item.id == events[0].calendar);

    return (source ? Promise.resolve(source) : ರ‿ರ.admin === true ? Promise.resolve(ರ‿ರ.list[ರ‿ರ.list.push({
        id: events[0].calendar,
        manager: true
      }) - 1]) : options.functions.source.calendar(events[0].calendar)
      .catch(e => e.status == 404 ? {
        id: events[0].calendar
      } : factory.Flags.error("Calendar List Error", e))
      /* <!-- This only works for calendars added to a users calendar! --> */
      .then(calendar => calendar ? ರ‿ರ.list[ರ‿ರ.list.push({
        id: calendar.id,
        manager: calendar.accessRole == "writer" || calendar.accessRole == "owner"
      }) - 1] : {
        id: events[0].calendar,
        manager: false
      })).then(calendar => _.map(events, event => _.tap(event, event => event.manageable = calendar.manager)));
  };

  FN.admin = () => ರ‿ರ.admin === undefined ? options.functions.source.admin().then(admin => ರ‿ರ.admin = admin) : Promise.resolve(ರ‿ರ.admin),

    FN.event = event => {
      event.what = options.functions.calendar.resources(event);
      event.who = options.functions.calendar.who(event);
      event.when = options.functions.calendar.time(event);
      event.date = options.functions.calendar.date(event);
      return event;
    };

  FN.get = id => ರ‿ರ.events.findOne({
    id: {
      "$eq": id
    }
  });

  FN.update = event => ರ‿ರ.events.update(event);

  FN.status = (event, status) => factory.Google.calendar.events.update(event.source, event.id, {
      extendedProperties: {
        private: {
          STATUS: status
        }
      }
    }).then(updated => {
      event.properties = updated.extendedProperties && updated.extendedProperties.private ? updated.extendedProperties.private : {};
      FN.update(event);
      return event;
    })
    .catch(e => factory.Flags.error("Event Patch Error", e))
    .then(factory.Main.busy("Updating Booking"));

  FN.process = (calendar, events) => _.map(events, event => _.tap(event, event => event.calendar = calendar)),

    FN.refresh = () => Promise.all(_.map(ರ‿ರ.calendars, calendar => options.functions.source.events(calendar.id)
      .then(events => FN.process(calendar.id, events))))
    .then(results => _.flatten(results))
    .then(FN.access)
    .then(events => options.functions.render.table(options.id.manage)(FN.populate.events(options.functions.source.dedupe(ರ‿ರ.data = events))))
    .then(factory.Main.busy("Loading Bookings"));

  FN.confirm = {

    status: (id, status) => FN.status(FN.get(id), status)
      .then(event => event ?
        options.functions.render.refresh(options.id.manage, () => options.functions.render.table(options.id.manage)(ರ‿ರ.events))() :
        event),

    remove: id => FN.confirm.status(id, null),

    out: id => FN.confirm.status(id, options.loaned),

    in: id => FN.confirm.status(id, options.returned),

  };

  FN.db = {

    pick: () => factory.Router.pick.single(FN.picker()),

    open: (id, version) => options.state.session.database.open(id, version),

    create: () => options.state.session.database.create(options.state.application.schema.sheets.sheet_tasks,
      options.state.application.schema.names.spreadsheet,
      options.state.application.schema.names.sheet),

  };

  FN.config = {

    db: id => ($("nav a[data-link='sheet']").prop("href", `https://docs.google.com/spreadsheets/d/${id}/edit`), id),

    create: id => options.state.application.config.create({
        data: id
      }).then(factory.Main.busy("Saving Config"))
      .then(config => {
        factory.Flags.log(`Created Config File: ${config.id}`, config.settings);
        FN.config.db(config.settings.data);
        return factory.Google.files.get(config.settings.data, true)
          .then(file => (ರ‿ರ.db = FN.db.open(config.settings.data, file.version)));
      }),

    pick: () => FN.db.pick().then(file => file ? FN.config.create(file.id) : false).catch(e => e ? factory.Flags.error("Picker Error", e) :
      FN.db.create().then(factory.Main.busy("Creating Database"))
      .then(result => FN.config.create(result.spreadsheetId))),

    use: config => {

      factory.Flags.log(`Config from File: ${config.id}`, config.settings);

      return factory.Google.files.get(config.settings.data, true)
        .then(file => (ರ‿ರ.db = FN.db.open(FN.config.db(config.settings.data), file.version)))
        .then(factory.Main.busy("Loading Database"));

    },

    current: () => (options.state.session.config ?
        Promise.resolve(options.state.session.config) : options.state.application.config.get())
      .then(factory.Main.busy("Loading Config"))
      .then(config => options.state.session.config = config)
      .then(config => config ? FN.config.use(config) : FN.config.pick()),


  };

  FN.log = {

    status: (id, title, instructions, content, confirm, handler) => factory.Display.modal("generic", {
      target: factory.container,
      id: id,
      title: title,
      instructions: instructions,
      content: content,
      confirm: confirm,
    }, dialog => {
      factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {
        trigger: "hover"
      });
      factory.Dialog({}, factory).handlers.keyboard.enter(dialog);
      dialog.find("input[type='text']").first().focus();
      dialog.keypress(e => {
        if (e.which == 13) {
          e.preventDefault();
          var _focussed = dialog.find(":focus");
          _focussed.is(":last-child") ?
            dialog.find(".modal-footer button.btn-primary").click() :
            _focussed.next("input[type='text']").focus();
        }
      });
    }).then(data => {
      if (data === undefined) return;
      factory.Flags.log(`Data returned from Dialog: ${id}`, data);
      return handler ? handler(data) : data;
    }),

    out: (id, event) => (ರ‿ರ.db ? Promise.resolve() : FN.config.current())
      .then(() => event || FN.get(id))
      .then(event => FN.log.status("log_out", "Log Loaned Resources", factory.Display.doc.get("LOG_OUT_INSTRUCTIONS"),
        factory.Display.template.get(_.extend({
          template: "loan",
          warning: event.date.isSame(factory.Dates.now(), "day") ? null : event.date,
        }, event)), "Confirm Loan", FN.log.loan(id, event))),

    loan: (id, event) => data => {

      FN.confirm.status(id, "LOANED");
      factory.Flags.log(`Loaned Event: ${id}`, event);

      return Promise.all(_.map(data, (serial, id) => {
        var resource = _.find(event.what, resource => resource.id === id),
          item = {};

        /* <!-- Populate Resource Booking Object --> */
        item[options.state.application.schema.columns.calendar.value] = resource.email; /* <!-- Resource Calendar Email --> */
        item[options.state.application.schema.columns.event.value] = event.id; /* <!-- Booking Event ID --> */
        item[options.state.application.schema.columns.resource.value] = resource.id; /* <!-- Resource ID --> */
        item[options.state.application.schema.columns.name.value] = resource.name; /* <!-- Resource Name --> */
        item[options.state.application.schema.columns.identifier.value] = serial.Value; /* <!-- User Supplied Identifier / Serial --> */
        item[options.state.application.schema.columns.loaned.value] = new Date(); /* <!-- Loaned Out Date --> */
        item[options.state.application.schema.columns.loaned_by.value] = factory.me.display_name(); /* <!-- Loaned By | Current User --> */
        item[options.state.application.schema.columns.loaned_to.value] = event.who; /* <!-- Loaned To | End User --> */

        /* <!-- Insert Into DB  --> */
        return options.state.session.database.items.insert(item)
          .then(inserted => factory.Flags.log("DB Inserted Row", inserted))
          .catch(e => factory.Flags.error("DB Insert Booking Error", e));

      }));

    },

    in: (id, event) => (ರ‿ರ.db ? Promise.resolve() : FN.config.current())
      .then(() => event || FN.get(id))
      .then(event => FN.log.status("log_in", "Log Returned Resources", factory.Display.doc.get("LOG_IN_INSTRUCTIONS"),
        factory.Display.template.get(_.extend({
          template: "return",
          loans: options.state.session.database.loans(event.id),
        }, event)), "Confirm Return", FN.log.return(id, event))),

    return: (id, event) => data => {

      FN.confirm.status(id, "RETURNED");
      factory.Flags.log(`Returned Event: ${id}`, event);

      return Promise.all(_.map(data, (value, id) => {

        var resource = _.find(event.what, resource => resource.id === id),
          item = options.state.session.database.loan(event.id, resource.id);

        /* <!-- Update Resource Booking Object --> */
        item[options.state.application.schema.columns.returned.value] = new Date(); /* <!-- Returned Back Date --> */
        item[options.state.application.schema.columns.returned_by.value] = event.who; /* <!-- Returned By | End User --> */
        item[options.state.application.schema.columns.returned_to.value] = factory.me.display_name(); /* <!-- Returned To | Current User --> */

        /* <!-- Update In DB  --> */
        return options.state.session.database.items.update(item)
          .then(updated => factory.Flags.log("DB Updated Row", updated))
          .catch(e => factory.Flags.error("DB Insert Booking Error", e));

      }));

    },

  };

  FN.shortcut = (command, complete) => {
    if (command) {
      factory.Flags.log("RUN SHORTCUT", command);
      if (command.indexOf("#") >= 0) {
        var _command = command.split("#");
        window.location.hash = _command[_command.length - 1];
      }
      complete();
    }
  };

  FN.populate = {

    db: (name, schema, data, map) => {
      ರ‿ರ[name] = ಱ.db.addCollection(name, schema);
      ರ‿ರ[name].clear({
        removeIndices: false
      });
      ರ‿ರ[name].insert(map ? _.map(data, map) : data);
      factory.Flags.log(`DB Loaded ${name.toUpperCase()}:`, ರ‿ರ[name].data);
      return ರ‿ರ[name];
    },

    events: data => FN.populate.db("events", {
      unique: ["id"],
      indices: ["when", "what", "who"]
    }, data, value => ({
      id: value.id,
      date: options.functions.calendar.date(value),
      when: options.functions.calendar.time(value),
      what: options.functions.calendar.resources(value),
      who: options.functions.calendar.who(value),
      properties: options.functions.calendar.properties(value),
      manageable: value.manageable,
      source: value.calendar,
      url: value.htmlLink
    })),

  };

  FN.booking = event => {
    event = FN.event(event);
    factory.Flags.log("Loan from Shortcut", event);
    return !event.extendedProperties || !event.extendedProperties.private || !event.extendedProperties.private.STATUS ?
      FN.log.out(event.id, event) : event.extendedProperties.private.STATUS == options.loaned ?
      FN.log.in(event.id, event) : false;
  };

  FN.action = {

    /* <!-- Toggle selector should favour target --> */
    target: e => $(e.target || e.currentTarget),

    search: e => options.functions.render.search("resources", ರ‿ರ.selectable, ರ‿ರ.simple)(FN.action.target(e).val())
      .then(FN.hookup.toggle)
      .then(ರ‿ರ.selectable ? FN.hookup.resource : FN.hookup.edit),

    edit: e => {

      /* <!-- Click selector should favour currentTarget --> */
      var target = $(e.currentTarget || e.target),
        id = target.data("id"),
        group = target.data("group"),
        resource = options.state.application.resources.get(id || group);

      factory.Flags.log("Editing Resource:", resource);

      var _dialog = factory.Dialog({}, factory);
      return group ?
        Promise.resolve(true) :
        options.state.application.resources.safe().then(resources => factory.Display.modal("edit", _.extend({
          target: factory.container,
          id: options.id.edit,
          title: "Edit Resource",
          instructions: factory.Display.doc.get("EDIT_INSTRUCTIONS"),
          confirm: "Save",
          handlers: {
            clear: _dialog.handlers.clear,
          }
        }, {
          parents: resources.parents(),
          features: resources.features(),
          state: {
            id: resource.id,
            name: resource.name || "",
            type: resource.category || "",
            description: resource.description || "",
            user_description: resource.details || "",
            parent: resource.parent || "",
            features: resource.features || [],
          }
        }), dialog => {
          factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {
            trigger: "hover"
          });
          _dialog.handlers.keyboard.enter(dialog);
        }).then(data => {
          if (data === undefined) return;
          factory.Flags.log("Data returned from Edit Dialog:", data);
          return factory.Google.resources.calendars.update(data.ID.Value, FN.resource(data))
            .then(result => result ? (resources.update.resource(result), FN.resources()) : result)
            .then(factory.Main.busy("Updating Resource"));
        }));
    },

    toggle: e => {
      var target = FN.action.target(e),
        id = target.data("id"),
        group = target.data("group"),
        name = target.data("name"),
        toggled = target.prop("checked");

      (options.state.application.resources.get(id || group).toggled = toggled) ? ರ‿ರ.calendars.push({
        id: id,
        name: name
      }): ರ‿ರ.calendars = _.reject(ರ‿ರ.calendars, calendar => calendar.id == id);

      factory.Flags.log(`${toggled ? "Toggled" : "DE-Toggled"} Resource with ID:`, id || group);
      factory.Flags.log("Selected Calendars:", ರ‿ರ.calendars);

      (toggled ? options.functions.source.events(id).then(events => events && events.length > 0 ?
          ರ‿ರ.data.concat(FN.process(id, events)) : ರ‿ರ.data) :
        Promise.resolve(_.reject(ರ‿ರ.data, event => event.calendar == id)))
      .then(FN.access)
        .then(data => {
          factory.Flags.log("Calendar Events:", data);
          options.functions.render.table(options.id.manage)(FN.populate.events(options.functions.source.dedupe(ರ‿ರ.data = data)));
        })
        .then(factory.Main.busy("Loading Bookings"));
    },

    shortcut: e => {

      if (e.keyCode === 13) {
        var _target = FN.action.target(e);
        FN.shortcut(_target.val(), () => _target.val(""));
      }

    },

    resource: e => {
      var target = FN.action.target(e);
      if (!target.is("input.custom-control-input, label.custom-control-label")) {
        e.preventDefault();
        var _checkbox = (target.is(".resource-item") ?
          target : target.parents(".resource-item")).find("input.custom-control-input");
        _checkbox.prop("checked", !_checkbox.prop("checked")).change();
      }
    }
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */
  FN.hookup = factory.Hookup({
    action: FN.action
  }, factory);

  /* <!-- External Visibility --> */
  return {

    add: {

      resource: () => {
        var _dialog = factory.Dialog({}, factory);
        return options.state.application.resources.safe().then(resources => factory.Display.modal("edit", {
          target: factory.container,
          id: options.id.add,
          title: "Add New Resource",
          instructions: factory.Display.doc.get("ADD_INSTRUCTIONS"),
          confirm: "Add",
          handlers: {
            clear: _dialog.handlers.clear,
          },
          parents: resources.parents(),
          features: resources.features(),
          state: {
            id: uuid.v4(),
          }
        }, dialog => {
          factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {
            trigger: "hover"
          });
          _dialog.handlers.keyboard.enter(dialog);
        }).then(data => {
          if (data === undefined || !data.Name) return;
          factory.Flags.log("Data returned from Add Dialog:", data);
          return factory.Google.resources.calendars.insert(FN.resource(data))
            .then(result => result ? (resources.add.resource(result), FN.resources()) : result)
            .then(factory.Main.busy("Creating Resource"));
        }));
      },

      parent: () => factory.Display.text({
          id: options.id.parent,
          title: "Parent / Group Name",
          message: factory.Display.doc.get("ADD_PARENT_INSTRUCTIONS"),
          validate: value => value,
          simple: true
        }).then(name => name ? options.state.application.resources.safe()
          .then(resources => {
            if (!_.find(resources.parents(), parent => parent.name == name)) {
              return factory.Google.resources.features.insert(`PARENT:${name}`)
                .then(feature => {
                  var _select = $("select[data-output-field='Parent']");
                  _select.children("option").removeAttr("selected");
                  $("<option />", {
                      value: feature.name,
                      text: name
                    })
                    .appendTo(_select)
                    .attr("selected", "selected");
                  resources.add.feature(feature.name);
                });
            }
          }) : name)
        .catch(e => e ? factory.Flags.error("Feature Adding Error", e) : null),

      feature: () => {

        var _feature = $("select[data-action='feature'] option:selected").val(),
          _add = feature => {
            var _fields = $("[data-output-field='Features']");
            if (!_.find(_fields.children("span.badge"), field => String.equal($(field).children("span").text(), feature, true))) {
              _fields.append(factory.Display.template.get({
                template: "feature",
                id: $("input[type='hidden'][data-output-field='ID']").val(),
                name: feature
              }));
            }
          };

        _feature ? _add(_feature) : options.state.application.resources.safe()
          .then(resources => factory.Display.text({
            id: options.id.feature,
            title: "Feature Name",
            message: factory.Display.doc.get("ADD_FEATURE_INSTRUCTIONS"),
            validate: value => value,
            simple: true
          }).then(name => {
            if (!name) return name;
            var _existing = _.find(resources.features(), feature => String.equal(feature, name, true));
            (_existing ? Promise.resolve(_existing) : factory.Google.resources.features.insert(name).then(feature => {
              $("<option />", {
                value: feature.name,
                text: feature.name
              }).appendTo($("select[data-action='feature']"));
              resources.add.feature(feature.name);
              return feature.name;
            }))
            .then(name => _add(name));
          }).catch(e => e ? factory.Flags.error("Feature Adding Error", e) : null));

      },
    },

    booking: (calendar, id) => options.functions.source.event(calendar, id)
      .then(event => options.state.application.resources.safe()
        .then(() => factory.Main.authorise([SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_FILE]))
        .then(result => result === true ? FN.booking(event) : false)),

    bookings: () => FN.admin()
      .then(FN.empty)
      .then(options.functions.source.resources)
      .then(options.functions.render.view("manage", options.id.manage, "Manage", "manage", ರ‿ರ.selectable = true, ರ‿ರ.simple = true))
      .then(FN.hookup.toggle)
      .then(FN.hookup.resource)
      .then(FN.hookup.search)
      .then(FN.hookup.shortcut)
      .then(() => $("#shortcut_Text").focus()),

    in: (id, log) => log ? FN.log.in(id) : FN.confirm.in(id),

    out: (id, log) => log ? FN.log.out(id) : FN.confirm.out(id),

    refresh: options.functions.render.refresh(options.id.manage, FN.refresh),

    remove: {

      tag: FN.confirm.remove,

      feature: (id, feature) => $(`[data-id='${id}'][data-feature='${feature}']`).remove(),

    },

    resources: FN.resources,

  };
  /* <!-- External Visibility --> */

};