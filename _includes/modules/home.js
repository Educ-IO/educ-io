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
			ಠ_ಠ.Main = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
		start : () => $(".carousel").carousel()
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};