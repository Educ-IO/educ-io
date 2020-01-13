Process = (options, factory) => {
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
  FN.signatures = () => {

    var _data = options.functions.action.dehydrate().data,
      _target = options.state.session.form.find(".signatures").empty(),
      _none = () => {

        _target.html(factory.Display.doc.get("NO_SIGNATURES"));
        _target.parents(".card").find(".card-header h5").html("Signatures");
        
        /* <!-- Exit Signed State --> */
        factory.Display.state().exit(options.functions.states.report.signed);

      },
      _display = signatures => {

        options.state.session.signatures = signatures.length;
        factory.Display.template.show({
          template: "count",
          name: "Signatures",
          count: signatures.length,
          clear: true,
          target: _target.parents(".card").find(".card-header h5")
        });

        _.each(signatures, signature => {
          signature.template = "signature";
          _target.append(factory.Display.template.get(signature));
        });

        var _invalid = _.filter(signatures, signature => signature.valid === false).length > 0;
        _target.parents(".card").find(".card-header .count")
          .append(factory.Display.template.get(_invalid == signatures.length ? {
            template: "valid",
            class: "ml-2 text-danger",
            valid: false,
            desc: "All signatures are invalid / out of date!"
          } : _invalid > 0 ? {
            template: "valid",
            class: "ml-2 text-warning",
            valid: false,
            desc: "Some signatures are invalid / out of date!"
          } : {
            template: "valid",
            valid: true,
            class: "ml-2 text-success",
          }));

        /* <!-- Enter / Exit Signed State --> */
        _.find(signatures, signature => signature.who === true) ?
          factory.Display.state().enter(options.functions.states.report.signed) :
          factory.Display.state().exit(options.functions.states.report.signed);
        
      };

    if (options.state.session.file) options.state.application.signatures.list(options.state.session.file, _data)
      .then(signatures => signatures && signatures.length > 0 ? _display(signatures) : _none());

  };

  FN.report = (data, actions, owner, permissions) => {

    /* <!-- Set Loaded Report Link in Nav Menu --> */
    if (options.state.session.file) $("nav a[data-link='report']").prop("href", `https://drive.google.com/file/d/${options.state.session.file.id}/view`);

    options.functions.create.load(_.tap(data, data =>
        factory.Flags.log(`Loaded Report File: ${JSON.stringify(data, options.functions.replacers.regex, 2)}`)).form,
      form => {
        var _return = (options.state.session.form = factory.Data({}, factory).rehydrate(form, data.report));
        /* <!-- Re-wire up refreshed (e.g. List) events --> */
        options.state.application.fields.refresh(_return);
        return _return;
      }, actions, owner, permissions);
    return FN.signatures();
  };

  FN.form = (data, actions) => {

    /* <!-- Set Loaded Form Link in Nav Menu --> */
    $("nav a[data-link='form']").prop("href", `https://drive.google.com/file/d/${options.state.session.file.id}/view`);

    options.functions.edit.form(_.tap(data, data => factory.Flags.log(`Loaded Form File: ${data}`)), actions);
    return true;
    
  };

  FN.tracker = (data, editable) => ({
    data: data,
    editable: editable
  }); /* <!-- TODO: Process Tracker Loading --> */

  FN.analysis = (forms, mine, full, dates, expected) => Promise.resolve(_.map(forms, form => ({
    id: form.id,
    template: form.template || options.state.application.forms.template(form.id)
  }))).then(
    forms => {
      options.state.session.definition = {
        forms: forms,
        mine: mine,
        full: full,
        dates: dates
      };
      return Promise.all(_.map(forms,
          form => factory.Google.files.search(options.functions.files.type.report, `FORM=${form.id}`, mine, dates, true)))
        .then(reports => {
          return _.reduce(reports, (memo, reports) => memo.concat(reports), []);
        })
        .then(reports => full ?
          Promise.all(_.map(reports, report => factory.Google.files.download(report.id)
            .then(loaded => factory.Google.reader().promiseAsText(loaded))
            .then(content => ({
              file: report,
              content: JSON.parse(content)
            })))) :
          _.map(reports, report => ({
            file: report
          })))
        .then(reports => _.each(reports, report => {
          if (report.file.appProperties.FORM) {
            var _form = _.find(forms, {
              id: report.file.appProperties.FORM
            });
            report.title = _form ?
              _form.template.title ?
              _form.template.title : _form.template.name :
              report.file.appProperties.FORM;
          }
        }))
        .then(reports => {
          options.state.session.analysis = factory.Analysis(factory, forms, reports, expected, 
                                            options.state.application.signatures, options.functions.decode);
          factory.Display.state()
            .change(options.functions.states.all, options.functions.states.analysis.in)
            .protect("a.jump").on("JUMP");
          return reports;
        });
    }
  );
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};