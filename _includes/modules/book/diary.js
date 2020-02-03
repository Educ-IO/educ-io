Diary = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id: "DIARY",
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.process = {
    
    events: events => _.tap(events, events => _.each(events, event => {
      options.functions.calendar.time(event);
      options.functions.calendar.resource(event);
      if (event.resources && event.resources.length > 0) event.calendar = event.resources[0].email;
      event.properties = options.functions.calendar.properties(event);
    })),
    
    resourced: attendee => attendee.resource === true,
    
    booking: events => _.filter(events, event => event.attendees && 
                                  _.filter(event.attendees, FN.process.resourced)),
                                
  };
  
  FN.log = events => ((events.length > 0 ? factory.Flags.log("Loaded Events:", events) : false), events);
  
  FN.load = render => options.functions.source.events(factory.me.email)
                          .then(FN.process.booking)
                          .then(FN.process.events)
                          .then(FN.log)
                          .then(render)
                          .catch(e => factory.Flags.error("Events Retrieval Error", e))
                          .then(factory.Main.busy("Loading Bookings"));
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    all: () => FN.load(events => options.functions.render.view("diary", options.id, "Bookings", options.state.session.current, "book.view", {data: events})),

    refresh: options.functions.render.refresh(options.id,
              () => FN.load(options.functions.render.events("all", "Events"))),

  };
  /* <!-- External Visibility --> */

};