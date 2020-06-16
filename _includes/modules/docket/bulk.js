Bulk = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle archiving of items --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */
  
  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.tags = {
    
    add: items => !items || items.length === 0 ? 
      Promise.resolve(null) : 
      options.functions.tags.edit("Add Tags", "BULK_TAG_ADD_INSTRUCTIONS", 
        {
          TAGS : "",
          BADGES : []
        }, items.length)
        .then(value => !value || value.BADGES.length === 0 ? 
          null : Promise.resolve(_.reduce(items, (memo, item) => {
            var _added = false;
            _.each(value.BADGES, badge => {
              if (badge && (item.BADGES ? item.BADGES : item.BADGES = []).indexOf(badge) < 0) {
                item.BADGES.push(badge);
                _added = true;
              }
            });
            if (_added) {
              item.TAGS = item.BADGES.sort().join(";");
              memo.push(item);
            }
            return memo;
          }, []))
            .then(options.state.session.database.items.update)
            .catch(e => options.state.application.errors.update(e))
            .then(factory.Main.busy("Adding Tags")))
        .catch(e => (e ? factory.Flags.error("Bulk Add Tags Error", e) : factory.Flags.log("Bulk Add Tags Cancelled"))
                      .negative()),
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    tags : FN.tags,
    
  };
  /* <!-- External Visibility --> */

};