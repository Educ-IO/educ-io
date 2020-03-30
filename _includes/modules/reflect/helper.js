Helper = (options, factory) => {
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

  /* <!-- Public Functions --> */
  FN.span = dates => {
    var _today = factory.Dates.now(),
      _past = _today.clone();
      _past = dates.span == "AY" ?
        _past.month() > 8 ?
        _past.month(8).startOf("month") :
        _past.subtract(1, "year").month(8).startOf("month") :
        _past.subtract(1, dates.span);
    
    dates.from = _past.startOf("day");
    dates.to = _today.endOf("day");
    return dates;
  };
  
  FN.headers = fields => _.map(fields, f => f.title ? {
      name: f.title,
      display: f.id
    } : f.id);
  /* <!-- Public Functions --> */
  
  /* <!-- File Functions --> */
  FN.file = file => ({
    
    complete : () => file.appProperties.COMPLETE,
    
    owner : {
      
      display : () => file.ownedByMe ? "Me" : file.owners && file.owners.length > 0 ?
      `${file.owners[0].displayName}${file.owners[0].emailAddress ? ` (${file.owners[0].emailAddress})` : ""}` : "",
    
      email : all => file.owners && file.owners.length > 0 ? all ? _.pluck(file.owners, "emailAddress") : file.owners[0].emailAddress : all ? [] : "",
      
    },
    
    url : () => `${factory.Flags.full()}${factory.Flags.dir()}/#google,load.${file.id}`
    
  });
  /* <!-- File Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};