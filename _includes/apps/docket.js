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
    STATE_CALENDARS = "calendars",
    STATE_CLASSES = "classes",
    STATE_PREFERENCES = "preferences",
    STATES = [STATE_READY, STATE_CONFIG, STATE_OPENED, STATE_DEFAULT, STATE_LOADED,
      STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY,
      STATE_KANBAN, STATE_ANALYSIS, STATE_QUEUE, STATE_PROJECTS,
      STATE_CALENDARS, STATE_CLASSES, STATE_PREFERENCES
    ],
    SOURCE = [STATE_DEFAULT, STATE_LOADED],
    DIARIES = [STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY],
    DISPLAY = [STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY, STATE_KANBAN, STATE_ANALYSIS, STATE_QUEUE, STATE_PROJECTS];
  /* <!-- State Constants --> */
  
  /* <!-- Scope Constants --> */
  const SCOPE_CALENDARS = "https://www.googleapis.com/auth/calendar.readonly",
        SCOPE_FULL_DRIVE = "https://www.googleapis.com/auth/drive";
  /* <!-- Scope Constants --> */
  
  /* <!-- Internal Constants --> */
  const ID = "diary",
        PREFERENCES = "edit_Preferences",
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

  /* <-- Helper Functions --> */
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
  /* <-- Helper Functions --> */

  
  /* <-- Search Function --> */
  FN.search = () => ಠ_ಠ.Display.text({
        message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
        action: "Search",
        simple: true,
      }).then(query => query ? FN.display.list(ರ‿ರ.database.search(query, !ರ‿ರ.show ?
        ರ‿ರ.today : ರ‿ರ.show >= ರ‿ರ.today ?
        ರ‿ರ.show : false)) : false)
      .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"));
  /* <-- Search Function --> */
  

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
        data: data && data.spreadsheetId ? data.spreadsheetId : data,
        calendar: false,
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
        ಠ_ಠ.Display.state().enter(STATE_CONFIG);
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
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error")),

    edit: () => ಠ_ಠ.Display.modal("config", {
        id: PREFERENCES,
        title: "Preferences",
        enter: true,
        state: {
          data: ರ‿ರ.config.data,
          view: ರ‿ರ.config.view,
          ghost: ರ‿ರ.config.ghost === false ? 0 : ರ‿ರ.config.ghost,
          zombie: ರ‿ರ.config.zombie === false ? 0 : ರ‿ರ.config.zombie,
          calendars: ರ‿ರ.config.calendars,
          classes: ರ‿ರ.config.classes,
          past: ರ‿ರ.config.past,
          future: ರ‿ರ.config.future,
          refresh: ರ‿ರ.config.refresh === false ? 0 : ರ‿ರ.config.refresh
        }
      }),
    
    field: field =>  $(`#${PREFERENCES} div[data-output-field='${field}']`),
    
    label: field => field.find("small.form-text").toggleClass("d-none", field.find("li").length === 0),
    
    remove: (field, id) => FN.config.label(FN.config.field(field).find(`li[data-id='${id}']`).remove()),
    
    add: (field, template, items) => {
      var _field = FN.config.field(field), _list = _field.children("ul");
      _.each(items, item => {
        if (_list.find(`li[data-id='${item.id}']`).length === 0)
          $(ಠ_ಠ.Display.template.get((_.extend({
            template: template
          }, item)))).appendTo(_list);
      });
      FN.config.label(_field);
    },
    
    process: values => {
      
      var _config = {};

      /* <!-- Comparison Sets --> */
      _.each(["data", "view"], prop => {
        if (values[prop] && ರ‿ರ.config[prop] != values[prop].Value)
        _config[prop] = values[prop].Value;
      });

      /* <!-- Array Sets (override) --> */
      _.each(["calendars", "classes"], prop => {
        values[prop] && (
          (_.isArray(values[prop].Values) && values[prop].Values.length > 0) ||
          (_.isObject(values[prop].Values) && values[prop].Values.id)) ?
          _config[prop] = _.isArray(values[prop].Values) ? 
            values[prop].Values : [values[prop].Values] :
          delete ರ‿ರ.config[prop];
      });

      /* <!-- Complex Sets --> */
      _.each(["zombie", "ghost", "refresh"], prop => {
        values[prop] === undefined ?
          delete ರ‿ರ.config[prop] :
          values[prop].Value <= 0 ? 
            _config[prop] = false :
            values[prop] ? 
              _config[prop] = values[prop].Value :
              delete ರ‿ರ.config[prop];
      });

      /* <!-- Simple Sets --> */
      _.each(["past", "future"], prop => {
        values[prop] === undefined ?
          delete ರ‿ರ.config[prop] :
          values[prop] && values[prop].Value >= 0 ? 
              _config[prop] = values[prop].Value :
              delete ರ‿ರ.config[prop];
      });
                      
      return _config;
      
    }
    
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


  /* <-- Focus Functions --> */
  FN.focus = {

    date: () => ರ‿ರ.show || ರ‿ರ.today,

    from: () => ಠ_ಠ.Dates.parse(FN.focus.date()),

  };
  /* <-- Focus Functions --> */


  /* <-- Display Functions --> */
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
      FN.display.list(ರ‿ರ.database.tagged(tag, all), `Tasks for Project: ${tag.replace(ಱ.markers.project,"")}`, ಱ.analysis.analysis(tag, ರ‿ರ.db)) : 
        tag.indexOf(ಱ.markers.assignation) === 0 ? 
          FN.display.list(ರ‿ರ.database.tagged(tag), `Tasks for: ${tag.replace(ಱ.markers.assignation,"")}`, ಱ.analysis.analysis(tag, ರ‿ರ.db)):
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

      (ಠ_ಠ.Display.state().in([STATE_CALENDARS, STATE_CLASSES], true) && (ರ‿ರ.config.calendars || ರ‿ರ.config.classes) ?
        ಠ_ಠ.Main.authorise(SCOPE_CALENDARS).then(result => result === true ? Promise.all(
            _.map([].concat(ರ‿ರ.config.calendars || [],
                _.filter(ರ‿ರ.config.classes || [], item => item.calendar)), item =>
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
  /* <-- Display Functions --> */
  

  /* <-- Action Functions --> */
  FN.action = {

    /* <-- reset = Reset View to default / configured default --> */
    load: (config, reset) => Promise.resolve((ಱ.task = ಠ_ಠ.Task({
          schema: ಱ.schema,
          zombie: ರ‿ರ.config.zombie,
          ghost: ರ‿ರ.config.ghost,
          functions: FN,
          state: {
            session: ರ‿ರ,
            application: ಱ,
          },
          markers: ಱ.markers
        }, ಠ_ಠ)))
      .then(task => (ಱ.schema.process = task.process())) /* <!-- Create Processing Task Function --> */
      .then(() => {
        /* <-- Get Custom Title, and Version from File Properties, if not already loaded --> */
        if (config.title === undefined) {
          return ಠ_ಠ.Google.files.get((config || ರ‿ರ.config).data, true)
            .then(file => {
              window.document.title = file.properties && file.properties.TITLE ? file.properties.TITLE : ಱ.title;
              return file.version;
            });
        } else {
          window.document.title = config.title || ಱ.title;
          return (config || ರ‿ರ.config).version;
        }
      })
      .then(version => Promise.all([].concat(
        ರ‿ರ.database.open(ರ‿ರ.refresh = (config || ರ‿ರ.config).data, version),
        ರ‿ರ.config.classes ? FN.classes.load(ರ‿ರ.config.classes) : [])))
      .then(results => {
        $("nav a[data-link='sheet']").prop("href", `https://docs.google.com/spreadsheets/d/${ರ‿ರ.refresh}/edit`);
        ಠ_ಠ.Display.state().change(SOURCE, [STATE_OPENED]
          .concat([!config || config.data == ರ‿ರ.config.data ? STATE_DEFAULT : STATE_LOADED]));
        ರ‿ರ.db = results[0];
        if (results[1]) ರ‿ರ.deadlines = results[1];
        ಱ.errors.empty();
      })
      .then(ಠ_ಠ.Main.busy("Loading Data"))
      .then(() => reset ? ಠ_ಠ.Display.state().change(DISPLAY, DISPLAY.indexOf((config || ರ‿ರ.config).view) >= 0 ?
                                             (config || ರ‿ರ.config).view : STATE_WEEKLY) : false)
      .then(() => ಠ_ಠ.Display.state().in(DIARIES, true) ? 
              FN.display.current(ಠ_ಠ.Dates.parse(FN.focus.date())) :
              ಠ_ಠ.Display.state().in(STATE_ANALYSIS) ? FN.views.analysis(FN.display.cleanup()) :
              ಠ_ಠ.Display.state().in(STATE_KANBAN) ? FN.views.kanban({
                past: ರ‿ರ.config.past,
                future: ರ‿ರ.config.future,
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

      /* <-- Open and render data --> */
      return FN.action.load(ರ‿ರ.refresh ? {data: ರ‿ರ.refresh} : null);

    },

    start: config => {

      /* <-- Remove old and unused config settings --> */
      delete config.calendar;
      _.each(config, (value, key) => value === false && (key !== "zombie" && key !== "ghost") ?
             delete config[key] : null);

      /* <-- Set States from Config --> */
      FN.options.calendars(!!config.calendars);
      FN.options.classes(!!config.classes);

      /* <-- Set Name from Config (if available, and also if supplied config is not the same as default config) --> */
      config.name && (!ರ‿ರ.config || config.data != ರ‿ರ.config.data) ? ರ‿ರ.name = config.name : delete ರ‿ರ.name;

      /* <-- Set Refresh Timer Period --> */
      config.refresh !== false ? FN.background.start(config, config.refresh || 15) : false;
      
      /* <-- Open and render data --> */
      return FN.action.load(config, true);

    },
    
    clear : () => ರ‿ರ.config && ರ‿ರ.config.data != ರ‿ರ.refresh ? FN.menu.remove(ರ‿ರ.refresh) : Promise.resolve(),
    
    default: () => FN.action.clear().then(() => FN.action.start(ರ‿ರ.config)),

  };
  /* <-- Action Functions --> */

  
  /* <-- Create Functions --> */
  FN.create = {

    /* <-- Create new Config, and open/create DB --> */
    default: () =>

      /* <-- Clear any existing config --> */
      FN.config.clear()

      /* <-- Search for existing docket files owned by user --> */
      .then(() => ಠ_ಠ.Google.files.search(ಠ_ಠ.Google.files.natives()[1],
        `${ಱ.schema.property.name}=${ಱ.schema.property.value}`, true))
    
      /* <-- Prompt User to use an existing file as their default docket database --> */
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

      /* <-- Return the File ID if selected, otherwise create new DB --> */
      .then(result => result ? result.value : ರ‿ರ.database.create(ಱ.schema.sheets.sheet_tasks, ಱ.schema.names.spreadsheet, ಱ.schema.names.sheet))

      /* <-- Create/save new Config with the file ID --> */
      .then(FN.config.create)

      /* <-- Show / Then Close Busy Indication  --> */
      .then(ಠ_ಠ.Main.busy("Creating Config"))

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(() => FN.action.start(ರ‿ರ.config)),


    /* <-- Create new Config with existing file --> */
    existing: value => FN.config.create(value.id)

      /* <-- Show / Then Close Busy Indication --> */
      .then(ಠ_ಠ.Main.busy("Creating Config"))

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(() => FN.action.start(ರ‿ರ.config)),


    /* <-- Create new Shared Database --> */
    new: () => 
    
      /* <-- Prompt User for new file name --> */
      ಠ_ಠ.Display.text({
        id: "file_name",
        title: "File Name",
        message: ಠ_ಠ.Display.doc.get("FILE_NAME"),
        simple: true,
        state: {
          value: "Shared Docket Data"
        }
      })
    
      /* <-- Create new DB --> */
      .then(name => name ? ರ‿ರ.database.create(ಱ.schema.sheets.sheet_tasks, name, ಱ.schema.names.sheet)
            .then(ಠ_ಠ.Main.busy("Creating Database")) : false)

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(sheet => sheet ? FN.open.shared({
          id: sheet.spreadsheetId,
          name: sheet.properties.title
        }) : false)
    
      .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying Text Prompt", e) :
          ಠ_ಠ.Flags.log("Text Prompt Cancelled")).negative())

  };
  /* <-- Create Functions --> */


  /* <-- Open Functions --> */
  FN.open = {

    /* <-- Open Default Configuration Database --> */
    default: value =>

      /* <-- Find existing config --> */
      FN.config.find()

      /* <-- Update Existing or Create New config --> */
      .then(config => config ?
        FN.config.update(config.id, {
          data: value.id
        }) : FN.config.create(value.id))

      /* <-- Show / Then Close Busy Indication  --> */
      .then(ಠ_ಠ.Main.busy("Loading Config"))

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(() => FN.action.start(ರ‿ರ.config)),

    /* <-- Open Shared Database --> */
    shared: value => (ರ‿ರ.config && ರ‿ರ.config.data != value.id ? FN.menu.add(value) : Promise.resolve(value))
      .then(value => FN.action.start(_.defaults(FN.file(value), ರ‿ರ.config))),

  };
  /* <-- Open Functions --> */
      
      
  /* <-- Background | Refresh Functions --> */
  FN.background = {
    
    start: (config, interval) => {
      
      /* <-- Close function will terminate previous timeout function (also used with Router State clearing) --> */
      if (ರ‿ರ.background && ರ‿ರ.background.close) ರ‿ರ.background.close();
      
      var _refresh = () => {
        /* <-- Check if modal or editing UI is visible before proceeding --> */
        if ($("div.item div.edit:visible, div.modal.show:visible, .drop-target:visible").length === 0) {
          ಠ_ಠ.Flags.log("Underlying Data Change Detected: RELOADING");
          /* <-- TODO: Rather brute force! Should update DB silently if change is not on current view... --> */
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
  /* <-- Refresh Functions --> */
  
  
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      /* <!-- Set Up / Create the Function Modules --> */
      FN.menu = ಠ_ಠ.Menu({
          state : STATE_LOADED,
          icon : SHARED
        }, ಠ_ಠ);
      FN.graphs = ಠ_ಠ.Graphs();
      FN.classes = ಠ_ಠ.Classes({}, ಠ_ಠ);
      FN.calendars = ಠ_ಠ.Calendars({}, ಠ_ಠ);
      FN.archive = ಠ_ಠ.Archive({functions: FN, state: {session: ರ‿ರ, application: ಱ}}, ಠ_ಠ);
      FN.tasks = ಠ_ಠ.Tasks({functions: FN, state: {session: ರ‿ರ, application: ಱ}, date_format: DATE_FORMAT}, ಠ_ಠ);
      FN.views = ಠ_ಠ.Views({functions: FN, state: {session: ರ‿ರ, application: ಱ}, date_format: DATE_FORMAT, icon : SHARED, id : ID}, ಠ_ಠ);
      /* <!-- Set Up / Create the Function Modules --> */
      
      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Docket",
        state: ರ‿ರ,
        states: STATES,
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
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_DAILY))
              },
              weekly: {
                matches: /WEEKLY/i,
                keys: ["w", "W"],
                fn: () => FN.display.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.views.weekly, FN.display.cleanup())
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_WEEKLY))
              },
              monthly: {
                matches: /MONTHLY/i,
                keys: ["m", "M"],

                fn: () => FN.display.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.views.monthly, FN.display.cleanup())
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_MONTHLY))
              },
              analysis: {
                matches: /ANALYSIS/i,
                keys: ["a", "A"],
                requires: "d3",
                fn: () => FN.views.analysis(FN.display.cleanup())
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_ANALYSIS))
              },
              kanban: {
                matches: /KANBAN/i,
                keys: ["k", "K"],
                fn: () => FN.views.kanban({
                  past: ರ‿ರ.config.past,
                  future: ರ‿ರ.config.future,
                }, FN.display.cleanup())
                  .then(ಠ_ಠ.Main.busy("Loading View"))
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_KANBAN))
              },
              queue: {
                matches: /QUEUE/i,
                keys: ["q", "Q"],
                fn: () => FN.views.queue(FN.display.cleanup())
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_QUEUE))
              },
              projects: {
                matches: /PROJECTS/i,
                keys: ["p", "P"],
                fn: () => FN.views.projects(FN.display.cleanup())
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_PROJECTS))
              },
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
                    ಠ_ಠ.Display.busy() && FN.config.clear() : false)
                  .then(cleared => cleared ?
                    ಠ_ಠ.Display.state().exit([STATE_CONFIG, STATE_OPENED]) && ಠ_ಠ.Router.run(STATE_READY) :
                        false)
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
              },
              
              download: {
                matches: /DOWNLOAD/i,
                fn: () => {
                  FN.config.find()
                    .then(FN.config.load)
                    .then(ಠ_ಠ.Main.busy("Loading Config"))
                    .then(config => ಠ_ಠ.Saver({}, ಠ_ಠ)
                          .save(JSON.stringify(config, null, 2), "docket-config.json", "application/json"));
                }
              },
              
              edit: {
                matches: /EDIT/i,
                keys: ["e", "E"],
                fn: () => {
                  ಠ_ಠ.Display.state().enter(STATE_PREFERENCES);
                  return FN.config.edit().then(values => {
                    ಠ_ಠ.Display.state().exit(STATE_PREFERENCES);
                    return values !== undefined ? FN.config.update(ರ‿ರ.id, FN.config.process(values))
                        .then(ಠ_ಠ.Main.busy("Saving Config"))
                        .then(() => FN.config.get()
                          .then(ಠ_ಠ.Main.busy("Loading Config"))
                          .then(config => FN.action.start(config))) : false;
                      
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
                      .then(file => $(`#${PREFERENCES}_data`).val(file.id)),
                  }
                }
              },
              
              add: {
                matches: /ADD/i,
                state: STATE_PREFERENCES,
                routes: {
                  calendar: {
                    matches: /CALENDAR/i,
                    fn: () => FN.calendars.choose($(`#${PREFERENCES}_add_calendar`).addClass("loader"))
                      .then(results => _.tap(results,
                                             () => $(`#${PREFERENCES}_add_calendar`).removeClass("loader")))
                      .then(results => results !== false ? 
                            FN.config.add("calendars", "calendar", results) : results)
                  },
                  class: {
                    matches: /CLASS/i,
                    fn: () => FN.classes.choose($(`#${PREFERENCES}_add_class`).addClass("loader"))
                      .then(results => _.tap(results,
                                             () => $(`#${PREFERENCES}_add_class`).removeClass("loader")))
                      .then(results => results !== false ?
                            FN.config.add("classes", "class", results) : results)
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
                    fn: id => FN.config.remove("calendars", decodeURIComponent(id).replace(/\|/gi, "."))
                  },
                  class: {
                    matches: /CLASS/i,
                    length: 1,
                    fn: id => FN.config.remove("classes", decodeURIComponent(id).replace(/\|/gi, "."))
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

      /* <!-- Setup Today | Override every 15mins --> */
      var _today = () => {
        ರ‿ರ.today = ಠ_ಠ.Dates.now().startOf("day").toDate();
        ಠ_ಠ.Flags.log("Setting Today to:", ರ‿ರ.today);
        _.delay(_today, 900000);
      };
      _today();

      /* <!-- Add Markers --> */
      ಱ.markers = {
        project: "#",
        assignation: "@",
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
      
      /* <!-- Create Database Reference --> */
      ರ‿ರ.database = ಠ_ಠ.Database(ಱ, ಠ_ಠ);
      
      /* <!-- Get Window Title --> */
      ಱ.title = window.document.title;
      
      ಠ_ಠ.Flags.log("APP Start Called");

    },

    /* <!-- App is ready for action! --> */
    ready: () => ಠ_ಠ.Flags.log("App is now READY"),
    
    /* <!-- App is usable (all initial routes processed!) --> */
    /* <!-- This is run here (rather than router start) to ensure any initial loads are done first --> */
    finally: () => FN.config.get()
          .then(ಠ_ಠ.Main.busy("Loading Config"))
          .then(config => !config ?
            ಠ_ಠ.Router.run(STATE_READY) :
            FN.action.start(ರ‿ರ.initial ? _.defaults(ರ‿ರ.initial(), config) : config)
              .then(result => result === false ?
                ಠ_ಠ.Router.run(STATE_CONFIG) : true)),
    
    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,
  };

};