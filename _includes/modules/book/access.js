Access = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
    var ರ‿ರ = {
      list: []
    }; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.access = events => {

    /* <!-- TODO: Sequential map to check writer/owner rights per calendar? --> */
    if (!events || events.length === 0) return Promise.resolve(events);
    
    var _return = (id, manager) => ರ‿ರ.list[ರ‿ರ.list.push({
        id: id,
        manager: manager
      }) - 1],
        _check = id => factory.Google.calendars.add(id, {hidden: true})
          .then(calendar => {
            factory.Google.calendars.remove(calendar.id);
            return _return(calendar.id, calendar.accessRole == "writer" || calendar.accessRole == "owner");
          });
    
    var source = _.find(ರ‿ರ.list, item => item.id == events[0].calendar);

    return (source ? 
              Promise.resolve(source) : 
              ರ‿ರ.admin === true ? 
                Promise.resolve(_return(events[0].calendar, true)) : 
                  /* <!-- This only works for calendars added to a users calendar! --> */
                  options.functions.source.calendar(events[0].calendar)
                    .then(calendar => _return(calendar.id, calendar.accessRole == "writer" || calendar.accessRole == "owner"))
                    .catch(e => e.status === 404 ? _check(events[0].calendar) : _return(events[0].calendar, false)))
      .then(calendar => _.map(events, event => _.tap(event, event => event.manageable = calendar.manager)));
    
  };

  FN.admin = () => ರ‿ರ.admin === undefined ? options.functions.source.admin().then(admin => ರ‿ರ.admin = admin) : Promise.resolve(ರ‿ರ.admin);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    access: FN.access,
    
    admin: FN.admin,
    
  };
  /* <!-- External Visibility --> */

};