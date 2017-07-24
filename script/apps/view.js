App = function() {
	
	// -- Returns an instance of App if required -- //
  if (!(this instanceof App)) {return new App();}
	
	// -- Internal Variables -- //
	var __sheet, __db;
	
	// -- Internal Functions -- //
	var _loadValues = function(id, name, index, target) {

		global.interact.busy({target : target});
		
		var _show = function(data, widths) {
			
			global.flags.log("Google Sheet Values [" + name + "]", data);

				var _headers = data.shift();
				var _length = 0;

				var _values = data.map(function(v) {
					_length = Math.max(_length, v.length);
					return Object.assign({}, v)
				});

				var _fields = Array.apply(null, {length: _length}).map(Number.call, Number)
				var _table = __db.addCollection(name, {indices : _fields});
				_table.insert(_values);

				// -- Append Table to Display -- //		
				var _display = $(Handlebars.compile($("#table").html())({
					id: name,
					classes: widths ? ["table-fixed-width"] : [],
					headers : _headers,
					widths : widths ? widths : [],
					rows : _table.chain().data({removeMeta : true})
				}));

				// -- Set Search Handlers -- //
				var _addSearch = function(field, value) {
					var _query = {};
					_query[field] = {"$contains": [value]};
					//_query[field] = {"$containsNone": [value]};
					var _data = _table.find(_query);
					/*
					var _rows = _display.find("#table-content_" + name + " tr");
					_data.forEach(function(row) {
						_rows.filter("[data-index=" + (row.$loki - 1) + "]").hide();
					});
					*/
					_display.find("#table-content_" + name).empty().append(
						$(Handlebars.compile($("#rows").html())({
							widths : widths ? widths : [],
							rows : _table.chain().find(_query).data({removeMeta : true})
						}))
					);
				};
				var _removeSearch = function(field) {
					_display.find("#table-content_" + name).empty().append(
						$(Handlebars.compile($("#rows").html())({
							widths : widths ? widths : [],
							rows : _table.chain().data({removeMeta : true})
						}))
					);
				};
				var _search_Timeout = 0;
				_display.find("input.table-search").on("keyup", function(e) {
					var keycode = ((typeof e.keyCode !='undefined' && e.keyCode) ? e.keyCode : e.which);
            if (keycode === 27) {
							var _target = $(e.target);
							_target.val("");
							_removeSearch(_target.data("field"));
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
					}, 100);
				});

				// -- Set Sort Handlers -- //
				// .simplesort('name').data()

				target.append(_display);
			
				// -- Remove the Loader -- //
				global.interact.busy({target : target, clear : true});
			
		}
		
		var _frozen = {
			cols : __sheet.sheets[index].properties.gridProperties.frozenColumnCount,
			rows : __sheet.sheets[index].properties.gridProperties.frozenRowCount
		}
		
		if (__sheet.sheets[index].data && __sheet.sheets[index].data.length == 1) {
			
			// -- Already have loaded values -- //
			var _data = __sheet.sheets[index].data[0];
			var _widths =_data.columnMetadata.map(function(c) {return c.pixelSize * 1.4});
			var _rows = _data.rowData.map(function(r) {return r.values.map(function(c) {return c.formattedValue})});
			
			_show(_rows, _widths);
	
		} else {
			
			// -- Need to load the values -- //
			global.google.sheets.values(id, name + "!A:ZZ").then(function(data) {

				_show(data.values);

			}).catch(function(e) {

				global.flags.error("Adding Content Table", e);

				// -- Remove the Loader -- //
				global.interact.busy({target : target, clear : true});

			});
			
		}
		
		
	}
	
	var _showValues = function(e) {
		if (e && e.target) {
			var _source = $(e.target);
			var _tab = $(_source.data("target")).empty(), _id = _source.data("id"), _sheet = _source.data("sheet"), _index =  _source.data("index");
			_loadValues(_id, _sheet, _index, _tab);
		}
	}
	
	var _showSheet = function(sheet) {
		
		__sheet = sheet;
		
		var _tabs = {
			id : "sheet_tabs",
			sheet : sheet.spreadsheetId,
			tabs : sheet.sheets.map(function(v, i) {return {id : "tab_" + i, name : v.properties.title}})
		};
		
		var _display = $(Handlebars.compile($("#tabs").html())(_tabs));
		global.container.empty().append(_display);
		
		// -- Set Load Tab Handler & Load Initial Values -- //
		_display.find("a.nav-link").on("show.bs.tab", _showValues).first().tab("show");
		
		// -- Handle Screen / Window Resize Events -- //
		var _resize_Timeout = 0;
		var _resize = function() {
			clearTimeout(_resize_Timeout);
			_resize_Timeout = setTimeout(function() {
				var _height = 0;
				$("#site_nav, #sheet_tabs").each(function() {
  				_height += $(this).outerHeight(true);
				});
				$(".tab-pane").css("height", $(window).height() - _height - 20)
			}, 50);
		};
		$(window).off("resize").on("resize", _resize);
		_resize();
		
	}
	// -- Internal Functions -- //
	
	// -- External Visibility -- //
  return {

    // -- External Functions -- //
		
    initialise : function() {
			
			// -- Create Loki DB -- //
			__db = new loki("view.db")
			
			// -- Register Partial Templates -- //
			Handlebars.registerPartial("rows", $("#rows").html());
			
			// -- Return for Chaining -- //
			return this;
			
    },

    route : function(command) {
      
			if (!command || command === false || command == "PUBLIC") {
				
				// -- Load the Public Instructions -- //
				global.display.doc({name : "PUBLIC", target : global.container, wrapper : "CONTENT_WRAPPER", clear : true});
				
			} else if (command === true || command == "AUTH") {
				
				// -- Load the Initial Instructions -- //
				global.display.doc({name : "README", target : global.container, wrapper : "CONTENT_WRAPPER", clear : true});
				
			} else if (command == "OPEN") {
				
				// -- Open Sheet from Google Drive Picker -- //
				global.google.pick(
					"Select a Sheet to Open", false, 
					function() {return [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED]},
					function(file) {
						
						// -- Start the Loader -- //
						global.interact.busy();
						
						global.flags.log("Google Drive File Picked from Open", file);
						
						global.google.sheets.get(file.id, global.flags.debug()).then(function(sheet) {
							global.flags.log("Google Drive Sheet Opened", sheet);
							global.interact.busy({clear : true});
							_showSheet(sheet);
						}).catch(function(e) {
							
							global.flags.error("Requesting Selected Google Drive Sheet", e);
							
							// -- Remove the Loader -- //
							global.interact.busy({clear : true});
							
						});
					}
				);
					
			} else if (command == "EXPORT") {
				
					if (__sheet) {
						
						// -- Output File Function (once choices have been made) -- //
						var _output = function(book, type, filename) {
							
							var _s2ab = function(s) {
								if(typeof ArrayBuffer !== 'undefined') {
									var buf = new ArrayBuffer(s.length);
									var view = new Uint8Array(buf);
									for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
									return buf;
								} else {
									var buf = new Array(s.length);
									for (var j=0; j!=s.length; ++j) buf[j] = s.charCodeAt(j) & 0xFF;
									return buf;
								}
							}
							
							var wbout = XLSX.write(book, {bookType: type, bookSST : true, type : "binary"});
							try {
								saveAs(new Blob([_s2ab(wbout)],{type:"application/octet-stream"}), filename);
							} catch(e) {
								global.flags.error("Google Sheet Export", e);
							}
							
							// -- Un-Trigger Loader -- //
							global.interact.busy({clear: true});
							
						}
						// -- Output File Function (once choices have been made) -- //
						
						global.interact.choose({
							title : "Please Select a Format to Export to ...",
							action: "Export",
							choices: {
								csv : {name : "csv", desc : "Comma Separated Value Format [Current Tab]", type : "csv", ext : ".csv", size : "single"},
								dif : {name : "dif", desc : "Data Interchange Format (DIF) [Current Tab]", type : "dif", ext : ".dif", size : "single"},
								fods : {name : "fods", desc : "Flat OpenDocument Spreadsheet Format [All Tabs]", type : "fods", ext : ".fods", size : "multi"},
								html : {name : "html", desc : "HTML Document [Current Tab]", type : "html", ext : ".html", size : "single"},
								ods : {name : "ods", desc : "OpenDocument Spreadsheet Format [All Tabs]", type : "ods", ext : ".ods", size : "multi"},
								prn : {name : "ods", desc : "Lotus Formatted Text [Current Tab]", type : "prn", ext : ".prn", size : "single"},
								sylk : {name : "sylk", desc : "Symbolic Link (SYLK) File [Current Tab]", type : "sylk", ext : ".sylk", size : "single"},
								txt : {name : "txt", desc : "UTF-16 Unicode Text File [Current Tab]", type : "txt", ext : ".txt", size : "single"},
								xlml : {name : "xlml", desc : "Excel 2003-2004 (SpreadsheetML) Format [All Tabs]", type : "xlml", ext : ".xls", size : "multi"},
								xlsb: {name : "xlsb", desc : "Excel 2007+ Binary Format [All Tabs]", type : "xlsb", ext : ".xlsb", size : "multi"},
								xlsm: {name : "xlsm", desc : "Excel 2007+ Macro XML Format [All Tabs]", type : "xlsm", ext : ".xlsm", size : "multi"},
								xlsx : {name : "xlsx", desc : "Excel 2007+ XML Format [All Tabs]", type : "xlsx", ext : ".xlsx", size : "multi"},
								xls : {name : "xls", desc : "Excel 2.0 Worksheet Format [Current Tab]", type : "biff2", ext : ".xls", size : "single"}
							}
						}).then(function(option) {
							
							if (option) {
								
								// -- Trigger Loader -- //
								global.interact.busy({target : $("div.tab-content div.tab-pane.active")});
								
								var Workbook = function() {
									if(!(this instanceof Workbook)) return new Workbook();
									this.SheetNames = [];
									this.Sheets = {};
								}
 
								var _exportBook = new Workbook();
								var _title = __sheet.properties.title;
								
								if (option.size == "multi") {
									
									// -- Output all tabs -- //
									var _current = 0;
									var _total = __sheet.sheets.length;

									__sheet.sheets.forEach(function(tab, index) {

										global.google.sheets.values(__sheet.spreadsheetId, tab.properties.title + "!A:ZZ").then(function(data) {

											_exportBook.SheetNames.push(tab.properties.title);
											_exportBook.Sheets[tab.properties.title] = XLSX.utils.aoa_to_sheet(data.values);
											_current += 1
											if (_total == _current) _output(_exportBook, option.type, _title + option.ext);
											
										});
									});
									
								} else if (option.size == "single") {
									
									// -- Output Current tab -- //
									var _current_Tab = $("#sheet_tabs .nav-link.active").text();
									
									__sheet.sheets.forEach(function(tab, index) {

										if (tab.properties.title == _current_Tab) {
											
											global.google.sheets.values(__sheet.spreadsheetId, tab.properties.title + "!A:ZZ").then(function(data) {

												_exportBook.SheetNames.push(tab.properties.title);
												_exportBook.Sheets[tab.properties.title] = XLSX.utils.aoa_to_sheet(data.values);
												_output(_exportBook, option.type, _title + " - " + _current_Tab + option.ext);
											
											});
											
										}
										
									});
									
								}
								
							}
							
						}, function(e) {
							if (e) global.flags.error("Google Sheet Export", e);
							// Clean Up State if required?
						});
						
					}
					
			} else if (command == "CLOSE") {
				
			} else if (command == "INSTRUCTIONS") {
				
				// -- Load the Instructions -- //
				global.display.doc({name : "INSTRUCTIONS", target : global.container, wrapper : "CONTENT_WRAPPER", clear : true});
				
			} else if (command == "SETTINGS") {
				
				/// -- Load the Settings Page (for the time being, actually this will be a template!) -- //
				global.display.doc({name : "SETTINGS", target : global.container, wrapper : "CONTENT_WRAPPER", clear : true});
			
			} else if (command == "SPIN") {
				
				global.interact.busy({target : global.container});

			}
      
    },
    
		// == Functions == //
	}
		
}