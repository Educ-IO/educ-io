Update = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
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
      "ORIGINAL" : _original,
      "CACHED" : _updated
    });

    if (window.DeepDiff) {
      
      var _diff = DeepDiff(_original, _updated);
      factory.Flags.log("Completed Form Diff:", _diff);
      
      /* <!-- PATH: Property path that has changed --> */
      /* <!-- KIND: N - newly added | D - deleted | E - edited | A -  array change --> */
      /* <!-- LHS: Value on the left-hand-side of the comparison (undefined if kind === 'N') --> */
      /* <!-- RHS: Value on the right-hand-side of the comparison (undefined if kind === 'D') --> */
      var _changes = _.filter(_diff, diff => diff.path && 
        (diff.path[diff.path.length - 1] == "title" || diff.path[diff.path.length - 1] == "title"));
      
      if (_changes && _changes.length > 0) {
        
        factory.Flags.log("Significant Form Changes:", _changes);
        
      } else {
        
        factory.Flags.log("No Significant Form Changes:");
        
      }
      
    }

    return Promise.resolve(updated);
    
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.hash = data => options.state.session.hashes = {
            form : FN.form(data.form),
            report : FN.report(data.report)
          };
  
  FN.dirty = {
    
    form : form => !options.state.session.hashes || options.state.session.hashes.form !== FN.form(form),
    
    report : report => !options.state.session.hashes || options.state.session.hashes.report !== FN.report(report),
    
  };
  
  FN.changes = (form, editable) => {
    
    if (!form || !form.$name || !editable) return Promise.resolve(false);
    
    var _cached = options.state.application.forms.template(form.$name);
    return  FN.dirty.form(_cached) ?
      FN.integrate(form, _cached) : Promise.resolve(true);

  };
  /* <!-- Public Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    changes : FN.changes,
    
    dirty : FN.dirty,
    
    hash : FN.hash,
    
  };
  /* <!-- External Visibility --> */
  
};