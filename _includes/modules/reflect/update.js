Update = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id : "changes"
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.form = form => new Hashes.MD5().hex(options.state.application.strings.stringify(form, options.functions.replacers.editing));

  FN.report = report => new Hashes.MD5().hex(options.state.application.strings.stringify(report, options.functions.replacers.signing));

  FN.integrate = (original, updated) => {

    var _original = JSON.parse(options.state.application.strings.stringify(original, options.functions.replacers.signing)),
      _updated = JSON.parse(options.state.application.strings.stringify(updated, options.functions.replacers.signing));

    if (factory.Flags.debug()) factory.Flags.log("Report Form is Dirty:", {
      "ORIGINAL": _original,
      "CACHED": _updated
    });

    /* <!-- Return Failure if forms cannot be 'diffed --> */
    if (!window.DeepDiff) return Promise.resolve(false);

    var _diff = DeepDiff.diff(_original, _updated);
    factory.Flags.log("Form Diff:", _diff);

    /* <!-- PATH: Property path that has changed --> */
    /* <!-- KIND: N - newly added | D - deleted | E - edited | A -  array change --> */
    /* <!-- LHS: Value on the left-hand-side of the comparison (undefined if kind === 'N') --> */
    /* <!-- RHS: Value on the right-hand-side of the comparison (undefined if kind === 'D') --> */
    var _check = diff => diff.path &&
      (
        diff.path[diff.path.length - 1].indexOf("title") >= 0 && (diff._name = "Title") ||
        diff.path[diff.path.length - 1].indexOf("name") >= 0 && (diff._name = "Name") ||
        diff.path[diff.path.length - 1].indexOf("help") >= 0 && (diff._name = "Help")
      ),
        _ignore = diff => diff.kind == "D" || (diff.path && diff.path[diff.path.length - 1] == "field"),
        _accept = diff => !_check(diff) && !_ignore(diff) && (diff.kind == "N" || diff.kind == "E" || diff.kind == "A");

    var _changes = _.filter(_diff, _check),
        _acceptances = _.filter(_diff, _accept),
        _ignoring = _.filter(_diff, _ignore);

    if (factory.Flags.debug()) factory.Flags.log("Upgrading Form:", {
      "Verifying with User" : _changes,
      "Accepting" : _acceptances,
      "Ignoring" : _ignoring
    });

    /* <!-- TODO: __extends, $fields, __order, __type & __meta ignored by signing, so warn user about other changes if a signature is present? --> */
    
    /* <!-- Verify that user consents to field title changes --> */
    var _confirm = values => {
      _.each(values, (value, key) => {
        var _match = /changes_(\d+)/i.exec(key);
        if (_match && value.Value === true) {
          var _index = parseInt(_match[1], 10);
          if (!isNaN(_index)) DeepDiff.applyChange(original, updated, _changes[_index]);
        }
      });
      return original;
    };

    /* <!-- Accept all of these changes --> */
    _.each(_acceptances, diff => DeepDiff.applyChange(original, updated, diff));

    /* <!-- Return updated object or modal changes dialog --> */
    return _changes && _changes.length > 0 ?
      factory.Display.modal("changes", {
          id: `dialog_${options.id}`,
          instructions: factory.Display.doc.get("REVIEW_FORM_CHANGES"),
          title: "Approve Form Changes",
          changes: _.map(_changes, change => {
            if (change.path) {
              change._type = change.path.indexOf("groups") >= 0 ?
                change.path.indexOf("fields") ? "Field" : "Group" : "Form";
              if (change._type == "Group" || change._type == "Field" && change.path.length >= 2)
                change._details = change.path[change.path.length - 2];
              if (change.path[change.path.length - 1] && change.path[change.path.length - 1].match(/__(\S+)__/)) {
                /* <!-- Markdown field --> */
                if (change.lhs) change.lhs_display = options.state.application.showdown.makeHtml(change.lhs);
                if (change.rhs) change.rhs_display = options.state.application.showdown.makeHtml(change.rhs);
              }
            }
            return change;
          })
        }, dialog => options.state.application.fields.on(dialog.find("form")))
        .then(values => values && values.Changes && values.Changes.Values ? _confirm(values.Changes.Values) : original) :
      Promise.resolve(original);

  };
  /* <!-- Internal Functions --> */

  /* <!-- Public Functions --> */
  FN.hash = data => options.state.session.hashes = {
    form: FN.form(data.form),
    report: FN.report(data.report)
  };

  FN.dirty = {

    form: form => !options.state.session.hashes || options.state.session.hashes.form !== FN.form(form),

    report: report => !options.state.session.hashes || options.state.session.hashes.report !== FN.report(report),

  };

  FN.changes = (form, editable) => {
    
    /* <!-- RETURNS: A promise resolving to FALSE (can't check for changes), TRUE (no changes) or the updated FORM object --> */
    if (!form || !form.$name || !editable) return Promise.resolve(false);

    var _cached = options.state.application.forms.template(form.$name);
    return FN.dirty.form(_cached) ?
      FN.integrate(form, _cached) : Promise.resolve(true);

  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    changes: FN.changes,

    dirty: FN.dirty,

    hash: FN.hash,

  };
  /* <!-- External Visibility --> */

};