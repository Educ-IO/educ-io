SaaD = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Sheets as a Database - Provides DB Functionality for Google Sheets --> */
  /* <!-- PARAMETERS: Receives the global app context, options --> */
  /* <!-- REQUIRES: Global Scope: Loki, Underscore | App Scope: Flags, Google, Google_Sheets_Grid, Google_Sheets_Metadata, Google_Sheets_Notation, Google_Sheets_Format; --> */
  /* <!-- @options = {db, meta, names : {spreadsheet, sheet}, properties, process, colour} --> */

  /* <!-- Internal Consts --> */
  const
    SPLIT_TAGS = /[^a-zA-Z0-9]/,
    EXTRACT_ALLDAY = /(^|\s|\(|\{|\[)(all day)\b/i,
    EXTRACT_TIME = /\b((0?[1-9]|1[012])([:.]?[0-5][0-9])?(\s?[ap]m)|([01]?[0-9]|2[0-3])([:.]?[0-5][0-9]))\b/i,
    EXTRACT_DATE = /\b(\d{4})-(\d{2})-(\d{2})|((0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^\w\d\r\n:](\d{4}|\d{2}))\b/i;

  const defaults = {
    db: {
      name: "data",
      file: "data.db",
    },
    names: {
      spreadsheet: "Database",
      sheet: "Data"
    },
    property: {
      name: "SAAD",
      value: "DATA",
    },
    schema: {
      version: 1,
      colour: [0, 0, 0],
    },
    sheets: {},
    process: item => item,
    columns: {},
    rows: {
      row_headers: {
        key: "ROW_HEADERS",
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
  const DB = new loki(options.db.file);
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  var state = {};
  /* <!-- Internal Variables --> */

  /* <!-- Initialisation Functions --> */
  var _initialise = () => {
    /* <!-- Array of Columns to Hash --> */
    state.hashes = _.reduce(options.columns, (array, column) => {
      if (column._meta && column._meta.hash) array.push(column);
      return array;
    }, []);
  };
  _initialise(); /* <!-- Run initial variable initialisation --> */
  /* <!-- Initialisation Functions --> */

  /* <!-- Internal Functions --> */
  var _helpers = sheetId => ({
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

  var _utilities = {

    convertToArray: item => _.reduce(state.data.columns.meta,
      (value, column) => {
        value[column.developerMetadata.location.dimensionRange.startIndex] =
          column.isDate && item[column.developerMetadata.metadataValue] && item[column.developerMetadata.metadataValue]._isAMomentObject ?
          item[column.developerMetadata.metadataValue].format("YYYY-MM-DD") :
          item[column.developerMetadata.metadataValue] ? item[column.developerMetadata.metadataValue] : "";
        return value;
      }, []),

    hash: item => objectHash.sha1(_.reduce(state.hashes, (value, column) => {
      if (item[column.value]) value[column.value] = item[column.value];
      return value;
    }, {})),

    range: (row_start, column_start, row_end, column_end) => state.helpers.notation.rangeR1C1(
      `${row_start === null ? "" : `R${row_start}`}${column_start === null ? "" : `C${column_start}`}:${row_end === null ? "" : `R${row_end}`}${column_end === null ? "" : `C${column_end}`}`),

  };

  var _format = {

    sheet: (spreadsheetId, sheetId, columns, headerColour) => {

      var helpers = _helpers(sheetId),
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

  var _populate = {

    sheet: (spreadsheetId, sheetId, sheetTitle, headerColour) => {

      var _columns = _.map(_.filter(options.columns, c => c._meta && c.key == "COLUMN_NAME"), c => c);

      return _populate.headers(spreadsheetId, sheetTitle, _columns)
        .then(() => _format.sheet(spreadsheetId, sheetId, _columns, headerColour));

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

    rows: rows => _.reduce(rows, (list, row, index) => {

      var _row = {};
      _.each(state.data.columns.meta, column => {
        var _val = row[column.developerMetadata.location.dimensionRange.startIndex];
        _row[column.developerMetadata.metadataValue] = _val && column.isDate ? moment(_val) : _val;
      });

      /* <!-- Set ROW / Index Reference --> */
      state.data.last = Math.max(state.data.last !== undefined ? state.data.last : 0, (_row.__ROW = index));

      /* <!-- Set on-the-fly Item Properties and Add to Return List --> */
      if (_.compact(_row).length > 0) list.push(options.process ? options.process(_row) : row);

      return list;

    }, []),

  };

  var _sheet = {

    /* <!-- FUNCTION: Creates a new Database Spreadsheet --> */
    /* <!-- PARAMETERS: meta: Array of metadata to add to the newly created sheet --> */
    create: meta => factory.Google.sheets.create(
        options.names.spreadsheet, options.names.sheet,
        factory.Google_Sheets_Format({}, factory).colour(options.schema.colour), meta)

      .then(sheet => {
        var _properties = sheet.sheets[0].properties;
        state.helpers = _helpers(_properties.sheetId);
        return _populate.sheet(sheet.spreadsheetId, _properties.sheetId, _properties.title);
      })

      /* <!-- ID of Opened Spreadsheet --> */
      .then(sheet => _.tap(sheet, sheet => state.id = sheet.spreadsheetId))

      .then(sheet => _.tap(sheet, sheet => factory.Google.files.update(
        sheet.spreadsheetId, factory.Google.files.tag(options.property.name, options.property.value)))),

    /* <!-- FUNCTION: Opens a Database Spreadsheet --> */
    /* <!-- PARAMETERS: id: Spreadsheet / Google Drive ID --> */
    /* <!-- PARAMETERS: sheetMetadata: Metadata to retrieve the correct sheet --> */
    open: (id, sheetMetadata) => {

      factory.Flags.log(`Opening Data File: ${id}`);

      return factory.Google.sheets.metadata.find(id, factory.Google_Sheets_Metadata({}, factory).filter()
          .parse(sheetMetadata ? sheetMetadata : _.values(options.sheets)[0]).make())
        .then(value => {
          if (value && value.matchedDeveloperMetadata && value.matchedDeveloperMetadata.length == 1) {
            /* <!-- Representation of Sheet Data Structure --> */
            state.data = {
              spreadsheet: id,
              sheet: value.matchedDeveloperMetadata[0].developerMetadata.location.sheetId
            };
            /* <!-- Various Sheet Helpers --> */
            if (!state.helpers) state.helpers = _helpers(state.data.sheet);
            return factory.Google.sheets.get(id);
          } else {
            return false;
          }
        })
        .then(value => {
          if (!value) return;
          state.data.title = _.find(value.sheets,
            sheet => sheet.properties.sheetId == state.data.sheet).properties.title;
          return state.data;
        })
        .then(value => {
          if (!value) return;
          var _location = state.helpers.meta.location.sheet(value.sheet),
            _filters = [
              state.helpers.meta.filter().location(_location).key(_.values(options.columns)[0].key).make(),
              state.helpers.meta.filter().location(_location).key(options.rows.row_headers.key).make()
            ];
          return factory.Google.sheets.metadata.find(value.spreadsheet, _filters);
        })
        .then(value => {
          if (!value || !value.matchedDeveloperMetadata) return;

          state.data.rows = {
            meta: _.filter(value.matchedDeveloperMetadata, metadata => metadata.developerMetadata.metadataKey == options.rows.row_headers.key),
            start: 0,
            end: 0
          };
          state.data.columns = {
            meta: _.filter(value.matchedDeveloperMetadata, metadata => metadata.developerMetadata.metadataKey == _.values(options.columns)[0].key),
            start: 1,
            end: 0
          };
          _.each([state.data.rows, state.data.columns], dimension => {
            _.each(dimension.meta, metadata => {
              dimension.start = Math.min(dimension.start, metadata.developerMetadata.location.dimensionRange.startIndex >= dimension.start ?
                metadata.developerMetadata.location.dimensionRange.startIndex : dimension.start);
              dimension.end = Math.max(dimension.end, metadata.developerMetadata.location.dimensionRange.endIndex);
            });
          });

          factory.Flags.log("METADATA (Rows):", state.data.rows);
          factory.Flags.log("METADATA (Columns):", state.data.columns);

          state.data.range = _utilities.range(
            state.data.rows.end + 1, state.data.columns.start, null, state.data.columns.end);
          factory.Flags.log("Fetching Values for Range:", state.data.range);

          return factory.Google.sheets.values(
            state.data.spreadsheet, `${state.data.title}!${state.data.range}`);

        })
        .then(value => {
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
          _.each(state.data.columns.meta, column => {
            column.isDate = (_types.date.indexOf(column.developerMetadata.metadataValue) >= 0);
            column.isMarkdown = (_types.markdown.indexOf(column.developerMetadata.metadataValue) >= 0);
            column.isInteger = (_types.integer.indexOf(column.developerMetadata.metadataValue) >= 0);
            column.isTime = (_types.time.indexOf(column.developerMetadata.metadataValue) >= 0);
          });
          /* <!-- Map Date / Markdown Fields / Columns --> */

          /* <!-- Populate and Return --> */
          state.data.data = value.values ? _populate.rows(value.values) : [];
          factory.Flags.log("Data Values:", state.data.data);
          return state.data.data;
          /* <!-- Populate and Return --> */

        })
        .then(data => {
          state.db = DB.addCollection(options.db, {
            indices: ["__ROW"].concat(_.map(_.filter(state.data.columns,
              c => c._meta && c._meta.index), c => c.value))
          });
          if (data && data.length > 0) state.db.insert(data);
          return state.db;
        });
    },

    close: () => {
      DB.removeCollection(options.db.name);
      state = {};
    }

  };

  var _rows = {

    insert: item => {

      /* <!-- For new data sheets --> */
      state.data.last = state.data.last ? state.data.last : -1;

      var _range = _utilities.range(
        state.data.rows.end + 2 + state.data.last, state.data.columns.start, null, state.data.columns.end);

      var _value = _utilities.convertToArray(item);

      factory.Flags.log(`Writing Values [NEW] for Range: ${_range}`, _value);

      return factory.Google.sheets.append(
          state.data.spreadsheet, `${state.data.title}!${_range}`, [_value])
        .then(result => {
          if (result && result.updates) {
            item.__ROW = (state.data.last += 1);
            item.__hash = _utilities.hash(item);
            return item;
          } else {
            return false;
          }
        });

    },

    delete: item => {

      if (item.__ROW === undefined || item.__ROW === null) return Promise.reject();

      var _row = state.data.rows.end + 1 + item.__ROW,
        _dimension = state.helpers.grid.dimension("ROWS", _row - 1, _row),
        _range = _utilities.range(
          state.data.rows.end + 1 + item.__ROW, state.data.columns.start,
          state.data.rows.end + 1 + item.__ROW, state.data.columns.end);

      return factory.Google.sheets.values(state.data.spreadsheet, `${state.data.title}!${_range}`)
        .then(value => {
          var _existing = _populate(value.values)[0];
          _existing.__hash = _utilities.hash(_existing);
          if (_existing.__hash == item.__hash) {
            factory.Flags.log(`Deleting Row : ${_row} / Dimension : ${JSON.stringify(_dimension)} for item:`, item);
            return factory.Google.sheets.batch(state.data.spreadsheet, {
              "deleteDimension": {
                "range": _dimension
              }
            }).then(() => {
              /* <!-- Reduce the relevant and last row to account for the removed row --> */
              state.db.updateWhere(row => row.__ROW > item.__ROW, row => row.__ROW -= 1);
              state.data.last -= 1;
              return true;
            });
          } else {
            return Promise.reject(`Hash Mismath for Range: ${_range} [Hash_ITEM: ${item.__hash}, Hash_EXISTING: ${_existing.__hash}]`);
          }

        });

    },

    remove: items => {

      var _start = state.data.rows.end + 1 + _.min(items, item => item.__ROW).__ROW,
        _end = state.data.rows.end + 1 + _.max(items, item => item.__ROW).__ROW,
        _dimension = state.helpers.grid.dimension("ROWS", _start - 1, _end);

      factory.Flags.log(`Removing Rows : ${_start}-${_end} / Dimension : ${JSON.stringify(_dimension)} for items:`, items);

      return factory.Google.sheets.batch(state.data.spreadsheet, {
        "deleteDimension": {
          "range": _dimension
        }
      });

    },

    update: item => {

      var _range = _utilities.range(
          state.data.rows.end + 1 + item.__ROW, state.data.columns.start,
          state.data.rows.end + 1 + item.__ROW, state.data.columns.end),
        _value = _utilities.convertToArray(item);

      return factory.Google.sheets.values(state.data.spreadsheet, `${state.data.title}!${_range}`).then(value => {
        var _existing = _populate(value.values)[0];
        _existing.__hash = _utilities.hash(_existing);
        if (_existing.__hash == item.__hash) {
          factory.Flags.log(`Writing Values [UPDATED] for Range: ${_range}`, _value);
          return factory.Google.sheets.update(
            state.data.spreadsheet, `${state.data.title}!${_range}`, [_value]).then(() => {
            item.__hash = _utilities.hash(item);
            return item;
          });
        } else {
          return Promise.reject(`Hash Mismath for Range: ${_range} [Hash_ITEM: ${item.__hash}, Hash_EXISTING: ${_existing.__hash}]`);
        }
      });

    },

  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    state: state,

    create: sheetMetadata => _sheet.create(_.union([{
      key: "SCHEMA_VERSION",
      value: options.schema.version
    }], [sheetMetadata ? sheetMetadata : _.values(options.sheets)[0]])),

    hash: _utilities.hash,

    open: _sheet.open,

    close: _sheet.close,
    
    insert: _rows.insert,
    
    delete: _rows.delete,
    
    remove: _rows.remove,
    
    update: _rows.update,

    regexes: {

      EXTRACT_ALLDAY: EXTRACT_ALLDAY,

      EXTRACT_TIME: EXTRACT_TIME,

      EXTRACT_DATE: EXTRACT_DATE,

      SPLIT_TAGS: SPLIT_TAGS,

    },

  };
  /* <!-- External Visibility --> */

};