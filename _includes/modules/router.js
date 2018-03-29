Router = function() {
	
	/* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Router)) {return new this.Router().initialise(this);}
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _last;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _start, _end, _enter = (recent, fn) => {

    /* <!-- Load the Initial Instructions --> */
    var _show = recent => ಠ_ಠ.Display.doc.show({
        name: "README",
        content: recent && recent.length > 0 ? ಠ_ಠ.Display.template.get({
          template: "recent",
          recent: recent
        }) : "",
        target: ಠ_ಠ.container,
        clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
      }), _complete = fn ? fn : () => {};
    
      recent > 0 ?      
        ಠ_ಠ.Recent.last(recent).then(_show).then(_complete).catch((e) => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error")) :
        _show() && _complete();

    };
  
  var _exit = (test, states, fn) => {
		
    if (test && test()) {
			ಠ_ಠ.container.empty() && ಠ_ಠ.Display.state().exit(states).protect("a.jump").off();
			if (fn) fn();
			return true;
		}
    
	};
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {
			
			/* <!-- Get Reference to Container --> */
			ಠ_ಠ = container;
						
			/* <!-- Set Container Reference to this --> */
			ಠ_ಠ.Router = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
    /*
      Options are : {
        name : App Name (for Titles)
        default : Function to execute once entered (after login)
        states : Potential States that should be cleared on exit (e.g. opened),
        test : Tests whether app has been used (for clearning purposes)
        clear : Function to execute once exited / cleared (after logout)
        route : App-Specific Router Command
				instructions : 
      }
    */
		create : options => {
			
			_start = () => _enter(options.recent === undefined ? 5 : options.recent, options.default);
			_end = () => _exit(options.test, options.states ? options.states : [], options.clear);
			
      return command => {
        
        var _handled = true;
        
        if (!command || command === false || command[0] === false || (/PUBLIC/i).test(command)) {

          /* <!-- Clear the existing state (in case of logouts) --> */
          if (command && command[1]) _end();

          /* <!-- Load the Public Instructions --> */
          /* <!-- Don't use handlebar templates here as we may be routed from the controller, and it might not be loaded --> */
          if (!command || !_last || command[0] !== _last[0]) ಠ_ಠ.Display.doc.show({
            wrapper: "PUBLIC",
            name: "FEATURES",
            target: ಠ_ಠ.container,
            clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
          });

        } else if (command === true || (/AUTH/i).test(command)) {

					_start();

        } else if ((/REMOVE/i).test(command) && command[1] && command.length == 2) {

          ಠ_ಠ.Recent.remove(command[1]).then(id => $(`#${id}`).remove());
          
        } else if ((/TUTORIALS/i).test(command)) {

          /* <!-- Load the Tutorials --> */
          ಠ_ಠ.Display.doc.show({
            name: "TUTORIALS",
            title: `Tutorials for ${options.name ? options.name : "App"} ...`,
            target: $("body"),
            wrapper: "MODAL"
          }).modal("show");
          
        } else if ((/INSTRUCTIONS/i).test(command)) {

          /* <!-- Load the Instructions --> */
					var show = (name, title) => ಠ_ಠ.Display.doc.show({
							name: name,
							title: title,
							target: $("body"),
							wrapper: "MODAL"
						}).modal("show");
					
					/* <!-- Process Specific App Instructions --> */
					var _shown = false;
					if (options.instructions && command[1] && command.length > 1) {
						var _match = _.find(options.instructions, value => value.match.test(command[1]));
						if (_match) _shown = true && show(_match.show, _match.title);
					}
					
					/* <!-- Fall-Through --> */
					if (!_shown) show("INSTRUCTIONS", `How to use ${options.name ? options.name : "App"} ...`);
							
        } else if ((/HELP/i).test(command)) { 

          /* <!-- Request Help --> */
          ಠ_ಠ.Help.provide(ಠ_ಠ.Flags.dir());

        } else {
          
          _handled = false;
          
        }

        /* <!-- Record the last command --> */
        _last = command;
        
        /* <!-- Route to App-Specific Command --> */
        if (options.route) options.route(_handled, command);
        
      };
      
		},
    
    clean: restart => _end() && (!restart || _start()),
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};