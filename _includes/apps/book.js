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
    ರ‿ರ = {}, /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
  
  /* <!-- Initial Loading Notification Functions --> */
  FN.loading = () => $("a.btn.needs-resources, button.needs-resources").addClass("loader");
  FN.loaded = () => $("a.btn.needs-resources, button.needs-resources").removeClass("loader");
  
  /* <!-- Change base date --> */
  FN.refresh = () => ಠ_ಠ.Display.state().in(FN.states.book.in) ? FN.bookings.refresh() : 
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
     _.each(["Source", "Calendar", "Process", "Render", "Bookings", "Diary", "Manage"], 
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
        instructions: [
          {
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
                        .then(ಠ_ಠ.Main.busy("Loading Resources"))
                        .then(() => ಠ_ಠ.Display.state().change(FN.states.views, FN.states.book.in))
          },
          
          all: {
            matches: /DIARY/i,
            keys: ["d", "D", "v", "V"],
            fn: () => FN.diary.all()
                        .then(ಠ_ಠ.Main.busy("Loading Bookings"))
                        .then(() => ಠ_ಠ.Display.state().change(FN.states.views, FN.states.diary.in))
          },
          
          manage: {
            matches: /MANAGE/i,
            routes: {
              bookings: {
                matches: /BOOKINGS/i,
                fn: () => FN.manage.bookings()
                        .then(ಠ_ಠ.Main.busy("Loading Resources"))
                        .then(() => ಠ_ಠ.Display.state().change(FN.states.views, FN.states.manage.in))
              },
              resources: {
                matches: /RESOURCES/i,
                fn: () => true
              },
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
                persistent: false, /* <!-- UK/US Keyboard Language Mapping Issues --> */
                hide_link: true,
                hide_shorten: true,
                force_qr: true,
                options_bottom: true,
                qr_size: 480,
                title: "Booking Shortcut",
                data: {
                  c: ಠ_ಠ.Flags.decode(commands[0]),
                  e: ಠ_ಠ.Flags.decode(commands[1])
                }}, ಠ_ಠ).generate();
            }
          },
          
          remove: {
            matches: [/REMOVE/i, /TAG/i],
            state: FN.states.manage.in,
            length: 1,
            fn: command => FN.manage.remove(command)
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
                          ಠ_ಠ.Display.state().exit(FN.states.views, FN.states.config) && ಠ_ಠ.Router.run()
                              : false) : false)
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
		
	};

};