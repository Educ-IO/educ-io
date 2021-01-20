App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const FN = {};

  const TYPE = "application/x.educ-io.folders-";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _resize = () => {

    var _css = ಠ_ಠ.Css("folders");
    var _style = _css.sheet("resizer");

    /* <!-- Handle Screen / Window Resize Events --> */
    var _resizer = () => {
      var _h = 0;
      $("#site_nav, #paths, #folder_tabs").each(function() {
        _h += $(this).outerHeight(true);
      });
      _css.removeRule(_style, "div.tab-pane")
        .addRule(_style, "div.tab-pane", "max-height: " + ($(window).height() - _h - 20) + "px !important;");
    };
    var _resize_Timeout = 0;
    $(window).off("resize").on("resize", () => {
      clearTimeout(_resize_Timeout);
      _resize_Timeout = setTimeout(_resize, 50);
    });
    _resizer();

  };

  var _showPath = (path, target) => {
    ಠ_ಠ.Display.template.show({
      template: "breadcrumbs",
      id: "paths",
      class: "mb-0 px-3 py-2",
      items: (path && path.length > 1) ? path : null,
      target: target,
      clear: true,
    });
  };

  var _openFolder = (folder, log, teamDrive, state, resolve, reject) => {

    folder.url = "#google,load." + (folder.team ? "team." : "") + folder.id + (teamDrive ? "." + teamDrive : "");

    if (!ರ‿ರ.folder || !ರ‿ರ.path) {

      /* <!-- Root Folder --> */
      ರ‿ರ.path = [folder];

    } else if (folder.parents && folder.parents.indexOf(ರ‿ರ.folder.id()) >= 0) {

      /* <!-- Child of the current Folder --> */
      ರ‿ರ.path.push(folder);

    } else {

      /* <!-- Check if it's in the paths already --> */
      var _existing = _.findIndex(ರ‿ರ.path, p => p.id === folder.id) + 1;
      if (_existing > 0) {

        /* <!-- Existing in Current Path, so splice back to it --> */
        ರ‿ರ.path.splice(_existing, ರ‿ರ.path.length - _existing);

      } else {

        /* <!-- Start a new Path --> */
        ರ‿ರ.path = [folder];

      }

    }

    _showPath(ರ‿ರ.path, ಠ_ಠ.container);
    ರ‿ರ.folder = ಠ_ಠ.Folder(ಠ_ಠ, folder, ಠ_ಠ.container, teamDrive, state,
      ರ‿ರ.folder ? ರ‿ರ.folder.tally.get() : null, resolve, reject);
    if (log) ಠ_ಠ.Recent.add(folder.id, folder.name, folder.url).then(() => _resize());
    ಠ_ಠ.Display.state().enter(FN.states.opened.in);

  };

  var _load = (loader, rootTeamDrive, log, teamDrive, state, tags) => new Promise((resolve, reject) => {

    loader.catch(e => ಠ_ಠ.Flags.error("File / Folder Load Failure", e))
      .then(ಠ_ಠ.Main.busy())
      .then(file => {

        var _task = () => { /* <!-- This is a folders file to load and read/action --> */

            ಠ_ಠ.Google.download(file.id).then(loaded => {
              ಠ_ಠ.Google.reader().promiseAsText(loaded).then(parsed => {
                ಠ_ಠ.Flags.log(`Loaded Folders File [${file.mimeType}]: ${parsed}`);
                parsed = JSON.parse(parsed);
                if (parsed && parsed.folder) {
                  _load(Promise.resolve(parsed.folder), !!parsed.folder.team, false, parsed.folder.team, parsed.state)
                    .then(result => resolve(result))
                    .catch(e => reject(e));
                } else {
                  reject();
                }

              }).catch(e => reject(e));
            }).catch(e => reject(e));

          },
          _folder = () => { /* <!-- This is a folder to display --> */

            teamDrive = file.teamDriveId ? file.teamDriveId : teamDrive;
            file.team = !!(rootTeamDrive || file.id == teamDrive);
            _openFolder(file, log, teamDrive, state, resolve, reject);

          },
          _file = () => { /* <!-- File, open parent & process extra instructions via a complete method --> */

            if (file.parents && file.parents.length > 0)
              return ಠ_ಠ.Google.files.get(file.parents[0], teamDrive).then(folder => {
                _openFolder(folder, log, teamDrive, state, response => {
                  if (tags && _.isArray(tags))
                    ರ‿ರ.folder.tag(file.id, tags[0], tags.length > 1 ? tags[1] : "");
                  resolve(response);
                }, reject);
              });

          };

        file ? ಠ_ಠ.Flags.log(`Loaded: ${JSON.stringify(file)}`) &&
          ಠ_ಠ.Google.files.in(TYPE)(file) ? _task() :
          file.kind == "drive#teamDrive" || ಠ_ಠ.Google.folders.check(true)(file) ?
          _folder() : _file() : false;

      });

  });

  var _loadFolder = (id, log, teamDrive, tags) => id ?
    _load(ಠ_ಠ.Google.files.get(id, teamDrive ? teamDrive : true), false, log, teamDrive, null, tags) :
    Promise.reject();

  var _loadTeamDrive = (id, log) => id ? _load(ಠ_ಠ.Google.teamDrives.get(id), true, log) : Promise.reject();

  var _openTeamDrive = () => {

    ಠ_ಠ.Google.teamDrives.list()
      .catch(e => ಠ_ಠ.Flags.error("Team Drive Load Failure", e))
      .then(ಠ_ಠ.Main.busy())
      .then(drives => drives ? ಠ_ಠ.Display.choose({
        id: "folders_teamDrives",
        title: "Please Choose a Team Drive to Open ...",
        action: drives && drives.length > 0 ? "Open" : false,
        choices: _.map(drives, drive => ({
          id: drive.id,
          name: drive.name
        })),
        instructions: !drives || drives.length === 0 ? ಠ_ಠ.Display.doc.get("NO_TEAM_DRIVES") : ""
      }) : false)
      .then(option => option ? _openFolder(option, option.team = true) : false)
      .catch(e => e ? ಠ_ಠ.Flags.error("Team Drive Select:", e) :
        ಠ_ಠ.Flags.log("Team Drive Select Cancelled"));

  };
  /* <!-- Internal Functions --> */

  /* <!-- Setup Functions --> */
  FN.setup = {

    /* <!-- Setup required for everything --> */
    now: () => {

      /* <!-- Set Up / Create the States and Files Module --> */
      FN.states = ಠ_ಠ.States(ಠ_ಠ);
      /* <!-- Set Up / Create the Function Modules --> */

    },

    /* <!-- Start App after fully loaded (but BEFORE routing) --> */
    initial: () => {

      ಠ_ಠ.Flags.log("APP Start Called", "Initial");

      /* <!-- Setup Helpers --> */
      _.each([{
        name: "Strings"
      }, {
        name: "Notify",
        options: {
          id: "folders_Notify",
          autohide: true,
        }
      }, {
        name: "Exporter",
        options: {
          state: {
            application: ಱ
          }
        }
      }], helper => ಱ[helper.name.toLowerCase()] = ಠ_ಠ[helper.name](helper.options || null, ಠ_ಠ));

      /* <!-- Setup Function Modules --> */
      var _options = {
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
      _.each([], module => FN[module.toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ));

    },

    /* <!-- App is ready for action! --> */
    session: () => {

      ಠ_ಠ.Flags.log("App is now READY", "Session");

    },

    routed: () => {

      ಠ_ಠ.Flags.log("Router is Started", "Routed");

    },

  };
  /* <!-- Setup Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      /* <!-- Initial Setup Call --> */
      FN.setup.now();

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Folders",
        state: ರ‿ರ,
        states: FN.states.all,
        start: FN.setup.routed,
        routes: {
          open_root: { /* <!-- Pick, or Load the Root Folder --> */
            keys: ["o", "O"],
            matches: [/OPEN/i, /ROOT/i],
            fn: () => _loadFolder("root", false)
          },
          open_team: {
            matches: [/OPEN/i, /TEAM/i],
            fn: _openTeamDrive
          },
          open: {
            options: () => ({
              title: "Select a Folder to Open",
              view: "FOLDERS",
              folders: true,
              recent: true,
              mime: ಠ_ಠ.Google.folders.native()
            }),
            success: value => _openFolder(value.result, true),
          },
          close: {
            keys: ["c", "C"],
          },
          close_results: {
            matches: [/CLOSE/i, /RESULTS/i],
            state: FN.states.searched.in,
            fn: () => {
              ಠ_ಠ.Display.state().exit([FN.states.searched.in]);
              if (ರ‿ರ.folder) ರ‿ರ.folder.close();
            }
          },
          remove_list: {
            matches: [/REMOVE/i, /LIST/i],
            state: FN.states.opened.in,
            length: 1,
            fn: command => ರ‿ರ.folder.remove(command)
          },
          remove_tag: {
            matches: [/REMOVE/i, /TAG/i],
            state: FN.states.opened.in,
            length: 2,
            fn: command => ರ‿ರ.folder.detag(command[0], command[1])
          },
          remove_tab: {
            matches: [/REMOVE/i, /TAB/i],
            state: FN.states.opened.in,
            length: 1,
            fn: command => ರ‿ರ.folder.close(command)
          },
          info: {
            matches: /INFO/i,
            state: FN.states.opened.in,
            keys: "i",
            fn: command => ರ‿ರ.folder.info(command),
          },
          tally: {
            matches: /TALLY/i,
            state: FN.states.opened.in,
            keys: "t",
            fn: command => ರ‿ರ.folder.tally.run(command),
          },
          convert: {
            matches: /CONVERT/i,
            state: FN.states.opened.in,
            fn: command => ರ‿ರ.folder.convert(command),
          },
          tag: {
            matches: /TAG/i,
            state: FN.states.opened.in,
            fn: command => ರ‿ರ.folder.tag(command),
          },
          download: {
            matches: /DOWNLOAD/i,
            requires: "filesaver",
            state: FN.states.opened.in,
            length: 2,
            fn: commands => ರ‿ರ.folder.download(commands[0], ಠ_ಠ.Strings().base64.decode(commands[1])),
          },
          star: {
            matches: /STAR/i,
            state: FN.states.opened.in,
            length: 1,
            fn: command => ರ‿ರ.folder.star(command),
          },
          visibility_columns: {
            matches: [/VISIBILITY/i, /COLUMNS/i],
            state: FN.states.opened.in,
            fn: () => ರ‿ರ.folder.table().columns.visibility(),
          },
          search_properties: {
            matches: [/SEARCH/i, /PROPERTIES/i],
            length: {
              min: 2,
              max: 3
            },
            fn: command => (ರ‿ರ.folder ?
                Promise.resolve() :
                _loadFolder(command.length === 3 ? command[2] : "root", false))
              .then(() => ರ‿ರ.folder.searchTag(
                command[0].replace(new RegExp("%2E", "gi"), "."),
                command[1].replace(new RegExp("%2E", "gi"), ".")
              )),
          },
          search_root: {
            matches: [/SEARCH/i, /ROOT/i],
            state: FN.states.opened.in,
            fn: () => ರ‿ರ.folder.search("root")
          },
          search: {
            matches: /SEARCH/i,
            state: FN.states.opened.in,
            keys: "s",
            fn: command => ರ‿ರ.folder.search(command)
          },
          clone: {
            matches: /CLONE/i,
            state: FN.states.opened.in,
            fn: command => ರ‿ರ.folder.clone(command),
          },
          audit: {
            matches: /AUDIT/i,
            state: FN.states.opened.in,
            fn: command => ರ‿ರ.folder.audit(command),
          },
          rename: {
            matches: /RENAME/i,
            state: FN.states.opened.in,
            fn: command => ರ‿ರ.folder.rename(command),
          },
          move: {
            matches: /MOVE/i,
            state: FN.states.opened.in,
            length: 0,
            fn: () => ರ‿ರ.folder.move(),
          },
          move_to: {
            matches: /MOVE/i,
            state: FN.states.opened.in,
            length: {
              min: 1,
              max: 2,
            },
            fn: command => ರ‿ರ.folder.move_to(command),
          },
          delete_folder: {
            matches: /DELETE/i,
            state: FN.states.opened.in,
            length: 1,
            fn: command => ರ‿ರ.folder.delete(command),
          },
          delete: {
            matches: /DELETE/i,
            state: FN.states.opened.in,
            length: 0,
            fn: () => ರ‿ರ.folder.delete(),
          },
          refresh: {
            matches: /REFRESH/i,
            state: FN.states.opened.in,
            keys: "r",
            fn: () => _openFolder(ರ‿ರ.folder.folder(), false),
          },
          teamdrives: {
            matches: [/^SHOW/i, /^TEAM$/i],
            length: 1,
            fn: command => _.compose(
              () => (ರ‿ರ.drives = ಠ_ಠ.TeamDrives(ಠ_ಠ)).show(String(command) == "true")
              .then(() => ಠ_ಠ.Display.state().enter(FN.states.team.in)),
              () => ಠ_ಠ.container.empty(),
              ಠ_ಠ.Router.clean
            )(),
          },
          groups: {
            matches: [/^SHOW/i, /^GROUP$/i],
            length: 1,
            fn: command => (command = command.replace(new RegExp("%2E", "gi"), ".")) &&
              ಠ_ಠ.Groups(ಠ_ಠ, ರ‿ರ.drives).show(command, $(`[data-group='${command}']`).children(".permission")),
          },
          export: {
            matches: /EXPORT/i,
            state: FN.states.opened.in,
            routes: {
              csv: {
                matches: /CSV/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.folder.table(), "csv", ರ‿ರ.folder.title())
              },
              excel: {
                matches: /EXCEL/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.folder.table(), "xlsx", ರ‿ರ.folder.title(), "Contents")
              },
              markdown: {
                matches: /MARKDOWN/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.folder.table(), "md", ರ‿ರ.folder.title())
              },
              sheets: {
                matches: /SHEETS/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.folder.table(), "sheets", ರ‿ರ.folder.title(), "Contents", "NOTIFY_SAVE_EXPORT_SUCCESS")
              },
            }
          },
          load: command => {
            ((/TEAM/i).test(command[0]) ?
              _loadTeamDrive(command[1], true) :
              _loadFolder(_.isArray(command) ? command[0] : command, true,
                _.isArray(command) && /TAG/i.test(command[1]) ? null : _.isArray(command) && /FILTER/i.test(command[1]) ? null : _.isArray(command) && command[1] ? command[1] : null,
                _.isArray(command) && /TAG/i.test(command[1]) ? command.slice(3) : _.isArray(command) && /TAG/i.test(command[2]) ? command.slice(3) : null)).then(() => {
              var _filter = _.isArray(command) && /FILTER/i.test(command[1]) ? command[2] : _.isArray(command) && /FILTER/i.test(command[2]) ? command[3] : false;
              ಠ_ಠ.Flags.log(`Folder Fully Loaded${_filter ? ` - Now Filtering for ${_filter}` : ""}`);
              if (_filter) ರ‿ರ.folder.filter(_filter);
            });
          }
        },
        route: (handled, command) => {

          if (handled) return;

          if ((/TEST/i).test(command)) {

            if (ರ‿ರ.folder) ರ‿ರ.folder.test(
              ((/TEST/i).test(command[0])) ? command[1] : null,
              ((/TEST/i).test(command[0])) ? command[2] : null,
              ((/TEST/i).test(command[0])) ? command[3] ? true : null : null
            );

          }

        }
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: FN.setup.initial,

    ready: FN.setup.session,
    
    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};