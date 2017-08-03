App = function() {

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) {
		return new this.App().initialise(this);
	}

	/* <!-- Internal Constants --> */
	const HIGH_ROWS = 100;
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var _;
	var __sheet, __db, __last = ".";
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _loadValues = function(id, name, index, target) {

		_.Display.busy({
			target: target
		});

		var _show = function(data, widths) {

			var _cluster;

			/* <!-- Clean up blank rows at the end! --> */
			data = data.clean(false, true);

			_.Flags.log("Google Sheet Values [" + name + "]", data);

			var _headers = data.shift();
			var _length = 0;

			var _values = data.map(function(v) {
				_length = Math.max(_length, v.length);
				return Object.assign({}, v);
			});

			var _fields = Array.apply(null, {
				length: _length
			}).map(Number.call, Number);
			if (!__db) __db = new loki("view.db");
			var _table = __db.addCollection(name, {
				indices: _fields
			});
			_table.insert(_values);

			var _rows = _table.chain();

			/* <!-- Log Table Details --> */
			_.Flags.log("HEADERS for Table:", _headers);
			_.Flags.log("ROWS for Table:", _rows);

			/* <!-- Append Table to Display --> */
			var _display = $(_.Display.template("table")({
				id: name,
				classes: widths ? ["table-fixed-width"] : [],
				headers: _headers,
				widths: widths ? widths : [],
				rows: _rows.data({removeMeta: true})
			}));

			/* <!-- Set Search Handlers --> */
			var _filters = {};

			var _completeSearch = function() {
				var _rows;
				if (_filters === {}) {
					_rows = _table.chain();
				} else {
					var _query;
					for (var field in _filters) {
						if (_filters.hasOwnProperty(field)) {
							var _condition = {};
							_condition[field] = _filters[field];
							if (!_query) {
								_query = _condition;
							} else {
								if (_query.$and) {
									_query.$and.push(_condition);
								} else {
									_query = {
										$and: [_query, _condition]
									};
								}
							}
						}
					}
					_rows = _table.chain().find(_query);
				}
				_display.find("#table-content_" + name).empty().append(
					$(_.Display.template("rows")({
						widths: widths ? widths : [],
						rows: _rows.data({removeMeta: true})
					}))
				);
				if (_cluster) _cluster.update();
			};

			var _addSearch = function(field, value) {
				if (value.startsWith("<=") || value.startsWith("=<")) {
					_filters[field] = {
						"$lte": value.substr(2).trim()
					};
				} else if (value.startsWith(">=") || value.startsWith("=>")) {
					_filters[field] = {
						"$gte": value.substr(2).trim()
					};
				} else if (value.startsWith("<>")) {
					_filters[field] = {
						"$ne": value.substr(2).trim()
					};
				} else if (value.startsWith("!!")) {
					_filters[field] = {
						"$containsNone": [value.substr(2).trim()]
					};
				} else if (value.startsWith("=")) {
					_filters[field] = {
						"$eq": value.substr(1).trim()
					};
				} else if (value.startsWith(">")) {
					_filters[field] = {
						"$gt": value.substr(1).trim()
					};
				} else if (value.startsWith("<")) {
					_filters[field] = {
						"$lt": value.substr(1).trim()
					};
				} else if (value.indexOf("->") > 0) {
					var _value = value.split("->");
					if (_value.length == 2) {
						_filters[field] = {
							"$between": [_value[0].trim(), _value[1].trim()]
						};
					} else {
						_filters[field] = {
							"$contains": [value]
						};
					}
				} else {
					_filters[field] = {
						"$contains": [value]
					};
				}
				_display.find("#heading_" + name + "_" + field).parent().addClass("filtered");
				_completeSearch();
			};

			var _removeSearch = function(field) {
				if (_filters[field]) delete _filters[field];
				_display.find("#heading_" + name + "_" + field).parent().removeClass("filtered");
				_completeSearch();
			};

			var _search_Timeout = 0;
			_display.find("input.table-search").on("keyup", function(e) {
				var _target, keycode = ((typeof e.keyCode != "undefined" && e.keyCode) ? e.keyCode : e.which);
				if (keycode === 27) { /* <!-- Escape Key Pressed --> */
					_target = $(e.target);
					_target.val("");
					_removeSearch(_target.data("field"));
					_target.parents(".collapse").collapse("hide");
				} else if (keycode === 13) { /* <!-- Enter Key Pressed --> */
					_target = $(e.target);
					_target.parents(".collapse").collapse("hide");
				}
			}).on("input", function(e) {
				clearTimeout(_search_Timeout);
				_search_Timeout = setTimeout(function() {
					if (e && e.target) {
						var _target = $(e.target);
						var _action = _target.data("action");
						var _field = _target.data("field");
						var _value = _target.val();
						if (_action == "filter") {
							if (_value) {
								_addSearch(_field, _value);
							} else {
								_removeSearch(_field);
							}
						}

					}
				}, 200);
			});

			_display.filter(".collapse").on("shown.bs.collapse", function(e) {
				$(e.target).find("input").first().focus();
			});
			
			_display.find("[data-toggle='popover']").popover({trigger: "focus"});
			
			_display.find("button[data-command='sort']").on("click", function(e) {
				var _target = $(e.target);
				var _field = _target.data("field");
				_rows = _rows.simplesort(_field);
				_display.find("#table-content_" + name).empty().append(
					$(_.Display.template("rows")({
						widths: widths ? widths : [],
						rows: _rows.data({removeMeta: true})
					}))
				);
				if (_cluster) _cluster.update();
			});
			
			var _removeColumn = function(target, field) {
				_rows.mapReduce(function(v){ delete v[field]; return v; }, function(a) {return a;});
				_display.find("#table-content_" + name).empty().append(
					$(_.Display.template("rows")({
						widths: widths ? widths : [],
						rows: _rows.data({removeMeta: true})
					}))
				);
				/* <!-- Will only currently work with one column --> */
				_display.find("thead th:nth-child(" + (field + 1) + ")").hide();
				target.parents(".collapse").collapse("hide");
				if (_cluster) _cluster.update();
			};
			_display.find("a[data-command='hide']").on("click", function(e) {
				var _target = $(e.target);
				var _action = _target.data("action");
				var _field = _target.data("field");
				if (_action == "now") {
					_removeColumn(_target, _field);
				} else if (_action == "always") {
					_removeColumn(_target, _field);
				} else if (_action == "initially") {
					/* <!-- Add to Initially Hidden List --> */
					_display.find("#heading_" + name + "_" + _field).parent().toggleClass("to-hide");
				}
			});
			
			/* <!-- Append the Table --> */
			target.append(_display);
			
			/* <!-- Set up Clusterize --> */
			if (_rows.length > HIGH_ROWS) {
				_cluster = new Clusterize({
					scrollId: "tab_" + index,
					contentId: "table-content_" + name,
					rows_in_block: 20,
					blocks_in_cluster: 2
				});
			}
			
			/* <!-- Remove the Loader --> */
			_.Display.busy({
				target: target,
				clear: true
			});
		};

		var _frozen = {
			cols: __sheet.sheets[index].properties.gridProperties.frozenColumnCount,
			rows: __sheet.sheets[index].properties.gridProperties.frozenRowCount
		};

		if (__sheet.sheets[index].data && __sheet.sheets[index].data.length == 1) {

			/* <!-- Already have loaded values --> */
			var _data = __sheet.sheets[index].data[0];
			var _widths = _data.columnMetadata.map(function(c) {
				return c.pixelSize * 1.4;
			});
			var _rows = _data.rowData.map(function(r) {
				return r.values.map(function(c) {
					return c.formattedValue;
				});
			});

			_show(_rows, _widths);

		} else {

			/* <!-- Need to load the values --> */
			_.google.sheets.values(id, name + "!A:ZZ").then(function(data) {

				_show(data.values);

			}).catch(function(e) {

				_.Flags.error("Adding Content Table", e);

				/* <!-- Remove the Loader --> */
				_.Display.busy({
					target: target,
					clear: true
				});

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

		var _display = $(_.Display.template("tabs")(_tabs));
		_.container.empty().append(_display);

		/* <!-- Set Load Tab Handler & Load Initial Values --> */
		_display.find("a.nav-link").on("show.bs.tab", _showValues).first().tab("show");

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

						var _full = _.Flags.debug();

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