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
  FN.additions = (file, actions) => factory.Google.files.comments(file).list()
      .then(comments => Promise.all([
        FN.signatures(options.functions.action.dehydrate().data, comments),
        FN.questions(actions, comments)
      ])).then(() => null); /* <!-- Return NULL to match output of signatures (otherwise session form is wrongly set) --> */
  
  FN.display = {
    
    questions : (actions, questions) => _.each(_.groupBy(questions, 
                    question => `[data-group='${question.about.group}'][data-field='${question.about.field}'], [data-id='${question.about.group}'] [data-id='${question.about.field}']`), 
      (questions, field) => {
        var _field = options.state.session.form.find(field).first();
        _.each(questions, question => {
          question.reply = actions.editable;
          question.resolve = actions.editable || (actions.signable && question.who === true);
        });      
        return _field.hasClass("questioned") ?
          (_field = _field.find(".questions"), _.map(questions, question => _field.append(factory.Display.template.get(_.extend({
              template: "question_details",
            }, question), true)))) : 
          _field.addClass("questioned border border-warning rounded p-1")
            .append(factory.Display.template.get({
              template: "questions_holder",
              questions: questions,
              target: field,
            }, true));
      }),

    replies : (question, replies) => {
      var _field = options.state.session.form.find(`.question[data-id='${question}']`).first(),
          _replies = _field.find(".replies");
      _replies.length === 0 ?
        _field.append(factory.Display.template.get({
          template: "replies_holder",
          replies: replies,
        }, true)) : _.each(replies, reply => _replies.append(factory.Display.template.get(_.extend({
          template: "reply_details"
        }, reply), true)));
    },
    
    signatures : (target, signatures) => {

      options.state.session.signatures = signatures.length;
      factory.Display.template.show({
        template: "count",
        name: "Signatures",
        count: signatures.length,
        clear: true,
        target: target.parents(".card").find(".card-header h5")
      });

      _.each(signatures, signature => {
        signature.template = "signature";
        target.append(factory.Display.template.get(signature));
      });

      var _invalid = _.filter(signatures, signature => signature.valid === false).length > 0;
      target.parents(".card").find(".card-header .count")
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

    },
    
  },
    
  FN.questions = (actions, comments) => options.functions.query.list(options.state.session.file, comments)
      .then(questions => questions && questions.length > 0 ? FN.display.questions(actions, questions) : null);
  
  FN.signatures = (data, comments) => {
    var _target = options.state.session.form.find(".signatures").empty(),
      _none = () => {

        _target.html(factory.Display.doc.get("NO_SIGNATURES"));
        _target.parents(".card").find(".card-header h5").html("Signatures");
        
        /* <!-- Exit Signed State --> */
        factory.Display.state().exit(options.functions.states.report.signed);

      };
    
    return options.state.application.signatures.list(options.state.session.file, data || options.functions.action.dehydrate().data, comments)
        .then(signatures => signatures && signatures.length > 0 ? FN.display.signatures(_target, signatures) : _none());

  };

  FN.report = (data, actions, owner, permissions, updated) => {

    /* <!-- Set Loaded Report Link in Nav Menu --> */
    if (options.state.session.file) $("nav a[data-link='report']").prop("href", `https://drive.google.com/file/d/${options.state.session.file.id}/view`);

    options.functions.create.load(_.tap(data, data =>
        factory.Flags.log(`Loaded Report File: ${JSON.stringify(data, options.functions.replacers.regex, 2)}`)).form,
      form => {
        var _return = (options.state.session.actions = actions, options.state.session.form = factory.Data({}, factory).rehydrate(form, data.report));
        /* <!-- Re-wire up refreshed (e.g. List) events --> */
        options.state.application.fields.refresh(_return);
        return _return;
      }, actions, owner, permissions, updated);
    
    /* <!-- If the form is marked as completed, or not editable/signable then only show signatures --> */
    return options.state.session.file ? 
        actions.completed || !(actions.editable || actions.signable) ?
          FN.signatures() : 
          FN.additions(options.state.session.file, actions) : 
        null;
    
  };

  FN.form = (data, actions) => {

    /* <!-- Set Loaded Form Link in Nav Menu --> */
    $("nav a[data-link='form']").prop("href", `https://drive.google.com/file/d/${options.state.session.file.id}/view`);

    options.functions.edit.form(_.tap(data, data => factory.Flags.log(`Loaded Form File: ${data}`)), actions);
    return true;
    
  };

  FN.tracker = (data, editable) => Promise.resolve({
    data: data,
    editable: editable
  }).then(value => {
    
    factory.Flags.log("LOADED TRACKER", value);
    
    editable ?
      options.state.session.tracking = factory.Tracking(data, options, factory) :
      options.state.session.portfolio = factory.Portfolio(data, options, factory);
    
    factory.Display.state()
            .change(options.functions.states.all, 
                    [options.functions.states.tracker.in, options.functions.states.tracker.opened]
                      .concat([editable ? options.functions.states.tracking.in : options.functions.states.evidence.in]))
            .protect("a.jump").on("JUMP");
    
  });

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
                                            options.state.application.signatures, options.functions.decode, options.functions.helper);
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