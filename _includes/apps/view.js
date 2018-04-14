App = function() {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

	/* <!-- Internal Constants --> */
	const STATE_OPENED = "opened", STATES = [STATE_OPENED];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _view;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _load = (id, full, complete, log, parameters) => {

		/* <!-- Start the Loader --> */
		var _busy = ಠ_ಠ.Display.busy({
			target: ಠ_ಠ.container,
			status: "Loading Sheet",
			fn: true
		});

		return new Promise((resolve, reject) => {
			(full ? ಠ_ಠ.Google.sheets.get(id, true) : ಠ_ಠ.Google.sheets.get(id))
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
				.then(sheet => sheet && _busy({message: "Parsing Data"}) ? complete(ಠ_ಠ, sheet, parameters) : false)
				.then(result => result ? resolve(result) : _busy() && reject());
		});

	};

	var _pick = () => new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.Google.pick(
				"Select a Sheet to Open", false, true,
				() => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				file => file ? ಠ_ಠ.Flags.log("Google Drive File Picked from Open", file) && resolve(file.id) : reject()
			);

		});
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
				route: (handled, command) => {

					if (handled) return;

					if ((/OPEN/i).test(command)) {

						/* <!-- Pick, then Load the Selected File --> */
						_pick()
							.then(f => {
								ಠ_ಠ.Router.clean(false); /* <!-- Clear the existing state --> */
								return _load(f, (/FULL/i).test(command[1]), ಠ_ಠ.ReadWrite, true);
							})
							.then(view => {
								_view = view;
								ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane");
							})
							.catch(() => _view = null);

					} else if ((/LOAD/i).test(command)) {

						ಠ_ಠ.Router.clean(false); /* <!-- Clear the existing state --> */

						/* <!-- Load the Supplied File Id --> */
						_load(command[1], (/FULL/i).test(command[2]), ಠ_ಠ.ReadWrite, true)
							.then(view => {
								_view = view;
								ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane");
							})
							.catch(() => _view = null);

					} else if ((/SAVE/i).test(command)) {

						/* <!-- Save As JSON to Google Drive --> */
						

					} else if ((/HEADERS/i).test(command)) {
						
						if (_view) _view.headers[
							(/INCREMENT/i).test(command[1]) ? "increment" :
							(/DECREMENT/i).test(command[1]) ? "decrement" :
							(/MANAGE/i).test(command[1]) ? "manage" : "restore"
						]();
						
					} else if ((/VISIBILITY/i).test(command)) {

						if ((/COLUMNS/i).test(command[1]) && _view) _view.table().columns.visibility();

					} else if ((/EXPORT/i).test(command)) {

						if (_view) _view.export((/FULL/i).test(command));

					} else if ((/FREEZE/i).test(command)) {

						if (_view) _view.table().freeze((/ROWS/i).test(command[1]));

					} else if ((/LINK/i).test(command)) {

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

					} else if ((/DEFAULTS/i).test(command)) {

						if (_view) _view.table().defaults();

					} else if ((/REFRESH/i).test(command)) {

						if (_view) _view.refresh();

					} else if ((/CLOSE/i).test(command)) {

						/* <!-- Clear the existing state & Load Initial Instructions --> */
						ಠ_ಠ.Router.clean(true, STATES);

					} else if ((/VIEW/i).test(command)) {

						/* <!-- Clear the existing state --> */
						ಠ_ಠ.Router.clean(false, STATES);

						/* <!-- Show the View --> */
						var params;
						try {
							params = JSON.parse(ಠ_ಠ.Strings().base64.decode(command[1]));
							if (params.i) _load(params.i, false, ಠ_ಠ.ReadOnly, false, params)
								.then(view => (_view = view) && ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane"))
								.catch(() => _view = null);
						} catch (e) {
							ಠ_ಠ.Flags.error("Failed to Parse View Params", e ? e : "No Inner Error");
						}

					}

				}
			});

			/* <!-- Return for Chaining --> */
			return this;

		},

		/* <!-- Clear the existing state --> */
		clean: () => ಠ_ಠ.Router.clean(false),

	};

};