Elicit = (options, factory) => {
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
  FN.send = opts => factory.Display.modal("send", _.defaults(opts, {
        id: "emails",
        validate: values => values && values.Email && values.Email.Values,
      }), dialog => {
        options.state.application.fields.on(dialog);
        factory.Dialog({}, factory).handlers.list(dialog, options.functions.decode.email);
        dialog.find("textarea").focus();
      }).then(value => {
        if (!value) return false;
        var _map = email => {
          var _match = email.match(options.functions.decode.email);
          return _match ? _match[0] : "";
        };
        value.Email.Values = _.isArray(value.Email.Values) ?
          _.map(value.Email.Values, _map) : _map(value.Email.Values);
        return value;
      })
      .catch(e => (e ? factory.Flags.error("Send Error", e) : factory.Flags.log("Send Cancelled")).negative());
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    send : FN.send,
    
  };
  /* <!-- External Visibility --> */
  
};