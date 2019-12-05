Prompt = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.dates = () => factory.Display.modal("dates", {
    id: "dates",
    instructions: factory.Display.doc.get("ANALYSE_DATES"),
    validate: values => values && values.Range && values.Range.Values &&
      (values.Range.Values.Start || values.Range.Values.End),
    title: "Filter Date Range",
    field: "Range",
    icon: "query_builder",
    type: "Custom",
    options: [{
        value: "Custom",
        name: "Custom"
      },
      {
        span: "w",
        value: "Week",
        name: "Week"
      },
      {
        span: "M",
        value: "Month",
        name: "Month"
      },
      {
        span: "y",
        value: "Year",
        name: "Year"
      }
    ],
    periods: [{
        span: "w",
        value: "week",
        name: "Last Week"
      },
      {
        span: "M",
        value: "month",
        name: "Last Month"
      },
      {
        span: "Y",
        value: "year",
        name: "Last Year"
      },
      {
        span: "AY",
        value: "academic",
        name: "Academic Year"
      },
    ],
  }, dialog => {
    options.state.application.fields.on(dialog);
    dialog.find("input[type='radio'][name='period_Select']").change(e => {
      var _$ = $(e.currentTarget),
        _span = _$.data("span"),
        _dates = dialog.find("fieldset[name='custom']");
      if (_span) {
        _dates.attr("disabled", "disabled");
        var _start = dialog.find("input[type='text'][data-output-name='Start']"),
          _end = dialog.find("input[type='text'][data-output-name='End']");
        var _format = "YYYY-MM-DD",
          _values = options.functions.helper.span({
            span: _span
          });
        _start.val(_values.from.format(_format));
        _end.val(_values.to.format(_format));
      } else {
        _dates.attr("disabled", null);
      }
    });
  }).then(values => values ? {
    span: values.Period && values.Period.Values ? values.Period.Values.Span : null,
    from: values.Range.Values.Start ? factory.Dates.parse(values.Range.Values.Start) : null,
    to: values.Range.Values.End ? factory.Dates.parse(values.Range.Values.End).endOf("day") : null
  } : false);

  FN.analysis = mine => {
    var _analyse = (results, dates) => {
        factory.Router.clean(false); /* <!-- Clear any existing file/state --> */
        results = _.isArray(results) ? results : [results];
        var _ln = results.length;
        factory.Flags.log(`${_ln} form${_ln > 1 ? "s" : ""} selected for Analysis`, results);
        return options.functions.process.analysis(_.map(results, result => ({
          id: result.value,
          name: `${result.name}${result.title ? ` [${result.title}]` : ""}`
        })), mine, false, dates).then(factory.Main.busy("Finding Reports"));
      },
      _filter;
    return FN.choose(
        options.state.application.forms.selection("forms", "Report"),
        "Select a Form ...", "ANALYSE", true, [{
          text: "Filter",
          handler: () => _filter = true
        }],
        value => _.isEmpty(value) === false)
      .then(results => results ? _filter ?
        FN.dates().then(dates => dates ? _analyse(results, dates) : false) :
        _analyse(results) : false);
  };

  FN.choose = (options, title, instructions, multiple, actions, validate, action) =>
    factory.Display.choose({
      id: "select_chooser",
      title: title,
      instructions: factory.Display.doc.get(instructions),
      choices: options,
      multiple: multiple,
      action: action || "Select",
      actions: actions,
      validate: validate
    })
    .catch(e => (e ? factory.Flags.error("Displaying Select Prompt", e) :
      factory.Flags.log("Select Prompt Cancelled")).negative())
    .then(result => ((result ? factory.Flags.log("Selected:", result) : false), result));

  FN.create = (actions, folder) => factory.Display.action({
    id: "create_chooser",
    title: "Create with Reflect ...",
    instructions: [factory.Display.doc.get({
      name: "CREATE",
      content: folder ? folder : "Google Drive"
    })].concat(_.map(actions, action => factory.Display.doc.get(action.doc))).join("\n"),
    actions: actions,
    large: true
  }).then(result => {
    return result.action.command ?
      (() => {
        factory.Flags.log("Create Action Selected:", result);
        factory.Router.clean(false); /* <!-- Clear any existing file/state --> */
        return options.functions.create[result.action.command](result.option.value);
      })() : null;
  }).catch(e => (e ? factory.Flags.error("Create Select Prompt", e) :
    factory.Flags.log("Create Prompt Cancelled")).negative());

  FN.scales = () => ({
    name: "Scale",
    desc: "Create Scale",
    command: "scale",
    doc: "CREATE_SCALE",
    options: [{
      name: "New ..."
    }].concat(options.state.application.forms.selection("scales", "Scale"))
  });

  FN.forms = () => ({
    name: "Form",
    desc: "Create Form",
    command: "form",
    doc: "CREATE_FORM",
    options: [{
      name: "New ..."
    }].concat(options.state.application.forms.selection("forms", "Report"))
  });

  FN.reports = () => ({
    name: "Report",
    desc: "Create Report",
    command: "existing",
    /* <!-- Runs through check for existing reports first --> */
    doc: "CREATE_REPORT",
    options: options.state.application.forms.selection("forms", "Report"),
  });

  FN.trackers = () => ({
    name: "Tracker",
    desc: "Create Tracker",
    command: "tracker",
    doc: "CREATE_TRACKER",
    options: options.state.application.forms.selection("scales", "Scale")
  });
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};