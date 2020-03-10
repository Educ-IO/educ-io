Replacers = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common replacer functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope:  --> */

  /* <!-- Internal Constants --> */
  const REGEX_REPLACER = (key, value) => value && typeof value === "object" &&
      value.constructor === RegExp ? value.source : value,
    SAVING_REPLACER = (key, value) => key && key === "__extends" ?
      undefined : REGEX_REPLACER(key, value),
    EDITING_REPLACER = (key, value) => key && key.indexOf("$") === 0 ?
      undefined : REGEX_REPLACER(key, value),
    SIGNING_REPLACER = (key, value) => key &&
      (key === "__order" || key === "__type" || key === "__meta") ?
        undefined : EDITING_REPLACER(key, value);
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    editing : EDITING_REPLACER,
    
    saving : SAVING_REPLACER,
    
    signing : SIGNING_REPLACER,
    
    regex : REGEX_REPLACER,
    
  };
  /* <!-- External Visibility --> */

};