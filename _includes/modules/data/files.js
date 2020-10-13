Files = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      format: "YYYY-MM-DD",
      
    },
    FN = {};
  const EXTENSION = ".data";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.prefix = mime => mime == options.mime ? "ACADEMIC DATA" : "";
  
  FN.matches = name => name && /ACADEMIC DATA | \d{4}-\d{1,2}-\d{1,2}/i.test(name);

  FN.title = (title, mime, extension) => {
    var _prefix = FN.prefix(mime);
    return `${_prefix ? `${_prefix} | ` : ""}${title}${extension === true ? EXTENSION : extension || ""}`;
  };

  FN.loader = title => ({
    title: title,
    view: "DOCS",
    mime: options.mime,
    label: "My Drive",
    all: true,
    team: true,
    include_folders: false,
    shared_with_me: true,
  });

  FN.dehydrate = (provider, data, loaded) => ({
    provider: provider,
    loaded: loaded && loaded.toISOString ? loaded.toISOString() : factory.Dates.now().toISOString(),
    data: data,
  });
  
  FN.hydrate = text => Promise.resolve(JSON.parse(text))
    .then(hydrated => {
      options.state.session.current = hydrated.loaded ?
        factory.Dates.parse(hydrated.loaded) : factory.Dates.now().startOf("day");
      factory.Display.state().enter(options.functions.states.file.loaded);  
      return hydrated;
    }),
  
  FN.parse = file => factory.Google.files.download(file.id)
      .then(loaded => factory.Google.reader().promiseAsText(loaded))
      .then(factory.Main.busy("Loading Academic Data"))
      .then(FN.hydrate);
  
  FN.action = (provider, data, loaded) => {
    
    var _data = FN.dehydrate(provider, data, loaded),
        _create = name => factory.Google.files.upload({
            name: name,
          }, JSON.stringify(_data, null, 2), options.mime)
                  .then(factory.Main.busy("Creating Academic Data"))
                  .catch(e => factory.Flags.error("Creating", e).negative())
                  .then(options.state.application.notify.actions.save("NOTIFY_EXPORT_DATA_SUCCESS")),
        _update = (name, file) => factory.Google.files.upload(name ? {
          name: name,
        } : null, JSON.stringify(_data, null, 2), options.mime, null, file.id)
                .then(factory.Main.busy("Updating Academic Data"))
                .catch(e => factory.Flags.error("Updating", e).negative())
                .then(options.state.application.notify.actions.save("NOTIFY_EXPORT_DATA_SUCCESS")),
        _download = name => {
          try {
            saveAs(new Blob([JSON.stringify(_data, null, 2)], {
              type: "application/json"
            }), `${name || "Download"}.json`);
          } catch (e) {
            factory.Flags.error("Download", e);
          }
        },
        _save = () => factory.Display.text({
          id: "file_name",
          title: "File Name",
          message: factory.Display.doc.get("SAVE_FILE"),
          state: {
            value: FN.title(factory.Dates.now().format(options.format), options.mime)
          },
          action: "Create New",
          actions: [{
            text: "Download",
            handler: values => values && values.value ? _download(values.value.Value) : false,
            dismiss: true,
          }, {
            text: "Update Existing",
            handler: values => factory.Router.pick.single(FN.loader("Select a Data File to Update"))
                      .then(file => _update(values && values.value && FN.matches(file.name) ? 
                                                values.value.Value : null, file))
                      .catch(e => (e ? factory.Flags.error("Updating", e) : factory.Flags.log("Update Picker Cancelled")).negative()),
            dismiss: true,
          }],
          simple: true
        }).then(_create);
        
    return {
    
      create : _create,

      update : _update,

      download : _download,
      
      save: _save,

    };
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Public Functions --> */
  FN.load = () => factory.Router.pick.single(FN.loader("Select a Data File to Load")).then(FN.parse)
                    .catch(e => (e ? factory.Flags.error("Loading", e) : factory.Flags.log("Loading Picker Cancelled")).negative());
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    hydrate : FN.hydrate,
    
    load : FN.load,
    
    parse : FN.parse,

    action : FN.action,
  
  };
  /* <!-- External Visibility --> */

};