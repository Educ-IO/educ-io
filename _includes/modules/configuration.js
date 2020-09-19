Configuration = (options, factory) => {
	"use strict";
	
	/* <!-- Internal Constants --> */
	const DEFAULTS = {
    preferences: {
      id : "edit_Preferences",
      template : "config",
      title : "Preferences",
    },
  };
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _edit = (settings, fields) => factory.Display.modal(options.preferences.template, {
      id: options.preferences.id,
      title: options.preferences.title,
      enter: true,
      state: _.mapObject(
                settings, 
                (value, key) => fields && fields.complex && fields.complex.indexOf(key) >= 0 ?
                         value === false ? 0 : value : value),
    });

  var _field = field => $(`#${options.preferences.id} div[data-output-field='${field}']`);

  var _label = field => field.find("small.form-text").toggleClass("d-none", field.find("li").length === 0);

  var _remove = (field, id) => _label(_field(field).find(`li[data-id='${id}']`).remove());
  
  var _add = (field, template, items) => {
    var _list = (field = _field(field)).children("ul");
    _.each(items, item => {
      if (_list.find(`li[data-id='${item.id}']`).length === 0)
        $(factory.Display.template.get((_.extend({
          template: template
        }, item)))).appendTo(_list);
    });
    _label(field);
  };
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

		/* <!-- External Functions --> */
		add: _add,
    
    remove: _remove,
    
    edit: _edit,
    /* <!-- External Functions --> */
    
	};
	/* <!-- External Visibility --> */
};