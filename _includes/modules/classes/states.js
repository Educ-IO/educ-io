States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_VIEW = "view",
        STATE_OVERVIEW = "overview",
        STATE_OVERVIEW_USAGE = "overview-usage",
        STATE_OVERVIEW_ENGAGEMENT = "overview-engagement",
        STATE_OVERVIEW_REPORT = "overview-report",
        STATE_OVERVIEW_STUDENTS = "overview-students",
        STATE_OVERVIEW_STUDENT = "overview-student",
        STATE_CLASSWORK = "classwork",
        STATE_CLASSWORK_SUBMISSIONS = "classwork-submissions",
        STATE_PERIOD_FOREVER = "period-forever",
        STATE_PERIOD_MONTH = "period-month",
        STATE_PERIOD_WEEK = "period-week",
        STATE_PERIOD_DAY = "period-day",
        STATE_FILE_LOADED = "file-loaded",
        STATE_CONFIG = "config",
        STATES = [STATE_VIEW,
                  STATE_OVERVIEW, STATE_OVERVIEW_USAGE, STATE_OVERVIEW_ENGAGEMENT, STATE_OVERVIEW_REPORT,
                  STATE_OVERVIEW_STUDENTS, STATE_OVERVIEW_STUDENT,
                  STATE_CLASSWORK, STATE_CLASSWORK_SUBMISSIONS,
                  STATE_FILE_LOADED, STATE_CONFIG, 
                  STATE_PERIOD_FOREVER, STATE_PERIOD_MONTH, STATE_PERIOD_WEEK, STATE_PERIOD_DAY];
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
    
    file : {
      loaded : STATE_FILE_LOADED,  
    },
    
    classwork : {
      in : STATE_CLASSWORK,
      submissions : STATE_CLASSWORK_SUBMISSIONS,
    },
    
    overview : {
      in : STATE_OVERVIEW,
      usage : STATE_OVERVIEW_USAGE,
      engagement : STATE_OVERVIEW_ENGAGEMENT,
      report : STATE_OVERVIEW_REPORT,
      students : STATE_OVERVIEW_STUDENTS,
      student : STATE_OVERVIEW_STUDENT,
    },
    
    periods: {
      all : [STATE_PERIOD_FOREVER, STATE_PERIOD_MONTH, STATE_PERIOD_WEEK, STATE_PERIOD_DAY],
      forever : STATE_PERIOD_FOREVER,
      month : STATE_PERIOD_MONTH,
      week : STATE_PERIOD_WEEK,
      day : STATE_PERIOD_DAY,
    },
    
    view : STATE_VIEW,
    
    views : [
      STATE_OVERVIEW,
      STATE_CLASSWORK,
    ],
    
  };
  /* <!-- External Visibility --> */

};