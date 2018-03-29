Sheets = function(sheet, ಠ_ಠ) {

	/* <!-- Internal Variables --> */
	var _db = new loki("view.db"),
		_sheets = {};
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _currentSheet = () => _sheets[Object.keys(_sheets).filter(key => _sheets[key].active())[0]];

	var _initSheet = value => {

		ಠ_ಠ.Flags.log(`Google Sheet Values [${value.name}]`, value.data);
		
		var _sheet = ಠ_ಠ.Sheet(ಠ_ಠ, value.data, value);
		
		/* <!-- Create Headers Object --> */
		var headers = _.map(_sheet.headers(), (v, i) => ({
			name: v ? v : "-" + i + "-",
			hide: function(initial) {
				return !!(this.hide_now || this.hide_always || (initial && this.hide_initially));
			},
			set_hide: function(now, always, initially) {
				this.hide_now = now;
				this.hide_always = always;
				this.hide_initially = initially;
			},
			hide_now: false,
			hide_always: false,
			hide_initially: !!value.hide[i],
			hide_default: false
		}));
		
		var table = _db.getCollection(value.name);

		if (!table) (table = _db.addCollection(value.name, {
				indices: _sheet.fields(),
				serializableIndices: false
			})) &&	table.insert(_sheet.values());

		_sheets[value.name] = ಠ_ಠ.Datatable(ಠ_ಠ, {
			id: value.index,
			name: value.name,
			headers: headers,
			data: table
		}, {
			widths: value.widths,
			frozen: _sheet.frozen(),
			advanced: true,
			collapsed: true,
			visibilities : {
				visible: {
					name: "Visible",
					desc: "Show this column"
				},
				now: {
					name: "Hide Now",
					desc: "Hide this column",
					menu: true
				},
				always: {
					name: "Hide Always",
					desc: "Just hide this column on the view that you create",
					menu: true
				},
				initially: {
					name: "Hide Initially",
					desc: "Just hide this column on the view, but allow it to be un-hidden",
					menu: true
				}
			}
		}, value.target);

		return true;
	};
	
	var _loadValues = function(sheet, name, index, target) {

		var _busy = ಠ_ಠ.Display.busy({
			target: target,
			fn: true
		}), _sheet = sheet.sheets[index];

		/* <!-- Clean Up CSS etc --> */
		if (_sheets[name]) _sheets[name].defaults();
	
		/* <!-- ARRAY OF: {startRowIndex: 0, endRowIndex: 1, startColumnIndex: 1, endColumnIndex: 3} --> */
		ಠ_ಠ.Flags.log(`Google Sheet Merges [${name}]`, _sheet.merges);
		
		/* <!-- Get Value Functions --> */
		var _process = () => {
			
			var _data = _sheet.data[0];
			var _fontSizes = Array(_data.columnMetadata.length).fill(sheet.properties.defaultFormat.textFormat.fontSize);
			var _rows = _data.rowData.map(r => r.values.map((c, i) => {
				if (c.effectiveFormat) _fontSizes[i] = Math.max(_fontSizes[i], c.effectiveFormat.textFormat.fontSize);
				return c.formattedValue === undefined ? null : c.formattedValue;
			}));

			return Promise.resolve({
				data: _rows.clean(false, true).trim(_rows[0].length),
				widths: _data.columnMetadata.map((c, i) => (c.pixelSize / _fontSizes[i]) * parseFloat(getComputedStyle(document.documentElement).fontSize)),
				hide: _data.columnMetadata.map(c => !!c.hiddenByUser)
			});
			
		}, _fetch = id => ಠ_ಠ.Google.sheets.get(id, true, `${name}!A:ZZ`).then(data => (_sheet.data = data.sheets[0].data));
		
		/* <!-- Initiatilise Sheet, Protect Jump Links & Remove the Loader --> */
		((_sheet.data && _sheet.data.length == 1) ? _process() : _fetch(sheet.spreadsheetId).then(_process))
			.then(value => _.defaults(value, {
				data: [],
				name: name,
				index: index,
				target: target,
				sheet: _sheet,
				sheets: sheet,
				widths: [],
				hide: []
			}))
			.then(_initSheet)
			.then(() => _busy().state().enter("opened").protect("a.jump").on("JUMP"))
			.catch(_busy);

	};

	var _refreshTab = function() {
		var target = $("div.tab-pane.active");
		_loadValues(sheet, target.data("name"), target.data("index"), target.empty());
	};

	var _showTab = function(tab, sheet) {
		var target = $(tab.data("target"));
		if (target.children().length === 0 || tab.data("refresh")) _loadValues(sheet, tab.data("name"), tab.data("index"), target.empty());
		tab.closest(".nav-item").addClass("order-1").siblings(".order-1").removeClass("order-1");
	};

	var _showSheet = sheet => {

		var _data = {
			tabs: sheet.sheets.map((v, i) => ({
				id: i,
				name: v.properties.title
			}))
		};

		var _tabs = ಠ_ಠ.Display.template.show({
			template: "tab-list",
			class: "pt-2",
			id: sheet.spreadsheetId,
			name: sheet.properties.title,
			nav: "sheet_tabs",
			links: ಠ_ಠ.Display.template.get("tab-links")(_data),
			tabs: ಠ_ಠ.Display.template.get("tab-tabs")(_data),
			target: ಠ_ಠ.container,
			clear: true
		});

		/* <!-- Set Load Tab Handler & Load Initial Values --> */
		_tabs.find("a.nav-link").on("click", e => $(e.target).data("refresh", e.shiftKey)).on("show.bs.tab", e => (e && e.target) ? _showTab($(e.target), sheet) : false).first().tab("show");

	};

	var _exportTypes = {
		csv: {
			name: "csv",
			type: "csv",
			ext: ".csv",
			size: "single",
			desc: "Comma Separated Value Format"
		},
		dif: {
			name: "dif",
			type: "dif",
			ext: ".dif",
			size: "single",
			desc: "Data Interchange Format (DIF)"
		},
		fods: {
			name: "fods",
			type: "fods",
			ext: ".fods",
			size: "multi",
			desc: "Flat OpenDocument Spreadsheet Format"
		},
		html: {
			name: "html",
			type: "html",
			ext: ".html",
			size: "single",
			desc: "HTML Document"
		},
		md: {
			name: "md",
			type: "md",
			ext: ".md",
			size: "single",
			desc: "Markdown Table"
		},
		ods: {
			name: "ods",
			type: "ods",
			ext: ".ods",
			size: "multi",
			desc: "OpenDocument Spreadsheet Format"
		},
		prn: {
			name: "ods",
			type: "prn",
			ext: ".prn",
			size: "single",
			desc: "Lotus Formatted Text"
		},
		sylk: {
			name: "sylk",
			type: "sylk",
			ext: ".sylk",
			size: "single",
			desc: "Symbolic Link (SYLK) File"
		},
		txt: {
			name: "txt",
			type: "txt",
			ext: ".txt",
			size: "single",
			desc: "UTF-16 Unicode Text File"
		},
		xlml: {
			name: "xlml",
			type: "xlml",
			ext: ".xls",
			size: "multi",
			desc: "Excel 2003-2004 (SpreadsheetML) Format"
		},
		xlsb: {
			name: "xlsb",
			type: "xlsb",
			ext: ".xlsb",
			size: "multi",
			desc: "Excel 2007+ Binary Format"
		},
		xlsm: {
			name: "xlsm",
			type: "xlsm",
			ext: ".xlsm",
			size: "multi",
			desc: "Excel 2007+ Macro XML Format"
		},
		xlsx: {
			name: "xlsx",
			type: "xlsx",
			ext: ".xlsx",
			size: "multi",
			desc: "Excel 2007+ XML Format"
		},
		xls_8: {
			name: "xls",
			type: "biff8",
			ext: ".xls",
			size: "multi",
			desc: "Excel 97-2004 Workbook Format"
		},
		xls_5: {
			name: "xls",
			type: "biff5",
			ext: ".xls",
			size: "multi",
			desc: "Excel 5.0/95 Workbook Format"
		},
		xls_2: {
			name: "xls",
			type: "biff2",
			ext: ".xls",
			size: "single",
			desc: "Excel 2.0 Worksheet Format"
		}
	};

	/* <!-- Output File Function (once choices have been made) --> */
	var _outputAndSave = function(book, type, filename) {

		ಠ_ಠ.Flags.log("Outputting Spreadsheet Book", book);

		var _s2ab = function(s) {
			var buf;
			if (typeof ArrayBuffer !== "undefined") {
				buf = new ArrayBuffer(s.length);
				var view = new Uint8Array(buf);
				for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
				return buf;
			} else {
				buf = new Array(s.length);
				for (var j = 0; j != s.length; ++j) buf[j] = s.charCodeAt(j) & 0xFF;
				return buf;
			}
		};

		return new Promise((resolve, reject) => {

			var wbout = XLSX.write(book, {
				bookType: type,
				bookSST: true,
				type: "binary"
			});
			try {
				saveAs(new Blob([_s2ab(wbout)], {
					type: "application/octet-stream"
				}), filename);
				resolve();
			} catch (e) {
				ಠ_ಠ.Flags.error("Google Sheet Export", e);
				reject();
			}
		});

	};

	/* <!-- Output File Function (once choices have been made) --> */
	var _exportSheet = function(full, all) {

		var error = e => e ? ಠ_ಠ.Flags.error("Google Sheet Export", e) : ಠ_ಠ.Flags.log("Google Sheet Export Cancelled");

		ಠ_ಠ.Display.choose({
			id: "view_export_format",
			title: "Please Select a Format to Export to ...",
			instructions: ಠ_ಠ.Display.doc.get({
				name: "EXPORT_FORMATS",
				content: full ? "original" : "filtered",
			}),
			desc: "Available Formats:",
			action: "Export",
			choices: _exportTypes
		}).then(function(option) {

			if (option) {

				var __exportSheet = function() {

					/* <!-- Trigger Loader --> */
					ಠ_ಠ.Display.busy({
						target: $("div.tab-content div.tab-pane.active")
					});

					var error = (e) => {
							if (e) ಠ_ಠ.Flags.error("Google Sheet Export:", e);
							ಠ_ಠ.Display.busy({
								clear: true
							});
						},
						complete = () => ಠ_ಠ.Display.busy({
							clear: true
						}),
						_content = $(".tab-content"),
						_id = _content.data("id"),
						_title = _content.data("name");

					if (option.type == "md") {

						var _md_sheet = _currentSheet(),
							_md_name = _md_sheet.name();
						var _md_values = _md_sheet.values(!full);

						var _md_output = "|---\n";
						if (_md_values && _md_values.length > 0) {

							/* <!-- Output Header Row --> */
							var _md_headers = _md_values.shift();
							_md_output += (_.reduce(_md_headers, (row, value, index) => row + (index > 0 ? " | " + value : value), "") + "\n");
							/* <!-- Output Separator Row --> */
							_md_output += (_.times(_md_headers.length, () => "|:-").join("") + "\n");
							if (_md_values.length > 0) {
								_md_output += _.map(_md_values, (values) => _.reduce(values, (row, value, index) => row + (index > 0 ? " | " + value : value), "")).join("\n");
							}

						}

						try {
							saveAs(new Blob([_md_output], {
								type: "text/markdown"
							}), _title + " - " + _md_name + option.ext);
							complete();
						} catch (e) {
							error(e);
						}

					} else {

						var Workbook = function() {
							if (!(this instanceof Workbook)) return new Workbook();
							this.SheetNames = [];
							this.Sheets = {};
						};

						var _exportBook = new Workbook();
						var _safeName = {
							"\\": "",
							"/": " ",
							"?": "",
							"*": "",
							"[": "",
							"]": ""
						};

						var save = (title) => _outputAndSave(_exportBook, option.type, title + option.ext).then(complete).catch(error);

						if (all && option.size == "multi") {

							/* <!-- Get all tabs --> */
							var _tabs = _content.children("div.tab-pane"),
								_current = 0,
								_total = _tabs.length;

							_tabs.each((i, el) => {
								var _name = $(el).data("name");
								var _get = !_sheets[_name] ?
									new Promise((resolve) => {
										ಠ_ಠ.Google.sheets.values(_id, _name + "!A:ZZ").then(data => resolve(data.values));
									}) :
									new Promise((resolve) => resolve(_sheets[_name].values(!full)));

								_get.then((data) => {
									if (data && data.length > 0) {
										_name = RegExp.replaceChars(_name, _safeName);
										_exportBook.SheetNames.push(_name);
										_exportBook.Sheets[_name] = XLSX.utils.aoa_to_sheet(data);
									}
									if (_total == ++_current) save(_title);

								});

							});

						} else {

							var _sheet = _currentSheet(),
								_name = RegExp.replaceChars(_sheet.name(), _safeName),
								_values = _sheet.values(!full);
							_exportBook.SheetNames.push(_name);
							_exportBook.Sheets[_name] = XLSX.utils.aoa_to_sheet(_values && _values.length > 0 ? _values : []);
							save(_title + " - " + _name);

						}

					}

				};

				if (!all && option.size == "multi") {

					ಠ_ಠ.Display.choose({
						id: "view_export_size",
						title: "Which Tabs would you like to export ...",
						instructions: ಠ_ಠ.Display.doc.get({
							name: "EXPORT_SIZE",
							content: option.desc
						}),
						action: "Export",
						choices: {
							all: {
								name: "All Tabs",
								all: true
							},
							single: {
								name: "Current Tab",
								desc: _currentSheet().name(),
								all: false,
							}
						}
					}).then(function(option) {

						all = option.all;
						__exportSheet();

					}).catch(error);

				} else {

					__exportSheet();

				}

			}

		}).catch(error);

	};
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */
	_showSheet(sheet);

	/* <!-- External Visibility --> */
	return {
		id: () => sheet.spreadsheetId,

		export: (full, all) => _exportSheet(full, all),

		sheet: () => _currentSheet(),

		refresh: () => _refreshTab(),
	};
	/* <!-- External Visibility --> */

};