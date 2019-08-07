Errors = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to notify and handle user-facing errors --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */
  
  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _general = (e, title, message, log) => factory.Flags.error(log || title, e) && factory.Display.notify({
          title: _.isFunction(title) ? title() : title,
          content: _.isFunction(message) ? message() : message,
          class: options.class.main,
          header_class: options.class.header,
          autohide: options.autohide,
          target: _.isString(options.holder) ? $(options.holder) : options.holder,
        });
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- No error means likely a dialog cancellation --> */
    create : e => e ?_general(e, "Create Failed", "FAILED_CREATE", "Creation Error") : false,
    
    delete : e => e ?_general(e, "Delete Failed", "FAILED_DELETE", "Deletion Error") : false, 
    
    insert : e => e ? _general(e, "Save Failed", "FAILED_SAVE", "Insertion Error") : false,
    
    update : e => e ? _general(e, "Update Failed", "FAILED_UPDATE", "Updating Error") : false,
    
    /* <!-- Generic : No error means likely a dialog cancellation --> */
    generic : name => e => (e ? factory.Flags.error(`${name} Error`, e) : factory.Flags.log(`${name} Cancelled`)).negative(),
    
  };
  /* <!-- External Visibility --> */

};