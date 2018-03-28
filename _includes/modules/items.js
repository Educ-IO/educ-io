Items = (ಠ_ಠ, app) => {
	"use strict";
	
	/* <!-- Internal Constants --> */
	const SEP = "___", TEST = /___/;
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  const DB = localforage.createInstance({name : "Educ-Recent", version : 1.0, description : "Educ.IO | Recent"});
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _camel = value => value.toLowerCase().replace(/(?:(^.)|(\s+.))/g, match => match.charAt(match.length-1).toUpperCase());
	var _key = (app, key) => app.toUpperCase() + SEP + key;
	var _is = (app, key) => key.indexOf(app.toUpperCase() + SEP) === 0;
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
		add: (key, name, url, details) => DB.setItem(_key(app, key), {
			app: _camel(app),
			name: name,
			url: url,
			date: new Date(),
			date_string: new Date().toDateString(),
			details: details,
			key: _key(app, key)
		}),
		
		last : number => 
			
			new Promise((resolve, reject) => {

				if (app) {
					DB.keys().then(keys => Promise.all(_.chain(keys)
							.filter(key => _is(app, key))
							.map(key => DB.getItem(key))
							.value()).then(values => resolve(_.map(values.sort((a,b) => b.date - a.date).slice(0, number), o => _.omit(o, "app")))))
					.catch(e => reject(e));
				} else {
					DB.keys().then(keys => Promise.all(_.chain(keys)
							.map(key => DB.getItem(key))
							.value()).then(values => resolve(_.each(values.sort((a,b) => b.date - a.date).slice(0, number), o => o.url = "/" + o.app + "/" + o.url))))
					.catch(e => reject(e));
				}

			}),
    
		remove : key => new Promise((resolve, reject) => {
			key = TEST.test(key) ? key : _key(app, key);
			DB.removeItem(key).then(() => resolve(key)).catch(e => ಠ_ಠ.Flags.error("Delete Recent Item Failure", e ? e : "No Inner Error") && reject(e));
		}),
		
		clean : () => {
			if (app) {
				DB.keys().then(keys => {
					_.chain(keys).filter(key => _is(app, key)).each(key => DB.removeItem(key).then(ಠ_ಠ.Flags.log("Cleared Recent Item: " + key)));
				}).catch(e => ಠ_ಠ.Flags.error("App Clear Recent Items Failure", e ? e : "No Inner Error"));
			} else {
				DB.clear().then(() => ಠ_ಠ.Flags.log("Globally Cleared Recent Items")).catch(e => ಠ_ಠ.Flags.error("Global Clear Recent Items Failure", e ? e : "No Inner Error"));	
			}
		}
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};