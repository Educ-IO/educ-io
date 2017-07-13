App = function() {
	
	// -- Returns an instance of App if required -- //
  if (!(this instanceof App)) {return new App();}
	
	// -- Internal Variables -- //
	var __docs = "/docs/view/", __scroll, __headers, __content, __sheet;
	
	// -- Internal Functions -- //
	var _display = function(value) {

		$("<div />", {class : "row"}).append(
			$("<div />", {class : "col-12"}).html(
				new showdown.Converter().makeHtml(value)
			)
		).appendTo(
			$("<div />", {"class" : "container"})
				.appendTo(global.container.empty()
			)
		);

	}
	
	var _fitHeaders = (function() {
  	var _prev = [];
  	return function() {
    	
			var _first = __content.find("tr:not(.clusterize-extra-row):first");
    	
			var _width = [];
    	_first.children().each(function() {
					global.flags.log($(this).text(), $(this).width());
      		_width.push($(this).width());
    	});
			
    	if (_width.toString() == _prev.toString()) return;
			__headers.find("tr").children().each(function(i) {
				$(this).width(_width[i]);
			});
    	_prev = _width;
  	}
	})();

	var _setWidth = function() {
  	__headers.width(__content.width());
	}

	var _setLeft = function(value) {
  	__headers.css("margin-left", -value);
	}
	
	var _loadValues = function(id, name, target, suffix) {

		var _loader = $("<div />", {class : "loader"}).css("height", $(window).height() - $("#site_nav, #sheet_tab").height() - 120).append($("<div />", {class : "loading"})).appendTo(target);
		
		global.google.sheets.values(id, name + "!A:ZZ").then(function(data) {
							
			global.flags.log("Google Sheet Values [" + name + "]", data);
			global.db = new loki.Collection("Data");
							
			var _headers = data.values.shift();
			global.db.insert(data.values, _headers);
			global.flags.log("Loki Values", global.db.chain().data());
			
			// -- Remove the Loader -- //
			if(_loader) _loader.remove();
			
			var _headings = $("<tr />");
			_headers.forEach(function(cell) {
				_headings.append($("<td />").text(cell));
			});
			__headers = $("<div />", {id : "table-headings_" + suffix, class : "clusterize-headers"})
				.append($("<table />", {class : "table"}).append($("<thead />", {class : "thead-default"}).append(_headings)))
				.appendTo(target);
							
			__content = $("<tbody />", {id : "table-content_" + suffix, class : "clusterize-content"});
			__scroll = $("<div />", {id : "table-scroll_" + suffix, class : "clusterize-scroll"})
				.css("max-height", $(window).height() - $("#site_nav, #sheet_tabs, #table-headings_" + suffix).height() - 1)
				.append($("<table />", {class : "table table-striped"}).append(__content))
				.appendTo(target);

			// -- Handle Screen / Window Resize Events -- //
			var resize_Timeout = 0;
			$(window).off("resize").on("resize", function() {
				clearTimeout(resize_Timeout);
				resize_Timeout = setTimeout(function() {
					$(".clusterize-scroll").css("max-height", $(window).height() - $("#site_nav, #sheet_tab, #table-headings_" + suffix).height() - 1)
					if (global.clusterize) global.clusterize.refresh();
				}, 100);
			});
							
			// -- Handle Scroll -- //
			__scroll.off("scroll").on("scroll", (function() {
				var _prev = 0;
				return function() {
					var _left = $(this).scrollLeft();
					if (_left == _prev) return;
					_prev = _left;
					_setLeft(_left);
				}
			}()));
							
			var _data = [];
							
			global.db.chain().data().forEach(function(row) {
				var _row = $("<tr />");
				row.forEach(function(cell) {
					_row.append($("<td />").text(cell));
				});
				_data.push(_row.prop("outerHTML"));
			});
							
			global.flags.log("Clusterize Data", _data);

			global.clusterize = new Clusterize({
				scrollId: "table-scroll_" + suffix,
				contentId: "table-content_" + suffix,
				rows : _data,
				callbacks: {
					clusterChanged: function() {
						_fitHeaders();
						_setWidth();
					}
				}
			});
							
		});
	}
	
	var _showSheet = function(sheet) {
		
		// -- Need to write load handler for tabs - and invoke first one?
		
		var _holder = $("<div />", {"class" : "container-fluid"})
										.appendTo(global.container.empty()
									);
		
		var _navs = $("<ul />", {id : "sheet_tabs","class" : "nav nav-tabs", "role" : "tablist"}).appendTo(_holder);
		var _tabs = $("<div />", {"class" : "tab-content"}).appendTo(_holder);
		
		sheet.sheets.forEach(function(tab, index) {
			
			$("<li />", {"class" : "nav-item"})
				.append(
					$("<a />", {"class" : "nav-link" + (index === 0 ? " active" : ""), "href" : "#tab_" + index, "role" : "tab", "data-toggle" : "tab", "text" : tab.properties.title})
					.data("id", sheet.spreadsheetId)
					.data("sheet", tab.properties.title)
					.data("target", "#tab_" + index)
					.on("click", function(e) {
						
						var _target = $(e.target);
						var _tab = $(_target.data("target")).empty();
						var _id = _target.data("id");
						var _sheet = _target.data("sheet");
						
						_loadValues(_id, _sheet, _tab, index);
					
					})
				)
				.appendTo(_navs);
		
			$("<div />", {"id" : "tab_" + index, "class" : "tab-pane fade" + (index === 0 ? " show active" : ""), "role" : "tabpanel"}).appendTo(_tabs);
	
		});
		
		// -- Load Initial Values -- //
		_loadValues(sheet.spreadsheetId, sheet.sheets[0].properties.title, $("#tab_0").empty(), 0);
		
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
				$.ajax({
					url: __docs + "PUBLIC.md", type: "get", dataType: "html",
					async: true, success: function(result) {
						if (result) _display(result);
					}
				});
				
			} else if (command === true || command == "AUTH") {
				
				// -- Load the Initial Instructions -- //
				$.ajax({
					url: __docs + "README.md", type: "get", dataType: "html",
					async: true, success: function(result) {
						if (result) _display(result);
					}
				});
				
			} else if (command == "OPEN") {
				
				// -- Open Sheet from Google Drive Picker -- //
				global.google.pick(
					"Select a Sheet to Open", false, 
					function() {return [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED]},
					function(file) {
						global.flags.log("Google Drive File Picked from Open", file);
						global.google.sheets.get(file.id).then(function(sheet) {
							global.flags.log("Google Drive Sheet Opened", sheet);
							__sheet = sheet;
							_showSheet(sheet);
						});
					}
				);
					
			} else if (command == "EXPORT") {
				
					if (__sheet) {
						
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

						var Workbook = function() {
							if(!(this instanceof Workbook)) return new Workbook();
							this.SheetNames = [];
							this.Sheets = {};
						}
 
						var _exportBook = new Workbook();
						var _current = 0;
						var _total = __sheet.sheets.length;
					
						__sheet.sheets.forEach(function(tab, index) {
							global.google.sheets.values(__sheet.spreadsheetId, tab.properties.title + "!A:ZZ").then(function(data) {
								
								_exportBook.SheetNames.push(tab.properties.title);
								_exportBook.Sheets[tab.properties.title] = XLSX.utils.aoa_to_sheet(data.values);
								_current += 1
								if (_total == _current) {
									// Need to make decision here?
									global.interact.choose({
										title : "Please Select an Output Format",
										action: "Export",
										options: {
											csv : {name : "csv", desc : "Export to Comma Separated Value Format", type : "csv", ext : ".csv"},
											ods : {name : "ods", desc : "Export to 	OpenDocument Spreadsheet Format", type : "ods", ext : ".ods"},
											xlml : {name : "xlml", desc : "Export to Excel 2003-2004 (SpreadsheetML) Format", type : "xlml", ext : ".xls"},
											xlsb: {name : "xlsb", desc : "Export to	Ecel 2007+ Binary Format", type : "xlsb", ext : ".xlsb"},
											xlsx : {name : "xlsx", desc : "Export to Excel 2007+ XML Format", type : "xlsx", ext : ".xlsx"},
											xls : {name : "xls", desc : "Export to Excel 2.0 Worksheet Format", type : "biff2", ext : ".xls"}
										}
									}).then(function(option) {
										if (option) {
											var wbout = XLSX.write(_exportBook, {bookType: option.type, bookSST : true, type : "binary"});
											try {
												saveAs(new Blob([_s2ab(wbout)],{type:"application/octet-stream"}), __sheet.properties.title + option.ext); // Need to put name of sheet in here.
											} catch(e) {
												global.flags.error("Google Sheet Export", e);
											}
										}
									}, function() {
										// Clean Up State if required
									});
									
								}
							});
						});
					}
					
			} else if (command == "CLOSE") {
				
			} else if (command == "INSTRUCTIONS") {
				
				// -- Load the Instructions -- //
				$.ajax({
					url: __docs + "INSTRUCTIONS.md", type: "get", dataType: "html",
						async: true, success: function(result) {
						if (result) _display(result);
					}
				});
				
			} else if (command == "SETTINGS") {
				
				// -- TODO: Something here -- //
				_display();
				
			}
      
    },
    
		// == Functions == //
	}
		
}