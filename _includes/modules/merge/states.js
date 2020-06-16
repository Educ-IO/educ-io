States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_OPENED = "opened",
    STATE_LOADED_DATA = "loaded-data",
    STATE_LOADED_TEMPLATE = "loaded-template",
    STATE_CONFIG = "config",
    STATES = [STATE_OPENED, STATE_LOADED_DATA, STATE_LOADED_TEMPLATE, STATE_CONFIG];
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

    all : STATES,
    
    config : STATE_CONFIG,
    
    opened : STATE_OPENED,
    
    data : {
      loaded : STATE_LOADED_DATA,  
    },
    
    template : {
      loaded : STATE_LOADED_TEMPLATE,  
    },
    
  };
  /* <!-- External Visibility --> */

};