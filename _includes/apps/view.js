App = function() {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const STATE_OPENED = "opened",
    STATES = [STATE_OPENED];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _view;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _load = (file, full, complete, log, parameters) => {

    /* <!-- Start the Loader --> */
    var _busy = ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      status: "Loading Sheet",
      fn: true
    });

    return new Promise((resolve, reject) => {
      (full ? ಠ_ಠ.Google.sheets.get(file.id, true) : ಠ_ಠ.Google.sheets.get(file.id))
      .then(sheet => {
          ಠ_ಠ.Flags.log("Google Drive Sheet Opened", sheet);
          return sheet;
        })
        .catch(e => ಠ_ಠ.Flags.error("Requesting Selected Google Drive Sheet", e ? e : "No Inner Error"))
        .then(sheet => {
          if (sheet && log)
            ಠ_ಠ.Recent.add(sheet.spreadsheetId, sheet.properties.title, "#google,load." + sheet.spreadsheetId + (full ? ".full" : ".lazy"));
          return sheet;
        })
        .then(sheet => sheet && _busy({
          message: "Parsing Data"
        }) ? complete(ಠ_ಠ, sheet, parameters) : false)
        .then(result => result ? resolve(result) : _busy() && reject());
    });

  };

  var loader = (file, full) => {
    ಠ_ಠ.Router.clean(false); /* <!-- Clear the existing state --> */
    _load(file, full, ಠ_ಠ.ReadWrite, true)
      .then(view => {
        _view = view;
        ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane");
      })
      .catch(() => _view = null);
  };
  /* <!-- Internal Functions --> */

  /* <!-- Internal Modules --> */

  /* <!-- Internal Modules --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */

    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "View",
        states: STATES,
        test: () => !!(_view),
        clear: () => {
          _view.table().defaults();
          _view = null;
        },
        routes: {
          open: {
            options: () => ({
              title: "Select a Sheet to Open",
              view: "SPREADSHEETS",
              mime: ಠ_ಠ.Google.files.natives()[1],
              all: true,
              recent: true,
            }),
            success: value => loader(value.result, /FULL/i.test(value.command))
          },
          load: {
            options: () => ({
              mime: ಠ_ಠ.Google.files.natives()[1]
            }),
            success: value => loader(value.result, /FULL/i.test(value.command))
          },
          save: {
            /* <!-- TODO: Save As JSON to Google Drive --> */
          },
          headers_increment: {
            matches: [/HEADERS/i, /INCREMENT/i],
            state: STATE_OPENED,
            fn: () => _view.headers.increment()
          },
          headers_decrement: {
            matches: [/HEADERS/i, /DECREMENT/i],
            state: STATE_OPENED,
            fn: () => _view.headers.decrement()
          },
          headers_manage: {
            matches: [/HEADERS/i, /MANAGE/i],
            state: STATE_OPENED,
            fn: () => _view.headers.manage()
          },
          headers: {
            matches: /HEADERS/i,
            state: STATE_OPENED,
            fn: () => _view.headers.restore()
          },
          visibility_columns: {
            matches: [/VISIBILITY/i, /COLUMNS/i],
            state: STATE_OPENED,
            fn: () => _view.table().columns.visibility()
          },
          export_full: {
            matches: [/EXPORT/i, /FULL/i],
            state: STATE_OPENED,
            fn: () => _view.export(true)
          },
          export: {
            matches: /EXPORT/i,
            state: STATE_OPENED,
            fn: () => _view.export()
          },
          freeze_rows: {
            matches: [/FREEZE/i, /ROWS/i],
            state: STATE_OPENED,
            fn: () => _view.table().freeze(true)
          },
          freeze: {
            matches: /FREEZE/i,
            state: STATE_OPENED,
            fn: () => _view.table().freeze()
          },
          virtual_scroll: {
            matches: /VIRTUAL-SCROLL/i,
            state: STATE_OPENED,
            fn: () => _view.table().virtual_scroll()
          },
          link: {
            matches: /LINK/i,
            state: STATE_OPENED,
            fn: () => {
              var _data = _view.table().dehydrate();
              _data.i = _view.id();

              var _link = ಠ_ಠ.Flags.full("view/#google,view." + ಠ_ಠ.Strings().base64.encode(JSON.stringify(_data))),
                _clipboard;

              ಠ_ಠ.Display.modal("link", {
                id: "generate_link",
                target: ಠ_ಠ.container,
                title: "Your View Link",
                instructions: ಠ_ಠ.Display.doc.get("LINK_INSTRUCTIONS"),
                link: _link,
                qr_link: () => "https://chart.googleapis.com/chart?cht=qr&chs=540x540&choe=UTF-8&chl=" + encodeURIComponent(_link),
                details: _.escape(JSON.stringify(_data, null, 4)),
              }).then(() => {
                if (_clipboard) _clipboard.destroy();
              });

              _clipboard = new ClipboardJS("#generate_link .copy-trigger", {
                container: document.getElementById("generate_link")
              });

              ಠ_ಠ.container.find("#link_shorten").one("click.shorten", () => {
                ಠ_ಠ.Google.url.insert(_link).then(url => {
                  _link = url.id;
                  var _qr = "https://chart.googleapis.com/chart?cht=qr&chs=540x540&choe=UTF-8&chl=" + encodeURIComponent(_link);
                  ಠ_ಠ.container.find("#link_text").text(_link);
                  ಠ_ಠ.container.find("#qr_copy").attr("data-clipboard-text", _qr);
                  ಠ_ಠ.container.find("#qr_code").attr("src", _qr);
                }).catch(e => ಠ_ಠ.Flags.error("Link Shorten Failure", e ? e : "No Inner Error"));

              });

              $("#qr").on("show.bs.collapse", () => $("#details").collapse("hide"));
              $("#details").on("show.bs.collapse", () => $("#qr").collapse("hide"));
            }
          },
          defaults: {
            matches: /DEFAULTS/i,
            state: STATE_OPENED,
            fn: () => _view.table().defaults()
          },
          refresh: {
            matches: /REFRESH/i,
            state: STATE_OPENED,
            fn: () => _view.refresh()
          },
          view: {
            matches: /VIEW/i,
            fn: command => {
              /* <!-- Clear the existing state --> */
              ಠ_ಠ.Router.clean(false, STATES);

              /* <!-- Show the View --> */
              var params;
              try {
                params = JSON.parse(ಠ_ಠ.Strings().base64.decode(command));
                if (params.i) _load({
                    id: params.i
                  }, false, ಠ_ಠ.ReadOnly, false, params)
                  .then(view => (_view = view) && ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane"))
                  .catch(() => _view = null);
              } catch (e) {
                ಠ_ಠ.Flags.error("Failed to Parse View Params", e ? e : "No Inner Error");
              }
            }
          }
        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Start App after fully loaded --> */
    start: () => moment().format(),

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

  };

};