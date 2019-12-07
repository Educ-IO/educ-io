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
  FN.file = file => factory.Google.files.download((options.state.session.file = file).id)
    .then(loaded => factory.Google.reader().promiseAsText(loaded))
    .then(content => ({
      content: file.mimeType === options.functions.files.type.report ?
        _.tap(JSON.parse(content),
          data => options.state.session.hash = new Hashes.MD5().hex(options.state.application.strings.stringify(data.report,
            options.functions.replacers.signing))) : file.mimeType === options.functions.files.type.analysis ? JSON.parse(content) : content,
      actions: {
        editable: (file.capabilities && file.capabilities.canEdit),
        signable: file.capabilities && file.capabilities.canComment,
        completed: !!(file.appProperties && file.appProperties.COMPLETE),
        revisions: file.capabilities && file.capabilities.canReadRevisions
      },
      owner: file.ownedByMe ? null : file.owners && file.owners.length > 0 ? file.owners[0] : null,
      permissions: file.permissions ? _.reject(file.permissions, permission => permission.deleted || permission.role == "owner") : [],
    }))
    .then(value =>
      factory.Google.files.is(options.functions.files.type.report)(file) ?
        options.functions.process.report(value.content, value.actions, value.owner, value.permissions) :
        factory.Google.files.is(options.functions.files.type.form)(file) ?
          options.functions.process.form(value.content, value.actions) :
          factory.Google.files.is(options.functions.files.type.analysis)(file) ?
            options.functions.process.analysis(value.content.forms, value.content.mine,
            value.content.full, value.content.dates ? _.tap(value.content.dates, options.functions.helper.span) : value.content.dates, value.content.expected)
      .then(() => factory.Display.state()
        .enter([options.functions.states.analysis.summary, options.functions.states.analysis.reports.all, options.functions.states.analysis.stages.any])) :
      Promise.reject(`Supplied ID is not a recognised Reflect File Type: ${file.id} | ${file.mimeType}`))
    .then(value => _.tap(value, () => factory.Display.state().enter(options.functions.states.file.loaded)));
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};