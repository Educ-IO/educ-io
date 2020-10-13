Common = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
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
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.value = (values, name) => _.property("value")(_.find(values, value => value.name == name ? value : null));
  
  FN.option = (id, name, selected) => _.tap({
    id: id,
    name: name
  }, value => selected ? value.selected = true : false);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};