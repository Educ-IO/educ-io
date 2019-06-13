Datatable = (ಠ_ಠ, table, options, target, after_update) => {
  "use strict";

  /* <!-- MODULE: Provides a filterable representation of tablular-style data --> */
  /* <!-- PARAMETERS: Receives the global app context, the source table data, options, target element and callback function for post-updates --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore, , Moment or Day.Js | App Scope: Flags, CSS, Dates --> */
  /* <!-- @table = {id, name, data, headers} --> */
  /* <!-- @options = {filters, inverted_Filters, sorts, widths, frozen, readonly, advanced, collapsed, template, removable} --> */

  /* <!-- Internal Consts --> */
  const LARGE_ROWS = 1000,
    FILTER_DELAY = 200,
    defaults = {
      template: "rows",
      filters: {},
      inverted_Filters: {},
      sorts: {},
      classes: [],
      wrapper_Classes: [],
      visibilities: {
        visible: {
          name: "Visible",
          desc: "Show this column"
        },
        initially: {
          name: "Hide",
          desc: "Hide this column, but allow it to be shown",
          menu: true
        },
        now: null,
        always: null
      },
      process: false,
    };
  const TRANSITION = (el, property) =>
    new Promise(resolve => {
      const transitionEnded = e => {
        if (e.propertyName !== property) return;
        el.removeEventListener("transitionend", transitionEnded);
        resolve(el);
      };
      el.addEventListener("transitionend", transitionEnded);
    });
  options = _.defaults(options, defaults);
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  var _filters, _sorts, _advanced, _name, _css;
  /* <!-- Internal Variables --> */

  /* <!-- Initialisation Functions --> */
  var _initialise = () => {

    /* <!-- Get 'Default' Filters and Searches if applicable --> */
    _filters = ಠ_ಠ.Filters({
      normal: options.filters,
      inverted: options.inverted_Filters
    }, ಠ_ಠ);
    _sorts = options.sorts;

    /* <!-- Get 'Default' Filters and Searches if applicable --> */
    _name = (`table_${table.id}`).replace(/[^a-z0-9\-_:.]|^[^a-z]+/gi, "");

    /* <!-- Remove / Create Custom CSS Sheet --> */
    _css = _css ? _css.deleteAll() : ಠ_ಠ.Css({
      suffix: _name
    });

  };
  _initialise(); /* <!-- Run initial variable initialisation --> */
  /* <!-- Initialisation Functions --> */

  /* <!-- Internal Functions --> */
  var _getData = () => {

    ಠ_ಠ.Flags.log("Getting Rows from Data");

    var _rows = table.data.chain();

    _rows = _filters.filter(_rows);

    if (!$.isEmptyObject(_sorts)) {
      ಠ_ಠ.Flags.log("Applying Sorts", _sorts);
      _rows = _rows.compoundsort(Object.keys(_sorts).reduce((sorts, field) => {
        sorts.push([field, _sorts[field].is_desc]);
        return sorts;
      }, []));
    }

    _rows = _rows.data({
      removeMeta: true
    });

    ಠ_ಠ.Flags.log("Data After Filtering & Sorting", _rows);

    return _rows;

  };

  var _getRows = () => {

    var _hides = _.filter(table.headers, f => f.hide());
    ಠ_ಠ.Flags.log("Applying Column Hides", _hides);
    return _getData().map(v => _.noop(_.each(_hides, f => delete v[f.field ? f.field : f.index])) || v);

  };

  var _clearVisibilities = () => {
    _css.delete("table-column-visibility");
    target.find(".to-hide-prefix").removeClass("to-hide-prefix");
  };

  var _toggleColumn = (el, f) => {
    if (el && el.hasClass("to-hide")) {
      var _style = _css.sheet("table-column-visibility");
      var _nth = ":nth-child(" + table.headers.slice(0, el.data("index")).reduce((t, h) => h.hide() ? t : t + 1, 1) + ")";
      var _selector = "table#" + _name + " tr th.table-header" + _nth + ", table#" + _name + " tbody tr td" + _nth;
      el.is(":hidden") ? _css.removeRule(_style, _selector) : _css.addRule(_style, _selector, "display: none !important;");
      return f ? _toggleColumn(f(el), f) : null;
    } else {
      return el;
    }
  };

  var _updateHeaders = (container, defaults, slight) => {

    var query = {
      headers: ".table-header[data-index]",
      filter_forms: ".filter-wrapper .form",
      execute: query => (container ? container.find(query) : target.find(query))
    };
    var _headers = query.execute(query.headers).sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index)),
      _filterForms = query.execute(query.filter_forms);

    var _style = _css.sheet("table-column-tohide");

    _headers.each((i, el) => {

      var _t = $(el),
        _i = parseInt(_t.data("index")),
        _f = _t.data("field");

      if (!slight) {

        if (table.headers[_i].hide(defaults) && _t.parent().is("tr")) {
          var _p = _t.parent().parent();
          if (_t.hasClass("to-hide-prefix")) _t.prev().addClass("to-hide-prefix");
          _t.detach().appendTo(_p);
        } else if (!table.headers[_i].hide(defaults) && _t.parent().hasClass("table-headers")) {
          var _q = _i === 0 ? _t.parents(".table-headers").find("tr")[0] : _t.parents(".table-headers").find("tr .table-header[data-index=" + (_i + 1) + "]")[0];
          _i === 0 ? _t.detach().prependTo(_q) : _t.detach().insertBefore(_q);
          _t.prev().hasClass("to-hide-prefix") ? _t.prev().removeClass("to-hide-prefix") : _t.removeClass("to-hide-prefix");
        }

        /* <!-- Set Visibility --> */
        _t.toggleClass("d-none", table.headers[i].hide(defaults)).toggleClass("to-hide", !!table.headers[i].hide_initially);

        /* <!-- Set Similar Style Rules for Rows --> */
        var _selector = "#" + _name + " tbody tr td:nth-child(" + table.headers.slice(0, _i).reduce((t, h) => h.hide() ? t : t + 1, 1) + ")";
        table.headers[_i].hide_initially ?
          _css.removeRule(_style, _selector).addRule(_style, _selector, "background-color: " + _t.css("background-color") + "; color: " + _t.css("color")) :
          _css.removeRule(_style, _selector);

      }

      /* <!-- Display Relevant Tickbox Togglers on Menu --> */
      var _filterForm = $(_filterForms[i]);
      _.each(["now", "always", "initially"],
        prop => _filterForm.find(`.dropdown-item[data-action='${prop}'] i.toggler`)[table.headers[i][`hide_${prop}`] ? "removeClass" : "addClass"]("d-none"));

      /* <!-- Set Sorts --> */
      _t.toggleClass("sort", !!_sorts[_f]).toggleClass("desc", !!(_sorts[_f] && _sorts[_f].is_desc)).toggleClass("asc", !!(_sorts[_f] && !_sorts[_f].is_desc));

      /* <!-- Set Filters --> */
      var _filter = _filters.get(_f);
      _t.toggleClass("filtered", !!(_filter)).toggleClass("inverse", !!(_filter && _filter.inverted));
      ಠ_ಠ.Flags.debug() && _filter ? _t.attr("title", (_filter.inverted ? "NOT: " : "") + JSON.stringify(_filter.filter)) : _t.removeAttr("title");

    });

    if (!slight) {

      /* <!-- Clear Visibilities (make all toggles visible again) as we're inconsistent with indexing --> */
      _clearVisibilities();

      /* <!-- Collapse by default --> */
      if (options.collapsed) {
        query = ".table-header[data-index].to-hide";
        _.each(container ? container.find(query) : target.find(query), el => {
          if (!el.nextElementSibling || !$(el.nextElementSibling).hasClass("to-hide")) {
            var _target = $(el),
              _last = (_target.hasClass("to-hide") && !_target.hasClass("to-hide-prefix") && _target.nextAll(":not(.to-hide)").length === 0),
              _result = _toggleColumn(_target, el => el.prev());
            if (_last) _result.addClass("to-hide-prefix");
          }
        });
      }

    }

    return container;
  };

  var _updateRows = () => {
    var _rows = $(ಠ_ಠ.Display.template.get(options.template)({
      rows: _getRows(),
      removable: options.removable
    }));
    if (_advanced && _advanced.scroll.toggled()) { /* <!-- Complex Scrolling may have been requested but not initialised --> */
      _advanced.scroll.update(_.map(_rows, e => e.outerHTML));
    } else {
      target.find(`#${_name} tbody`).empty().append(_rows);
      ಠ_ಠ.Display.popovers(target.find("[data-toggle='popover']"), {
        trigger: "focus"
      });
      ಠ_ಠ.Display.tooltips(target.find("[data-toggle='tooltip']"));
    }
    if (after_update) after_update(target);
  };

  var _update = (rows, headers, container, defaults, slight) => {
    if (rows) _updateRows();
    if (headers) _updateHeaders(container, defaults, slight);
    return true;
  };

  var _toggleFilter = (t, force) => {
    t = _.isFunction(t.hasClass) ? t : $(t);
    var _return = force === true || (force !== false && t.hasClass("d-none")) ?
      Promise.resolve(t.removeClass("d-none").find("input[type='text']:visible").first().focus()) :
      TRANSITION(t[0], "opacity").then(el => {
        $(el).addClass("d-none");
      });
    t.toggleClass("o-none", force === true ? false : force === false ? true : null);
    return _return;
  };

  var _clearFilter = t => {
    var _target = $(t);
    _target.parents("div.input-group").find("input[type='text']").val("");
    _toggleFilter(_target.parents("div.form"), false)
      .then(() => {
        _filters.remove(_target.data("field"));
        _update(true, true, target, null, true);
      });
  };

  var _createRows = rows => ಠ_ಠ.Display.template.get(options.template)({
    rows: rows,
    removable: options.removable
  });

  var _createDefaultTable = () => ಠ_ಠ.Display.template.get("table")({
    id: _name,
    links: false,
    classes: options.classes,
    headers: table.headers,
    rows: _createRows(table.data.chain().data({
      removeMeta: true
    }).map(v => {
      _.each(table.headers, (f, i) => {
        if (f.hide_default) delete v[i];
      });
      return v;
    })),
  });

  var _createDisplayFilters = () => ಠ_ಠ.Display.template.get("filters")({
    id: _name,
    headers: table.headers,
    choices: options.visibilities,
    instructions: ಠ_ಠ.Display.doc.get("FILTERS")
  });

  var _createDisplayTable = () => ಠ_ಠ.Display.template.get("table")(_.defaults(
    options.table ? options.table : {}, {
      id: _name,
      links: !options.readonly,
      classes: options.classes.concat(options.widths && options.widths.lengths > 0 ? ["table-fixed-width"] : []),
      headers: table.headers,
      widths: options.widths,
      rows: _createRows(_getRows()),
    }));

  var _showDisplayDataset = (filters, table) => ಠ_ಠ.Display.template.show(_.defaults(
    options.wrapper ? options.wrapper : {}, {
      name: "datatable",
      filters: options.readonly ? "" : filters ? filters : _createDisplayFilters(),
      table: table ? table : _createDisplayTable(),
      target: target,
    }));

  var _virtualScroll = () => {
    _advanced = _advanced ? _advanced : ಠ_ಠ.Table({
      table: target.find("table"),
      outside: target
    }, ಠ_ಠ);
    if (!_advanced.scroll.initialised()) _advanced.scroll.init(target.find("tbody"), options.blocks_to_show, options.rows_to_show);
    _advanced.scroll.toggle().toggled() ? ಠ_ಠ.Display.state().enter("virtual-scroll") : ಠ_ಠ.Display.state().exit("virtual-scroll");
  };

  var _updateFilter = (field, value, target) => {
    value ? _filters.add(field, value) : _filters.remove(field);
    _update(true, true, target, null, true);
  };

  var _showValues = () => {

    /* <!-- Get Table to Display (Updating the Headers at the same time) --> */
    /* <!-- NEED TO APPEND LATER TO STOP VISUAL FLASH OF SCROLLBARS ?? --> */

    var _table = _showDisplayDataset();

    /* <!-- Set Filter Handlers --> */
    var _filter_Timeout = 0;
    _table.find("input.table-search").off("keyup").on("keyup", e => {
      var keycode = ((typeof e.keyCode != "undefined" && e.keyCode) ? e.keyCode : e.which);
      if (keycode === 27) { /* <!-- Escape Key Pressed --> */
        e.preventDefault();
        _clearFilter(e.target);
      } else if (keycode === 13) { /* <!-- Enter Key Pressed --> */
        e.preventDefault();
        _toggleFilter($(e.target).parents("div.form"), false);
      }
    }).off("input").on("input", e => {
      clearTimeout(_filter_Timeout);
      _filter_Timeout = setTimeout(() => {
        if (e && e.target) {
          var _target = $(e.target);
          var _action = _target.data("action");
          var _field = _target.data("field");
          var _value = _target.val();
          if (_action == "filter") _updateFilter(_field, _value, target);
        }
      }, FILTER_DELAY);
    });

    /* <!-- Show/Hide Column (expandable table) --> */
    _table.find(".table-headers").on("click", e => {
      if (e.target.classList.contains("table-header")) {
        var _target = $(e.target),
          _last = (_target.hasClass("to-hide") && !_target.hasClass("to-hide-prefix") && _target.nextAll(":not(.to-hide)").length === 0);
        if (_last) _target.prev().addClass("to-hide-prefix");
        _toggleColumn(_target.hasClass("to-hide") || _target.hasClass("to-hide-prefix") ? (_target.hasClass("to-hide-prefix") ? _target.next() : _target) : _target.prev(), _target.hasClass("to-hide") || _target.hasClass("to-hide-prefix") ? (el) => el.next() : (el) => el.prev());
        if (_target.hasClass("to-hide-prefix")) _target.removeClass("to-hide-prefix");
      }
    });

    /* <!-- Clear Column Filter --> */
    _table.find("button[data-command='clear']").on("click", e => _clearFilter(e.target));

    /* <!-- Close Column Filter --> */
    _table.find("button[data-command='close']").on("click", e => _toggleFilter($(e.target).parents("div.form"), false));

    /* <!-- Apply Table Sort --> */
    _table.find("a[data-command='sort'], button[data-command='sort']").on("click", e => {
      var _target = $(e.target);
      var _field = _target.data("field");
      if (_sorts[_field]) {
        _sorts[_field].is_desc ? delete _sorts[_field] : _sorts[_field].is_desc = true;
      } else {
        _sorts[_field] = {
          is_desc: false
        };
      }
      _update(true, true, target, null, true);
    });

    /* <!-- Update Column Visibility --> */
    _table.find("a[data-command='hide']").on("click", e => {
      var _target = $(e.target);
      var _action = _target.data("action");
      var _field = _target.parent().data("index");
      var _heading = $(`#${_target.parent().data("heading")}`).parent();
      var _complete;
      if (_action == "now") {
        table.headers[_field].hide_now = !table.headers[_field].hide_now;
        _complete = () => {
          if (table.headers[_field].hide_now && _heading.next().is(":hidden")) {
            /* <!-- Clear Visibilities (make all toggles visible again) as we are now inconsistent with indexing --> */
            _clearVisibilities();
          }
        };
      } else if (_action == "always") {
        table.headers[_field].hide_always = !table.headers[_field].hide_always;
        _complete = () => {
          if (table.headers[_field].hide_always && _heading.next().is(":hidden")) {
            /* <!-- Clear Visibilities (make all toggles visible again) as we are now inconsistent with indexing --> */
            _clearVisibilities();
          }
        };
      } else if (_action == "initially") {
        table.headers[_field].hide_initially = !table.headers[_field].hide_initially;
        if (table.headers[_field].hide_initially) {
          _complete = () => {
            if (!options.collapsed && (_heading.prev().is(":hidden") || _heading.next().is(":hidden"))) _toggleColumn(_heading);
          };
        }
      }

      /* <!-- Switch On/Off Togglers --> */
      var _toggler = _target.find("i.toggler"),
        _on = _toggler.hasClass("d-none");
      _target.closest(".dropdown-menu").find("i.toggler").addClass("d-none");
      if (_on) _target.find("i.toggler").removeClass("d-none");
      _toggleFilter(_target.tooltip("hide").parents("div.form"), false);
      _update(true, true, target);
      if (_complete) _complete();
    });

    target.find(".table-header a").on("click", e => {
      e.preventDefault();
      _toggleFilter($(e.target).data("targets"));
    });

    /* <!-- Set up Table --> */
    if (options.advanced) {

      _advanced = _advanced ? _advanced : ಠ_ಠ.Table({
        table: target.find("table"),
        outside: target
      }, ಠ_ಠ);

      /* <!-- Init Scroll Cache for Larger Tables --> */
      if (table.data.count() > LARGE_ROWS) _virtualScroll();

    }

    /* <!-- Collapse Columns if required --> */
    if (options.collapsed) _updateHeaders(target);

  }; /* <!-- End Show --> */

  var _columnVisibility = () => {

    var _choices = options.visibilities;

    ಠ_ಠ.Display.options({
      id: "column_visibilities",
      title: "Column Visibilities",
      action: "Apply",
      instructions: "Please select which columns you wish to be visible from the list below.",
      list: table.headers.map((v) => ({
        name: v.name,
        current: v.hide_always ? _choices.always.name : v.hide_initially ? _choices.initially.name : v.hide_now ? _choices.now.name : _choices.visible.name
      })),
      inline: true,
      choices_label: "Menu for controlling the visibility of this column",
      choices: _choices
    }).then(options => {

      if (options && options.length > 0) {

        /* <!-- Trigger Loader --> */
        var _busy = ಠ_ಠ.Display.busy({
          target: target,
          fn: true
        });

        ಠ_ಠ.Flags.log("Current Headers", table.headers).log("Received Options", options);

        /* <!-- Send List of Columns to hide --> */
        options.forEach(v => table.headers[v.name].set_hide(
          _choices.now && v.value === _choices.now.name,
          _choices.always && v.value === _choices.always.name,
          _choices.initially && v.value === _choices.initially.name));

        /* <!-- Update Visual Display --> */
        _update(true, true);

        /* <!-- Un-Trigger Loader --> */
        _busy();

      }

    }, e => e ? ಠ_ಠ.Flags.error("Select Column Visibility", e) : false);

  };

  /* <!-- Maximum width of table values / jagged array --> */
  var _width = values => _.reduce(values, (ln, row) => Math.max(ln, _.isArray(row) ?
    row.length : 1), 0);

  /* <!-- Expands the array by moving new line break *last* cell values to new column --> */
  var _expand = values => _.map(values, row =>
    _.flatten(_.map(row, (cell, index, row) => cell ?
      index == (row.length - 1) ?
      cell.replace(/\n\n/g, "\n").split("\n") : cell : "")));
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */
  _showValues();

  /* <!-- External Visibility --> */
  return {

    active: () => target.hasClass("active"),

    columns: {
      visibility: () => _columnVisibility()
    },

    close: () => $("style[data-type='generated']").remove(),

    defaults: () => {

      _initialise(); /* <!-- Run initial variable initialisation --> */

      table.headers.forEach(v => v.set_hide ? v.set_hide(v.hide_default, false, false) : false);

      target.find("input.table-search").val("");
      target.find("div.form.column-settings").hide();

      _update(true, true, target, true);

    },

    filter: (field, value) => _updateFilter(field, value),

    freeze: rows_only => {
      if (_advanced) {
        _advanced.freeze.init((options.frozen && !rows_only) ? options.frozen.cols : 0).toggle();
        _advanced.freeze.toggled() ?
          ಠ_ಠ.Display.state().enter(rows_only ? "frozen-rows" : "frozen") :
          ಠ_ಠ.Display.state().exit(rows_only ? "frozen-rows" : "frozen");
      }
    },

    virtual_scroll: () => _virtualScroll(),

    name: () => table.name,

    data: () => _getData(),

    values: filtered => {
      var _html = filtered ? $(_createDisplayTable()) : $(_createDefaultTable());
      var _return = [_.map(_html.find(".table-headers .table-header:not(." + (filtered ? "no-export" : "no-export-default") + ") a").toArray(), el => el.textContent.trim())];
      _html.find("tbody tr").each((i, el) => _return.push(_.map($(el).find("td").toArray(), el => el.textContent.trim())));
      return _return;
    },

    dehydrate: () => ({
      n: table.name,
      f: _filters.normal(),
      e: _filters.inverted(),
      s: _sorts,
      c: table.headers.length,
      r: _.isNumber(options.header_rows && options.header_rows()) ? options.header_rows() : 1,
      z: _.isNumber(options.hide_rows && options.hide_rows()) ? options.hide_rows() : 0,
      h: _.chain(table.headers).filter(h => h.hide(true)).map(h => ({
        n: h.name,
        h: h.hide_always,
        i: h.hide_initially,
        p: h.index
      })).value()
    }),

    update: () => _update(true, true),

    csv: values => {

      const escape = value => value ? value.replace(/"/g, "\"\"") : "",
        process = (row, value, index) => `${row}${index > 0 ? `,"${escape(value)}"` : `"${escape(value)}"`}`;

      return Promise.resolve(_.map(values, values => _.reduce(values, process, "")).join("\n"));

    },

    excel: (values, title, password) => XlsxPopulate.fromBlankAsync().then(book => {
      const rows = values.length,
        columns = _width(values);
      book.sheets()[0]
        .name(title || "Data")
        .range(1, 1, rows + 1, columns + 1)
        .value(values);
      return book.outputAsync(password ? {
        type: "blob",
        password: password
      } : "blob");
    }),

    markdown: values => {

      var output = "|---\n";

      if (values && values.length > 0) {

        /* <!-- Basic Constants --> */

        const max = _width(values),
          escape = value => value ? value.replace(/\|/g, "\\|") : "",
          process = (row, value, index) => `${row}${index > 0 ? ` | ${escape(value)}` : escape(value)}`;

        /* <!-- Output Header Row --> */
        var headers = values.shift(),
          length = _.isArray(headers) ? headers.length : 1;
        headers = headers.concat(max > length ?
          _.map(_.range(max - length), () => "") : []);
        output += `${_.reduce(headers, process, "")}\n`;

        /* <!-- Output Separator Row --> */
        output += `${_.times(headers.length, () => "|:-").join("")}\n"`;

        /* <!-- Output Value Rows --> */
        if (values.length > 0) output += _.map(values, values => _.reduce(values, process, "")).join("\n");

      }

      return Promise.resolve(output);

    },

    width: _width,

    expand: _expand,

  };
  /* <!-- External Visibility --> */

};