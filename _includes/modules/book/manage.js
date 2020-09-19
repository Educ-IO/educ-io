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
        types: [{
          id: "eventCreation",
          name: "When Bookings are Created"
        }, {
          id: "eventChange",
          name: "When Bookings are Changed"
        }, {
          id: "eventCancellation",
          name: "When Bookings are Cancelled"
        }, {
          id: "agenda",
          name: "Daily Summary of Bookings"
        }, ],
      },
      permissions: {
        types: [{
          id: "default",
          name: "Public Access",
          disables: "value"
        }, {
          id: "user",
          name: "User Access",
        }, {
          id: "group",
          name: "Group Access",
        }, {
          id: "domain",
          name: "Domain Access",
        }, ],
        roles: [{
          id: "none",
          name: "No Access",
        }, {
          id: "freeBusyReader",
          name: "Access to Free/Busy Information",
        }, {
          id: "reader",
          name: "Read Access to Events",
        }, {
          id: "writer",
          name: "Write Access to Calendar Events",
        }, {
          id: "owner",
          name: "Owner Access to Resource Calendar",
        }],
      }
    }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Scope Constants --> */
  const SCOPE_DRIVE_FILE = "https://www.googleapis.com/auth/drive.file", SCOPE_DRIVE_APPDATA = "https://www.googleapis.com/auth/drive.appdata";
  /* <!-- Scope Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {
    calendars: [],
    data: [],
    dialog: factory.Dialog({}, factory),
  }; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  FN.instructions = (instructions, content) => factory.Display.doc.get({
    name: instructions,
    content: content || (!ರ‿ರ.calendars || !ರ‿ರ.calendars.length ? "NO Resources Selected" : `${ರ‿ರ.calendars.length} Resource${ರ‿ರ.calendars.length > 1 ? "s" : ""} Selected`)
  });

  /* <!-- Notification Function --> */
  FN.notification = (title, instructions, command, success) => factory.Display.modal("edit_notification", {
      target: factory.container,
      id: options.id.notification,
      title: title,
      instructions: FN.instructions(instructions),
      action: command,
      types: options.notifications.types
    }, FN.action.dialog).then(data => data ? success(data) : false);
  /* <!-- Notification Function --> */

  /* <!-- Permission Function --> */
  FN.permission = (roles, types, role, type, title, instructions, action, notify, success) => factory.Display.modal("edit_permission", {
      target: factory.container,
      id: options.id.permission,
      title: title,
      instructions: FN.instructions(instructions),
      action: action,
      notify: notify,
      handlers: {clear: ರ‿ರ.dialog.handlers.clear},
      roles: roles,
      types: types,
      state: {
        role: role,
        type: type,
      }
    }, dialog => ರ‿ರ.dialog.handlers.selected(FN.action.dialog(dialog)))
    .then(data => {
      if (data === undefined || !ರ‿ರ.calendars || !ರ‿ರ.calendars.length) return;
      factory.Flags.log("Data returned from Permission Dialog:", data);
      var _acl = {
          role: data.Role.Value,
          scope: {
            type: data.Type.Value,
            value: data.Value && data.Role.Value != "default" ? data.Value.Value : ""
          }
        },
        _notify = data.Notify && data.Notify.Value;
      return Promise.all(_.map(ರ‿ರ.calendars, calendar => factory.Google.calendar.permissions.create(calendar.id, _acl, _notify)
          .then(result => result && success ? success(result, calendar) : result)))
        .then(factory.Main.busy("Updating Permissions"));

    });
  /* <!-- Permission Function --> */

  /* <!-- Action Functions --> */
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

    search: e => (factory.Display.state().in(options.functions.states.manage.bundles.in) ? FN.action.searching.bundles : FN.action.searching.resources)(FN.action.target(e).val()),

    searching: {

      resources: value => options.functions.render.search.resources(value, "resources", ರ‿ರ.selectable, ರ‿ರ.simple, ರ‿ರ.all)
        .then(ರ‿ರ.toggleable ? FN.hookup.toggle : _.constant)
        .then(ರ‿ರ.selectable ? FN.hookup.resource : FN.hookup.edit),

      bundles: value => options.functions.render.search.bundles(value, true, "bundles", true).then(FN.hookup.edit),

    },

    edit: e => {

      /* <!-- Click selector should favour currentTarget --> */
      var target = $(e.currentTarget || e.target);

      return factory.Display.state().in(options.functions.states.manage.bundles.in) ?
        FN.action.editing.bundles(target, target.data("bundle"), target.data("part")) : !target.data("group") ?
        FN.action.editing.resource(target, options.state.application.resources.get(target.data("id"))) : null;

    },

    editing: {

      resource: (target, resource) => options.state.application.resources.safe().then(resources => {
        var _parents = resources.parents(),
          _bundles = resources.bundles();
        return factory.Display.modal("edit", {
          target: factory.container,
          id: options.id.edit,
          title: "Edit Resource",
          instructions: factory.Display.doc.get("EDIT_INSTRUCTIONS"),
          action: "Save",
          handlers: {clear: ರ‿ರ.dialog.handlers.clear},
          actions: [{
            text: "Delete",
            handler: (data, dialog) => factory.Display.confirm({
                id: "delete_Resource",
                target: factory.container,
                message: factory.Display.doc.get("DELETE_RESOURCE"),
                action: "Delete"
              })
              .then(confirm => confirm && data.ID ? (dialog.modal("hide"), factory.Google.resources.calendars.delete(data.ID.Value)
                .then(result => result === true ? (resources.remove.resource(data.ID.Value), FN.view.resources()) : result)
                .then(factory.Main.busy("Deleting Resource"))) : false)
              .catch(e => e ? factory.Flags.error("Resource Delete Error", e) : false)
          }],
          bundles: _bundles,
          parents: _parents,
          features: resources.features(),
          state: {
            id: resource.id,
            name: resource.name || "",
            type: resource.type || "",
            description: resource.description || "",
            user_description: resource.details || "",
            parent: resource.parent || "",
            bundles: resource.bundles ? _.map(resource.bundles, bundle => _.find(_bundles, value => value.name == bundle.name)) : [],
            parents: resource.parents ? _.map(resource.parents, parent => _.find(_parents, value => value.name == parent)) : [],
            features: resource.features ? _.map(resource.features, feature => ({
              name: feature,
              display: feature
            })) : [],
          }
        }, FN.action.dialog).then(data => {
          if (data === undefined) return;
          factory.Flags.log("Data returned from Edit Dialog:", data);
          return factory.Google.resources.calendars.update(data.ID.Value, options.state.application.resources.parse(data))
            .then(result => result ? (resources.update.resource(result), FN.view.resources()) : result)
            .then(factory.Main.busy("Updating Resource"));
        });
      }),

      bundles: (target, name, part) => {

        /* <!-- Highlight Selected Element --> */
        var classes = ["border", "border-emphasis", "rounded", "bg-light", "px-2"];
        target.parents("#bundles").find(`.${classes.join(".")}`).removeClass(classes.join(" "));
        target.addClass(classes.join(" "));

        /* <!-- Get Target and Clean out Existing Forms --> */
        var _target = $("#details").removeClass("d-none");
        _target.find("form").toggleClass("d-none", true).empty();

        return options.functions.source.bundles(null, true)
          .then(bundles => ರ‿ರ.bundle = _.find(bundles, bundle => String.equal(bundle.name, name, true)))
          .then(bundle => part !== null && part !== undefined ?
            FN.action.editing.part(_target, ರ‿ರ.part = bundle.children[part = parseInt(part, 10)])
            .then(() => factory.Display.state().change(options.functions.states.manage.bundles.bundle, options.functions.states.manage.bundles.part)) :
            FN.action.editing.bundle(_target, bundle)
            .then(() => factory.Display.state().change(options.functions.states.manage.bundles.part, options.functions.states.manage.bundles.bundle)));

      },

      bundle: (target, bundle) => {

        factory.Display.doc.show({
          name: "EDIT_BUNDLE_INSTRUCTIONS",
          target: target.find("#instructions"),
          clear: true
        });

        target.find(".btn-danger").toggleClass("d-none", !bundle);

        return Promise.resolve(factory.Display.template.show({
          template: "details",
          state: bundle,
          clear: true,
          target: target.find("#bundle").removeClass("d-none")
        }));

      },

      part: (target, part) => options.functions.source.resources()
        .then(FN.action.detoggle)
        .then(resources => {
          var _toggle = (resources, parent) => {
            _.each(resources, resource => resource.children ?
              _toggle(resource.children, resource) :
              _.find(part.children, value => value.id == resource.id) ?
              (resource.toggled = true, parent ? parent.expanded = true : null) : delete resource.toggled);
            return resources;
          };
          return _toggle(resources);
        })
        .then(resources => {
          factory.Display.doc.show({
            name: "EDIT_PART_INSTRUCTIONS",
            target: target.find("#instructions"),
            clear: true
          });
          return factory.Display.template.show({
            template: "resources",
            resources: resources,
            simple: true,
            condensed: true,
            selectable: true,
            clear: true,
            target: target.find("#resources").removeClass("d-none")
          });
        })
        .then(FN.hookup.toggle)
        .then(FN.hookup.resource),

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

        if ((!resource.toggled && toggled) || (resource.toggled && !toggled)) {
          resource.toggled = toggled;
          resource.toggled ?
            (added.push(id), ರ‿ರ.calendars.push({
              id: id,
              name: name
            })) :
            (removed.push(id), ರ‿ರ.calendars = _.reject(ರ‿ರ.calendars, calendar => calendar.id == id)); 
        }
      });

      if (added.length > 0) factory.Flags.log("Toggled Resources:", added);
      if (removed.length > 0) factory.Flags.log("DE-Toggled Resources:", removed);
      factory.Flags.log("Selected Calendars:", ರ‿ರ.calendars);

      if (factory.Display.state().in(options.functions.states.manage.bookings)) {

        var _get = id => options.functions.source.events(id).then(events => options.functions.populate.calendar(id, events)),
          _added = data => added.length > 2 ?
          options.functions.source.busy(added)
          .then(busy => Promise.all(_.map(_.chain(busy.calendars).pairs().filter(value => value[1] && value[1].busy && value[1].busy.length).map(value => value[0]).value(), _get))
            .then(sets => data.concat(_.chain(sets).flatten().compact().value()))) :
          Promise.all(_.map(added, _get)).then(sets => data.concat(_.chain(sets).flatten().compact().value())),
          _removed = data => _.reject(data, event => removed.indexOf(event.calendar) >= 0);

        Promise.resolve(ರ‿ರ.data)
          .then(data => added.length ? _added(data) : data)
          .then(data => removed.length ? _removed(data) : data)
          .then(options.functions.access.access)
          .then(data => {
            factory.Flags.log("Calendar Events:", data);
            options.functions.render.table(options.id.manage)(options.functions.populate.events(options.functions.source.dedupe(ರ‿ರ.data = data)));
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

    detoggle: resources => {
      _.each(resources, resource => resource.toggled ? delete resource.toggled : resource.children ? FN.action.detoggle(resource.children) : null);
      ರ‿ರ.calendars = [];
      return resources;
    },

    shortcut: e => {
      if (e.keyCode === 13) {
        var _target = FN.action.target(e),
          _val = _target.val();
        if (_val) {
          factory.Flags.log("RUN SHORTCUT", _val);
          var _command = _val.indexOf("?") >= 0 ? _val.split("?") :
            _val.indexOf("#") >= 0 ? _val.split("#") :
            null;
          if (_command) {
            window.location.hash = _command[_command.length - 1];
            _target.val("");
          }
        }
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
    },

    booking: (calendar, id) => options.functions.source.event(calendar, id)
      .then(event => options.state.application.resources.safe()
        .then(() => factory.Main.authorise([SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_FILE]))
        .then(result => {
          if (result === true) {
            event = options.functions.populate.event(event);
            factory.Flags.log("Loan from Shortcut", event);
            return !event.extendedProperties || !event.extendedProperties.private || !event.extendedProperties.private.STATUS ?
              FN.log.out(event.id, event) : event.extendedProperties.private.STATUS == options.loaned ?
              FN.log.in(event.id, event) : false;
          } else {
            return false;
          }
        })),

    refresh: () => options.functions.source.busy(_.pluck(ರ‿ರ.calendars, "id"))
      .then(busy => Promise.all(_.map(_.chain(busy.calendars).pairs().filter(value => value[1] && value[1].busy && value[1].busy.length).map(value => value[0]).value(), calendar => options.functions.source.events(calendar).then(events => options.functions.populate.calendar(calendar, events)))))
      .then(results => _.flatten(results))
      .then(options.functions.access.access)
      .then(events => options.functions.render.table(options.id.manage)(options.functions.populate.events(options.functions.source.dedupe(ರ‿ರ.data = events))))
      .then(factory.Main.busy("Loading Bookings")),

    dialog: dialog => {
      factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {trigger: "hover"});
      ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
      return dialog;
    },

  };
  /* <!-- Action Functions --> */

  /* <!-- Add Functions --> */
  FN.add = {

    resource: () => options.state.application.resources.safe().then(resources => factory.Display.modal("edit", {
      target: factory.container,
      id: options.id.add,
      title: "Add New Resource",
      instructions: factory.Display.doc.get("ADD_INSTRUCTIONS"),
      action: "Add",
      handlers: {clear: ರ‿ರ.dialog.handlers.clear},
      parents: resources.parents(),
      features: resources.features(),
      state: {
        id: uuid.v4(),
      }
    }, FN.action.dialog).then(data => {
      if (data === undefined || !data.Name) return;
      factory.Flags.log("Data returned from Add Dialog:", data);
      return factory.Google.resources.calendars.insert(options.state.application.resources.parse(data))
        .then(result => result ? (resources.add.resource(result), FN.view.resources()) : result)
        .then(factory.Main.busy("Creating Resource"));
    })),
    
    features: (add, resources, name, display) => {
      add(name, display);
      resources.add.feature(name);
      return {
        name: name,
        display: display
      };
    },

    parent: FN.action.add("parent", "Parents", "parent", options.id.parent, "Parent / Group Name", "ADD_PARENT_INSTRUCTIONS",
      (name, add, resources) => {
        var _existing = _.find(resources.parents(), parent => String.equal(parent.name, name, true));
        return (_existing ? Promise.resolve({
          name: _existing.id,
          display: _existing.name
        }) : factory.Google.resources.features.insert(name = resources.format.parent(name)).then(parent => FN.add.features(add, resources, parent.name, resources.extract.parent(parent.name))));
      }),

    feature: FN.action.add("feature", "Features", "feature", options.id.feature, "Feature Name", "ADD_FEATURE_INSTRUCTIONS",
      (name, add, resources) => {
        var _existing = _.find(resources.features(), feature => String.equal(feature, name, true));
        return (_existing ? Promise.resolve({
          name: _existing,
          display: _existing
        }) : factory.Google.resources.features.insert(name).then(feature => FN.add.features(add, resources, feature.name, feature.name)));
      }),

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
            }
          }).then(_add) :
          factory.Google.calendars.notifications(calendar.id).then(notifications => (notifications.notificationSettings &&
              _.find(notifications.notificationSettings.notifications, notification => notification.type == data.Type.Value)) ?
            Promise.resolve() :
            factory.Google.calendars.update(calendar.id, {
              notificationSettings: {
                notifications: [{
                  method: "email",
                  type: data.Type.Value,
                }].concat(notifications.notificationSettings ? notifications.notificationSettings.notifications : [])
              }
            }).then(_add));
      })).then(factory.Main.busy("Updating Notifications"))),

    permission: () => FN.permission(options.permissions.roles, options.permissions.types, "writer", "group",
      "Create Permission", "CREATE_PERMISSION_INSTRUCTIONS", "Save", true,
      (result, calendar) => $(`[data-id="${calendar.id}"] .permissions-holder`)
      .prepend(factory.Display.template.get(_.extend({
        template: "perm",
        calendar: calendar.id,
      }, result), true))),

    bundle: () => {
      var _target = $("#details").removeClass("d-none");
      _target.find("form").toggleClass("d-none", true).empty();
      delete ರ‿ರ.bundle;
      delete ರ‿ರ.part;
      return FN.action.editing.bundle(_target);
    },

    part: (sequence, quantity, total, previous) => factory.Display.modal("edit_part", {
      target: factory.container,
      id: options.id.add,
      title: sequence ? "Edit Bundle Part" : "Add New Bundle Part",
      instructions: factory.Display.doc.get("ADD_PART_INSTRUCTIONS"),
      action: sequence ? "Update" : "Add",
      quantity: quantity ? quantity : 1,
      sequence: sequence,
      total: total,
      previous: previous,
      end: $("#bundle div.part").length + (sequence ? 0 : 1),
    }, FN.action.dialog).then(data => {
      if (!data) return;

      var _target = data.ID ?
        $(`#bundle [data-output-field='Parts'] [data-sequence='${data.ID.Value}']`) : /* <!-- Replacing Existing Part --> */
        $("#bundle [data-output-field='Parts']"),
        /* <!-- Inserting new Part --> */
        _diff = !sequence ? 1 : /* <!-- New Part, move everything forward! --> */
        data.Sequence.Value - sequence === 1 ? -1 : /* <!-- Leap frog the next Part --> */
        sequence >= data.Sequence.Value ? 1 : -1;

      if ((sequence && data.Sequence.Value != sequence) || /* <!-- Existing Part with Changed Sequence --> */
        (!sequence && data.Sequence.Value <= $("#bundle [data-output-field='Parts'] [data-sequence]").length)) /* <!-- New Part with Sequence not at end --> */
        $("#bundle [data-output-field='Parts'] [data-sequence]")

        .filter((i, el) => {
          var _seq = parseInt($(el).data("sequence"), 10);
          return (!sequence && _seq >= data.Sequence.Value) || /* <!-- New Part inserted before this elenent --> */
            (sequence && sequence > data.Sequence.Value && _seq < sequence && _seq >= data.Sequence.Value) || /* <!-- Existing Part moved earlier in sequence --> */
            (sequence && sequence < data.Sequence.Value && _seq > sequence && _seq <= data.Sequence.Value); /* <!-- Existing Part moved later in sequence --> */
        })

        .each((i, el) => {
          var _el = $(el),
            _seq = parseInt(_el.data("sequence"), 10);
          factory.Display.template.show({
            template: "editable_part",
            sequence: _seq + _diff,
            quantity: _el.data("quantity"),
            previous: _el.data("previous"),
            children: _el.data("total") ? Array(parseInt(_el.data("total"), 10)) : [],
            replace: true,
            target: _el,
          });
        });

      factory.Display.template.show(_.extend({
        template: "editable_part",
        sequence: data.Sequence.Value,
        quantity: data.Quantity.Value,
        children: data.Total ? Array(data.Total.Value) : [],
        target: _target
      }, data.ID ? {
        previous: data.Previous ? data.Previous.Value : null,
        replace: true,
      } : {}));

    }),

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
            message: FN.instructions("CONFIRM_NOTIFICATION_DELETE", type),
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
            message: FN.instructions("CONFIRM_PERMISSION_DELETE", `${permission.scope.value} (Role: ${permission.role})`),
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
      "group", "Remove Permission", "DELETE_PERMISSION_INSTRUCTIONS", "Remove", false,
      (result, calendar) => $(`[data-id="${calendar.id}"] .permissions-holder [data-id="${result.id}"]`).remove()),

  };
  /* <!-- Remove Functions --> */

  /* <!-- View Functions --> */
  FN.view = {

    options: (data, selectable, simple, toggleable, all) => ({
      data: data,
      selectable: (ರ‿ರ.selectable = (selectable || false)),
      simple: (ರ‿ರ.simple = (simple || false)),
      toggleable: (ರ‿ರ.toggleable = (toggleable || false)),
      all: (ರ‿ರ.all = (all || false))
    }),

    simple: (template, name, help) => options.functions.source.resources()
      .then(FN.action.detoggle)
      .then(resources => options.functions.render.view(template, options.id.manage, name, "", help, FN.view.options(resources, true, true, true, true)))
      .then(FN.hookup.toggle)
      .then(FN.hookup.resource)
      .then(FN.hookup.search)
      .then(FN.hookup.focus("search_Text")),

    permissions: () => FN.view.simple("permissions", "Permissions", "manage.permissions"),

    notifications: () => FN.view.simple("notifications", "Notifications", "manage.notifications"),

    resources: () => options.functions.access.admin()
      .then(() => options.functions.source.resources())
      .then(resources => options.functions.render.view("calendars", options.id.manage, "Resources", "", "manage.resources", FN.view.options(resources)))
      .then(FN.hookup.edit)
      .then(FN.hookup.search)
      .then(FN.hookup.focus("search_Text")),

    bundles: () => options.functions.access.admin()
      .then(() => options.functions.source.bundles(null, true))
      .then(bundles => options.functions.render.view("bundler", options.id.manage, "Bundles", "", "manage.bundles", FN.view.options(bundles)))
      .then(FN.hookup.edit)
      .then(FN.hookup.search)
      .then(FN.hookup.focus("search_Text")),

    bookings: () => options.functions.access.admin()
      .then(() => options.functions.source.resources())
      .then(FN.action.detoggle)
      .then(resources => options.functions.render.view("manage", options.id.manage, "Bookings", options.state.session.current, "manage", FN.view.options(resources, true, true, true, true)))
      .then(FN.hookup.toggle)
      .then(FN.hookup.resource)
      .then(FN.hookup.shortcut)
      .then(FN.hookup.search)
      .then(FN.hookup.focus("shortcut_Text")),

  };
  /* <!-- View Functions --> */

  /* <!-- Confirm Functions --> */
  FN.confirm = {

    status: (id, status) => Promise.resolve(options.functions.populate.get(id))
      .then(event => factory.Google.calendar.events.update(event.source, event.id, {
        extendedProperties: {
          private: {
            STATUS: status
          }
        }
      }).then(updated => {
        event.properties = updated.extendedProperties && updated.extendedProperties.private ? updated.extendedProperties.private : {};
        options.functions.populate.update(event);
        return event;
      }))
      .catch(e => factory.Flags.error("Event Patch Error", e))
      .then(factory.Main.busy("Updating Booking"))
      .then(event => event ?
        options.functions.render.refresh(options.id.manage, () => options.functions.render.table(options.id.manage)(options.functions.populate.all()))() :
        event),

    remove: id => FN.confirm.status(id, null),

    out: id => FN.confirm.status(id, options.loaned),

    in: id => FN.confirm.status(id, options.returned),

  };
  /* <!-- Confirm Functions --> */

  /* <!-- Log Functions --> */
  FN.log = {

    status: (id, title, instructions, content, confirm, handler) => factory.Display.modal("generic", {
      target: factory.container,
      id: id,
      title: title,
      instructions: instructions,
      content: content,
      action: confirm,
    }, dialog => {
      FN.action.dialog(dialog);
      dialog.find("input[type='text']").first().focus();
      dialog.keypress(e => {
        if (e.which != 13) return;
        e.preventDefault();
        var _focussed = dialog.find(":focus");
        _focussed.is(":last-child") ?
          dialog.find(".modal-footer button.btn-primary").click() :
          _focussed.next("input[type='text']").focus();
      });
    }).then(data => data === undefined ? data : (factory.Flags.log(`Data returned from Dialog: ${id}`, data), handler ? handler(data) : data)),

    out: (id, event) => (options.functions.log.opened() ? Promise.resolve() : options.functions.log.config())
      .then(() => event || options.functions.populate.get(id))
      .then(event => FN.log.status("log_out", "Log Loaned Resources", factory.Display.doc.get("LOG_OUT_INSTRUCTIONS"),
        factory.Display.template.get(_.extend({
          template: "loan",
          warning: event.date.isSame(factory.Dates.now(), "day") ? null : event.date,
        }, event)), "Confirm Loan", options.functions.log.loan(id, event))),

    in: (id, event) => (options.functions.log.opened() ? Promise.resolve() : options.functions.log.config())
      .then(() => event || options.functions.populate.get(id))
      .then(event => FN.log.status("log_in", "Log Returned Resources", factory.Display.doc.get("LOG_IN_INSTRUCTIONS"),
        factory.Display.template.get(_.extend({
          template: "return",
          loans: options.state.session.database.loans(event.id),
        }, event)), "Confirm Return", options.functions.log.return(id, event))),

  };
  /* <!-- Log Functions --> */

  /* <!-- Save Functions --> */
  FN.save = {

    form: form => factory.Data({}, factory).dehydrate(form),

    bundle: () => {

      var _data = FN.save.form($("form#bundle"));
      return (!_data.Name || !_data.Parts) ? Promise.resolve(false) : options.state.application.resources.safe().then(resources => {
        var _parts = _.isArray(_data.Parts.Values.Part) ? _data.Parts.Values.Part : [_data.Parts.Values.Part];
        if (ರ‿ರ.bundle) { /* <!-- Update Existing Bundle --> */

          /* <!-- First: Delete Removed --> */
          return Promise.all(_.reduce(ರ‿ರ.bundle.children, (memo, part_a) => {
              if (!_.find(_parts, part_b => part_b.Previous == part_a.sequence || (!part_b.Previous && part_b.Sequence == part_a.sequence)))
                memo.push(factory.Google.resources.features.delete(resources.format.bundle(ರ‿ರ.bundle.name, part_a.sequence, part_a.quantity)));
              return memo;
            }, []))
            /* <!-- Second: Add New Parts --> */
            .then(() => Promise.all(_.reduce(_parts, (memo, part) => {
              if (!part.Previous) {
                memo.push(factory.Google.resources.features.insert(resources.format.bundle(ರ‿ರ.bundle.name, part.Sequence, part.Quantity)));
                part.handled = true;
              }
              return memo;
            },[])))
            /* <!-- Third: Rename Existing Parts --> */
            .then(() => Promise.all(
                _.map(_.reject(_parts, part => part.handled), part => {
                  /* <!-- Rename Existing --> */
                  var _old = _.find(resources.bundles(), bundle => bundle.name == ರ‿ರ.bundle.name && bundle.sequence == part.Previous),
                      _new = resources.format.bundle(_data.Name.Value, part.Sequence, part.Quantity);
                  return _old && _old.id != _new ? factory.Google.resources.features.rename(_old.id, _new) : Promise.resolve(false);
                })
            ))
            /* <!-- Run Updates after removes / insertions / updates --> */
            .then(results => resources.reload().then(() => results));
          
        } else { /* <!-- Create New --> */

          return _.find(resources.bundles(), bundle => String.equal(bundle.name, _data.Name.Value, true)) ?
            Promise.resolve(false) : /* <!-- Already Exists --> */
            Promise.all(_.map(_parts, part => factory.Google.resources.features.insert(resources.format.bundle(_data.Name.Value, part.Sequence, part.Quantity))
              .then(feature => resources.add.feature(feature.name))));
          
        }
      });
      
    },

    part: () => options.state.application.resources.safe().then(resources => {

      var _data = FN.save.form($("form#resources")),
        _bundle = resources.format.bundle(ರ‿ರ.bundle.name, ರ‿ರ.part.sequence, ರ‿ರ.part.quantity),
        _toggled = _.reduce(_data, (memo, value) => {
          _.each(value.Values, (value, key) => value === true ? memo.push(key) : null);
          return memo;
        }, []);

      return Promise.all(_.reduce(resources.find.resources(), (memo, resource) => {
        if (_.find(resource.bundles, bundle => bundle.id == _bundle)) {
          if (_toggled.indexOf(resource.id) < 0) {
            /* <!-- Remove from Bundle --> */
            memo.push(factory.Google.resources.calendars.get(resource.id)
              .then(calendar => factory.Google.resources.calendars.update(calendar.resourceId, {
                featureInstances: _.reject(calendar.featureInstances, feature => feature.feature.name == _bundle),
              }))
              .then(result => result ? resources.update.resource(result) : result));
          }
        } else if (_toggled.indexOf(resource.id) >= 0) {
          /* <!-- Add to Bundle --> */
          memo.push(factory.Google.resources.calendars.get(resource.id)
            .then(calendar => factory.Google.resources.calendars.update(calendar.resourceId, {
              featureInstances: [{feature: {name: _bundle}}].concat(calendar.featureInstances),
            }))
            .then(result => result ? resources.update.resource(result) : result));
        }
        return memo;
      }, []));

    }),

  };
  /* <!-- Save Functions --> */

  /* <!-- Delete Functions --> */
  FN.delete = {

    confirm: (id, message, content, fn) => factory.Display.confirm({
        id: "delete_Notification",
        target: factory.container,
        message: FN.instructions(message. content),
        enter: true,
        action: "Delete"
      }).then(confirm => confirm ? fn().then(factory.Main.busy("Deleting", true)) : Promise.resolve(false)),

    feature: name => factory.Google.resources.features.delete(name).then(result => result ? options.state.application.resources.remove.feature(name) : result),

    part: () => FN.delete.confirm("delete_Part", "DELETE_PART", `${ರ‿ರ.bundle.name} - Part ${ರ‿ರ.part.sequence}`,
      () => FN.delete.feature(options.state.application.resources.format.bundle(ರ‿ರ.bundle.name, ರ‿ರ.part.sequence, ರ‿ರ.part.quantity))),

    bundle: () => FN.delete.confirm("delete_Bundle", "DELETE_BUNDLE", `${ರ‿ರ.bundle.name} [${ರ‿ರ.bundle.children.length} part${ರ‿ರ.bundle.children.length > 1 ? "s" : ""}]`,
      () => Promise.all(_.map(ರ‿ರ.bundle.children, part => FN.delete.feature(options.state.application.resources.format.bundle(ರ‿ರ.bundle.name, part.sequence, part.quantity))))),

  };
  /* <!-- Delete Functions --> */

  /* <!-- Initial Calls --> */
  FN.hookup = factory.Hookup({action: FN.action}, factory);

  /* <!-- External Visibility --> */
  return {

    add: FN.add,

    booking: FN.action.booking,

    bookings: FN.view.bookings,

    bundles: FN.view.bundles,

    notifications: FN.view.notifications,

    permissions: FN.view.permissions,

    in: (id, log) => log ? FN.log.in(id) : FN.confirm.in(id),

    out: (id, log) => log ? FN.log.out(id) : FN.confirm.out(id),

    refresh: options.functions.render.refresh(options.id.manage, FN.action.refresh),

    remove: {

      tag: FN.confirm.remove,

      feature: (id, feature) => $(`[data-id='${id}'][data-feature='${feature}']`).remove(),

      parent: (id, parent) => $(`[data-id='${id}'][data-parent='${parent}']`).remove(),

      permission: (calendar, id) => calendar && id ? FN.remove.permission(calendar, id) : FN.remove.permissions(),

      notification: (calendar, type) => calendar && type ? FN.remove.notification(calendar, type) : FN.remove.notifications(),

      part: sequence => $(`[data-sequence='${sequence}']`).remove(),

    },

    resources: FN.view.resources,

    save: () => factory.Display.state().in(options.functions.states.manage.bundles.part) ? FN.save.part() : factory.Display.state().in(options.functions.states.manage.bundles.bundle) ? FN.save.bundle() : Promise.resolve(false),

    delete: () => ರ‿ರ.bundle && ರ‿ರ.part && factory.Display.state().in(options.functions.states.manage.bundles.part) ? FN.delete.part() : ರ‿ರ.bundle && factory.Display.state().in(options.functions.states.manage.bundles.bundle) ? FN.delete.bundle() : Promise.resolve(false),

  }; /* <!-- External Visibility --> */

};