Calendar = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      format : {
        short : "HH:mm",
        long : "Do | HH:mm",
        partial : "HH:mm (Do MMM)",
        display : "[<strong>]Do, MMM[</strong>] | HH:mm",
      }
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _confirmed = event => {
    var _confirmed = attendees => {
      var _confirmed = null;
      _.each(attendees, attendee => {
        attendee.confirmed = event.attendees[0].responseStatus == "accepted" ? true :
                          event.attendees[0].responseStatus == "needsAction" ? false : null;
        _confirmed = _confirmed === null ? 
          attendee.confirmed : 
          _confirmed === true && attendee.confirmed === false ?
            attendee.confirmed : _confirmed;
      });
      return _confirmed;
    };
    return event.resources || event.attendees ?  _confirmed(event.resources || event.attendees) : null;
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.confirmed = events => _.isArray(events) ? _.chain(events).flatten().map(_confirmed).value() : _confirmed(events);
  
  FN.properties = event => event.extendedProperties && event.extendedProperties.private ? 
                    event.extendedProperties.private : {};
  
  FN.date = event => factory.Dates.parse(event.start.date || event.start.dateTime).startOf("day"),

  FN.times = (from, until, dates, display, partial) => {
    var _start = options.state.session.current.clone().startOf("day"),
        _end = options.state.session.current.clone().endOf("day"),
        _format = display ? options.format.display : partial ? options.format.partial : options.format.long,
        _form = from.format((dates || from < _start) ? _format : options.format.short),
        _until = until.format((dates || until > _end) && (from.year() !== until.year() || from.dayOfYear() !== until.dayOfYear()) ? _format : options.format.short);
    return `${_form} - ${_until}`;
  };

  FN.time = event => {
      event.confirmed = FN.confirmed(event),
      event.time = event.start.dateTime ? FN.times(factory.Dates.parse(event.start.dateTime),
        factory.Dates.parse(event.end.dateTime), false, false, true) : "00:00 - 23:59";
      event.dates = event.start.dateTime ? FN.times(factory.Dates.parse(event.start.dateTime),
        factory.Dates.parse(event.end.dateTime), true, true) : "All Day";
      event.duration = (event.start.dateTime ? 
                        moment.duration(factory.Dates.parse(event.end.dateTime).diff(factory.Dates.parse(event.start.dateTime))) : 
                        moment.duration(1, "days")).humanize();
      event.created = event.created ? factory.Dates.parse(event.created) : event.created;
      event.updated = event.updated ? factory.Dates.parse(event.updated) : event.updated;
      return event.time;
    };
  
  FN.resources = event => {
    var _resources = _.filter(event.attendees, attendee => attendee.resource === true);
    if (!_resources || _resources.length === 0) return;
    return _.chain(_resources)
      .map(resource => _.extend(_.clone(resource), _.omit(options.state.application.resources.get(resource.email), ["meta", "$loki"])))
      .flatten()
      .value()
      .sort(factory.Strings().sort("name"));
  };
  
  FN.resource = event => {
    var _resources = FN.resources(event);
    if (_resources) event.resources = _resources;
  };
  
  FN.who = event => event.organizer ? 
              event.organizer.displayName ? factory.handlebars.username(event.organizer.displayName) :
              event.organizer.email : "";
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};