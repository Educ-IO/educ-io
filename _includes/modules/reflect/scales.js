Scales = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  var _reducer = (memo, value, key) => {
                    if (key !== "Value" && value && value.Value === true) {
                      memo.push(_.keys(value).length == 1 ? key :
                        _.map(_.reduce(value, _reducer, []), (value, i) => i === 0 ? `${key} - ${value}` : value).join("; "));
                    }
                    return memo;
                  };
  
  var _display = (element, field) => values => {
    element.data("selected", _.isEmpty(values) ? null : values);
    element.children("span.d-inline").remove();
    if (_.isEmpty(values)) {
      element.children("i.material-icons").removeClass("d-none");
    } else {
      element.find("i.material-icons").addClass("d-none");
      _.each(values[field].Values ? _.reduce(values[field].Values, _reducer, []): [], 
              detail => element.append(factory.Display.template.get({
                template: "tag",
                detail: detail
              })));
    }
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.modal = (scale, title, field, instructions, action, selected, success) => factory.Display.modal("scale", {
            id: "dialog_Scale",
            markers: options.state.application.forms.process(scale.scale),
            title: title,
            field: field,
            instructions: instructions,
            action: action,
            wide: true
          }, dialog => {
            if (!selected) return;
            var _form = options.state.application.fields.on(dialog.find("form"));
            factory.Data({}, factory).rehydrate(_form, selected || {});
          }).then(values => values && success ? success(values) : false); /* <!-- Action Button Clicked (e.g. not dismissed) --> */
  
  FN.hookup = form => {
      
    form.find("button[data-expand='scale'],a[data-expand='scale']")
      .off("click.expand").on("click.expand", e => {

        var _this = $(e.currentTarget),
            _name = _this.data("targets"),
            _field = _this.data("field"),
            _action = _this.data("action"),
            _title = _this.data("value"),
            _instructions = _this.data("details"),
            _selected = _this.data("selected"),
            _scale = options.state.application.forms.scale(_name);

        return _scale ? FN.modal(_scale, _title, _field, _instructions, _action, _selected, _display(_this)) : false;

      });
      
  };
  /* <!-- Public Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    hookup : FN.hookup,
    
    
  };
  /* <!-- External Visibility --> */
  
};