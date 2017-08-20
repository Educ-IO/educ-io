Recent = function() {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Recent)) {return new this.Recent().initialise(this);}
	
	/* <!-- Internal Constants --> */
	const SEP = "___";
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _db;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	/* <!-- Internal Functions --> */
	
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
		add : (app, key, name, url, details) => _db.setItem(app.toUpperCase() + SEP + key, {app : app, name : name, url : url, date : new Date(), date_string : new Date().toDateString(), details : details, key : app.toUpperCase() + SEP + key}),
		
		last : (app, number) => 
			
			new Promise((resolve, reject) => {

				if (app) {
					_db.keys().then((keys) => Promise.all(_.chain(keys)
							.filter((k) => k.startsWith(app.toUpperCase() + SEP))
							.map((k) => _db.getItem(k))
							.value()).then((values) => resolve(_.map(values.sort((a,b) => b.date - a.date).slice(0, number), (o) => _.omit(o, "app")))))
					.catch((e) => reject(e));
				} else {
					_db.keys().then((keys) => Promise.all(_.chain(keys)
							.map((k) => _db.getItem(k))
							.value()).then((values) => resolve(_.each(values.sort((a,b) => b.date - a.date).slice(0, number), (o) => o.url = "/" + o.app + "/" + o.url))))
					.catch((e) => reject(e));
				}

			}),
		
		remove : (key) => _db.removeItem(key),
		
		clean : () => _db.clear().then(() => ಠ_ಠ.Flags.log("Cleared Recent Items")).catch((e) => ಠ_ಠ.Flags.error("Clear Recent Items Failure", e ? e : "No Inner Error")),
		
		start : () => {_db = localforage.createInstance({name : "Educ-Recent", version : 1.0, description : "Educ.IO | Recent"});}
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};