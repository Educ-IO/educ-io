Views = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle different views --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const ACTIONS = {
    CATEGORISED : {
      action: "new.task",
      icon: "add",
      class: "btn-dark"
    },
    TEMPORAL : {
      list: [{
        action: "new.task",
        icon: "add",
        class: "btn-dark"
      }, {
        action: "search",
        icon: "search"
      }, {
        action: "jump",
        icon: "swap_calls"
      }, {
        action: "jump.today",
        icon: "home",
        class: "btn-primary"
      }, {
        action: "instructions.shortcut",
        icon: "live_help",
        class: "btn-info"
      }],
      icon: "edit"
    },
    
  }, EMPTY = "", FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.helpers = {
    
    owner: file => file.ownedByMe ? "Me" : file.owners && file.owners.length > 0 ? file.owners[0].displayName : "Shared Drive",

    email: file => file.owners && file.owners.length > 0 && file.owners[0].emailAddress ? file.owners[0].emailAddress : EMPTY,
    
    command: file => `google,load.${file.id}`,
    
    url: file => `${factory.Flags.full()}${factory.Flags.dir()}/#${FN.helpers.command(file)}`,
    
  };
  
  FN.scroll = (target, container) => {

      /* <!-- Scroll to today if visible --> */
      if (Element.prototype.scrollIntoView && !factory.Flags.debug()) {
        target = _.isString(target) ? container.find(target) : target;
        target = target.length > 0 ? target : container;
        if (target[0].scrollIntoView) {
          target[0].scrollIntoView({
            block: "start",
            inline: "nearest"
          });
          if (window.scrollBy && container.outerHeight(true) > $(window).height()) window.scrollBy(0, -10);
        }
      }
    };
  
  FN.day = (focus, overlay) => {

    var _return = {};
    _return.diff = focus.diff(options.state.session.show, "days");
    _return.display = focus.format(options.date_format);
    _return.start = focus.clone().startOf("day");
    _return.end = focus.clone().endOf("day");
    _return.all = options.state.application.task.prepare(options.state.session.db ? options.state.session.database.query(focus, focus.isSame(options.state.session.today)) : []);
    _return.tasks = _.chain(_return.all).filter(item => !item.IS_TIMED)
      .sortBy("DETAILS").sortBy("IS_GHOST").sortBy("ORDER").sortBy("COUNTDOWN").value();
    _return.events = _.chain(_return.all).filter(item => item.IS_TIMED)
      .sortBy(item => factory.Dates.parse(item.TIME, ["h:m a", "H:m", "h:hh A"]).toDate()).value();
    _return.extras = _.chain(overlay)
      .filter(item => (item.due || item.end).isSameOrAfter(_return.start) &&
        (item.due || item.start).isSameOrBefore(_return.end))
      .sortBy(item => (item.due || item.start).toDate())
      .value();

    _return.length = _.reduce([_return.tasks, _return.events, _return.extras], (total, items) => total + (items ? items.length : 0), 0);

    return _return;

  };
  
  FN.daily = (focus, overlay) => {

      var _data = FN.day(focus, overlay),
        _diary = options.functions.tasks.hookup(factory.Display.template.show({
          template: "daily",
          id: options.id,
          name: options.state.session.name,
          icon: options.icon,
          title: _data.start.format("ddd"),
          day: _data.start.format("Do"),
          date: _data.start,
          tasks: _data.tasks,
          events: _data.events,
          extras: _data.extras,
          action: ACTIONS.TEMPORAL,
          target: factory.container,
          clear: true,
        }));

      FN.scroll(_diary.find("h4.name, div.day"), _diary);

    };
  
  FN.weekly = (focus, overlay) => {

      focus = factory.Dates.isoWeekday(focus) == 7 ? focus.subtract(1, "days") : focus;
      var _today = focus.isSame(options.state.session.today);

      var _days = [],
        _add = (date, css, action, tasks, events, extras, type) => {
          _days.push({
            sizes: factory.Dates.isoWeekday(date) >= 6 ? {
              xs: 12
            } : {
              lg: type.large ? 9 : type.small.before ? 3 : 6,
              xl: type.large ? 6 : type.small.before || type.small.after ? 3 : 4
            },
            row_sizes: factory.Dates.isoWeekday(date) == 6 ? {
              lg: type.large ? 9 : type.small.before ? 3 : 6,
              xl: type.large ? 6 : type.small.before || type.small.after ? 3 : 4
            } : false,
            title: date.format("ddd"),
            date: date.clone(),
            instruction: factory.Dates.isoWeekday(date) == 6 ? "row-start" : factory.Dates.isoWeekday(date) == 7 ? "row-end" : false,
            class: factory.Dates.isoWeekday(date) >= 6 ? `p-0 ${css.block}` : css.block,
            action: action,
            title_class: css.title,
            wide: css.wide,
            tasks: tasks,
            events: events,
            extras: extras
          });
        };

      focus = focus.add(factory.Dates.isoWeekday(focus) == 1 ? -3 : -2, "days");

      _.times(7, () => {

        focus = focus.add(1, "days");

        var _data = FN.day(focus, overlay),
          _day = factory.Dates.isoWeekday(focus),
          _lg = _data.diff === 0 || (_day == 6 && _data.diff == -1) || (_day == 7 && _data.diff == 1),
          _sm_Before = !_lg && (_data.diff == -1 || (_day == 5 && _data.diff == -2) || (_day == 6 && _data.diff == -2)),
          _sm_After = !_lg && (_data.diff == 1 || (_day == 1 && _data.diff == 2)),
          _sizes = {
            large: _lg,
            small: {
              before: _sm_Before,
              after: _sm_After,
            }
          };

        _add(focus, {
          block: focus.isSame(options.state.session.today) || (factory.Dates.isoWeekday(focus) == 6 && focus.clone().add(1, "days").isSame(options.state.session.today)) ?
            "present bg-highlight-gradient top-to-bottom" : _data.diff === 0 ?
            "focussed bg-light" : focus.isBefore(options.state.session.today) ? "past text-muted" : "future",
          title: focus.isSame(options.state.session.today) ?
            "present" : _data.diff === 0 ? "bg-bright-gradient left-to-right" : "",
          wide: _data.diff === 0
        }, _data.display, _data.tasks, _data.events, _data.extras, _sizes);

      });

      var _diary = options.functions.tasks.hookup(factory.Display.template.show({
        template: "weekly",
        id: options.id,
        name: options.state.session.name,
        icon: options.icon,
        days: _days,
        action: ACTIONS.TEMPORAL,
        target: factory.container,
        clear: true,
      }));

      /* <!-- Scroll to today if visible --> */
      FN.scroll(_diary.find(`h4.name, ${_today ? "div.present" : "div.focussed"}`), _diary);

    };
  
  FN.monthly = (focus, overlay) => {

      var _today = focus.isSame(options.state.session.today),
        _end = focus.clone().endOf("month");
      focus = focus.clone().startOf("month").subtract(1, "days");

      var _days = [],
        _add = (date, css, action, tasks, events, extras, large) => {
          _days.push({
            title: date.format("ddd"),
            subtitle: date.format("Do"),
            date: date.clone(),
            class: css.block,
            action: action,
            title_class: css.title,
            tasks: tasks,
            events: events,
            extras: extras,
            large: large,
          });
        };

      _.times(_end.date(), index => {

        focus = focus.add(1, "days");

        var _data = FN.day(focus, overlay),
          _type = focus.isSame(options.state.session.today) ? "present" : _data.diff === 0 ? "focussed" :
          focus.isBefore(options.state.session.today) ? "past text-muted" : "future",
          _border = focus.isSame(options.state.session.today) ?
          "border border-white rounded bg-highlight-gradient top-to-bottom" :
          index % 2 ? "bg-light" : "",
          _title = focus.isSame(options.state.session.today) ?
          "present" : _data.diff === 0 ? "bg-bright-gradient left-to-right" :
          index % 2 ? "border-left border-bottom border-secondary" : "";

        _add(focus, {
            block: `${_type} ${_border}`.trim(),
            title: `${_title ? `${_title} ` : ""}ml-2 mb-1`,
          }, _data.display, _data.tasks, _data.events, _data.extras,
          focus.isSame(options.state.session.today) && _data.length > 5);

      });

      var _diary = options.functions.tasks.hookup(factory.Display.template.show({
        template: "monthly",
        id: options.id,
        name: options.state.session.name,
        icon: options.icon,
        title: _end.format("MMM"),
        year: _end.format("YYYY"),
        days: _days,
        action: ACTIONS.TEMPORAL,
        target: factory.container,
        clear: true,
      }));

      FN.scroll(_diary.find(`h4.name, ${_today ? "div.present" : "div.focussed"}`), _diary);

    };
  
  FN.analysis = () => new Promise(resolve => {

      var _summary = options.state.application.analysis.summary(null, options.state.session.db),
          _analysis = factory.Display.template.show({
            template: "analysis",
            id: "analysis",
            name: options.state.session.name,
            title: "Stats",
            projects: _summary.projects,
            tags: _summary.tags,
            summary: _summary,
            target: factory.container,
            clear: true,
          }),
          _visualise = () => {
            
            /* <!-- Clear Row for Visualisation --> */
            var _busy = factory.Display.busy({
                   status: "Analysing Data",
                   fn: true
                 });
            
            var _tags = _analysis.find("#filter_Tags").prop("checked") ?
                  _.map(_analysis.find(".tag-filter input:checked"), el => $(el).data("tag")) : false,
                _project = _analysis.find("#filter_Projects").prop("checked") ?
                  _analysis.find("select.project-filter").val() : false,
                _timed = _analysis.find("#include_Timed").prop("checked"),
                _dates = value => {
                  var _return = {
                    since : factory.Dates.now().startOf("day"),
                    until: factory.Dates.now().endOf("day"),
                  };  
                  value = value.split("_");
                  if (/CURRENT/i.test(value[0])) {
                    _return.since = _return.since.startOf(value[1]);
                    _return.until = _return.until.endOf(value[1]);
                  } else if (/LAST/i.test(value[0])) {
                    _return.since = _return.since.subtract(1, value[1]).startOf(value[1]);
                    _return.until = _return.until.subtract(1, value[1]).endOf(value[1]);
                  } else if (/PAST/i.test(value[0])) {
                    _return.since = _return.since.subtract(parseInt(value[1], 10), value[2]);
                  }
                  return _return;
                },
                _bounds = _analysis.find("#filter_Dates").prop("checked") ? _dates(_analysis.find("select.date-filter").val()) : null,
                _results = options.state.application.analysis.series(_.isArray(_tags) && _tags.length === 0 ? true : _tags, 
                                            _project == "***none***" ? 
                                              null : _project == "***all***" ? 
                                                true : _project, _timed, _bounds ? 
                                                  _bounds.since : _bounds, _bounds ?
                                                    _bounds.until : _bounds, options.state.session.db);
            
            /* <!-- Time Series Graph --> */
            var _target = _analysis.find("div.row.visualisation"),
                _series = factory.Display.template.show({
                  template: "time_series",
                  id: "time_series_analysis",
                  target: _target,
                  clear: true
                });
            
            /* <!-- Category View --> */
            var _category = (count, name) => {
              var _return = {
                name: name,
                value: count
              };
              if ((name == "ONGOING" || name == "COMPLETE") && _results.data.length) 
                _return.percent = Math.round((count * 100) / _results.data.length);
              return _return;
            };
            factory.Display.template.show({
              template: "stats_categories",
              categories: _.map(_.extend(
                {TOTAL: _results.data.length, ONGOING: (_results.data.length || 0) - (_results.statuses.COMPLETE || 0)},
                _results.types, _results.statuses), _category),
              target: _analysis.find("div.stats-categories"),
              clear: true
            });
            
            /* <!-- Timed View --> */
            factory.Display.template.show({
              template: "stats_times",
              timed: _results.timed,
              future: _results.future,
              durations: _results.durationed,
              duration:  _results.durationed ? _results.durations.humanize() : "",
              hours:  _results.durationed ? _results.durations.hours() : "",
              target: _analysis.find("div.stats-times"),
              clear: true
            });
            
            /* <!-- Overall View --> */
            factory.Display.template.show({
              template: "stats_overall",
              average: _results.stats.average,
              sd: _results.stats.sd,
              target: _analysis.find("div.stats-overall"),
              clear: true
            });
            
            /* <!-- Show Graph --> */
            options.functions.graphs[_analysis.find("select.graph-type").val().split("|")[0]](_series[0], 
              _analysis.find("select.graph-type").val().indexOf("|") > 0 ? 
                _results.series[_analysis.find("select.graph-type").val().split("|")[1]] :
                  _results.from.range && _results.from.range.years() >= 2 ? _results.series.months :
                  _results.from.range && _results.from.range.months() >= 2 ? _results.series.weeks :
                  _results.series.days, _target.width(), _target.height() / 1.05, _analysis.find("span.graph-tooltip"));
            
            _busy();
            
          },
          _refresh = _.debounce(_visualise, 200);
      
      /* <!-- Handle Switches for Filters --> */
      _analysis.find("input[data-targets][type='checkbox']").change(e => {
        var _target = $(e.target), _for = _target.data("targets");
        _target.prop("checked") ?
          $(_for).prop("disabled", false).removeClass("disabled") :
          $(_for).prop("disabled", true).addClass("disabled");
        _refresh();
      });
      _analysis.find("#include_Timed").change(_refresh);
      
      /* <!-- Handle Toggle Tags Shortcut Buttons --> */
      _analysis.find("button[data-action='none']")
        .click(() => _analysis.find(".tag-filter input[type='checkbox']").prop("checked", false).change());
      _analysis.find("button[data-action='all']")
        .click(() => _analysis.find(".tag-filter input[type='checkbox']").prop("checked", true).change());
      
      /* <!-- Re-Visualise Output after Tag Filter Change --> */
      _analysis.find(".tag-filter input[type='checkbox']").on("change", _refresh);
      
      /* <!-- Re-Visualise Output after Project / Date Filter Change --> */
      _analysis.find("select.graph-type, select.project-filter, select.date-filter").on("change", _refresh);
      
      /* <!-- Start Visualisation --> */
      _visualise();
      
      resolve(true);

    });
  
  FN.kanban = prefs => new Promise(resolve => {

    /* <!-- Notify what we are doing! --> */
      factory.Display.busy("Preparing Data");
    
      var _past = prefs.past === null || prefs.past === undefined || prefs.past == "" ? 2 : prefs.past,
          _future = prefs.future === null || prefs.future === undefined || prefs.future == "" ? 5 : prefs.future,
          _from = factory.Dates.parse(options.state.session.today).subtract(_past, "days"),
          _until = factory.Dates.parse(options.state.session.today).add(_future, "days"),
          _queries = [
            options.state.application.query.status(options.state.application.query.incomplete(), _until),
            options.state.application.query.completed(_from, _until)
          ],
          _data = _.map(_queries, q => options.state.application.task.prepare(options.state.session.db ?
                                                                              _.reject(options.state.session.database.execute(q), "IS_TIMED") : []));
    
      var _status = [{
        header: "dark",
        name: "Ready",
        value: options.state.application.schema.enums.status.ready,
        icon: "hourglass_full",
        details: factory.Display.doc.get("KANBAN_READY"),
        items: options.state.application.filter.ready(_data[0]),
        backward: "call_received",
        forward: "call_made",
      }, {
        header: "primary",
        name: "In Progress",
        value: options.state.application.schema.enums.status.underway,
        icon: "work",
        details: factory.Display.doc.get("KANBAN_UNDERWAY"),
        items: options.state.application.filter.underway(_data[0]),
        backward: "call_received",
        forward: "done",
      }, {
        header: "success",
        name: "Done",
        value: options.state.application.schema.enums.status.complete,
        icon: "thumb_up",
        details: factory.Display.doc.get("KANBAN_DONE"),
        items: _data[1],
        backward: "edit"
      }, {
        header: "light",
        text: "dark",
        name: "Available",
        value: "",
        icon: "list",
        size: "col-12",
        details: factory.Display.doc.get("KANBAN_POOL"),
        items: _.reject(options.state.application.filter.none(_data[0]), item => item.IS_ZOMBIE || item.IS_GHOST),
        forward: "arrow_upward",
      }];
    
      factory.Flags.log(`Displaying Kanban View (${_past} days past and ${_future} days future)`, _status);
    
      options.functions.tasks.hookup(factory.Display.template.show({
        template: "kanban",
        id: "kanban",
        name: options.state.session.name,
        sizes: {
          lg: 12 / (_status.length - 1),
        },
        status: _status,
        action: ACTIONS.CATEGORISED,
        target: factory.container,
        clear: true,
      }));

      resolve(true);

    });
  
  FN.queue = () => {
    
    var _query = `(properties has {key='${options.state.application.schema.property.name}' and value='${options.state.application.schema.property.value}'})`,
        _find = factory.Google.files.type(factory.Google.files.natives()[1], "domain,user,allTeamDrives", null, _query),
        _error = e => factory.Flags.error("Reports Finding Error", e).negative(),
        _analysis = db => options.state.application.analysis.summary(factory.Dates.now().startOf("day"), db),
        _decode = permissions => (file, index) => _.extend(file, {
            load: `${FN.helpers.command(file)}.kanban`,
            owner: FN.helpers.owner(file),
            owner_details: FN.helpers.email(file),
            createdDate: factory.Dates.parse(file.createdTime),
            modifiedDate: factory.Dates.parse(file.modifiedTime),
            modifiedByMeDate: factory.Dates.parse(file.modifiedByMeTime),
            share: permissions[index],
            loaded: file.id == options.state.session.database.id() ? true : false,
            analysis: file.id == options.state.session.database.id() ? _analysis(options.state.session.db) : false
        });
    
    return _find.catch(_error).then(factory.Main.busy("Looking for Databases"))
      .then(files => {
      
        factory.Flags.log(`Found ${files.length} database file${files.length > 1 ? "s" : ""}`, files);
      
        return Promise.all(_.map(files, file => factory.Google.permissions.get(file, file.driveId)))
          .then(factory.Main.busy("Checking Permissions"))
          .then(permissions => {
        
            factory.Flags.log("Retrieved Permissions for Database Files", permissions);
          
            var _view = factory.Display.template.show({
              template: "queue",
              id: "queue",
              title: "Tasks",
              subtitle: "Queue",
              files: _.map(files, _decode(permissions)),
              target: factory.container,
              clear: true,
            });
          
            _.each(_.reject(files, file => file.id == options.state.session.database.id()),
                    file => factory.Database(options.state.application, factory).open(file.id, options.state.application.schema.sheets.sheet_tasks)
                      .then(db => factory.Display.template.show(_.extend({
                        template: "tasks",
                        target: _view.find(`div[data-file='${file.id}'] div.analysis`),
                        clear: true,
                      }, _analysis(db)))));
          
            return true;
          
          });
      
      });
    
  };
  
  FN.projects = () => new Promise(resolve => {
    
    factory.Flags.log("Entering Projects View");
    
    var _summary = options.state.application.analysis.summary(null, options.state.session.db),
        _analysis = _.map(_summary.projects, project => _.extend(
                      {
                        data: options.state.application.analysis.series(false, project.name, null, null, null, options.state.session.db)
                      }, project));
    
    _analysis.unshift(_.extend(
                      {
                        data: options.state.application.analysis.series(false, null, null, null, null, options.state.session.db)
                      }, {name: "NO PROJECT"}));
    _analysis[0].count = _analysis[0].data ? _analysis[0].data.total ? _analysis[0].data.total : _analysis[0].data.data.length : 0;
    
    factory.Display.template.show({
      template: "projects",
      id: "projects",
      name: options.state.session.name,
      title: "Projects",
      subtitle: "Overview",
      projects: _analysis,
      action: ACTIONS.CATEGORISED,
      target: factory.container,
      clear: true,
    });
    
    factory.Flags.log("Existing Project Analysis", _analysis);
    
    resolve(true);
    
  });
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    daily : FN.daily,
    
    weekly : FN.weekly,
    
    monthly : FN.monthly,
    
    analysis : FN.analysis,
    
    kanban : FN.kanban,
    
    queue : FN.queue,
    
    projects : FN.projects
    
  };
  /* <!-- External Visibility --> */

};