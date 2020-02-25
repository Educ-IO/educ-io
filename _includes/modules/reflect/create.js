Create = (options, factory) => {
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
  FN.parent = id => new Promise(resolve => factory.Google.files.get(id, true)
    .then(f => {
      factory.Google.folders.is(true)(f) ?
        resolve(f) : factory.Flags.error(`Supplied ID is not a folder: ${id}`) && resolve();
    }).catch(e => {
      factory.Flags.error(`Opening Google Drive Folder: ${id}`, e) && resolve();
    }));

  FN.load = (form, process, actions, owner, permissions, updated) => FN.report(form.__name || form.$name, actions, form, process, owner, permissions, updated);

  FN.generic = (edit, value, mime) => edit(value)
    .then(result => {
      var _process = result => {
        var _title = result.title ?
          Promise.resolve(result.title) :
          result.name ?
          Promise.resolve(result.name) :
          factory.Display.text({
            id: "file_name",
            title: "File Name",
            simple: true
          });
        return _title.then(title => factory.Google.files.upload({
          name: options.functions.files.title(title, mime, true)
        }, JSON.stringify(result, options.functions.replacers.regex, 2), mime), null, null, true);
      };
      return result ? _process(JSON.parse(result)) : Promise.resolve(result);
    });

  FN.select = (files, name, actions, form, process) => {

    var _fields = options.functions.decode.meta.fields({
          id: name,
          template: options.state.application.forms.template(name)
        }),
        _create = false;

    return options.functions.prompt.choose(_.map(files, file => ({
        value: file.id,
        name: file.name,
        title: factory.Display.template.get(_.extend({
          template: "meta",
          Created: factory.Dates.parse(file.createdTime).format("YYYY-MM-DD"),
          Modified: factory.Dates.parse(file.modifiedByMeTime).format("YYYY-MM-DD")
        }, _.pick(options.functions.decode.meta.properties(file, _fields), value => value || value === false || value === 0))),
        html: true,
      })), "Open Existing or Create New?", "EXISTING_REPORT_INSTRUCTIONS", false, [{
        text: "Create New",
        handler: () => _create = true
      }], null, "Open")
      .then(value => _create ? FN.report(name, actions, form, process) : value ? options.functions.load.file(_.find(files, file => file.id == value.value)) : false);

  };

  FN.existing = (name, actions, form, process) => options.functions.files.find.reports(form || name)
    .then(results => results && results.length > 0 ?
          FN.select(results, name, actions, form, process) : FN.report(name, actions, form, process));

  FN.report = (name, actions, form, process, owner, permissions, updated) => options.functions.show.report(name, [options.functions.states.report.opened]
      .concat(!actions || (actions.editable && !actions.completed) ? [options.functions.states.report.editable] : [])
      .concat(actions && actions.signable ? [options.functions.states.report.signable] : [])
      .concat(actions && actions.completed ? [options.functions.states.report.complete] : [])
      .concat(actions && actions.editable && actions.completed ? [options.functions.states.report.revocable] : []),
    form, process, actions, owner, permissions, updated);

  FN.form = name => FN.generic(options.functions.edit.form, name ?
      options.state.application.forms.get(name).template : "", options.functions.files.type.forms)
    .then(options.state.application.notify.actions.save("NOTIFY_SAVE_FORM_SUCCESS"))
    .catch(e => e ? factory.Flags.error("Displaying Form Create Prompt", e).negative() : false);

  FN.scale = name => FN.generic(options.functions.edit.scale, name ?
      options.state.application.forms.scale(name) : "", options.functions.files.type.scale)
    .then(value => value ?
      factory.Display.state().enter(options.functions.states.scale.opened).protect("a.jump").on("JUMP") : null)
    .catch(e => e ? factory.Flags.error("Displaying Scale Create Prompt", e).negative() : false);

  FN.tracker = name => name ? options.state.application.trackers.create(name) : false;
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};