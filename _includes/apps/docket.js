App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- State Constants --> */
  const STATE_READY = "ready",
    STATE_CONFIG = "config",
    STATE_OPENED = "opened",
    STATE_DEFAULT = "default",
    STATE_LOADED = "loaded",
    STATE_MONTHLY = "monthly",
    STATE_WEEKLY = "weekly",
    STATE_DAILY = "daily",
    STATE_KANBAN = "kanban",
    STATE_ANALYSIS = "analysis",
    STATE_QUEUE = "queue",
    STATE_PROJECTS = "projects",
    STATE_TIMESHEET = "timesheet",
    STATE_CALENDARS = "calendars",
    STATE_CLASSES = "classes",
    STATE_PREFERENCES = "preferences",
    STATES = [STATE_READY, STATE_CONFIG, STATE_OPENED, STATE_DEFAULT, STATE_LOADED,
      STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY,
      STATE_KANBAN, STATE_ANALYSIS, STATE_QUEUE, STATE_PROJECTS, STATE_TIMESHEET,
      STATE_CALENDARS, STATE_CLASSES, STATE_PREFERENCES
    ],
    SOURCE = [STATE_DEFAULT, STATE_LOADED],
    DIARIES = [STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY],
    DISPLAY = [STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY, STATE_KANBAN, STATE_ANALYSIS, STATE_QUEUE, STATE_PROJECTS, STATE_TIMESHEET];
  /* <!-- State Constants --> */
  
  /* <!-- Scope Constants --> */
  const SCOPE_CALENDARS = "https://www.googleapis.com/auth/calendar.readonly",
        SCOPE_FULL_DRIVE = "https://www.googleapis.com/auth/drive";
  /* <!-- Scope Constants --> */
  
  /* <!-- Internal Constants --> */
  const NAME = "Docket",
        ID = "diary",
        SHARED = "assignment_turned_in",
        DATE_FORMAT = "YYYY-MM-DD",
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {}, /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */

  /* <!-- Helper Functions --> */
  FN.view = name => $(".page-title").text(name ? name : NAME);
    
  FN.loader = () => ({
              mime: ಠ_ಠ.Google.files.natives()[1],
              properties: _.object([ಱ.schema.property.name], [ಱ.schema.property.value]),
              wrapper: ಠ_ಠ.Main.elevator(SCOPE_FULL_DRIVE),
            });
  
  FN.picker = () => _.extend({
              title: "Select a Docket Sheet to Open",
              view: "SPREADSHEETS",
              all: true,
              recent: true,
              team: true,
            }, FN.loader());
  
  FN.file = value => ({
    data: value.id,
    name: value.name,
    title: value.properties && value.properties.TITLE ? value.properties.TITLE : "",
    version: value.version,
  });
  
  FN.elevate = fn => {

      var _retry = retry => fn()
        .catch(e => {
          if (e.status == 403) { /* <!-- e.status: 403 --> */
            ಠ_ಠ.Flags.log("ELEVATE: Need to grant permission");
            return {
              retry: retry
            };
          }
        })
        .then(result => result && result.retry === true ?
          ಠ_ಠ.Main.authorise(SCOPE_FULL_DRIVE)
          .then(result => result === true ? _retry(false) : result) : result);

      return _retry(true);

    };
  /* <!-- Helper Functions --> */

  
  /* <!-- Search Function --> */
  FN.search = () => ಠ_ಠ.Display.text({
        message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
        action: "Search",
        simple: true,
      }).then(query => query ? FN.display.list(ರ‿ರ.database.search(query, !ರ‿ರ.show ?
        ರ‿ರ.today : ರ‿ರ.show >= ರ‿ರ.today ?
        ರ‿ರ.show : false)) : false)
      .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"));
  /* <!-- Search Function --> */
  
  
  /* <!-- Option Functions --> */
  FN.options = {

    action: (force, state) => new Promise(resolve => {
      var _state = force || (force === undefined && !ಠ_ಠ.Display.state().in(state)) ?
        ಠ_ಠ.Display.state().enter(state) : ಠ_ಠ.Display.state().exit(state);
      resolve(_state.state().in(state));
    }),

    calendars: force => FN.options.action(force, STATE_CALENDARS),

    classes: force => FN.options.action(force, STATE_CLASSES),

    process: type => () => FN.options[type]()
      .then(result => (result ? FN[type].choose() : Promise.resolve(false))
        .then(results => _.tap(results, results => {
          var _config = {};
          results ? _config[type] = results : delete ರ‿ರ.config.settings[type];
          ಱ.config.update(ರ‿ರ.config.id, ರ‿ರ.config.settings = _.defaults(_config, ರ‿ರ.config.settings));
        }))
        .then(results => FN.options[type](!!results).then(FN.action.refresh))),

  };
  /* <!-- Option Functions --> */


  /* <!-- Focus Functions --> */
  FN.focus = {

    date: () => ರ‿ರ.show || ರ‿ರ.today,

    from: () => ಠ_ಠ.Dates.parse(FN.focus.date()),

  };
  /* <!-- Focus Functions --> */


  /* <!-- Display Functions --> */
  FN.display = {
    
    list: (list, subtitle, analysis) => ಠ_ಠ.Display.modal("list", {
      target: ಠ_ಠ.container,
      id: `${ID}_list`,
      title: `${list.length} Docket Item${list.length === 1 ? "" : "s"}`,
      subtitle: subtitle,
      items: _.sortBy(ಱ.task.prepare(list), "FROM"),
      statistics: analysis ? ಠ_ಠ.Display.template.get(_.extend({
        template: "statistics"
      }, analysis)) : null
    }, dialog => {
      /* <!-- Ensure Links open new tabs --> */
      dialog.find("a:not([href^='#'])").attr("target", "_blank").attr("rel", "noopener");
      ಠ_ಠ.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {trigger: "hover"});
    }).then(() => list),
    
    tagged: (tag, all) => tag.indexOf(ಱ.markers.project) === 0 ?
      FN.display.list(ರ‿ರ.database.tagged(tag, all),
          `Tasks for Project: ${tag.replace(ಱ.markers.project,"")}`, ಱ.analysis.analysis(tag, ರ‿ರ.db)) : 
        tag.indexOf(ಱ.markers.assignation) === 0 ? 
          FN.display.list(ರ‿ರ.database.tagged(tag), 
            `Tasks for: ${tag.replace(ಱ.markers.assignation,"")}`, ಱ.analysis.analysis(tag, ರ‿ರ.db)) :
        tag.indexOf(ಱ.markers.label) === 0 ? 
          FN.display.list(ರ‿ರ.database.tagged(tag), 
            `Tasks for Label: ${tag.replace(ಱ.markers.label,"")}`, ಱ.analysis.analysis(tag, ರ‿ರ.db)) :
        FN.display.list(ರ‿ರ.database.tagged(tag), `Tasks tagged with: ${tag}`),

    cleanup: () => {
      $("body").removeClass("modal-open");
      $("div.modal-backdrop.show, div.tooltip.show").remove();
      ಱ.errors.empty();
    },
    
    current: focus => FN.display.dated(focus, ಠ_ಠ.Display.state().in(STATE_MONTHLY) ?
      FN.views.monthly : ಠ_ಠ.Display.state().in(STATE_WEEKLY) ?
      FN.views.weekly : ಠ_ಠ.Display.state().in(STATE_DAILY) ?
      FN.views.daily : FN.views.weekly, FN.display.cleanup()),

    dated: (focus, fn) => new Promise(resolve => {

      ರ‿ರ.show = focus.startOf("day").toDate();

      var _start = focus.clone().subtract(1, "month").toDate(),
        _end = focus.clone().add(1, "month").toDate();

      (ಠ_ಠ.Display.state().in([STATE_CALENDARS, STATE_CLASSES], true) && (ರ‿ರ.config.settings.calendars || ರ‿ರ.config.settings.classes) ?
        ಠ_ಠ.Main.authorise(SCOPE_CALENDARS).then(result => result === true ? Promise.all(
            _.map([].concat(ರ‿ರ.config.settings.calendars || [],
                _.filter(ರ‿ರ.config.settings.classes || [], item => item.calendar)), item =>
              ಠ_ಠ.Google.calendar.list(item.calendar || item.id, _start, _end)
              .then(events => _.tap(events,
                events => _.each(events, event => event._title = `CALENDAR: ${item.name}`, events)))))
          .catch(e => ಠ_ಠ.Flags.error("Events Loading:", e).reflect([])) :
          false).then(ಠ_ಠ.Main.busy("Loading Events")) : Promise.resolve(false)).then(overlay => {

        /* <!-- Prepare Overlays --> */
        overlay = overlay && overlay.length > 0 ?
          _.each((overlay = _.flatten(overlay)), item => {
            if (item.start.dateTime) item.IS_TIMED = true;
            item.start = ಠ_ಠ.Dates.parse(item.start.dateTime || item.start.date);
            item.end = ಠ_ಠ.Dates.parse(item.end.dateTime || item.end.date);
            if (item.IS_TIMED) {
              item.TIME = `${item.start.format("HH:mm")} - ${item.end.format("HH:mm")}`;
            } else if (item.start.clone().add(1, "day").isSame(item.end)) {
              /* <!-- End Dates for non-timed Events are Exclusive --> */
              item.end = item.end.subtract(1, "day");
            }
            item.DISPLAY = ಱ.showdown.makeHtml(item.summary);
            item._link = item.htmlLink;
            item._icon = "calendar_today";
          }) : [];

        /* <!-- Filter Deadlines --> */
        if (ಠ_ಠ.Display.state().in(STATE_CLASSES) && ರ‿ರ.deadlines && ರ‿ರ.deadlines.length > 0)
          overlay = overlay.concat(_.filter(ರ‿ರ.deadlines,
            deadline => deadline.due.isSameOrAfter(_start) &&
            deadline.due.isSameOrBefore(_end)));

        resolve(fn(focus, overlay));

      });

    }),
    
  };
  /* <!-- Display Functions --> */
  

  /* <!-- Action Functions --> */
  FN.action = {

    /* <!-- reset = Reset View to default / configured default --> */
    load: (settings, reset) => Promise.resolve((ಱ.task = ಠ_ಠ.Task({
          schema: ಱ.schema,
          zombie: ರ‿ರ.config.settings.zombie,
          ghost: ರ‿ರ.config.settings.ghost,
          functions: FN,
          state: {
            session: ರ‿ರ,
            application: ಱ,
          },
          markers: ಱ.markers
        }, ಠ_ಠ)))
      .then(task => (ಱ.schema.process = task.process())) /* <!-- Create Processing Task Function --> */
      .then(() => {
        /* <!-- Get Custom Title, and Version from File Properties, if not already loaded --> */
        if (settings.title === undefined) {
          return ಠ_ಠ.Google.files.get((settings || ರ‿ರ.config.settings).data, true)
            .then(file => {
              window.document.title = file.properties && file.properties.TITLE ? file.properties.TITLE : ಱ.title;
              return file.version;
            });
        } else {
          window.document.title = settings.title || ಱ.title;
          return (settings || ರ‿ರ.config.settings).version;
        }
      })
      .then(version => Promise.all([].concat(
        ರ‿ರ.database.open(ರ‿ರ.refresh = (settings || ರ‿ರ.config.settings).data, version),
        ರ‿ರ.config.settings.classes ? FN.classes.load(ರ‿ರ.config.settings.classes) : [])))
      .then(results => {
        $("nav a[data-link='sheet']").prop("href", `https://docs.google.com/spreadsheets/d/${ರ‿ರ.refresh}/edit`);
        ಠ_ಠ.Display.state().change(SOURCE, [STATE_OPENED]
          .concat([!settings || settings.data == ರ‿ರ.config.settings.data ? STATE_DEFAULT : STATE_LOADED]));
        ರ‿ರ.db = results[0];
        if (results[1]) ರ‿ರ.deadlines = results[1];
        ಱ.errors.empty();
      })
      .then(ಠ_ಠ.Main.busy("Loading Data"))
      .then(() => reset ? ಠ_ಠ.Display.state().change(DISPLAY, DISPLAY.indexOf((settings || ರ‿ರ.config.settings).view) >= 0 ?
                                             (settings || ರ‿ರ.config.settings).view : STATE_WEEKLY) : false)
      .then(() => ಠ_ಠ.Display.state().in(DIARIES, true) ? 
              FN.display.current(ಠ_ಠ.Dates.parse(FN.focus.date())) :
              ಠ_ಠ.Display.state().in(STATE_ANALYSIS) ? FN.views.analysis(FN.display.cleanup()) :
              ಠ_ಠ.Display.state().in(STATE_KANBAN) ? FN.views.kanban({
                past: ರ‿ರ.config.settings.past,
                future: ರ‿ರ.config.settings.future,
              }, FN.display.cleanup()) : 
              ಠ_ಠ.Display.state().in(STATE_QUEUE) ? FN.views.queue(FN.display.cleanup()) : 
              ಠ_ಠ.Display.state().in(STATE_PROJECTS) ? FN.views.projects(FN.display.cleanup()) : false)
      .catch(e => ಠ_ಠ.Flags.error("Data Error", e ? e : "No Inner Error").negative()),

    jump: () => {

      var _id = "ctrl_Jump";
      ಠ_ಠ.container.find(`#${_id}`).remove();
      var _input = $("<input />", {
        id: _id,
        type: "hidden",
        class: "d-none dt-picker",
        value: ಠ_ಠ.Dates.parse(FN.focus.date()).format(DATE_FORMAT)
      }).appendTo(ಠ_ಠ.container);

      _input.on("change", e => {
        var _date = new ಠ_ಠ.Dates.parse($(e.target).val());
        if (_date.isValid()) FN.display.current(_date);
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
    },

    refresh: () => {

      /* <!-- Reset State to Today --> */
      ರ‿ರ.today = ಠ_ಠ.Dates.now().startOf("day").toDate();

      /* <!-- Open and render data --> */
      return FN.action.load(ರ‿ರ.refresh ? {data: ರ‿ರ.refresh} : null);

    },

    start: settings => {

      /* <!-- Remove old and unused config settings --> */
      delete settings.calendar;
      _.each(settings, (value, key) => value === false && (key !== "zombie" && key !== "ghost") ?
             delete settings[key] : null);

      /* <!-- Set States from Config --> */
      FN.options.calendars(!!settings.calendars);
      FN.options.classes(!!settings.classes);

      /* <!-- Set Name from Config (if available, and also if supplied config is not the same as default config) --> */
      settings.name && (!ರ‿ರ.config || settings.data != ರ‿ರ.config.settings.data) ? ರ‿ರ.name = settings.name : delete ರ‿ರ.name;

      /* <!-- Set Refresh Timer Period --> */
      settings.refresh !== false ? FN.background.start(settings.refresh || 15) : false;
      
      /* <!-- Open and render data --> */
      return FN.action.load(settings, true);

    },
    
    clear : () => ರ‿ರ.config && ರ‿ರ.config.settings.data != ರ‿ರ.refresh ? FN.menu.remove(ರ‿ರ.refresh) : Promise.resolve(),
    
    default: () => FN.action.clear().then(() => FN.action.start(ರ‿ರ.config.settings)),

  };
  /* <!-- Action Functions --> */

  
  /* <!-- Create Functions --> */
  FN.create = {

    /* <!-- Create new Config, and open/create DB --> */
    default: () =>

      /* <!-- Clear any existing config --> */
      ಱ.config.clear()

      /* <!-- Search for existing docket files owned by user --> */
      .then(() => ಠ_ಠ.Google.files.search(ಠ_ಠ.Google.files.natives()[1],
        `${ಱ.schema.property.name}=${ಱ.schema.property.value}`, true))
    
      /* <!-- Prompt User to use an existing file as their default docket database --> */
      .then(results => results && results.length > 0 ? ಠ_ಠ.Display.choose({
          id: "select_Database",
          title: "Use Existing Data Sheet?",
          instructions: ಠ_ಠ.Display.doc.get("EXISTING"),
          choices: _.map(results, r => ({
            value: r.id,
            name: `${r.name} | Last Modified: ${ಠ_ಠ.Dates.parse(r.modifiedByMeTime).fromNow()}`
          })),
          cancel: "Create New",
          action: "Select Existing",
        })
        .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying Select Prompt", e) :
          ಠ_ಠ.Flags.log("Select Prompt Cancelled")).negative()) : false)

      /* <!-- Return the File ID if selected, otherwise create new DB --> */
      .then(result => result ? result.value : ರ‿ರ.database.create(ಱ.schema.sheets.sheet_tasks, ಱ.schema.names.spreadsheet, ಱ.schema.names.sheet))

      /* <!-- Create/save new Config with the file ID --> */
      .then(result => ಱ.config.create({
        data: result && result.spreadsheetId ? result.spreadsheetId : result,
        calendar: false,
        classes: false
      }))

      /* <!-- Show / Then Close Busy Indication  --> */
      .then(ಠ_ಠ.Main.busy("Creating Config"))

      /* <!-- Start the main process of loading and displaying the data! --> */
      .then(config => FN.action.start((ರ‿ರ.config = config).settings)),


    /* <!-- Create new Config with existing file --> */
    existing: value => ಱ.config.create({
        data: value.id,
        calendar: false,
        classes: false
      })

      /* <!-- Show / Then Close Busy Indication --> */
      .then(ಠ_ಠ.Main.busy("Creating Config"))

      /* <!-- Start the main process of loading and displaying the data! --> */
      .then(config => FN.action.start((ರ‿ರ.config = config).settings)),


    /* <!-- Create new Shared Database --> */
    new: () => 
    
      /* <!-- Prompt User for new file name --> */
      ಠ_ಠ.Display.text({
        id: "file_name",
        title: "File Name",
        message: ಠ_ಠ.Display.doc.get("FILE_NAME"),
        simple: true,
        state: {
          value: "Shared Docket Data"
        }
      })
    
      /* <!-- Create new DB --> */
      .then(name => name ? ರ‿ರ.database.create(ಱ.schema.sheets.sheet_tasks, name, ಱ.schema.names.sheet)
            .then(ಠ_ಠ.Main.busy("Creating Database")) : false)

      /* <!-- Start the main process of loading and displaying the data! --> */
      .then(sheet => sheet ? FN.open.shared({
          id: sheet.spreadsheetId,
          name: sheet.properties.title
        }) : false)
    
      .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying Text Prompt", e) :
          ಠ_ಠ.Flags.log("Text Prompt Cancelled")).negative())

  };
  /* <!-- Create Functions --> */


  /* <!-- Open Functions --> */
  FN.open = {

    /* <!-- Open Default Configuration Database --> */
    default: value =>

      /* <!-- Find existing config --> */
      ಱ.config.find()

        /* <!-- Update Existing or Create New config --> */
        .then(config => config ?
          ಱ.config.update(config.id, _.defaults({
            data: value.id
          }, config.settings)) : ಱ.config.create({
            data: value.id,
            calendar: false,
            classes: false
          }))

    
        /* <!-- Show / Then Close Busy Indication  --> */
        .then(ಠ_ಠ.Main.busy("Loading Config"))

        /* <!-- Start the main process of loading and displaying the data! --> */
        .then(config => FN.action.start((ರ‿ರ.config = config).settings)),

    /* <!-- Open Shared Database --> */
    shared: value => (ರ‿ರ.config && ರ‿ರ.config.settings.data != value.id ? FN.menu.add(value) : Promise.resolve(value))
      .then(value => FN.action.start(_.defaults(FN.file(value), ರ‿ರ.config.settings))),

  };
  /* <!-- Open Functions --> */
      
      
  /* <!-- Background | Refresh Functions --> */
  FN.background = {

    start: interval => {
      
      /* <!-- Close function will terminate previous timeout function (also used with Router State clearing) --> */
      if (ರ‿ರ.background && ರ‿ರ.background.close) ರ‿ರ.background.close();
      
      var _refresh = () => {
        /* <!-- Check if modal or editing UI is visible before proceeding --> */
        if ($("div.item div.edit:visible, div.modal.show:visible, .drop-target:visible").length === 0) {
          ಠ_ಠ.Flags.log("Underlying Data Change Detected: RELOADING");
          /* <!-- TODO: Rather brute force! Should update DB silently if change is not on current view... --> */
          FN.action.refresh();
        } else {
          ಠ_ಠ.Flags.log("Underlying Data Change Detected: NOT RELOADING (UI Blocking)");
        } 
      }, _run = () => {
        ರ‿ರ.database.mismatch().then(result => result ? _refresh() : false);
        ರ‿ರ.background.id = setTimeout(_run, interval * 60 * 1000);
      };
      
      ರ‿ರ.background = {
        id: setTimeout(_run, interval * 60 * 1000),
        close: () => clearTimeout(ರ‿ರ.background.id),
      };
      
    },
    
  };
  /* <!-- Background | Refresh Functions --> */
  
  /* <!-- Internal Functions --> */

  /* <!-- Setup Functions --> */
  FN.setup = {
    
    /* <!-- Setup required for everything, almost NOTHING is loaded at this point (e.g. ಠ_ಠ.Flags) --> */
    now: () => {

      FN.menu = ಠ_ಠ.Menu({
          state : STATE_LOADED,
          icon : SHARED
        }, ಠ_ಠ);
      
      /* <!-- Set Up / Create the Function Modules --> */
      FN.graphs = ಠ_ಠ.Graphs();
      FN.classes = ಠ_ಠ.Classes({}, ಠ_ಠ);
      FN.calendars = ಠ_ಠ.Calendars({}, ಠ_ಠ);
      FN.archive = ಠ_ಠ.Archive({functions: FN, state: {session: ರ‿ರ, application: ಱ}}, ಠ_ಠ);
      FN.tasks = ಠ_ಠ.Tasks({functions: FN, state: {session: ರ‿ರ, application: ಱ}, date_format: DATE_FORMAT}, ಠ_ಠ);
      FN.views = ಠ_ಠ.Views(
          {functions: FN, state: {session: ರ‿ರ, application: ಱ}, date_format: DATE_FORMAT, icon : SHARED, id : ID},
        ಠ_ಠ);
      FN.tags = ಠ_ಠ.Tags({functions: FN, state: {session: ರ‿ರ, application: ಱ}}, ಠ_ಠ);
      FN.bulk = ಠ_ಠ.Bulk({functions: FN, state: {session: ರ‿ರ, application: ಱ}}, ಠ_ಠ);
      /* <!-- Set Up / Create the Function Modules --> */
      
    },
    
    initial: () => {
      
      /* <!-- Add Markers --> */
      ಱ.markers = {
        project: "#",
        assignation: "@",
        label: "~",
        split: /[^a-zA-Z0-9#@!\?\-_~]/gi,
        replace: "_"
      };
      
      /* <!-- Setup Showdown --> */
      ಱ.showdown = new showdown.Converter({
        strikethrough: true
      });

      /* <!-- Create Errors Reference --> */
      ಱ.errors = ಠ_ಠ.Errors({}, ಠ_ಠ);
      
      /* <!-- Create Schema Reference --> */
      ಱ.schema = ಠ_ಠ.Schema().latest();
      
      /* <!-- Create Query Reference --> */
      ಱ.query = ಠ_ಠ.Query(ಱ, ಠ_ಠ);
      
      /* <!-- Create Filter Reference --> */
      ಱ.filter = ಠ_ಠ.Filter(ಱ, ಠ_ಠ);
      
      /* <!-- Create Analysis Reference --> */
      ಱ.analysis = ಠ_ಠ.Analysis(ಱ, ಠ_ಠ);
      
      /* <!-- Get Window Title --> */
      ಱ.title = window.document.title;
      
      /* <!-- Get Config Helper --> */
      ಱ.config = ಠ_ಠ.Config({
        fields: {
          comparison: ["data", "view"],
          array: ["calendars", "classes"],
          complex: ["zombie", "ghost", "refresh"],
          simple: ["past", "future"],
        },
        state: STATE_CONFIG
      }, ಠ_ಠ);
      
    },
    
    session: () => {
      
      /* <!-- Setup Today | Override every 15mins --> */
      var _today = () => {
        ರ‿ರ.today = ಠ_ಠ.Dates.now().startOf("day").toDate();
        ಠ_ಠ.Flags.log("Setting Today to:", ರ‿ರ.today);
        _.delay(_today, 900000);
      };
      if (!ರ‿ರ.today) _today();
      
      /* <!-- Create Database Reference --> */
      ರ‿ರ.database = ಠ_ಠ.Database(ಱ, ಠ_ಠ);
      
    },
    
  };
  /* <!-- Setup Functions --> */
  
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
        name: NAME,
        state: ರ‿ರ,
        states: STATES,
        start: FN.setup.routed,
        recent: false,
        simple: true,
        instructions: [{
            match: /SHORTCUT/i,
            show: "SHORTCUT_INSTRUCTIONS",
            title: "Shortcuts ..."
          },{
            match: /NAVIGATION/i,
            show: "NAVIGATION_INSTRUCTIONS",
            title: "Navigation ..."
          },{
            match: /EDIT/i,
            show: "EDIT_INSTRUCTIONS",
            title: "Editing an Item ..."
          },{
            match: /VIEW/i,
            show: "VIEW_INSTRUCTIONS",
            title: "Item Views ..."
          },{
            match: /MOVE/i,
            show: "MOVE_INSTRUCTIONS",
            title: "Moving an Item ..."
          },{
            match: /ANALYSIS/i,
            show: "ANALYSIS_INSTRUCTIONS",
            title: "Task Analysis and Metrics ..."
          },{
            match: /KANBAN/i,
            show: "KANBAN_INSTRUCTIONS",
            title: "Task Management using Kanban ..."
          },{
            match: /PROJECT/i,
            show: "PROJECT_INSTRUCTIONS",
            title: "Managing Project Tags ..."
          },{
            match: /LINKS/i,
            show: "LINK_INSTRUCTIONS",
            title: "Linking to a Database ..."
          },{
            match: /TIMESHEET/i,
            show: "TIMESHEET_INSTRUCTIONS",
            title: "Viewing Tasks as a Timesheet ..."
          }
        ],
        routes: {

          /* <!-- Default Overrides --> */
          create: () => FN.action.clear().then(() => ಠ_ಠ.Display.state().in(STATE_CONFIG) ?
            FN.create.new() : FN.create.default()),

          open: {
            keys: ["o","O"],
            options: FN.picker,
            success: value => ಠ_ಠ.Display.state().in(STATE_OPENED) ?
              FN.open.shared(value.result) : FN.create.existing(value.result),
          },

          close: {
            state: STATE_LOADED,
            keys: ["c", "C"],
            fn: FN.action.default,
          },
          
          load: {
            options: FN.loader,
            success: value => {
              if (ಠ_ಠ.Display.state().in(STATE_OPENED)) {
                FN.open.shared(value.result);
              } else {
                ರ‿ರ.initial = ((value, state) => () => {
                  delete ರ‿ರ.initial;
                  return _.extend(FN.file(value), {view: state});
                })(value.result, value.command && value.command.length >= 2 ?
                  _.find(DISPLAY, state => new RegExp(state, "i").test(value.command[1])) :
                  null);
              }
            }
          },
          /* <!-- Default Overrides --> */


          /* <!-- Custom Routes --> */
          default: {
            matches: /DEFAULT/i,
            length: 0,
            keys: ["h", "H"],
            state: STATE_CONFIG,
            fn: FN.action.default,
          },

          jump: {
            matches: /JUMP/i,
            length: 0,
            keys: ["j", "J", "g", "G"],
            state: DIARIES,
            fn: FN.action.jump,
            routes: {
              today: {
                matches: /TODAY/i,
                length: 0,
                keys: ["t", "T"],
                fn: () => FN.display.current(ಠ_ಠ.Dates.parse(ರ‿ರ.today)),
              },
              forward: {
                matches: /FORWARD/i,
                length: 0,
                keys: ">",
                actions: "swipeleft",
                fn: () => FN.display.current(FN.focus.from().add(1, ಠ_ಠ.Display.state().in(STATE_MONTHLY) ?
                  "months" : "weeks")),
                routes: {
                  day: {
                    matches: /DAY/i,
                    length: 0,
                    keys: ".",
                    fn: () => {
                      var _start = FN.focus.from();
                      FN.display.current(
                        _start.add(ಠ_ಠ.Display.state().in([STATE_MONTHLY, STATE_WEEKLY], true) &&
                          ಠ_ಠ.Dates.isoWeekday(_start) == 6 ? 2 : 1, "days"));
                    },
                  }
                }
              },
              backward: {
                matches: /BACKWARD/i,
                length: 0,
                keys: "<",
                actions: "swiperight",
                fn: () => FN.display.current(FN.focus.from().subtract(1, ಠ_ಠ.Display.state().in(STATE_MONTHLY) ?
                  "months" : "weeks")),
                routes: {
                  day: {
                    matches: /DAY/i,
                    length: 0,
                    keys: ",",
                    fn: () => {
                      var _start = FN.focus.from();
                      FN.display.current(
                        _start.subtract(ಠ_ಠ.Display.state().in([STATE_MONTHLY, STATE_WEEKLY], true) &&
                          ಠ_ಠ.Dates.isoWeekday(_start) == 7 ?
                          2 : 1, "days"));
                    },
                  }
                }
              },

            },
          },

          display: {
            matches: /DISPLAY/i,
            state: STATE_OPENED,
            routes: {
              daily: {
                matches: /DAILY/i,
                keys: ["d", "D"],
                fn: () => FN.display.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.views.daily, FN.display.cleanup())
                  .then(() => FN.view(), ಠ_ಠ.Display.state().change(DISPLAY, STATE_DAILY))
              },
              weekly: {
                matches: /WEEKLY/i,
                keys: ["w", "W"],
                fn: () => FN.display.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.views.weekly, FN.display.cleanup())
                  .then(() => FN.view(), ಠ_ಠ.Display.state().change(DISPLAY, STATE_WEEKLY))
              },
              monthly: {
                matches: /MONTHLY/i,
                keys: ["m", "M"],

                fn: () => FN.display.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.views.monthly, FN.display.cleanup())
                  .then(() => FN.view(), ಠ_ಠ.Display.state().change(DISPLAY, STATE_MONTHLY))
              },
              analysis: {
                matches: /ANALYSIS/i,
                keys: ["a", "A"],
                requires: "d3",
                fn: () => FN.views.analysis(FN.display.cleanup())
                  .then(() => FN.view("Analysis"), ಠ_ಠ.Display.state().change(DISPLAY, STATE_ANALYSIS))
              },
              kanban: {
                matches: /KANBAN/i,
                keys: ["k", "K"],
                fn: () => FN.views.kanban({
                  past: ರ‿ರ.config.settings.past,
                  future: ರ‿ರ.config.settings.future,
                }, FN.display.cleanup())
                  .then(ಠ_ಠ.Main.busy("Loading View"))
                  .then(() => FN.view("Kanban"), ಠ_ಠ.Display.state().change(DISPLAY, STATE_KANBAN))
              },
              queue: {
                matches: /QUEUE/i,
                keys: ["q", "Q"],
                fn: () => FN.views.queue(FN.display.cleanup())
                  .then(() => FN.view("Queue"), ಠ_ಠ.Display.state().change(DISPLAY, STATE_QUEUE))
              },
              projects: {
                matches: /PROJECTS/i,
                keys: ["p", "P"],
                fn: () => FN.views.projects(FN.display.cleanup())
                  .then(() => FN.view("Projects"), ಠ_ಠ.Display.state().change(DISPLAY, STATE_PROJECTS))
              },
              timesheet: {
                matches: /TIMESHEET/i,
                keys: ["l", "L"],
                fn: () => FN.views.timesheet(FN.display.cleanup())
                  .then(timesheet => ರ‿ರ.timesheet = timesheet, FN.view("Timesheet"), ಠ_ಠ.Display.state().change(DISPLAY, STATE_TIMESHEET))
              }
            }
          },

          show: {
            matches: /SHOW/i,
            state: DIARIES,
            routes: {
              classes: {
                matches: /CLASSES/i,
                fn: FN.options.process("classes")
              },
              calendars: {
                matches: /CALENDARS/i,
                fn: FN.options.process("calendars")
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
                          ಠ_ಠ.Display.state().exit([STATE_CONFIG, STATE_OPENED]) && ಠ_ಠ.Router.run(STATE_READY)
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
              
              edit: {
                matches: /EDIT/i,
                keys: ["e", "E"],
                fn: () => {
                  ಠ_ಠ.Display.state().enter(STATE_PREFERENCES);
                  return ಱ.config.edit(ರ‿ರ.config.settings)
                    .then(values => {
                      ಠ_ಠ.Display.state().exit(STATE_PREFERENCES);
                      return values !== undefined ? 
                        ಱ.config.update(ರ‿ರ.config.id, _.defaults(ಱ.config.process(values, ರ‿ರ.config.settings), ರ‿ರ.config.settings))
                          .then(ಠ_ಠ.Main.busy("Saving Config"))
                          .then(() => ಱ.config.get().then(ಠ_ಠ.Main.busy("Loading Config")))
                          .then(config => FN.action.start((ರ‿ರ.config = config).settings)) : false;
                      
                    });
                }
              },
              
              set: {
                matches: /SET/i,
                state: STATE_PREFERENCES,
                routes: {
                  data: {
                    matches: /DATA/i,
                    fn: () => ಠ_ಠ.Router.pick.single(FN.picker())
                      .then(file => $("input[type='text'][name='data']").val(file.id)),
                    
                  }
                }
              },
              
              add: {
                matches: /ADD/i,
                state: STATE_PREFERENCES,
                routes: {
                  calendar: {
                    matches: /CALENDAR/i,
                    fn: () => FN.calendars.choose($("div[data-output-field='calendars'] a[role='button']").addClass("loader"))
                      .then(results => _.tap(results,
                                             () => $("div[data-output-field='calendars'] a[role='button']").removeClass("loader")))
                      .then(results => results !== false ? 
                            ಱ.config.add("calendars", "calendar", results) : results)
                  },
                  class: {
                    matches: /CLASS/i,
                    fn: () => FN.classes.choose($("div[data-output-field='classes'] a[role='button']").addClass("loader"))
                      .then(results => _.tap(results,
                                             () => $("div[data-output-field='classes'] a[role='button']").removeClass("loader")))
                      .then(results => results !== false ?
                            ಱ.config.add("classes", "class", results) : results)
                  }
                }
              },
              
              remove: {
                matches: /REMOVE/i,
                state: STATE_PREFERENCES,
                routes: {
                  calendar: {
                    matches: /CALENDAR/i,
                    length: 1,
                    fn: id => ಱ.config.remove("calendars", decodeURIComponent(id).replace(/\|/gi, "."))
                  },
                  class: {
                    matches: /CLASS/i,
                    length: 1,
                    fn: id => ಱ.config.remove("classes", decodeURIComponent(id).replace(/\|/gi, "."))
                  }
                }
              },
              
            }
          },

          search: {
            matches: /SEARCH/i,
            routes: {
              default: {
                length: 0,
                state: DIARIES,
                keys: ["s", "S", "f", "F"],
                fn: FN.search,
              },
              tags: {
                matches: /TAGS/i,
                state: DISPLAY,
                length: {
                  min: 1,
                  max: 2
                },
                fn: command => _.isArray(command) ?
                  FN.display.tagged(decodeURIComponent(command[0]), command[1] && command[1].toLowerCase() === "true") :
                  FN.display.tagged(decodeURIComponent(command))
                    .then(results => ಠ_ಠ.Flags.log(`Found Docket ${results.length} Item${results.length > 1 ? "s" : ""}`, results))
              }
            }
          },

          edit: {
            matches: /EDIT/i,
            state: DISPLAY,
            routes: {
              tags: {
                matches: /TAGS/i,
                length: 1,
                fn: command => FN.tasks.tag($(`#item_${command}`))
              },
            }
          },

          new: {
            matches: /NEW/i,
            state: [STATE_KANBAN, STATE_PROJECTS].concat(DIARIES),
            routes: {
              task: {
                matches: /TASK/i,
                length: 0,
                keys: ["n", "N"],
                fn: FN.tasks.new
              },
            }
          },

          add: {
            matches: /ADD/i,
            routes: {
              tags: {
                matches: /TAGS/i,
                state: STATE_TIMESHEET,
                length: 0,
                fn: () => FN.bulk.tags.add(ರ‿ರ.timesheet.items())
                  .then(result => result !== null && result !== false ? ರ‿ರ.timesheet.refresh() : result)
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
                fn: command => FN.tasks.detag($(`#item_${command[0]}`),
                  decodeURIComponent(command[1]))
              },
            }
          },
          
          timesheet: {
            matches: /TIMESHEET/i,
            state: STATE_TIMESHEET,
            routes: {
              tag: {
                matches: /SUMMARY/i,
                length: 0,
                fn: () => ರ‿ರ.timesheet.summary()
              },
            }
          },

          archive: {
            matches: /ARCHIVE/i,
            state: STATE_OPENED,
            length: 0,
            fn: FN.archive.run
          },

          refresh: {
            matches: /REFRESH/i,
            state: DISPLAY,
            length: 0,
            keys: ["r", "R"],
            fn: FN.action.refresh
          },
          /* <!-- Custom Routes --> */

        },
        route: (handled, command) => {
          if (handled) return;
          var _parsed = ಠ_ಠ.Dates.parse(command);
          if (_parsed.isValid()) FN.display.current(_parsed);
        }
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Start App after fully loaded (but BEFORE routing) --> */
    start: () => {
      ಠ_ಠ.Flags.log("APP Start Called");
      FN.setup.initial();
    },

    /* <!-- App is ready for action! --> */
    ready: () => {
      ಠ_ಠ.Flags.log("App is now READY");
      FN.setup.session();
    },
    
    /* <!-- App is usable (all initial routes processed!) --> */
    /* <!-- This is run here (rather than router start) to ensure any initial loads are done first --> */
    finally: () => ಱ.config.get()
          .then(ಠ_ಠ.Main.busy("Loading Config"))
          .then(config => !(ರ‿ರ.config = config) ?
            ಠ_ಠ.Router.run(STATE_READY) :
            FN.action.start((ರ‿ರ.initial ? _.defaults(ರ‿ರ.initial(), config.settings) : config.settings))
              .then(result => result === false ?
                ಠ_ಠ.Router.run(STATE_CONFIG) : true)),
    
    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,
  };

};