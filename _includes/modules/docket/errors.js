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
  var _notify = factory.Notify(_.defaults(options || {}, {
    id: "docket_Notify",
    autohide : false
  }), factory);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- No error means likely a dialog cancellation --> */
    create : e => e ? _notify.actions.error(e, "Create Failed", "FAILED_CREATE", "Creation Error") : false,
    
    delete : e => e ? _notify.actions.error(e, "Delete Failed", "FAILED_DELETE", "Deletion Error") : false, 
    
    insert : e => e ? _notify.actions.error(e, "Save Failed", "FAILED_SAVE", "Insertion Error") : false,
    
    update : e => e ? _notify.actions.error(e, "Update Failed", "FAILED_UPDATE", "Updating Error") : false,
    
    /* <!-- Generic : No error means likely a dialog cancellation --> */
    generic : name => e => (e ? factory.Flags.error(`${name} Error`, e) : factory.Flags.log(`${name} Cancelled`)).negative(),
    
    /* <!-- Empty errors --> */
    empty : _notify.empty,
    
  };
  /* <!-- External Visibility --> */

};