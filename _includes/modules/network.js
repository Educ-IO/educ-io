Network = function(base, timeout, rate, retry) {
	"use strict";

	/* <!-- Backoff Constants --> */
	const RETRY_MAX = 10;
	const RETRY_WAIT_LOWER = 1000;
	const RETRY_WAIT_UPPER = 10000;
	/* <!-- Backoff Constants --> */

	/* <!-- Internal Constants --> */
	const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));
	const RANDOM = (lower, higher) => Math.random() * (higher - lower) + lower;
	const QUERY = (value, append) => Object.keys(value).reduce(function(str, key, i) {
		var delimiter, val;
		delimiter = (i === 0 || append) ? "?" : "&";
		key = encodeURIComponent(key);
		val = encodeURIComponent(value[key]);
		return [str, delimiter, key, "=", val].join("");
	}, "");
	/* <!-- Internal Constants --> */

	/* <!-- Limiter = Rate Limited Requests --> */
	const LIMITER = (function(per_sec) {

		var last = 0,
			queue = [],
			rate = per_sec ? 1000 / per_sec : 0;

		var _execute = function() {
			last = new Date();
			var run = queue.shift();
			run.promise
				.then(r => run.resolve(r))
				.catch(e => run.reject(e));
		};

		var _dequeue = function() {
			if (queue.length > 0) {
				var elapsed = new Date() - last;
				if (elapsed >= rate) {
					_execute();
				} else {
					setTimeout(function() {
						_dequeue();
					}.bind(this), Math.max(rate - elapsed, 0));
				}
			}
		};

		var _add = function(promise) {
			return new Promise(function(resolve, reject) {
				queue.push({
					resolve: resolve,
					reject: reject,
					promise: promise
				});
				_dequeue();
			});
		};

		return {
			add: function(promises) {
				if (Array.isArray(promises)) {
					return Promise.all(promises.map(function(promise) {
						return _add(promise);
					}.bind(this)));
				} else {
					return _add(promises);
				}
			},
		};

	}(rate ? rate : 0));
	/* <!-- Limiter = Rate Limited Requests --> */

	/* <!-- Internal Variables --> */
	var _before, _check;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _request = function(verb, url, data, contentType, responseType) {

		var _promise = new Promise((resolve, reject) => {

			verb = verb.toUpperCase();
			var _url = new URL(url, base);
			var _request = {
				mode: "cors",
				method: verb,
				headers: {
					"Content-Type": contentType ? contentType : "application/json"
				},
				body: verb != "GET" ? !contentType || contentType == "application/json" ? JSON.stringify(data) : data : null
			};

			/* <!-- Extra Headers (e.g. Auth) are set here --> */
			if (_before) _before(_request);

			var a = RETRY_MAX;

			/* <!-- Get the URL, including appending data as the query string if required --> */
			var _target = _url.href + (data && verb == "GET" && !contentType ? QUERY(data, _url.href.indexOf("?") > 0) : "");

			var _failure = e => reject({url: _url.href, error: e});
			var _success = response => {
				
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
							.catch(e => reject({name: "Could not process response", url: response.url, status: response.status, statusText: response.statusText}));	
					}
					
				} else {
					
					if (response.status >= 500 || response.status == 413) {
						
						/* <!-- 500 errors or 413 (Entity Too Large) means rejection --> */
						reject({name: "HTTP 50x Error", url: response.url, status: response.status, statusText: response.statusText});
						
					} else if (response.status == 401 && a--) {

						/* <!-- Set Retries down to nothing --> */
						/* <!-- TODO: This doesn't really work in the way intended - e.g. timeout is too long --> */
						a = 0;
						
						/* <!-- 401 Likely Means an expired token, so retry --> */
						_check && _check(true) ?
							setTimeout(function() {
									if (_before) _before(_request);
									fetch(_target, _request).then(_success).catch(_failure);
								}, RANDOM(RETRY_WAIT_LOWER, RETRY_WAIT_UPPER) * (RETRY_MAX - a)) : 
							reject({name: "Failed Auth Check", url: response.url, status: response.status, statusText: response.statusText});

					} else if (retry && a--) {
						
						/* <!-- If we can retry ... give it a whirl --> */
						retry(response).then(value => {
							value ?
								setTimeout(function() {
									if (_before) _before(_request);
									fetch(_target, _request).then(_success).catch(_failure);
								}, RANDOM(RETRY_WAIT_LOWER, RETRY_WAIT_UPPER) * (RETRY_MAX - a)) :
								reject({name: "Ran out of Retries", url: response.url, status: response.status, statusText: response.statusText});
						}).catch(() => reject({url: response.url, status: response.status, statusText: response.statusText}));
						
					} else {
						
						reject({name: "Unhandled Fetch Error", url: response.url, status: response.status, statusText: response.statusText});
						
					}
				}
			};

			fetch(_target, _request).then(_success).catch(_failure);

		});

		return LIMITER.add(
			timeout ?
			_promise : Promise.race([_promise, new Promise((_, r) => setTimeout(() => r(new Error("Request Timed Out (after " + timeout + "ms) to : " + url)), timeout))])
		);

	};
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		before: (fn) => _before = fn,

		check: (fn) => _check = fn,

		delete: (url, data) => _request("delete", url, data),

		download: (url, data) => _request("get", url, data, null, "application/binary"),

		get: (url, data, contentType, responseType) => _request("get", url, data, contentType, responseType),

		patch: (url, data, contentType, responseType) => _request("patch", url, data, contentType, responseType),

		post: (url, data, contentType, responseType) => _request("post", url, data, contentType, responseType),

		put: (url, data, contentType, responseType) => _request("put", url, data, contentType, responseType),

	};
	/* <!-- External Visibility --> */

};