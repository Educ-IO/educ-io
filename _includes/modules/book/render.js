Render = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    format: "Do MMM",
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _headers = () => _.map(["ID", "When", "What", "Who", "Actions"], v => ({
    name: v,
    hide: function(initial) {
      return !!(initial && this.hide_initially);
    },
    set_hide: function(now, always, initially) {
      this.hide_initially = initially;
    },
    hide_always: false,
    hide_now: false,
    hide_initially: v === "ID" ? true : false,
    field: v.toLowerCase(),
    icons: v === "When" ? ["access_time"] : null
  }));
  /* <!-- Internal Functions --> */
  
  /* <!-- Published Functions --> */
  FN.view = (template, id, title, instructions, selectable, simple) => data => factory.Display.template.show({
      template: template,
      id: id,
      title: title,
      subtitle: options.state.session.current.format(options.format),
      resources: data,
      selectable: selectable,
      simple: simple,
      instructions: instructions,
      clear: true,
      target: factory.container
    });
  
  FN.search = (template, selectable, simple, target) => value => options.functions.data.resources(value)
      .then(data => {
    
        /* <!-- Retain Collapsed / Show status between searches--> */
        var _target = target || factory.container.find("#resources"),
            _collapse = _.map(_target.find(".collapse"), element => $(element).data("group")),
            _show = _.map(_target.find(".show"), element => $(element).data("group"));
        _.each(data, resource => {
          if (resource.children) resource.expanded = _show.indexOf(resource.id) >= 0 ? 
            true : _collapse.indexOf(resource.id) >= 0 ? false : resource.expanded;
        });
        
        /* <!-- Display Search Results --> */
        return factory.Display.template.show({
          template: template,
          resources: data,
          selectable: selectable,
          simple: simple,
          clear: true,
          target: _target
        });
    
  });
  
  FN.availability = (periods, target) => factory.Display.template.show({
      template: "availability",
      periods: periods,
      clear: true,
      target: target || factory.container.find("#availability")
  });
  
  FN.group = (template, name, target) => (periods, max) => factory.Display.template.show({
      template: template,
      name: name,
      max: max,
      periods: periods,
      clear: true,
      target: target || factory.container.find("#details")
  });
  
  FN.events = (template, name, target) => (events, periods) => factory.Display.template.show({
      template: template,
      name: name,
      events: events,
      periods: periods,
      clear: true,
      target: target || factory.container.find("#details")
  });
  
  FN.table = (id, name, target) => data => factory.Datatable(factory, {
        id: id,
        name: name || id,
        data: data,
        headers: _headers(),
      }, {
        classes: ["table-hover"],
        filters: {},
        inverted_Filters: {},
        sorts: {},
        advanced: false,
        collapsed: true,
      }, (target || factory.container.find("#details")).empty()),

  FN.refresh = (id, updater) => () => {
      /* <!-- Update Date --> */
      factory.container.find(`#${id} .subtitle`)
        .text(options.state.session.current.format(options.format));

      /* <!-- Call Updater Function --> */
      return updater ? updater() : false;
  };
  /* <!-- Published Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};