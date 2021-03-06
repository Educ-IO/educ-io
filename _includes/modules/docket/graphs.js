Graphs = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle generating analysis graphs --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: D3 --> */

  /* <!-- Internal Constants --> */

  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _margins = (w, h) => ((t, r, b, l) => ({
    top: t,
    right: r,
    bottom: b,
    left: l,
    width: w,
    height: h,
    innerWidth: w - l - r,
    innerHeight: h - t - b
  }))(10, 10, 10, 15);

  var _svg = (holder, margins) => d3.select(holder)
    .append("svg").attr("width", "100%").attr("height", "100%")
      .attr("viewBox",`0 0 ${margins.width} ${margins.height}`)
      .attr("preserveAspectRatio","xMinYMin")
    .append("g").attr("transform", `translate(${margins.left},${margins.top})`);
  
  var _stream = (holder, series, width, height, generate_x, text_x, curve, tooltip, ranged) => {

    /* <!-- Set the SVG Boundary Object --> */
    var margin = _margins(width, height),
      svg = _svg(holder, margin);

    /* <!-- Transform the Data Series --> */
    var _max = 0,
      _series = [],
      _keys = [],
      _data = _.map(_.keys(series).sort(), key => {
        var value = series[key];
        var _return = {
            date: {
              key: key,
              value: value.date
            }
          },
          _count = 0;
        _.each(value.counts, (count, name) => {
          _return[name] = count;
          _count += count;
          if (_series.indexOf(name) < 0) _series.push(name);
          if (!_.find(_keys, value => value.key == key)) _keys.push({
            key: key,
            value: value.date
          });
        });
        _max = Math.max(_max, _count);
        return _return;
      });
    if (_data.length <= 1) return;

    /* <!-- Fill in the Gaps --> */
    _.each(_data, data => _.each(_series, series => data[series] = data[series] === undefined ? 0 : data[series]));

    /* <!-- Generate X and Y axis --> */
    const x = generate_x(_keys, margin),
      y = d3.scaleLinear()
      .domain([0 - _max * 0.8, _max * 0.7])
      .range([margin.innerHeight, 0]);

    var _range = ranged ? x.range([0, margin.innerWidth]) : null;
    
    /* <!-- Finesse the chart --> */
    svg.append("g")
      .attr("transform", "translate(0," + margin.innerHeight * (text_x ? 0.8 : 0.95) + ")")
      .call(d3.axisBottom(x).tickSize(-margin.innerHeight * (text_x ? 0.7 : 0.9)))
      .select(".domain").remove();

    svg.selectAll(".tick line").attr("stroke", "#b8b8b8");

    if (text_x) svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", margin.innerWidth)
      .attr("y", margin.innerHeight - 30)
      .text(text_x);

    var area = d3.area()
      .x(d => x(d.data.date.value))
      .y0(d => y(Number.isNaN(d[0]) ? 0 : d[0]))
      .y1(d => y(Number.isNaN(d[1]) ? Number.isNaN(d[0]) ? 0 : d[0] : d[1]))
      .curve(curve);

    var color = d3.scaleOrdinal()
      .domain(_keys)
      .range(d3.schemeCategory10);

    if (!tooltip || tooltip.length === 0) tooltip = svg
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .style("font-size", 20);

    var part, total, mouse = {

      over: function(e, d) {
        total = _.reduce(d, (total, value) => total += value.data[d.key], 0);
        d3.selectAll(".series-area").style("opacity", 0.2);
        d3.select(this)
          .style("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 1);
      },

      move: (e, d) => {
        var _date = _range && _range.invert ? _range.invert(e.layerX) : null;
        part =  _date ? _.reduce(d, (total, value) => total += value.data.date.value <= _date ? value.data[d.key] : 0, 0) : null;
        tooltip.html(factory.Display.template.get("stats_series")({
          name: d.key,
          total: total,
          part: part,
          date: _date
        }).trim());
      },
      
      leave: () => {
        tooltip.html("");
        d3.selectAll(".series-area").style("opacity", 1).style("stroke", "none");
      },

    };

    var _stacker = d3.stack()
      .keys(_series)
      .offset(d3.stackOffsetSilhouette)
      .order(d3.stackOrderDescending),
      _stack = _stacker(_data);

    svg.selectAll("mylayers")
      .data(_stack)
      .enter()
      .append("path")
      .attr("class", "series-area")
      .style("fill", d => color(d.key))
      .attr("d", area)
      .on("mouseover", mouse.over)
      .on("mousemove", mouse.move)
      .on("mouseleave", mouse.leave);
    
    /* <!-- Vertical Highlighting Line --> */
    var _graph = d3.select(".graph-holder svg"),
        _vertical = _graph
          .append("line")
          .attr("class", "remove")
          .attr("pointer-events", "none")
          .attr("stroke", "yellow")
          .attr("stroke-dasharray", 10)
          .attr("stroke-linecap", "round")
          .attr("stroke-width", "3")
          .attr("opacity", "0.6")
          .attr("x1", "-10")
          .attr("x2", "-10")
          .attr("y1", "0")
          .attr("y2", "100%");
    
    var _scale = margin.width / _graph._groups[0][0].getBoundingClientRect().width,
        _draw = e => {
          var _x = e.pageX * _scale - _graph._groups[0][0].getBoundingClientRect().left;
          _vertical.attr("x1", _x).attr("x2", _x);
        };
    
   _graph
      .on("mousemove", _draw)
      .on("mouseover", _draw)
      .on("mouseleave", () => _vertical.attr("x1", "-10").attr("x2", "-10"));
    /* <!-- Vertical Highlighting Line --> */
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    temporal: (holder, series, width, height, tooltip) => _stream(holder, series, width, height,
      (keys, margin) => d3.scaleTime([keys[0].value, keys[keys.length - 1].value], [0, margin.innerWidth]),
      null, d3.curveCatmullRom, tooltip, true),

    distribution: (holder, series, width, height, tooltip) => _stream(holder, series, width, height,
      (keys, margin) => d3.scaleOrdinal(_.pluck(keys, "value"), _.map(_.range(keys.length), i => margin.innerWidth / (keys.length - 1) * i)),
      null, d3.curveNatural, tooltip, false),

  };
  /* <!-- External Visibility --> */

};