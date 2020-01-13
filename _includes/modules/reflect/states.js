States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_FILE_LOADED = "loaded-file",
    STATE_FORM_OPENED = "opened-form",
    STATE_REPORT_OPENED = "opened-report",
    STATE_REPORT_SIGNABLE = "signable-report",
    STATE_REPORT_SIGNED = "signed-report",
    STATE_REPORT_EDITABLE = "editable-report",
    STATE_TRACKER_OPENED = "opened-tracker",
    STATE_SCALE_OPENED = "opened-scale",
    STATE_REPORT_COMPLETE = "report-complete",
    STATE_REPORT_REVOCABLE = "report-revocable",
    STATE_ANALYSIS = "analysis",
    STATE_ANALYSIS_SUMMARY = "analysis-summary",
    STATE_ANALYSIS_DETAIL = "analysis-detail",
    STATE_ANALYSIS_ALL = "analysis-reports-all",
    STATE_ANALYSIS_MINE = "analysis-reports-mine",
    STATE_ANALYSIS_SHARED = "analysis-reports-shared",
    STATE_ANALYSIS_ANY = "analysis-stage-any",
    STATE_ANALYSIS_COMPLETE = "analysis-stage-complete",
    STATE_ANALYSIS_VERIFY = "analysis-verify",
    STATES = [STATE_FILE_LOADED, STATE_FORM_OPENED, STATE_TRACKER_OPENED,
      STATE_REPORT_COMPLETE, STATE_REPORT_OPENED, STATE_REPORT_SIGNABLE, STATE_REPORT_EDITABLE,
      STATE_REPORT_REVOCABLE, STATE_REPORT_SIGNED,
      STATE_SCALE_OPENED, STATE_ANALYSIS, STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_DETAIL,
      STATE_ANALYSIS_ALL, STATE_ANALYSIS_MINE, STATE_ANALYSIS_SHARED,
      STATE_ANALYSIS_ANY, STATE_ANALYSIS_COMPLETE, STATE_ANALYSIS_VERIFY
    ];
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
    
    analysis : {
      in : STATE_ANALYSIS,
      summary : STATE_ANALYSIS_SUMMARY,
      detail : STATE_ANALYSIS_DETAIL,
      reports : {
        all : STATE_ANALYSIS_ALL,
        mine : STATE_ANALYSIS_MINE,
        shared : STATE_ANALYSIS_SHARED 
      },
      stages : {
        any : STATE_ANALYSIS_ANY,
        complete : STATE_ANALYSIS_COMPLETE,
      },
      verify : STATE_ANALYSIS_VERIFY,
    },
    
    file : {
      loaded : STATE_FILE_LOADED,
    },
    
    form : {
      opened : STATE_FORM_OPENED,
    },
      
    report : {
      opened : STATE_REPORT_OPENED,
      signable : STATE_REPORT_SIGNABLE,
      signed : STATE_REPORT_SIGNED,
      editable : STATE_REPORT_EDITABLE,
      complete : STATE_REPORT_COMPLETE,
      revocable : STATE_REPORT_REVOCABLE,
    },
      
    scale : {
      opened : STATE_SCALE_OPENED,
    },  
    
    tracker : {
      opened : STATE_TRACKER_OPENED,
    },
    
  };
  /* <!-- External Visibility --> */

};