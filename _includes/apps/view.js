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
	var ಠ_ಠ, _sheets, _last;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _load = function(id, full, complete, log) {

		/* <!-- Start the Loader --> */
		ಠ_ಠ.Display.busy({
			target: ಠ_ಠ.container
		});
		var result;

		return new Promise((resolve, reject) => {
			ಠ_ಠ.google.sheets.get(id, full).then(function(sheet) {
					ಠ_ಠ.Flags.log("Google Drive Sheet Opened", sheet);
					result = sheet;
				}).catch((e) => ಠ_ಠ.Flags.error("Requesting Selected Google Drive Sheet", e ? e : "No Inner Error"))
				.then(() => ಠ_ಠ.Display.busy({
					clear: true
				}))
				.then(() => result ?
					log ? ಠ_ಠ.Recent.add(result.spreadsheetId, result.properties.title, "#google,load." + result.spreadsheetId + (full ? ".full" : ".lazy")).then(() => resolve(complete(result, ಠ_ಠ))) :
					resolve(complete(result, ಠ_ಠ)) : reject());
		});

	};

	var _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.google.pick(
				"Select a Sheet to Open", false, true,
				() => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				(file) => file ? ಠ_ಠ.Flags.log("Google Drive File Picked from Open", file) && resolve(file.id) : reject()
			);

		});

	};

	var _clear = function(fn) {

		/* <!-- Clear the existing state --> */
		if (_sheets) {
			_sheets.sheet().defaults();
			_sheets = null;
			ಠ_ಠ.Display.state().exit("opened").protect("a.jump").off();
			ಠ_ಠ.container.empty();
		}

		if (fn) fn();
		
	};

	var _default = function() {

		/* <!-- Load the Initial Instructions --> */
		ಠ_ಠ.Recent.last(6).then((recent) => ಠ_ಠ.Display.doc.show({
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

	/* <!-- See: https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding --> */
	var _encode = (value) => btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode("0x" + p)));
	var _decode = (value) => decodeURIComponent(_.map(atob(value).split(""), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
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

		route: command => {

			if (!command || command === false || command[0] === false || (/PUBLIC/i).test(command)) {

				/* <!-- Clear the existing state (in case of logouts) --> */
				if (command && command[1]) _clear();

				/* <!-- Load the Public Instructions --> */
				/* <!-- Don't use handlebar templates here as we may be routed from the controller, and it might not be loaded --> */
				if (!command || !_last || command[0] !== _last[0]) ಠ_ಠ.Display.doc.show({
					wrapper: "PUBLIC",
					name: "FEATURES",
					target: ಠ_ಠ.container,
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if (command === true || (/AUTH/i).test(command)) {

				/* <!-- Load the Initial Instructions --> */
				_default();

			} else if ((/OPEN/i).test(command)) {

				/* <!-- Pick, then Load the Selected File --> */
				_pick().then((f) => _load(f, (/FULL/i).test(command[1]), ಠ_ಠ.Sheets, true).then((s) => {
					_clear(); /* <!-- Clear the existing state --> */
					_sheets = s;
					_resize();
				})).catch(() => _sheets = null);

			} else if ((/LOAD/i).test(command)) {

				/* <!-- Load the Supplied File Id --> */
				_load(command[1], (/FULL/i).test(command[2]), ಠ_ಠ.Sheets, true).then((s) => {
					_clear(); /* <!-- Clear the existing state --> */
					_sheets = s;
					_resize();
				}).catch(() => _sheets = null);

			} else if ((/LOAD/i).test(command)) {
				
				/* <!-- Save As JSON to Google Drive --> */
				
			} else if ((/REMOVE/i).test(command)) {

				if (command[1].length > 1) ಠ_ಠ.Recent.remove(command[1]).then((id) => $("#" + id).remove());

			} else if ((/VISIBILITY/i).test(command)) {

				if ((/COLUMNS/i).test(command[1]) && _sheets) _sheets.sheet().columns.visibility();

			} else if ((/EXPORT/i).test(command)) {

				if (_sheets) _sheets.export((/FULL/i).test(command));

			} else if ((/FREEZE/i).test(command)) {

				if (_sheets) _sheets.sheet().freeze((/ROWS/i).test(command[1]));

			} else if ((/LINK/i).test(command)) {

				var _data = _sheets.sheet().dehydrate();
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
					ಠ_ಠ.google.url.insert(_link).then((url) => {
						_link = url.id;
						var _qr = "https://chart.googleapis.com/chart?cht=qr&chs=540x540&choe=UTF-8&chl=" + encodeURIComponent(_link);
						ಠ_ಠ.container.find("#link_text").text(_link);
						ಠ_ಠ.container.find("#qr_copy").attr("data-clipboard-text", _qr);
						ಠ_ಠ.container.find("#qr_code").attr("src", _qr);
					}).catch((e) => ಠ_ಠ.Flags.error("Link Shorten Failure", e ? e : "No Inner Error"));

				});

				$("#qr").on("show.bs.collapse", () => $("#details").collapse("hide"));
				$("#details").on("show.bs.collapse", () => $("#qr").collapse("hide"));

			} else if ((/DEFAULTS/i).test(command)) {

				if (_sheets) _sheets.sheet().defaults();

			} else if ((/REFRESH/i).test(command)) {

				if (_sheets) _sheets.refresh();

			} else if ((/CLOSE/i).test(command)) {

				/* <!-- Clear the existing state & Load Initial Instructions --> */
				_clear(_default);

			} else if ((/VIEW/i).test(command)) {

				/* <!-- Clear the existing state --> */
				_clear();

				/* <!-- Show the View --> */
				var params;
				try {
					params = JSON.parse(_decode(command[1]));
				} catch (e) {
					ಠ_ಠ.Flags.error("Failed to Parse View Params", e ? e : "No Inner Error");
				}

				var _view = function(p) {

					return function(sheet) {

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

							headers = headers.map((v) => {
								var h = _.find(p.h, (h) => h.n == v);
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
								values = data.map((v) => {
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

							_sheet = ಠ_ಠ.Datatable(ಠ_ಠ,
								{id : "view", name : name, headers : headers, data : table}, 
								{readonly : true, filters : p.f, inverted_Filters : p.e, sorts : p.s, collapsed: true},
							target);

						};

						var _loadValues = function(target) {

							ಠ_ಠ.Display.busy({
								target: target
							});

							/* <!-- Need to load the values --> */
							ಠ_ಠ.google.sheets.values(sheet.spreadsheetId, p.n + "!A:ZZ")
								.then((data) => {
									_initSheet(data.values, target);
									ಠ_ಠ.Display.busy({
										target: target,
										clear: true
									});
								}).catch((e) => {
									ಠ_ಠ.Flags.error("Adding Content Table", e);
									ಠ_ಠ.Display.busy({
										target: target,
										clear: true
									});
								});

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

				if (params && params.i) {
					_load(params.i, false, _view(params), false).then((s) => {
						_sheets = s;
						_resize();
					}).catch(() => _sheets = null);
				}

			} else if ((/TUTORIALS/i).test(command)) {

				/* <!-- Load the Tutorials --> */
				ಠ_ಠ.Display.doc.show({
					name: "TUTORIALS",
					title: "Tutorials for View ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();
					
			} else if ((/INSTRUCTIONS/i).test(command)) {

				/* <!-- Load the Instructions --> */
				ಠ_ಠ.Display.doc.show({
					name: "INSTRUCTIONS",
					title: "How to use View ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();

			} else if ((/HELP/i).test(command)) { /* <!-- Request Help --> */

				ಠ_ಠ.Help.provide(ಠ_ಠ.Flags.dir());
							
			}

			/* <!-- Record the last command --> */
			_last = command;

		},
		
		/* <!-- Clear the existing state --> */
		clean: () => _clear()

	};

};