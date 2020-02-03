Populate = (options, factory) => {
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
  var ರ‿ರ = {},
      /* <!-- State --> */
      ಱ = {
        db: new loki("list.db"),
      }; /* <!-- Persistant --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _db = (name, schema, data, map) => {
      ರ‿ರ[name] = ಱ.db.addCollection(name, schema);
      ರ‿ರ[name].clear({
        removeIndices: false
      });
      ರ‿ರ[name].insert(map ? _.map(data, map) : data);
      factory.Flags.log(`DB Loaded ${name.toUpperCase()}:`, ರ‿ರ[name].data);
      return ರ‿ರ[name];
    };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.all = () => ರ‿ರ.events;
  
  FN.event = event => {
    event.what = options.functions.calendar.resources(event);
    event.who = options.functions.calendar.who(event);
    event.when = options.functions.calendar.time(event);
    event.date = options.functions.calendar.date(event);
    return event;
  };
  
  FN.calendar = (calendar, events) => _.map(events, event => _.tap(event, event => event.calendar = calendar));
  
  FN.events = data => _db("events", {
      unique: ["id"],
      indices: ["when", "what", "who"]
    }, data, value => ({
      id: value.id,
      date: options.functions.calendar.date(value),
      when: options.functions.calendar.time(value),
      what: options.functions.calendar.resources(value),
      who: options.functions.calendar.who(value),
      properties: options.functions.calendar.properties(value),
      manageable: value.manageable,
      source: value.calendar,
      url: value.htmlLink
    }));
  
  FN.get = id => ರ‿ರ.events.findOne({
    id: {
      "$eq": id
    }
  });

  FN.update = event => ರ‿ರ.events.update(event);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};