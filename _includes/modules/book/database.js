Database = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Google --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
  
  /* <!-- Database Variables --> */
  var database = factory.SaaD(options.schema, factory), /* <!-- Sheets as a Database Interface --> */
      db; /* <!-- Loki Database holding Item Data --> */
  /* <!-- Database Variables --> */

  /* <!-- Internal Functions --> */
  FN.main = {
    
    open : (id, version) => database.open(id, options.schema.sheets.sheet_name, null, null, version).then(value => (db = value)),
    
  };
  
  FN.execute = {
    
    one: query => _.tap(db.findOne(query), result => factory.Flags.log(`Result Value for : ${JSON.stringify(query)}`, result)),
    
    query: query => _.tap(db.find(query), results => factory.Flags.log(`Result Values for : ${JSON.stringify(query)}`, results)),
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    id: database.id,
    
    db: db,
    
    open: FN.main.open,
    
    execute: FN.execute.query,
    
    create: database.create,
    
    hash: database.hash,
    
    mismatch: database.mismatch,
    
    version: () => database.state.data.version,
    
    items: {
    
      insert: database.insert,

      update: database.update,

      delete: database.delete,
      
      process: database.process,
      
    },
    
    loan: (event, resource) => FN.execute.one(options.query.loan(event, resource)),
    
    loans: event => FN.execute.query(options.query.event(event)),
    
  };
  /* <!-- External Visibility --> */

};  