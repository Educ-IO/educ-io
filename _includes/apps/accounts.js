App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const STATE_READY = "ready",
    STATE_OPENED = "opened",
    STATES = [STATE_READY, STATE_OPENED];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _credentials, _showdown;
  var _config, _tasks, _start;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var loader = (file, log) => {

    ಠ_ಠ.Router.clean(false); /* <!-- Clear the existing state --> */
    var _sheet;

    return ಠ_ಠ.Google.sheets.get(file.id, true)
      .then(sheet => {
        ಠ_ಠ.Flags.log("Google Drive Sheet Opened", sheet);
        return sheet;
      })
      .then(sheet => {
        if (sheet && log) ಠ_ಠ.Recent.add(sheet.spreadsheetId,
          sheet.properties.title, `#google,load.${sheet.spreadsheetId}`);
        return (_sheet = sheet);
      })
      .catch(e => ಠ_ಠ.Flags.error("Loading Google Sheet", e ? e : "No Inner Error"))
      .then(ಠ_ಠ.Display.busy({
        target: ಠ_ಠ.container,
        status: "Loading Sheet",
        fn: true
      }))
      .then(() => _sheet);

  };
  /* <!-- Internal Functions --> */

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
        name: "Accounts",
        states: STATES,
        recent: true,
        test: () => ಠ_ಠ.Display.state().in(STATE_OPENED),
        clear: () => true,
        routes: {
          open: {
            options: () => ({
              title: "Select an Accounts Sheet to Open",
              view: "SPREADSHEETS",
              mime: ಠ_ಠ.Google.files.natives()[1],
              properties: {
                ACCOUNTS: "DATA"
              },
              all: true,
              recent: true,
            }),
            success: value => loader(value.result, true)
          },
          close: {
            keys: ["c", "C"],
          },
          load: {
            options: () => ({
              mime: ಠ_ಠ.Google.files.natives()[1],
              properties: {
                ACCOUNTS: "DATA"
              },
            }),
            success: value => loader(value.result, true)
          },
          create: () => {

            /* <!-- TODO: Check this logical order actually works! --> */
            var _finish;
            _config.clear()
              .then(() => _tasks.create())
              .then(id => _config.create(id))
              .then(() => _start(_config.config, _finish))
              .then(_finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                status: "Creating DB",
                fn: true
              }));
          },
        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Start App after fully loaded --> */
    start: () => {

      /* <!-- Setup Moment --> */
      moment().format();
      var locale = window.navigator.userLanguage || window.navigator.language;
      if (locale) moment.locale(locale);

      /* <!-- Setup Showdown --> */
      _showdown = new showdown.Converter({
        strikethrough: true
      });

      /* <!-- Create Credentials Reference --> */
      _credentials = ಠ_ಠ.Credentials(ಠ_ಠ);

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    credentials: _credentials,

    showdown: _showdown,



  };

};