Calendars = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle different views --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> w*/

  /* <!-- Internal Constants --> */
  const SCOPE_CALENDARS = "https://www.googleapis.com/auth/calendar.readonly";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _choose = () => factory.Main.prompt("Calendar", calendar => ({
      id: calendar.id,
      name: calendar.summaryOverride ? calendar.summaryOverride : calendar.summary
    }), factory.Google.calendars.list);
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    choose: () => factory.Main.authorise(SCOPE_CALENDARS)
                    .then(result => result === true ? _choose() : Promise.resolve(false)),

  };
  /* <!-- External Visibility --> */

};