Recent = function() {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Recent)) {return new this.Recent().initialise(this);}
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _items;
  /* <!-- Internal Variables --> */
	
	/* <!-- External Visibility --> */
  return {

		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;

			/* <!-- Set Container Reference to this --> */
			container.Recent = this;
			
			/* <!-- Return for Chaining --> */
			return this;

		},

    /* <!-- External Functions --> */
		add: (key, name, url, details, type, icon) => _items.add(key, name, url, details, type, icon),
		
		last : number => _items.last(number),
		
		remove : key => _items.remove(key),
		
		clean : () => _items.clean(),
		
		start : () => _items = ಠ_ಠ.Items(ಠ_ಠ, ಠ_ಠ.Flags.dir())
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};