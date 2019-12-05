Calendar = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      format: "HH:mm"
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.confirmed = event => {
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
  
  FN.properties = event => event.extendedProperties && event.extendedProperties.private ? 
                    event.extendedProperties.private : {};
  
  FN.times = (from, until) => `${from.format(options.format)} - ${until.format(options.format)}`;

  FN.time = event => {
      event.confirmed = FN.confirmed(event),
      event.time = FN.times(factory.Dates.parse(event.start.dateTime),
        factory.Dates.parse(event.end.dateTime));
      event.created = event.created ? factory.Dates.parse(event.created) : event.created;
      event.updated = event.updated ? factory.Dates.parse(event.updated) : event.updated;
      return event.time;
    };
  
  FN.resources = event => {
    var _resources = _.filter(event.attendees, attendee => attendee.resource === true);
    if (!_resources || _resources.length === 0) return;
    return _.chain(_resources)
      .map(resource => _.extend(resource, _.omit(options.state.application.resources.get(resource.email), ["meta", "$loki"])))
      .flatten()
      .value();
  };
  
  FN.resource = event => {
    var _resources = FN.resources(event);
    if (_resources) event.resources = _resources;
  };
  
  FN.who = event => event.organizer ? 
              event.organizer.displayName ? factory.Display.username(event.organizer.displayName) :
              event.organizer.email : "";
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};