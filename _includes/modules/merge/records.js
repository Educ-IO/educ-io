Records = (ಠ_ಠ, file, target, tab) => {
	"use strict";
	/* <!-- MODULE: Provides the records for a merge --> */
  /* <!-- PARAMETERS: Receives the global app context, the Google sheet file, the target element and the optional tab name to load --> */
	/* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Grid, Datatable, Google, Headers --> */

  /* <!-- Internal Constants --> */
	const DB = new loki("records.db");
	/* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  var _grid, _source, _tables = {};
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
	var _display = value => {
		
		if (!value) return;
		
		_grid = ಠ_ಠ.Grid(ಠ_ಠ, value.data.slice(0), value);

		var _headings = {
			tabs: [{
				id: "cols",
				name: "Columns",
				actions: value.names ? _.reduce(value.names, (m, n, i) => {
					m[i] = {
						url: `#google,load.data.${value.sheets.spreadsheetId}.${n}`,
						name: n,
						desc: "Open different data tab",
						class: n == value.name ? "text-uppercase font-weight-bold" : ""
					};
					return m;
				}, {}) : null
			}, {
				id: "rows",
				name: "Data",
				actions_current_only: false,
				actions: {
					headers: {
						url: "#headers.manage",
						name: "Headers",
						desc: "Manage the headers"
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
			}]
		}, _tabs = ಠ_ಠ.Display.template.show({
			template: "tab-list",
			class: "pt-2 px-0",
			id: value.sheets.spreadsheetId,
			name: value.sheets.properties.title,
			nav: "data_tabs",
			links: ಠ_ಠ.Display.template.get("tab-links")(_headings),
			tabs: ಠ_ಠ.Display.template.get("tab-tabs")(_headings),
			target: value.target,
			clear: true
		});

		var _map = field => (v, i) => ({
			name: v ? v : `-${i}-`,
			hide: function(initial) {
				return !!(initial && this.hide_initially);
			},
			set_hide: function(now, always, initially) {
				this.hide_initially = initially;
			},
			hide_always: false,
			hide_now: false,
			hide_initially: false,
			field: field ? field(v) : null,
		});

		/* <!-- Create Cols Table --> */
		var _cols = {
			id: `${value.sheets.spreadsheetId}_${value.sheet.name}_${_headings.tabs[0].id}`,
			headers: () => _.map(["Name", "Mapping", "Actions"], _map(v => v.toLowerCase())),
			data: function() {return ಠ_ಠ.Query(DB).table(this.id, {indices: ["name", "mapping"], 
																														 data: _.map(_grid.headers(), (v, i) => ({name: v ? v : `-${i}-`, mapped: false}))});}
		};

		_tables.cols = ಠ_ಠ.Datatable(ಠ_ಠ, {
			id: _cols.id,
			name: _headings.tabs[0].name,
			data: _cols.data(),
			headers: _cols.headers(),
			classes: ["table-responsive"]
		}, {
			template: "meta_rows",
			advanced: false,
			collapsed: true,
			removable: true
		}, $(`#tab_${_headings.tabs[0].id}`));
		/* <!-- Create Cols Table --> */


		/* <!-- Create Data Table --> */
		var _rows = {
			id: `${value.sheets.spreadsheetId}_${value.sheet.name}_${_headings.tabs[1].id}`,
			headers: () => _.map(_grid.headers(), _map()),
			data: function() {return ಠ_ಠ.Query(DB).table(this.id, {indices: _grid.fields(), data: _grid.values()});}
		};

		_tables.rows = ಠ_ಠ.Datatable(ಠ_ಠ, {
			id: _rows.id,
			name: _headings.tabs[1].name,
			data: _rows.data(),
			headers: _rows.headers(),
			classes: ["table-responsive"],
		}, {
			advanced: false,
			collapsed: true,
			removable: true
		}, $(`#tab_${_headings.tabs[1].id}`));
		/* <!-- Create Data Table --> */

		_tabs.find("a.nav-link")
			.on("shown.bs.tab", e => value.shown = e.target.innerText)[value.shown == "Data" ? "last" : "first"]().tab("show");
		
	};
	
	var _load = (id, name, tab) => ಠ_ಠ.Google.sheets.get(id, false).then(sheet => {

		ಠ_ಠ.Flags.log("Google Drive Sheet Opened", sheet);

		var _values = (name, names, tab) => ಠ_ಠ.Google.sheets.values(sheet.spreadsheetId, `${name}!A:ZZ`)
			.then(data => ({
				data: data.values,
				name: name,
				names: names,
				sheet: tab,
				sheets: sheet,
				target: target
			}))
			.then(value => (_source = value))
			.then(_display);

		var _names = _.map(sheet.sheets, sheet => sheet.properties.title);
		return (tab || _names.length == 1 ?
			_values(tab ? tab : sheet.sheets[0].properties.title, tab && _names.length > 1 ? _names : null, sheet.sheets[0]) :
			ಠ_ಠ.Display.choose({
				id: "merge_choose_sheet",
				title: "Merge data from tab ...",
				instructions: ಠ_ಠ.Display.doc.get({
					name: "IMPORT_CHOOSE_SHEET",
					content: name
				}),
				action: "Open",
				choices: _.map(sheet.sheets, tab => tab.properties.title)
			}).then(tab => _values(tab, _names, _.find(sheet.sheets, sheet => sheet.properties.title == tab))));

	});

	var _start = (file, tab, complete) => (file.mimeType.toLowerCase() == ಠ_ಠ.Google.files.natives()[1].toLowerCase()) ?
			_load(file.id, file.name, tab).then(() => complete) :
			Promise.reject(`Can't load ${file.name}, as we can't process type: ${file.mimeType}`);
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	var _external = {
		
		id: () => sheet.spreadsheetId,

		table: () => _current.table(),

		refresh: () => {
			var target = $("div.tab-pane.active");
			_load(sheet, target.data("name"), target.data("index"), target.empty());
		},
		
		headers: {
			
			decrement: value => ಠ_ಠ.Headers(ಠ_ಠ, _grid, _source).update(0 - (value ? value : 1)).then(_display),
			
			increment: value => ಠ_ಠ.Headers(ಠ_ಠ, _grid, _source).update(value ? value : 1).then(_display),
			
			restore: () => ಠ_ಠ.Headers(ಠ_ಠ, _grid, _source).update().then(_display),
			
			manage: () => ಠ_ಠ.Headers(ಠ_ಠ, _grid, _source).manage().then(_display),
			
		},
		
	};
	/* <!-- External Visibility --> */
	
	/* <!-- Initial Calls --> */
	return _start(file, tab, _external);

}