App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const FN = {},
    DATE_FORMAT = "YYYY-MM-DD";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */

  /* <!-- Initial Loading Notification Functions --> */
  FN.loading = () => $("a.btn.needs-resources, button.needs-resources").addClass("loader");
  FN.loaded = () => $("a.btn.needs-resources, button.needs-resources").removeClass("loader");

  /* <!-- Change base date --> */
  FN.refresh = () => ಠ_ಠ.Display.state().in([FN.states.book.in, FN.states.bundle.in], true) ? FN.bookings.refresh() :
    ಠ_ಠ.Display.state().in(FN.states.diary.in) ? FN.diary.refresh() :
    ಠ_ಠ.Display.state().in(FN.states.manage.in) ? FN.manage.refresh() : false;

  FN.jump = () => {

    var _id = "ctrl_Jump";
    ಠ_ಠ.container.find(`#${_id}`).remove();
    var _input = $("<input />", {
      id: _id,
      type: "hidden",
      class: "d-none dt-picker",
      value: ಠ_ಠ.Dates.parse(ರ‿ರ.current).format(DATE_FORMAT)
    }).appendTo(ಠ_ಠ.container);

    _input.on("change", e => {
      var _date = new ಠ_ಠ.Dates.parse($(e.target).val());
      if (_date.isValid()) FN.date(_date);
    });

    _input.bootstrapMaterialDatePicker({
      format: DATE_FORMAT,
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

  FN.date = value => {
    if (value.year() != ರ‿ರ.current.year() ||
      value.month() != ರ‿ರ.current.month() ||
      value.date() != ರ‿ರ.current.date()) {
      ರ‿ರ.current = value;
      FN.refresh();
    }
  };

  /* <!-- Setup Functions Functions --> */
  FN.setup = {

    /* <!-- Setup required for everything, almost NOTHING is loaded at this point (e.g. ಠ_ಠ.Flags) --> */
    now: () => {

      /* <!-- Set Up / Create the States Module --> */
      FN.states = ಠ_ಠ.States(ಠ_ಠ);

    },

    /* <!-- Start App after fully loaded (but BEFORE routing or authentication) --> */
    initial: () => {

      /* <!-- Setup Function Modules --> */
      var _options = {
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
      _.each(["Source", "Calendar", "Process", "Render", "Bookings", "Diary", "Log", "Access", "Populate", "Manage"],
        module => FN[module.toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ));

      /* <!-- Create Schema Reference --> */
      ಱ.schema = ಠ_ಠ.Schema().latest();

      /* <!-- Setup Notification Helper --> */
      ಱ.notify = ಠ_ಠ.Notify({
        id: "book_Notify",
        autohide: true,
      }, ಠ_ಠ);

      /* <!-- Get Config Helper --> */
      ಱ.config = ಠ_ಠ.Config({
        fields: {
          comparison: ["data"],
        },
        state: FN.states.config
      }, ಠ_ಠ);

      /* <!-- Create Query Reference --> */
      ಱ.query = ಠ_ಠ.Query(ಱ, ಠ_ಠ);

      /* <!-- Create Database Reference --> */
      ರ‿ರ.database = ಠ_ಠ.Database(ಱ, ಠ_ಠ);

    },

    /* <!-- App is ready for action - e.g. is authenticated but no initial routing done! --> */
    session: () => {

      /* <!-- Set / Load the resources --> */
      ಱ.resources = ಱ.resources || ಠ_ಠ.Resources(FN.loaded);

    },

    /* <!-- App is authenticated and routed! --> */
    routed: () => {

      /* <!-- Sets the currently focussed date | Done here as this is called when app restarts etc. --> */
      ರ‿ರ.current = ಠ_ಠ.Dates.now().startOf("day");

      if (!ಱ.resources || !ಱ.resources.loaded()) FN.loading();

    },

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

      /* <!-- Initial Setup Call --> */
      FN.setup.now();

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Book",
        state: ರ‿ರ,
        states: FN.states.all,
        start: FN.setup.routed,
        instructions: [{
            match: /BOOK/i,
            show: "BOOK_INSTRUCTIONS",
            title: "Booking a Resource ..."
          },
          {
            match: [/BOOK/i, /CREATE/i],
            show: "CREATE_INSTRUCTIONS",
            title: "Creating new Booking ..."
          },
          {
            match: [/BOOK/i, /VIEW/i],
            show: "VIEW_INSTRUCTIONS",
            title: "Viewing existing Bookings ..."
          },
          {
            match: [/BOOK/i, /BUNDLE/i],
            show: "BUNDLE_INSTRUCTIONS",
            title: "Book a Resource Bundle ..."
          },
          {
            match: /SHORTCUTS/i,
            show: "SHORTCUT_INSTRUCTIONS",
            title: "Shortcuts ..."
          },
          {
            match: /MANAGE/i,
            show: "MANAGE_INSTRUCTIONS",
            title: "Managing Bookings ..."
          },
          {
            match: [/MANAGE/i, /RESOURCES/i],
            show: "MANAGE_RESOURCES_INSTRUCTIONS",
            title: "Managing Resources ..."
          },
          {
            match: [/MANAGE/i, /PERMISSIONS/i],
            show: "MANAGE_PERMISSIONS_INSTRUCTIONS",
            title: "Managing Permissions ..."
          },
          {
            match: [/MANAGE/i, /NOTIFICATIONS/i],
            show: "MANAGE_NOTIFICATIONS_INSTRUCTIONS",
            title: "Managing Notifications ..."
          },
          {
            match: [/MANAGE/i, /BUNDLES/i],
            show: "MANAGE_BUNDLES_INSTRUCTIONS",
            title: "Managing Bundles ..."
          },
          {
            match: /LOAN/i,
            show: "LOAN_INSTRUCTIONS",
            title: "Loans and Returns ..."
          },
        ],
        routes: {

          booking: {
            matches: /BOOKING/i,
            state: "authenticated",
            length: 1,
            fn: command => {
              try {
                var params = JSON.parse(ಠ_ಠ.Strings().base64.decode(command));
                if (params.c && params.e) FN.manage.booking(params.c, params.e);
              } catch (e) {
                ಠ_ಠ.Flags.error("Failed to Parse Booking Params", e ? e : "No Inner Error");
              }

            }
          },

          date: {
            matches: /DATE/i,
            state: FN.states.dated,
            length: 0,
            keys: ["j", "J", "g", "G"],
            fn: FN.jump,
            routes: {
              today: {
                matches: /TODAY/i,
                keys: ["t", "T"],
                fn: () => FN.date(ಠ_ಠ.Dates.now().startOf("day"))
              },
              forward: {
                matches: /FORWARD/i,
                keys: ".",
                actions: "swipeleft",
                fn: () => FN.date(ಠ_ಠ.Dates.parse(ರ‿ರ.current).add(1, "day")),
                routes: {
                  week: {
                    matches: /WEEK/i,
                    length: 0,
                    keys: ">",
                    fn: () => FN.date(ಠ_ಠ.Dates.parse(ರ‿ರ.current).add(1, "week")),
                  }
                }
              },
              backward: {
                matches: /BACKWARD/i,
                keys: ",",
                actions: "swiperight",
                fn: () => FN.date(ಠ_ಠ.Dates.parse(ರ‿ರ.current).subtract(1, "day")),
                routes: {
                  week: {
                    matches: /WEEK/i,
                    length: 0,
                    keys: "<",
                    fn: () => FN.date(ಠ_ಠ.Dates.parse(ರ‿ರ.current).subtract(1, "week")),
                  }
                }
              },
              extend: {
                matches: /EXTEND/i,
                state: [FN.states.book.in, FN.states.bundle.in],
                fn: () => FN.bookings.extend(),
              }
            }
          },

          refresh: {
            matches: /REFRESH/i,
            state: FN.states.data,
            keys: ["r", "R"],
            fn: () => FN.refresh(),
          },

          book: {
            matches: /BOOK/i,
            keys: ["b", "B"],
            fn: () => FN.bookings.new()
              .then(() => ಠ_ಠ.Display.state().change(FN.states.views, FN.states.book.in))
              .catch(e => ಠ_ಠ.Flags.error("Book View Error", e))
              .then(ಠ_ಠ.Main.busy("Loading Resources", true))
          },

          bundle: {
            matches: /BUNDLE/i,
            fn: () => FN.bookings.bundle()
              .then(() => ಠ_ಠ.Display.state().change(FN.states.views, FN.states.bundle.in))
              .catch(e => ಠ_ಠ.Flags.error("Bundle View Error", e))
              .then(ಠ_ಠ.Main.busy("Loading Resources", true))
          },
          
          all: {
            matches: /DIARY/i,
            keys: ["d", "D", "v", "V"],
            fn: () => FN.diary.all()
              .then(() => ಠ_ಠ.Display.state().change(FN.states.views, FN.states.diary.in))
              .catch(e => ಠ_ಠ.Flags.error("Diary View Error", e))
              .then(ಠ_ಠ.Main.busy("Loading Bookings", true))
          },

          manage: {
            matches: /MANAGE/i,
            routes: {
              bookings: {
                matches: /BOOKINGS/i,
                fn: () => FN.manage.bookings()
                  .then(() => ಠ_ಠ.Display.state().change(FN.states.views, [FN.states.manage.in, FN.states.manage.bookings]))
                  .catch(e => ಠ_ಠ.Flags.error("Booking Management View Error", e))
                  .then(ಠ_ಠ.Main.busy("Loading Resources", true))
              },
              resources: {
                matches: /RESOURCES/i,
                fn: () => FN.manage.resources()
                  .then(() => ಠ_ಠ.Display.state().change(FN.states.views, [FN.states.manage.in, FN.states.manage.resources]))
                  .catch(e => ಠ_ಠ.Flags.error("Resource Management View Error", e))
                  .then(ಠ_ಠ.Main.busy("Loading Resources", true))
              },
              bundles: {
                matches: /BUNDLES/i,
                fn: () => FN.manage.bundles()
                  .then(() => ಠ_ಠ.Display.state().change(FN.states.views, [FN.states.manage.in, FN.states.manage.bundles.in]))
                  .catch(e => ಠ_ಠ.Flags.error("Bundle Management View Error", e))
                  .then(ಠ_ಠ.Main.busy("Loading Resources", true))
              },
              permissions: {
                matches: /PERMISSIONS/i,
                fn: () => FN.manage.permissions()
                  .then(() => ಠ_ಠ.Display.state().change(FN.states.views, [FN.states.manage.in, FN.states.manage.permissions]))
                  .catch(e => ಠ_ಠ.Flags.error("Permission Management View Error", e))
                  .then(ಠ_ಠ.Main.busy("Loading Resources", true))
              },
              notifications: {
                matches: /NOTIFICATIONS/i,
                fn: () => FN.manage.notifications()
                  .then(() => ಠ_ಠ.Display.state().change(FN.states.views, [FN.states.manage.in, FN.states.manage.notifications]))
                  .catch(e => ಠ_ಠ.Flags.error("Notification Management View Error", e))
                  .then(ಠ_ಠ.Main.busy("Loading Resources", true))
              },
              save: {
                matches: /SAVE/i,
                state: FN.states.manage.in,
                fn: () => FN.manage.save()
                  .catch(e => e ? ಠ_ಠ.Flags.error("Management Save Error", e).negative() : false)
                  .then(result => result && ಠ_ಠ.Display.state().in(FN.states.manage.bundles.in) ?
                       (ಠ_ಠ.Display.state().exit([FN.states.manage.bundles.bundle, FN.states.manage.bundles.part]), FN.manage.bundles()) : result)
                  .then(ಠ_ಠ.Display.tidy)
                  .then(ಠ_ಠ.Main.busy("Saving", true))
              },
              delete: {
                matches: /DELETE/i,
                state: FN.states.manage.in,
                fn: () => FN.manage.delete()
                  .catch(e => e ? ಠ_ಠ.Flags.error("Management Delete Error", e).negative() : false)
                  .then(result => result && ಠ_ಠ.Display.state().in(FN.states.manage.bundles.in) ?
                       (ಠ_ಠ.Display.state().exit([FN.states.manage.bundles.bundle, FN.states.manage.bundles.part]), FN.manage.bundles()) : result)
                  .then(ಠ_ಠ.Display.tidy)
              }
            },

          },

          confirm: {
            matches: /CONFIRM/i,
            state: FN.states.manage.in,
            routes: {
              loan: {
                matches: /LOAN/i,
                length: 1,
                fn: command => FN.manage.out(command)
              },
              return: {
                matches: /RETURN/i,
                length: 1,
                fn: command => FN.manage.in(command)
              },
            },
          },

          log: {
            matches: /LOG/i,
            state: FN.states.manage.in,
            routes: {
              loan: {
                matches: /LOAN/i,
                length: 1,
                fn: command => FN.manage.out(command, true)
              },
              return: {
                matches: /RETURN/i,
                length: 1,
                fn: command => FN.manage.in(command, true)
              },
            },
          },

          code: {
            matches: /CODE/i,
            state: FN.states.bookings,
            length: 2,
            fn: commands => {
              ಠ_ಠ.Link({
                app: "book",
                route: "booking",
                persistent: false,
                offer_persistent: true,
                /* <!-- UK/US Keyboard Language Mapping Issues for # --> */
                hide_link: true,
                hide_shorten: true,
                force_qr: true,
                options_bottom: true,
                qr_size: 480,
                title: "Booking Shortcut",
                data: {
                  c: ಠ_ಠ.url.decode(commands[0]),
                  e: ಠ_ಠ.url.decode(commands[1])
                }
              }, ಠ_ಠ).generate();
            }
          },

          add: {
            matches: /ADD/i,
            state: FN.states.manage.in,
            routes: {
              feature: {
                matches: /FEATURE/i,
                fn: () => FN.manage.add.feature()
              },
              resource: {
                matches: /RESOURCE/i,
                fn: () => FN.manage.add.resource()
              },
              parent: {
                matches: /PARENT/i,
                fn: () => FN.manage.add.parent()
              },
              permission: {
                matches: /PERMISSION/i,
                fn: () => FN.manage.add.permission()
              },
              notification: {
                matches: /NOTIFICATION/i,
                fn: () => FN.manage.add.notification()
              },
              bundle: {
                matches: /BUNDLE/i,
                state: FN.states.manage.bundles.in,
                fn: () => FN.manage.add.bundle()
                  .then(() => ಠ_ಠ.Display.state().change(FN.states.views, [FN.states.manage.in, FN.states.manage.bundles.in, FN.states.manage.bundles.bundle]))
              },
              part: {
                matches: /PART/i,
                state: FN.states.manage.bundles.bundle,
                fn: () => FN.manage.add.part()
              },
            },
          },

          remove: {
            matches: /REMOVE/i,
            state: FN.states.manage.in,
            routes: {
              tag: {
                matches: /TAG/i,
                length: 1,
                fn: command => FN.manage.remove.tag(decodeURIComponent(command))
              },
              feature: {
                matches: /FEATURE/i,
                length: 2,
                fn: command => FN.manage.remove.feature(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])))
              },
              parent: {
                matches: /PARENT/i,
                length: 2,
                fn: command => FN.manage.remove.parent(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])))
              },
              specific_permission: {
                matches: /PERMISSION/i,
                length: 2,
                fn: command => FN.manage.remove.permission(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])))
              },
              permission: {
                matches: /PERMISSION/i,
                fn: () => FN.manage.remove.permission()
              },
              specific_notification: {
                matches: /NOTIFICATION/i,
                length: 2,
                fn: command => FN.manage.remove.notification(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])))
              },
              notification: {
                matches: /NOTIFICATION/i,
                fn: () => FN.manage.remove.notification()
              },
              part: {
                matches: /PART/i,
                length: 1,
                state: FN.states.manage.bundles.bundle,
                fn: command => FN.manage.remove.part(decodeURIComponent(command))
              },
            },
          },

          edit: {
            matches: /EDIT/i,
            state: FN.states.manage.in,
            routes: {
              part: {
                matches: /PART/i,
                length: {
                  min: 3,
                  max: 4
                },
                state: FN.states.manage.bundles.bundle,
                fn: command => FN.manage.add.part(
                  decodeURIComponent(command[0]),
                  decodeURIComponent(command[1]),
                  decodeURIComponent(command[2]),
                  command.length === 4 ? decodeURIComponent(command[3]) : null
                )
              },
            }
          },

          config: {
            matches: /CONFIG/i,
            routes: {

              clear: {
                matches: /CLEAR/i,
                fn: () => ಠ_ಠ.Display.confirm({
                    id: "clear_Config",
                    target: ಠ_ಠ.container,
                    message: ಠ_ಠ.Display.doc.get("CLEAR_CONFIGURATION"),
                    action: "Clear"
                  })
                  .then(confirm => confirm ?
                    ಱ.config.clear()
                    .then(ಠ_ಠ.Main.busy("Clearing Config"))
                    .then(cleared => cleared ?
                      ಠ_ಠ.Display.state().exit(FN.states.views, FN.states.config) && ಠ_ಠ.Router.run() :
                      false) : false)
                  .catch(e => e ?
                    ಠ_ಠ.Flags.error("Clear Config Error", e) : ಠ_ಠ.Flags.log("Clear Config Cancelled"))

              },

              show: {
                matches: /SHOW/i,
                fn: () => {
                  var _details = {};
                  ಱ.config.find()
                    .then(result => result ? ಱ.config.load(_details.file = result) : result)
                    .then(config => config ? _details.config = config.settings : config)
                    .then(ಠ_ಠ.Main.busy("Loading Config"))
                    .then(config => config ? ಠ_ಠ.Display.inform({
                      id: "show_Config",
                      target: ಠ_ಠ.container,
                      code: _.escape(JSON.stringify(_details, null, 4))
                    }) : config);
                }
              },

              download: {
                matches: /DOWNLOAD/i,
                fn: () => {
                  ಱ.config.find()
                    .then(ಱ.config.load)
                    .then(ಠ_ಠ.Main.busy("Loading Config"))
                    .then(config => ಠ_ಠ.Saver({}, ಠ_ಠ)
                      .save(JSON.stringify(config.settings, null, 2), "docket-config.json", "application/json"));
                }
              },
            },
          },
        },
        route: (handled, command) => {
          if (handled) return;
          var _parsed = ಠ_ಠ.Dates.parse(command);
          if (_parsed.isValid()) ರ‿ರ.current = _parsed;
        }
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: FN.setup.initial,

    ready: FN.setup.session,

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,

    persistent: ಱ,

    delay: ms => new Promise(resolve => setTimeout(resolve, ms)),

    fn: FN,

  };

};