Page = function() {
	"use strict";

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Page)) return new this.Page().initialise(this);

	/* <!-- Internal Functions --> */
	/* <!-- Internal Functions --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ;
	/* <!-- Internal Variables --> */

	/* <!-- External Visibility --> */
	return {

		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;

			/* <!-- Set Container Reference to this --> */
			container.Page = this;

			/* <!-- Return for Chaining --> */
			return this;

		},

		start: function() {

			$("a[data-tier]").on("click.tier", e => {
				e.preventDefault();
				var _$ = $(e.target),
					_tier = _$.data("tier"),
					_button = _$.data("tier-button"),
					_data = _$.data("tier-data"),
					_details = _$.data("tier-details");
				ಠ_ಠ.Display.modal("subscribe", {
					title: `${_tier} Subscription`,
					message: ಠ_ಠ.Display.doc.get({
						name: "SUBSCRIBE",
					}),
					button: _button,
					data: _data,
					details: _details
				});
			});

		},
		/* <!-- External Functions --> */

	};
	/* <!-- External Visibility --> */
};