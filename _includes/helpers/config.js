Config = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provide interface for finding, loading, editing and updating application configuration --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.name: Config Filename [Optional]  --> */
  /* <!-- @options.mime: Config MIME Type [Optional]  --> */
  
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore, Moment or Day.Js | App Scope: Flags, Display, Google --> */

  /* <!-- Internal Consts --> */
  const DEFAULTS = {
    name: "config.json",
    mime: "application/json",
    fields: {
      comparison: [],
      array: [],
      complex: [],
      simple: [],
    },
    defaults: null,
    state: false,
  };
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Methods --> */
  var _clear = id => (id ? factory.Google.files.delete(id) : factory.Google.appData.search(options.name, options.mime)
    .then(results => Promise.all(_.map(results, result => factory.Google.files.delete(result.id)))))
    .then(result => result ? factory.Flags.log("App Config Deleted").positive() : result);

  var _create = settings => factory.Google.appData.upload({
      name: options.name
    }, JSON.stringify(settings), options.mime)
    .then(uploaded => {
      factory.Flags.log(`App Config (${options.name}) Saved`, uploaded);
      if (options.state) factory.Display.state().enter(options.state);
      return {
        id: uploaded.id,
        settings: settings
      };
    })
    .catch(e => factory.Flags.error("Upload Error", e ? e : "No Inner Error"));

  var _find = () => factory.Google ? factory.Google.appData.search(options.name, options.mime).then(results => {
    if (results && results.length > 0) {
      results.length === 1 ?
        factory.Flags.log(`Found App Config [${results[0].name} / ${results[0].id}]`) :
        factory.Flags.log(`Found ${results.length} App Configs (Using First):`, _.map(results, result => ({
          id: result.id,
          name: result.name
        })));
      return results[0];
    } else {
      return factory.Flags.log("No Existing App Config").negative();
    }
  }).catch(e => factory.Flags.error("Config Error", e ? e : "No Inner Error").nothing()) : Promise.resolve(false);

  var _load = file => factory.Google.files.download(file.id).then(loaded => {
    return factory.Google.reader().promiseAsText(loaded).then(parsed => {
      factory.Flags.log(`Loaded App Config [${file.name} / ${file.id}]: ${parsed}`);
      if (options.state) factory.Display.state().enter(options.state);
      return {
        id: file.id,
        settings: JSON.parse(parsed),
      };
    });
  });

  var _get = () => _find().then(result => result && result.id ? _load(result) : result);

  var _update = (id, settings) => factory.Google.appData.upload({
      name: options.name
    }, JSON.stringify(settings), options.mime, id)
    .then(uploaded => {
      factory.Flags.log(`App Config (${options.name}) Updated`, uploaded);
      return {
        id: uploaded.id,
        settings: settings
      };
    })
    .catch(e => factory.Flags.error("Upload Error", e ? e : "No Inner Error"));

  var _value = (value, prop) => {
    
    if (/^\S+_\S+$/i.test(prop)) {
      var props = prop.split("_");
      prop = props.pop();
      value = _.reduce(props, (memo, prop) => memo[prop] || (memo[prop] = {}), value);
    }
    
    return {
      
      delete: () => value[prop],
      
      get: () => value[prop],
      
      set: value => value[prop] = value,
      
    };
    
  };
  
  var _process = (values, current) => {

    var _config = {};

    if (options.fields) {
      
      /* <!-- Comparison Sets --> */
      if (options.fields.comparison) _.each(options.fields.comparison, prop => {
        if (values[prop] && _value(current, prop).get() != values[prop].Value)
          _value(_config, prop).set(values[prop].Value);
      });
      
      /* <!-- Array Sets (override) --> */
      if (options.fields.array) _.each(options.fields.array, prop => {
        values[prop] && (
            (_.isArray(values[prop].Values) && values[prop].Values.length > 0) ||
            (_.isObject(values[prop].Values) && values[prop].Values.id)) ?
          _value(_config, prop).set(_.isArray(values[prop].Values) ?
          values[prop].Values : [values[prop].Values]) :
          _value(current, prop).delete();
      });
      
      /* <!-- Complex Sets --> */
      if (options.fields.complex) _.each(options.fields.complex, prop => {
        values[prop] === undefined ?
          _value(current, prop).delete() :
          values[prop].Value <= 0 ?
          _value(_config, prop).set(false) :
          values[prop] ?
          _value(_config, prop).set(values[prop].Value) :
          _value(current, prop).delete();
      });
      
      /* <!-- Simple Sets --> */
      if (options.fields.simple) _.each(options.fields.simple, prop => {
        values[prop] === undefined ?
          _value(current, prop).delete() :
          values[prop] && values[prop].Value >= 0 ?
          _value(_config, prop).set(values[prop].Value) :
          _value(current, prop).delete();
      });
      
    }
    
    return _config;

  };
  /* <!-- Internal Methods --> */

  /* <!-- External Visibility --> */
  return {

    create: _create,

    clear: _clear,

    defaults: () => options.defaults,
    
    fields: () => options.fields,
    
    find: _find,

    get: _get,

    load: _load,

    process: _process,
    
    update: _update,

  };
  /* <!-- External Visibility --> */

};