Diary = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id: "DIARY",
      format: "Do MMM"
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
  
  FN.data = {

    events: () => factory.Google.calendar.list(factory.me.email, options.state.session.current.toDate(),
      factory.Dates.parse(options.state.session.current).add(1, "day").toDate()),
    
  };
  
  FN.render = {

    all: data => factory.Display.template.show({
      template: "diary",
      id: options.id,
      title: "Bookings",
      subtitle: options.state.session.current.format(options.format),
      events: data,
      help: "book.view",
      clear: true,
      target: factory.container
    }),

    events: data => factory.Display.template.show({
      template: "all",
      events: data,
      clear: true,
      target: factory.container.find("#events")
    }),
    
    refresh: () => {

      /* <!-- Update Date --> */
      factory.container.find(`#${options.id} .subtitle`)
        .text(options.state.session.current.format(options.format));
      
      /* <!-- Get Data and Call Render Function --> */
      return FN.show(FN.render.events);
    },
  };
  
  FN.show = renderer => FN.data.events()
                          .then(FN.process.booking)
                          .then(FN.process.events)
                          .then(events => events && events.length > 0 ? 
                                _.tap(events, events => factory.Flags.log("Loaded Events:", events)) : events)
                          .then(renderer)
                          .catch(e => factory.Flags.error("Events Retrieval Error", e))
                          .then(factory.Main.busy("Loading Bookings"));
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    all: () => FN.show(FN.render.all),

    refresh: FN.render.refresh,

  };
  /* <!-- External Visibility --> */

};