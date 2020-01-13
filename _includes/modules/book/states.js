States = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common state functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const STATE_BOOK = "book",
    STATE_DIARY = "diary",
    STATE_MANAGE = "manage",
    STATE_MANAGE_BOOKINGS = "manage-bookings",
    STATE_MANAGE_RESOURCES = "manage-resoources",
    STATE_MANAGE_PERMISSIONS = "manage-permissions",
    STATE_MANAGE_NOTIFICATIONS = "manage-notifications",
    STATE_ANALYSIS = "analysis",
    STATE_ANALYSIS_SUMMARY = "analysis-summary",
    STATE_ANALYSIS_DETAIL = "analysis-detail",
    STATE_CONFIG = "config",
    STATES = [STATE_BOOK, STATE_DIARY, STATE_CONFIG, 
              STATE_MANAGE, STATE_MANAGE_BOOKINGS, STATE_MANAGE_RESOURCES, STATE_MANAGE_PERMISSIONS, STATE_MANAGE_NOTIFICATIONS, 
              STATE_ANALYSIS, STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_DETAIL];
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
    
    bookings : [STATE_BOOK, STATE_DIARY],
    
    config : STATE_CONFIG,
    
    dated : [STATE_BOOK, STATE_DIARY, STATE_MANAGE],
    
    data : [STATE_ANALYSIS, STATE_BOOK, STATE_DIARY, STATE_MANAGE],
    
    analysis : {
      in : STATE_ANALYSIS,
      summary : STATE_ANALYSIS_SUMMARY,
      detail : STATE_ANALYSIS_DETAIL,
    },
    
    book : {
      in : STATE_BOOK,
    },
    
    diary : {
      in : STATE_DIARY,
    },
    
    manage : {
      in : STATE_MANAGE,
      bookings : STATE_MANAGE_BOOKINGS,
      resources : STATE_MANAGE_RESOURCES,
      permissions : STATE_MANAGE_PERMISSIONS,
      notifications : STATE_MANAGE_NOTIFICATIONS
    },
    
    views : [STATE_ANALYSIS, STATE_BOOK, STATE_DIARY, 
             STATE_MANAGE, STATE_MANAGE_BOOKINGS, STATE_MANAGE_RESOURCES, STATE_MANAGE_PERMISSIONS, STATE_MANAGE_NOTIFICATIONS],
    
  };
  /* <!-- External Visibility --> */

};