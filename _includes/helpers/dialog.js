Dialog = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides methods to  --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @factory.Fields: Function to create a fields helper object --> */
  /* <!-- @factory.Google: Function to access the Google helper object --> */
  /* <!-- REQUIRES: Global Scope: jQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Fields, Google --> */

  /* === Internal Visibility === */

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

    extract: regexes => (target, dialog) => {

      var _value = target.val();

      _.each(dialog.find(`input[data-source='${target.prop("id")}'], textarea[data-source='${target.prop("id")}']`), el => {
        var _el = $(el);
        if (_el.data("extract") && regexes[_el.data("extract")]) {
          var _match = (_value ? _value : "").match(regexes[_el.data("extract")]);
          _el.val(_match && _match.length >= 1 ? _match[0] : "");
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

  };
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    populate: _populate,

    handlers: _handlers,

  };
  /* === External Visibility === */

};