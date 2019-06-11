Tasks = ಠ_ಠ => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Google --> */

  /* <!-- Internal Constants --> */
  const EXTRACT_ALLDAY = /(^|\s|\(|\{|\[)(all day|all morning|all afternoon|all evening|[ap]m)\b/i;
  const EXTRACT_TIME = /(?:^|\s)((0?[1-9]|1[012])([:.]?[0-5][0-9])?(\s?[ap]m)|([01]?[0-9]|2[0-3])([:.]?[0-5][0-9]))(?:[.!?]?)(?:\s|$)/i;
  const EXTRACT_DATE = /\b(\d{4})-(\d{2})-(\d{2})|((0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^\w\d\r\n:](\d{4}|\d{2}))\b/i;
  const SPLIT_TAGS = /[^a-zA-Z0-9]/;
  const ZOMBIE = 60,
    GHOST = 120;
  const DB = new loki("docket.db"),
    NAMES = {
      spreadsheet: "Educ.IO | Docket Data",
      sheet: "Tasks",
      db: "Tasks"
    },
    META = {
      schema_version: {
        key: "SCHEMA_VERSION",
        value: "1.1",
      },
      sheet_archive: {
        key: "SHEET_ARCHIVE",
      },
      sheet_tasks: {
        key: "SHEET_NAME",
        value: "TASKS",
      },
      column_type: {
        key: "COLUMN_NAME",
        value: "TYPE",
        _meta: {
          group: "Meta",
          title: "Type",
          index: true,
          hash: true,
        }
      },
      column_from: {
        key: "COLUMN_NAME",
        value: "FROM",
        _meta: {
          title: "From",
          type: "date",
          index: true,
          hash: true,
        }
      },
      column_order: {
        key: "COLUMN_NAME",
        value: "ORDER",
        _meta: {
          title: "Order",
          width: 80,
          index: true,
          hash: true,
          type: "int",
        }
      },
      column_status: {
        key: "COLUMN_NAME",
        value: "STATUS",
        _meta: {
          title: "Status",
          width: 80,
          index: true,
          hash: true,
        }
      },
      column_done: {
        key: "COLUMN_NAME",
        value: "DONE",
        _meta: {
          title: "Done",
          type: "date",
          index: true,
        }
      },
      column_tags: {
        key: "COLUMN_NAME",
        value: "TAGS",
        _meta: {
          group: "Data",
          title: "Tags",
          width: 200,
          type: "markdown",
          hash: true,
        }
      },
      column_details: {
        key: "COLUMN_NAME",
        value: "DETAILS",
        _meta: {
          title: "Details",
          width: 500,
          type: "markdown",
          hash: true,
        }
      },
      row_headers: {
        key: "ROW_HEADERS",
        visibility: "DOCUMENT"
      },
      header_time: {
        value: "TIME",
      },
      header_due: {
        value: "DUE",
      },
      header_badges: {
        value: "BADGES",
      },
      header_ghost: {
        value: "GHOST"
      },
      header_zombie: {
        value: "ZOMBIE"
      }
    },
    STATUS = {
      complete: "COMPLETE"
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _data, _db;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _hash = item => objectHash.sha1(_.reduce([META.column_type, META.column_order, META.column_status, META.column_tags, META.column_details], (value, col) => {
    if (item[col.value]) value[col.value] = item[col.value];
    if (value[col.value] && value[col.value].toISOString) value[col.value] = value[col.value].toISOString();
    return value;
  }, {}));

  var _process = (zombified, ghostly) => item => {

    /* <!-- Extract Date from Details if found --> */
    var _due = item[META.column_details.value].match(EXTRACT_DATE);

    /* <!-- Set Due Date if available --> */
    !(item[META.header_due.value] = _due && _due.length >= 1 ? ಠ_ಠ.Dates.parse(_due[0], ["DD/MM/YYYY", "D/M/YY", "DD-MM-YY", "DD-MM-YYYY", "DD-MMM-YY", "DD-MMM-YYYY", "YYYY-MM-DD"]) : "") ?
    delete item._countdown: (item._countdown = item[META.header_due.value].diff(ಠ_ಠ.Dates.now(), "days"));

    /* <!-- Extract Time from Details if found --> */
    var _all = item[META.column_details.value].match(EXTRACT_ALLDAY),
      _time = item[META.column_details.value].match(EXTRACT_TIME);

    /* <!-- If time is actually part of the due date, discard time (better than look-ahead regex matching?). --> */
    if (_due && _due.length >= 1 && _time && _time.length >= 1 && item[META.header_due.value] && item[META.header_due.value].isValid() && _due[0].indexOf(_time[1]) >= 0) _time = null;

    /* <!-- Set Time if available --> */
    !(item[META.header_time.value] = _all && _all.length >= 1 ? _all[_all.length >= 2 ? 2 : 1] : _time && _time.length >= 1 ? _time[1] : "") ?
    delete item._timed: (item._timed = true);

    /* <!-- Split Tabs into Badges --> */
    if (item[META.column_tags.value]) item[META.header_badges.value] = item[META.column_tags.value].split(SPLIT_TAGS);

    /* <!-- Set Appropriate Status --> */
    if (item[META.column_status.value] && item[META.column_status.value].toUpperCase() == "COMPLETE") item._complete = true;

    /* <!-- Set Zombie | Ghost Status --> */
    if (!item._timed && !item._complete && item._countdown === undefined)(item[META.header_ghost.value] = item[META.column_from.value].isBefore(ghostly)) ? (item._dormant = item[META.column_from.value].fromNow()) : (item[META.header_zombie.value] = item[META.column_from.value].isBefore(zombified));

    return item;
  };

  var _populate = rows => _.reduce(rows, (list, row, index) => {

    var _row = {};
    _.each(_data.columns.meta, column => {
      var _val = row[column.developerMetadata.location.dimensionRange.startIndex];
      /* <!-- Parse Value if required --> */
      _row[column.developerMetadata.metadataValue] = _val ?
        column.isDate ? ಠ_ಠ.Dates.parse(_val) :
        column.isInteger ? parseInt(_val, 10) :
        _val : _val;
    });

    /* <!-- Set ROW / Index Reference --> */
    _data.last = Math.max(_data.last !== undefined ? _data.last : 0, (_row.__ROW = index));

    /* <!-- Set on-the-fly Item Properties (TIME and BADGES, so we can query them) --> */
    var __reference = ಠ_ಠ.Dates.now().startOf("day"),
      __process = _process(
        __reference.clone().subtract(ZOMBIE, "days"),
        __reference.subtract(GHOST, "days"));

    if (_row[META.column_details.value]) list.push(__process(_row));

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

    return ಠ_ಠ.Google.sheets.batch(spreadsheetId, _dimensions.concat(_metadata).concat(_merges).concat([{
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
    return ಠ_ಠ.Google.sheets.update(spreadsheetId, `'${sheetTitle}'!A1:${ಠ_ಠ.Google_Sheets_Notation().convertR1C1(`R2C${_titles.length}`)}`, [_groups, _titles]);
  };

  var _populateDataSheet = (spreadsheetId, sheetId, sheetTitle, headerColour) => {
    var _grid = ಠ_ಠ.Google_Sheets_Grid({
        sheet: sheetId
      }),
      _meta = ಠ_ಠ.Google_Sheets_Metadata({
        sheet: sheetId
      }, ಠ_ಠ),
      _columns = _.map(_.filter(META, column => column._meta && column.key == "COLUMN_NAME"), column => column);
    return _populateDataSheetHeaders(spreadsheetId, sheetTitle, _columns)
      .then(() => _formatDataSheet(spreadsheetId, sheetId, _columns, _grid, _meta, headerColour));
  };

  var _create = () => ಠ_ಠ.Google.sheets.create(NAMES.spreadsheet, NAMES.sheet, {
      red: 0.545,
      green: 0.153,
      blue: 0.153
    }, [META.sheet_tasks, META.schema_version]).then(sheet => {
      ಠ_ಠ.Flags.log(`Created Data File: ${sheet.properties.title} - [${sheet.spreadsheetId}]`);
      return sheet;
    })
    .then(sheet => _populateDataSheet(sheet.spreadsheetId, sheet.sheets[0].properties.sheetId, sheet.sheets[0].properties.title))
    .then(sheet => ಠ_ಠ.Google.files.update(sheet.spreadsheetId, {
      properties: {
        DOCKET: "DATA"
      }
    }))
    .then(response => response.id);

  var _close = () => {
    DB.removeCollection(NAMES.db);
    _db = null;
  };

  var _open = id => {

    if (_db) _close();

    $("nav a[data-link='sheet']").prop("href", `https://docs.google.com/spreadsheets/d/${id}/edit`);
    ಠ_ಠ.Flags.log(`Opening Data File: ${id}`);

    var _meta = ಠ_ಠ.Google_Sheets_Metadata({}, ಠ_ಠ),
      _notation = ಠ_ಠ.Google_Sheets_Notation();

    return ಠ_ಠ.Google.sheets.metadata.find(id, _meta.filter().parse(META.sheet_tasks).make())
      .then(value => {
        if (value && value.matchedDeveloperMetadata && value.matchedDeveloperMetadata.length == 1) {
          _data = {
            spreadsheet: id,
            sheet: value.matchedDeveloperMetadata[0].developerMetadata.location.sheetId
          };
          return ಠ_ಠ.Google.sheets.get(id);
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
        return ಠ_ಠ.Google.sheets.metadata.find(value.spreadsheet, _filters);
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

        ಠ_ಠ.Flags.log("METADATA (Rows):", _data.rows);
        ಠ_ಠ.Flags.log("METADATA (Columns):", _data.columns);

        _data.range = `${_notation.convertR1C1(`R${_data.rows.end + 1}C${_data.columns.start}`)}:${_notation.convertR1C1(`C${_data.columns.end}`, true)}`;
        ಠ_ಠ.Flags.log("Fetching Values for Range:", _data.range);

        return ಠ_ಠ.Google.sheets.values(_data.spreadsheet, `${_data.title}!${_data.range}`);

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
        ಠ_ಠ.Flags.log("Data Values:", _data.data);
        return _data.data;
        /* <!-- Populate and Return --> */

      })
      .then(data => {
        _db = DB.addCollection(NAMES.db, {
          indices: ["__ROW"].concat(_.map(_.filter(_data.columns, column => column._meta && column._meta.index), column => column.value))
        });
        if (data && data.length > 0) _db.insert(data);
        return _db;
      });
  };

  var _queries = {

    current: date => {
      var _queryTime = {},
        _queryCurrent = {},
        _queryDate = {},
        _queryStatus = {};
      _queryTime[META.header_time.value] = {
        "$eq": ""
      };
      _queryCurrent[META.column_from.value] = {
        "$gte": date.startOf("day").toDate()
      };
      _queryDate[META.column_from.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryStatus[META.column_status.value] = {
        "$ne": STATUS.complete
      };
      return {
        "$and": [{
          "$or": [_queryTime, _queryCurrent]
        }, _queryDate, _queryStatus]
      };
    },

    complete: date => {
      var _queryDateDoneFrom = {},
        _queryDateDoneTo = {},
        _queryStatus = {},
        _queryNotTimed = {},
        _queryTimed = {},
        _queryDateFrom = {},
        _queryDateTo = {};
      _queryDateDoneFrom[META.column_done.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryDateDoneTo[META.column_done.value] = {
        "$gte": date.startOf("day").toDate()
      };
      _queryStatus[META.column_status.value] = {
        "$eq": STATUS.complete
      };
      _queryNotTimed[META.header_time.value] = {
        "$eq": ""
      };
      _queryTimed[META.header_time.value] = {
        "$ne": ""
      };
      _queryDateFrom[META.column_from.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryDateTo[META.column_from.value] = {
        "$gte": date.startOf("day").toDate()
      };
      return {
        "$or": [{
            "$and": [_queryNotTimed, _queryDateDoneFrom, _queryDateDoneTo, _queryStatus]
          },
          {
            "$and": [_queryTimed, _queryDateFrom, _queryDateTo, _queryStatus]
          }
        ]
      };
    },

    dated: date => {
      var _queryTime = {},
        _queryFuture = {},
        _queryDateFrom = {},
        _queryDateTo = {},
        _queryStatus = {};
      _queryTime[META.header_time.value] = {
        "$ne": ""
      };
      _queryFuture[META.column_from.value] = {
        "$gt": ಠ_ಠ.Dates.now().startOf("day").toDate()
      };
      _queryDateFrom[META.column_from.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryDateTo[META.column_from.value] = {
        "$gte": date.startOf("day").toDate()
      };
      _queryStatus[META.column_status.value] = {
        "$ne": STATUS.complete
      };
      return {
        "$or": [{
          "$and": [{
            "$or": [_queryTime, _queryFuture]
          }, _queryDateFrom, _queryDateTo, _queryStatus]
        }, _queries.complete(date)]
      };
    },

    tagged: tag => {
      var _queryTag = {},
        _queryStatus = {};
      _queryTag[META.header_badges.value] = {
        "$contains": tag
      };
      _queryStatus[META.column_status.value] = {
        "$ne": STATUS.complete
      };
      return {
        "$and": [_queryTag, _queryStatus]
      };
    },

    text: (value, from) => {
      var _queryText, _queryDetails = {},
        _queryTags = {};
      _queryDetails[META.column_details.value] = {
        "$regex": [value, "i"]
      };
      _queryTags[META.column_tags.value] = {
        "$regex": [value, "i"]
      };
      _queryText = {
        "$or": [_queryDetails, _queryTags]
      };
      if (!from) {
        return _queryText;
      } else {
        var _queryStatus = {},
          _queryNotTime = {},
          _queryTime = {},
          _queryFuture = {};
        _queryStatus[META.column_status.value] = {
          "$ne": STATUS.complete
        };
        _queryNotTime[META.header_time.value] = {
          "$eq": ""
        };
        _queryTime[META.header_time.value] = {
          "$ne": ""
        };
        _queryFuture[META.column_from.value] = {
          "$gte": ಠ_ಠ.Dates.parse(from).startOf("day").toDate()
        };
        return {
          "$and": [_queryText, {
            "$or": [{
              "$and": [_queryStatus, _queryNotTime]
            }, {
              "$and": [_queryTime, _queryFuture]
            }]
          }]
        };
      }
    },

  };

  var _results = (query, db) => (db ? db : _db).find(query);

  var _current = (date, db) => {
    var _query = {
      "$or": [_queries.current(date), _queries.complete(date)]
    };
    ಠ_ಠ.Flags.log(`Query [Current] for :${date}`, _query);
    var _data = _results(_query, db);
    ಠ_ಠ.Flags.log(`Result Values [Current] for :${date}`, _data);
    return _data;
  };

  var _date = (date, db) => {
    var _query = _queries.dated(date);
    ಠ_ಠ.Flags.log(`Query for :${date}`, _query);
    var _data = _results(_query, db);
    ಠ_ಠ.Flags.log(`Result Values for :${date}`, _data);
    return _data;
  };

  var _convertToArray = item => _.reduce(_data.columns.meta, (value, column) => {
    value[column.developerMetadata.location.dimensionRange.startIndex] =
      column.isDate && item[column.developerMetadata.metadataValue] && item[column.developerMetadata.metadataValue].format ?
      item[column.developerMetadata.metadataValue].format("YYYY-MM-DD") :
      item[column.developerMetadata.metadataValue] ? item[column.developerMetadata.metadataValue] : "";
    return value;
  }, []);

  var _new = item => {

    /* <!-- For new data sheets --> */
    _data.last = _data.last ? _data.last : -1;

    var _notation = ಠ_ಠ.Google_Sheets_Notation(),
      _range = `${_notation.convertR1C1(`R${_data.rows.end + 2 + _data.last}C${_data.columns.start}`)}:${_notation.convertR1C1(`C${_data.columns.end}`, true)}`,
      _value = _convertToArray(item);

    ಠ_ಠ.Flags.log(`Writing Values [NEW] for Range: ${_range}`, _value);

    return ಠ_ಠ.Google.sheets.append(_data.spreadsheet, `${_data.title}!${_range}`, [_value]).then(result => {
      if (result && result.updates) {
        item.__ROW = (_data.last += 1);
        item.__hash = _hash(item);
        return item;
      } else {
        return false;
      }
    });

  };

  var _update = item => {

    var _notation = ಠ_ಠ.Google_Sheets_Notation(),
      _range = `${_notation.convertR1C1(`R${_data.rows.end + 1 + item.__ROW}C${_data.columns.start}`)}:${_notation.convertR1C1(`R${_data.rows.end + 1 + item.__ROW}C${_data.columns.end}`, true)}`,
      _value = _convertToArray(item);

    return ಠ_ಠ.Google.sheets.values(_data.spreadsheet, `${_data.title}!${_range}`).then(value => {
      var _existing = _populate(value.values)[0];
      _existing.__hash = _hash(_existing);
      if (_existing.__hash == item.__hash) {
        ಠ_ಠ.Flags.log(`Writing Values [UPDATED] for Range: ${_range}`, _value);
        return ಠ_ಠ.Google.sheets.update(_data.spreadsheet, `${_data.title}!${_range}`, [_value]).then(() => {
          item.__hash = _hash(item);
          return item;
        });
      } else {
        return Promise.reject(`Hash Mismath for Range: ${_range} [Hash_ITEM: ${item.__hash}, Hash_EXISTING: ${_existing.__hash}]`);
      }
    });

  };

  var _archive = (year, db) => ಠ_ಠ.Google.sheets.filtered(_data.spreadsheet, ಠ_ಠ.Google_Sheets_Metadata({}, ಠ_ಠ).filter().parse(META.sheet_archive).value(year).make())
    .then(value => value && value.sheets && value.sheets.length == 1 && _.find(value.sheets[0].developerMetadata, m => m.metadataKey == META.sheet_archive.key && m.metadataValue == year) ?
      value.sheets[0].properties :
      ಠ_ಠ.Google.sheets.batch(_data.spreadsheet, [{
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
        "createDeveloperMetadata": ಠ_ಠ.Google_Sheets_Metadata({}, ಠ_ಠ).sheet(year).tag({
          key: META.sheet_archive.key,
          value: year
        })
      }]).then(response => response && response.replies && response.replies.length == 2 ? response.replies[0].addSheet.properties : false))
    .then(value => value ? _populateDataSheet(_data.spreadsheet, value.sheetId, value.title, {
      "red": 0.4,
      "green": 0.4,
      "blue": 0.4
    }) : value)
    .then(value => {
      if (!value) return value;
      var _sheet = _.find(value.sheets, sheet => _.find(sheet.developerMetadata, m => m.metadataKey == META.sheet_archive.key && m.metadataValue == year)),
        _items = (db ? db : _db).where(item => item[META.column_from.value].year() == year),
        _values = _.map(_items, item => _convertToArray(item));

      var _notation = ಠ_ಠ.Google_Sheets_Notation(),
        _range = `${_notation.convertR1C1(`R1C${_data.columns.start}`)}:${_notation.convertR1C1(`C${_data.columns.end}`, true)}`;

      ಠ_ಠ.Flags.log(`Appending Values [NEW] for Range: ${_range}`, _values);

      return ಠ_ಠ.Google.sheets.append(_data.spreadsheet, `'${_sheet.properties.title}'!${_range}`, _values).then(result => result && result.updates ? _items : false);
    });

  var _remove = items => {

    var _grid = ಠ_ಠ.Google_Sheets_Grid({
        sheet: _data.sheet
      }),
      _start = _data.rows.end + 1 + _.min(items, item => item.__ROW).__ROW,
      _end = _data.rows.end + 1 + _.max(items, item => item.__ROW).__ROW,
      _dimension = _grid.dimension("ROWS", _start - 1, _end);

    ಠ_ಠ.Flags.log(`Removing Rows : ${_start}-${_end} / Dimension : ${JSON.stringify(_dimension)} for items:`, items);

    return ಠ_ಠ.Google.sheets.batch(_data.spreadsheet, {
      "deleteDimension": {
        "range": _dimension
      }
    });

  };

  var _delete = (item, db) => {

    if (item.__ROW === undefined || item.__ROW === null) return Promise.reject();

    var _grid = ಠ_ಠ.Google_Sheets_Grid({
        sheet: _data.sheet
      }),
      _row = _data.rows.end + 1 + item.__ROW,
      _dimension = _grid.dimension("ROWS", _row - 1, _row),
      _notation = ಠ_ಠ.Google_Sheets_Notation(),
      _range = `${_notation.convertR1C1(`R${_data.rows.end + 1 + item.__ROW}C${_data.columns.start}`)}:${_notation.convertR1C1(`R${_data.rows.end + 1 + item.__ROW}C${_data.columns.end}`, true)}`;

    return ಠ_ಠ.Google.sheets.values(_data.spreadsheet, `${_data.title}!${_range}`).then(value => {
      var _existing = _populate(value.values)[0];
      _existing.__hash = _hash(_existing);
      if (_existing.__hash == item.__hash) {
        ಠ_ಠ.Flags.log(`Deleting Row : ${_row} / Dimension : ${JSON.stringify(_dimension)} for item:`, item);
        return ಠ_ಠ.Google.sheets.batch(_data.spreadsheet, {
          "deleteDimension": {
            "range": _dimension
          }
        }).then(() => {
          /* <!-- Reduce the relevant and last row to account for the removed row --> */
          (db ? db : _db).updateWhere(row => row.__ROW > item.__ROW, row => row.__ROW -= 1);
          _data.last -= 1;
          return true;
        });
      } else {
        return Promise.reject(`Hash Mismath for Range: ${_range} [Hash_ITEM: ${item.__hash}, Hash_EXISTING: ${_existing.__hash}]`);
      }

    });

  };

  var _badges = db => _.chain((db ? db : _db).chain().data()).pluck(META.header_badges.value).flatten()
    .reduce((totals, badge) => {
      if (badge) totals[badge] = totals[badge] ? totals[badge] + 1 : 1;
      return totals;
    }, {}).pairs().sortBy(1).reverse().first(4).value();
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    regexes: {

      EXTRACT_ALLDAY: EXTRACT_ALLDAY,

      EXTRACT_TIME: EXTRACT_TIME,

      EXTRACT_DATE: EXTRACT_DATE,

      SPLIT_TAGS: SPLIT_TAGS,

    },

    create: _create,

    open: _open,

    close: _close,

    search: (query, db, from) => {
      var _query = _queries.text(query, from);
      ಠ_ಠ.Flags.log(`Query for :${query}`, _query);
      var _results = (db ? db : _db).find(_query);
      ಠ_ಠ.Flags.log(`Result Values for : ${query}`, _results);
      return _results;
    },

    query: (date, db, current) => current ? _current(date, db) : _date(date, db),

    tagged: (tag, db) => {
      var _query = _queries.tagged(tag);
      ಠ_ಠ.Flags.log(`Query [Current] for :${tag}`, _query);
      var _results = (db ? db : _db).find(_query);
      ಠ_ಠ.Flags.log(`Result Values for : ${tag}`, _results);
      return _results;
    },

    years: db => {

      var _all = (db ? db : _db).chain().data();
      var _results = _.reduce(_all, (tally, item) => {
        var _year;
        if (item[META.column_from.value]) _year = item[META.column_from.value].year();
        _year = _year ? _year : "N/A";
        if (!tally[_year]) tally[_year] = {
          incomplete: 0,
          complete: 0
        };
        tally[_year][item._complete || (item._timed && !item[META.column_from.value].isAfter()) ? "complete" : "incomplete"] += 1;
        return tally;
      }, {});
      ಠ_ಠ.Flags.log("Result Values for years", _results);
      return _results;
    },

    archive: _archive,

    badges: _badges,

    items: {

      create: _new,

      update: _update,

      delete: _delete,

      process: items => {
        var _reference = ಠ_ಠ.Dates.now().startOf("day"),
          _zombie = _reference.clone().subtract(ZOMBIE, "days"),
          _ghost = _reference.subtract(GHOST, "days");
        _.each(_.isArray(items) ? items : [items], _process(_zombie, _ghost));
        return Promise.resolve(items);
      },

      remove: _remove,

    },

    hash: _hash

  };
  /* <!-- External Visibility --> */

};