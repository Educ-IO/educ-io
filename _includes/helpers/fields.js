Fields = me => {
	"use strict";

	/* <!-- Internal Constants --> */
	const DATE_FORMAT = "yyyy-mm-dd", DATE_FORMAT_M = DATE_FORMAT.toUpperCase();
	const EVENT_CHANGE_DT = "change.datetime";
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _steps;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _listen = form => {

		/* <!-- Wire up event / visibility listeners --> */
		_.each(form.find("[data-listen]"), input => {
			var _this = $(input);
			$(_this.data("listen")).off(_this.data("event")).on(_this.data("event"), () => {
				_this.show().siblings("[data-listen]").hide();
			});
		});

	};
	
	var _spans = form => {
		
		var _handler = control => {
			
			if (control.data("target") && control.data("value")) {
				
				var _target = $("#" + control.data("target"));
				
				if (_target.data("target")) {
					
					var _span = control.data("span") ? control.data("span") : "";
					_target.data("span", _span);
					
					_target = $("#" + _target.data("target"));
					
					var _start = _target.find("input[name='start']"), _end = _target.find("input[name='end']");
					var _start_Date = _start.val() ? moment(_start.val(), DATE_FORMAT_M) : moment(), _end_Date;
					
					if (_span) {
						
						if (_start_Date.isValid()) {
							
							_end_Date = _start_Date.clone().add(1, _span);
							_start.val(_start_Date.format(DATE_FORMAT_M));
							_end.val(_end_Date.format(DATE_FORMAT_M));

							((start, span, end) => {
								start.off(EVENT_CHANGE_DT).on(EVENT_CHANGE_DT, e => {
									var _value = $(e.currentTarget).val();
									if (_value) {
										_value = moment(_value, DATE_FORMAT_M);
										if (_value.isValid()) end.val(_value.add(1, span).format(DATE_FORMAT_M));
									} else {
										end.val("");
									}
								});
							})(_start, _span, _end);
							
						}
						
					} else {
						
						((start, end) => {
								start.off(EVENT_CHANGE_DT).on(EVENT_CHANGE_DT, e => {
									var _value_S = $(e.currentTarget).val();
									if (_value_S) {
										_value_S = moment(_value_S, DATE_FORMAT_M);
										if (_value_S.isValid()) {
											var _value_E = moment(end.val(), DATE_FORMAT_M);
											if (!end.val() || (_value_E.isValid() && _value_E.isSameOrBefore(_value_S))) 
												end.val(moment(_value_S, DATE_FORMAT_M).add(1, "d").format(DATE_FORMAT_M));
										}
									} else {
										end.val("");
									}
								});
							})(_start, _end);
						
					}
					
				}
				
			}

		};
		
		form.find("button.alter-span, a.alter-span").click(e => _handler($(e.currentTarget)));
		
		form.find("button.alter-span:first-child, a.alter-span:first-child").each((i, el) => _handler($(el)));
		
	};

	var _numerical = form => {

		/* <!-- Wire up numerical fields --> */
		form.find(".alter-numerical").click(e => {
			var _this = $(e.currentTarget);
			if (_this.data("target") && _this.data("value")) {
				
				var _target = $(`#${_this.data("target")}`), 
						_value = Number(_this.data("value"));
				var _min = _target.data("min") ? Number(_target.data("min")) : 0,
						_max = _target.data("max") ? Number(_target.data("max")) : Number.MAX_VALUE;
				
				if (_target.hasClass("input-daterange") && _this.data("modifier")) {
					
					var _modifier = $(`#${_this.data("modifier")}`);
					var _span = _modifier.data("span") ? _modifier.data("span") : "d";
					
					var _start = _target.find("input[name='start']"), _start_Date = _start.val() ? moment(_start.val(), DATE_FORMAT_M) : moment();
					_start.val(_start_Date.add(_value, _span).format(DATE_FORMAT_M)).trigger(EVENT_CHANGE_DT);
					
					
				} else {
					
					var _suffix = _target.data("suffix"), _current = Number(_target.val() ? (_suffix ? _target.val().split(" ")[0] : _target.val()) : 0);
					if (_current + _value <= _max) _current += _value;
					if (_current <= _min) {
						_target.val("");
					} else if (_suffix) {
						_target.val(`${_current} ${_suffix}`);
					} else {
						_target.val(_current);
					}
					if (_target.data("target")) $("#" + _target.data("target")).val(_current <= _min ? 0 : _current);
					
				}
				
			}
		});

	};

	var _erase = form => {

		/* <!-- Wire up eraser actions --> */
		form.find(".eraser").click(e => {
			var _this = $(e.currentTarget), _target = _this.data("target");
			if (_target) {
				$(`#${_target}, #${_target} > input`).val("").removeClass("invalid").filter("textarea.resizable").map((i, el) => autosize.update(el));
			} 
			if (_this.data("reset")) {
				var _reset = $(`#${_this.data("reset")}`);
				if (_reset.data("default")) _reset.text(_reset.data("default"));
			}
		});

	};

	var _radio = form => {

		/* <!-- Wire up radio fields --> */
		form.find("input[type='radio'], input[type='checkbox']").change(e => {
			var _this = $(e.currentTarget);
			if (_this.data("target")) {

				_this.parents("div").find(".to-dim").addClass("md-inactive");
				_this.siblings(".to-dim").removeClass("md-inactive");

				if (_this.data("value") && _this.prop("checked")) {
					autosize.update($(`#${_this.data("target")}`).val(_this.data("value")));
				} else {
					autosize.update($(`#${_this.data("target")}`).val(""));
				}

			}
		});

	};

	var _menus = form => {

		form.find("button.dropdown-item, a.dropdown-item").click(e => {
			var _this = $(e.currentTarget);
			if (_this.data("target") && _this.data("value")) {
				e.preventDefault();
				form.find(`#${_this.data("target")}`).text(_this.data("value"));
			}
		});

	};

	var _complex = form => {

		form.find("button.complex-list-add, a.complex-list-add").click(e => {
			var _this = $(e.currentTarget);
			var _holder = form.find(`#${_this.data("details")}`),
				_details = _holder.val();
			if (_details) {

				/* <!-- Get Type and Defaults --> */
				var _selector = form.find(`#${_this.data("type")}`),
					_type = _selector.text().trim(),
					_default = _selector.data("default");
				if (_type == _default) _type = "";

				/* <!-- Add new Item to List --> */
				var _list = form.find(`#${_this.data("target")}`);
				if (_list.children(".list-item").length === 0) _this.closest(".input-group").children("input[type='checkbox']").prop("checked", true);
				$(ಠ_ಠ.Display.template.get({
					template: "list_item",
					details: `${_details}${_type ? ` [${_default}: ${_type}]` : ""}`,
					type: _this.data("item"),
					delete: "Remove"
				})).appendTo(_list).find("a.delete").click(e => {
						e.preventDefault();
						if ($(e.currentTarget).parent().siblings(".list-item").length === 0) {
							_this.closest(".input-group").children("input[type='checkbox']").prop("checked", false);
						}
						$(e.currentTarget).parent().remove();
					}
				);

				/* <!-- Clear Up ready for next list item --> */
				_holder.off("change.validity.test").val("").removeClass("invalid").filter("textarea.resizable").map((i, el) => autosize.update(el));
				_selector.text(_default);

			} else {

				_holder.addClass("invalid");
				_holder.on("change.validity.test", e => {
					var _this = $(e.currentTarget);
					if (_this.val()) _this.removeClass("invalid");
					_this.off("change.validity.test");
				});

			}

		});

	};

	var _autosize = form => {
		
		form.find("textarea.resizable").on("focus.autosize", e => autosize(e.currentTarget));
		
	};

	var _reveal = form => {

		/* <!-- Wire up event / visibility listeners --> */
		form.find("[data-reveal]").each(e => {
			$(e.currentTarget).off("change.reveal").on("change.reveal", e => {
				$($(e.currentTarget).data("reveal")).slideToggle();
			});
		});

	};

	var _dim = form => {

		/* <!-- Wire up event / visibility listeners --> */
		form.find(".dim").off("click.dim").on("click.dim", e => {
			var _this = $(e.currentTarget);
			if (_this.hasClass("dim")) {
				_this.siblings().addClass("dim").find("button, a[type='button']").prop("disabled", true);
				_this.removeClass("dim").find("button, a[type='button']").prop("disabled", false);	
			}
		});

	};

	var _me = form => {

		form.find(".textual-input-button[data-action='me']").off("click.me").on("click.me", e => {
			if (me) $(`#${$(e.currentTarget).data("target")}`).val(me());
		});

	};

	var _datetime = form => {

		if ($.fn.datepicker) form.find("div.dt-picker, input.dt-picker").datepicker({
			format: DATE_FORMAT,
			todayBtn: "linked",
			todayHighlight: true,
			autoclose: true
		});

	};
	
	
	_steps = [
		_listen, _numerical, _erase, _radio, _menus,
		_complex, _reveal, _dim, _autosize, _me, _datetime,
		_spans
	];
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		on: form => {
			_.each(_steps, step => step(form));
			return form;
		},

	};
	/* <!-- External Visibility --> */

};