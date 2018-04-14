Strings = () => {
	"use strict";

	/* <!-- MODULE: Provides a extra string helper methods --> */
	/* <!-- REQUIRES: Global Scope: Underscore --> */

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		stringToArrayBuffer: value => {
			value = value.replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
			var _fn = array => {
					for (var i = 0; i != value.length; ++i) array[i] = value.charCodeAt(i);
					return array;
				},
				_noAB = () => _fn(new Array(value.length)),
				_aB = () => {
					var _bf = new ArrayBuffer(value.length);
					_fn(new Uint8Array(_bf));
					return _bf;
				};
			return (typeof ArrayBuffer !== "undefined") ? _aB() : _noAB();
		},

		base64: {

			encode: value => btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode("0x" + p))),

			decode: value => decodeURIComponent(_.map(atob(value).split(""), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")),

		}
		/* <!-- External Functions --> */

	};
	/* <!-- External Visibility --> */
};