SaaD = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Sheets as a Database - Provides DB Functionality for Google Sheets --> */
  /* <!-- PARAMETERS: Receives the global app context, options --> */
  /* <!-- REQUIRES: Global Scope: Loki, Underscore, DayJS/Moment | App Scope: Flags, Dates, Google, Google_Sheets_Grid, Google_Sheets_Metadata, Google_Sheets_Notation, Google_Sheets_Format; --> */
  /* <!-- @options = {db, meta, names : {spreadsheet, sheet}, properties, process, colour} --> */

  /* <!-- Internal Consts --> */
  const
    SPLIT_TAGS = /[^a-zA-Z0-9]/,
    EXTRACT_ALLDAY = /(^|\s|\(|\{|\[)(all day)\b/i,
    EXTRACT_TIME = /\b((0?[1-9]|1[012])([:.]?[0-5][0-9])?(\s?[ap]m)|([01]?[0-9]|2[0-3])([:.]?[0-5][0-9]))\b/i,
    EXTRACT_DATE = /\b(\d{4})-(\d{2})-(\d{2})|((0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^\w\d\r\n:](\d{4}|\d{2}))\b/i;

  const defaults = {

    db: { /* <!--  --> */
      name: "data",
      /* <!--  --> */
      file: "data.db",
      /* <!--  --> */
    },

    names: { /* <!--  --> */
      spreadsheet: "Database",
      /* <!--  --> */
      sheet: "Data" /* <!--  --> */
    },

    property: { /* <!--  --> */
      name: "SAAD",
      /* <!--  --> */
      value: "DATA",
      /* <!--  --> */
    },

    schema: {
      version: 1,
      /* <!-- Version number for this schema --> */
      colour: [0, 0, 0],
      /* <!-- DB / Sheet Tab Colour --> */
    },

    options: { /* <!-- Options to control how SaaD works --> */
      ingest: false,
      /* <!-- Whether externally added data is ingested (e.g. ID added) --> */
      always_hash: false,
      /* <!-- Whether hashes are run on data retreival or just setting --> */
      check: false /* <!-- Whether to check for changed values before writing --> */
    },

    sheets: {
      /* <!-- sheet_name: { 																			--> */
      /* <!--		key: "SHEET_NAME",		|		METADATA TAG Key				--> */
      /* <!--   value: "NAME,					|		METADATA TAG Value			--> */
      /* <!--   visibility: "DOCUMENT,|		METADATA TAG Visibility	--> */

      /* <!-- },																							 		--> */
    },

    process: item => item,
    /* <!--  --> */

    columns: { /* <!--  --> */
      /* <!-- column_name { 																			--> */
      /* <!--		key: "COLUMN_NAME",		|		METADATA TAG Key				--> */
      /* <!--   value: "NAME,					|		METADATA TAG Value			--> */
      /* <!--   visibility: "DOCUMENT,|		METADATA TAG Visibility	--> */
      /* <!--   _meta: { 																					--> */
      /* <!--   	group: "MAIN",			|		MERGE GROUP Name				--> */
      /* <!--     colour: "AAAAAA",		|		COLOUR for Column				--> */
      /* <!--     title: "Name",			|		TITLE for Column				--> */
      /* <!--     width: 150,					|		WIDTH of Column					--> */
      /* <!--     index: true,				|		LOKI Indexed?						--> */
      /* <!--     hash: true,					|		HASHED for Changes? 		--> */
      /* <!--     type: "markdown",		|		TYPE of Data						--> */
      /* <!--   }																									--> */
      /* <!-- } 																									--> */
    },

    rows: {
      row_headers: { /* <!-- METADATA Tag for where Data Rows begin --> */
        key: "ROW_HEADERS",
        visibility: "DOCUMENT"
      },
      row_id: { /* <!-- METADATA Tag for Data Row ID --> */
        key: "ROW_ID",
        visibility: "DOCUMENT"
      },
    },

  };
  /* <!-- Internal Consts --> */

  /* <!-- Setup Variables --> */
  options = _.defaults(options, defaults);
  factory = factory ? factory : this; /* <!-- Set Factory / Context --> */
  /* <!-- Setup Variables --> */

  /* <!-- Internal Consts --> */
  const DB = new loki(options.db.file),
    FN = {};
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {};
  /* <!-- Internal Variables --> */

  /* <!-- Internal Initialisation Functions --> */
  FN.initialise = () => {
    /* <!-- Array of Columns to Hash --> */
    ರ‿ರ.hashes = _.reduce(options.columns, (array, column) => {
      if (column._meta && column._meta.hash) array.push(column);
      return array;
    }, []);
  };

  /* <!-- Internal Helper Functions --> */
  FN.helpers = sheetId => ({
    grid: factory.Google_Sheets_Grid({
      sheet: sheetId
    }),
    meta: factory.Google_Sheets_Metadata({
      sheet: sheetId
    }, factory),
    format: factory.Google_Sheets_Format({
      sheet: sheetId
    }, factory),
    properties: factory.Google_Sheets_Properties({
      sheet: sheetId
    }),
    notation: factory.Google_Sheets_Notation(),
  });

  /* <!-- Internal Utility Functions --> */
  FN.utilities = {

    convertToArray: item => _.reduce(ರ‿ರ.data.columns.meta,
      (value, column) => {
        value[column.developerMetadata.location.dimensionRange.startIndex] = column.isDate &&
          item[column.developerMetadata.metadataValue] &&
          item[column.developerMetadata.metadataValue].format ?
          item[column.developerMetadata.metadataValue].format("YYYY-MM-DD") :
          item[column.developerMetadata.metadataValue] ?
          item[column.developerMetadata.metadataValue] : "";
        return value;
      }, []),

    hash: item => objectHash.sha1(_.reduce(ರ‿ರ.hashes, (value, column) => {
      if (item[column.value]) value[column.value] = item[column.value];
      return value;
    }, {})),

    range: (row_start, column_start, row_end, column_end) => ರ‿ರ.helpers.notation.rangeR1C1(
      `${row_start === null ? "" : `R${row_start}`}${column_start === null ? "" : `C${column_start}`}:${row_end === null ? "" : `R${row_end}`}${column_end === null ? "" : `C${column_end}`}`),

  };

  /* <!-- Internal Generation Functions --> */
  FN.generate = {

    cells: {

      update: item => ({
        updateCells: {
          rows: [{
            values: _.map(FN.utilities.convertToArray(item),
              value => ({
                userEnteredValue: {
                  stringValue: value
                }
              }))
          }],
          range: ರ‿ರ.helpers.grid.range(ರ‿ರ.data.rows.end + item.__ROW,
            ರ‿ರ.data.rows.end + item.__ROW + 1,
            ರ‿ರ.data.columns.start - 1,
            ರ‿ರ.data.columns.end),
          fields: "userEnteredValue.stringValue"
        }
      }),

      delete: item => ({
        deleteDimension: {
          range: ರ‿ರ.helpers.grid.dimension("ROWS",
            ರ‿ರ.data.rows.end + item.__ROW, ರ‿ರ.data.rows.end + item.__ROW + 1)
        }
      })

    },

    rows: {

      id: row => ({
        "createDeveloperMetadata": ರ‿ರ.helpers.meta.rows(
            ರ‿ರ.data.rows.end + row,
            ರ‿ರ.data.rows.end + row + 1)
          .tag(options.rows.row_id)
      }),

      delete: range => ({
        deleteDimension: {
          range: ರ‿ರ.helpers.grid.dimension.apply(null, ["ROWS"].concat(
            ರ‿ರ.helpers.notation.gridA1(ರ‿ರ.helpers.notation.clean(range), true)))
        }
      })

    },

    ranges: {

      delete: range => ({
        "deleteRange": {
          "range": ರ‿ರ.helpers.grid.range.apply(null, ರ‿ರ.helpers.notation.gridA1(
            ರ‿ರ.helpers.notation.clean(range), true)),
          "shiftDimension": "ROWS"
        }
      }),

    }

  };

  /* <!-- Internal Format Functions --> */
  FN.format = {

    sheet: (spreadsheetId, sheetId, columns, headerColour) => {

      var helpers = FN.helpers(sheetId),
        _dimensions = _.map(columns, (column, index) => ({
          "updateDimensionProperties": helpers.grid.columns(index, index + 1)
            .dimension(column._meta && column._meta.width ? column._meta.width : 100)
        })),
        _metadata = _.map(columns, (column, index) => ({
          "createDeveloperMetadata": helpers.meta.columns(index, index + 1).tag(column)
        })),
        _colours = _.reduce(columns, (memo, column, index, columns) => {
          if (column._meta.colour && index === 0 ||
            (memo.colour !== false && column._meta.colour != memo.colour) ||
            index == (columns.length - 1)) {
            if (memo.colour) memo.batches.push(
              helpers.format.cells(
                helpers.grid.columns(memo.start, index == (columns.length - 1) ? index + 1 : index).range(), [helpers.format.background(memo.colour)]));
            memo.colour = column._meta.colour;
            memo.start = index;
          }
          return memo;
        }, {
          colour: false,
          start: false,
          batches: []
        }).batches,
        _merges = _.reduce(columns, (memo, column, index, columns) => {
          if ((column._meta.group && column._meta.group != memo.name) || index == (columns.length - 1)) {
            if (memo.name || index == (columns.length - 1)) memo.batches.push({
              "mergeCells": {
                "range": helpers.grid.range(0, 1, memo.start,
                  index == (columns.length - 1) ? index + 1 : index),
                "mergeType": "MERGE_ALL",
              }
            });
            memo.name = column._meta.group;
            memo.start = index;
          }
          return memo;
        }, {
          name: false,
          start: false,
          batches: []
        }).batches;

      return factory.Google.sheets.batch(
          spreadsheetId, _dimensions.concat(_metadata).concat(_colours).concat(_merges).concat([{
              "createDeveloperMetadata": helpers.meta.rows(0, 1).tag(options.rows.row_headers)
            }, {
              "createDeveloperMetadata": helpers.meta.rows(1, 2).tag(options.rows.row_headers)
            },
            helpers.format.cells(helpers.grid.rows(0, 2).range(), [
              helpers.format.background(headerColour),
              helpers.format.align.horizontal("CENTER"),
              helpers.format.align.vertical("MIDDLE"),
              helpers.format.text("white", 12, true)
            ]),
            helpers.format.cells(helpers.grid.range(0, 2, _metadata.length - 1, _metadata.length), [
              helpers.format.text("white", 14, true)
            ]),
            helpers.format.cells(helpers.grid.columns(_metadata.length - 2, _metadata.length).range(), [
              helpers.format.wrap("WRAP")
            ]),
            helpers.format.cells(helpers.grid.columns(0, _metadata.length - 2).range(), [
              helpers.format.align.horizontal("CENTER")
            ]),
            helpers.properties.update([
              helpers.properties.grid.frozen.rows(2),
            ])
          ]), true)
        .then(response => response && response.updatedSpreadsheet ? response.updatedSpreadsheet : false);
    },

  };

  /* <!-- Internal Populate Functions --> */
  FN.populate = {

    sheet: (spreadsheetId, sheetId, sheetTitle, headerColour) => {

      var _columns = _.map(_.filter(options.columns, c => c._meta && c.key == "COLUMN_NAME"), c => c);

      return FN.populate.headers(spreadsheetId, sheetTitle, _columns)
        .then(() => FN.format.sheet(spreadsheetId, sheetId, _columns, headerColour));

    },

    headers: (spreadsheetId, sheetTitle, columns) => {

      var _groups = _.map(columns, column => column._meta && column._meta.group ? column._meta.group : ""),
        _titles = _.map(columns, column => column._meta && column._meta.title ? column._meta.title : ""),
        _notation = factory.Google_Sheets_Notation();

      return factory.Google.sheets.update(
        spreadsheetId,
        `'${sheetTitle}'!A1:${_notation.convertR1C1(`R2C${_titles.length}`)}`, [_groups, _titles]
      );

    },

    rows: (rows, metadata, ingest, hash) => {

      var _batches = [],
        _rows = _.reduce(rows, (list, row, index) => {

          var _row = {};
          _.each(ರ‿ರ.data.columns.meta, column => {
            var _val = row[column.developerMetadata.location.dimensionRange.startIndex];
            _row[column.developerMetadata.metadataValue] = _val && column.isDate ?
              factory.Dates.parse(_val) : _val;
          });

          /* <!-- Set ROW / Index Reference --> */
          ರ‿ರ.data.last = Math.max(ರ‿ರ.data.last !== undefined ?
            ರ‿ರ.data.last : 0, (_row.__ROW = index));

          /* <!-- Get ID from Metadata (if available) --> */
          var _index = ರ‿ರ.data.rows.end + index,
            _id = _.findIndex(metadata,
              item => item.developerMetadata.location.dimensionRange.startIndex === _index);

          /* <!-- Set ID (if available) --> */
          _row.__ID = _id >= 0 ? metadata.splice(_id, 1)[0].developerMetadata.metadataId : null;

          /* <!-- Generate HASH --> */
          if (hash || options.options.always_hash) _row.__HASH = FN.utilities.hash(_row);

          /* <!-- Populate missing ID, if options.ingest --> */
          if ((ingest || options.options.ingest) && _row.__ID === null)
            _batches.push({
              row: _row,
              batch: FN.generate.rows.id(_row.__ROW)
            });

          /* <!-- Set on-the-fly Item Properties and Add to Return List --> */
          if (_.compact(_row).length > 0) list.push(options.process ? options.process(_row) : row);

          return list;

        }, []);

      return _batches.length > 0 ?
        factory.Google.sheets.batch(ರ‿ರ.data.spreadsheet, _.pluck(_batches, "batch"))
        .then(results => {
          if (results && results.replies) _.each(_batches, (batch, index) =>
            batch.row.__ID = results.replies[index].createDeveloperMetadata.developerMetadata.metadataId);
          return _rows;
        }) : Promise.resolve(_rows);

    },

  };

  /* <!-- Internal Sheet Functions --> */
  FN.sheet = {

    /* <!-- FUNCTION: Creates a new Database Spreadsheet --> */
    /* <!-- PARAMETERS: meta: Array of metadata to add to the newly created sheet --> */
    create: meta => {

      return factory.Google.sheets.create(
          options.names.spreadsheet, options.names.sheet,
          factory.Google_Sheets_Format({}, factory).colour(options.schema.colour), meta)

        .then(sheet => {
          var _properties = sheet.sheets[0].properties;
          ರ‿ರ.helpers = FN.helpers(_properties.sheetId);
          return FN.populate.sheet(sheet.spreadsheetId, _properties.sheetId, _properties.title);
        })

        /* <!-- ID of Created Spreadsheet --> */
        .then(sheet => _.tap(sheet, sheet => {
          ರ‿ರ.data = {
            spreadsheet: sheet.spreadsheetId,
            sheet: sheet.sheets[0].properties.sheetId,
            title: sheet.sheets[0].properties.title
          };
          ರ‿ರ.helpers = FN.helpers(ರ‿ರ.data.sheet);
        }))

        .then(sheet => _.tap(sheet, sheet => factory.Google.files.update(
          sheet.spreadsheetId, factory.Google.files.tag(options.property.name, options.property.value))));

    },

    /* <!-- FUNCTION: Opens a Database Spreadsheet --> */
    /* <!-- PARAMETERS: id: Spreadsheet / Google Drive ID --> */
    /* <!-- PARAMETERS: sheetMetadata: Metadata to retrieve the correct sheet --> */
    /* <!-- PARAMETERS: ingest: Overrides schema ingest (if true) --> */
    /* <!-- PARAMETERS: ingest: Overrides schema always hash (if true) --> */
    open: (id, sheetMetadata, ingest, hash) => {

      factory.Flags.log(`Opening Data File: ${id}`);

      return factory.Google.sheets.metadata.find(id,
          factory.Google_Sheets_Metadata({}, factory).filter()
          .parse(sheetMetadata ? sheetMetadata : _.values(options.sheets)[0]).make())
        .then(value => {
          if (value && value.matchedDeveloperMetadata && value.matchedDeveloperMetadata.length == 1) {
            /* <!-- Representation of Sheet Data Structure --> */
            ರ‿ರ.data = {
              spreadsheet: id,
              sheet: value.matchedDeveloperMetadata[0].developerMetadata.location.sheetId,
            };
            /* <!-- Various Sheet Helpers --> */
            if (!ರ‿ರ.helpers) ರ‿ರ.helpers = FN.helpers(ರ‿ರ.data.sheet);
            return factory.Google.sheets.get(id);
          } else {
            return false;
          }
        })
        .then(value => {
          if (!value) return;
          ರ‿ರ.data.title = _.find(value.sheets,
            sheet => sheet.properties.sheetId == ರ‿ರ.data.sheet).properties.title;
          return ರ‿ರ.data;
        })
        .then(value => {
          if (!value) return;
          var _location = ರ‿ರ.helpers.meta.location.sheet(value.sheet),
            _filters = [
              ರ‿ರ.helpers.meta.filter().location(_location).key(_.values(options.columns)[0].key).make(),
              ರ‿ರ.helpers.meta.filter().location(_location).key(options.rows.row_headers.key).make()
            ];
          return factory.Google.sheets.metadata.find(value.spreadsheet, _filters);
        })
        .then(value => {
          if (!value || !value.matchedDeveloperMetadata) return;

          ರ‿ರ.data.rows = {
            meta: _.filter(value.matchedDeveloperMetadata, metadata => metadata.developerMetadata.metadataKey == options.rows.row_headers.key),
            start: 0,
            end: 0
          };
          ರ‿ರ.data.columns = {
            meta: _.filter(value.matchedDeveloperMetadata, metadata => metadata.developerMetadata.metadataKey == _.values(options.columns)[0].key),
            start: 1,
            end: 0
          };
          _.each([ರ‿ರ.data.rows, ರ‿ರ.data.columns], dimension => {
            _.each(dimension.meta, metadata => {
              dimension.start = Math.min(dimension.start, metadata.developerMetadata.location.dimensionRange.startIndex >= dimension.start ?
                metadata.developerMetadata.location.dimensionRange.startIndex : dimension.start);
              dimension.end = Math.max(dimension.end, metadata.developerMetadata.location.dimensionRange.endIndex);
            });
          });

          factory.Flags.log("METADATA (Rows):", ರ‿ರ.data.rows);
          factory.Flags.log("METADATA (Columns):", ರ‿ರ.data.columns);

          ರ‿ರ.data.range = FN.utilities.range(
            ರ‿ರ.data.rows.end + 1, ರ‿ರ.data.columns.start, null, ರ‿ರ.data.columns.end);

          return factory.Google.sheets.metadata.find(ರ‿ರ.data.spreadsheet,
            ರ‿ರ.helpers.meta.filter()
            .location(ರ‿ರ.helpers.meta.location.sheet(value.sheet))
            .key(options.rows.row_id.key).make());

        })
        .then(metadata => {

          if (!metadata) return;

          factory.Flags.log("METADATA (Row IDs):", metadata);
          factory.Flags.log("Fetching Values for Range:", ರ‿ರ.data.range);

          return factory.Google.sheets.values(
            ರ‿ರ.data.spreadsheet, `${ರ‿ರ.data.title}!${ರ‿ರ.data.range}`
          ).then(value => {
            if (!value) return;

            /* <!-- Map Date / Markdown Fields / Columns --> */
            var _filter = type => column => column._meta && column._meta.type == type,
              _value = column => column.value,
              _types = {
                date: _.map(_.filter(options.columns, _filter("date")), _value),
                markdown: _.map(_.filter(options.columns, _filter("markdown")), _value),
                integer: _.map(_.filter(options.columns, _filter("int")), _value),
                time: _.map(_.filter(options.columns, _filter("time")), _value)
              };
            _.each(ರ‿ರ.data.columns.meta, column => {
              column.isDate = (_types.date.indexOf(column.developerMetadata.metadataValue) >= 0);
              column.isMarkdown = (_types.markdown.indexOf(column.developerMetadata.metadataValue) >= 0);
              column.isInteger = (_types.integer.indexOf(column.developerMetadata.metadataValue) >= 0);
              column.isTime = (_types.time.indexOf(column.developerMetadata.metadataValue) >= 0);
            });
            /* <!-- Map Date / Markdown Fields / Columns --> */

            /* <!-- Populate and Return --> */
            return value.values ?
              FN.populate.rows(value.values, metadata.matchedDeveloperMetadata, ingest, hash)
              .then(rows => {
                factory.Flags.log("Data Values:", rows);
                return (ರ‿ರ.data.data = rows);
              }) : ರ‿ರ.data.data = [];
            /* <!-- Populate and Return --> */

          });

        })
        .then(data => {

          if (!data) return;

          if (ರ‿ರ.db) DB.removeCollection(options.db.name);
          ರ‿ರ.db = DB.addCollection(options.db.name, {
            indices: ["__ID", "__ROW"].concat(_.map(_.filter(ರ‿ರ.data.columns,
              c => c._meta && c._meta.index), c => c.value))
          });
          if (data && data.length > 0) ರ‿ರ.db.insert(data);
          return ರ‿ರ.db;
        });
    },

    close: () => {
      DB.removeCollection(options.db.name);
      ರ‿ರ = {};
    }

  };

  /* <!-- Internal Row Functions --> */
  FN.rows = {

    check: (items, id) => factory.Google.sheets.values(ರ‿ರ.data.spreadsheet,
        id ? _.pluck(items, "__ID") : _.map(items, item => `${ರ‿ರ.data.title}!${FN.utilities.range(
        ರ‿ರ.data.rows.end + 1 + item.__ROW, ರ‿ರ.data.columns.start,
        ರ‿ರ.data.rows.end + 1 + item.__ROW, ರ‿ರ.data.columns.end)}`), ರ‿ರ.data.sheet)

      .then(values => FN.populate.rows(_.chain(values.valueRanges)
        .sortBy(value => {
          var _range = value.valueRange.range.split(":");
          return ರ‿ರ.helpers.notation.rowA1(_range[_range.length - 1]);
        })
        .map(value => value.valueRange.values[0])
        .value(), null, false, true))

      .then(all => {
        for (var i = 0; i < all.length; i++) {
          if (all[i].__HASH !== items[i].__HASH) return Promise.reject(
            `Hash Mismatch for Range: ${FN.utilities.range(
              ರ‿ರ.data.rows.end + 1 + all[i].__ROW, ರ‿ರ.data.columns.start,
              ರ‿ರ.data.rows.end + 1 + all[i].__ROW, ರ‿ರ.data.columns.end)} [ITEM: ${items[i].__HASH}, STORED: ${all[i].__HASH}]`);
        }
      }),

    insert: items => {

      var generate = item => {

          /* <!-- Set the data entry row --> */
          item.__ROW = (ರ‿ರ.data.last = ರ‿ರ.data.last === undefined || ರ‿ರ.data.last === null ?
            0 : ರ‿ರ.data.last += 1); /* <!-- For new data sheets --> */

          /* <!-- Log the data entry range --> */
          if (factory.Flags.debug()) factory.Flags.log(
            `Preparing to Write Values [NEW] for Range: ${FN.utilities.range(ರ‿ರ.data.rows.end + 1 + item.__ROW, ರ‿ರ.data.columns.start, null, ರ‿ರ.data.columns.end)}`, item);

          return [FN.generate.cells.update(item), FN.generate.rows.id(item.__ROW)];

        },
        commit = batches => factory.Google.sheets.batch(ರ‿ರ.data.spreadsheet, batches);

      return commit(_.reduce((items = _.isArray(items) ? items : [items]),
          (batches, item) => batches.concat(generate(item)), []))
        .then(results => {

          if (results && results.replies) {

            _.each(items, (item, index) => {
              var _index = (index * 2) + 1;
              if (results.replies.length > _index) {

                /* <!-- Set Metadata ID --> */
                item.__ID = results.replies[_index]
                  .createDeveloperMetadata.developerMetadata.metadataId;

                /* <!-- Generate HASH --> */
                item.__HASH = FN.utilities.hash(item);

                /* <!-- Insert into DBs --> */
                ರ‿ರ.data.data.push(item);
                ರ‿ರ.db.insert(item);
              }
            });
            return items;

          } else {

            /* <!-- Delete Metadata ROW as we didn't commit --> */
            _.each(items, item => delete item.__ROW);
            return false;

          }

        });

    },

    update: (items, check) => {

      var id = _.every(items = _.isArray(items) ? items : [items], "__ID"),
        range = () => factory.Google.sheets.batch(ರ‿ರ.data.spreadsheet,
          _.map(items, FN.generate.cells.update)),
        metadata = () => factory.Google.sheets.update(ರ‿ರ.data.spreadsheet,
          _.pluck(items, "__ID"),
          _.map(items, FN.utilities.convertToArray),
          null, ರ‿ರ.data.sheet),
        commit = () => (id ? metadata() : range())
        .then(() => {
          _.each(items, item => {
            item.__HASH = FN.utilities.hash(item);
            ರ‿ರ.db.update(item);
          });
          return items;
        });

      return check || options.options.check ? FN.rows.check(items, id).then(commit) : commit();

    },

    delete: (items, check) => {

      var id = _.every(items = _.isArray(items) ? items : [items], "__ID"),
        range = () => factory.Google.sheets.batch(ರ‿ರ.data.spreadsheet,
          _.map(items, FN.generate.cells.delete)),

        metadata = () => factory.Google.sheets.clear(ರ‿ರ.data.spreadsheet,
          _.pluck(items, "__ID"),
          ರ‿ರ.data.sheet)
        .then(response => factory.Google.sheets.batch(ರ‿ರ.data.spreadsheet,
          _.chain(response.clearedRanges)
          .sortBy(value => ರ‿ರ.helpers.notation.rowA1(
            ರ‿ರ.helpers.notation.clean(value).split(":")[0]
          ))
          .map(FN.generate.rows.delete)
          .value().reverse())),
        /* <!-- REVERSE Order: Delete from end to start --> */
        commit = () => (id ? metadata() : range())
        .then(() => {
          ರ‿ರ.data.last -= items.length; /* <!-- Reduce the last row to account for removals --> */
          _.each(items, item => {

            /* <!-- Remove from the DBs too --> */
            ರ‿ರ.data.data = _.reject(ರ‿ರ.data.data, element => element === item);
            ರ‿ರ.db.remove(item);

            /* <!-- Remove SaaD specific properties too --> */
            delete item.__HASH;
            delete item.__ROW;
            delete item.__ID;

          });

          /* <!-- Update ROWS for the remaining items --> */
          _.each(ರ‿ರ.data.data, (item, index) => {
            item.__ROW = index;
            ರ‿ರ.db.update(item);
          });

          return items;
        });

      return (check || options.options.check ? FN.rows.check(items, id).then(commit) : commit());

    },

  };

  /* <!-- Initial Calls --> */
  FN.initialise(); /* <!-- Run initial variable initialisation --> */

  /* <!-- External Visibility --> */
  return {

    state: ರ‿ರ,

    create: sheetMetadata => FN.sheet.create(_.union([{
      key: "SCHEMA_VERSION",
      value: options.schema.version
    }], [sheetMetadata ? sheetMetadata : _.values(options.sheets)[0]])),

    hash: FN.utilities.hash,

    arrayise: FN.utilities.convertToArray,

    range: FN.utilities.range,

    open: FN.sheet.open,

    close: FN.sheet.close,

    insert: FN.rows.insert,

    delete: FN.rows.delete,

    update: FN.rows.update,

    regexes: {

      EXTRACT_ALLDAY: EXTRACT_ALLDAY,

      EXTRACT_TIME: EXTRACT_TIME,

      EXTRACT_DATE: EXTRACT_DATE,

      SPLIT_TAGS: SPLIT_TAGS,

    },

  };
  /* <!-- External Visibility --> */

};