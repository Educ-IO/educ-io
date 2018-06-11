Google_Sheets_Metadata = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Metadata --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.sheet: ID of the sheet to target (tab ID, not spreadsheet ID)  --> */
  /* <!-- @options.visibility: Metadata visibility (if none supplied in the function call, defaults to DOCUMENT) --> */
  /* <!-- @factory.Google_Sheets_Grid: Function to create a grid helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* === Internal Visibility === */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    sheet: 0,
    visibility: "DOCUMENT"
  };
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _dimension = factory.Google_Sheets_Grid(options).dimension;

  var _meta = meta => ({
    "metadataKey": meta.key,
    "metadataValue": meta.value,
    "visibility": meta.visibility ? meta.visibility : options.visibility
  });

  var _location = (dimension, start, end) => ({
    "dimensionRange": _dimension(dimension, start, end)
  });

  var _create = (dimension, start, end, meta) => ({
    developerMetadata: _.extend(_meta(meta), {
      location: _location(dimension, start, end)
    })
  });
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    columns: (start, end) => ({

      tag: meta => _create("COLUMNS", start, end, meta),

    }),

    create: _create,

    filter: () => {

      var _type, _location, _strategy, _id, _key, _value, _visibility = options.visibility;

      return {

        make: () => {

          var _return = {};

          if (_type &&
            (_strategy || _strategy != "EXACT") &&
            (_type != "SPREADSHEET" || !_strategy || _strategy != "INTERSECTING"))
            _return.locationType = _type;
          if (_strategy) _return.locationMatchingStrategy = _strategy;
          if (_id) _return.metadataId = _id;
          if (_key) _return.metadataKey = _key;
          if (_value) _return.metadataValue = _value;
          if (_visibility) _return.visibility = _visibility;
          if (_location) _return.metadataLocation = _location;

          return {
            developerMetadataLookup: _return
          };

        },

        /* <!-- ENUM: *DEVELOPER_METADATA_LOCATION_TYPE_UNSPECIFIED*, ROW, COLUMN, SHEET, SPREADSHEET --> */
        /* <!-- SEE: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.developerMetadata#DeveloperMetadata.DeveloperMetadataLocationType --> */
        type: function(type) {
          _type = type ? type : null;
          return this;
        },

        location: function(location) {
          _location = location ? location : null;
          return this;
        },

        /* <!-- ENUM: *DEVELOPER_METADATA_LOCATION_MATCHING_STRATEGY_UNSPECIFIED*, EXACT_LOCATION, INTERSECTING_LOCATION --> */
        /* <!-- SEE: https://developers.google.com/sheets/api/reference/rest/v4/DataFilter#DeveloperMetadataLocationMatchingStrategy --> */
        strategy: function(strategy) {
          _strategy = strategy ? strategy : null;
          return this;
        },

        id: function(id) {
          _id = (id !== null && id !== undefined) ? id : null;
          return this;
        },

        key: function(key) {
          _key = (key !== null && key !== undefined) ? key : null;
          return this;
        },

        value: function(value) {
          _value = (value !== null && value !== undefined) ? value : null;
          return this;
        },

        visibility: function(visibility) {
          _visibility = visibility ? visibility : null;
          return this;
        },

        specific: function(key, value) {
          this.key(key);
          this.value(value);
          return this;
        },

        parse: function(value) {
          value = value ? value : {};
          _.each(["type", "location", "strategy", "id", "key", "value", "visibility"], prop => {
            if (value[prop]) this[prop](value[prop]);
          }, this);
          return this;
        },

      };

    },

    location: {

      columns: (start, end) => _location("COLUMNS", start, end),

      rows: (start, end) => _location("ROWS", start, end),

      spreadsheet: () => ({
        spreadsheet: true,
      }),

      sheet: id => ({
        sheetId: id,
      }),

    },

    rows: (start, end) => ({

      tag: meta => _create("ROWS", start, end, meta),

    }),

  };
  /* === External Visibility === */
};