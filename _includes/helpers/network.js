Network = (options, factory) => {
	"use strict";
	
	/* <!-- HELPER: Provides HTTP methods to call APIs, with concurrency and rate limiting functionality --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
	/* <!-- @options.base = base url for requests to be made against (e.g. https://api.example.com) --> */
	/* <!-- @options.timeout = wait period (in ms) before request times out (after calling, not submission) --> */
	/* <!-- @options.per_sec = number of requests that should be made per second (max) --> */
	/* <!-- @options.concurrent = number of simultaneous non-resolved requests that should be made --> */
	/* <!-- @options.retry = method that takes a response and returns a promise, which will resolve to a truthy value if the request is to be re-tried. Used to detect custom rate limit responses etc. [optional] --> */
	/* <!-- @options.type = default fetch mode (e.g. cors, by default) --> */
	/* <!-- REQUIRES: Global Scope: Underscore --> */
	
	/* <!-- Default Constants --> */
	const DEFAULTS = {
		timeout : 60000,
		concurrent : 0,
		retry : 0,
		type: "cors"
	};
	/* <!-- Default Constants --> */
	
	/* <!-- Backoff Constants --> */
	const RETRY_MAX = 10;
	const RETRY_WAIT_LOWER = 500;
	const RETRY_WAIT_UPPER = 10000;
	/* <!-- Backoff Constants --> */

	/* <!-- Internal Constants --> */
	const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));
	const RANDOM = (lower, higher) => Math.random() * (higher - lower) + lower;
	const QUERY = (value, append) => _.reduce(_.keys(value),
					(str, key, i) => `${str}${(i === 0 && !append) ? "?" : "&"}${encodeURIComponent(key)}=${encodeURIComponent(value[key])}`, "");
	/* <!-- Internal Constants --> */

	/* <!-- Limiter = Rate Limited Requests --> */
	const LIMITER = ((rate, concurrent) => {

		var last = 0,
			queue = [],
			running = [],
			total = 0;

		var _execute = run => {
			running.push(run) && run.promise()
				.then(r => run.resolve(r))
				.catch(e => run.reject(e))
				.then(() => running = _.reject(running, r => r.id == run.id));
		};

		var _dequeue = function() {
			if (queue.length > 0) {
				var elapsed = new Date() - last;
				if ((concurrent <= 0 || running.length < concurrent) && elapsed >= rate) {
					(last = new Date()) && _execute(queue.shift());
				} else {
					setTimeout(function() {
						_dequeue();
					}.bind(this), Math.max(rate - elapsed, 0));
				}
			}
		};

		var _add = (promise, details, id) => new Promise((resolve, reject) => {
			queue.push({
				id: id,
				resolve: resolve,
				reject: reject,
				promise: promise,
				details: details
			});
			_dequeue();
		});

		return {
			
			add: (promises, details) => _add(promises, details, total += 1),
			
			status : () => ({
				queue: queue.length,
				running: running.length,
				last: last,
				rate: rate,
				concurrent: concurrent,
				total: total
			})
			
		};

	})(options.per_sec ? 1000 / options.per_sec : 0, options.concurrent ? options.concurrent : 0);
	/* <!-- Limiter = Rate Limited Requests --> */

	/* <!-- Internal Variables --> */
	options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
	var _before, _check;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _request = function(verb, url, data, contentType, responseType) {

		verb = verb.toUpperCase();
			var _url = new URL(url, options.base), _request = {
				mode: options.type,
				method: verb,
				headers: {
					"Content-Type": contentType ? contentType : "application/json"
				},
				redirect: "follow",
				body: verb != "GET" ? !contentType || contentType == "application/json" ? JSON.stringify(data) : data : null
			}, _target = _url.href + (data && verb == "GET" && !contentType ? QUERY(data, _url.href.indexOf("?") > 0) : "");
		
		var _promise = () => {
			
			var _fetch = new Promise((resolve, reject) => {

				/* <!-- Extra Headers (e.g. Auth) are set here --> */
				if (_before) _before(_request);

				var a = RETRY_MAX;

				var _failure = e => reject({url: _url.href, error: e}), _success = response => {

					/* <!-- Fetch Executed, but may have returned a non-200 status code --> */
					if (response.ok) {

						if (response.status == 204) {
							resolve(true);
						} else {
							var _response;
							if (!responseType || responseType == "application/json") {
								_response = response.json();
							} else if (responseType == "text/plain") {
								_response = response.text();
							} else if (responseType == "application/binary") {
								_response = response.blob();
							}
							_response
								.then(value => resolve(value))
								.catch(() => reject({name: "Could not process response", url: response.url, status: response.status, statusText: response.statusText}));	
						}

					} else {

						if (response.status == 503 && a--) {
							
							DELAY(RANDOM(RETRY_WAIT_LOWER, RETRY_WAIT_UPPER)).then(() => {
								if (_before) _before(_request);
								fetch(_target, _request).then(_success).catch(_failure);
							});
							
						} else if (response.status >= 500 || response.status == 413) {

							/* <!-- 500 errors or 413 (Entity Too Large) means rejection --> */
							reject({name: "HTTP 50x Error", url: response.url, status: response.status, statusText: response.statusText});

						} else if (response.status == 301 || response.status == 302) {

							reject({name: "Got Redirect", url: response.url, status: response.status, statusText: response.statusText});

						} else if (response.status == 401 && a--) {

							/* <!-- Set Retries down to nothing --> */
							a = 0;

							/* <!-- 401 Likely Means an expired token, so retry --> */
							_check(true).then(r => {
								r ? DELAY(RANDOM(RETRY_WAIT_LOWER, RETRY_WAIT_UPPER) / 4).then(() => {
								if (_before) _before(_request);
								fetch(_target, _request).then(_success).catch(_failure);
								}) : reject({name: "Failed Auth Check", url: response.url, status: response.status, statusText: response.statusText});
							});

						} else if (response.status === 0 && response.type == "opaque") {

							response.text()
								.then(value => resolve(value))
								.catch(() => reject({name: "Unhandled Response Error", url: response.url, status: response.status, statusText: response.statusText}));

						} else if (options.retry && a--) {

							/* <!-- If we can retry ... give it a whirl --> */
							options.retry(response).then(value => {
								value ? DELAY(RANDOM(RETRY_WAIT_LOWER, RETRY_WAIT_UPPER) * (RETRY_MAX - a)).then(() => {
									if (_before) _before(_request);
									fetch(_target, _request).then(_success).catch(_failure);
								}) : reject({name: "Ran out of Retries", url: response.url, status: response.status, statusText: response.statusText});
							}).catch(() => reject({url: response.url, status: response.status, statusText: response.statusText}));

						} else {

							reject({name: "Unhandled Fetch Error", url: response.url, status: response.status, statusText: response.statusText});

						}
					}
				};

				fetch(_target, _request).then(_success).catch(_failure);

			});
			
			var _timeout;
			return options.timeout ? 
				Promise.race([_fetch.then(r => {
					clearTimeout(_timeout);
					return r;
				}), new Promise((resolve, reject) => _timeout = setTimeout(() => reject(new Error("Request Timed Out (after " + options.timeout + "ms) to : " + url)), options.timeout))]) : 
				_fetch;
			
		};
		
		return LIMITER.add(_promise, _target);

	};
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		details: () => ({
			name: options.base,
			limiter: LIMITER.status()
		}),
		
		before: fn => _before = fn,

		check: fn => _check = fn,

		delete: (url, data) => _request("delete", url, data),

		download: (url, data) => _request("get", url, data, null, "application/binary"),

		get: (url, data, contentType, responseType) => _request("get", url, data, contentType, responseType),

		patch: (url, data, contentType, responseType) => _request("patch", url, data, contentType, responseType),

		post: (url, data, contentType, responseType) => _request("post", url, data, contentType, responseType),

		put: (url, data, contentType, responseType) => _request("put", url, data, contentType, responseType),

	};
	/* <!-- External Visibility --> */

};