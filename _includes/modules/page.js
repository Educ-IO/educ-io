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
			
			/* <!-- Set Container Reference to this --> */
			container.Main = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
		start : function() {
			/* <!-- Initialise Objects --> */
			$("[data-toggle='popover']").popover({trigger: "focus"});
			$("[data-toggle='tooltip']").tooltip({});
		},
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};