Load = (options, factory) => {
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
  FN.process = (file, content) => ({
      content: file.mimeType === options.functions.files.type.report ?
        _.tap(JSON.parse(content),
          data => options.state.session.hash = new Hashes.MD5().hex(options.state.application.strings.stringify(data.report,
            options.functions.replacers.signing))) : 
        file.mimeType === options.functions.files.type.analysis ? JSON.parse(content) : 
        file.mimeType === options.functions.files.type.tracker ? JSON.parse(content) : 
        content,
      actions: {
        editable: (file.capabilities && file.capabilities.canEdit),
        signable: file.capabilities && file.capabilities.canComment,
        completed: !!(file.appProperties && file.appProperties.COMPLETE),
        revisions: file.capabilities && file.capabilities.canReadRevisions
      },
      owner: file.ownedByMe ? null : file.owners && file.owners.length > 0 ? file.owners[0] : null,
      permissions: file.permissions ? _.reject(file.permissions, permission => permission.deleted || permission.role == "owner") : [],
      updated: factory.Dates.parse(file.modifiedByMeTime || file.modifiedTime)
    });
  
  FN.load = {
    
    analysis : loaded => options.functions.process.analysis(loaded.content.forms, loaded.content.mine, loaded.content.full, 
      loaded.content.dates ? _.tap(loaded.content.dates, options.functions.helper.span) : loaded.content.dates, loaded.content.expected)
        .then(() => factory.Display.state().enter([
          options.functions.states.analysis.summary,
          options.functions.states.analysis.reports.all,
          options.functions.states.analysis.stages.any
        ])),
    
    form : loaded => options.functions.process.form(loaded.content, loaded.actions),
    
    report : loaded => options.functions.process.report(loaded.content, loaded.actions, loaded.owner, loaded.permissions, loaded.updated),

    tracker : loaded => options.functions.process.tracker(loaded.content, loaded.actions.editable),
    
  };
  
  FN.file = (file, locations) => factory.Google.files.download((options.state.session.file = file).id)
    .then(loaded => factory.Google.reader().promiseAsText(loaded))
    .then(content => FN.process(file, content))
    .then(value => factory.Google.files.is(options.functions.files.type.report)(file) ? FN.load.report(value) :
      factory.Google.files.is(options.functions.files.type.form)(file) ? FN.load.form(value) :
        factory.Google.files.is(options.functions.files.type.analysis)(file) ? FN.load.analysis(value) :
          factory.Google.files.is(options.functions.files.type.tracker)(file) ? FN.load.tracker(value) :
            Promise.reject(`Supplied ID is not a recognised Reflect File Type: ${file.id} | ${file.mimeType}`))
    .then(value => _.tap(value, () => {
      factory.Display.state().enter(options.functions.states.file.loaded);
      /* <!-- Scroll to Location if Supplied --> */
      if (!locations || locations.length === 0) return;
      var _target = $(_.map(locations, location => `[data-id='${location}']`).join());
      if (_target.length > 0) Element.prototype.scrollIntoView ? _target[0].scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest"
                  }) : $([document.documentElement, document.body]).scrollTop(_target.offset().top);
    }));
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    file: FN.file,
    
  };
  /* <!-- External Visibility --> */
  
};