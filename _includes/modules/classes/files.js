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
  const EXTENSION = ".classes";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.prefix = mime => mime == options.mime ? "CLASSES DATA" : "";
  
  FN.matches = name => name && /CLASSES DATA | \d{4}-\d{1,2}-\d{1,2}/i.test(name);

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

  FN.dehydrate = () => ({
    since: options.functions.overview.since(),
    data: options.functions.populate.save(),
  });
  
  FN.hydrate = text => Promise.resolve(JSON.parse(text))
    .then(hydrated => {
      options.functions.overview.since(hydrated.since, true);
      options.functions.populate.load(hydrated.data);
      factory.Display.state().enter(options.functions.states.file.loaded);  
    })
    .then(() => options.functions.overview.show(options.functions.populate.all())),
  
  FN.parse = file => {
    options.state.session.current = factory.Dates.parse(file.modifiedTime).startOf("day");
    return factory.Google.files.download(file.id)
      .then(loaded => factory.Google.reader().promiseAsText(loaded))
      .then(factory.Main.busy("Loading Classes Data"))
      .then(FN.hydrate);
  };
  
  FN.create = name => factory.Google.files.upload({
      name: name,
    }, JSON.stringify(FN.dehydrate(), null, 2), options.mime)
            .then(factory.Main.busy("Creating Classes Data"))
            .catch(e => factory.Flags.error("Creating", e).negative())
            .then(options.state.application.notify.actions.save("NOTIFY_EXPORT_DATA_SUCCESS"));

  FN.update = (name, file) => factory.Google.files.upload(name ? {
      name: name,
    } : null, JSON.stringify(FN.dehydrate(), null, 2), options.mime, null, file.id)
            .then(factory.Main.busy("Updating Classes Data"))
            .catch(e => factory.Flags.error("Updating", e).negative())
            .then(options.state.application.notify.actions.save("NOTIFY_EXPORT_DATA_SUCCESS"));

  FN.download = name => {
    try {
      saveAs(new Blob([JSON.stringify(FN.dehydrate(), null, 2)], {
        type: "application/json"
      }), `${name || "Download"}.json`);
    } catch (e) {
      factory.Flags.error("Download", e);
    }
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Public Functions --> */
  FN.load = () => factory.Router.pick.single(FN.loader("Select a Classes File to Load")).then(FN.parse)
                    .catch(e => (e ? factory.Flags.error("Loading", e) : factory.Flags.log("Loading Picker Cancelled")).negative());
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    hydrate : FN.hydrate,
    
    load : FN.load,
    
    parse : FN.parse,

    save : () => factory.Display.text({
      id: "file_name",
      title: "File Name",
      message: factory.Display.doc.get("SAVE_FILE"),
      state: {
        value: FN.title(factory.Dates.now().format(options.format), options.mime)
      },
      action: "Create New",
      actions: [{
        text: "Download",
        handler: values => values && values.value ? FN.download(values.value.Value) : false,
        dismiss: true,
      }, {
        text: "Update Existing",
        handler: values => factory.Router.pick.single(FN.loader("Select a Classes File to Update"))
                  .then(file => FN.update(values && values.value && FN.matches(file.name) ? 
                                            values.value.Value : null, file))
                  .catch(e => (e ? factory.Flags.error("Updating", e) : factory.Flags.log("Update Picker Cancelled")).negative()),
        dismiss: true,
      }],
      simple: true
    }).then(FN.create),
  
  };
  /* <!-- External Visibility --> */

};