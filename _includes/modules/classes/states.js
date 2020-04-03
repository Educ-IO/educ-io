States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_OVERVIEW = "overview",
        STATE_OVERVIEW_USAGE = "overview-usage",
        STATE_CLASSWORK = "classwork",
        STATE_PERIOD_FOREVER = "period-forever",
        STATE_PERIOD_MONTH = "period-month",
        STATE_PERIOD_WEEK = "period-week",
        STATE_PERIOD_DAY = "period-day",
        STATE_CONFIG = "config",
        STATES = [STATE_OVERVIEW, STATE_OVERVIEW_USAGE, STATE_CONFIG, STATE_PERIOD_FOREVER, STATE_PERIOD_MONTH, STATE_PERIOD_WEEK, STATE_PERIOD_DAY];
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
    
    classwork : {
      in : STATE_CLASSWORK,
    },
    
    overview : {
      in : STATE_OVERVIEW,
      usage : STATE_OVERVIEW_USAGE,
    },
    
    periods: {
      all : [STATE_PERIOD_FOREVER, STATE_PERIOD_MONTH, STATE_PERIOD_WEEK, STATE_PERIOD_DAY],
      forever : STATE_PERIOD_FOREVER,
      month : STATE_PERIOD_MONTH,
      week : STATE_PERIOD_WEEK,
      day : STATE_PERIOD_DAY,
    },
    
    views : [
      STATE_OVERVIEW,
      STATE_CLASSWORK
    ],
    
  };
  /* <!-- External Visibility --> */

};