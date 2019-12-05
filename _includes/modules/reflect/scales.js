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
  FN.hookup = form => {
      
    form.find("button[data-expand='scale'],a[data-expand='scale']")
      .off("click.expand").on("click.expand", e => {

        var _this = $(e.currentTarget),
            _name = _this.data("targets"),
            _field = _this.data("field"),
            _action = _this.data("action"),
            _title = _this.data("value"),
            _instructions = _this.data("details"),
            _scale = options.state.application.forms.scale(_name);

        if (_scale) return factory.Display.modal("scale", {
            id: "dialog_Scale",
            markers: options.state.application.forms.process(_scale.scale),
            title: _title,
            field: _field,
            instructions: _instructions,
            action: _action,
            wide: true
          }, dialog => {
            var _form = options.state.application.fields.on(dialog.find("form")),
                _selected = _this.data("selected");
            factory.Data({}, factory).rehydrate(_form, _selected || {});
          }).then(values => {

            /* <-- Action Button Clicked (e.g. not dismissed) --> */
            if (values) {
              _this.data("selected", _.isEmpty(values) ? null : values);
              _this.children("span.d-inline").remove();
              if (_.isEmpty(values)) {
                _this.children("i.material-icons").removeClass("d-none");
              } else {
                _this.find("i.material-icons").addClass("d-none");
                var _reducer = (memo, value, key) => {
                    if (key !== "Value" && value && value.Value === true) {
                      memo.push(_.keys(value).length == 1 ? key :
                        _.map(_.reduce(value, _reducer, []), (value, i) => i === 0 ? `${key} - ${value}` : value).join("; "));
                    }
                    return memo;
                  };
                var _details = values.Standards.Values ? _.reduce(values.Standards.Values, _reducer, []): [];
                _.each(_details, detail => _this.append(factory.Display.template.get({
                    template: "tag",
                    detail: detail
                  })));
              }
            }
          });

      });
      
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    hookup : FN.hookup,
    
    
  };
  /* <!-- External Visibility --> */
  
};