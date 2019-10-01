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
    
    open : id => database.open(id, options.schema.sheets.sheet_name).then(value => (db = value)),
    
  };
  
  FN.execute = {
    
    query: query => _.tap(db.find(query), results => factory.Flags.log(`Result Values for : ${JSON.stringify(query)}`, results)),
    
  };
  
  /* <!-- Internal Archive Functions | TODO: Move partially to structured archive function in SaaD + test --> */
  FN.legacy = {
    
    archive : year => factory.Google.sheets.filtered(database.state.data.spreadsheet, factory.Google_Sheets_Metadata({},
      factory).filter().parse(options.schema.sheets.sheet_archive).value(year).make())
      .then(value => value && value.sheets && value.sheets.length == 1 && 
            _.find(value.sheets[0].developerMetadata, m => m.metadataKey == options.schema.sheets.sheet_archive.key && m.metadataValue == year) ?
        value.sheets[0].properties :
        factory.Google.sheets.batch(database.state.data.spreadsheet, [{
          "addSheet": {
            "properties": {
              "sheetId": year,
              "title": year,
              "tabColor": {
                "red": 0.0,
                "green": 1.0,
                "blue": 0.0
              }
            }
          }
        }, {
          "createDeveloperMetadata": factory.Google_Sheets_Metadata({}, factory).sheet(year).tag({
            key: options.schema.sheets.sheet_archive.key,
            value: year
          })
        }]).then(response => response && response.replies && response.replies.length == 2 ? response.replies[0].addSheet.properties : false))
      .then(value => value ? database.temp.populateDataSheet(database.state.data.spreadsheet, value.sheetId, value.title, [0.4, 0.4, 0.4]) : value)
      .then(value => {
        if (!value) return value;
        var _sheet = _.find(value.sheets, sheet => _.find(sheet.developerMetadata, m => m.metadataKey == options.schema.sheets.sheet_archive.key && m.metadataValue == year)),
          _items = db.where(item => item[options.schema.columns.from.value].year() == year),
          _values = _.map(_items, item => database.temp.convertToArray(item));

        var _notation = factory.Google_Sheets_Notation(),
          _range = `${_notation.convertR1C1(`R1C${database.state.data.columns.start}`)}:${_notation.convertR1C1(`C${database.state.data.columns.end}`, true)}`;

        factory.Flags.log(`Appending Values [NEW] for Range: ${_range}`, _values);

        return factory.Google.sheets.append(database.state.data.spreadsheet, 
                                            `'${_sheet.properties.title}'!${_range}`, _values).then(result => result && result.updates ? _items : false);
      }),

  };
  
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    id: database.id,
    
    db: db,
    
    open: FN.main.open,
    
    execute: FN.execute.query,
    
    search: (text, from) => FN.execute.query(options.query.text(text, from)),
    
    badges: prefix => _.chain(db.chain().data()).pluck(options.schema.columns.badges.value).flatten().compact()
      .filter(badge => prefix ? badge.toUpperCase().indexOf(prefix.toUpperCase()) >= 0 : true)
      .reduce((totals, badge) => {
        totals[badge] = totals[badge] ? totals[badge] + 1 : 1;
        return totals;
      }, {}).pairs().sortBy(1).reverse().first(4).value(),
    
    tagged: (tag, all) => FN.execute.query(all ? options.query.all_tagged(tag) : options.query.tagged(tag)),
    
    query: (date, current) => FN.execute.query(current ? 
                                {"$or": [options.query.current(date), options.query.completed(date)]} :
                                options.query.dated(date)),
    
    years: () => {

      var _all = db.chain().data();
      var _results = _.reduce(_all, (tally, item) => {
        var _year;
        if (item[options.schema.columns.from.value]) _year = item[options.schema.columns.from.value].year();
        _year = _year ? _year : "N/A";
        if (!tally[_year]) tally[_year] = {
          incomplete: 0,
          complete: 0
        };
        tally[_year][item[options.schema.columns.is_complete] || (item[options.schema.columns.is_timed] && !item[options.schema.columns.from.value].isAfter()) ?
                     "complete" : "incomplete"] += 1;
        return tally;
      }, {});
      factory.Flags.log("Result Values for years", _results);
      return _results;
    },
    
    archive: FN.legacy.archive,
    
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
    
  };
  /* <!-- External Visibility --> */

};  