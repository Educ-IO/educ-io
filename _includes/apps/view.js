App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

	/* <!-- Internal Constants --> */
	const STATE_OPENED = "opened",
		STATES = [STATE_OPENED];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _sheets;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _load = (id, full, complete, log) => {

		/* <!-- Start the Loader --> */
		var _busy = ಠ_ಠ.Display.busy({
			target: ಠ_ಠ.container,
			status: "Loading Sheet",
			fn: true
		});
		var result;

		return new Promise((resolve, reject) => {
			(full ? ಠ_ಠ.Google.sheets.get(id, true) : ಠ_ಠ.Google.sheets.get(id))
			.then(sheet => {
					ಠ_ಠ.Flags.log("Google Drive Sheet Opened", sheet);
					result = sheet;
				}).catch(e => ಠ_ಠ.Flags.error("Requesting Selected Google Drive Sheet", e ? e : "No Inner Error"))
				.then(() => result && log ? ಠ_ಠ.Recent.add(result.spreadsheetId, result.properties.title, "#google,load." + result.spreadsheetId + (full ? ".full" : ".lazy")) : true)
				.then(() => result = result && _busy({message: "Parsing Data"}) ? complete(result, ಠ_ಠ) : false)
				.then(result => !result ? _busy() : false)
				.then(() => result ? resolve(result) : reject());
		});

	};

	var _pick = () => {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.Google.pick(
				"Select a Sheet to Open", false, true,
				() => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				file => file ? ಠ_ಠ.Flags.log("Google Drive File Picked from Open", file) && resolve(file.id) : reject()
			);

		});

	};

	var _view = p => {

		return sheet => {

			/* <!-- Internal Variables --> */
			var _sheet;
			/* <!-- Internal Variables --> */

			/* <!-- Internal Functions --> */
			var _initSheet = function(data, target) {

				var headers = data.shift();
				var rows = p.r ? p.r - 1 : 0;
				while (rows > 0) {
					headers = data.shift().map((v, i) => v ? (headers[i] ? headers[i] + " / " + v : v) : headers[i]);
					rows--;
				}

				headers = headers.map(v => {
					var h = _.find(p.h, h => h.n == v);
					if (h === undefined) h = false;
					return {
						name: v,
						hide: function() {
							return !!(this.hide_default || this.hide_now);
						},
						hide_default: h && h.h,
						hide_now: h && h.h,
						hide_initially: h && h.i,
					};
				});

				var length = 0,
					values = data.map(v => {
						length = Math.max(length, v.length);
						return Object.assign({}, v);
					});

				var fields = Array.apply(null, {
					length: length
				}).map(Number.call, Number);
				var table = new loki("temp.db").addCollection(p.n, {
					indices: fields
				});
				table.insert(values);

				_sheet = ಠ_ಠ.Datatable(ಠ_ಠ, {
						id: "view",
						name: name,
						headers: headers,
						data: table
					}, {
						readonly: true,
						filters: p.f,
						inverted_Filters: p.e,
						sorts: p.s,
						collapsed: true
					},
					target);

			};

			var _loadValues = function(target) {

				var _finish = ಠ_ಠ.Display.busy({
					target: target,
					status: "Loading Data",
					fn: true
				});

				/* <!-- Need to load the values --> */
				ಠ_ಠ.Google.sheets.values(sheet.spreadsheetId, p.n + "!A:ZZ")
					.then(data => {
						_initSheet(data.values, target);
					}).catch(err => {
						ಠ_ಠ.Flags.error("Adding Content Table", err);
					}).then(() => _finish());

			};

			_loadValues($("<div />", {
				class: "container-fluid tab-pane"
			}).appendTo(ಠ_ಠ.container.empty()));

			/* <!-- External Visibility --> */
			return {
				id: () => p.i,
				sheet: () => _sheet,
			};
			/* <!-- External Visibility --> */

		};

	};

	/* <!-- See: https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding --> */
	var _encode = value => btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode("0x" + p)));
	var _decode = value => decodeURIComponent(_.map(atob(value).split(""), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
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
				name: "View",
				states: STATES,
				test: () => !!(_sheets),
				clear: () => {
					_sheets.table().defaults();
					_sheets = null;
				},
				route: (handled, command) => {

					if (handled) return;

					if ((/OPEN/i).test(command)) {

						/* <!-- Pick, then Load the Selected File --> */
						_pick()
							.then(f => {
								ಠ_ಠ.Router.clean(false); /* <!-- Clear the existing state --> */
								return _load(f, (/FULL/i).test(command[1]), ಠ_ಠ.Sheets, true);
							})
							.then(s => {
								_sheets = s;
								ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane");
							})
							.catch(() => _sheets = null);

					} else if ((/LOAD/i).test(command)) {

						ಠ_ಠ.Router.clean(false); /* <!-- Clear the existing state --> */

						/* <!-- Load the Supplied File Id --> */
						_load(command[1], (/FULL/i).test(command[2]), ಠ_ಠ.Sheets, true)
							.then(s => {
								_sheets = s;
								ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane");
							})
							.catch(() => _sheets = null);

					} else if ((/SAVE/i).test(command)) {

						/* <!-- Save As JSON to Google Drive --> */

					} else if ((/HEADERS/i).test(command)) {
						
						if (_sheets) {
							if ((/INCREMENT/i).test(command[1])) {
								_sheets.headers.increment();
							} else if ((/DECREMENT/i).test(command[1])) {
								_sheets.headers.decrement();
							} else if ((/MANAGE/i).test(command[1])) {
								_sheets.headers.manage();
							} else if ((/RESTORE/i).test(command[1])) {
								_sheets.headers.restore();
							}
						}
						
					} else if ((/VISIBILITY/i).test(command)) {

						if ((/COLUMNS/i).test(command[1]) && _sheets) _sheets.table().columns.visibility();

					} else if ((/EXPORT/i).test(command)) {

						if (_sheets) _sheets.export((/FULL/i).test(command));

					} else if ((/FREEZE/i).test(command)) {

						if (_sheets) _sheets.table().freeze((/ROWS/i).test(command[1]));

					} else if ((/LINK/i).test(command)) {

						var _data = _sheets.table().dehydrate();
						_data.i = _sheets.id();

						var _link = ಠ_ಠ.Flags.full("view/#google,view." + _encode(JSON.stringify(_data))),
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

						if (_sheets) _sheets.table().defaults();

					} else if ((/REFRESH/i).test(command)) {

						if (_sheets) _sheets.refresh();

					} else if ((/CLOSE/i).test(command)) {

						/* <!-- Clear the existing state & Load Initial Instructions --> */
						ಠ_ಠ.Router.clean(true, STATES);

					} else if ((/VIEW/i).test(command)) {

						/* <!-- Clear the existing state --> */
						ಠ_ಠ.Router.clean(false, STATES);

						/* <!-- Show the View --> */
						var params;
						try {
							params = JSON.parse(_decode(command[1]));
						} catch (e) {
							ಠ_ಠ.Flags.error("Failed to Parse View Params", e ? e : "No Inner Error");
						}

						if (params && params.i) {
							_load(params.i, false, _view(params), false).then((s) => {
								_sheets = s;
								ಠ_ಠ.Display.size.resizer.height("#site_nav, #sheet_tabs", "div.tab-pane");
							}).catch(() => _sheets = null);
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