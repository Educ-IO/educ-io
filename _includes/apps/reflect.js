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
	var ಠ_ಠ, _last;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.google.pick(
				"Select a File / Folder to Use", false, true,
				() => [new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true).setSelectFolderEnabled(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				(file) => file ? ಠ_ಠ.Flags.log("Google Drive Folder Picked from Open", file) && resolve(file) : reject()
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
	var _clear = function() {
		
		ಠ_ಠ.Display.state().exit([]).protect("a.jump").off();
		ಠ_ಠ.container.empty();
		
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

			} else if ((/CREATE/i).test(command)) {
				
				/* <!-- Load a new Form --> */
				ಠ_ಠ.Display.template.show({
					name: "form",
					target: ಠ_ಠ.container.empty(),
				});
				
			} else if ((/OPEN/i).test(command)) {
				
				
				
			} else if ((/SAVE/i).test(command)) {
				
				
				
			} else if ((/CLOSE/i).test(command)) {
				
				
				
			} else if ((/INSTRUCTIONS/i).test(command)) {

				/* <!-- Load the Instructions --> */
				ಠ_ಠ.Display.doc.show({
					name: "INSTRUCTIONS",
					title: "How to use Reflect ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();

			}

			/* <!-- Record the last command --> */
			_last = command;

		},

		/* <!-- Clear the existing state --> */
		clean: () => _clear()
		
	};

};