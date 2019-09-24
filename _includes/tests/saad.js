SaaD = function() {
  "use strict";

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    RACE = FACTORY.App.race(360000),
    PAUSE = () => DELAY(RANDOM(20000, 30000)),
    GEN = FACTORY.App.generate;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var expect, schema;
  /* <!-- Internal Variables --> */

  /* <!-- Generate Functions --> */
  var _generate = {

    value: meta => meta && meta.type == "markdown" ?
      GEN.t(GEN.i(10, 40)) : GEN.an(GEN.i(10, 20)),

    items: (schema, number) => _.map(
      _.range(number ? number : GEN.i(5, 20)),
      () => _.reduce(schema.columns, (memo, column) => {
        memo[column.value] = _generate.value(column._meta);
        return memo;
      }, {})),

    changes: (items, number) => {
      var change = () => {
        var item = GEN.o(items),
          key = GEN.o(_.reject(_.keys(item),
            key => key.indexOf("__") === 0 || key == "meta" || key == "$loki"));
        var value = GEN.an(GEN.i(5, 20));
        FACTORY.Flags.log(`CHANGING ${key} FROM: ${item[key]} || TO: ${value}`, item);
        item[key] = value;
      };
      number = number ? number : GEN.i(1, 20);
      FACTORY.Flags.log(`MAKING ${number} CHANGES TO ITEMS`, items);
      _.each(_.range(number), change);
      return items;
    },

    deletions: (items, number) => _.sample(items, number || GEN.i(1, items.length - 1)),

    schema: () => ({
      db: {
        name: "SaaD Test",
        file: "saad_test.db",
      },
      names: {
        spreadsheet: "EDUC.IO | Debug SaaD [TEST]",
        sheet: "Test",
      },
      schema: {
        version: 1,
        colour: [0.6, 0.6, 0.6],
      },
      metadata: {
        DEBUG: "TEST",
      },
      sheets: {
        sheet_name: {
          key: "SHEET_NAME",
          value: GEN.a(GEN.i(10, 15)).toUpperCase(),
        },
      },
      columns: ((number, groups) => _.reduce(_.range(number), (memo, index) => {
        var _name = GEN.a(GEN.i(10, 15)),
          _value = {
            key: "COLUMN_NAME",
            value: _name.toUpperCase(),
            _meta: {
              group: groups.length == 1 || GEN.b(30) ? groups[0] : groups.shift(),
              colour: GEN.cn(200, 255),
              title: _name,
              width: GEN.i(120, 200),
              index: GEN.b(70),
              hash: index === 0 || GEN.b(30),
              type: GEN.b(10) ? "markdown" : null,
            }
          };
        memo[`column_${_name.toLowerCase()}`] = _value;
        return memo;
      }, {}))(GEN.i(5, 15), _.map(_.range(GEN.i(2, 5)), () => GEN.a(GEN.i(10, 15)))),
    }),

  };
  /* <!-- Generate Functions --> */

  /* <!-- Check Functions --> */
  var _check = {

    inserted: (db, items) => db.open(db.state.data.spreadsheet, schema.sheets.sheet_name)
      .then(database => FACTORY.Google.sheets.values(
          db.state.data.spreadsheet, `${db.state.data.title}!${db.state.data.range}`)
        .then(values => {

          /* <!-- Test Spreadsheet Values --> */
          var _test = expect(values).to.be.an("object").and.to.have.property("values");
          _test.to.be.an("array").to.have.lengthOf(items.length);
          _test.to.have.deep.ordered.members(
            _.map(items, item => _.map(schema.columns,
              column => item[column.value] === undefined ?
              "" : item[column.value])));

          return true;
        
        })
        .then(() => {

          /* <!-- Test Database Values --> */
          expect(database.data).to.be.an("array").to.have.lengthOf(items.length);
          _.each(items, (item, index) => expect(database.data[index])
            .to.deep.include(_.omit(item, ["meta", "$loki", "__HASH"])));
        
          return true;

        })
      ),

    removed: (db, items) => db.open(db.state.data.spreadsheet, schema.sheets.sheet_name)
      .then(database => {
        /* <!-- Test Database Values --> */
        _.each(items, item => _.each(database.data, existing => expect(existing)
          .not.to.deep.include(_.omit(item, ["__HASH", "__ROW", "__ID"]))));
      }),

  };
  /* <!-- Check Functions --> */
  
  /* <!-- Sheet Functions --> */
  var _sheet = {
    
    insert: (db, database, ingest, hash) => {
      
     /* <!-- Check Database is Empty --> */
      expect(database.data)
        .to.have.lengthOf(0);

      /* <!-- Generate Test Data Items --> */
      var _items = _generate.items(schema),
        _values = _.map(_items, db.arrayise),
        _range = db.range(
          db.state.data.rows.end + 1,
          db.state.data.columns.start,
          db.state.data.rows.end + 1 + _items.length,
          db.state.data.columns.end);

      FACTORY.Flags.log(`INJECTING DATA (FOR ${_items.length} ITEMS) INTO: ${_range}`, _values);

      return FACTORY.Google.sheets.append(
          db.state.data.spreadsheet,
          `${db.state.data.title}!${_range}`, _values)

        .then(spreadsheet => {
        
          expect(spreadsheet).to.be.an("object")
            .and.to.have.nested.property("updates.updatedCells")
            .and.to.equal(_.reduce(_values, (count, item) => count += item.length, 0));
          expect(spreadsheet).to.have.nested.property("updates.updatedColumns")
            .and.to.equal(db.state.data.columns.end - db.state.data.columns.start + 1);

          /* <!-- Open Database with Ingest & Hash Parameters (Schema Default Ingest & Hash == FALSE) --> */
          return db.open(db.state.data.spreadsheet, schema.sheets.sheet_name, ingest, hash);
        
        }).then(database => {
        
          /* <!-- Check Database is No Longer Empty --> */
          expect(database.data)
             .to.have.lengthOf(_items.length);
        
          FACTORY.Flags.log(`OPENED DATABASE HAS ${database.data.length} ITEMS`, database.data);
        
          return {database: database, items: _items};
      });
        
    },
    
  };
  /* <!-- Sheet Functions --> */
  
  /* <!-- Start Function --> */
  var _start = (db, open, insert, count) => db.create()
    .then(sheet => _.tap(open ?
      PAUSE()
      .then(() => db.open(sheet.spreadsheetId, schema.sheets.sheet_name))
      .then(database => _.tap(database, database => FACTORY.Flags.log("DATABASE OPENED:", database))) :
      sheet, () => {
        FACTORY.Flags.log("SHEET CREATED:", sheet);
        FACTORY.Flags.log("SAAD INITIALISED:", db);
      }))
    .then(value => insert ? db.insert(_generate.items(schema, count ? count : null)) : value);
  /* <!-- Start Function --> */

  /* <!-- Internal Functions --> */
  var _success = (resolve, test, message) => () => resolve(
    FACTORY.Flags.log(message ? `${test}: ${message}` : `${test} Test SUCCEEDED`).positive());

  var _failure = (resolve, test, message) => e => resolve(
    FACTORY.Flags.error(message ? `${test}: ${message}` : `${test} Test FAILED`, e).negative());

  var _cleanup = db => () => {
    db.close();
    return db.state && db.state.data && db.state.data.spreadsheet && !FACTORY.Display.state().in("traces") ?
      PAUSE().then(() => FACTORY.Google.files.delete(db.state.data.spreadsheet)) : false;
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Test Functions --> */
  var _test = {
    
    update: (ingest, hash, changes, number) => db => RACE(new Promise(r => _start(db, true)
      .then(database => _sheet.insert(db, database, ingest, hash)
          .then(value => {
            var changed = _generate.changes(changes(value.database.data), _.isFunction(number) ? number(value.database.data) : number);
            return db.update(changed, true) /* <!-- Commit Changes to DB --> */
              .then(changes => {
                _.each(changes, (value, i) => expect(value).to.deep.include(changed[i]));
                /* <!-- Check that Changes have been successfully made --> */
                return _check.inserted(db, value.database.data);
              });
          }))
      .then(_success(r, "Single Update")).catch(_failure(r, "Single Update")).then(_cleanup(db))
    )),
    
  };/* <!-- Test Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      /* <!-- Set Up Testing Framework --> */
      chai.config.showDiff = true;
      expect = chai.expect;

      /* <!-- Generate Schema --> */
      schema = _generate.schema();

      FACTORY.Flags.log("START Called");

      /* <!-- Create DB Interface --> */
      return FACTORY.SaaD(schema, FACTORY);

    },

    fail: db => RACE(new Promise(r => _start(db, true, true, 1)
      .then(items => _check.inserted(db, items.concat(items).concat(_generate.items(schema, 1))))
      .then(_success(r, "Fail")).catch(_failure(r, "Fail")).then(_cleanup(db))
    )),
    
    create: db => RACE(new Promise(r => _start(db)
      .then(sheet => {

        /* <!-- Test State has the ID, Name etc of the Spreadsheet correctly set --> */
        expect(db.state).to.be.an("object");
        expect(db.state).to.have.nested.property("data.spreadsheet", sheet.spreadsheetId);
        expect(db.state).to.have.nested.property("data.sheet", 0);
        expect(db.state).to.have.nested.property("data.title", schema.names.sheet);

        /* <!-- Test Helpers --> */
        expect(db.state.helpers).to.be.an("object");
        expect(db.state.helpers.grid).to.be.an("object");
        expect(db.state.helpers.meta).to.be.an("object");
        expect(db.state.helpers.format).to.be.an("object");
        expect(db.state.helpers.properties).to.be.an("object");
        expect(db.state.helpers.notation).to.be.an("object");

        expect(sheet)
          .to.be.an("object")
          .and.to.have.property("properties");

        /* <!-- Check Spreadsheet Title --> */
        expect(sheet.properties.title)
          .to.equal(schema.names.spreadsheet);

        /* <!-- Check Only a Single Sheet has been created --> */
        expect(sheet.sheets)
          .to.have.lengthOf(1);

        expect(sheet.sheets[0].developerMetadata)
          .to.have.lengthOf(_.keys(schema.sheets).length + 1);

        expect(_.find(sheet.sheets[0].developerMetadata,
            m => m.metadataKey == "SCHEMA_VERSION"))
          .to.deep.include({
            metadataValue: String(schema.schema.version)
          });

        _.each(_.keys(schema.sheets), key => {

          expect(_.find(sheet.sheets[0].developerMetadata,
              m => m.metadataKey == schema.sheets[key].key))
            .to.deep.include({
              metadataValue: schema.sheets[key].value
            })
            .and.deep.include({
              visibility: schema.sheets[key].visibility ? schema.sheets[key].visibility : "DOCUMENT"
            })
            .and.deep.include({
              location: {
                "locationType": "SHEET",
                "sheetId": 0
              }
            });

        });

        expect(sheet)
          .to.have.nested.property("sheets[0].properties.sheetId", 0);

        expect(sheet)
          .to.have.nested.property("sheets[0].properties.title", schema.names.sheet);

        expect(sheet)
          .to.have.nested.property("sheets[0].properties.gridProperties.frozenRowCount", 2);

        var merges = _.chain(schema.columns).reduce((memo, column) => {
          memo.length === 0 || memo[memo.length - 1].name != column._meta.group ?
            memo.push({
              name: column._meta.group,
              start: memo.length == 0 ? 0 : memo[memo.length - 1].end,
              end: memo.length == 0 ? 1 : memo[memo.length - 1].end + 1
            }) : memo[memo.length - 1].end += 1;
          return memo;
        }, []).filter(merge => merge.end - merge.start > 1).value();

        /* <!-- Check Merge Length --> */
        expect(sheet.sheets[0].merges).to.have.lengthOf(merges.length);

        /* <!-- Check Each Merge --> */
        _.each(merges, merge => expect(sheet.sheets[0].merges)
          .to.deep.include({
            "startRowIndex": 0,
            "endRowIndex": 1,
            "startColumnIndex": merge.start,
            "endColumnIndex": merge.end
          }));

      }).then(_success(r, "Create")).catch(_failure(r, "Create")).then(_cleanup(db))
    )),

    open: db => RACE(new Promise(r => _start(db, true)
      .then(database => {

        expect(database)
          .to.be.an("object")
          .and.to.have.property("name")
          .and.to.eql(schema.db.name());

        expect(database.data)
          .to.have.lengthOf(0);

        expect(database.idIndex)
          .to.have.lengthOf(0);

        expect(database.binaryIndices)
          .and.deep.include({
            "__ROW": {
              "name": "__ROW",
              "dirty": false,
              "values": []
            }
          });

        expect(database.binaryIndices)
          .and.deep.include({
            "__ID": {
              "name": "__ID",
              "dirty": false,
              "values": []
            }
          });

      })
      .then(_success(r, "Open")).catch(_failure(r, "Open")).then(_cleanup(db))
    )),

    insert: db => RACE(new Promise(r => _start(db, true, true)
      .then(items => {

        FACTORY.Flags.log("Items INSERTED:", items);

        /* <!-- Check each of the insert items --> */
        _.each(items, (item, index) => {
          var _test = expect(item).to.be.an("object");
          _test.to.have.property("__ID").and.to.be.a("number");
          _test.to.have.property("__ROW").and.to.eql(index);
        });

        /* <!-- Check that the underlying DBs have also been updated --> */
        expect(db.state.data.last).to.equal(items.length - 1);

        /* <!-- Check that the underlying DBs have also been updated --> */
        expect(db.state.data.data).to.have.lengthOf(items.length);
        expect(db.state.db.data).to.have.lengthOf(items.length);

        /* <!-- Re-Open the Database, and check the values are correctly added to the spreadsheet --> */
        return _check.inserted(db, items);

      })
      .then(_success(r, "Populate")).catch(_failure(r, "Populate")).then(_cleanup(db))
    )),
    
    fill: db => RACE(new Promise(r => _start(db, true, true, 1050) /* <!-- Default number of rows in a new sheet is 1000 --> */
      .then(items => {

        FACTORY.Flags.log("Items INSERTED:", items.length);

        /* <!-- Re-Open the Database, and check the values are correctly added to the spreadsheet --> */
        return _check.inserted(db, items);

      })
      .then(_success(r, "Populate")).catch(_failure(r, "Populate")).then(_cleanup(db))
    )),
    
    edge: db => RACE(new Promise(r => _start(db, true, true, 1000) /* <!-- Default number of rows in a new sheet is 1000 --> */
      .then(items => {
        var _generated;
        return db.insert(_generated = _generate.items(schema, 1))
          .then(() => _check.inserted(db, items.concat(_generated)))
          .then(() => db.delete(_generated))
          .then(() => db.insert(_generated = _generate.items(schema, 10)))
          .then(() => _check.inserted(db, items.concat(_generated)))
          .then(() => db.delete(_generated))
          .then(() => _check.inserted(db, items));
      })
      .then(_success(r, "Populate")).catch(_failure(r, "Populate")).then(_cleanup(db))
    )),

    ingest: db => RACE(new Promise(r => _start(db, true)
      .then(database => _sheet.insert(db, database, true)
          .then(value => {
      
            /* <!-- Check Items have been properly injested --> */
            _.each(value.items, (item, index) => {
              expect(value.database.data[index]).to.deep.include(item);
              expect(value.database.data[index]).to.have.property("__ROW", index);
              expect(value.database.data[index]).to.have.property("__ID").and.to.be.ok;
            });

          }))
      .then(_success(r, "Ingest")).catch(_failure(r, "Ingest")).then(_cleanup(db))
    )),

    update: db => RACE(new Promise(r => _start(db, true, true)
      .then(_generate.changes) /* <!-- Make Random Changes --> */
      .then(db.update) /* <!-- Commit Changes to DB --> */
      .then(items => _check.inserted(db, items))
      .then(_success(r, "Update")).catch(_failure(r, "Update")).then(_cleanup(db))
    )),
    
    legacyUpdate: db => RACE(new Promise(r => _start(db, true)
      .then(database => _sheet.insert(db, database, false)
          .then(value => {
      
            /* <!-- Check Items have been properly opened --> */
            _.each(value.items, (item, index) => {
              expect(value.database.data[index]).to.deep.include(item);
              expect(value.database.data[index]).to.have.property("__ROW", index);
              expect(value.database.data[index]).to.have.property("__ID").and.not.to.be.ok;
            });
      
            /* <!-- Generate Random Changes --> */
            return _generate.changes(value.database.data, 5);
      
          }))
      .then(db.update) /* <!-- Commit Changes to DB --> */
      .then(items => _check.inserted(db, items)) /* <!-- Check that Changes have been successfully made --> */
      .then(_success(r, "Legacy Update")).catch(_failure(r, "Legacy Update")).then(_cleanup(db))
    )),
    
    singleUpdate: _test.update(true, true, items => [GEN.o(items)], 1),
    
    singleLegacyUpdate: _test.update(false, true, items => [GEN.o(items)], 1),
    
    multipleUpdate: _test.update(true, true, items => _.uniq(_.map(_.range(GEN.i(2, items.length)), () => GEN.o(items))), () => GEN.i(2, 5)),
    
    multipleLegacyUpdate: _test.update(false, true, items => _.uniq(_.map(_.range(GEN.i(2, items.length)), () => GEN.o(items))), () => GEN.i(2, 5)),
    
    delete: db => RACE(new Promise(r => {

      var _all;
      return _start(db, true, true)
        .then(items => {
          FACTORY.Flags.log("ALL Items:", items);
          return (_all = items);
        })
        .then(_generate.deletions) /* <!-- Choose Random Items to Delete --> */
        .then(db.delete) /* <!-- Commit Changes to DB --> */
        .then(items => {

          FACTORY.Flags.log("Items DELETED:", items);

          /* <!-- Check that SaaD Specific Properties have been removed --> */
          _.each(items, item => {
            expect(item.__HASH).to.be.an("undefined");
            expect(item.__ROW).to.be.an("undefined");
            expect(item.__ID).to.be.an("undefined");
          });

          var _remaining = _.difference(_all, items);
          FACTORY.Flags.log("Items REMAINING:", _remaining);
          expect(_remaining.length).to.equal(_all.length - items.length);

          /* <!-- Check that the underlying DBs have also been updated --> */
          expect(db.state.data.last).to.equal(_remaining.length - 1);
          expect(db.state.data.data)
            .to.have.lengthOf(_remaining.length);
          expect(db.state.db.data)
            .to.have.lengthOf(_remaining.length);

          /* <!-- Check that rows are consistent --> */
          _.each(db.state.data.data, (item, index) => {
            expect(item.__ROW).to.equal(index);
          });

          /* <!-- Check Items have been removed and spreadsheet is consistent --> */
          return Promise.all([
            _check.removed(db, items),
            _check.inserted(db, _remaining)
          ]);

        })
        .then(_success(r, "Delete")).catch(_failure(r, "Delete")).then(_cleanup(db));

    })),

    collision: db => RACE(new Promise(r => _start(db, true, true)
      .then(items => {

        var _item = _.clone(GEN.o(items)),
          _change = _.chain(schema.columns).filter(column => column._meta.hash).sample(1).value()[0];
        _item[_change.value] = GEN.an(GEN.i(5, 20));
        FACTORY.Flags.log(`CHANGED Field: ${_change.value} to Value: ${_item[_change.value]}`, _item);

        var _values = db.arrayise(_item),
          _range = db.range(
            db.state.data.rows.end + _item.__ROW + 1,
            db.state.data.columns.start,
            db.state.data.rows.end + _item.__ROW + 1,
            db.state.data.columns.end),
          _update = db.range(
            db.state.data.rows.end + _item.__ROW + 1,
            db.state.data.columns.start,
            db.state.data.rows.end + _item.__ROW + 2,
            db.state.data.columns.end);

        /* <!-- Insert them into DB --> */
        FACTORY.Flags.log(`UPDATING Range ${_range} | Row ${_item.__ROW} directly:`, _values);

        return FACTORY.Google.sheets.update(
          db.state.data.spreadsheet, `${db.state.data.title}!${_update}`, [_values]).then(() => {

          return db.update(items, true) /* <!-- Try to Commit Changes to DB --> */
            .then(() => expect.fail("Collision Exception not triggered"))
            .catch(e => {
              expect(e).to.have.string(`Hash Mismatch for Range: ${_range}`);
            });

        });

      })
      .then(_success(r, "Collision")).catch(_failure(r, "Collision")).then(_cleanup(db))
    )),

    query: () => DELAY(RANDOM(300, 3000)).then(() =>
      FACTORY.Flags.log("QUERY Complete").reflect(true)),

    finish: value =>
      FACTORY.Flags.log(`FINISH [Test = ${value.test} | Result = ${value.result}] Called`),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};