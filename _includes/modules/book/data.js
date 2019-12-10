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
  var _date = (data, field) => FN.date(_.find(data, data => data.name == field).value);
  
  var _text = (data, field) => (value => value && value.value ? value.value : "")(_.find(data, data => data.name == field));
  
  var _attendee = resource => ({
             email: resource,
             self: false,
             resource: true,
            });
  
  var _book = (calendar, resources, start, end, details) => {
    var _event = {
          start: {
            dateTime: start.format(),
          },
          end: {
            dateTime: end.format(),
          },
          attendees: _.isArray(resources) ? _.map(resources, _attendee) : [_attendee(resources)],            
        };
    if (details) _event.summary = details;
    return factory.Google.calendar.events.create(calendar, _event);
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.admin = () => factory.Google.admin.privileges()
      .then(privileges => {
        var privilege = _.find(privileges.items, item => item.serviceName == "calendar");
        return !!(privilege && privilege.childPrivileges && _.find(privilege.childPrivileges, 
          child => child.serviceName == "calendar" && child.privilegeName == "CALENDAR_RESOURCE"));
      });
  
  FN.book = {
    
    one: (calendar, id) => data => {
      factory.Flags.log("Booking Data:", data);
      return _book(calendar, id, 
                   _date(data, "from"),
                   _date(data, "until"),
                   _text(data, "details")
                  );
    },
    
    group: (calendar, resources, number) => data => {

      var _from = _date(data, "from"),
          _until = _date(data, "until"),
          _details = _text(data, "details");
      
      var _count = number,
          _resources = _.reduce(resources, (memo, resource, id) => {
            if (_count > 0) {
              /* <!-- We don't yet have all the bookings we need --> */
              if (!resource.busy || resource.busy.length === 0) {
                /* <!-- Resource is definitely free --> */
                memo.push(id);
                _count -= 1;
              } else {
                /* <!-- Check if resource is available --> */
                var _busy = _.find(resource.busy, busy => _from.isSameOrBefore(busy.end) && _until.isSameOrAfter(busy.start));
                if (!_busy) {
                  _count -= 1;
                  memo.push(id);
                }
              }
            } 
            return memo;
          }, []);
      
      return _book(calendar, _resources, _from, _until, _details);
    },
    
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
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};