App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const TYPE = "application/x.educ-io.folders-",
    STATE_OPENED = "opened",
    STATE_SEARCHED = "searched",
    STATES = [STATE_OPENED, STATE_SEARCHED];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _folder, _path;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _resize = () => {

    var _css = ಠ_ಠ.Css("folders");
    var _style = _css.sheet("resizer");

    /* <!-- Handle Screen / Window Resize Events --> */
    var _resizer = () => {
      var _height = 0;
      $("#site_nav, #paths, #folder_tabs").each(function() {
        _height += $(this).outerHeight(true);
      });
      _css.removeRule(_style, "div.tab-pane").addRule(_style, "div.tab-pane", "max-height: " + ($(window).height() - _height - 20) + "px !important;");
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

    if (!_folder || !_path) {

      /* <!-- Root Folder --> */
      _path = [folder];

    } else if (folder.parents && folder.parents.indexOf(_folder.id()) >= 0) {

      /* <!-- Child of the current Folder --> */
      _path.push(folder);

    } else {

      /* <!-- Check if it's in the paths already --> */
      var _existing = _.findIndex(_path, p => p.id === folder.id) + 1;
      if (_existing > 0) {

        /* <!-- Existing in Current Path, so splice back to it --> */
        _path.splice(_existing, _path.length - _existing);

      } else {

        /* <!-- Start a new Path --> */
        _path = [folder];

      }

    }

    _showPath(_path, ಠ_ಠ.container);
    _folder = ಠ_ಠ.Folder(ಠ_ಠ, folder, ಠ_ಠ.container, teamDrive, state, _folder ? _folder.tally.get() : null, resolve, reject);
    if (log) ಠ_ಠ.Recent.add(folder.id, folder.name, folder.url).then(() => _resize());
    ಠ_ಠ.Display.state().enter(STATE_OPENED);

  };

  var _load = (loader, rootTeamDrive, log, teamDrive, state, tags) => new Promise((resolve, reject) => {

    var _finish = ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      fn: true
    });

    loader.then(file => {

      _finish();

      ಠ_ಠ.Flags.log(`Loaded: ${JSON.stringify(file)}`);

      if (ಠ_ಠ.Google.files.in(TYPE)(file)) {

        /* <!-- This is a folders file to load and read/action --> */
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

      } else if (file.kind == "drive#teamDrive" || ಠ_ಠ.Google.folders.check(true)(file)) {

        /* <!-- This is a folder to display --> */
        file.team = rootTeamDrive;
        _openFolder(file, log, teamDrive, state, resolve, reject);

      } else {

        /* <!-- This is a file, so open the parent and process any extra instructions via a complete method --> */
        if (file.parents && file.parents.length > 0) return ಠ_ಠ.Google.files.get(file.parents[0], teamDrive).then(folder => {
          _openFolder(folder, log, teamDrive, state, response => {
            if (tags && _.isArray(tags)) _folder.tag(file.id, tags[0], tags.length > 1 ? tags[1] : "");
            resolve(response);
          }, reject);
        });

      }

    }).catch(e => {
      _finish();
      ಠ_ಠ.Flags.error("File / Folder Load Failure", e ? e : "No Inner Error");
    });
  });

  var _loadFolder = (id, log, teamDrive, tags) => id ? _load(ಠ_ಠ.Google.files.get(id, teamDrive), false, log, teamDrive, null, tags) : Promise.reject();

  var _loadTeamDrive = (id, log) => id ? _load(ಠ_ಠ.Google.teamDrives.get(id), true, log) : Promise.reject();

  var _openTeamDrive = () => {

    var _busy = ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      fn: true
    });

    ಠ_ಠ.Google.teamDrives.list().then(drives => {

      _busy();

      ಠ_ಠ.Display.choose({
        id: "folders_teamDrives",
        title: "Please Choose a Team Drive to Open ...",
        action: drives && drives.length > 0 ? "Open" : false,
        choices: _.map(drives, drive => ({
          id: drive.id,
          name: drive.name
        })),
        instructions: !drives || drives.length === 0 ? ಠ_ಠ.Display.doc.get("NO_TEAM_DRIVES") : ""
      }).then(option => {

        if (option) {
          option.team = true;
          _openFolder(option, true);
        }

      }).catch(e => e ? ಠ_ಠ.Flags.error("Team Drive Select:", e) : ಠ_ಠ.Flags.log("Team Drive Select Cancelled"));

    }).catch(e => ಠ_ಠ.Flags.error("Team Drive Load Failure", e ? e : "No Inner Error"));

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
        name: "Folders",
        states: STATES,
        test: () => !!(_folder || _path),
        clear: () => {
          _path = null;
          _folder = null;
        },
        routes: {
          open_root: { /* <!-- Pick, or Load the Root Folder --> */
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
          close_results: {
            matches: [/CLOSE/i, /RESULTS/i],
            state: STATE_SEARCHED,
            fn: () => {
              ಠ_ಠ.Display.state().exit([STATE_SEARCHED]);
              if (_folder) _folder.close();
            }
          },
          remove_list : {
            matches: [/REMOVE/i, /LIST/i],
            state: STATE_OPENED,
            length: 1,
            fn: command => _folder.remove(command)
          },
          remove_tag : {
            matches: [/REMOVE/i, /TAG/i],
            state: STATE_OPENED,
            length: 2,
            fn: command => _folder.detag(command[0], command[1])
          },
          remove_tab : {
            matches: [/REMOVE/i, /TAB/i],
            state: STATE_OPENED,
            length: 1,
            fn: command => _folder.close(command)
          },
          tally : {
            matches: /TALLY/i,
            state: STATE_OPENED,
            fn: command => _folder.tally.run(command),
          },
          convert : {
            matches: /CONVERT/i,
            state: STATE_OPENED,
            fn: command => _folder.convert(command),
          },
          tag : {
            matches: /TAG/i,
            state: STATE_OPENED,
            fn: command => _folder.tag(command),
          },
          star : {
            matches: /STAR/i,
            state: STATE_OPENED,
            length: 1,
            fn: command => _folder.star(command),
          },
          visibility_columns : {
            matches: [/VISIBILITY/i, /COLUMNS/i],
            state: STATE_OPENED,
            fn: () =>  _folder.table().columns.visibility(),
          },
          search_properties: {
            matches: [/SEARCH/i, /PROPERTIES/i],
            state: STATE_OPENED,
            length: 2,
            fn: command => _folder.searchTag(command[0], command[1])
          },
          search_root: {
            matches: [/SEARCH/i, /ROOT/i],
            state: STATE_OPENED,
            fn: () => _folder.search("root")
          },
          search: {
            state: STATE_OPENED,
            fn: command => _folder.search(command)
          },
          clone : {
            matches: /CLONE/i,
            state: STATE_OPENED,
            fn: command => _folder.clone(command),
          },
          audit : {
            matches: /AUDIT/i,
            state: STATE_OPENED,
            fn: command => _folder.audit(command),
          },
          rename : {
            matches: /RENAME/i,
            state: STATE_OPENED,
            fn: command => _folder.rename(command),
          },
          delete_folder : {
            matches: /DELETE/i,
            state: STATE_OPENED,
            length: 1,
            fn: command => _folder.delete(command),
          },
          delete : {
            matches: /DELETE/i,
            state: STATE_OPENED,
            length: 0,
            fn: () => _folder.delete(),
          },
          refresh : {
            matches: /REFRESH/i,
            state: STATE_OPENED,
            fn: () => _openFolder(_folder.folder(), false),
          },
          load: command => {
            ((/TEAM/i).test(command[0]) ?
              _loadTeamDrive(command[1], true) :
              _loadFolder(_.isArray(command) ? command[0] : command, true,
                _.isArray(command) && /TAG/i.test(command[1]) ? null : _.isArray(command) && /FILTER/i.test(command[1]) ? null : _.isArray(command) && command[1] ? command[1] : null,
                _.isArray(command) && /TAG/i.test(command[1]) ? command.slice(3) : _.isArray(command) && /TAG/i.test(command[2]) ? command.slice(3) : null)).then(() => {
                  var _filter = _.isArray(command) && /FILTER/i.test(command[1]) ? command[2] : _.isArray(command) && /FILTER/i.test(command[2]) ? command[3] : false;
                  ಠ_ಠ.Flags.log(`Folder Fully Loaded${_filter ? ` - Now Filtering for ${_filter}` : ""}`);
                  if (_filter) _folder.filter(_filter);
                });
					}
        },
        route: (handled, command) => {

          if (handled) return;
          
          if ((/TEST/i).test(command)) {

            if (_folder) _folder.test(
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

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};