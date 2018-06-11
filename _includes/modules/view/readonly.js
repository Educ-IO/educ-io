ReadOnly = (ಠ_ಠ, sheet, parameters) => {
  "use strict";
  /* <!-- MODULE: Provides a readonly view (e.g. from a link) --> */
  /* <!-- PARAMETERS: Receives the global app context, the Google sheet (with or without data) and decoded link parameters --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Datatable, Google --> */

  /* <!-- Internal Constants --> */
  const DB = new loki("temp.db");
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _table;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _display = (data, target) => {

    var headers = [];
    if (parameters.z > 0) data.splice(0, parameters.z);
    while (parameters.r-- > 0) headers = data.shift().map((v, i) => v ? (headers[i] ? `${headers[i]} / ${v}` : v) : headers[i]);
    if (parameters.c && headers.length === 0) headers = Array.apply(null, {
      length: parameters.c
    });

    headers = _.map(headers, (v, i) => {
      /* <!-- NOTE: Match on Name, Position for backward compatibility (which is more important as columns could be added / removed / renamed?) --> */
      var n = v ? v : `-${i}-`,
        h = _.find(parameters.h, h => (_.isString(h.n) && h.n == n) || (_.isNumber(h.p) && h.p === i));
      if (h === undefined) h = false;
      return {
        name: n,
        hide: function() {
          return !!(this.hide_default || this.hide_now);
        },
        hide_default: h && h.h,
        hide_now: h && h.h,
        hide_initially: h && h.i,
      };
    });

    var length = 0,
      values = _.map(data, v => {
        length = Math.max(length, v.length);
        /* <!-- NOTE: Data could be a jagged array, so bulk out arrays if required --> */
        if (parameters.c && v.length < parameters.c) v = v.concat(Array.apply(null, {
          length: parameters.c - v.length
        }));
        return Object.assign({}, v);
      }),
      fields = Array.apply(null, {
        length: parameters.c || length
      }).map(Number.call, Number);

    var _db = DB.addCollection(parameters.n, {
      indices: fields
    });
    _db.insert(values);

    _table = ಠ_ಠ.Datatable(ಠ_ಠ, {
      id: "view",
      name: name,
      headers: headers,
      data: _db
    }, {
      readonly: true,
      filters: parameters.f,
      inverted_Filters: parameters.e,
      sorts: parameters.s,
      collapsed: true,
      advanced: true,
    }, target);

  };

  var _fetch = (sheet, target) => {
    var _busy = ಠ_ಠ.Display.busy({
      clear: true
    }).busy({
      target: target,
      fn: true,
      status: "Loading Data"
    });

    return ಠ_ಠ.Google.sheets.values(sheet.spreadsheetId, `${parameters.n}!A:ZZ`)
      .then(data => {
        ಠ_ಠ.Flags.log(`Google Sheet Values [${parameters.n}]`, data.values);
        return _.extend(sheet, {
          data: data
        });
      })
      .then(sheet => {
        _busy();
        return sheet;
      });
  };

  var _start = (sheet, target) => {

    ((sheet.data && sheet.data.length == 1) ?
      Promise.resolve(sheet) : _fetch(sheet, target))
    .then(sheet => _display(sheet.data.values, target))
      .catch(err => ಠ_ಠ.Flags.error("Adding Content Table", err));

  };

  _start(sheet, $("<div />", {
    class: "container-fluid tab-pane px-1 py-1 mt-2"
  }).appendTo(ಠ_ಠ.container.empty()));

  /* <!-- External Visibility --> */
  return {

    id: () => parameters.i,

    table: () => _table,

  };
  /* <!-- External Visibility --> */
};