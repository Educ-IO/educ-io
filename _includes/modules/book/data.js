Data = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    span : "day"
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.admin = () => factory.Google.admin.privileges()
      .then(privileges => {
        var privilege = _.find(privileges.items, item => item.serviceName == "calendar");
        return !!(privilege && privilege.childPrivileges && _.find(privilege.childPrivileges, 
          child => child.serviceName == "calendar" && child.privilegeName == "CALENDAR_RESOURCE"));
      });
  
  FN.book = (calendar, id) => data => {
      factory.Flags.log("Booking Data:", data);
      var _start = _.find(data, data => data.name == "from"),
          _end = _.find(data, data => data.name == "until"),
          _details = _.find(data, data => data.name == "details"),
          _event = {
            start: {
              dateTime: FN.date(_start.value).format(),
            },
            end: {
              dateTime: FN.date(_end.value).format(),
            },
            attendees: [
              {
               email: id,
               self: false,
               resource: true,
              },
            ],
          };
      if (_details && _details.value) _event.summary = _details.value;
      return factory.Google.calendar.events.create(calendar, _event);
    };
  
  FN.calendar = calendar => factory.Google.calendars.get(calendar);
  
  FN.date = time => factory.Dates.parse(time, ["ha", "hh:mma", "HH:mm", "HH:mm:ss"]).set({
        "year": options.state.session.current.year(),
        "month": options.state.session.current.month(),
        "date": options.state.session.current.date(),
      });
  
  FN.dedupe = events => _.uniq(events, false, "id");
  
  FN.event = (calendar, id) => factory.Google.calendar.events.get(calendar, id);
  
  FN.busy = resources => factory.Google.calendar.busy(resources, 
                            factory.Dates.parse(options.state.session.current).startOf(options.span),
                            factory.Dates.parse(options.state.session.current).endOf(options.span)),
  
  FN.events = calendar => factory.Google.calendar.list(calendar, options.state.session.current.toDate(),
      factory.Dates.parse(options.state.session.current).add(1, options.span).toDate());

  FN.resources = search => options.state.application.resources.safe()
      .then(resources => resources.find(search))
      .then(options.functions.process.resources);
  
  FN.children = parent => options.state.application.resources.safe()
      .then(resources => resources.children(parent));
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};