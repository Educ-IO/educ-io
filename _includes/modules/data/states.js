States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_VIEW = "view",
        
        STATE_OVERVIEW = "overview",
        
        STATE_DETAIL = "detail",
        
        STATE_STUDENT = "student",
        
        STATE_CONFIG = "config",
        STATE_CONFIG_ISAMS = "config-isams",
        
        STATE_LOADED = "loaded",
        STATE_LOADED_ISAMS = "loaded-isams",
        
        STATE_PROCESSED = "processed",
        STATE_PROCESSED_ISAMS = "processed-isams",
        
        STATE_FILE_LOADED = "file-loaded",
        
        SESSION_STATES = [
          STATE_VIEW,
          STATE_OVERVIEW,
          STATE_DETAIL,
          STATE_STUDENT,
          STATE_LOADED, STATE_LOADED_ISAMS,
          STATE_PROCESSED, STATE_PROCESSED_ISAMS,
          STATE_FILE_LOADED
        ],
  
        STATES = [
          STATE_VIEW,
          STATE_OVERVIEW,
          STATE_DETAIL,
          STATE_STUDENT,
          STATE_CONFIG, STATE_CONFIG_ISAMS,
          STATE_LOADED, STATE_LOADED_ISAMS,
          STATE_PROCESSED, STATE_PROCESSED_ISAMS,
          STATE_FILE_LOADED
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
    
    session : SESSION_STATES,
    
    active: [STATE_LOADED, STATE_LOADED_ISAMS, STATE_PROCESSED, STATE_PROCESSED_ISAMS, STATE_OVERVIEW, STATE_DETAIL],
    
    config : {
      in : STATE_CONFIG,
      isams : STATE_CONFIG_ISAMS,
    },
    
    file : {
      loaded : STATE_FILE_LOADED,  
    },
    
    loaded : {
      in : STATE_LOADED,
      isams : STATE_LOADED_ISAMS,
    },
    
    processed : {
      in : STATE_PROCESSED,
      isams : STATE_PROCESSED_ISAMS,
    },
    
    view : {
      in : STATE_VIEW,
      overview : STATE_OVERVIEW,
      detail : STATE_DETAIL,
      student : STATE_STUDENT,
      all : [STATE_OVERVIEW, STATE_DETAIL, STATE_STUDENT]
    },
    
  };
  /* <!-- External Visibility --> */

};