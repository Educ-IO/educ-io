Sheet = function(table, headers, name, index, target, widths, frozen, readonly, ಠ_ಠ, 
									default_Filters, default_InvertedFilters, default_Sorts) {

	/* <!-- Internal Variables --> */
	var _filters = default_Filters ? default_Filters : {},
			_invertedFilters = default_InvertedFilters ? default_InvertedFilters : {},
			_sorts = default_Sorts ? default_Sorts : {}, 
			_table, _escapedName = "sheet_" + index, _css = ಠ_ಠ.Css(_escapedName);
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _createQuery = function(filters, join) {
		var _query, _join = join ? join : "$and";
		Object.keys(filters).map((field => {
			var _condition = {};
			_condition[field] = filters[field];
			if (!_query) {
				_query = _condition;
			} else {
				if (_query[_join]) {
					_query[_join].push(_condition);
				} else {
					_query = {
						[_join]: [_query, _condition]
					};
				}
			}
		}));
		return _query;
	};

	var _getRows = function() {

		ಠ_ಠ.Flags.log("Getting Rows from Data");

		var _rows = table.chain();
		if (!$.isEmptyObject(_invertedFilters)) {
			ಠ_ಠ.Flags.log("Applying Inverted Filters", _invertedFilters);
			var _inversion = _createQuery(_invertedFilters, "$or");
			var _exclude = new Set(table.chain().find(_inversion).data().map(function(v) {
				return v.$loki;
			}));
			_rows = _rows.where(function(v) {
				return !_exclude.has(v.$loki);
			});
		}
		if (!$.isEmptyObject(_filters)) {
			ಠ_ಠ.Flags.log("Applying Filters", _filters);
			_rows = _rows.find(_createQuery(_filters));
		}

		if (!$.isEmptyObject(_sorts)) {
			ಠ_ಠ.Flags.log("Applying Sorts", _sorts);
			_rows = _rows.compoundsort(Object.keys(_sorts).reduce((sorts, field) => {
				sorts.push([field, _sorts[field].is_desc]);
				return sorts;
			}, []));
		}

		_rows = _rows.data({removeMeta: true});
		ಠ_ಠ.Flags.log("Data So Far", _rows);

		ಠ_ಠ.Flags.log("Applying Column Hides", headers);
		return _rows.map((v) => {
			headers.forEach((f, i) => {
				if (f.hide()) delete v[i];
			});
			return v;
		});

	};

	var _clearVisibilities = function() {
		_css.delete("table-column-visibility");
		target.find(".to-hide-prefix").removeClass("to-hide-prefix");
	};
	
	var _updateHeaders = function(container, defaults) {

		var query = ".table-header[data-field]";
		var _headers = (container ? container.find(query) : target.find(query)).sort((a, b) => parseInt(a.dataset.field) - parseInt(b.dataset.field));

		var _style = _css.sheet("table-column-tohide");

		_headers.each(function(i, el) {

			var _t = $(el),
					_f = parseInt(_t.data("field"));
			
			if (headers[_f].hide(defaults) && _t.parent().is("tr")) {
				var _p = _t.parent().parent();
				if (_t.hasClass("to-hide-prefix")) _t.prev().addClass("to-hide-prefix");
				_t.detach().appendTo(_p);
			} else if (!headers[_f].hide(defaults) && _t.parent().hasClass("table-headers")) {
				var _q = _f === 0 ?_t.parents(".table-headers").find("tr")[0] : _t.parents(".table-headers").find("tr .table-header[data-field=" + (_f + 1) + "]")[0];
				_f === 0 ? _t.detach().prependTo(_q) : _t.detach().insertBefore(_q);
				_t.prev().hasClass("to-hide-prefix") ? _t.prev().removeClass("to-hide-prefix") : _t.removeClass("to-hide-prefix");
			}

			/* <!-- Set Visibility --> */
			_t.toggleClass("d-none", headers[i].hide(defaults)).toggleClass("to-hide", !!headers[i].hide_initially);

			/* <!-- Set Similar Style Rules for Rows --> */
			var _selector = "#table_" + _escapedName + " tbody tr td:nth-child(" + headers.slice(0, _f).reduce((t, h) => h.hide() ? t : t+1, 1) + ")";
			headers[_f].hide_initially ? 
				_css.removeRule(_style, _selector).addRule(_style, _selector, "background-color: " +  _t.css("background-color") + "; color: " + _t.css("color")) : 
			_css.removeRule(_style, _selector);

			/* <!-- Set Sorts --> */
			_t.toggleClass("sort", !!_sorts[_f]).toggleClass("desc", !!(_sorts[_f] && _sorts[_f].is_desc)).toggleClass("asc", !!(_sorts[_f] && !_sorts[_f].is_desc));

			/* <!-- Set Filters --> */
			var _filter = _filters[_f] || _invertedFilters[_f];
			_t.toggleClass("filtered", !!(_filter)).toggleClass("inverse", !!(_invertedFilters[_f]));
			ಠ_ಠ.Flags.debug() && _filter ? _t.attr("title", (_invertedFilters[_f] ? "NOT: " : "") + JSON.stringify(_filter)) : _t.removeAttr("title");

		});

		/* <!-- Clear Visibilities (make all toggles visible again) as we're inconsistent with indexing --> */
		_clearVisibilities();

		return container;
	};

	var _updateRows = function() {
		_table.scroll.update($(ಠ_ಠ.Display.template.get("rows")({
			headers: headers,
			rows: _getRows()
		})).toArray().map(function(e) {
			return e.outerHTML;
		}));
	};

	var _update = function(rows, headers, container, defaults) {
		if (rows) _updateRows();
		if (headers) _updateHeaders(container, defaults);
	};

	var _createDefaultTable = () => ಠ_ಠ.Display.template.get("table")({
		id: _escapedName,
		links: false,
		classes: [],
		headers: headers,
		rows: table.chain().data({removeMeta: true}).map((v) => {
			headers.forEach((f, i) => {if (f.hide_default) delete v[i];});return v;
		}),
	});

	var _createDisplayFilters = () => ಠ_ಠ.Display.template.get("filters")({
		id: _escapedName,
		headers: headers,
		instructions: $("#FILTER_INSTRUCTIONS")[0].innerText
	});

	var _createDisplayTable = () => ಠ_ಠ.Display.template.get("table")({
		id: _escapedName,
		links: !readonly,
		classes: widths.lengths > 0 ? ["table-fixed-width"] : [],
		headers: headers,
		widths: widths,
		rows: _getRows(),
	});

	var _createDisplaySheet = (filters, table) => $(ಠ_ಠ.Display.template.get("sheet")({
		filters: readonly ? "" : filters ? filters : _createDisplayFilters(),
		table: table ? table : _createDisplayTable()
	}));

	var _showValues = function() {

		/* <!-- Get Table to Display (Updating the Headers at the same time) --> */
		/* <!-- NEED TO APPEND LATER TO STOP VISUAL FLASH OF SCROLLBARS ?? --> */
		target.append(_createDisplaySheet());

			/* <!-- Set Search Handlers --> */
		var _addFilter = function(field, value) {
			var _invert, _filter;
			if (value.startsWith("!!")) {
				_invert = true;
				value = value.substr(2).trim();
			}
			if (value.startsWith("$")) {
				value = value.substr(1).trim();
				if (value) _filter = {
					"$contains": [value]
				};
			} else if (value.startsWith("##")) {
				value = value.substr(2).trim();
				if (value) _filter = {
					"$regex": [RegExp.escape(value), "i"]
				};
			} else if (value.startsWith("<=") || value.startsWith("=<")) {
				value = value.substr(2).trim();
				if (value) _filter = {
					"$lte": value.toLowerCase() == "now" ? new Date() : value
				};
			} else if (value.startsWith(">=") || value.startsWith("=>")) {
				value = value.substr(2).trim();
				if (value) _filter = {
					"$gte": value.toLowerCase() == "now" ? new Date() : value
				};
			} else if (value.startsWith("<>")) {
				value = value.substr(2).trim();
				if (value) _filter = {
					"$ne": value.substr(2).trim()
				};
			} else if (value.startsWith("!$") || value.startsWith("$!")) {
				value = value.substr(2).trim();
				if (value) _filter = {
					"$containsNone": [value]
				};
			} else if (value.startsWith("=")) {
				value = value.substr(1).trim();
				if (value) _filter = {
					"$aeq": value
				};
			} else if (value.startsWith(">")) {
				value = value.substr(1).trim();
				if (value) _filter = {
					"$gt": value.toLowerCase() == "now" ? new Date() : value
				};
			} else if (value.startsWith("<")) {
				value = value.substr(1).trim();
				if (value) _filter = {
					"$lt": value.toLowerCase() == "now" ? new Date() : value
				};
			} else if (value.indexOf("->") > 0) {
				var _value = value.split("->");
				if (_value.length == 2) {
					var val_1 = _value[0].trim(),
							val_2 = _value[1].trim();
					if (val_1 && val_2) _filter = {
						"$between": [val_1, val_2]
					};
				} else if (value) {
					_filter = {
						"$regex": [RegExp.escape(value), "i"]
					};
				}
			} else if (value) {
				if (value.toLowerCase() === "past") {
					_filter = {
						"$lt": new Date().toLocaleDateString()
					};
				} else if (value.toLowerCase() === "future") {
					_filter = {
						"$gt": new Date().toLocaleString()
					};
				} else if (value.toLowerCase() === "today") {
					_filter = {
						"$contains": [new Date().toLocaleDateString()]
					};
				} else {
					_filter = {
						"$regex": [RegExp.escape(value), "i"]
					};	
				}
			}
			if (_filter) {
				if (_invert) {
					_invertedFilters[field] = _filter;
					delete _filters[field];
				} else {
					_filters[field] = _filter;
					delete _invertedFilters[field];
				}
			} else {
				delete _filters[field];
				delete _invertedFilters[field];
			}
			_update(true, true, target);
		};

		var _removeFilter = function(field) {
			if (_filters[field]) delete _filters[field];
			if (_invertedFilters[field]) delete _invertedFilters[field];
			_update(true, true, target);
		};

		var _clearFilter = function(t) {
			var _target = $(t);
			_target.parents("div.input-group").find("input[type='text']").val("");
			_removeFilter(_target.data("field"));
			_target.parents("div.form").fadeOut();
			_update(true, true, target);
		};

		var _filter_Timeout = 0;
		target.find("input.table-search").off("keyup").on("keyup", (e) => {
			var _target, keycode = ((typeof e.keyCode != "undefined" && e.keyCode) ? e.keyCode : e.which);
			if (keycode === 27) { /* <!-- Escape Key Pressed --> */
				e.preventDefault();
				_clearFilter(e.target);
			} else if (keycode === 13) { /* <!-- Enter Key Pressed --> */
				e.preventDefault();
				_target = $(e.target);
				_target.parents("div.form").fadeOut();
			}
		}).off("input").on("input", (e) => {
			clearTimeout(_filter_Timeout);
			_filter_Timeout = setTimeout(function() {
				if (e && e.target) {
					var _target = $(e.target);
					var _action = _target.data("action");
					var _field = _target.data("field");
					var _value = _target.val();
					if (_action == "filter") {
						_value ? _addFilter(_field, _value) : _removeFilter(_field);
						_update(true, true, target);
					}
				}
			}, 200);
		});

		/* <!-- animation: false = https://github.com/twbs/bootstrap/issues/21607 --> */
		target.find("[data-toggle='popover']").popover({
			trigger: "focus",
			animation: false
		});

		target.find("[data-toggle='tooltip']").tooltip({
			animation: false
		});

		var _toggleColumn = (el, f) => {
			if (el && el.hasClass("to-hide")) {
				var _style = _css.sheet("table-column-visibility");
				var _nth = ":nth-child(" + headers.slice(0, el.data("field")).reduce((t, h) => h.hide() ? t : t+1, 1) + ")";
				var _selector = "table#table_" + _escapedName + " tr th.table-header" + _nth + ", table#table_" + _escapedName + " tbody tr td" + _nth;
				el.is(":hidden") ? _css.removeRule(_style, _selector) : _css.addRule(_style, _selector, "display: none !important;");
				if (f) _toggleColumn(f(el), f);
			}
		};

		target.find(".table-headers").on("click", (e) => {
			if (e.target.classList.contains("table-header")) {
				var _target = $(e.target), _last = (!_target.hasClass("to-hide-prefix") && _target.nextAll(":not(.to-hide)").length === 0);
				if (_last) _target.prev().addClass("to-hide-prefix");
				_toggleColumn(_target.hasClass("to-hide") || _target.hasClass("to-hide-prefix") ? (_target.hasClass("to-hide-prefix") ? _target.next() : _target) : _target.prev(), _target.hasClass("to-hide") || _target.hasClass("to-hide-prefix") ? (el) => el.next() : (el) => el.prev());
				if (_target.hasClass("to-hide-prefix")) _target.removeClass("to-hide-prefix");
			}
		});

		target.find("button[data-command='clear']").on("click", (e) => _clearFilter(e.target));

		target.find("a[data-command='sort'], button[data-command='sort']").on("click", (e) => {
			var _target = $(e.target);
			var _field = _target.data("field");
			if (_sorts[_field]) {
				_sorts[_field].is_desc ? delete _sorts[_field] : _sorts[_field].is_desc = true;
			} else {
				_sorts[_field] = {
					is_desc: false
				};
			}
			_update(true, true, target);
		});

		target.find("a[data-command='hide']").on("click", (e) => {
			var _target = $(e.target);
			var _action = _target.data("action");
			var _field = _target.parent().data("field");
			var _heading = $("#" + _target.parent().data("heading")).parent();
			var _complete;
			if (_action == "now") {
				headers[_field].hide_now = !headers[_field].hide_now;
				_complete = () => {
						if (headers[_field].hide_now && _heading.next().is(":hidden")) {
							 /* <!-- Clear Visibilities (make all toggles visible again) as we are now inconsistent with indexing --> */
							_clearVisibilities();
						}
					};
			} else if (_action == "always") {
				headers[_field].hide_always = !headers[_field].hide_always;
				_complete = () => {
						if (headers[_field].hide_always && _heading.next().is(":hidden")) {
							/* <!-- Clear Visibilities (make all toggles visible again) as we are now inconsistent with indexing --> */
							_clearVisibilities();
						}
					};
			} else if (_action == "initially") {
				headers[_field].hide_initially = !headers[_field].hide_initially;
				if (headers[_field].hide_initially) {
					_complete = () => {
						if (_heading.prev().is(":hidden") || _heading.next().is(":hidden")) _toggleColumn(_heading);
					};
				}
			}
			_target.tooltip("hide").parents("div.form").fadeOut();
			_update(true, true, target);
			if (_complete) _complete();
		});

		target.find(".table-header a").on("click", function(e) {
			e.preventDefault();
			var target = $($(e.target).data("target"));
			target.fadeToggle().promise().done(() => target.find("input[type='text']:visible").first().focus());
		});

		/* <!-- Set up Table --> */
		_table = _table ? _table : ಠ_ಠ.Table(target.find("table"), target, ಠ_ಠ);
		_table.scroll.init(target.find("tbody"), 2, 20).toggle();

	}; /* <!-- End Show --> */

	var _columnVisibility = function() {

		var _choices = {
			visible: {
				name: "Visible",
				desc: "Show this column"
			},
			now: {
				name: "Hide Now",
				desc: "Hide this column"
			},
			always: {
				name: "Hide Always",
				desc: "Just hide this column on the view that you create"
			},
			initially: {
				name: "Hide Initially",
				desc: "Just hide this column on the view, but allow it to be un-hidden"
			}
		};

		ಠ_ಠ.Display.options({
			id: "column_visibilities",
			title: "Column Visibilities",
			action: "Apply",
			instructions: "Please select which columns you wish to be visible from the list below.",
			list: headers.map((v) => ({
				name: v.name,
				current: v.hide_always ? _choices.always.name : v.hide_initially ? _choices.initially.name : v.hide_now ? _choices.now.name : _choices.visible.name
			})),
			inline: true,
			choices_label: "Menu for controlling the visibility of this column",
			choices: _choices
		}).then(function(options) {

			if (options && options.length > 0) {

				/* <!-- Trigger Loader --> */
				ಠ_ಠ.Display.busy({
					target: target
				});

				ಠ_ಠ.Flags.log("Current Headers", headers).log("Received Options", options);

				/* <!-- Send List of Columns to hide --> */				
				options.forEach((v) => headers[v.name].set_hide(v.value === _choices.now.name, v.value === _choices.always.name, v.value === _choices.initially.name));
				
				/* <!-- Update Visual Display --> */
				_update(true, true);

				/* <!-- Un-Trigger Loader --> */
				ಠ_ಠ.Display.busy({
					clear: true
				});

			}

		}, function(e) {
			if (e) ಠ_ಠ.Flags.error("Select Column Visibility", e);
		});

	};
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */
	_showValues();

	/* <!-- External Visibility --> */
	return {

		active: () => target.hasClass("active"),

		columns: {
			visibility: () => _columnVisibility()
		},

		defaults: function() {
			_filters = default_Filters ? default_Filters : {},
				_invertedFilters = default_InvertedFilters ? default_InvertedFilters : {},
				_sorts = default_Sorts ? default_Sorts : {};

			headers.forEach(function(v) {
				if (v.set_hide) v.set_hide(v.hide_default, false, false);
			});

			target.find("input.table-search").val("");
			target.find("div.form.column-settings").hide();

			/* <!-- Remove Custom CSS Sheet --> */
			_css.deleteAll();

			_update(true, true, target, true);
		},

		freeze: function() {
			if (_table) _table.freeze.init(frozen.cols).toggle();
		},

		name: () => name,

		values: (filtered) => {
			var _html = filtered ? $(_createDisplayTable()) : $(_createDefaultTable());
			var _return = [_html.find(".table-headers .table-header:not(." + (filtered ? "no-export" : "no-export-default") + ") a").toArray().map((el) => el.textContent.trim())];
			_html.find("tbody tr").each((i, el) => {_return.push($(el).find("td").toArray().map((el) => el.textContent.trim()));});
			return _return;
		},
		
		dehydrate: () => ({n : name, f : _filters, e : _invertedFilters, s : _sorts, r : frozen.rows ? frozen.rows : 1, h : _.chain(headers).filter((h) => h.hide(true)).map((h) => ({n : h.name, h : h.hide_always, i: h.hide_initially})).value()})

	};
	/* <!-- External Visibility --> */

};