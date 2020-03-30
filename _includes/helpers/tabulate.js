Tabulate = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.data = (state, db, name, schema, data, map) => {
      state[name] = db.addCollection(name, schema);
      state[name].clear({
        removeIndices: false
      });
      state[name].insert(map ? _.map(data, map) : data);
      factory.Flags.log(`DB Loaded ${name.toUpperCase()}:`, state[name].data);
      return state[name];
    };
  
  FN.headers = (fields, hidden) => _.map(fields, v => ({
      name: v.name || v,
      display: v.display || null,
      hide: function(initial) {
        return !!(this.hide_now || this.hide_always || (initial && this.hide_initially));
      },
      set_hide: function(now, always, initially) {
        this.hide_initially = initially;
      },
      hide_always: (v.name || v).indexOf("$") === 0 || (v.name || v).indexOf("_") === 0,
      hide_now: false,
      hide_initially: hidden && hidden.indexOf && hidden.indexOf(v.name || v) >= 0 ? true : false,
      field: (v.name || v).toLowerCase(),
      icons: (v.name || v) === "When" || (v.name || v) === "Created" || (v.name || v) === "Updated" ? ["access_time"] : null
    }));
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};