App = function() {
	"use strict";
	
	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) {return new this.App().initialise(this);}

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _sheets;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _load = function(id, full) {

		/* <!-- Start the Loader --> */
		ಠ_ಠ.Display.busy({
			target: ಠ_ಠ.container
		});
		var result;

		return new Promise((resolve, reject) => {
			ಠ_ಠ.google.sheets.get(id, full).then(function(sheet) {
					ಠ_ಠ.Flags.log("Google Drive Sheet Opened", sheet);
					result = sheet;
				}).catch((e) => ಠ_ಠ.Flags.error("Requesting Selected Google Drive Sheet", e))
				.then(() => ಠ_ಠ.Display.busy({
					clear: true
				}))
				.then(() => result ? resolve(ಠ_ಠ.Sheets(result, ಠ_ಠ)) : reject());
		});

	};

	var _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.google.pick(
				"Select a Sheet to Open", false,
				() => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				(file) => file ? ಠ_ಠ.Flags.log("Google Drive File Picked from Open", file) && resolve(file.id) : reject()
			);

		});

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

			if (!command || command === false || (/PUBLIC/i).test(command)) {

				/* <!-- Load the Public Instructions --> */
				ಠ_ಠ.Display.doc({
					name: "PUBLIC",
					target: ಠ_ಠ.container,
					wrapper: "WRAPPER",
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if (command === true || (/AUTH/i).test(command)) {

				/* <!-- Load the Initial Instructions --> */
				ಠ_ಠ.Display.doc({
					name: "README",
					target: ಠ_ಠ.container,
					wrapper: "WRAPPER",
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if ((/OPEN/i).test(command)) {

				/* <!-- Pick, then Load the Selected File --> */
				_pick().then((f) => _load(f, (/FULL/i).test(command[1])).then((s) => _sheets = s)).catch(() => _sheets = null);

			} else if ((/LOAD/i).test(command)) {

				/* <!-- Load the Supplied File Id --> */
				_load(command[1], (/FULL/i).test(command[2])).then((s) => _sheets = s).catch(() => _sheets = null);

			} else if ((/VISIBILITY/i).test(command)) {

				if ((/COLUMNS/i).test(command[1]) && _sheets) _sheets.sheet().columns.visibility();

			} else if ((/EXPORT/i).test(command)) {

				if (_sheets) _sheets.export((/FULL/i).test(command), (/ALL/i).test(command));

			} else if ((/FREEZE/i).test(command)) {

				if (_sheets) _sheets.sheet().freeze();
								
			} else if ((/LINK/i).test(command)) {

				if (_sheets) _sheets.link((/FULL/i).test(command[1]));

			} else if ((/DEFAULTS/i).test(command)) {

				if (_sheets) _sheets.sheet().defaults();

			} else if ((/CLOSE/i).test(command)) {

				_sheets = null;
				ಠ_ಠ.Display.state().exit("opened").protect("a.jump").off().doc({
					name: "README",
					target: ಠ_ಠ.container,
					wrapper: "WRAPPER",
					clear: true
				});

			} else if ((/INSTRUCTIONS/i).test(command)) {

				/* <!-- Load the Instructions --> */
				ಠ_ಠ.Display.doc({
					name: "INSTRUCTIONS",
					title: "How to use View ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();

			} else if ((/SPIN/i).test(command)) {

				/* <!-- Loader Testing Command --> */
				ಠ_ಠ.Display.busy({
					target: ಠ_ಠ.container
				});

			} else if ((/TEST/i).test(command)) {
				
			}

		},

	};

};