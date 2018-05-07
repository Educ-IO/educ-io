Table = (options, factory) => {
	"use strict";
	
	/* <!-- HELPER: Provides customised table behaviour (e.g. cached rendering) --> */
	/* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- PARAMETERS: Receives the table element, the containing (outside) element and a css helper factory function --> */
	/* <!-- @options.table: The table element --> */
	/* <!-- @options.outside: The containing (outside) element --> */
	/* <!-- @factory.Css: Function to create a css helper object --> */
	/* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
	/* <!-- REQUIRES: Factory Scope: Css helper --> */
	
	/* <!-- Internal Constants --> */
	const TAG = "tr", EMPTY_CLASS = "empty-rows", EMPTY_TEXT = "No rows";
	/* <!-- Internal Constants --> */
	
	/* <!-- Convert to JQuery --> */
	var $$ = element => (element instanceof jQuery === true) ? element : $(element);
	
	/* <!-- Internal Variables --> */
	var _table = $$(options.table), _outside = $$(options.outside), _css = factory.Css(_outside.id, _outside.id);
	
	/* <!-- Internal Scroll Variables --> */
	var  _rows, _cache, _content, _rows_in_block,	_blocks_in_cluster, _rows_in_cluster, _row_height, _block_height, _cluster_height,
			_last_cluster = false, _last_time = false, _bounce_Count = 0, _scroll_top, mac = navigator.platform.toLowerCase().indexOf("mac") + 1;
	
	/* <!-- Internal Freeze Variables --> */
	var _frozen_Cols;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var getStyle = (prop, elem) => {
    return window.getComputedStyle ? window.getComputedStyle(elem)[prop] : elem.currentStyle[prop];
  };
	
  var checkChanges = (type, value, cache) => {
		var changed = value != cache[type];
		cache[type] = value;
		return changed;
	};

	var html = data => _content.html(data);
	
	var getRowsHeight = rows => {
		var prev_row_height = _row_height;
		_cluster_height = 0;
		if( ! rows.length) return;
		var nodes = _content[0].children;
		/* <!-- TODO: Node can sometimes be null? --> */
		var node = nodes[Math.floor(nodes.length / 2)];
		_row_height = node.offsetHeight;
		if(getStyle("borderCollapse", _content[0]) != "collapse")
			_row_height += parseInt(getStyle("borderSpacing", _content[0]), 10) || 0;
		_block_height = _row_height * _rows_in_block;
		_rows_in_cluster = _blocks_in_cluster * _rows_in_block;
		_cluster_height = _blocks_in_cluster * _block_height;
		return prev_row_height != _row_height;
	};

  var getClusterNum = () => {
		_scroll_top = _outside[0].scrollTop;
		var _cluster_Num = _scroll_top / (_cluster_height - _block_height);
		_cluster_Num = (Math.ceil(_cluster_Num) - _cluster_Num <= 0.01) ? Math.round(_cluster_Num) : Math.floor(_cluster_Num);
		return _cluster_Num || 0;
	};
	
	var generateEmptyRow = () => {
		var empty_row = document.createElement(TAG),
			no_data_content = document.createTextNode(EMPTY_TEXT), td;
		empty_row.className = EMPTY_CLASS;
		td = document.createElement("td");
		td.colSpan = 100;
		td.appendChild(no_data_content);
		empty_row.appendChild(td || no_data_content);
		return [empty_row.outerHTML];
	};
	
	var generate = (rows, cluster_num) => {
		var rows_len = rows.length;
		if (rows_len < _rows_in_block) {
			return {
				top_offset: 0,
				bottom_offset: 0,
				rows_above: 0,
				rows: rows_len ? rows : generateEmptyRow()
			};
		}
		var items_start = Math.max((_rows_in_cluster - _rows_in_block) * cluster_num, 0),
			items_end = items_start + _rows_in_cluster,
			top_offset = Math.max(items_start * _row_height, 0),
			bottom_offset = Math.max((rows_len - items_end) * _row_height, 0),
			this_cluster_rows = [],
			rows_above = items_start;
		if(top_offset < 1) {
			rows_above++;
		}
		for (var i = items_start; i < items_end; i++) {
			rows[i] && this_cluster_rows.push(rows[i]);
		}
		return {
			top_offset: top_offset,
			bottom_offset: bottom_offset,
			rows_above: rows_above,
			rows: this_cluster_rows
		};
	};
			
	var renderExtraTag = (class_name, height) => {
		var tag = document.createElement(TAG);
		tag.className = ["extra-row", class_name].join(" ");
		height && (tag.style.height = height + "px");
		return tag.outerHTML;
	};
	
	var insertToDOM = (rows, cache) => {
		
		if(!_cluster_height && rows.length) getRowsHeight(rows);
		
		var data = generate(rows, getClusterNum()),
			this_cluster_rows = data.rows.join(""),
			this_cluster_content_changed = checkChanges("data", this_cluster_rows, cache),
			top_offset_changed = checkChanges("top", data.top_offset, cache),
			only_bottom_offset_changed = checkChanges("bottom", data.bottom_offset, cache),
			layout = [];

		if(this_cluster_content_changed || top_offset_changed) {
			if(data.top_offset) {
				layout.push(renderExtraTag("keep-parity"));
				layout.push(renderExtraTag("top-space", data.top_offset));
			}
			layout.push(this_cluster_rows);
			data.bottom_offset && layout.push(renderExtraTag("bottom-space", data.bottom_offset));
			html(layout.join(""));
		} else if(only_bottom_offset_changed) {
			_content[0].lastChild.style.height = data.bottom_offset + "px";
		}
		
	};
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {
		
		scroll : {
			
			/* <!-- External Functions --> */
			init : function(content, clusterBlocks, blockRows) {

				/* <!-- Set up Variable --> */
				_content = content ? $$(content) : _table.find("tbody");
				_blocks_in_cluster = _.isNull(clusterBlocks) || _.isUndefined(clusterBlocks) ? 2 : clusterBlocks;
				_rows_in_block = _.isNull(blockRows) || _.isUndefined(blockRows) ? 20 : blockRows;
				
				/* <!-- Return for Chaining --> */
				return this;
				
			},
			
			initialised : () => _content ? true : false,
			
			toggled : ()  => _content && _rows ? true : false,
				
			toggle : function(toggle) {
				
				if (toggle === false || _rows) {

					_outside.off("scroll.scroller");
					$(window).off("resize.scroller");
					
					html(_rows.join("\r\n"));
					
					_cache = null;
					_rows = null;
					
				} else {

					_cache = {};
					_rows = [];
					
					if(_content.attr("tabindex") === undefined) _content.attr("tabindex", 0);
					_.each(_content.children("tr"), el => _rows.push(el.outerHTML));
					
					var _initial_scroll_top = _outside[0].scrollTop;
					insertToDOM(_rows, _cache);
					_outside[0].scrollTop = _initial_scroll_top;

					var pointer_events_set = false;
					_outside.on("scroll.scroller", e => {
						
						/* <!-- TODO: Can get into a loop here in certain circumstances, so check the time shift is above 40ms --> */
						if ((e.timeStamp - _last_time) < 50 && (++_bounce_Count >= 2)) return (_bounce_Count = 0);
						
						if (mac) {
								if( ! pointer_events_set) _content[0].style.pointerEvents = "none";
								pointer_events_set = true;
								_.debounce(() => {
									_content[0].style.pointerEvents = "auto";
										pointer_events_set = false;
								}, 50);
						}
						if (_last_cluster != (_last_cluster = getClusterNum())) (_last_time = e.timeStamp) && insertToDOM(_rows, _cache);
					});
					var _refresh = this.refresh;
					$(window).on("resize.scroller", () => _.debounce(_refresh, 100));
					
				}
				
				/* <!-- Return for Chaining --> */
				return this;
				
			},
			
			refresh : function(force) {
				return (getRowsHeight(_rows) || force) ? this.update(_rows) : this;
			},
			
			update : function(new_rows) {
				
				_rows = _.isArray(new_rows) ? new_rows : [];
				var scroll_top = _outside[0].scrollTop;

				if(_rows.length * _row_height < scroll_top) {
					_outside[0].scrollTop = 0;
					_last_cluster = 0;
				}
				if (_content) insertToDOM(_rows, _cache);
				_outside[0].scrollTop = scroll_top;
				
				/* <!-- Return for Chaining --> */
				return this;
				
			},
			
			clear : function() {
				return this.update([]);
			},
			/* <!-- External Functions --> */
			
		},
		
		freeze : {
			
			/* <!-- External Functions --> */
			init : function(cols) {
				
				/* <!-- Set up Variable --> */
				_frozen_Cols = _.isNull(cols) ? 0 : cols;
				
				/* <!-- Return for Chaining --> */
				return this;
				
			},
			
			toggled : () => !!_css.hasStyleSheet("table-freeze"),
			
			toggle : function(toggle) {
				
				if (toggle === false || _css.hasStyleSheet("table-freeze")) {
				
					_css.delete("table-freeze");
					_outside.off("scroll.frozen");

				} else {

					var _id = _table.attr("id");
					var _style = _css.sheet("table-freeze");
					var _cols = _frozen_Cols, _left = 0, _top = 0, _widths = [], _heights = [], _margins_left = [], _table_Width =  parseInt(_table.css("width"), 10), _scroll_Width = parseInt(_outside.css("width"), 10);

					_table.find("tr").each(function(i) {
						_heights[i] = parseInt($(this).css("height"), 10);
						if (i === 0) {
							_top += _heights[i];
							$("th", $(this)).each(function(j) {
								_widths[j] = parseInt($(this).css("width"), 10);
								if(j < _cols) _left += _widths[j];
							});
						}
					});

					var getMargins = function(dimensions, margins, overall) {
						$.each(dimensions, function(key) {
							if (key === 0) {
								margins[key] = overall;
							} else {
								var next_margin = 0;
								$.each(dimensions, function(key_next, value_next) {
									if(key_next < key) next_margin += value_next;
								});
								margins[key] = overall - next_margin;
							}
						});
						return margins;
					};

					_margins_left = getMargins(_widths, _margins_left, _left);

					var _p = (selector) => "table#" + _id + (selector ? " " + selector : "");

					_css
						.addRule(_style, _p(), "table-layout: fixed; display: flex; flex-flow: column; padding-top: " + (_top ? _top : 0) + "px; padding-left: " + (_left ? _left : 0) + "px;")
						.addRule(_style, _p(), "min-width: " + (_table_Width) + "px; max-width: " + (_table_Width) + "px;")
						.addRule(_style, _p("tbody"), "min-width: " + (_table_Width - _left) + "px; max-width: " + (_table_Width - _left) + "px;")
						.addRule(_style, _p("thead"), "margin-top: -" + (_top ? _top : 0) + "px; position: fixed; overflow-x: hidden;")
						.addRule(_style, _p("thead.table-headers"), "margin-left: -" + (_left ? _left : 0) + "px; width: " + _scroll_Width + "px;")
						.addRule(_style, _p("thead tr th"), "justify-content: center;")
						.addRule(_style, _p("thead tr, ") + _p("tbody tr"), "display: flex; flex-flow: row;")
						.addRule(_style, _p("tbody tr, ") + _p("tbody tr td"), "z-index: -1;")
						.addRule(_style, _p("tbody tr td"), "min-height: " + _heights[1] + "px; max-height: " + _heights[1] + "px;")
						.addRule(_style, _p("thead tr th, ") + _p("tbody tr td"), "display: flex; flex: 1; flex-flow: row; align-items: center;");

					for (var i = 0; i < _widths.length; i++) {
						_css.addRule(_style, _p("td:nth-child(" + (i+1) + "), ") + _p("th:nth-child(" + (i+1) + ")"), "min-width: " + _widths[i] + "px; max-width: " + _widths[i] + "px;");
					}

					for (i = 0; i < _cols; i++) {
						_css.addRule(_style,  _p("tbody tr td:nth-child(" + (i+1) + ")"), "margin-left: -" + _margins_left[i] + "px; position: fixed; background-color: #ffffff; z-index: 0;");
					}

					var __t = 0, __l = 0;
					var _scroll = _.debounce(function (e) {
						var _t = e.target.scrollTop, _l = _left + e.target.scrollLeft;
						if (_l != __l) _css.removeRule(_style,  _p("thead.table-headers"))
							.addRule(_style, _p("thead.table-headers"), "margin-left: -" + _l + "px; width: " + (_scroll_Width + e.target.scrollLeft) + "px;");
						if (_t != __t) for (i = 0; i < _cols; i++) _css.removeRule(_style,  _p("tr td:nth-child(" + (i+1) + ")"))
							.addRule(_style,  _p("tr td:nth-child(" + (i+1) + ")"), "margin-top: -" + _t + "px;");
						__t = _t, __l = _l;
					}, 20);
					_outside.off("scroll.frozen").on("scroll.frozen", _scroll);

				}
				
				/* <!-- Return for Chaining --> */
				return this;
				
			},
			/* <!-- External Functions --> */
			
		}
		
	};
	
};