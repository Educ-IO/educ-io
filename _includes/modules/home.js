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
		
		start : () => {
      
      /* <!-- Activate Carousel --> */	
      $(".carousel").carousel();
      
      /* <!-- Smooth Scroll Anchors --> */	
      if (ಠ_ಠ.Scroll) ಠ_ಠ.Scroll({class: "smooth-scroll"}).start();
      
      /* <!-- Material Button Waves --> */	
      if (window.Waves) {
        Waves.attach(".btn");
        Waves.init();
      }
      
    }
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};