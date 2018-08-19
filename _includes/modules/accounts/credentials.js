Credentials = ಠ_ಠ => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored credentials --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Google --> */

  /* <!-- Internal Constants --> */
  const SPLIT_TAGS = /[^a-zA-Z0-9]/;
  const DB = new loki("accounts.db"),
    PROPERTIES = {
      ACCOUNTS: "DATA"
    },
    NAMES = {
      spreadsheet: "Educ.IO | Accounts Data",
      sheet: "Accounts",
      db: "Accounts"
    },
    SCHEMA = {
        key: "SCHEMA_VERSION",
        value: "1.0",
      },
    SHEETS = {
      sheet_credentials: {
        key: "SHEET_NAME",
        value: "CREDENTIALS",
      },
    },
    ROWS = {
      row_headers: {
        key: "ROW_HEADERS",
        visibility: "DOCUMENT"
      },
    },
    COLUMNS = {
      column_name: {
        key: "COLUMN_NAME",
        value: "NAME",
        _meta: {
          group: "Meta",
          title: "Name",
          width: 200,
          index: true,
        }
      },
      column_description: {
        key: "COLUMN_NAME",
        value: "DESCRIPTION",
        _meta: {
          title: "Description",
          width: 200,
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
        }
      },
      column_details: {
        key: "COLUMN_NAME",
        value: "DETAILS",
        _meta: {
          title: "Details",
          width: 500,
          type: "markdown",
        }
      },
    },
    HEADERS = {
      header_badges: {
        value: "BADGES",
      }
    },
    STATUS = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _data, _hash, _db, _create, _open, _populate, _populateDataSheet, _process;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _close = () => {
    DB.removeCollection(NAMES.db);
    _db = null;
  };

  var _queries = {

    current: date => {
      var _queryTime = {},
        _queryCurrent = {},
        _queryDate = {},
        _queryStatus = {};
      _queryTime[HEADERS.header_time.value] = {
        "$eq": ""
      };
      _queryCurrent[COLUMNS.column_from.value] = {
        "$gte": date.startOf("day").toDate()
      };
      _queryDate[COLUMNS.column_from.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryStatus[COLUMNS.column_status.value] = {
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
      _queryDateDoneFrom[COLUMNS.column_done.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryDateDoneTo[COLUMNS.column_done.value] = {
        "$gte": date.startOf("day").toDate()
      };
      _queryStatus[COLUMNS.column_status.value] = {
        "$eq": STATUS.complete
      };
      _queryNotTimed[COLUMNS.header_time.value] = {
        "$eq": ""
      };
      _queryTimed[COLUMNS.header_time.value] = {
        "$ne": ""
      };
      _queryDateFrom[COLUMNS.column_from.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryDateTo[COLUMNS.column_from.value] = {
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
      _queryTime[HEADERS.header_time.value] = {
        "$ne": ""
      };
      _queryFuture[COLUMNS.column_from.value] = {
        "$gt": moment().startOf("day").toDate()
      };
      _queryDateFrom[COLUMNS.column_from.value] = {
        "$lte": date.endOf("day").toDate()
      };
      _queryDateTo[COLUMNS.column_from.value] = {
        "$gte": date.startOf("day").toDate()
      };
      _queryStatus[COLUMNS.column_status.value] = {
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
      _queryTag[HEADERS.header_badges.value] = {
        "$contains": tag
      };
      _queryStatus[COLUMNS.column_status.value] = {
        "$ne": STATUS.complete
      };
      return {
        "$and": [_queryTag, _queryStatus]
      };
    },

    text: (value, from) => {
      var _queryText, _queryDetails = {},
        _queryTags = {};
      _queryDetails[COLUMNS.column_details.value] = {
        "$regex": [value, "i"]
      };
      _queryTags[COLUMNS.column_tags.value] = {
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
        _queryStatus[COLUMNS.column_status.value] = {
          "$ne": STATUS.complete
        };
        _queryNotTime[HEADERS.header_time.value] = {
          "$eq": ""
        };
        _queryTime[HEADERS.header_time.value] = {
          "$ne": ""
        };
        _queryFuture[COLUMNS.column_from.value] = {
          "$gte": (from._isAMomentObject ? from.clone() : moment(from)).startOf("day").toDate()
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
      column.isDate && item[column.developerMetadata.metadataValue] && item[column.developerMetadata.metadataValue]._isAMomentObject ?
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

  var _archive = (year, db) => ಠ_ಠ.Google.sheets.filtered(_data.spreadsheet, ಠ_ಠ.Google_Sheets_Metadata({}, ಠ_ಠ).filter().parse(SHEETS.sheet_archive).value(year).make())
    .then(value => value && value.sheets && value.sheets.length == 1 && _.find(value.sheets[0].developerMetadata, m => m.metadataKey == SHEETS.sheet_archive.key && m.metadataValue == year) ?
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
          key: SHEETS.sheet_archive.key,
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
      var _sheet = _.find(value.sheets, sheet => _.find(sheet.developerMetadata, m => m.metadataKey == SHEETS.sheet_archive.key && m.metadataValue == year)),
        _items = (db ? db : _db).where(item => item[COLUMNS.column_from.value].year() == year),
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

  var _badges = db => _.chain((db ? db : _db).chain().data()).pluck(HEADERS.header_badges.value).flatten()
    .reduce((totals, badge) => {
      if (badge) totals[badge] = totals[badge] ? totals[badge] + 1 : 1;
      return totals;
    }, {}).pairs().sortBy(1).reverse().first(4).value();
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    regexes: {

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
        if (item[COLUMNS.column_from.value]) _year = item[COLUMNS.column_from.value].year();
        _year = _year ? _year : "N/A";
        if (!tally[_year]) tally[_year] = {
          incomplete: 0,
          complete: 0
        };
        tally[_year][item._complete || (item._timed && !item[COLUMNS.column_from.value].isAfter()) ? "complete" : "incomplete"] += 1;
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
        _.each(_.isArray(items) ? items : [items], _process);
        return Promise.resolve(items);
      },

      remove: _remove,

    },

    hash: _hash,
    
    properties: PROPERTIES,
    
    schema: SCHEMA,
    
    rows: ROWS,

  };
  /* <!-- External Visibility --> */

};