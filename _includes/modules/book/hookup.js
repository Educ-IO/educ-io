Hookup = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    delay: 100,
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Debounce Functions --> */
  var _debounce = {
    
    check : periods => _.debounce(options.action.check(periods), options.delay * 2),
    
    number : fn => _.debounce(options.action.number(fn), options.delay / 2),
    
    search : _.debounce(options.action.search, options.delay),
    
    toggle : _.debounce(options.action.toggle, options.delay * 4),
    
  };
  /* <!-- Debounce Functions --> */
  
  /* <!-- Internal Functions --> */
  var _toggle = items => items.off("change.toggle").on("change.toggle", _debounce.toggle);
  
  var _resource = items => items.off("click.resource").on("click.resource", options.action.resource);
  
  var _event = items => factory.Flags.log("Existing Booking Items:", items);
  
  var _number = (items, fn) => items.off("change.number").on("change.number", _debounce.number(fn));
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.number = fn => parent => (_number(parent.find("input.custom-range"), fn), parent),
    
  FN.toggle = parent => (_toggle(parent.find("input.custom-control-input")), parent);
    
  FN.resource = parent => (_resource(parent.find("a.resource-item, div.resource-group")), parent);
    
  FN.search = parent => (parent.find("input.search")
      .off("input.search")
      .on("input.search", _debounce.search), parent);

  FN.shortcut = parent => (parent.find("input.shortcut")
      .off("keyup.shortcut")
      .on("keyup.shortcut", options.action.shortcut), parent);
  
  FN.book = periods => parent => (
      parent.find("input.times")
        .off("input.times")
        .on("input.times", _debounce.check(periods))
        .trigger("input"), /* <!-- Input is triggered to re-check exist --> */
      parent.find("button.btn-primary")
        .off("click.book")
        .on("click.book", options.action.book), parent);

  FN.event = parent => (_event(parent.find("div.existing-booking")), parent);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};