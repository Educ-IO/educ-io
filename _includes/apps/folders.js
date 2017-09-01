App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) {
		return new this.App().initialise(this);
	}

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _folder, _path, _last;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.google.pick(
				"Select a Folder to Open", false, true,
				() => [new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				(folder) => folder ? ಠ_ಠ.Flags.log("Google Drive Folder Picked from Open", folder) && resolve(folder) : reject()
			);

		});

	};

	var _default = function() {

		/* <!-- Load the Initial Instructions --> */
		ಠ_ಠ.Recent.last(5).then((recent) => ಠ_ಠ.Display.doc.show({
			name: "README",
			content: recent && recent.length > 0 ? ಠ_ಠ.Display.template.get({
				template: "recent",
				recent: recent
			}) : "",
			target: ಠ_ಠ.container,
			clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
		})).catch((e) => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error"));

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

	var _openFolder = function(folder, log) {

		folder.url = "#google,load." + folder.id;

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
		_folder = ಠ_ಠ.Folder(ಠ_ಠ, folder, ಠ_ಠ.container);
		if (log) ಠ_ಠ.Recent.add(folder.id, folder.name, folder.url).then(() => _resize());

	};
	
	var _loadFolder = function(id, log) {
		
		if (id) {
			
			ಠ_ಠ.Display.busy({
				target: ಠ_ಠ.container
			});

			ಠ_ಠ.google.files.get(id).then(folder => {

				ಠ_ಠ.Display.busy({
					target: ಠ_ಠ.container,
					clear: true
				});

				_openFolder(folder, log);

			}).catch((e) => ಠ_ಠ.Flags.error("File / Folder Load Failure", e ? e : "No Inner Error"));
		}
		
	};
	
	var _clear = function() {
		
		if (_folder || _path) {
			_path = null;
			_folder = null;
			ಠ_ಠ.Display.state().exit(["opened", "searched"]).protect("a.jump").off();
			ಠ_ಠ.container.empty();
		}
		
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

			/* <!-- Return for Chaining --> */
			return this;

		},

		route: function(command) {
			
			if (!command || command === false || command[0] === false || (/PUBLIC/i).test(command)) {

				/* <!-- Load the Public Instructions --> */
				/* <!-- Don't use handlebar templates here as we may be routed from the controller, and it might not be loaded --> */
				if (!command || !_last || command[0] !== _last[0]) ಠ_ಠ.Display.doc.show({
					wrapper: "PUBLIC",
					name: "FEATURES",
					target: ಠ_ಠ.container,
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if (command === true || (/AUTH/i).test(command)) {

				_default();

			} else if ((/OPEN/i).test(command)) {

				/* <!-- Pick, or Load the Root Folder --> */
				if ((/ROOT/i).test(command[1])) {
					_loadFolder("root", false);
				} else {
					_pick().then((folder) => {
						_openFolder(folder, true);
					}).catch((e) => ಠ_ಠ.Flags.error("Picker Failure", e ? e : "No Inner Error"));
				}

			} else if ((/LOAD/i).test(command)) {

				_loadFolder(command[1], true);

			} else if ((/CLOSE/i).test(command)) {

				if (_folder) {
					
					if ((/RESULTS/i).test(command[1])) {
						ಠ_ಠ.Display.state().exit(["searched"]);
						_folder.close();
					} else {
						_clear();
						_default();
					}
					
				}

			} else if ((/CONVERT/i).test(command)) {

				if (_folder) _folder.convert();

			} else if ((/REMOVE/i).test(command)) {

				if (command[1]) ಠ_ಠ.Recent.remove(command[1]).then(() => $("#" + command[1]).remove());

			} else if ((/INSTRUCTIONS/i).test(command)) {

				/* <!-- Load the Instructions --> */
				ಠ_ಠ.Display.doc.show({
					name: "INSTRUCTIONS",
					title: "How to use Folders ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();

			} else if ((/SEARCH/i).test(command)) {

				if (_folder) _folder.search((/ROOT/i).test(command[1]) ? "root" : "");

			}

			/* <!-- Record the last command --> */
			_last = command;

		},

		/* <!-- Clear the existing state --> */
		clean: () => _clear()
		
	};

};