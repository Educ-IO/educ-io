Tags = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle editing of tags --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const ID = "tag";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */
  
  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  
  /* <!-- Reconcile Form UI with Tags / Badges --> */
  var _reconcile = (value, target) => target.empty().append($(factory.Display.template.get({
            template: "tags",
            tags: value.TAGS,
            badges: value.BADGES
          })));
  
  /* <!-- Remove Tags from within Dialog --> */
  var _handleRemove = (value, target) => target.find("span.badge a").on("click.remove", e => {
        e.preventDefault();
        var _target = $(e.currentTarget),
          _tag = _target.parents("span.badge").data("tag");
        if (_tag) {
          value.TAGS = (value.BADGES = _.filter(
            value.BADGES, badge => badge != _tag
          )).sort().join(";");
          _handleRemove(value, _reconcile(value, _target.parents("form")));
        }
      });
  
  var _edit = (title, instructions, value, content) => factory.Display.modal("tag", {
          target: factory.container,
          id: ID,
          title: title,
          instructions: factory.Display.doc.get(instructions, content, true),
          tags: value.TAGS,
          badges: value.BADGES,
          all: options.state.session.database.badges()
        }, dialog => {

          /* <!-- General Handlers --> */
          factory.Fields().on(dialog);

          /* <!-- Handle CTRL Enter to Save --> */
          factory.Dialog({}, factory).handlers.keyboard.enter(dialog);

          /* <!-- Handle Click to Remove --> */
          _handleRemove(value, dialog);

          /* <!-- Handle Click to Add --> */
          var _add = elements => elements.on("click.add", e => {
            e.preventDefault();
            var _input = $(e.currentTarget).parents("li").find("span[data-type='tag'], input[data-type='tag']"),
                _val = _input.val() || _input.text();
            (_input.is("input") ? _input : dialog.find("input[data-type='tag']")).val("").change().focus();
            
            if (_val) {
              _val = _val.replace(options.state.application.markers.split, options.state.application.markers.replace);
            
              if ((value.BADGES ? value.BADGES : value.BADGES = []).indexOf(_val) < 0) {
                value.BADGES.push(_val);
                value.TAGS = value.BADGES.sort().join(";");
                _handleRemove(value, _reconcile(value, dialog.find("form")));
              }  
            }
            
          });
          _add(dialog.find("li button"));

          /* <!-- Handle Refresh Suggestions --> */
          var _last, _handle = e => {
            var _suggestion = () => {
              var _val = $(e.currentTarget).val();
              if (_val != _last) {
                _last = _val;
                var _suggestions = options.state.session.database.badges(_val),
                    _list = dialog.find("ul.list-group");
                _list.children("li[data-suggestion]").remove();
                if (_suggestions.length > 0) {
                  var _new = $(factory.Display.template.get("suggestions")(_suggestions));
                  _list.append(_new);
                  _add(_new.find("button"));
                }
              }
            };
            _.debounce(_suggestion, 250)();
          };
      
          /* <!-- Handle Enter on textbox to Add --> */
          dialog.find("li input[data-type='tag']")
            .keydown(e => ((e.keyCode ? e.keyCode : e.which) == 13) ? 
                      e.preventDefault() || (e.shiftKey ? dialog.find(".modal-footer button.btn-primary") : $(e.currentTarget).siblings("button[data-action='add']")).click() :
                      _handle(e))
            .change(_handle)
            .focus();

        }).then(values => values ? value : null);
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    edit: _edit,
    
  };
  /* <!-- External Visibility --> */

};