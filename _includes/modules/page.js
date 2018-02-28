Main = function() {
	
	/* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Main)) {return new this.Main().initialise(this);}
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {
			
			/* <!-- Get Reference to Container --> */
			ಠ_ಠ = container;
			
			/* <!-- Initialise Objects --> */
			if (ಠ_ಠ.Page) ಠ_ಠ.Page();
			
			/* <!-- Set Container Reference to this --> */
			ಠ_ಠ.Main = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
		start : function() {
			
						/* <!-- Get Global Flags --> */
			ಠ_ಠ.Flags.initialise().then(function(flags) {

				ಠ_ಠ.Flags = flags;

				/* <!-- Module Starts --> */
				(ಠ_ಠ.Page ? [ಠ_ಠ.Display, ಠ_ಠ.Page] : [ಠ_ಠ.Display])
					.forEach((m) => {if (m && m.start) m.start();});
				
				/* <!-- Handle Highlights --> */	
				if (ಠ_ಠ.Flags.highlight()) {
					var _none = "highlight_none order-2";
					var _highlight = "order-1";
					$(".highlight_all").addClass(_none).removeClass(_highlight)
						.filter(".highlight_" + ಠ_ಠ.Flags.highlight().toLowerCase()).removeClass(_none).addClass(_highlight);
				}
				
			});
		},
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};