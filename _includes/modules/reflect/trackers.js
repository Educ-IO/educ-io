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
    
    one : file => file ? factory.Google.files.download(_.isString(file) ? file : (options.state.session.file = file).id) : false,
    
  };
  
  FN.prompt = {
  
    name : scale => factory.Display.text({
              id: "file_name",
              title: "File Name",
              message: factory.Display.doc.get("TRACKER_NAME"),
              state: {
                value: `${scale.title} | ${factory.Dates.now().format("YYYY-MM-DD")}`
              },
              simple: true
            }),
    
  };
  
  FN.create = {
    
    tracker : (scale, name, file) => {
    
      _.omit(scale, "criteria");
      
      var _omit = values => _.map(values, value => {
        var _value = _.omit(value, "criteria");
        if (_value.children && _value.children.length > 0) _value.children = _omit(_value.children);
        return _value;
      }), _tracker = {
        name: name,
        scale: {
            name: scale.name,
            title: scale.title,
            type: scale.type,
            scale: _omit(scale.scale)
        },
        tracker: _new(),
      };

      factory.Flags.log("CREATED TRACKER", _tracker);

      return options.functions.save.tracker(_tracker, file, true).then(() => _tracker);

    },
    
    named : scale => scale ? FN.prompt.name(scale).then(name => name ? FN.create.tracker(scale, name, options.title(name, options.type, true)) : false) : false,
    
    scale : () => options.forms.safe()
          .then(forms => options.choose(forms.selection("scales", "Scale"), "Create a Tracker ...", "TRACKER_SCALE", false)
            .then(scale => scale ? forms.scale(scale.value) : false)
            .then(FN.create.named)),
      
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
  
    create: scale => options.forms.safe()
          .then(forms => forms.scale(scale))
          .then(FN.create.named),
    
  };
  /* <!-- External Visibility --> */

};