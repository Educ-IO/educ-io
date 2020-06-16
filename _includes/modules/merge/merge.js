Merge = (options, factory) => {
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
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.create = () => new Promise(resolve => {

     /* <!-- Set Up Recent DBs if required --> */
     _.each(["data", "template"], name => options.state.session.recent[name] = (options.state.session.recent[name] ?
       options.state.session.recent[name] : {
         target: `${options.id}_${name}_recent`,
         db: factory.Items(factory, `${factory.Flags.dir()}--${name.toUpperCase()}`)
       }));

     factory.Display.template.show({
       template: "split",
       id: options.id,
       full: true,
       columns: {
         data: {
           sizes: {
             md: 6,
             lg: 8
           },
           text: "Merge Data",
           class: "hide-loaded-data",
           menu: $(".dropdown-menu[data-menu='Data']").html(),
           details: factory.Display.doc.get("DATA_DETAILS"),
           recent: {
             sizes: {
               xs: 12,
               lg: 8,
               xl: 9
             }
           },
           panel: {
             class: "show-loaded-data px-1"
           }
         },
         template: {
           sizes: {
             md: 6,
             lg: 4
           },
           text: "Output Template",
           class: "hide-loaded-template",
           menu: $(".dropdown-menu[data-menu='Template']").html(),
           details: factory.Display.doc.get("TEMPLATE_DETAILS"),
           recent: {
             sizes: {
               xs: 12
             }
           },
           panel: {
             class: "show-loaded-template px-1",
             frame: true
           }
         },
       },
       target: factory.container,
       clear: true,
     });

     _.each(_.keys(options.state.session.recent), key => {
       options.state.session.recent[key].db.last(5).then(recent => {
         recent && recent.length > 0 ? factory.Display.template.show({
           template: "recent",
           recent: recent,
           target: $(`#${options.state.session.recent[key].target}`),
           clear: true
         }) : false;
       }).catch(e => factory.Flags.error("Recent Items Failure", e ? e : "No Inner Error"));
     });

     resolve();

   });
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};