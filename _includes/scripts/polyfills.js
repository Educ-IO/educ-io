/* -- Polyfill Regex Escape -- */
RegExp.escape= function(value) {
    return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};
/* -- Polyfill Regex Escape -- */

/* -- String EndsWith Polyfill -- */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== "number" || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
/* -- String EndsWith Polyfill -- */

/* -- Array Map Polyfill -- */
if (!Array.prototype.map) {
  Array.prototype.map = function(callback) {

    var T, A, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    var O = Object(this);

    var len = O.length >>> 0;
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }
    if (arguments.length > 1) {
      T = arguments[1];
    }
    A = new Array(len);
    k = 0;
    while (k < len) {

      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  };
}
/* -- Array Map Polyfill -- */

/* -- Object Assign Polyfill -- */
if (typeof Object.assign != "function") {
  Object.assign = function(target) {
    "use strict";
    if (target == null) {
      throw new TypeError("Cannot convert undefined or null to object");
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}
/* -- Object Assign Polyfill -- */

/* -- Test Storage Availability (inc Mobile Safari | Incognito Mode) -- */
var isStorageAvailable = function (storage) {

	if (typeof storage == "undefined") return false;
	try { /* hack for safari incognito */
		storage.setItem("storage", "");
		storage.getItem("storage");
		storage.removeItem("storage");
		return true;
	}
	catch (err) {
		return false;
	}
};
/* -- Test Storage Availability (inc Mobile Safari | Incognito Mode) -- */


/* -- Local Object Storage for LocalForage | Polyfill -- */
(function () {

  var localStorageAvailable = isStorageAvailable(window.localStorage),
    sessionStorageAvailable = isStorageAvailable(window.sessionStorage);

  if (!localStorageAvailable || !sessionStorageAvailable) {

    var Storage = function (id, cookie) {
			
      function createCookie(name, value, days) {
        var date, expires;

        if (days) {
          date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toGMTString();
        } else {
          expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
      }

      function readCookie(name) {
        var nameEQ = name + "=", ca = document.cookie.split(";"), c;

        for (var i = 0; i < ca.length; i++) {
          c = ca[i];
          while (c.charAt(0) == " ") {
            c = c.substring(1,c.length);
          }

          if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length,c.length);
          }
        }
        return null;
      }

      function setData(data) {
        data = JSON.stringify(data);
        if (cookie) {
				 createCookie(id, data, 365);
        } else {
         window[id] = data;
        }
      }

      function clearData() {
        if (cookie) {
					createCookie(id, "", 365);
        } else {
          delete window[id];
        }
      }

      function getData() {
        var data = cookie ? readCookie(id) : window[id];
        return data ? JSON.parse(data) : {};
      }

      /* initialise if there"s already data */
      var data = getData();

      return {
        length: 0,
        clear: function () {
          data = {};
          this.length = 0;
          clearData();
        },
        getItem: function (key) {
          return data[key] === undefined ? null : data[key];
        },
        key: function (i) {
          var ctr = 0;
          for (var k in data) {
            if (ctr == i) return k;
            else ctr++;
          }
          return null;
        },
        removeItem: function (key) {
          if (data[key] === undefined) this.length--;
          delete data[key];
          setData(data);
        },
        setItem: function (key, value) {
          if (data[key] === undefined) this.length++;
          data[key] = value+"";
          setData(data);
        }
      };
			
    };

    if (!localStorageAvailable) {
			window.localStorage.__proto__ = new Storage("__local");
			window.localStorage_POLYFILLED = true;
		}
    if (!sessionStorageAvailable) {
			window.sessionStorage.__proto__ = new Storage("__session");
			window.sessionStorage_POLYFILLED = true;
		}

  }

})();
/* -- Local Object Storage for LocalForage | Polyfill -- */