Evidence = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to display and show evidence --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id : "evidence"
  }, FN = {};
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal State Variable --> */
  var ರ‿ರ = {};
  /* <!-- Internal State Variable --> */
  
  /* <!-- Internal Functions --> */
  FN.decode = values => values,
    
  FN.store = tracker => ({
    
    add : evidence => {
      tracker.tracker.evidence.push({
        when: factory.Dates.now().format(),
        details: evidence
      });
      return options.functions.save.tracker(tracker, null, true);
    },
    
  });
  /* <!-- Internal Functions --> */
  
  /* <!-- Display Functions --> */
  /* <!-- Display Functions --> */
  
  /* <!-- Main Functions --> */
  FN.add = tracker => {
      factory.Flags.log("ADDING EVIDENCE", tracker);
      return factory.Display.modal("evidence", {
            id: `dialog_${options.id}`,
            title: "Log Evidence",
            instructions: factory.Display.doc.get("LOG_EVIDENCE"),
            action: "Add",
            evidence : {
              id: `dialog_${options.id}_Evidence`,
              field: "Evidence",
              title: "Evidence",
              prefix: "Evidence",
              icon: "grade",
              required: true,
              type : "Evaluation",
              list_template : "field_items",
              list_field: "Evaluations",
              items_details : "Further details about how this was met",
              options: [
                {name : "From Google Drive", value: "drive", class: "g-picker"},
                {name : "From File", value: "file", class: "g-file"},
                {name : "From Web", value: "web", class: "web"},
              ],
            },
            scale : {
              id: `dialog_${options.id}_Scale`,
              field: "Scale",
              wide: true,
              markers: options.forms.process(tracker.scale.scale),  
            },
          }, dialog => options.fields.on(dialog.find("form")))
        .then(values => values ? FN.store(tracker).add(FN.decode(values)) : false); /* <!-- Action Button Clicked (e.g. not dismissed) --> */
        
    };
  /* <!-- Main Functions --> */

  /* <!-- Initial Run --> */
  /* <!-- Initial Run --> */

  /* <!-- External Visibility --> */
  return {
    
    add: FN.add,
    
    state: () => ರ‿ರ,
    
  };
  /* <!-- External Visibility --> */

};