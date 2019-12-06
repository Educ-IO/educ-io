Manage = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id: "MANAGE",
      format: "Do MMM",
      delay: 100,
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
    }, /* <!-- State --> */
    ಱ = {
      db: new loki("manage.db"),
    }; /* <!-- Persistant --> */
  /* <!-- Internal Variables --> */

  /* <-- Helper Functions --> */
  FN.loader = () => ({
              mime: factory.Google.files.natives()[1],
              properties: _.object([options.state.application.schema.property.name],
                                    [options.state.application.schema.property.value]),
            });
  
  FN.picker = () => _.extend({
              title: "Select a Booking Log Sheet to Open",
              view: "SPREADSHEETS",
              all: true,
              recent: true,
              team: true,
            }, FN.loader());
  
  FN.empty = () => "";
  /* <-- Helper Functions --> */
  
  /* <!-- Internal Functions --> */
  FN.get = id => ರ‿ರ.events.findOne({id: {"$eq": id}});
  
  FN.update = event => ರ‿ರ.events.update(event);
  
  FN.status = (event, status) => factory.Google.calendar.events.update(event.source, event.id, {
                    extendedProperties: {
                      private: {
                        STATUS: status
                      }
                    }
                  }).then(updated => {
                    event.properties = updated.extendedProperties;
                    FN.update(event);
                    return event;
                  })
                  .catch(e => factory.Flags.error("Event Patch Error", e))
                  .then(factory.Main.busy("Updating Booking"));
  
  FN.process = (calendar, events) => _.map(events, event => _.tap(event, event => event.calendar = calendar)),
  
  FN.confirm = {
    
    status : (id, status) => FN.status(FN.get(id), status).then(event => event ? FN.render.refresh() : event),
    
    remove : id => FN.confirm.status(id, null),
    
    out : id => FN.confirm.status(id, options.loaned),
    
    in : id => FN.confirm.status(id, options.returned),
    
  };
  
  FN.db = {
    
    pick : () => factory.Router.pick.single(FN.picker()),
    
    open : (id, version) => options.state.session.database.open(id, version),
    
    create : () => options.state.session.database.create(options.state.application.schema.sheets.sheet_tasks,
                                           options.state.application.schema.names.spreadsheet,
                                           options.state.application.schema.names.sheet),
    
  };
  
  FN.config = {
  
    db : id => ($("nav a[data-link='sheet']").prop("href", `https://docs.google.com/spreadsheets/d/${id}/edit`), id),
    
    create : id => options.state.application.config.create({
                              data: id
                            }).then(factory.Main.busy("Saving Config"))
                            .then(config => {
                              factory.Flags.log(`Created Config File: ${config.id}`, config.settings);
                              FN.config.db(config.settings.data);
                              return factory.Google.files.get(config.settings.data, true)
                                .then(file => (ರ‿ರ.db = FN.db.open(config.settings.data, file.version)));
                            }),
  
    pick : () => FN.db.pick().then(file => file ? FN.config.create(file.id) : false
                           ).catch(e => e ? factory.Flags.error("Picker Error", e) : 
                              FN.db.create().then(factory.Main.busy("Creating Database"))
                                .then(result => FN.config.create(result.spreadsheetId))),
    
    use : config => {
      
      factory.Flags.log(`Config from File: ${config.id}`, config.settings);
      
      return factory.Google.files.get(config.settings.data, true)
                                .then(file => (ರ‿ರ.db = FN.db.open(FN.config.db(config.settings.data), file.version)))
                    .then(factory.Main.busy("Loading Database"));
      
    },
    
    current : () => (options.state.session.config ? 
              Promise.resolve(options.state.session.config) : options.state.application.config.get())
              .then(factory.Main.busy("Loading Config"))
              .then(config => options.state.session.config = config)
              .then(config => config ? FN.config.use(config) : FN.config.pick()),
    
    
  };
  
  FN.log = {
    
    status : (id, title, instructions, content, confirm, handler) => factory.Display.modal("generic", {
                  target: factory.container,
                  id: id,
                  title: title,
                  instructions: instructions,
                  content: content,
                  confirm: confirm,
                }, dialog => {
                  factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {trigger: "hover"});
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
    
    out : (id, event) => (ರ‿ರ.db ? Promise.resolve() : FN.config.current())
                  .then(() => event || FN.get(id))
                  .then(event => FN.log.status("log_out", "Log Loaned Resources", factory.Display.doc.get("LOG_OUT_INSTRUCTIONS"),
                             factory.Display.template.get(_.extend({
                                template: "loan",
                                warning: event.date.isSame(factory.Dates.now(), "day") ? null : event.date,
                             }, event)), "Confirm Loan", FN.log.loan(id, event))),
    
    loan : (id, event) => data => {
      
      FN.confirm.status(id, "LOANED");
      factory.Flags.log(`Loaned Event: ${id}`, event);
      
      return Promise.all(_.map(data, loan => {
        var resource = _.find(event.what, resource => resource.id === loan.name),
            item = {};
        
        /* <-- Populate Resource Booking Object --> */
        item[options.state.application.schema.columns.calendar.value] = resource.email; /* <-- Resource Calendar Email --> */
        item[options.state.application.schema.columns.event.value] = event.id; /* <-- Booking Event ID --> */
        item[options.state.application.schema.columns.resource.value] = resource.id; /* <-- Resource ID --> */
        item[options.state.application.schema.columns.name.value] = resource.name; /* <-- Resource Name --> */
        item[options.state.application.schema.columns.identifier.value] = loan.value; /* <-- User Supplied Identifier / Serial --> */
        item[options.state.application.schema.columns.loaned.value] = new Date(); /* <-- Loaned Out Date --> */
        item[options.state.application.schema.columns.loaned_by.value] = factory.me.display_name(); /* <-- Loaned By | Current User --> */
        item[options.state.application.schema.columns.loaned_to.value] = event.who; /* <-- Loaned To | End User --> */
        
        /* <-- Insert Into DB  --> */
        return options.state.session.database.items.insert(item)
          .then(inserted => factory.Flags.log("DB Inserted Row", inserted))
          .catch(e => factory.Flags.error("DB Insert Booking Error", e));
        
      }));
     
    },
    
    in : (id, event) => (ರ‿ರ.db ? Promise.resolve() : FN.config.current())
                  .then(() => event || FN.get(id))
                  .then(event => FN.log.status("log_in", "Log Returned Resources", factory.Display.doc.get("LOG_IN_INSTRUCTIONS"),
                             factory.Display.template.get({
                                template: "return",
                                event: event, 
                                loans: options.state.session.database.loans(event.id)
                              }), "Confirm Return", FN.log.return(id, event))),
    
    return : (id, event) => data => {
      
      FN.confirm.status(id, "RETURNED");
      factory.Flags.log(`Returned Event: ${id}`, event);
      
      return Promise.all(_.map(_.filter(data, loan => loan.value == "on"), loan => {
        
        var resource = _.find(event.what, resource => resource.id === loan.name),
            item = options.state.session.database.loan(event.id, resource.id);
        
        /* <-- Update Resource Booking Object --> */
        item[options.state.application.schema.columns.returned.value] = new Date(); /* <-- Returned Back Date --> */
        item[options.state.application.schema.columns.returned_by.value] = event.who; /* <-- Returned By | End User --> */
        item[options.state.application.schema.columns.returned_to.value] = factory.me.display_name(); /* <-- Returned To | Current User --> */
        
        /* <-- Update In DB  --> */
        return options.state.session.database.items.update(item)
          .then(updated => factory.Flags.log("DB Updated Row", updated))
          .catch(e => factory.Flags.error("DB Insert Booking Error", e));
        
      }));
      
    },
    
  };
  
  FN.data = {

    admin: () => ರ‿ರ.admin === undefined ? factory.Google.admin.privileges()
      .then(privileges => {
        var privilege = _.find(privileges.items, item => item.serviceName == "calendar");
        return (ರ‿ರ.admin = !!(privilege && privilege.childPrivileges && _.find(privilege.childPrivileges, 
          child => child.serviceName == "calendar" && child.privilegeName == "CALENDAR_RESOURCE")));
      }) : Promise.resolve(ರ‿ರ.admin),
      
    resources: search => options.state.application.resources.safe()
      .then(resources => resources.find(search)),
    
    calendar: calendar => factory.Google.calendars.get(calendar),
    
    event: (calendar, id) => factory.Google.calendar.events.get(calendar, id),
    
    events: calendar => factory.Google.calendar.list(calendar, options.state.session.current.toDate(),
      factory.Dates.parse(options.state.session.current).add(1, "day").toDate()),
    
    dedupe: events => _.uniq(events, false, "id"),
    
    access: events => {
      if (!events || events.length === 0) return Promise.resolve(events);
      var source = _.find(ರ‿ರ.list, item => item.id == events[0].calendar);
      
      return (source ? Promise.resolve(source) : ರ‿ರ.admin === true ? Promise.resolve(ರ‿ರ.list[ರ‿ರ.list.push({
        id : events[0].calendar,
        manager : true
      }) - 1]) : FN.data.calendar(events[0].calendar)
                    .catch(e => e.status == 404 ? {id: events[0].calendar} : factory.Flags.error("Calendar List Error", e))
        /* <!-- This only works for calendars added to a users calendar! --> */
        .then(calendar => calendar ? ರ‿ರ.list[ರ‿ರ.list.push({
          id : calendar.id,
          manager : calendar.accessRole == "writer" || calendar.accessRole == "owner"
        }) - 1] : {
          id : events[0].calendar,
          manager : false
        })).then(calendar => _.map(events, event => _.tap(event, event => event.manageable = calendar.manager)));
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
  
  FN.action = {

    target: e => $(e.target || e.currentTarget),
    
    search: e => FN.render.search(FN.action.target(e).val()),
    
    toggle: e => {
      var target = FN.action.target(e);
      var id = target.data("id"),
        name = target.data("name"),
        toggled = target.prop("checked");
      
      (options.state.application.resources.get(id).toggled = toggled) ? ರ‿ರ.calendars.push({
          id: id,
          name: name
        }) : ರ‿ರ.calendars = _.reject(ರ‿ರ.calendars, calendar => calendar.id == id);
      
      factory.Flags.log(`${toggled ? "Toggled" : "DE-Toggled"} Resource with ID:`, id);
      factory.Flags.log("Selected Calendars:", ರ‿ರ.calendars);
      
      (toggled ? FN.data.events(id).then(events => events && events.length > 0 ? 
            ರ‿ರ.data.concat(FN.process(id, events)) : ರ‿ರ.data) :
        Promise.resolve(_.reject(ರ‿ರ.data, event => event.calendar == id)))
      .then(FN.data.access)
      .then(data => {
        factory.Flags.log("Calendar Events:", data);
        FN.render.events(FN.data.dedupe(ರ‿ರ.data = data));
      })
      .then(factory.Main.busy("Loading Bookings"));
    },
    
    shortcut: handler => e => {
      
      if (e.keyCode === 13) {
        var _target = FN.action.target(e);
        handler(_target.val(), () => _target.val(""));
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
  
  FN.hookup = {

    toggle: items => items.off("change.toggle").on("change.toggle", FN.debounce.toggle),
    
    toggles: parent => _.tap(parent, parent => FN.hookup.toggle(parent.find("input.custom-control-input"))),
    
    resource: items => items.off("click.resource").on("click.resource", FN.action.resource),
    
    resources: parent => _.tap(parent, parent => FN.hookup.resource(parent.find("a.resource-item"))),
    
    search: parent => _.tap(parent, parent => parent.find("input.search")
      .off("input.search")
      .on("input.search", FN.debounce.search)),

    shortcut: parent => _.tap(parent, parent => parent.find("input.shortcut")
      .off("keyup.shortcut")
      .on("keyup.shortcut", FN.action.shortcut(FN.shortcut))),
    
  };
  
  FN.debounce = {
    
    toggle : _.debounce(FN.action.toggle, options.delay * 5),

    search : _.debounce(FN.action.search, options.delay),
    
  };
  
  FN.table = {
    
    headers: () => _.map(["ID", "When", "What", "Who", "Actions"], v => ({
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
      })),
    
  };
  
  FN.populate = {
    
    db : (name, schema, data, map) => {
      ರ‿ರ[name] = ಱ.db.addCollection(name, schema);
      ರ‿ರ[name].clear({
        removeIndices: false
      });
      ರ‿ರ[name].insert(map ? _.map(data, map) : data);
      factory.Flags.log(`DB Loaded ${name.toUpperCase()}:`, ರ‿ರ[name].data);
      return ರ‿ರ[name];
    },
    
    events : data => FN.populate.db("events", {
        unique: ["id"],
        indices: ["when", "what", "who"]
      }, data, value => ({
        id: value.id,
        when: value.start && value.start.dateTime ?
          options.functions.calendar.times(factory.Dates.parse(value.start.dateTime),
          factory.Dates.parse(value.end.dateTime)) : "",
        what: options.functions.calendar.resources(value),
        who: options.functions.calendar.who(value),
        properties: options.functions.calendar.properties(value),
        manageable: value.manageable,
        source: value.calendar,
        url: value.htmlLink
      })),
    
  };
  
  FN.render = {

    manage: data => factory.Display.template.show({
      template: "manage",
      id: options.id,
      title: "Manage",
      subtitle: options.state.session.current.format(options.format),
      resources: data,
      selectable: true,
      simple: true,
      instructions: "manage",
      clear: true,
      target: factory.container
    }),
    
    search: value => FN.data.resources(value)
      .then(data => factory.Display.template.show({
        template: "resources",
        resources: data,
        selectable: true,
        simple: true,
        clear: true,
        target: factory.container.find("#resources")
      }))
      .then(FN.hookup.toggles)
      .then(FN.hookup.resources),

    events: data => factory.Datatable(factory, {
        id: options.id,
        name: options.id,
        data: FN.populate.events(data),
        headers: FN.table.headers(),
      }, {
        classes: ["table-hover"],
        filters: {},
        inverted_Filters: {},
        sorts: {},
        advanced: false,
        collapsed: true,
      }, factory.container.find("#details").empty()),
    
    refresh: () => {
      
      /* <!-- Update Date --> */
      factory.container.find(`#${options.id} .subtitle`)
        .text(options.state.session.current.format(options.format));
      
      return Promise.all(_.map(ರ‿ರ.calendars, calendar => FN.data.events(calendar.id)
                               .then(events => FN.process(calendar.id, events))))
        .then(results => _.flatten(results))
        .then(FN.data.access)
        .then(events => FN.render.events(FN.data.dedupe(ರ‿ರ.data = events)))
        .then(factory.Main.busy("Loading Bookings"));
      
    },
    
  };
  
  FN.booking = event => {
    event.what = options.functions.calendar.resources(event);
    event.who = options.functions.calendar.who(event);
    event.when = options.functions.calendar.time(event);
    event.date = options.functions.calendar.date(event);
    factory.Flags.log("Loan from Shortcut", event);
    return !event.extendedProperties || !event.extendedProperties.private || !event.extendedProperties.private.STATUS ?
      FN.log.out(event.id, event) : event.extendedProperties.private.STATUS == options.loaned ?
      FN.log.in(event.id, event) : false;
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    booking: (calendar, id) => FN.data.event(calendar, id)
      .then(event => options.state.application.resources.safe()
            .then(() => factory.Main.authorise([SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_FILE]))
            .then(result => result === true ? FN.booking(event) : false)),
    
    bookings: () => FN.data.admin()
      .then(FN.empty)
      .then(FN.data.resources)
      .then(FN.render.manage)
      .then(FN.hookup.toggles)
      .then(FN.hookup.resources)
      .then(FN.hookup.search)
      .then(FN.hookup.shortcut)
      .then(() => $("#shortcut_Text").focus()),
      
    in: (id, log) => log ? FN.log.in(id) : FN.confirm.in(id),
      
    out: (id, log) => log ? FN.log.out(id) : FN.confirm.out(id),

    refresh: FN.render.refresh,
    
    remove: FN.confirm.remove,
    
  };
  /* <!-- External Visibility --> */

};