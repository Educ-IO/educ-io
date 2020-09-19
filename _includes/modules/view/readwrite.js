ReadWrite = (ಠ_ಠ, sheet) => {
  "use strict";

  /* <!-- MODULE: Provides a readwrite view (e.g. to filter data and generate a link) --> */
  /* <!-- PARAMETERS: Receives the global app context, the Google sheet (with or without data) --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Grid, Datatable, Google, Headers --> */

  /* <!-- Internal Constants --> */
  const DB = new loki("view.db"),
        SAFE_NAMES = {
          "\\": "",
          "/": " ",
          "?": "",
          "*": "",
          "[": "",
          "]": ""
        };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _grids = {},
    /* <!-- Interpreted Sheet Data, indexed by Sheet/Tab Name --> */
    _sources = {},
    /* <!-- Processed Sheets, indexed by Sheet/Tab Name --> */
    _tables = {},
    /* <!-- Filterable and sortable tables used for display --> */
    _current = { /* <!-- Currently visible data --> */
      table: () => _tables[Object.keys(_tables).filter(key => _tables[key].active())[0]],
      grid: () => _grids[Object.keys(_tables).filter(key => _tables[key].active())[0]],
      source: () => _sources[Object.keys(_tables).filter(key => _tables[key].active())[0]]
    },
    _exportTypes = {
      csv: {
        name: "csv",
        type: "csv",
        ext: ".csv",
        size: "single",
        desc: "Comma Separated Value Format",
        mime: "text/csv"
      },
      dif: {
        name: "dif",
        type: "dif",
        ext: ".dif",
        size: "single",
        desc: "Data Interchange Format (DIF)",
        mime: "application/x-dif"
      },
      fods: {
        name: "fods",
        type: "fods",
        ext: ".fods",
        size: "multi",
        desc: "Flat OpenDocument Spreadsheet Format",
        mime: "application/vnd.oasis.opendocument.spreadsheet"
      },
      html: {
        name: "html",
        type: "html",
        ext: ".html",
        size: "single",
        desc: "HTML Document",
        mime: "text/html"
      },
      md: {
        name: "md",
        type: "md",
        ext: ".md",
        size: "single",
        desc: "Markdown Table",
        mime: "text/markdown"
      },
      ods: {
        name: "ods",
        type: "ods",
        ext: ".ods",
        size: "multi",
        desc: "OpenDocument Spreadsheet Format",
        mime: "application/vnd.oasis.opendocument.spreadsheet"
      },
      prn: {
        name: "prn",
        type: "prn",
        ext: ".prn",
        size: "single",
        desc: "Lotus Formatted Text",
        mime: "application/x-prn"
      },
      sylk: {
        name: "sylk",
        type: "sylk",
        ext: ".sylk",
        size: "single",
        desc: "Symbolic Link (SYLK) File",
        mime: "application/excel"
      },
      txt: {
        name: "txt",
        type: "txt",
        ext: ".txt",
        size: "single",
        desc: "UTF-16 Unicode Text File",
        mime: "text/plain"
      },
      modern_xlsx: {
        name: "xlsx",
        type: "xlsx_2016",
        ext: ".xlsx",
        size: "multi",
        desc: "Excel 2016+ Format",
        mime: "application/vnd.ms-excel"
      },
      encrypted_xlsx: {
        name: "xlsx",
        type: "xlsx_2016",
        ext: ".xlsx",
        size: "multi",
        password: true,
        desc: "Excel 2016+ Encrypted / Password-Protected Format",
        mime: "application/vnd.ms-excel"
      },
      xlsb: {
        name: "xlsb",
        type: "xlsb",
        ext: ".xlsb",
        size: "multi",
        desc: "Excel 2007+ Binary Format",
        mime: "application/vnd.ms-excel"
      },
      xlsm: {
        name: "xlsm",
        type: "xlsm",
        ext: ".xlsm",
        size: "multi",
        desc: "Excel 2007+ Macro XML Format",
        mime: "application/vnd.ms-excel"
      },
      xlsx: {
        name: "xlsx",
        type: "xlsx",
        ext: ".xlsx",
        size: "multi",
        desc: "Excel 2007+ XML Format",
        mime: "application/vnd.ms-excel"
      },
      xlml: {
        name: "xlml",
        type: "xlml",
        ext: ".xls",
        size: "multi",
        desc: "Excel 2003-2004 (SpreadsheetML) Format",
        mime: "application/vnd.ms-excel"
      },
      xls_8: {
        name: "xls",
        type: "biff8",
        ext: ".xls",
        size: "multi",
        desc: "Excel 97-2004 Workbook Format",
        mime: "application/vnd.ms-excel"
      },
      xls_5: {
        name: "xls",
        type: "biff5",
        ext: ".xls",
        size: "multi",
        desc: "Excel 5.0/95 Workbook Format",
        mime: "application/vnd.ms-excel"
      },
      xls_2: {
        name: "xls",
        type: "biff2",
        ext: ".xls",
        size: "single",
        desc: "Excel 2.0 Worksheet Format",
        mime: "application/vnd.ms-excel"
      },
    };
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _display = value => {

    if (!value) return;

    ಠ_ಠ.Flags.log(`Google Sheet Values [${value.name}]`, value.data);

    var _grid = (_grids[value.name] = ಠ_ಠ.Grid(ಠ_ಠ, value.data.slice(0), value));

    /* <!-- Create Headers Object --> */
    var dates = _grid.dates(),
      blanks = _grid.blanks(),
      headers = _.map(_grid.headers(), (v, i) => ({
        index: i,
        name: v ? v : `-${i}-`,
        hide: function(initial) {
          return !!(this.hide_now || this.hide_always || (initial && this.hide_initially));
        },
        set_hide: function(now, always, initially) {
          this.hide_now = now;
          this.hide_always = always;
          this.hide_initially = initially;
        },
        hide_now: false,
        hide_always: blanks.indexOf(i) >= 0 ? true : false,
        hide_initially: !!value.hide[i],
        hide_default: false,
        icons: dates.indexOf(i) >= 0 ? ["access_time"] : null
      }));

    var table = DB.getCollection(value.name);
    table ? table.clear() : table = DB.addCollection(value.name, {
      indices: _grid.fields(),
      serializableIndices: false
    });
    table.insert(_grid.values());

    _tables[value.name] = ಠ_ಠ.Datatable(ಠ_ಠ, {
      id: value.index,
      name: value.name,
      headers: headers,
      data: table,
    }, {
      classes: ["table-hover"],
      widths: value.widths,
      frozen: _grid.frozen(),
      header_rows: _grid.header_rows,
      hide_rows: _grid.hide_rows,
      advanced: true,
      collapsed: true,
      visibilities: {
        visible: {
          name: "Visible",
          desc: "Show this column"
        },
        now: {
          name: "Hide Now",
          desc: "Hide this column",
          menu: true
        },
        always: {
          name: "Hide Always",
          desc: "Just hide this column on the view that you create",
          menu: true
        },
        initially: {
          name: "Hide Initially",
          desc: "Just hide this column on the view, but allow it to be un-hidden",
          menu: true
        }
      }
    }, value.target);

    return true;
  };

  var _load = (sheet, name, index, target) => {

    var _sheet = sheet.sheets[index];

    /* <!-- Clean Up CSS etc --> */
    if (_tables[name]) _tables[name].defaults();

    /* <!-- ARRAY OF: {startRowIndex: 0, endRowIndex: 1, startColumnIndex: 1, endColumnIndex: 3} --> */
    ಠ_ಠ.Flags.log(`Google Sheet Merges [${name}]`, _sheet.merges);

    /* <!-- Get Value Functions --> */
    var _process = () => {

        var _data = _sheet.data[0];
        var _fontSizes = Array(_data.columnMetadata.length).fill(sheet.properties.defaultFormat.textFormat.fontSize);
        var _rows = _.compact(_data.rowData.map(r => r && r.values ? r.values.map((c, i) => {
          if (c.effectiveFormat) _fontSizes[i] = Math.max(_fontSizes[i], c.effectiveFormat.textFormat.fontSize);
          return c.formattedValue === undefined ? null : c.formattedValue;
        }) : null));

        return Promise.resolve({
          data: _rows.clean(false, true).trim(_rows[0].length),
          widths: _data.columnMetadata.map((c, i) => (c.pixelSize / _fontSizes[i]) * parseFloat(getComputedStyle(document.documentElement).fontSize)),
          hide: _data.columnMetadata.map(c => !!c.hiddenByUser)
        });

      },
      _fetch = id => {
        var _busy = ಠ_ಠ.Display.busy({
          clear: true
        }).busy({
          target: target,
          fn: true,
          status: "Loading Data"
        });
        return ಠ_ಠ.Google.sheets.get(id, true, `${name}!A:ZZ`)
          .then(data => (_sheet.data = data.sheets[0].data))
          .then(sheet => {
            _busy();
            return sheet;
          });
      };

    /* <!-- Initiatilise Sheet & Protect Jump Links --> */
    ((_sheet.data && _sheet.data.length === 1) ? _process() : _fetch(sheet.spreadsheetId).then(_process))
    .then(value => _.defaults(value, {
        data: [],
        name: name,
        index: index,
        target: target,
        sheet: _sheet,
        sheets: sheet,
        widths: [],
        hide: []
      }))
      .then(value => (_sources[name] = value))
      .then(_display)
      .then(() => ಠ_ಠ.Display.state().enter("opened").protect("a.jump").on("JUMP"));

  };

  var _export = (full, all) => {

    var _error = e => e ? ಠ_ಠ.Flags.error("Google Sheet Export", e) : ಠ_ಠ.Flags.log("Google Sheet Export Cancelled");

    var _exportSheet = option => {

      ಠ_ಠ.Flags.log("Google Sheet Export using option:", option);

      /* <!-- Trigger Loader --> */
      var _clipboard, _content = $(".tab-content"),
        _id = _content.data("id"),
        _title = _content.data("name"),
        _busy = ಠ_ಠ.Display.busy({
          target: $("div.tab-content div.tab-pane.active"),
          status: "Exporting Data",
          fn: true
        }),
        _save = (name, data, type) => {
          var _complete;
          return (option.destination == "download" ?
            ಠ_ಠ.Saver({}, ಠ_ಠ).save(data, name, type ? type : "application/octet-stream") :
            ಠ_ಠ.Google.files.upload({
              name: name
            }, data, type, null, null, true)
            .then(file => option.destination.indexOf("linkshare") > 0 ?
              ಠ_ಠ.Google.permissions.share(file.id).anyone("reader").then(() => file) :
              Promise.resolve(file))
            .then(file => _complete = () => ಠ_ಠ.Display.inform({
              id: "show_File",
              target: ಠ_ಠ.container,
              content: ಠ_ಠ.Display.template.get("uploaded")({
                message: ಠ_ಠ.Display.doc.get("UPLOADED_DETAILS"),
                files: [file]
              })
            }, dialog => {
              dialog.find("#link_copy").attr("data-clipboard-text", file.webViewLink);
              if (window.ClipboardJS) _clipboard = new window.ClipboardJS(".copy-trigger", {
                container: dialog[0]
              });
            }).then(() => {
              if (_clipboard) _clipboard.destroy();
            }))
          ).catch(_error).then(_busy).then(() => _complete ? _complete() : true);
        };

      if (option.type == "md") {

        var _md_table = _current.table(),
          _md_name = _md_table.name();
        var _md_values = _md_table.values(!full);

        var _md_output = "|---\n";
        if (_md_values && _md_values.length > 0) {

          /* <!-- Output Header Row --> */
          var _md_headers = _md_values.shift();
          _md_output += (_.reduce(_md_headers, (row, value, index) => row + (index > 0 ? " | " + value : value), "") + "\n");
          /* <!-- Output Separator Row --> */
          _md_output += (_.times(_md_headers.length, () => "|:-").join("") + "\n");
          if (_md_values.length > 0) {
            _md_output += _.map(_md_values, values => _.reduce(values, (row, value, index) => row + (index > 0 ? " | " + value : value), "")).join("\n");
          }

        }

        _save(`${_title} - ${_md_name}${option.ext}`, _md_output, option.mime);

      } else {

        var _initialise, _book, _sheet, _output;

        if (option.type == "xlsx_2016") {

          var _written = false;

          _initialise = XlsxPopulate.fromBlankAsync;

          _sheet = (name, data) => {

            var _rows = data && data.length ? data.length : 0,
              _columns = data && data.length ? data[0].length : 0;

            var _get = () => {
              if (!_written) {
                _written = true;
                return _book.sheets()[0].name(name);
              } else {
                return _book.addSheet(name);
              }
            };

            _get().range(1, 1, _rows + 1, _columns + 1).value(data);

          };

          _output = () => _book.outputAsync(
            option.password && option.pw ? {
              type: "blob",
              password: option.pw
            } : "blob"
          );

        } else {

          _initialise = () => new Promise(resolve => {
            var Workbook = function() {
              if (!(this instanceof Workbook)) return new Workbook();
              this.SheetNames = [];
              this.Sheets = {};
            };
            resolve(new Workbook());
          });

          _sheet = (name, data) => {
            _book.SheetNames.push(name);
            _book.Sheets[name] = XLSX.utils.aoa_to_sheet(data);
          };

          _output = () => new Promise(resolve => {
            resolve(XLSX.write(_book, {
              bookType: option.type,
              bookSST: true,
              type: "binary"
            }));
          });

        }

        _initialise().then(book => {

          _book = book;

          if (option.all && option.size == "multi") {

            /* <!-- Get all tabs --> */
            var _tabs = _content.children("div.tab-pane"),
              _index = 0,
              _total = _tabs.length;

            _tabs.each((i, el) => {
              var _name = String($(el).data("name"));
              var _get = !_tables[_name] ?
                new Promise(resolve =>
                  ಠ_ಠ.Google.sheets.values(_id, _name + "!A:ZZ").then(data => resolve(data.values))) :
                new Promise(resolve => resolve(_tables[_name].values(!full)));

              _get.then(data => {
                if (data && data.length > 0) _sheet(RegExp.replaceChars(_name, SAFE_NAMES), data);
                if (_total == ++_index) _output().then(data => _save(`${_title}${option.ext}`, data, option.mime));
              });

            });

          } else {

            var _table = _current.table(),
              _name = RegExp.replaceChars(_table.name(), SAFE_NAMES),
              _values = _table.values(!full);
            _sheet(_name, _values && _values.length > 0 ? _values : []);
            _output().then(data => _save(`${_title} - ${_name}${option.ext}`, data, option.mime));

          }

        });

      }

    };

    var _chooseDestination = option => ಠ_ಠ.Display.choose({
        id: "view_export_output",
        title: "Where would you like to export to ...",
        instructions: ಠ_ಠ.Display.doc.get("EXPORT_DESTINATION"),
        action: "Export",
        choices: {
          download: {
            name: "Download",
            type: "download"
          },
          drive: {
            name: "Google Drive",
            type: "upload"
          },
          drive_share: {
            name: "Google Drive (shared by link)",
            type: "upload_linkshare"
          }
        }
      })
      .then(chosen => _.tap(option, option => option.destination = chosen.type));

    var _chooseSize = option => ಠ_ಠ.Display.choose({
        id: "view_export_size",
        title: "Which Tabs would you like to export ...",
        instructions: ಠ_ಠ.Display.doc.get({
          name: "EXPORT_SIZE",
          content: option.desc
        }),
        action: "Export",
        choices: {
          all: {
            name: "All Tabs",
            all: true
          },
          single: {
            name: "Current Tab",
            desc: _current.table().name(),
            all: false,
          }
        }
      })
      .then(chosen => _.tap(option, option => option.all = chosen.all));

    var _enterPassword = option => ಠ_ಠ.Display.text({
        message: ಠ_ಠ.Display.doc.get("PASSWORD_INSTRUCTIONS"),
        action: "Encrypt",
        password: true,
      })
      .then(password => _.tap(option, option => option.pw = password));

    var _chooseFormat = () => ಠ_ಠ.Display.choose({
        id: "view_export_format",
        title: "Please Select a Format to Export to ...",
        instructions: ಠ_ಠ.Display.doc.get({
          name: "EXPORT_FORMATS",
          content: full ? "original" : "filtered",
        }),
        desc: "Available Formats:",
        action: "Export",
        choices: _exportTypes
      })
      .then(option => !option ? false :
        (option.password ? _enterPassword(option) : Promise.resolve(option))
        .then(option => !all && option.size == "multi" ?
          _chooseSize(option).then(_chooseDestination).then(_exportSheet) :
          _chooseDestination(_.extend(option, {
            all: all
          })).then(_exportSheet)))
      .catch(_error);

    _chooseFormat();

  };

  var _start = sheet => {

    var _data = {
      tabs: sheet.sheets.map((v, i) => ({
        id: i,
        name: v.properties.title,
        actions_current_only: true,
        actions: {
          headers: {
            url: "#headers.manage",
            name: "Headers",
            desc: "Manage the headers",
          },
          increment: {
            url: "#headers.increment",
            icon: "vertical_align_bottom",
            name: "Increase",
            desc: "Increase Headers by one Row"
          },
          decrement: {
            url: "#headers.decrement",
            icon: "vertical_align_top",
            name: "Decrease",
            desc: "Decrease Headers by one Row",
          },
          restore: {
            url: "#headers.restore",
            icon: "undo",
            name: "Restore",
            desc: "Restore Original Headers",
          }
        }
      }))
    };

    var _tabs = ಠ_ಠ.Display.template.show({
      template: "tab-list",
      class: "pt-2",
      id: sheet.spreadsheetId,
      name: sheet.properties.title,
      nav: "sheet_tabs",
      links: ಠ_ಠ.Display.template.get("tab-links")(_data),
      tabs: ಠ_ಠ.Display.template.get("tab-tabs")(_data),
      target: ಠ_ಠ.container,
      clear: true
    });

    /* <!-- Set Load Tab Handler & Load Initial Values --> */
    _tabs.find("a.nav-link").on("click", e => $(e.target).data("refresh", e.shiftKey)).on("show.bs.tab", e => {
      var tab = $(e.target),
        target = $(tab.data("target"));
      if (target.children().length === 0 || tab.data("refresh")) _load(sheet, tab.data("name"), tab.data("index"), target.empty());
      tab.closest(".nav-item").addClass("order-1").siblings(".order-1").removeClass("order-1");
    }).first().tab("show");

  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */
  _start(sheet);

  /* <!-- External Visibility --> */
  return {

    id: () => sheet.spreadsheetId,

    export: (full, all) => _export(full, all),

    table: () => _current.table(),

    refresh: () => {
      var target = $("div.tab-pane.active");
      _load(sheet, target.data("name"), target.data("index"), target.empty());
    },

    headers: {

      decrement: value => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).update(0 - (value ? value : 1)).then(_display),

      increment: value => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).update(value ? value : 1).then(_display),

      restore: () => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).update().then(_display),

      manage: () => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).manage().then(_display),

    },

  };
  /* <!-- External Visibility --> */

};