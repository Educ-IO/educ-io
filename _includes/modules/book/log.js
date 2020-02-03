Log = (options, factory) => {
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
    var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.loader = () => ({
    mime: factory.Google.files.natives()[1],
    properties: _.object([options.state.application.schema.property.name], [options.state.application.schema.property.value]),
  });

  FN.picker = () => _.extend({
    title: "Select a Booking Log Sheet to Open",
    view: "SPREADSHEETS",
    all: true,
    recent: true,
    team: true,
  }, FN.loader());
  
  FN.db = {

    pick: () => factory.Router.pick.single(FN.picker()),

    open: (id, version) => options.state.session.database.open(id, version),

    create: () => options.state.session.database.create(options.state.application.schema.sheets.sheet_tasks,
      options.state.application.schema.names.spreadsheet,
      options.state.application.schema.names.sheet),

  };
  
  FN.config = {

    db: id => ($("nav a[data-link='sheet']").prop("href", `https://docs.google.com/spreadsheets/d/${id}/edit`), id),

    create: id => options.state.application.config.create({
        data: id
      }).then(factory.Main.busy("Saving Config"))
      .then(config => {
        factory.Flags.log(`Created Config File: ${config.id}`, config.settings);
        FN.config.db(config.settings.data);
        return factory.Google.files.get(config.settings.data, true)
          .then(file => (ರ‿ರ.db = FN.db.open(config.settings.data, file.version)));
      }),

    pick: () => FN.db.pick().then(file => file ? FN.config.create(file.id) : false).catch(e => e ? factory.Flags.error("Picker Error", e) :
      FN.db.create().then(factory.Main.busy("Creating Database"))
      .then(result => FN.config.create(result.spreadsheetId))),

    use: config => {

      factory.Flags.log(`Config from File: ${config.id}`, config.settings);

      return factory.Google.files.get(config.settings.data, true)
        .then(file => (ರ‿ರ.db = FN.db.open(FN.config.db(config.settings.data), file.version)))
        .then(factory.Main.busy("Loading Database"));

    },

    current: () => (options.state.session.config ?
        Promise.resolve(options.state.session.config) : options.state.application.config.get())
      .then(factory.Main.busy("Loading Config"))
      .then(config => options.state.session.config = config)
      .then(config => config ? FN.config.use(config) : FN.config.pick()),

  };
  
  FN.loan = (id, event) => data => {

    FN.confirm.status(id, "LOANED");
    factory.Flags.log(`Loaned Event: ${id}`, event);

    return Promise.all(_.map(data, (serial, id) => {
      var resource = _.find(event.what, resource => resource.id === id),
        item = {};

      /* <!-- Populate Resource Booking Object --> */
      item[options.state.application.schema.columns.calendar.value] = resource.email; /* <!-- Resource Calendar Email --> */
      item[options.state.application.schema.columns.event.value] = event.id; /* <!-- Booking Event ID --> */
      item[options.state.application.schema.columns.resource.value] = resource.id; /* <!-- Resource ID --> */
      item[options.state.application.schema.columns.name.value] = resource.name; /* <!-- Resource Name --> */
      item[options.state.application.schema.columns.identifier.value] = serial.Value; /* <!-- User Supplied Identifier / Serial --> */
      item[options.state.application.schema.columns.loaned.value] = new Date(); /* <!-- Loaned Out Date --> */
      item[options.state.application.schema.columns.loaned_by.value] = factory.me.display_name(); /* <!-- Loaned By | Current User --> */
      item[options.state.application.schema.columns.loaned_to.value] = event.who; /* <!-- Loaned To | End User --> */

      /* <!-- Insert Into DB  --> */
      return options.state.session.database.items.insert(item)
        .then(inserted => factory.Flags.log("DB Inserted Row", inserted))
        .catch(e => factory.Flags.error("DB Insert Booking Error", e));

    }));

  };
  
  FN.return = (id, event) => data => {

    FN.confirm.status(id, "RETURNED");
    factory.Flags.log(`Returned Event: ${id}`, event);

    return Promise.all(_.map(data, (value, id) => {

      var resource = _.find(event.what, resource => resource.id === id),
        item = options.state.session.database.loan(event.id, resource.id);

      /* <!-- Update Resource Booking Object --> */
      item[options.state.application.schema.columns.returned.value] = new Date(); /* <!-- Returned Back Date --> */
      item[options.state.application.schema.columns.returned_by.value] = event.who; /* <!-- Returned By | End User --> */
      item[options.state.application.schema.columns.returned_to.value] = factory.me.display_name(); /* <!-- Returned To | Current User --> */

      /* <!-- Update In DB  --> */
      return options.state.session.database.items.update(item)
        .then(updated => factory.Flags.log("DB Updated Row", updated))
        .catch(e => factory.Flags.error("DB Insert Booking Error", e));

    }));

  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    opened : () => !!ರ‿ರ.db,
    
    config : FN.config.current,
    
    loan: FN.loan,
    
    return: FN.return,
    
  };
  /* <!-- External Visibility --> */

};