App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

	/* <!-- Internal Constants --> */
	const TYPE = "application/x.educ-io.folders-", STATE_OPENED = "opened", STATE_SEARCHED = "searched", STATES = [STATE_OPENED, STATE_SEARCHED];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _folder, _path;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Folder from Google Drive Picker --> */
			ಠ_ಠ.Google.pick(
				"Select a Folder to Open", false, true,
				() => [new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true).setParent("root"), 
						google.picker.ViewId.RECENTLY_PICKED],
				(folder) => folder ? ಠ_ಠ.Flags.log("Google Drive Folder Picked from Open", folder) && resolve(folder) : reject()
			);

		});

	};

	var _resize = function() {

		var _css = ಠ_ಠ.Css("folders");
		var _style = _css.sheet("resizer");

		/* <!-- Handle Screen / Window Resize Events --> */
		var _resizer = function() {
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
	
	var _showPath = function(path, target) {
		ಠ_ಠ.Display.template.show({
			template: "breadcrumbs",
			id: "paths",
			class: "mb-0 px-3 py-2",
			items: path,
			target: target,
			clear: true
		});
	};

	var _openFolder = function(folder, log, teamDrive, state) {
		
		folder.url = "#google,load." + (folder.team ? "team." : "") + folder.id + (teamDrive ? "." + teamDrive : "");

		if (!_folder || !_path) {
			
			/* <!-- Root Folder --> */
			_path = [folder];
			
		} else if (folder.parents && folder.parents.indexOf(_folder.id()) >= 0) {
			
			/* <!-- Child of the current Folder --> */
			_path.push(folder);
			
		} else {
			
			/* <!-- Check if it's in the paths already --> */
			var _existing = _.findIndex(_path, (p) => p.id === folder.id) + 1;
			if (_existing > 0) {
				
				/* <!-- Existing in Current Path, so splice back to it --> */
				_path.splice(_existing, _path.length - _existing);
				
			} else {
				
				/* <!-- Start a new Path --> */
				_path = [folder];
				
			}
			
		}
		
		_showPath(_path, ಠ_ಠ.container);
		_folder = ಠ_ಠ.Folder(ಠ_ಠ, folder, ಠ_ಠ.container, teamDrive, state, _folder ? _folder.tally.get() : null);
		if (log) ಠ_ಠ.Recent.add(folder.id, folder.name, folder.url).then(() => _resize());

	};
	
	var _load = function(loader, rootTeamDrive, log, teamDrive, state, tags) {
		
		var _finish = ಠ_ಠ.Display.busy({
			target: ಠ_ಠ.container,
			fn: true
		});

		loader.then(file => {

			_finish();

			ಠ_ಠ.Flags.log(`Loaded: ${JSON.stringify(file)}`);
			
			if (ಠ_ಠ.Google.files.in(TYPE)(file)) {
				
				ಠ_ಠ.Google.download(file.id).then(loaded => {
					return ಠ_ಠ.Google.reader().promiseAsText(loaded).then(parsed => {
						ಠ_ಠ.Flags.log(`Loaded Folders File [${file.mimeType}]: ${parsed}`);
						parsed = JSON.parse(parsed);
						if (parsed && parsed.folder) 
							_load(Promise.resolve(parsed.folder), !!parsed.folder.team, false, parsed.folder.team, parsed.state);
					});
				});
				
			} else if (ಠ_ಠ.Google.folders.check(true)(file)) {
				
				file.team = rootTeamDrive;
				_openFolder(file, log, teamDrive, state);
				
			} else {
				
				ಠ_ಠ.Flags.log(`Tags: ${JSON.stringify(tags)}`);
				
			}
			
		}).catch((e) => {
			_finish();
			ಠ_ಠ.Flags.error("File / Folder Load Failure", e ? e : "No Inner Error");
		});
		
	};
	
	var _loadFolder = function(id, log, teamDrive, tags) {
		
		if (id) _load(ಠ_ಠ.Google.files.get(id, teamDrive), false, log, teamDrive, null, tags);
		
	};
	
	var _loadTeamDrive = function(id, log) {
		
		if (id) _load(ಠ_ಠ.Google.teamDrives.get(id), true, log);
		
	};
	
	var _openTeamDrive = function() {
		
		ಠ_ಠ.Display.busy({
			target: ಠ_ಠ.container
		});
		
		ಠ_ಠ.Google.teamDrives.list().then(drives => {
		
			ಠ_ಠ.Display.busy({
				target: ಠ_ಠ.container,
				clear: true
			});
			
			ಠ_ಠ.Display.choose({
				id: "folders_teamDrives",
				title: "Please Choose a Team Drive to Open ...",
				action: "Open",
				choices: _.map(drives, (drive) => ({id: drive.id, name: drive.name}))
			}).then(function(option) {

				if (option) {
					option.team = true;
					_openFolder(option, true);
				}

			}).catch((e) => {
				
				ಠ_ಠ.Flags.error("Team Drive Select:", e);
				ಠ_ಠ.Display.busy({clear: true});
				
			});
			
		}).catch((e) => ಠ_ಠ.Flags.error("Team Drive Load Failure", e ? e : "No Inner Error"));
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
				clear : () => {
					_path = null;
					_folder = null;
				},
				route: (handled, command) => {
					
					if (handled) return;
					
					if ((/OPEN/i).test(command)) {

						/* <!-- Pick, or Load the Root Folder --> */
						if ((/ROOT/i).test(command[1])) {
							_loadFolder("root", false);
						} else if ((/TEAM/i).test(command[1])) {
							_openTeamDrive();
						} else {
							_pick().then((folder) => {
								_openFolder(folder, true);
							}).catch((e) => ಠ_ಠ.Flags.error("Picker Failure", e ? e : "No Inner Error"));
						}

					} else if ((/LOAD/i).test(command)) {
						
						(/TEAM/i).test(command[1]) ? 
							_loadTeamDrive(command[2], true) : 
							_loadFolder(command[1], true, 
													(/TAG/i).test(command[2]) ? null : command[2],
													(/TAG/i).test(command[2]) ? command.slice(3) : (/TAG/i).test(command[3]) ? command.slice(4) : null);

					} else if ((/CLOSE/i).test(command)) {

						if ((/RESULTS/i).test(command[1])) {
							ಠ_ಠ.Display.state().exit([STATE_SEARCHED]);
							if (_folder) _folder.close();
						} else {
							ಠ_ಠ.Router.clean(true);
						}

					} else if ((/REMOVE/i).test(command)) {

						if ((/LIST/i).test(command[1])) {

							if (_folder && command[2]) _folder.remove(command[2]);

						} else if ((/TAG/i).test(command[1])) {

							if (_folder && command[2] && command[3]) _folder.detag(command[2], command[3]);

						} else if ((/TAB/i).test(command[1])) {

							if (_folder && command[2]) _folder.close(command[2]);

						}

					} else if ((/TALLY/i).test(command)) {

						if (_folder) _folder.tally.run();

					} else if ((/CONVERT/i).test(command)) {

						if (_folder) _folder.convert(((/TAG/i).test(command[0])) ? command[1] : null);

					} else if ((/TAG/i).test(command)) {

						if (_folder) _folder.tag(((/TAG/i).test(command[0])) ? command[1] : null);
						


					} else if ((/STAR/i).test(command[0]) && command[1]) {

						if (_folder) _folder.star(command[1]);

					} else if ((/VISIBILITY/i).test(command)) {

						if ((/COLUMNS/i).test(command[1]) && _folder) _folder.table().columns.visibility();

					} else if ((/SEARCH/i).test(command)) {

						if (_folder) {
							if ((/PROPERTIES/i).test(command[1]) && command.length == 4) {
								_folder.searchTag(command[2], command[3]);
							} else {
								_folder.search((/ROOT/i).test(command[1]) ? "root" : "");	
							}
						}
						
					} else if ((/CLONE/i).test(command)) {

						if (_folder) _folder.clone(((/CLONE/i).test(command[0])) ? command[1] : null);

					} else if ((/DELETE/i).test(command)) {

						if (_folder) _folder.delete();

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