Save = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  const INDEX = "index",
        PATH = "path",
        TRANSFORM = "transform",
        EXTRACT = "extract";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.analysis = () => Promise.resolve(JSON.stringify(_.extend(options.state.session.definition, {
      expected: options.state.session.analysis.expected(),
    }), options.functions.replacers.saving))
    .then(value => factory.Google.files.upload(options.state.session.file ? null : {
        name: `${options.functions.files.title(options.state.session.analysis.names(), options.functions.files.type.analysis)} | ${factory.Dates.now().format("YYYY-MM-DD")}${options.functions.files.extension}`
      }, value, options.functions.files.type.analysis, null, options.state.session.file ? options.state.session.file.id : null, true)
      .then(options.functions.action.recent)
      .then(factory.Main.busy("Saving"))
      .then(uploaded => options.state.session.file = uploaded)
      .then(options.state.application.notify.actions.save("NOTIFY_SAVE_ANALYSIS_SUCCESS")));

  FN.form = value => options.functions.action.screenshot($("form[role='form'][data-name]")[0])
    .then(result => factory.Google.files.upload(result ? {
          contentHints: result
        } : null,
        value, options.functions.files.type.form, null, options.state.session.file ? options.state.session.file.id : null, true)
      .then(factory.Main.busy("Updating"))
      .then(uploaded => {
        options.state.application.forms = factory.Forms(options.functions.loaded);
        return (options.state.session.file = uploaded);
      })
      .then(options.state.application.notify.actions.save("NOTIFY_SAVE_FORM_SUCCESS")));

    FN.report = (force, dehydrated) => options.functions.action.get(dehydrated, true)
      .then(saving => (!options.state.session.signatures || !options.functions.dirty(saving.data.report) ?
          Promise.resolve(true) : factory.Display.confirm({
            id: "confirm_Save",
            target: factory.container,
            message: factory.Display.doc.get("SIGNED_REPORT_SAVE_WARNING"),
            action: "Save",
            close: "Cancel"
          }))
        .then(result => {
          return result !== true ? false :
            options.functions.action.screenshot($("form[role='form'][data-name]")[0])
            .then(result => {
              return (force ? factory.Display.text({
                id: "file_name",
                title: "File Name",
                message: factory.Display.doc.get("CLONE_NAME"),
                state: {
                  value: saving.name.replace(options.functions.files.regex, "")
                },
                simple: true
              }) : Promise.resolve(saving.name)).then(name => {
                var _meta = {
                    name: !name.endsWith(options.functions.files.extension) ? `${name}${options.functions.files.extension}` : name,
                    parents: (options.state.session.folder ? options.state.session.folder.id : null),
                    appProperties: options.functions.decode.values(saving.data.form, saving.data.report,
                      meta => meta[INDEX],
                      (value, field, meta, memo) => {
                        var _val = meta[TRANSFORM] ?
                          factory.Display.template.compile(`REFLECT.FIELD.${memo.FORM}.${field}`,
                            meta[TRANSFORM])(value) :
                          meta[PATH] ?
                          value[meta[PATH]] :
                          meta[EXTRACT] ?
                          (_.isRegExp(meta[EXTRACT]) ?
                            meta[EXTRACT] : new RegExp(meta[EXTRACT], "i")).exec(value) : value;

                        memo[`FIELD.${field}`] = JSON.stringify(_.isArray(_val) && _val.length == 1 ?
                          _val[0] : _val);
                      }, {
                        FORM: saving.data.form.$name ? saving.data.form.$name : saving.data.form.name
                      }),
                  },
                  _data = JSON.stringify(saving.data, options.functions.replacers.saving),
                  _mime = options.functions.files.type.report;
                if (result) _meta.contentHints = result;

                return factory.Google.files.upload.apply(this, [_meta, _data, _mime].concat(!options.state.session.file || force ? [] : [null, options.state.session.file.id, true])).then(uploaded => {
                  if (uploaded)
                    options.state.session.hash = new Hashes.MD5()
                    .hex(options.state.application.strings.stringify(saving.data.report, options.functions.replacers.signing));
                  return uploaded;
                });
              });
            })
            .then(options.functions.action.recent)
            .then(uploaded => factory.Flags.log("Saved:", uploaded).reflect(uploaded))
            .catch(e => factory.Flags.error("Save Error", e).negative())
            .then(factory.Main.busy("Saving Report"))
            .then(options.state.application.notify.actions.save("NOTIFY_SAVE_REPORT_SUCCESS"));
        }).catch(() => factory.Flags.log("Save Cancelled").negative()));
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};