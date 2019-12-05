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
    preferences: {
      id : "edit_Preferences",
      template : "config",
      title : "Preferences",
    },
    state: false,
  };
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Methods --> */
  var _clear = () => factory.Google.appData.search(options.name, options.mime)
    .then(results => Promise.all(_.map(results, result => factory.Google.files.delete(result.id))))
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
    if (results && results.length == 1) {
      factory.Flags.log(`Found App Config [${results[0].name} / ${results[0].id}]`);
      return results[0];
    } else {
      return factory.Flags.log("No Existing App Config").negative();
    }
  }).catch(e => factory.Flags.error("Config Error", e ? e : "No Inner Error")) : Promise.resolve(false);

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

  var _get = () => _find().then(result => result ? _load(result) : result);

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

  var _edit = settings => factory.Display.modal(options.preferences.template, {
    id: options.preferences.id,
    title: options.preferences.title,
    enter: true,
    state: _.mapObject(
              settings, 
              (value, key) => options.fields && options.fields.complex && options.fields.complex.indexOf(key) >= 0 ?
                       value === false ? 0 : value : value),
  });

  var _field = field => $(`#${options.preferences.id} div[data-output-field='${field}']`);

  var _label = field => field.find("small.form-text").toggleClass("d-none", field.find("li").length === 0);

  var _remove = (field, id) => _label(_field(field).find(`li[data-id='${id}']`).remove());
  
  var _add = (field, template, items) => {
    var _list = (field = _field(field)).children("ul");
    _.each(items, item => {
      if (_list.find(`li[data-id='${item.id}']`).length === 0)
        $(factory.Display.template.get((_.extend({
          template: template
        }, item)))).appendTo(_list);
    });
    _label(field);
  };

  var _process = (values, current) => {

    var _config = {};

    if (options.fields) {
      
      /* <!-- Comparison Sets --> */
      if (options.fields.comparison) _.each(options.fields.comparison, prop => {
        if (values[prop] && current[prop] != values[prop].Value)
          _config[prop] = values[prop].Value;
      });
      
      /* <!-- Array Sets (override) --> */
      if (options.fields.array) _.each(options.fields.array, prop => {
        values[prop] && (
            (_.isArray(values[prop].Values) && values[prop].Values.length > 0) ||
            (_.isObject(values[prop].Values) && values[prop].Values.id)) ?
          _config[prop] = _.isArray(values[prop].Values) ?
          values[prop].Values : [values[prop].Values] :
          delete current[prop];
      });
      
      /* <!-- Complex Sets --> */
      if (options.fields.complex) _.each(options.fields.complex, prop => {
        values[prop] === undefined ?
          delete current[prop] :
          values[prop].Value <= 0 ?
          _config[prop] = false :
          values[prop] ?
          _config[prop] = values[prop].Value :
          delete current[prop];
      });
      
      /* <!-- Simple Sets --> */
      if (options.fields.simple) _.each(options.fields.simple, prop => {
        values[prop] === undefined ?
          delete current[prop] :
          values[prop] && values[prop].Value >= 0 ?
          _config[prop] = values[prop].Value :
          delete current[prop];
      });
      
    }
    
    return _config;

  };
  /* <!-- Internal Methods --> */

  /* <!-- External Visibility --> */
  return {

    add: _add,

    create: _create,

    clear: _clear,

    find: _find,

    load: _load,

    remove: _remove,

    update: _update,


    /* <!-- TODO: Clean this up --> */
    edit: _edit,

    get: _get,

    process: _process,

  };
  /* <!-- External Visibility --> */

};