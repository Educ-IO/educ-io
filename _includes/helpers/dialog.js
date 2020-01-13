Dialog = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides methods to  --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @factory.Fields: Function to create a fields helper object --> */
  /* <!-- @factory.Google: Function to access the Google helper object --> */
  /* <!-- @factory.Display: Function to access the Display module object --> */
  /* <!-- REQUIRES: Global Scope: jQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Fields, Google, Display --> */

  /* <!-- Internal Visibility --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {};
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _makeIds = value => _.map(value.split(","), id => `#${id}`).join(", ");

  var _extractDataValueOrText = element => element.data("value") ? element.data("value") : element.text();

  var _populate = {

    shortcuts: (target, dialog, options, pairs) => {
      var _populate = target.data("populate"),
        _shortcuts = _.reduce(options.shortcuts, (all, shortcut) => _.extendOwn(all, shortcut), {}),
        _shortcut = _shortcuts[_populate];
      if (_shortcut) _.each(pairs, pair => {
        if (_shortcut[pair[0]] !== undefined) {
          var _target = dialog.find(pair[1]);
          if (_target.length == 1 && !_target.hasClass("locked")) {
            if (_target.data("click")) {
              $(_.find(dialog.find(_target.data("click") + `[data-target='${_target[0].id}']`).toArray(),
                element => _extractDataValueOrText($(element)) == _shortcut[pair[0]])).click();
            } else {
              if (_shortcut[pair[0]]) {
                dialog.find(pair[1]).val(_.isArray(_shortcut[pair[0]]) ? _shortcut[pair[0]].join("\n") : _shortcut[pair[0]]).prop("disabled", false);
              } else {
                dialog.find(pair[1]).val("").prop("disabled", (_shortcut[pair[0]] === ""));
              }
            }
          }
        }
      });
      return _shortcut;
    },

  };

  var _handlers = {

    picker: dialog => {

      /* <!-- Wire Up Fields and Handle Populate URL Fields from Google Drive --> */
      factory.Fields().on(dialog).find("button[data-action='load-g-folder'], a[data-action='load-g-folder']").off("click.folder").on("click.folder", e => {
        new Promise((resolve, reject) => {
          factory.Google.pick( /* <!-- Open Google Document from Google Drive Picker --> */
            "Select a Folder", false, true,
            () => [
              new google.picker.DocsView(google.picker.ViewId.FOLDERS)
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true)
              .setParent("root")
              .setMimeTypes("application/vnd.google-apps.folder"),
              new google.picker.DocsView(google.picker.ViewId.DOCS)
              .setIncludeFolders(true)
              .setEnableTeamDrives(true)
              .setMimeTypes("application/vnd.google-apps.folder")
            ],
            folder => folder && factory.Google.folders.is(folder.mimeType) ? factory.Flags.log("Google Drive Folder Picked", folder) && resolve(folder) : reject()
          );
        }).then(folder => $(`#${$(e.target).data("targets")}`).val(folder.id).attr("title", folder.name)).catch();
      });

    },

    lock: (target, dialog) => {
      var _el = dialog.find(_makeIds(target.data("lock"))).toggleClass("locked");
      target.find("i.material-icons").text(_el.hasClass("locked") ? "lock" : "lock_open");
    },

    clear: (target, dialog) => dialog.find(_makeIds(target.data("clear"))).val("").filter("textarea.resizable").map((i, el) => autosize.update(el)),

    options: (target, dialog) => {
      var value = _extractDataValueOrText(target),
        destination = dialog.find(_makeIds(target.data("targets"))),
        current = destination.val();
      if (value != current) {
        var _siblings = target.siblings("[data-action='options']").toArray(),
          _selected = _.find(_siblings, sibling => _extractDataValueOrText($(sibling)) == current),
          _classes = _selected.className;
        _selected.className = target[0].className;
        target[0].className = _classes;
        destination.val(value);
      }

    },
    
    selected: dialog => {
      
      _.each(dialog.find("select"), el => {
        
        var _el = $(el), _disables = _el.find("option[data-disables]");
        
        if (_disables.length) {
          
          var _all = [], _selected = {};
          _.each(_disables, option => {
            var _option = $(option),
                _disable = _option.data("disables");
            if (_all.indexOf(_disable) < 0) _all.push(_disable);
            _selected[_option.val()] = _disable;
          });
          
          _el.off("change.disables").on("change.disables", e => {
            _.each(_all, val => dialog.find(val).prop("disabled", false).removeClass("disabled"));
            dialog.find(_selected[e.target.value]).prop("disabled", true).addClass("disabled");
          });
          
        }
      
      });
      
    },

    extract: regexes => (target, dialog) => {

      var _value = target.val();

      _.each(dialog.find(`input[data-source='${target.prop("id")}'], textarea[data-source='${target.prop("id")}']`), el => {
        
        var _el = $(el);
        
        if (_el.data("extract")) {
          
          var _found, _match = _.find(_el.data("extract").split("|"), regex => {
            var _matcher = regex => regex ? (_value ? _value : "").match(regex) : null,
                _match = _matcher(regexes[regex]);
            return _match && _match.length >= 1 ? _found = _match[0] : false;
          });
          _el.val(_match ? _found : "");
          
        }
        
      });

    },

    keyboard: {

      enter: dialog => {

        /* <!-- Ctrl-Enter Pressed --> */
        dialog.keypress(e => ((e.keyCode ? e.keyCode : e.which) == 13 && e.shiftKey) ? e.preventDefault() || dialog.find(".modal-footer button.btn-primary").click() : null);

      },

    },

    replace: (target, dialog) => {
      var _regex = target.data("regex"),
        _replace = target.data("replace"),
        _target = target.data("targets");
      if (_regex && _replace && _target) {
        _regex = dialog.find(`#${_regex}`).val();
        _replace = dialog.find(`#${_replace}`).val();
        if (_regex) {
          _regex = new RegExp(_regex, "gim");
          _target = dialog.find(`#${_target}`);
          var _value = _target.val();
          _target.val(_value.replace(_regex, _replace));
        }
      }
    },
    
    list: (dialog, match) => {
      
      /* <!-- Handle Click to Remove --> */
      var _handler = target => target.find("a[data-action='remove']")
      .on("click.remove", e => {
        e.preventDefault();
        $(e.currentTarget).parent().remove();
      });
      _handler(dialog.find("form"));

      /* <!-- Handle Click to Add --> */
      dialog.find("button[data-action='add']").on("click.add", e => {
        e.preventDefault();
        var _$ = $(e.currentTarget),
            _input = dialog.find(`#${_$.data("target")}`),
            _value = _input.val() || _input.text();
        
        if (_value && (!match || (_value = _value.match(match)))) {
          if (_input.is("input")) _input.val("") && _input.focus();
          var _output = dialog.find(`#${_input.data("target")}`),
              _template = _input.data("template");
          _handler(factory.Display.template.show({
            template: _template,
            value: _.isArray(_value) ? _value[0] : _value,
            target: _output,
          }));
        }
      });

      /* <!-- Handle Enter on textbox to Add --> */
      dialog.find("input[data-action='add']")
        .keypress(e => ((e.keyCode ? e.keyCode : e.which) == 13) ? 
                    e.preventDefault() || $(e.currentTarget).siblings("button[data-action='add']").click() : null).focus();
      
    }

  };
  /* <!-- Internal Functions --> */

  /* <!-- Internal Visibility --> */

  /* <!-- External Visibility --> */
  return {

    populate: _populate,

    handlers: _handlers,

  };
  /* <!-- External Visibility --> */

};