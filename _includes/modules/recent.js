Recent = function() {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Recent)) {return new this.Recent().initialise(this);}
	
	/* <!-- Internal Constants --> */
	const SEP = "___";
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _db, _app;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _camel = (value) => value.toLowerCase().replace(/(?:(^.)|(\s+.))/g, (match) => match.charAt(match.length-1).toUpperCase());
	var _key = (app, key) => app.toUpperCase() + SEP + key;
	var _is = (app, key) => key.indexOf(app.toUpperCase() + SEP) === 0;
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
		add: (key, name, url, details) => _db.setItem(_key(_app, key), {
			app: _camel(_app),
			name: name,
			url: url,
			date: new Date(),
			date_string: new Date().toDateString(),
			details: details,
			key: _key(_app, key)
		}),
		
		last : (number) => 
			
			new Promise((resolve, reject) => {

				if (_app) {
					_db.keys().then((keys) => Promise.all(_.chain(keys)
							.filter((key) => _is(_app, key))
							.map((key) => _db.getItem(key))
							.value()).then((values) => resolve(_.map(values.sort((a,b) => b.date - a.date).slice(0, number), (o) => _.omit(o, "app")))))
					.catch((e) => reject(e));
				} else {
					_db.keys().then((keys) => Promise.all(_.chain(keys)
							.map((key) => _db.getItem(key))
							.value()).then((values) => resolve(_.each(values.sort((a,b) => b.date - a.date).slice(0, number), (o) => o.url = "/" + o.app + "/" + o.url))))
					.catch((e) => reject(e));
				}

			}),
		
		remove : (key) => _db.removeItem(key),
		
		clean : () => {
			if (_app) {
				_db.keys().then(keys => {
					_.chain(keys).filter((key) => _is(_app, key)).each(key => _db.removeItem(key).then(ಠ_ಠ.Flags.log("Cleared Recent Item: " + key)));
				}).catch((e) => ಠ_ಠ.Flags.error("App Clear Recent Items Failure", e ? e : "No Inner Error"));
			} else {
				_db.clear().then(() => ಠ_ಠ.Flags.log("Globally Cleared Recent Items")).catch((e) => ಠ_ಠ.Flags.error("Global Clear Recent Items Failure", e ? e : "No Inner Error"));	
			}
		},
		
		start : () => {
			_app = ಠ_ಠ.Flags.dir();
			_db = localforage.createInstance({name : "Educ-Recent", version : 1.0, description : "Educ.IO | Recent"});
		}
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};