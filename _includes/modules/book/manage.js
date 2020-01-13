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
        feature: "FEATURE_NAME",
        permission: "PERMISSION",
        notification: "NOTIFICATION"
      },
      loaned: "LOANED",
      returned: "RETURNED",
      notifications: {
        types: [
          {
            id: "eventCreation",
            name: "When Bookings are Created"
          },
          {
            id: "eventChange",
            name: "When Bookings are Changed"
          },
          {
            id: "eventCancellation",
            name: "When Bookings are Cancelled"
          },
          {
            id: "agenda",
            name: "Daily Summary of Bookings"
          },
        ],
      },
      permissions: {
        types: [
          {
            id: "default",
            name: "Public Access",
            disables: "value"
          },
          {
            id: "user",
            name: "User Access",
          },
          {
            id: "group",
            name: "Group Access",
          },
          {
            id: "domain",
            name: "Domain Access",
          },
        ],
        roles: [
          {
            id: "none",
            name: "No Access",
          },
          {
            id: "freeBusyReader",
            name: "Access to Free/Busy Information",
          },
          {
            id: "reader",
            name: "Read Access to Events",
          },
          {
            id: "writer",
            name: "Write Access to Calendar Events",
          },
          {
            id: "owner",
            name: "Owner Access to Resource Calendar",
          },
        ],
      }
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
      dialog: factory.Dialog({}, factory),
    },
    /* <!-- State --> */
    ಱ = {
      db: new loki("manage.db"),
    }; /* <!-- Persistant --> */
  /* <!-- Internal Variables --> */

  /* <!-- Notification Function --> */
  FN.notification = (title, instructions, command, success) => factory.Display.modal("edit_notification", {
            target: factory.container,
            id: options.id.notification,
            title: title,
            instructions: factory.Display.doc.get({
                        name: instructions,
                        content: !ರ‿ರ.calendars || !ರ‿ರ.calendars.length ? 
                          "NO Resources Selected" : `${ರ‿ರ.calendars.length} Resource${ರ‿ರ.calendars.length > 1 ? "s" : ""} Selected`
                      }),
            confirm: command,
            types: options.notifications.types
          }, dialog => {
            factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {
              trigger: "hover"
            });
            ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
          }).then(data => data ? success(data) : false);
  /* <!-- Notification Function --> */
  
  /* <!-- Permission Function --> */
  FN.permission = (roles, types, role, type, title, instructions, success) => factory.Display.modal("edit_permission", _.extend({
            target: factory.container,
            id: options.id.permission,
            title: title,
            instructions: factory.Display.doc.get({
                        name: instructions,
                        content: !ರ‿ರ.calendars || !ರ‿ರ.calendars.length ? 
                          "NO Resources Selected" : `${ರ‿ರ.calendars.length} Resource${ರ‿ರ.calendars.length > 1 ? "s" : ""} Selected`
                      }),
            confirm: "Save",
            handlers: {
              clear: ರ‿ರ.dialog.handlers.clear,
            },
          }, {
            roles: roles,
            types: types,
            state: {
              role: role,
              type: type,
            }
          }), dialog => {
            factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {
              trigger: "hover"
            });
            ರ‿ರ.dialog.handlers.selected(dialog);
            ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
          }).then(data => {
            if (data === undefined || !ರ‿ರ.calendars || !ರ‿ರ.calendars.length) return;
            factory.Flags.log("Data returned from Permission Dialog:", data);
            var _acl = {
              role : data.Role.Value,
              scope : {
                type : data.Type.Value,
                value : data.Value && data.Role.Value != "default" ? data.Value.Value : ""
              }
            };
            return Promise.all(_.map(ರ‿ರ.calendars, calendar => factory.Google.calendar.permissions.create(calendar.id, _acl)
                .then(result => result && success ? success(result, calendar) : result)))
              .then(factory.Main.busy("Updating Permissions"));
            
          });
  /* <!-- Permission Function --> */
  
  /* <!-- Add Functions --> */
  FN.add = {
    
    notification: () => FN.notification("Create Notification", "CREATE_NOTIFICATION_INSTRUCTIONS", "Save",
      data => Promise.all(_.map(ರ‿ರ.calendars, calendar => {
      
        var _absent = $(`[data-id='${calendar.id}'][data-type='absent']`),
            _holder = $(`[data-id="${calendar.id}"] .content-holder .notifications-holder`),
            _add = ((id, type) => result => {
              _absent.length > 0 ? _absent.remove() : false;
              return result ? 
                (_holder.length > 0 ? _holder : $(`[data-id="${id}"] .content-holder`)).prepend(factory.Display.template.get({
                  template: "notification",
                  calendar: id,
                  addition: _holder.length > 0,
                  notifications: [{
                    method: "email",
                    type: type,
                  }],
                }, true)) : false;
            })(calendar.id, data.Type.Value);
      
        return _absent.length > 0 ?
          factory.Google.calendars.add(calendar.id, {
            hidden: true,
            notificationSettings: {
              notifications: [{
                method: "email",
                type: data.Type.Value,
              }]
            }}).then(_add) : 
            factory.Google.calendars.notifications(calendar.id).then(notifications => (notifications.notificationSettings && 
              _.find(notifications.notificationSettings.notifications, notification => notification.type == data.Type.Value)) ?
                Promise.resolve() :
                factory.Google.calendars.update(calendar.id, {
                  notificationSettings: {
                    notifications: [{
                      method: "email",
                      type: data.Type.Value,
                    }].concat(notifications.notificationSettings ? notifications.notificationSettings.notifications : [])
                  }}).then(_add));
    })).then(factory.Main.busy("Updating Notifications"))),
    
    permission: () => FN.permission(options.permissions.roles, options.permissions.types, "writer", "group", 
                                      "Create Permission", "CREATE_PERMISSION_INSTRUCTIONS",
                                   (result, calendar) => $(`[data-id="${calendar.id}"] .permissions-holder`)
                                      .prepend(factory.Display.template.get(_.extend({
                                        template: "perm",
                                        calendar: calendar.id,
                                      }, result), true))),
    
  };
  /* <!-- Add Functions --> */
  
  /* <!-- Remove Functions --> */
  FN.remove = {
    
    notification: (calendar, type) => factory.Google.calendars.notifications(calendar)
      .then(factory.Main.busy("Loading Notifications"))
      .then(notifications => {
        return factory.Display.confirm({
          id: "delete_Notification",
          target: factory.container,
          message: factory.Display.doc.get({
                        name: "CONFIRM_NOTIFICATION_DELETE",
                        content: type
                      }),
          enter: true,
          action: "Remove"
        })
        .then(confirm => confirm ? 
              factory.Google.calendars.update(calendar, {
                notificationSettings: {
                  notifications: _.reject(notifications.notificationSettings.notifications, notification => notification.type == type)
                }
              })
                .then(factory.Main.busy("Deleting Notification"))
                .then(result => result ? $(document.getElementById(`${calendar}.${type}`)).remove() : false) : false);
      }),
    
    notifications: () => FN.notification("Remove Notification", "DELETE_NOTIFICATION_INSTRUCTIONS", "Remove",
      data => Promise.all(_.map(ರ‿ರ.calendars, calendar => $(`[data-id='${calendar.id}'][data-type='absent']`).length > 0 ? 
          Promise.resolve() : 
          factory.Google.calendars.notifications(calendar.id)
            .then(notifications => (notifications.notificationSettings && 
              _.find(notifications.notificationSettings.notifications, notification => notification.type == data.Type.Value)) ?
                factory.Google.calendars.update(calendar.id, {
                    notificationSettings: {
                      notifications: _.reject(notifications.notificationSettings.notifications, 
                                              notification => notification.type == data.Type.Value)
                    }
                  }).then(result => result ? $(document.getElementById(`${calendar.id}.${data.Type.Value}`)).remove() : false) :
                Promise.resolve())
      )).then(factory.Main.busy("Deleting Notifications"))),
    
    permission: (calendar, id) => factory.Google.calendar.permissions.get(calendar, id)
      .then(factory.Main.busy("Loading Rule"))
      .then(permission => {
        if (!permission) return;
        return factory.Display.confirm({
          id: "delete_Permission",
          target: factory.container,
          message: factory.Display.doc.get({
                        name: "CONFIRM_PERMISSION_DELETE",
                        content: `${permission.scope.value} (Role: ${permission.role})`
                      }),
          enter: true,
          action: "Delete"
        })
        .then(confirm => confirm ? 
              factory.Google.calendar.permissions.delete(calendar, id)
                .then(factory.Main.busy("Deleting Rule"))
                .then(result => result ? $(document.getElementById(`${calendar}.${id}`)).remove() : false) : 
              false);
      }),
    
    permissions: () => FN.permission(_.filter(options.permissions.roles, role => role.id == "none"), options.permissions.types, "none",
                        "group", "Remove Permission", "DELETE_PERMISSION_INSTRUCTIONS", 
                        (result, calendar) => $(`[data-id="${calendar.id}"] .permissions-holder [data-id="${result.id}"]`).remove()),
    
  };
  /* <!-- Remove Functions --> */
  
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
  
  FN.detoggle = resources => {
    _.each(resources, resource => resource.toggled ? delete resource.toggled : resource.children ? FN.detoggle(resource.children) : null);
    ರ‿ರ.calendars = [];
    return resources;
  };
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
      .concat(data.Parents ? _.isArray(data.Parents.Values) ? data.Parents.Values : [data.Parents.Values] : []), value => ({
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

  FN.simple = (template, name, help) => options.functions.source.resources()
    .then(FN.detoggle)
    .then(resources => options.functions.render.simple(template, options.id.manage, name, "", help, {
      data: resources,
      selectable: (ರ‿ರ.selectable = true),
      simple: (ರ‿ರ.simple = true),
      all: (ರ‿ರ.all = true)
    }))
    .then(FN.hookup.toggle)
    .then(FN.hookup.resource)
    .then(FN.hookup.search)
    .then(() => $("#search_Text").focus());
  
  FN.permissions = () => FN.simple("permissions", "Permissions", "manage.permissions");
  
  FN.notifications = () => FN.simple("notifications", "Notifications", "manage.notifications");
  
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
    if (!command) return;
    factory.Flags.log("RUN SHORTCUT", command);
    var _command = command.indexOf("?") >= 0 ? command.split("?") :
      command.indexOf("#") >= 0 ? command.split("#") :
      null;
    if (_command) {
      window.location.hash = _command[_command.length - 1];
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

    add: (action, field, template, id, title, message, add) => () => {

      var _select = $(`select[data-action='${action}']`),
        _value = _select.children("option:selected"),
        _add = (name, display) => {
          var _fields = $(`[data-output-field='${field}']`);
          if (!_.find(_fields.children("span.badge"),
              field => String.equal($(field).children("span").text(), display, true))) {
            _fields.append(factory.Display.template.get({
              template: template,
              id: $("input[type='hidden'][data-output-field='ID']").val(),
              name: name,
              display: display
            }));
            _select.val("");
          }
        };

      _value && _value.val() ? _add(_value.val(), _value.text()) : options.state.application.resources.safe()
        .then(resources => factory.Display.text({
          id: id,
          title: title,
          message: factory.Display.doc.get(message),
          validate: value => value,
          simple: true
        }).then(name => {
          if (!name) return name;
          add(name, (value, display) => $("<option />", {
            value: value,
            text: display
          }).appendTo($(`select[data-action='${action}']`)), resources).then(value => _add(value.name, value.display));
        }).catch(e => e ? factory.Flags.error("Adding Error", e) : null));

    },

    search: e => options.functions.render.search("resources", ರ‿ರ.selectable, ರ‿ರ.simple, ರ‿ರ.all)(FN.action.target(e).val())
      .then(FN.hookup.toggle)
      .then(ರ‿ರ.selectable ? FN.hookup.resource : FN.hookup.edit),

    edit: e => {

      /* <!-- Click selector should favour currentTarget --> */
      var target = $(e.currentTarget || e.target),
        id = target.data("id"),
        group = target.data("group"),
        resource = options.state.application.resources.get(id || group);

      factory.Flags.log("Editing Resource:", resource);

      return group ?
        Promise.resolve(true) :
        options.state.application.resources.safe().then(resources => {
          var _parents = resources.parents();
          return factory.Display.modal("edit", _.extend({
            target: factory.container,
            id: options.id.edit,
            title: "Edit Resource",
            instructions: factory.Display.doc.get("EDIT_INSTRUCTIONS"),
            confirm: "Save",
            handlers: {
              clear: ರ‿ರ.dialog.handlers.clear,
            },
            actions: [{
              text: "Delete",
              handler: (data, dialog) => factory.Display.confirm({
                  id: "delete_Resource",
                  target: factory.container,
                  message: factory.Display.doc.get("DELETE_RESOURCE"),
                  action: "Delete"
                })
                .then(confirm => confirm && data.ID ? (dialog.modal("hide"), factory.Google.resources.calendars.delete(data.ID.Value)
                  .then(result => result === true ? (resources.remove.resource(data.ID.Value), FN.resources()) : result)
                  .then(factory.Main.busy("Deleting Resource"))) : false)
                .catch(e => e ? factory.Flags.error("Resource Delete Error", e) : false)
            }],
          }, {
            parents: _parents,
            features: resources.features(),
            state: {
              id: resource.id,
              name: resource.name || "",
              type: resource.type || "",
              description: resource.description || "",
              user_description: resource.details || "",
              parent: resource.parent || "",
              parents: resource.parents ? _.map(resource.parents, parent => _.find(_parents, value => value.name == parent)) : [],
              features: resource.features ? _.map(resource.features, feature => ({
                name: feature,
                display: feature
              })) : [],
            }
          }), dialog => {
            factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {
              trigger: "hover"
            });
            ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
          }).then(data => {
            if (data === undefined) return;
            factory.Flags.log("Data returned from Edit Dialog:", data);
            return factory.Google.resources.calendars.update(data.ID.Value, FN.resource(data))
              .then(result => result ? (resources.update.resource(result), FN.resources()) : result)
              .then(factory.Main.busy("Updating Resource"));
          });
        });
    },

    toggle: e => {

      var target = FN.action.target(e),
        parent = target.parents(".list-group"),
        checks = parent.find("input.custom-control-input[type='checkbox']");

      var added = [],
        removed = [];

      _.each(checks, check => {
        
        check = $(check);
        var id = check.data("id") || check.data("group"),
          name = check.data("name"),
          toggled = check.prop("checked"),
          resource = options.state.application.resources.get(id);

        if ((!resource.toggled && toggled) || (resource.toggled && !toggled))(resource.toggled = toggled) ?
          (added.push(id), ರ‿ರ.calendars.push({
            id: id,
            name: name
          })) :
          (removed.push(id), ರ‿ರ.calendars = _.reject(ರ‿ರ.calendars, calendar => calendar.id == id));

      });

      if (added.length > 0) factory.Flags.log("Toggled Resources:", added);
      if (removed.length > 0) factory.Flags.log("DE-Toggled Resources:", removed);
      factory.Flags.log("Selected Calendars:", ರ‿ರ.calendars);

      if (factory.Display.state().in(options.functions.states.manage.bookings)) {

        var _get = id => options.functions.source.events(id).then(events => FN.process(id, events)),
            _added = data => added.length > 2 ?
            options.functions.source.busy(added)
              .then(busy => Promise.all(_.map(_.chain(busy.calendars).pairs().filter(value => value[1] && value[1].busy && value[1].busy.length).map(value => value[0]).value(), _get))
              .then(sets => data.concat(_.chain(sets).flatten().compact().value()))) : 
                Promise.all(_.map(added, _get)).then(sets => data.concat(_.chain(sets).flatten().compact().value())),
                  _removed = data => _.reject(data, event => removed.indexOf(event.calendar) >= 0);
       
        Promise.resolve(ರ‿ರ.data)
          .then(data => added.length ? _added(data) : data)
          .then(data => removed.length ? _removed(data) : data)
          .then(FN.access)
          .then(data => {
            factory.Flags.log("Calendar Events:", data);
            options.functions.render.table(options.id.manage)(FN.populate.events(options.functions.source.dedupe(ರ‿ರ.data = data)));
          })
          .then(factory.Main.busy("Loading Bookings"));

      } else if (factory.Display.state().in(options.functions.states.manage.permissions)) {

        if (removed.length) _.each(removed, calendar => $(`[data-id='${calendar}'] div.content-holder div.permissions-holder`).remove());

        added.length ? Promise.resolve(added)
          .then(calendars => Promise.all(_.map(calendars, 
            calendar => options.functions.source.permissions(calendar)
              .then(permissions => {
                var _row = $(`[data-id='${calendar}'] div.content-holder`);
                _row.find("div.permissions-holder").remove();
                _row.prepend(factory.Display.template.get({
                  template: "perms",
                  id: calendar,
                  permissions: permissions,
                }, true));
              }))))
          .then(factory.Main.busy("Loading Permissions")) : 
        factory.Flags.log("No Calendars Toggled");
      
      } else if (factory.Display.state().in(options.functions.states.manage.notifications)) {
       
        if (removed.length) _.each(removed, calendar => $(`[data-id='${calendar}'] div.content-holder div.notifications-holder`).remove());
        
        added.length ? Promise.resolve(added)
          .then(calendars => Promise.all(_.map(calendars, 
            calendar => options.functions.source.notifications(calendar)
              .then(notification => {
                var _row = $(`[data-id='${calendar}'] div.content-holder`);
                _row.find("div.notifications-holder").remove();
                if (notification === false) {
                  _row.prepend(factory.Display.template.get({
                    template: "absent",
                    calendar: calendar,
                  }, true));
                } else if (notification && notification.notificationSettings) {
                  _row.prepend(factory.Display.template.get({
                    template: "notification",
                    calendar: calendar,
                    notifications: notification.notificationSettings.notifications
                  }, true));
                }
              }))))
          .then(factory.Main.busy("Loading Notifications")) : 
        factory.Flags.log("No Calendars Toggled");
        
      }

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
        _.chain((target.is(".resource-group-header") ? target.parents(".list-group") : target.is(".resource-group, .resource-group-name") ? target.parents(".list-group-item") : target.is(".resource-item") ?
          target : target.parents(".resource-item")).find("input.custom-control-input"))
        .map(checkbox => $(checkbox))
        .each(checkbox => checkbox.prop("checked", !checkbox.prop("checked")).change());
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
        return options.state.application.resources.safe().then(resources => factory.Display.modal("edit", {
          target: factory.container,
          id: options.id.add,
          title: "Add New Resource",
          instructions: factory.Display.doc.get("ADD_INSTRUCTIONS"),
          confirm: "Add",
          handlers: {
            clear: ರ‿ರ.dialog.handlers.clear,
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
          ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
        }).then(data => {
          if (data === undefined || !data.Name) return;
          factory.Flags.log("Data returned from Add Dialog:", data);
          return factory.Google.resources.calendars.insert(FN.resource(data))
            .then(result => result ? (resources.add.resource(result), FN.resources()) : result)
            .then(factory.Main.busy("Creating Resource"));
        }));
      },

      parent: FN.action.add("parent", "Parents", "parent", options.id.parent, "Parent / Group Name", "ADD_PARENT_INSTRUCTIONS",
        (name, add, resources) => {
          var _existing = _.find(resources.parents(), parent => String.equal(parent.name, name, true));
          return (_existing ? Promise.resolve({
            name: _existing.id,
            display: _existing.name
          }) : factory.Google.resources.features.insert(name = resources.format(name)).then(parent => {
            var _name = parent.name,
              _display = resources.extract(parent.name);
            add(_name, _display);
            resources.add.feature(_name);
            return {
              name: _name,
              display: _display
            };
          }));
        }),

      feature: FN.action.add("feature", "Features", "feature", options.id.feature, "Feature Name", "ADD_FEATURE_INSTRUCTIONS",
        (name, add, resources) => {
          var _existing = _.find(resources.features(), feature => String.equal(feature, name, true));
          return (_existing ? Promise.resolve({
            name: _existing,
            display: _existing
          }) : factory.Google.resources.features.insert(name).then(feature => {
            add(feature.name, feature.name);
            resources.add.feature(feature.name);
            return {
              name: feature.name,
              display: feature.name
            };
          }));
        }),

      permission: FN.add.permission,
      
      notification: FN.add.notification,
      
    },

    booking: (calendar, id) => options.functions.source.event(calendar, id)
      .then(event => options.state.application.resources.safe()
        .then(() => factory.Main.authorise([SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_FILE]))
        .then(result => result === true ? FN.booking(event) : false)),

    bookings: () => FN.admin()
      .then(FN.empty)
      .then(options.functions.source.resources)
      .then(FN.detoggle)
      .then(options.functions.render.view("manage", options.id.manage, "Manage", "manage", ರ‿ರ.selectable = true, ರ‿ರ.simple = true, ರ‿ರ.all = true))
      .then(FN.hookup.toggle)
      .then(FN.hookup.resource)
      .then(FN.hookup.search)
      .then(FN.hookup.shortcut)
      .then(() => $("#shortcut_Text").focus()),

    notifications: FN.notifications,
    
    permissions: FN.permissions,

    in: (id, log) => log ? FN.log.in(id) : FN.confirm.in(id),

    out: (id, log) => log ? FN.log.out(id) : FN.confirm.out(id),

    refresh: options.functions.render.refresh(options.id.manage, FN.refresh),

    remove: {

      tag: FN.confirm.remove,

      feature: (id, feature) => $(`[data-id='${id}'][data-feature='${feature}']`).remove(),

      parent: (id, parent) => $(`[data-id='${id}'][data-parent='${parent}']`).remove(),
      
      permission: (calendar, id) => calendar && id ? FN.remove.permission(calendar, id) : FN.remove.permissions(),
      
      notification: (calendar, type) => calendar && type ? FN.remove.notification(calendar, type) : FN.remove.notifications(),

    },

    resources: FN.resources,

  };
  /* <!-- External Visibility --> */

};