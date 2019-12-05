Edit = (options, factory) => {
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
  FN.generic = (value, help, title, id, mimeType, replacer, editable, clean) => factory.Display.text({
      id: id ? id : "generic_editor",
      title: title ? title : "Create / Edit ...",
      message: help ? factory.Display.doc.get(help) : "",
      validate: value => {
        try {
          JSON.parse(value);
          if (value) return true;
        } catch (e) {
          return factory.Flags.error("JSON Parsing", e).negative();
        }
      },
      state: {
        value: value && _.isObject(value) ? JSON.stringify(value, replacer, 2) : value
      },
      action: options.state.session.file && mimeType == options.functions.files.type.form ? "Show" : editable === false ? false : "Save",
      actions: [{
        text: "Download",
        handler: values => {
          if (values && values.length === 1) {
            try {
              saveAs(new Blob([values[0].value], {
                type: mimeType
              }), options.functions.files.title(value && value.title ? value.title : "download", mimeType, true));
            } catch (e) {
              factory.Flags.error("Download", e);
            }
          }
        }
      }],
      rows: 10
    })
    .then(values => values && options.state.session.file ?
      mimeType == options.functions.files.type.form ?
      options.functions.show.form(values) :
      factory.Google.files.upload(null, values, options.state.session.file.mimeType, null, options.state.session.file.id, true)
      .then(factory.Main.busy("Updating"))
      .then(uploaded => options.state.session.file = uploaded) :
      values)
    .catch(e => {
      if (clean) factory.Router.clean(true);
      return e ? factory.Flags.error("Edit Error", e).negative() : factory.Flags.log("Edit Cancelled").reflect(null);
    });

  FN.report = report => options.functions.edit.generic(report.data, "REPORT", "Create / Edit Report ...",
      "form_report", options.functions.files.type.report, options.functions.replacers.regex);

  FN.form = (form, editable) => options.functions.edit.generic(form, "FORM", "Create / Edit Form ...",
      "form_editor", options.functions.files.type.form, options.functions.replacers.editing, editable, true);

  FN.scale = (scale, editable) => options.functions.edit.generic(scale, "SCALE", "Create / Edit Scale ...",
      "scale_editor", options.functions.files.type.scale, options.functions.replacers.editing, editable, true);
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};