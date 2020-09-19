Source = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    span : "day",
    formats : {
      date: "D/M",
      time: ["ha", "hh:mma", "HH:mm", "HH:mm:ss"]
    }
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _date = (data, field, extra) => FN.date(_.find(data, data => data.name == field).value, 
                                              extra ? (value => value ? value.value : null)(_.find(data, data => data.name == extra)) : null);
  
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
          conferenceData: null
        };
    if (details) _event.summary = details;
    return factory.Google.calendar.events.create(calendar, _event);
  };
  
  var _group = (number, resources, from, until) => _.reduce(resources, (memo, resource, id) => {
      if (number > 0) {
        /* <!-- We don't yet have all the bookings we need --> */
        if (!resource.busy || resource.busy.length === 0) {
          /* <!-- Resource is definitely free --> */
          memo.push(id);
          number -= 1;
        } else {
          /* <!-- Check if resource is available --> */
          var _busy = _.find(resource.busy, busy => from.isSameOrBefore(busy.end) && until.isSameOrAfter(busy.start));
          if (!_busy) {
            number -= 1;
            memo.push(id);
          }
        }
      } 
      return memo;
    }, []);
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.formats = () => options.formats;
  
  FN.admin = () => factory.Google.admin.privileges()
      .then(privileges => {
        var privilege = _.find(privileges.items, item => item.serviceName == "calendar");
        return !!(privilege && privilege.childPrivileges && _.find(privilege.childPrivileges, 
          child => child.serviceName == "calendar" && child.privilegeName == "CALENDAR_RESOURCE"));
      })
      .catch(e => e.status === 403 ? null : factory.Flags.error("Privileges Error", e).reflect(false))
      .then(result => result === null ? 
            factory.Google.resources.features.insert(uuid.v4())
              .then(feature => factory.Google.resources.features.delete(feature.name))
              .catch(e => e.status === 403 ? null : factory.Flags.error("Feature Privilege Error", e).reflect(false)) : result);
  
  FN.book = {
    
    one: (calendar, id) => data => {
      factory.Flags.log("Booking Data:", data);
      return _book(calendar, id, 
                   _date(data, "from"),
                   _date(data, "until", "until-date"),
                   _text(data, "details")
                  );
    },
    
    group: (calendar, resources, number) => data => {
      factory.Flags.log("Booking Data:", data);
      var _from = _date(data, "from"),
          _until = _date(data, "until", "until-date");
      return _book(calendar, _group(number, resources, _from, _until),  _from, _until, _text(data, "details"));
    },
    
    bundle: (calendar, bundle, resources) => data => {
      factory.Flags.log("Booking Data:", data);
      var _from = _date(data, "from"),
          _until = _date(data, "until", "until-date"),
          _resources = _.chain(bundle.children).reduce((memo, part) => memo.concat(_group(part.quantity, _.pick(resources, _.pluck(part.children, "email")), _from, _until)), []).uniq().value();
      return _book(calendar, _resources,  _from, _until, _text(data, "details"));
    },
    
  };
  
  FN.calendar = calendar => factory.Google.calendars.get(calendar);
  
  FN.permissions = calendar => factory.Google.calendar.permissions.list(calendar);
  
  FN.notifications = calendar => factory.Google.calendars.notifications(calendar)
                                  .catch(e => e && e.status === 404 ? false : factory.Flags.error("Calendar List Error", e));
  
  FN.date = (time, date) => {
    var _date = options.state.session.current.clone();
    if (date) {
      var __date = factory.Dates.parse(date, options.formats.date);
      _date.set({
        "year": __date.month() < _date.month() ? _date.year() + 1 : _date.year(),
        "month": __date.month(),
        "date": __date.date(),
      });
    }
    return factory.Dates.parse(time, options.formats.time).set({
      "year": _date.year(),
      "month": _date.month(),
      "date": _date.date(),
    }); 
  };
  
  FN.dedupe = events => _.uniq(events, false, "id");
  
  FN.event = (calendar, id) => factory.Google.calendar.events.get(calendar, id);
  
  FN.start = () => factory.Dates.parse(options.state.session.current).startOf(options.span);
  
  FN.end = extend => factory.Dates.parse(options.state.session.current).add(extend ? extend : 0, options.span).endOf(options.span);
  
  FN.busy = (resources, extend) => factory.Google.calendar.busy(resources, FN.start(), FN.end(extend)),
  
  FN.events = (calendar, extend) => factory.Google.calendar.list(calendar, FN.start(), FN.end(extend));

  FN.resources = search => options.state.application.resources.safe()
      .then(resources => resources.find.resources(search))
      .then(options.functions.process.resources)
      .then(factory.Strings().sorter("name"));
  
  FN.bundles = (search, all) => options.state.application.resources.safe()
      .then(resources => options.functions.process.bundles(resources.find.bundles(search), resources.find.resources(), all ? resources.bundles() : null))
      .then(factory.Strings().sorter("name"));
  
  FN.children = parent => options.state.application.resources.safe()
      .then(resources => resources.children(parent));
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};