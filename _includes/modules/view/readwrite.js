ReadWrite = (ಠ_ಠ, sheet) => {
	"use strict";
	
	/* <!-- MODULE: Provides a readwrite view (e.g. to filter data and generate a link) --> */
  /* <!-- PARAMETERS: Receives the global app context, the Google sheet (with or without data) --> */
	/* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Grid, Datatable, Google, Headers --> */
	
	/* <!-- Internal Constants --> */
	const DB = new loki("view.db");
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
	var _grids = {}, /* <!-- Interpreted Sheet Data, indexed by Sheet/Tab Name --> */
		_sources = {}, /* <!-- Processed Sheets, indexed by Sheet/Tab Name --> */
		_tables = {}, /* <!-- Filterable and sortable tables used for display --> */
		_current = { /* <!-- Currently visible data --> */
			table : () => _tables[Object.keys(_tables).filter(key => _tables[key].active())[0]],
			grid : () => _grids[Object.keys(_tables).filter(key => _tables[key].active())[0]],
			source : () => _sources[Object.keys(_tables).filter(key => _tables[key].active())[0]]
		}, _exportTypes = {
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
	/* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _display = value => {

		if (!value) return;
		
		ಠ_ಠ.Flags.log(`Google Sheet Values [${value.name}]`, value.data);
		
		var _grid = (_grids[value.name] = ಠ_ಠ.Grid(ಠ_ಠ, value.data.slice(0), value));
		
		/* <!-- Create Headers Object --> */
		var dates = _grid.dates(), blanks = _grid.blanks(), headers = _.map(_grid.headers(), (v, i) => ({
			index: i,
			name: v ? v : `-${i}-`,
			hide: function(initial) {
				return !!(this.hide_now || this.hide_always || (initial && this.hide_initially));
			},
			set_hide: function(now, always, initially) {
				this.hide_now = now;
				this.hide_always = always;
				this.hide_initially = initially;
			},
			hide_now: false,
			hide_always: blanks.indexOf(i) >= 0 ? true : false,
			hide_initially: !!value.hide[i],
			hide_default: false,
			icons: dates.indexOf(i) >= 0 ? ["access_time"] : null
		}));
		
		var table = DB.getCollection(value.name);
		table ? table.clear() : table = DB.addCollection(value.name, {
				indices: _grid.fields(),
				serializableIndices: false
			});
		table.insert(_grid.values());
		
		_tables[value.name] = ಠ_ಠ.Datatable(ಠ_ಠ, {
			id: value.index,
			name: value.name,
			headers: headers,
			data: table
		}, {
			widths: value.widths,
			frozen: _grid.frozen(),
			header_rows: _grid.header_rows,
			hide_rows: _grid.hide_rows,
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
	
	var _load = (sheet, name, index, target) => {

		var _sheet = sheet.sheets[index];

		/* <!-- Clean Up CSS etc --> */
		if (_tables[name]) _tables[name].defaults();
	
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
			
		}, _fetch = id => {
			var _busy = ಠ_ಠ.Display.busy({clear: true}).busy({
				target: target,
				fn: true,
				status: "Loading Data"
			});
			return ಠ_ಠ.Google.sheets.get(id, true, `${name}!A:ZZ`)
				.then(data => (_sheet.data = data.sheets[0].data))
				.then(sheet => {
					_busy();
					return sheet;
				});
		};
		
		/* <!-- Initiatilise Sheet & Protect Jump Links --> */
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
			.then(value => (_sources[name] = value))
			.then(_display)
			.then(() => ಠ_ಠ.Display.state().enter("opened").protect("a.jump").on("JUMP"));

	};

	var _export = (full, all) => {

		var _error = e => e ? ಠ_ಠ.Flags.error("Google Sheet Export", e) : ಠ_ಠ.Flags.log("Google Sheet Export Cancelled");

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
		}).then(option => {

			if (!option) return;

			var __exportSheet = () => {

				/* <!-- Trigger Loader --> */
				var _busy = ಠ_ಠ.Display.busy({
					target: $("div.tab-content div.tab-pane.active"),
					status: "Exporting Data",
					fn: true
				}), _error = e => ಠ_ಠ.Flags.error("Google Sheet Export:", e),
				_content = $(".tab-content"),
				_id = _content.data("id"),
				_title = _content.data("name");

				if (option.type == "md") {

					var _md_table = _current.table(),
							_md_name = _md_table.name();
					var _md_values = _md_table.values(!full);

					var _md_output = "|---\n";
					if (_md_values && _md_values.length > 0) {

						/* <!-- Output Header Row --> */
						var _md_headers = _md_values.shift();
						_md_output += (_.reduce(_md_headers, (row, value, index) => row + (index > 0 ? " | " + value : value), "") + "\n");
						/* <!-- Output Separator Row --> */
						_md_output += (_.times(_md_headers.length, () => "|:-").join("") + "\n");
						if (_md_values.length > 0) {
							_md_output += _.map(_md_values, values => _.reduce(values, (row, value, index) => row + (index > 0 ? " | " + value : value), "")).join("\n");
						}

					}

					ಠ_ಠ.Saver({}, ಠ_ಠ).save(_md_output, _title + " - " + _md_name + option.ext, "text/markdown").catch(_error).then(_busy);

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

					var save = title => {
						ಠ_ಠ.Flags.log("Outputting Spreadsheet Book", _exportBook);
						return ಠ_ಠ.Saver({}, ಠ_ಠ).save(XLSX.write(_exportBook, {
							bookType: option.type,
							bookSST: true,
							type: "binary"
						}), title + option.ext, "application/octet-stream")
							.catch(_error)
							.then(_busy);
							
					};

					if (all && option.size == "multi") {

						/* <!-- Get all tabs --> */
						var _tabs = _content.children("div.tab-pane"),
								_index = 0,
								_total = _tabs.length;

						_tabs.each((i, el) => {
							var _name = $(el).data("name");
							var _get = !_tables[_name] ?
									new Promise(resolve => {
										ಠ_ಠ.Google.sheets.values(_id, _name + "!A:ZZ").then(data => resolve(data.values));
									}) :
							new Promise(resolve => resolve(_tables[_name].values(!full)));

							_get.then((data) => {
								if (data && data.length > 0) {
									_name = RegExp.replaceChars(_name, _safeName);
									_exportBook.SheetNames.push(_name);
									_exportBook.Sheets[_name] = XLSX.utils.aoa_to_sheet(data);
								}
								if (_total == ++_index) save(_title);

							});

						});

					} else {

						var _table = _current.table(),
								_name = RegExp.replaceChars(_table.name(), _safeName),
								_values = _table.values(!full);
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
							desc: _current.table().name(),
							all: false,
						}
					}
				}).then(option => {

					all = option.all;
					__exportSheet();

				}).catch(_error);

			} else {

				__exportSheet();

			}

		}).catch(_error);

	};
	
	var _start = sheet => {

		var _data = {
			tabs: sheet.sheets.map((v, i) => ({
				id: i,
				name: v.properties.title,
				actions_current_only: true,
				actions: {
						headers: {
							url: "#headers.manage",
							name: "Headers",
							desc: "Manage the headers",
						},
						increment: {
							url: "#headers.increment",
							icon: "vertical_align_bottom",
							name: "Increase",
							desc: "Increase Headers by one Row"
						},
						decrement: {
							url: "#headers.decrement",
							icon: "vertical_align_top",
							name: "Decrease",
							desc: "Decrease Headers by one Row",
						},
						restore: {
							url: "#headers.restore",
							icon: "undo",
							name: "Restore",
							desc: "Restore Original Headers",
						}
					}
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
		_tabs.find("a.nav-link").on("click", e => $(e.target).data("refresh", e.shiftKey)).on("show.bs.tab", e => {
			var tab = $(e.target), target = $(tab.data("target"));
			if (target.children().length === 0 || tab.data("refresh")) _load(sheet, tab.data("name"), tab.data("index"), target.empty());
			tab.closest(".nav-item").addClass("order-1").siblings(".order-1").removeClass("order-1");
		}).first().tab("show");

	};
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */
	_start(sheet);

	/* <!-- External Visibility --> */
	return {
		
		id: () => sheet.spreadsheetId,

		export: (full, all) => _export(full, all),

		table: () => _current.table(),

		refresh: () => {
			var target = $("div.tab-pane.active");
			_load(sheet, target.data("name"), target.data("index"), target.empty());
		},
		
		headers: {
			
			decrement: value => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).update(0 - (value ? value : 1)).then(_display),
			
			increment: value => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).update(value ? value : 1).then(_display),
			
			restore: () => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).update().then(_display),
			
			manage: () => ಠ_ಠ.Headers(ಠ_ಠ, _current.grid(), _current.source()).manage().then(_display),
			
		},
		
	};
	/* <!-- External Visibility --> */

};