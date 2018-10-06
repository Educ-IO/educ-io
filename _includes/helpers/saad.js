SaaD = (options, factory) => {
	"use strict";
	
	/* <!-- MODULE: Sheets as a Database - Provides DB Functionality for Google Sheets --> */
  /* <!-- PARAMETERS: Receives the global app context, options --> */
	/* <!-- REQUIRES: Global Scope: Loki, Underscore | App Scope: Flags, Google, Google_Sheets_Grid, Google_Sheets_Metadata, Google_Sheets_Notation; --> */
	/* <!-- @options = {db, meta, names : {spreadsheet, sheet}, properties, process, colour} --> */

	/* <!-- Internal Consts --> */
	const defaults = {
    db : "data.db",
    names : {
      spreadsheet : "Database",
      sheet: "Data"
    },
    properties : {},
    process : item => item,
    colour : {
      red: 0,
      green: 0,
      blue: 0
    },
  };
	options = _.defaults(options, defaults);
  factory = factory ? factory : this; /* <!-- Set Factory / Context --> */
  const DB = new loki(options.db);
  const META = {};
	/* <!-- Internal Consts --> */

	/* <!-- Internal Variables --> */
  var _data,
      _db,
      _hashes,
      _process;
  /* <!-- Internal Variables --> */
  
	/* <!-- Initialisation Functions --> */
	var _initialise = () => {
    _hashes = _.reduce(options.meta, (array, meta) => {
      if (meta._meta && meta._meta.hash) array.push(meta);
      return array;
    }, []);
	}; _initialise(); /* <!-- Run initial variable initialisation --> */
	/* <!-- Initialisation Functions --> */

	/* <!-- Internal Functions --> */
  var _hash = item => objectHash.sha1(_.reduce(_hashes, (value, col) => {
    if (item[col.value]) value[col.value] = item[col.value];
    return value;
  }, {}));

  var _populate = rows => _.reduce(rows, (list, row, index) => {

    var _row = {};
    _.each(_data.columns.meta, column => {
      var _val = row[column.developerMetadata.location.dimensionRange.startIndex];
      _row[column.developerMetadata.metadataValue] = _val && column.isDate ? moment(_val) : _val;
    });

    /* <!-- Set ROW / Index Reference --> */
    _data.last = Math.max(_data.last !== undefined ? _data.last : 0, (_row.__ROW = index));

    /* <!-- Set on-the-fly Item Properties and Add to Return List --> */
    if (_.compact(_row).length > 0) list.push(_process(_row));

    return list;

  }, []);

  var _formatDataSheet = (spreadsheetId, sheetId, columns, grid, meta, headerColour) => {
    var _dimensions = _.map(columns, (column, index) => ({
        "updateDimensionProperties": grid.columns(index, index + 1)
          .dimension(column._meta && column._meta.width ? column._meta.width : 100)
      })),
      _metadata = _.map(columns, (column, index) => ({
        "createDeveloperMetadata": meta.columns(index, index + 1).tag(column)
      })),
      _merges = _.reduce(columns, (memo, column, index, columns) => {
        if ((column._meta.group && column._meta.group != memo.name) || index == (columns.length - 1)) {
          if (memo.name || index == (columns.length - 1)) memo.batches.push({
            "mergeCells": {
              "range": grid.range(0, 1, memo.start, index == (columns.length - 1) ? index + 1 : index),
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

    return factory.Google.sheets.batch(spreadsheetId, _dimensions.concat(_metadata).concat(_merges).concat([{
        "createDeveloperMetadata": meta.rows(0, 1).tag(META.row_headers)
      }, {
        "createDeveloperMetadata": meta.rows(1, 2).tag(META.row_headers)
      }, {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": 0,
            "endRowIndex": 2
          },
          "cell": {
            "userEnteredFormat": {
              "backgroundColor": headerColour ? headerColour : {
                "red": 0.0,
                "green": 0.0,
                "blue": 0.0
              },
              "horizontalAlignment": "CENTER",
              "verticalAlignment": "MIDDLE",
              "textFormat": {
                "foregroundColor": {
                  "red": 1.0,
                  "green": 1.0,
                  "blue": 1.0
                },
                "fontSize": 12,
                "bold": true
              }
            }
          },
          "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)"
        }
      }, {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startRowIndex": 0,
            "endRowIndex": 2,
            "startColumnIndex": _metadata.length - 1,
            "endColumnIndex": _metadata.length
          },
          "cell": {
            "userEnteredFormat": {
              "textFormat": {
                "foregroundColor": {
                  "red": 1.0,
                  "green": 1.0,
                  "blue": 0.0
                },
                "fontSize": 14,
                "bold": true
              }
            }
          },
          "fields": "userEnteredFormat(textFormat)"
        }
      }, {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startColumnIndex": _metadata.length - 2,
            "endColumnIndex": _metadata.length
          },
          "cell": {
            "userEnteredFormat": {
              "wrapStrategy": "WRAP"
            }
          },
          "fields": "userEnteredFormat(wrapStrategy)"
        }
      }, {
        "repeatCell": {
          "range": {
            "sheetId": sheetId,
            "startColumnIndex": 0,
            "endColumnIndex": _metadata.length - 2
          },
          "cell": {
            "userEnteredFormat": {
              "horizontalAlignment": "CENTER",
            }
          },
          "fields": "userEnteredFormat(horizontalAlignment)"
        }
      }, {
        "updateSheetProperties": {
          "properties": {
            "sheetId": sheetId,
            "gridProperties": {
              "frozenRowCount": 2
            },
          },
          "fields": "gridProperties.frozenRowCount"
        }
      }]), true)
      .then(response => response && response.updatedSpreadsheet ? response.updatedSpreadsheet : false);
  };

  var _populateDataSheetHeaders = (spreadsheetId, sheetTitle, columns) => {
    var _groups = _.map(columns, column => column._meta && column._meta.group ? column._meta.group : ""),
      _titles = _.map(columns, column => column._meta && column._meta.title ? column._meta.title : "");
    return factory.Google.sheets.update(spreadsheetId, `'${sheetTitle}'!A1:${factory.Google_Sheets_Notation().convertR1C1(`R2C${_titles.length}`)}`, [_groups, _titles]);
  };

  var _populateDataSheet = (spreadsheetId, sheetId, sheetTitle, headerColour) => {
    var _grid = factory.Google_Sheets_Grid({
        sheet: sheetId
      }),
      _meta = factory.Google_Sheets_Metadata({
        sheet: sheetId
      }, factory),
      _columns = _.map(_.filter(META, column => column._meta && column.key == "COLUMN_NAME"), column => column);
    return _populateDataSheetHeaders(spreadsheetId, sheetTitle, _columns)
      .then(() => _formatDataSheet(spreadsheetId, sheetId, _columns, _grid, _meta, headerColour));
  };

  var _create = () => factory.Google.sheets.create(options.names.spreadsheet, options.names.sheet, options.colour, [META.sheet_tasks, META.schema_version]).then(sheet => {
      factory.Flags.log(`Created Data File: ${sheet.properties.title} - [${sheet.spreadsheetId}]`);
      return sheet;
    })
    .then(sheet => _populateDataSheet(sheet.spreadsheetId, sheet.sheets[0].properties.sheetId, sheet.sheets[0].properties.title))
    .then(sheet => factory.Google.files.update(sheet.spreadsheetId, {properties: options.properties}))
    .then(response => response.id);

  var _open = id => {
    
    factory.Flags.log(`Opening Data File: ${id}`);

    var _meta = factory.Google_Sheets_Metadata({}, factory),
      _notation = factory.Google_Sheets_Notation();

    return factory.Google.sheets.metadata.find(id, _meta.filter().parse(META.sheet_tasks).make())
      .then(value => {
        if (value && value.matchedDeveloperMetadata && value.matchedDeveloperMetadata.length == 1) {
          _data = {
            spreadsheet: id,
            sheet: value.matchedDeveloperMetadata[0].developerMetadata.location.sheetId
          };
          return factory.Google.sheets.get(id);
        } else {
          return false;
        }
      })
      .then(value => {
        if (!value) return;
        _data.title = _.find(value.sheets, sheet => sheet.properties.sheetId == _data.sheet).properties.title;
        return _data;
      })
      .then(value => {
        if (!value) return;
        var _location = _meta.location.sheet(value.sheet),
          _filters = [
            _meta.filter().location(_location).key(META.column_type.key).make(),
            _meta.filter().location(_location).key(META.row_headers.key).make()
          ];
        return factory.Google.sheets.metadata.find(value.spreadsheet, _filters);
      })
      .then(value => {
        if (!value || !value.matchedDeveloperMetadata) return;

        _data.rows = {
          meta: _.filter(value.matchedDeveloperMetadata, metadata => metadata.developerMetadata.metadataKey == META.row_headers.key),
          start: 0,
          end: 0
        };
        _data.columns = {
          meta: _.filter(value.matchedDeveloperMetadata, metadata => metadata.developerMetadata.metadataKey == META.column_type.key),
          start: 1,
          end: 0
        };
        _.each([_data.rows, _data.columns], dimension => {
          _.each(dimension.meta, metadata => {
            dimension.start = Math.min(dimension.start, metadata.developerMetadata.location.dimensionRange.startIndex >= dimension.start ?
              metadata.developerMetadata.location.dimensionRange.startIndex : dimension.start);
            dimension.end = Math.max(dimension.end, metadata.developerMetadata.location.dimensionRange.endIndex);
          });
        });

        factory.Flags.log("METADATA (Rows):", _data.rows);
        factory.Flags.log("METADATA (Columns):", _data.columns);

        _data.range = `${_notation.convertR1C1(`R${_data.rows.end + 1}C${_data.columns.start}`)}:${_notation.convertR1C1(`C${_data.columns.end}`, true)}`;
        factory.Flags.log("Fetching Values for Range:", _data.range);

        return factory.Google.sheets.values(_data.spreadsheet, `${_data.title}!${_data.range}`);

      })
      .then(value => {
        if (!value) return;

        /* <!-- Map Date / Markdown Fields / Columns --> */
        var _columnTypes = {
          date: _.map(_.filter(META, column => column._meta && column._meta.type == "date"), column => column.value),
          markdown: _.map(_.filter(META, column => column._meta && column._meta.type == "markdown"), column => column.value),
          integer: _.map(_.filter(META, column => column._meta && column._meta.type == "int"), column => column.value),
          time: _.map(_.filter(META, column => column._meta && column._meta.type == "time"), column => column.value)
        };
        _.each(_data.columns.meta, column => {
          column.isDate = (_columnTypes.date.indexOf(column.developerMetadata.metadataValue) >= 0);
          column.isMarkdown = (_columnTypes.markdown.indexOf(column.developerMetadata.metadataValue) >= 0);
          column.isInteger = (_columnTypes.integer.indexOf(column.developerMetadata.metadataValue) >= 0);
          column.isTime = (_columnTypes.time.indexOf(column.developerMetadata.metadataValue) >= 0);
        });
        /* <!-- Map Date / Markdown Fields / Columns --> */

        /* <!-- Populate and Return --> */
        _data.data = value.values ? _populate(value.values) : [];
        factory.Flags.log("Data Values:", _data.data);
        return _data.data;
        /* <!-- Populate and Return --> */

      })
      .then(data => {
        _db = DB.addCollection(options.db, {
          indices: ["__ROW"].concat(_.map(_.filter(_data.columns, column => column._meta && column._meta.index), column => column.value))
        });
        if (data && data.length > 0) _db.insert(data);
        return _db;
      });
  };
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */

	/* <!-- External Visibility --> */
	return {
    
    create: _create,
    
    hash: _hash,
    
    open: _open,
    
	};
	/* <!-- External Visibility --> */

};