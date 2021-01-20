States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_OPENED = "opened",
    STATE_SEARCHED = "searched",
    STATE_TEAM = "team",
    STATES = [STATE_OPENED, STATE_SEARCHED, STATE_TEAM];
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
    
    opened : {
      in : STATE_OPENED,
    },
    
    searched : {
      in : STATE_SEARCHED,
    },
    
    team : {
      in : STATE_TEAM,
    },
    
  };
  /* <!-- External Visibility --> */

};