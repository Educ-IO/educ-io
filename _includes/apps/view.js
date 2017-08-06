App = function() {

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) {
		return new this.App().initialise(this);
	}

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var _;
	var __sheet, __db, __last = ".", __headers, __table, __widths, __cluster, __display, __filters, __invertedFilters, __sorts;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _createQuery = function(filters, join) {
		var _query, _join = join ? join : "$and";
		for (var field in filters) {
			if (filters.hasOwnProperty(field)) {
				var _condition = {};
				_condition[field] = filters[field];
				if (!_query) {
					_query = _condition;
				} else {
					if (_query[_join]) {
						_query.$and.push(_condition);
					} else {
						var _newQuery = {};
						_newQuery[_join] = [_query, _condition];
						_query = _newQuery;
					}
				}
			}
		}
		return _query;
	};
	
	var _getRows = function() {
		
		_.Flags.log("Getting Rows from Data");
		
		var _rows = __table.chain();
		if (!$.isEmptyObject(__invertedFilters)) {
			_.Flags.log("Applying Inverted Filters", __invertedFilters);
			var _inversion = _createQuery(__invertedFilters, "$or");
			var _exclude = new Set(__table.chain().find(_inversion).data().map(function(v) {return v.$loki;}));
			_rows = _rows.where(function(v) {return !_exclude.has(v.$loki);});
		}
		if (!$.isEmptyObject(__filters)) {
			_.Flags.log("Applying Filters", __filters);
			_rows = _rows.find(_createQuery(__filters));
		}
		
		if (!$.isEmptyObject(__sorts)) {
			_.Flags.log("Applying Sorts", __sorts);
			var _sorts = [];
			for (var field in __sorts) {
				if (__sorts.hasOwnProperty(field)) {
					_sorts.push([field, __sorts[field].is_desc]);
				}
			}
			_rows = _rows.compoundsort(_sorts);
		}
		
		_rows = _rows.data({removeMeta: true});
		_.Flags.log("Data So Far", _rows);
		
		_.Flags.log("Applying Column Hides", __headers);
		_rows = _rows.map(function(v) {
			__headers.forEach(function(f, i) {
				if (f.hide())	delete v[i];
			});
			return v;
		});
		
		return _rows;
	
	};

	var _updateRows = function() {
		if (__cluster) {
			var _textRows = $(_.Display.template("rows")({
				rows: _getRows()
			})).toArray().map(function(e) {
				return e.outerHTML;
			});
			_.Flags.log("Text Rows", _textRows);
			__cluster.update(_textRows);
		}
	};

	var _loadValues = function(id, name, index, target) {

		_.Display.busy({target: target});

		var _show = function(data) {

			/* <!-- Clean up blank rows at the end! --> */
			data = data.clean(false, true);

			_.Flags.log("Google Sheet Values [" + name + "]", data);

			__filters = {}, __invertedFilters = {}, __sorts = {};
			__headers = data.shift().map(function(v) {return {name: v, hide: function() {return this.hide_now || this.hide_always;}, hide_now: false,  hide_always: false, hide_initially: false};});
			
			var _length = 0,
				_values = data.map(function(v) {
					_length = Math.max(_length, v.length);
					return Object.assign({}, v);
				});

			var _fields = Array.apply(null, {
				length: _length
			}).map(Number.call, Number);
			if (!__db) __db = new loki("view.db");
			__table = __db.addCollection(name, {
				indices: _fields
			});
			__table.insert(_values);
			
			/* <!-- Append Table to Display --> */
			var _options = {
				id: name,
				classes: __widths ? ["table-fixed-width"] : [],
				headers: __headers,
				widths: __widths ? __widths : [],
				rows: _getRows(),
			};
			__display = $(_.Display.template("table")(_options));
			
			/* <!-- Set Search Handlers --> */
			
			var _addFilter = function(field, value) {
				var _invert, _filter;
				if (value.startsWith("!!")) {
					_invert = true;
					value = value.substr(2).trim();
				}
				if (value.startsWith("$")) {
					value = value.substr(1).trim();
					if (value) _filter = {"$contains": [value]};
				} else if (value.startsWith("<=") || value.startsWith("=<")) {
					value = value.substr(2).trim();
					if (value) _filter = {"$lte": value};
				} else if (value.startsWith(">=") || value.startsWith("=>")) {
					value = value.substr(2).trim();
					if (value) _filter = {"$gte": value.substr(2).trim()};
				} else if (value.startsWith("<>")) {
					value = value.substr(2).trim();
					if (value) _filter = {"$ne": value.substr(2).trim()};
				} else if (value.startsWith("!$") || value.startsWith("$!")) {
					value = value.substr(2).trim();
					if (value) _filter = {"$containsNone": [value]};
				} else if (value.startsWith("=")) {
					value = value.substr(1).trim();
					if (value) _filter = {"$aeq": value};
				} else if (value.startsWith(">")) {
					value = value.substr(1).trim();
					if (value) _filter = {"$gt": value};
				} else if (value.startsWith("<")) {
					value = value.substr(1).trim();
					if (value) _filter = {"$lt": value.substr(1).trim()};
				} else if (value.indexOf("->") > 0) {
					var _value = value.split("->");
					if (_value.length == 2) {
						var val_1 = _value[0].trim(), val_2 = _value[1].trim();
						if (val_1 && val_2) _filter = {"$between": [val_1, val_2]};
					} else if (value) {
						_filter = {"$regex": [RegExp.escape(value), "i"]};
					}
				} else if (value) {
					_filter = {"$regex": [RegExp.escape(value), "i"]};
				}
				if (_filter) {
					if (_invert) {
						__invertedFilters[field] = _filter;
						delete __filters[field];
					} else {
						__filters[field] = _filter;
						delete __invertedFilters[field];
					}
					__display.find("#heading_" + name + "_" + field).parent().addClass(_invert ? "inverse-filtered" : "filtered").attr("title", (_invert ? "NOT: " : "") + JSON.stringify(_filter));
				} else {
					delete __filters[field];
					delete __invertedFilters[field];
					__display.find("#heading_" + name + "_" + field).parent().removeClass("filtered inverse-filtered").removeAttr("title");
				}
				_updateRows();
			};

			var _removeFilter = function(field) {
				if (__filters[field]) delete __filters[field];
				if (__invertedFilters[field]) delete __invertedFilters[field];
				__display.find("#heading_" + name + "_" + field).parent().removeClass("filtered inverse-filtered").removeAttr("title");
				_updateRows();
			};

			var _filter_Timeout = 0;
			__display.find("input.table-search").on("keyup", function(e) {
				var _target, keycode = ((typeof e.keyCode != "undefined" && e.keyCode) ? e.keyCode : e.which);
				if (keycode === 27) { /* <!-- Escape Key Pressed --> */
					_target = $(e.target);
					_target.val("");
					_removeFilter(_target.data("field"));
					_target.parents(".collapse").collapse("hide");
					_updateRows();
				} else if (keycode === 13) { /* <!-- Enter Key Pressed --> */
					_target = $(e.target);
					_target.parents(".collapse").collapse("hide");
				}
			}).on("input", function(e) {
				clearTimeout(_filter_Timeout);
				_filter_Timeout = setTimeout(function() {
					if (e && e.target) {
						var _target = $(e.target);
						var _action = _target.data("action");
						var _field = _target.data("field");
						var _value = _target.val();
						if (_action == "filter") {
							if (_value) {
								_addFilter(_field, _value);
							} else {
								_removeFilter(_field);
							}
							_updateRows();
						}

					}
				}, 200);
			});

			__display.filter(".collapse").on("shown.bs.collapse", function(e) {
				$(e.target).find("input").first().focus();
			});

			__display.find("[data-toggle='popover']").popover({
				trigger: "focus",
				animation: false, /* <!-- https://github.com/twbs/bootstrap/issues/21607 --> */
			});

			__display.find("[data-toggle='tooltip']").tooltip({
				animation: false, /* <!-- https://github.com/twbs/bootstrap/issues/21607 --> */
			});

			__display.find("button[data-command='sort']").on("click", function(e) {
				var _target = $(e.target);
				var _field = _target.data("field");
				var _heading = _target.data("heading");
				if (__sorts[_field]) {
					if (__sorts[_field].is_desc) {
						delete __sorts[_field];
						__display.find("#" + _heading).removeClass("sort desc");
					} else {
						__display.find("#" + _heading).removeClass("asc").addClass("desc");
						__sorts[_field].is_desc = true;
					}
				} else {
					__display.find("#" + _heading).addClass("sort asc");
					__sorts[_field] = {is_desc : false};
				}
				_updateRows();
			});

			__display.find("a[data-command='hide']").on("click", function(e) {
				var _target = $(e.target);
				var _action = _target.data("action");
				var _field = _target.parent().data("field");
				var _heading = _target.parent().data("heading");
				if (_action == "now") {
					__headers[_field].hide_now = !__headers[_field].hide_now;
					_target.parents(".collapse").collapse("hide");
					__display.find("#" + _heading).parent().hide();
					_updateRows();
				} else if (_action == "always") {
					__headers[_field].hide_always = !__headers[_field].hide_always;
					_target.parents(".collapse").collapse("hide");
					__display.find("#" + _heading).parent().hide();
					_updateRows();
				} else if (_action == "initially") {
					__headers[_field].hide_initially = !__headers[_field].hide_initially;
					__display.find("#" + _heading).parent().toggleClass("to-hide");
				}
			});

			/* <!-- Append the Table --> */
			target.append(__display);

			/* <!-- Set up Clusterize --> */
			__cluster = new Clusterize({
				scrollId: "tab_" + index,
				contentId: "table-content_" + name,
				rows_in_block: 20,
				blocks_in__cluster: 2
			});

			/* <!-- Remove the Loader --> */
			_.Display.busy({
				target: target,
				clear: true
			});

		}; /* <!-- End Show --> */

		var _frozen = {
			cols: __sheet.sheets[index].properties.gridProperties.frozenColumnCount,
			rows: __sheet.sheets[index].properties.gridProperties.frozenRowCount
		};

		if (__sheet.sheets[index].data && __sheet.sheets[index].data.length == 1) {

			/* <!-- Already have loaded values --> */
			var _data = __sheet.sheets[index].data[0];
			__widths = _data.columnMetadata.map(function(c) {
				return c.pixelSize * 1.4;
			});

			_show(_data.rowData.map(function(r) {
				return r.values.map(function(c) {
					return c.formattedValue;
				});
			}));

		} else {

			/* <!-- Need to load the values --> */
			_.google.sheets.values(id, name + "!A:ZZ").then(function(data) {

				_show(data.values);

			}).catch(function(e) {

				_.Flags.error("Adding Content Table", e);

				/* <!-- Remove the Loader --> */
				_.Display.busy({target: target, clear: true});

			});

		}


	};

	var _showValues = function(e) {
		if (e && e.target) {
			var _source = $(e.target);
			var _tab = $(_source.data("target")).empty(),
				_id = _source.data("id"),
				_sheet = _source.data("sheet"),
				_index = _source.data("index");
			_loadValues(_id, _sheet, _index, _tab);
		}
	};

	var _showSheet = function(sheet) {

		__sheet = sheet;

		var _tabs = {
			id: "sheet_tabs",
			sheet: sheet.spreadsheetId,
			tabs: sheet.sheets.map(function(v, i) {
				return {
					id: "tab_" + i,
					name: v.properties.title
				};
			})
		};

		var __tabs = $(_.Display.template("tabs")(_tabs));
		_.container.empty().append(__tabs);

		/* <!-- Set Load Tab Handler & Load Initial Values --> */
		__tabs.find("a.nav-link").on("show.bs.tab", _showValues).first().tab("show");

		/* <!-- Handle Screen / Window Resize Events --> */
		var _resize_Timeout = 0;
		var _resize = function() {
			clearTimeout(_resize_Timeout);
			_resize_Timeout = setTimeout(function() {
				var _height = 0;
				$("#site_nav, #sheet_tabs").each(function() {
					_height += $(this).outerHeight(true);
				});
				$(".tab-pane").css("height", $(window).height() - _height - 20);
			}, 50);
		};
		$(window).off("resize").on("resize", _resize);
		_resize();

	};
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */

		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			_ = container;

			/* <!-- Set Container Reference to this --> */
			container.App = this;

			/* <!-- Return for Chaining --> */
			return this;

		},

		route: function(command) {

			if (!command || command === false || command == "PUBLIC") {

				/* <!-- Load the Public Instructions --> */
				if (__last != command) {
					_.Display.doc({
						name: "PUBLIC",
						target: _.container,
						wrapper: "WRAPPER",
						clear: (__last !== ".")
					});
					__last = command;
				}

			} else if (command === true || command == "AUTH") {

				/* <!-- Load the Initial Instructions --> */
				if (__last != command) {
					_.Display.doc({
						name: "README",
						target: _.container,
						wrapper: "WRAPPER",
						clear: (__last !== ".")
					});
					__last = command;
				}

			} else if (command == "OPEN") {

				/* <!-- Open Sheet from Google Drive Picker --> */
				_.google.pick(
					"Select a Sheet to Open", false,
					function() {
						return [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED];
					},
					function(file) {

						var _full = _.Flags.option();

						/* <!-- Start the Loader --> */
						_.Display.busy({
							target: _.container
						});

						_.Flags.log("Google Drive File Picked from Open", file);

						_.google.sheets.get(file.id, _full).then(function(sheet) {

							_.Flags.log("Google Drive Sheet Opened", sheet);
							_.Display.busy({
								clear: true
							});
							_showSheet(sheet);

						}).catch(function(e) {

							_.Flags.error("Requesting Selected Google Drive Sheet", e);

							/* <!-- Remove the Loader --> */
							_.Display.busy({
								clear: true
							});

						});
					}
				);

			} else if (command == "VISIBILITY-COLUMNS") {

				var _choices = {
					visible: {
						name: "Visible",
						desc: "",
					},
					now: {
						name: "Hide Now",
						desc: "",
					},
					always: {
						name: "Hide Always",
						desc: "",
					},
					initially: {
						name: "Hide Initially",
						desc: "",
					},
				};

				_.Display.options({
					id: "column_visibilities",
					title: "Column Visibilities",
					action: "Apply",
					instructions: "Please select which columns you wish to be visible from the list below.",
					list: __headers.map(function(v) {
						return {
							name: v.name,
							current: v.hide_always ? _choices.always.name : v.hide_initially ? _choices.initially.name : v.hide_now ? _choices.now.name : _choices.visible.name
						};
					}),
					inline: true,
					choices_label: "Menu for controlling the visibility of this column",
					choices: _choices
				}).then(function(options) {

					if (options && options.length > 0) {

						/* <!-- Trigger Loader --> */
						_.Display.busy({
							target: $("div.tab-content div.tab-pane.active")
						});

						_.Flags.log("Current Headers", __headers);
						_.Flags.log("Received Options", options);
						
						/* <!-- Send List of Columns to hide --> */
						options.forEach(function(v) {
							
							if (v.value == _choices.now.name) {
								__headers[v.name].hide_initially = false;
								__headers[v.name].hide_always = false;
								__headers[v.name].hide_now = true;
								__display.find("thead th:nth-child(" + (v.name + 1) + ")").hide();
							} else if (v.value == _choices.always.name) {
								__headers[v.name].hide_initially = false;
								__headers[v.name].hide_always = true;
								__headers[v.name].hide_now = false;
								__display.find("thead th:nth-child(" + (v.name + 1) + ")").hide();
							} else if (v.value == _choices.initially.name) {
								__headers[v.name].hide_initially = true;
								__headers[v.name].hide_always = false;
								__headers[v.name].hide_now = false;
								__display.find("thead th:nth-child(" + (v.name + 1) + ")").toggleClass("to-hide");
							} else if (v.value == _choices.initially.name) {
								__headers[v.name].hide_initially = false;
								__headers[v.name].hide_always = false;
								__headers[v.name].hide_now = false;
							}
							
						});
						
						_updateRows();
						
						/* <!-- Un-Trigger Loader --> */
						_.Display.busy({
							clear: true
						});

					}

				}, function(e) {
					if (e) _.Flags.error("Select Column Visibility", e);
				});

			} else if (command == "EXPORT") {

				if (__sheet) {

					/* <!-- Output File Function (once choices have been made) --> */
					var _output = function(book, type, filename) {

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

						var wbout = XLSX.write(book, {
							bookType: type,
							bookSST: true,
							type: "binary"
						});
						try {
							saveAs(new Blob([_s2ab(wbout)], {
								type: "application/octet-stream"
							}), filename);
						} catch (e) {
							_.Flags.error("Google Sheet Export", e);
						}

						/* <!-- Un-Trigger Loader --> */
						_.Display.busy({
							clear: true
						});

					};
					/* <!-- Output File Function (once choices have been made) --> */

					_.Display.choose({
						id: "view_export",
						title: "Please Select a Format to Export to ...",
						action: "Export",
						choices: {
							csv: {
								name: "csv",
								desc: "Comma Separated Value Format [Current Tab]",
								type: "csv",
								ext: ".csv",
								size: "single"
							},
							dif: {
								name: "dif",
								desc: "Data Interchange Format (DIF) [Current Tab]",
								type: "dif",
								ext: ".dif",
								size: "single"
							},
							fods: {
								name: "fods",
								desc: "Flat OpenDocument Spreadsheet Format [All Tabs]",
								type: "fods",
								ext: ".fods",
								size: "multi"
							},
							html: {
								name: "html",
								desc: "HTML Document [Current Tab]",
								type: "html",
								ext: ".html",
								size: "single"
							},
							ods: {
								name: "ods",
								desc: "OpenDocument Spreadsheet Format [All Tabs]",
								type: "ods",
								ext: ".ods",
								size: "multi"
							},
							prn: {
								name: "ods",
								desc: "Lotus Formatted Text [Current Tab]",
								type: "prn",
								ext: ".prn",
								size: "single"
							},
							sylk: {
								name: "sylk",
								desc: "Symbolic Link (SYLK) File [Current Tab]",
								type: "sylk",
								ext: ".sylk",
								size: "single"
							},
							txt: {
								name: "txt",
								desc: "UTF-16 Unicode Text File [Current Tab]",
								type: "txt",
								ext: ".txt",
								size: "single"
							},
							xlml: {
								name: "xlml",
								desc: "Excel 2003-2004 (SpreadsheetML) Format [All Tabs]",
								type: "xlml",
								ext: ".xls",
								size: "multi"
							},
							xlsb: {
								name: "xlsb",
								desc: "Excel 2007+ Binary Format [All Tabs]",
								type: "xlsb",
								ext: ".xlsb",
								size: "multi"
							},
							xlsm: {
								name: "xlsm",
								desc: "Excel 2007+ Macro XML Format [All Tabs]",
								type: "xlsm",
								ext: ".xlsm",
								size: "multi"
							},
							xlsx: {
								name: "xlsx",
								desc: "Excel 2007+ XML Format [All Tabs]",
								type: "xlsx",
								ext: ".xlsx",
								size: "multi"
							},
							xls: {
								name: "xls",
								desc: "Excel 2.0 Worksheet Format [Current Tab]",
								type: "biff2",
								ext: ".xls",
								size: "single"
							}
						}
					}).then(function(option) {

						if (option) {

							/* <!-- Trigger Loader --> */
							_.Display.busy({
								target: $("div.tab-content div.tab-pane.active")
							});

							var Workbook = function() {
								if (!(this instanceof Workbook)) return new Workbook();
								this.SheetNames = [];
								this.Sheets = {};
							};

							var _exportBook = new Workbook();
							var _title = __sheet.properties.title;

							if (option.size == "multi") {

								/* <!-- Output all tabs --> */
								var _current = 0;
								var _total = __sheet.sheets.length;

								__sheet.sheets.forEach(function(tab, index) {

									_.google.sheets.values(__sheet.spreadsheetId, tab.properties.title + "!A:ZZ").then(function(data) {

										_exportBook.SheetNames.push(tab.properties.title);
										_exportBook.Sheets[tab.properties.title] = XLSX.utils.aoa_to_sheet(data.values);
										_current += 1;
										if (_total == _current) _output(_exportBook, option.type, _title + option.ext);

									});
								});

							} else if (option.size == "single") {

								/* <!-- Output Current tab --> */
								var _current_Tab = $("#sheet_tabs .nav-link.active").text();

								__sheet.sheets.forEach(function(tab, index) {

									if (tab.properties.title == _current_Tab) {

										_.google.sheets.values(__sheet.spreadsheetId, tab.properties.title + "!A:ZZ").then(function(data) {

											_exportBook.SheetNames.push(tab.properties.title);
											_exportBook.Sheets[tab.properties.title] = XLSX.utils.aoa_to_sheet(data.values);
											_output(_exportBook, option.type, _title + " - " + _current_Tab + option.ext);

										});

									}

								});

							}

						}

					}, function(e) {
						if (e) _.Flags.error("Google Sheet Export", e);
					});

				}

			} else if (command == "CLOSE") {

			} else if (command == "INSTRUCTIONS") {

				/* <!-- Load the Instructions --> */
				_.Display.doc({
					name: "INSTRUCTIONS",
					target: _.container,
					wrapper: "CONTENT_WRAPPER",
					clear: true
				});

			} else if (command == "SETTINGS") {

				/* <!-- Load the Settings Page (for the time being, actually this will be a template!) --> */
				_.Display.doc({
					name: "SETTINGS",
					target: _.container,
					wrapper: "CONTENT_WRAPPER",
					clear: true
				});

			} else if (command == "SPIN") {

				_.Display.busy({
					target: _.container
				});

			}

		},

	};

};