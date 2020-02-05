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
  FN.view = (template, id, title, subtitle, instructions, extras, target) => factory.Display.template.show(_.extend({
      template: template,
      id: id,
      title: title,
      subtitle: subtitle && subtitle.format ? subtitle.format(options.format) : subtitle,
      instructions: instructions,
      clear: true,
      target: target || factory.container
    }, extras));
  
  FN.search = {
    
    collapse: (target, id, name, list) => {
      
      /* <!-- Retain Collapsed / Show status between searches--> */
      var _target = target || factory.container.find(`#${id}`),
          _collapse = _.map(_target.find(".collapse"), element => $(element).data(name)),
          _show = _.map(_target.find(".show"), element => $(element).data(name));

      var _recurse = (list, parent) => _.each(list, (item, index) => {
        if (item.children) {
          var _id = item.id || `${parent}_${index}`;
          item.expanded = _show.indexOf(_id) >= 0 ? 
            true : _collapse.indexOf(_id) >= 0 ? false : item.expanded;
          if (item.expanded) _recurse(item.children, _id);
        }
      });

      _recurse(list);
      
      return _target;
    },
    
    resources: (value, template, selectable, simple, all, target) => options.functions.source.resources(value)
      .then(resources => factory.Display.template.show({
          template: template,
          resources: resources,
          selectable: selectable,
          simple: simple,
          all: all,
          clear: true,
          target: FN.search.collapse(target, "resources", "group", resources)
        })),
    
    bundles: (value, all, template, actionable, simple, target) => options.functions.source.bundles(value, all)
      .then(bundles => factory.Display.template.show({
          template: template,
          instructions: true,
          bundles: bundles,
          opaque: false,
          actionable: actionable,
          simple: simple,
          clear: true,
          target: FN.search.collapse(target, "bundles", "group", bundles)
        })),
    
  };
  
  FN.availability = (periods, target) => factory.Display.template.show({
      template: "availability",
      periods: periods,
      clear: true,
      target: target || factory.container.find("#availability")
  });
  
  FN.group = (template, name, value, target) => (periods, max) => factory.Display.template.show({
      template: template,
      name: name,
      max: max,
      periods: periods,
      value: value === null || value === undefined ? null : value,
      extend: true,
      clear: true,
      target: target || factory.container.find("#details")
  });
  
  FN.events = (template, name, target) => (events, periods, text) => factory.Display.template.show({
      template: template,
      name: name,
      events: events,
      periods: periods,
      text: text,
      extend: true,
      clear: true,
      target: target || factory.container.find("#details")
  });
  
  FN.table = (id, name, target) => data => factory.Datatable(factory, {
        id: id,
        name: name || id,
        data: data,
        headers: _headers(),
      }, {
        classes: ["table-hover", "table-responsive-md"],
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