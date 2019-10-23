Trackers = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle archiving of items --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _new = () => ({
    evidence: []
  });
  /* <!-- Internal Functions --> */
  
  /* <!-- Main Functions --> */
  FN.get = {
    
    all : () => factory.Google.files.type(options.type, "domain,user,allTeamDrives")
                      .catch(e => factory.Flags.error("Trackers Finding Error", e).negative())
                      .then(factory.Main.busy("Looking for Existing Trackers")),
    
    one : file => file ? factory.Google.files.download(_.isString(file) ? file : file.id) : false,
    
  };
  
  FN.create = {
    
    tracker : (scale, name, file) => {
    
      var _tracker = {
        name: name,
        scale: scale,
        tracker: _new(),
      }, _file;

      factory.Flags.log("CREATED TRACKER", _tracker);

      factory.Google.files.upload({
              name: file 
            }, JSON.stringify(_tracker, options.replacer, 2), options.type)
        .then(factory.Main.busy("Creating"))
        .then(uploaded => {
          _file = uploaded;
          factory.Flags.log("Uploaded File", _file);
        });

      return _tracker;

    },
    
    scale : () => options.scale().then(value => value ? FN.create.tracker(value.scale, value.name, value.file) : false),
      
  },
  
  FN.choose = {
    
    one : files => {
      
      var _create = false;
      return options.choose(_.map(files, file => ({
          value: file.id,
          name: file.name,
          title: factory.Display.template.get({
            template: "meta",
            Created: factory.Dates.parse(file.createdTime).format("YYYY-MM-DD"),
            Modified: factory.Dates.parse(file.modifiedByMeTime).format("YYYY-MM-DD")
          }),
          html: true,
        })), "Open Existing or Create New?", "EXISTING_REPORT_INSTRUCTIONS", false, [{
        text: "Create New",
        handler: () => _create = true
      }], null, "Open")
      .then(value => _create ? FN.create.scale() : value ? 
            FN.get.one(_.find(files, file => file.id == value.value))
              .then(loaded => factory.Google.reader().promiseAsText(loaded)).then(JSON.parse) : false);
      
    }
    
  };
  /* <!-- Main Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    all: FN.get.all,
    
    choose: () => FN.get.all().then(files => files && files.length ? FN.choose.one(files) : FN.create.scale()),
  
  };
  /* <!-- External Visibility --> */

};