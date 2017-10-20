Fields = function() {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Fields)) return new this.Fields().initialise(this);
	
	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _steps;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _listen = function(form) {
		
		/* <!-- Wire up event / visibility listeners --> */
		form.find("[data-listen]").each(function() {
			var _this = $(this);
			$(_this.data("listen")).off(_this.data("event")).on(_this.data("event"), function () {
				_this.show().siblings("[data-listen]").hide();
			});
		});
		
	};
	
	var _numerical = function(form) {
		
		/* <!-- Wire up numerical fields --> */
		form.find(".alter-numerical").click(function(e) {
			var _this = $(this);
			if (_this.data("target") && _this.data("value")) {
				var _target = $("#" + _this.data("target"));
				var _min = 0;
				if (_target.data("min")) _min = Number(_target.data("min"));
				var _max = Number.MAX_VALUE;
				if (_target.data("max")) _max = Number(_target.data("max"));
				var _suffix = _target.data("suffix");
				var current_Val = _target.val();
				if (current_Val && _suffix) current_Val = current_Val.split(" ")[0];
				if (current_Val) {
					current_Val = Number(current_Val);
				} else {
					current_Val = 0;
				}
				if (current_Val + Number(_this.data("value")) <= _max) current_Val += Number(_this.data("value"));
				if (current_Val <= _min) {
					_target.val("");
				} else if (_suffix) {
					_target.val(current_Val + " " + _suffix);
				} else {
					_target.val(current_Val);
				}
			}
		});
		
	};
	
	var _erase = function(form) {
		
		/* <!-- Wire up eraser actions --> */
		form.find(".eraser").click(function(e) {
			var _this = $(this);
			if (_this.data("target")) $("#" + _this.data("target")).val("").removeClass("invalid");
			if (_this.data("reset")) {
				var _reset = $("#" + _this.data("reset"));
				if (_reset.data("default")) _reset.text(_reset.data("default"));
			}
		});
		
	};
	
	var _radio = function(form) {
		
		/* <!-- Wire up radio fields --> */
		form.find("input[type='radio'], input[type='checkbox']").change(function() {
			var _this = $(this);
			if (_this.data("target")) {
				
				_this.parents("div").find(".to-dim").addClass("md-inactive");
				_this.siblings(".to-dim").removeClass("md-inactive");
				
				if (_this.data("value") && _this.prop("checked")) {
					autosize.update($("#" + _this.data("target")).val(_this.data("value")));
				} else {
					autosize.update($("#" + _this.data("target")).val(""));
				}
				
			}
		});
		
	};
	
	var _menus = function(form) {
		
		form.find("button.dropdown-item, a.dropdown-item").click(function(e) {
			var _this = $(this);
			if (_this.data("target") && _this.data("value")) {
				e.preventDefault();
				$("#" + _this.data("target")).text(_this.data("value"));
			}
		});
		
	};
	
	var _complex = function(form) {
		
		form.find("button.complex-list-add, a.complex-list-add").click(function(e) {
			var _this = $(this);
			var _holder = _this.siblings("textarea"), _details = _holder.val();
			if (_details) {

				/* <!-- Get Type and Defaults --> */
				var _selector = _this.parent().find("button.complex-list-type, a.complex-list-type"), _type = _selector.text(), _default = _selector.data("default");
				if (_type == _default) _type = "";

				/* <!-- Add new Item to List --> */
				var _list = _this.closest(".input-group").siblings(".list-data");
				if (_list.children(".list-item").length === 0) _this.closest(".input-group").children("input[type='checkbox']").prop("checked", true);
				$(ಠ_ಠ.Display.template.get({
					template : "list_item",
					details : _details + (_type ? " [" + _default + ": " + _type + "]": ""),
					type : _this.data("item"),
					delete : "Remove"
				})).appendTo(_list).find("a.delete").click(
					function(e) {
						e.preventDefault();
						if ($(this).parent().siblings(".list-item").length === 0) {
							_this.closest(".input-group").children("input[type='checkbox']").prop("checked", false);
						}
						$(this).parent().remove();
					}
				);
				
				/* <!-- Clear Up ready for next list item --> */
				_holder.off("change.validity.test").removeClass("invalid").val("");
				_selector.text(_default);

			} else {
				
				_holder.addClass("invalid");
				_holder.on("change.validity.test", function() {
					var _this = $(this);
					if (_this.val()) _this.removeClass("invalid");
					_this.off("change.validity.test");
				});
				
			}

		});
		
	}
	
	var _autosize = function(form) {
		autosize(form.find("textarea.resizable"));
	};
	
	var _reveal = function(form) {
		
		/* <!-- Wire up event / visibility listeners --> */
		form.find("[data-reveal]").each(function() {
			$(this).off("change.reveal").on("change.reveal", function() {
				var _target = $(this).data("reveal");
				$($(this).data("reveal")).slideToggle();
			});
		});
											
	};
	
	var _dim = function(form) {
		
		/* <!-- Wire up event / visibility listeners --> */
		form.find(".dim").off("click.dim").on("click.dim", function() {
			var _this = $(this);
			_this.siblings().addClass("dim");
			_this.removeClass("dim");
		});
		
	};
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;
			
			_steps = [
				_listen,
				_numerical,
				_erase,
				_radio,
				_menus,
				_complex,
				_reveal,
				_dim,
				_autosize
			];
			/* <!-- Return for Chaining --> */
			return this;
			
    },
    
    on : (form) => {
			_.each(_steps, (step) => step(form));
			return form;
    },
		
  };
  /* <!-- External Visibility --> */
  
};