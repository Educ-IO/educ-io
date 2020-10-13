Detail = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id : "detail",
      format: "Do MMM, YYYY",
      long_format: "HH:mm Do MMM, YYYY",
    },
    FN = {},
    HIDDEN = ["ID"];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.id = () => `${options.id}_container`;
  /* <!-- Internal Functions --> */
  
  /* <!-- Render Functions --> */
  FN.render = {
    
    body: element => ರ‿ರ.body = factory.Display.template.show({
        template: "detail_body",
        id: FN.id(),
        classes: ["pt-2"],
        target: element || factory.container,
        clear: true
      }),
    
    wrapper: (source, current) => ({
      classes: ["pt-1", "scroller"],
      id: options.id,
      header: factory.Display.template.get("detail_header")({
        source: source.toLowerCase(),
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Overview",
        subtitle: factory.Display.doc.get("DETAIL_SUBTITLE", factory.Dates.parse(current).format(options.format)),
        details: ರ‿ರ.since ? factory.Display.doc.get({
          name: "VIEW_DETAILS",
          data: {
            source: source,
            current: factory.Dates.parse(current).format(options.long_format),
          }
        }) : null,
      }).trim()
    }),
    
    view: (source, loaded, data, headers) => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: data,
          headers: options.state.application.tabulate.headers(headers, HIDDEN),
        }, {
          classes: ["table-hover"],
          advanced: false,
          collapsed: true,
          wrapper: FN.render.wrapper(source, loaded),
          complex: true,
        }, FN.render.body()),
    
  };
  /* <!-- Render Functions --> */
  
  /* <!-- Public Functions --> */
  FN.show = (source, loaded, data, headers) => ರ‿ರ.table = FN.render.view(source, loaded || new Date(), data, headers);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    show: FN.show,
    
    table: () => ರ‿ರ.table,
    
    detach: () => {
      ರ‿ರ.body.detach();
      return Promise.resolve(ರ‿ರ.table);
    },
    
    attach: element => {
      (element || factory.container).empty().append(ರ‿ರ.body);
      return Promise.resolve(ರ‿ರ.table);
    },
    
  };
  /* <!-- External Visibility --> */

};