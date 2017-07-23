App = function() {
	
	// -- Returns an instance of App if required -- //
  if (!(this instanceof App)) {return new App();}
	
	// -- Internal Variables -- //
	var __sheet;
	
	// -- Internal Functions -- //
	var _loadValues = function(id, name, target) {

		global.interact.busy({target : target});
		
		global.google.sheets.values(id, name + "!A:ZZ").then(function(data) {
							
			global.flags.log("Google Sheet Values [" + name + "]", data);
			
			global.db = new loki.Collection("Data");
							
			var _headers = data.values.shift();
			
			global.db.insert(data.values, _headers);
			var _table = {
				classes: ["tablesaw", "tablesaw-sortable", "tablesaw-columntoggle"],
				headers : _headers,
				rows : global.db.chain().data()
			};
			
			global.flags.log("Loki Headers", _table.headers);
			global.flags.log("Loki Values", _table.rows);
	
			// -- Append Table to Display -- //		
			var _display = $(Handlebars.compile($("#table").html())(_table));
			target.append(_display);
	
			// -- Remove the Loader -- //
			global.interact.busy({target : target, clear : true});
			
		}).catch(function(e) {
			
			global.flags.error("Adding Content Table", e);
			
			// -- Remove the Loader -- //
			global.interact.busy({target : target, clear : true});
			
		});
	}
	
	var _showValues = function(e) {
		if (e && e.target) {
			var _source = $(e.target);
			var _tab = $(_source.data("target")).empty(), _id = _source.data("id"), _sheet = _source.data("sheet");
			_loadValues(_id, _sheet, _tab);
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
				$(".tab-pane").css("height", $(window).height() - _height - 10)
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
						global.flags.log("Google Drive File Picked from Open", file);
						global.google.sheets.get(file.id).then(function(sheet) {
							global.flags.log("Google Drive Sheet Opened", sheet);
							_showSheet(sheet);
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
			
			}
      
    },
    
		// == Functions == //
	}
		
}