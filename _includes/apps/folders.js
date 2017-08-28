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
	var ಠ_ಠ, _folder, _last;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _load = function(id, name, log) {
		
		/* <!-- Start the Loader --> */
		ಠ_ಠ.Display.busy({target: ಠ_ಠ.container});
		var result;

		return new Promise((resolve, reject) => {
			ಠ_ಠ.google.folders.contents(id).then(function(contents) {
					ಠ_ಠ.Flags.log("Google Drive Folder Opened", contents);
					result = contents;
				}).catch((e) => ಠ_ಠ.Flags.error("Requesting Selected Google Drive Folder", e ? e : "No Inner Error"))
				.then(() => ಠ_ಠ.Display.busy({
					clear: true
				}))
				.then(() => result ?
					log ? ಠ_ಠ.Recent.add(id, name, "#google,load." + id).then(() => resolve({id : id, name : name, contents : result})) :
					resolve({id : id, name  : name, contents : result}) : reject());
		});
		
	};
	
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
				template: "recent", recent: recent
			}) : "",
			target: ಠ_ಠ.container,
			clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
		})).catch((e) => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error"));
		
	};
	
	var _resize = function() {

		/* <!-- Handle Screen / Window Resize Events --> */
		var _resizer = function() {
			var _height = 0;
			$("#site_nav, #sheet_tabs").each(function() {
				_height += $(this).outerHeight(true);
			});
			$("div.tab-pane").css("max-height", $(window).height() - _height - 20);
		};
		var _resize_Timeout = 0;
		$(window).off("resize").on("resize", () => {
			clearTimeout(_resize_Timeout);
			_resize_Timeout = setTimeout(_resize, 50);
		});
		_resizer();

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
					wrapper: "PUBLIC", name: "FEATURES",
					target: ಠ_ಠ.container,
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if (command === true || (/AUTH/i).test(command)) {

				_default();

			} else if ((/OPEN/i).test(command)) {

				/* <!-- Pick, or Load the Root Folder --> */
				var _start = (/ROOT/i).test(command[1]) ?  _load("root", "root", false) : _pick().then((f) => _load(f.id, f.name, true));

				/* <!-- Load the Children of the Selected Folder --> */
				_start.then((f) => {
					_folder = ಠ_ಠ.Folder(f, $("<div />", {
						class: "container-fluid tab-pane"
					}).appendTo(ಠ_ಠ.container.empty()), ಠ_ಠ);
					_resize();
					ಠ_ಠ.Display.state().enter("opened").protect("a.jump").on("JUMP");
				}).catch((e) => ಠ_ಠ.Flags.error("Folder Load Failure", e ? e : "No Inner Error"));

			} else if ((/LOAD/i).test(command)) {

				/* <!-- Load the Children of the Root Folder --> */
				ಠ_ಠ.google.files.get(command[1]).then(folder => {
					_load(folder.id, folder.name, !!command[2]).then((f) => {
						_folder = ಠ_ಠ.Folder(f, $("<div />", {
								class: "container-fluid tab-pane"
							}).appendTo(ಠ_ಠ.container.empty()), ಠ_ಠ);
						_resize();
						ಠ_ಠ.Display.state().enter("opened").protect("a.jump").on("JUMP");
					}).catch((e) => ಠ_ಠ.Flags.error("Folder Load Failure", e ? e : "No Inner Error"));
				}).catch((e) => ಠ_ಠ.Flags.error("File / Folder Load Failure", e ? e : "No Inner Error"));
				
			} else if ((/CLOSE/i).test(command)) {
			
				if (_folder) {
					_folder = null;
					ಠ_ಠ.Display.state().exit(["opened", "searched"]).protect("a.jump").off();
					_default();
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
				
			} else if ((/TEST/i).test(command)) {
				
			}
			
			/* <!-- Record the last command --> */
			_last = command;

		},

	};

};