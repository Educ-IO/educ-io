Page = function() {
  "use strict";

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Page)) return new this.Page().initialise(this);

  /* <!-- Internal Functions --> */
  function evaluate(code) {
    try {
      eval(code);
      return true;
    } catch (err) {
      return false;
    }
  }

  var __storageAvailable = function(storage) {
    if (typeof storage == "undefined" || !storage) return false;
    try {
      var name = "__TEST_NAME__",
        value = "__TEST_VALUE__",
        result = true;
      storage.setItem(name, value);
      result = (storage.getItem(name) == value);
      storage.removeItem(name);
      return result;
    } catch (err) {
      return false;
    }
  };
  var _existsCrypto = function() {
    return window.crypto &&
      window.crypto.getRandomValues &&
      window.crypto.subtle &&
      window.crypto.subtle.generateKey &&
      window.crypto.subtle.importKey &&
      window.crypto.subtle.exportKey &&
      window.crypto.subtle.encrypt &&
      window.crypto.subtle.decrypt;
  };

  var _testCrypto = function(algorithm, key_size) {
    if (!_existsCrypto()) {
      return false;
    } else {
      var USES = ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
        FORMAT = "jwk",
        IV = window.crypto.getRandomValues(new Uint8Array(12)),
        TEXT = "Educ.IO Cryptography Test";
      return new Promise((resolve, reject) => {
        window.crypto.subtle.generateKey({
            name: algorithm,
            length: key_size,
          }, true, USES)
          .then(key => {
            key ? window.crypto.subtle.exportKey(FORMAT, key)
              .then(data => {
                data ? window.crypto.subtle.importKey(FORMAT, data, {
                  name: algorithm
                }, false, USES).then(key => {
                  key ? window.crypto.subtle.encrypt({
                      name: algorithm,
                      iv: IV
                    }, key, new TextEncoder().encode(TEXT))
                    .then(encrypted => {
                      encrypted ? window.crypto.subtle.decrypt({
                        name: algorithm,
                        iv: IV
                      }, key, encrypted).then(decrypted => {
                        resolve(new TextDecoder().decode(decrypted) == TEXT);
                      }) : resolve(false);
                    }) : resolve(false);
                }) : resolve(false);
              }) : resolve(false);
          })
          .catch(e => {
            reject(e);
          });
      });
    }
  };
  /* <!-- Internal Functions --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ;
  var FEATURES = [{
      name: "Events",
      desc: "Javascript Custom Events",
      url: "https://caniuse.com/#feat=customevent",
      required: false,
      test: function() {
        return new Promise(resolve => {
          var name = "test-event",
            now = new Date(),
            event = new CustomEvent(name, {
              detail: now
            });
          window.addEventListener(name, function(e) {
            resolve(e.detail == now);
          }, false);
          window.dispatchEvent(event);
        });
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't support Javascript Custom Events."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Arrow Functions",
      desc: "Javascript Arrow Functions",
      url: "https://caniuse.com/#feat=arrow-functions",
      required: true,
      test: function() {
        return evaluate("var f = x => 1");
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "close",
        class: "text-danger",
        message: "Unfortunately, your browser doesn't support Javascript ES6 Arrow Functions."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Rest Parameters",
      desc: "Javascript Rest Parameters",
      url: "https://caniuse.com/#feat=rest-parameters",
      required: true,
      test: function() {
        return evaluate("var f = (...args) => 1");
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "close",
        class: "text-danger",
        message: "Unfortunately, your browser doesn't support Javascript ES6 Rest Parameters."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Constants",
      desc: "Javascript Const Statements",
      url: "https://caniuse.com/#feat=const",
      required: true,
      test: function() {
        return evaluate("const a = 1");
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "close",
        class: "text-danger",
        message: "Unfortunately, your browser doesn't support Javascript constants."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Lets",
      desc: "Javascript Lets Statements",
      url: "https://caniuse.com/#feat=let",
      required: true,
      test: function() {
        return evaluate("let a = 1");
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "close",
        class: "text-danger",
        message: "Unfortunately, your browser doesn't support Javascript lets."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Ends With",
      desc: "Javascript String.endsWith() Function",
      required: false,
      test: function() {
        return !!(String.prototype.endsWith);
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't support the .endsWith() function, but this will be polyfilled by us, so it will still work (just a little slower)."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Collections & Objects",
      desc: "Javascript Collection and Object Functions",
      url: "https://caniuse.com/#feat=es5",
      required: false,
      test: function() {
        return !!(Array.prototype.map && Array.prototype.filter && Object.assign);
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't support modern collections functions, but these will be polyfilled by us, so it will still work (just a little slower)."
      },
      type: {
        name: "language",
        class: ""
      },
    },
    {
      name: "Template Literals",
      desc: "Javascript String Template Literal Expressions",
      url: "https://caniuse.com/#feat=template-literals",
      required: true,
      test: function() {
        var hello = "Hello";
        return `${hello} World!` == "Hello World!";
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "close",
        class: "text-danger",
        message: "Unfortunately, your browser doesn't support template literal strings."
      },
      type: {
        name: "feature",
        class: "badge-dark"
      },
    },
    {
      name: "Encoder / Decoder",
      desc: "Javascript String conversion to and from Byte Arrays",
      url: "https://caniuse.com/#feat=textencoder",
      required: true,
      test: function() {
        return (typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined");
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't currently support native Text Encoding / Decoding. This is only used for some cryptographically secure features, so most apps (apart from the Accounts App) will still work."
      },
      type: {
        name: "feature",
        class: "badge-dark"
      },
    },
    {
      name: "Promises",
      desc: "Javascript Promises",
      url: "https://caniuse.com/#feat=promises",
      required: true,
      test: function() {
        return typeof Promise !== "undefined";
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "close",
        class: "text-danger",
        message: "Unfortunately, your browser doesn't support native promises."
      },
      type: {
        name: "feature",
        class: "badge-dark"
      },
    },
    {
      name: "Fetch",
      desc: "Browser Fetch",
      url: "https://caniuse.com/#feat=fetch",
      required: false,
      test: function() {
        if (!window.fetch) {
          return false;
        } else {
          return new Promise((resolve, reject) => {
            var request = new Request("/", {
              mode: "same-origin",
              credentials: "same-origin",
            });
            fetch(request).then(function(response) {
              if (response && response.status < 400) {
                resolve(true);
              } else {
                resolve(false);
              }
            }).catch(function(e) {
              reject(e);
            });
          });
        }
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't support native fetch, but this will be polyfilled by us, so it will still work (just a little slower)."
      },
      type: {
        name: "feature",
        class: "badge-dark"
      },
    },
    {
      name: "File API",
      desc: "Interact with local Files the the Browser",
      url: "https://caniuse.com/#feat=fileapi",
      required: false,
      test: function() {
        return !!(window.File && window.FileReader && window.FileList && window.Blob);
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't support the File API. This is only used for uploading local files and downloading file, so most apps (apart from Reflect) and features will still work."
      },
      type: {
        name: "feature",
        class: "badge-dark"
      },
    },
    {
      name: "Storage",
      desc: "Name/Value Storage",
      url: "https://caniuse.com/#feat=namevalue-storage",
      required: false,
      test: function() {
        return (__storageAvailable(window.localStorage) && __storageAvailable(window.sessionStorage));
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't support name/value, but this will be polyfilled by us, so it will still work (just a little slower)."
      },
      type: {
        name: "feature",
        class: "badge-dark"
      },
    },
    {
      name: "Local Storage / Indexed DB",
      desc: "Local Storage current availability (lack of free local storage can degrade this)",
      required: false,
      test: function() {

        if (!localforage || !__storageAvailable(window.localStorage)) {
          return false;
        } else {
          const DB = localforage.createInstance({
            name: "Educ-Testing",
            version: 1.0,
            description: "Educ.IO | Testing"
          });
          return DB.setItem("TESTING_Local-Storage-DB", {
            foo: "bar"
          });
        }

      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't currently allow writing to Local Storage / IndexedDB."
      },
      type: {
        name: "operation",
        class: "badge-primary"
      },
    },
    {
      name: "WebCrypto API Encryption - AES-GCM Algorithm",
      desc: "Checks Browser-based Cryptography Encryption Algorithm",
      required: false,
      test: function() {
        return _testCrypto("AES-GCM", 256);
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't currently support native Browser Cryptography. This is only used for some secure features, so most apps (apart from the Accounts App) will still work."
      },
      type: {
        name: "crypto",
        class: "badge-success"
      },
    },
    {
      name: "WebCrypto API Encryption - PBKDF2 Key Derivation",
      desc: "Checks Browser-based Cryptography Key Generation",
      required: false,
      test: function() {
        if (!_existsCrypto()) {
          return false;
        } else {
          return new Promise((resolve, reject) => {
            var ALGORITHM = "PBKDF2",
              HASH = "SHA-1",
              MODE = "AES-CTR",
              KEY_USAGE = ["deriveBits", "deriveKey"],
              DERIVED_USAGE = ["encrypt", "decrypt"],
              SALT = window.crypto.getRandomValues(new Uint8Array(16)),
              PASSPHRASE = "Educ.IO Test Passphrase";
            return window.crypto.subtle.importKey("raw", new TextEncoder().encode(PASSPHRASE), {
                name: ALGORITHM
              }, false, KEY_USAGE)
              .then(key => key ? window.crypto.subtle.deriveKey({
                name: ALGORITHM,
                salt: SALT,
                iterations: 1000,
                hash: {
                  name: HASH
                },
              }, key, {
                name: MODE,
                length: 256
              }, true, DERIVED_USAGE) : resolve(false))
              .then(key => key ? crypto.subtle.exportKey("raw", key) : resolve(false))
              .then(data => data ? resolve(new TextDecoder().decode(data)) : resolve(false))
              .catch(e => reject(e));
          });
        }
      },
      success: {
        icon: "check",
        class: "text-success",
        message: ""
      },
      failure: {
        icon: "priority_high",
        class: "text-warning",
        message: "Unfortunately, your browser doesn't currently support native Browser Cryptography. This is only used for some secure features, so most apps (apart from the Accounts App) will still work."
      },
      type: {
        name: "crypto",
        class: "badge-success"
      },
    },
  ];
  /* <!-- Internal Variables --> */

  /* <!-- External Visibility --> */
  return {

    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.Page = this;

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: function() {

      var complete = function(features) {

          var status = true;
          for (var i = 0; i < features.length; i++)
            if (features[i].required && !features[i].result) status = false;

          /* <!-- Show the Features --> */
          $(ಠ_ಠ.Display.template.get({
            status: {
              message: status ? "PASSED" : "FAILED",
              class: status ? "text-success" : "text-danger"
            },
            template: "status",
            items: features
          })).insertAfter("p.preamble");

        },
        count = 0;

      for (var i = 0; i < FEATURES.length; i++) {
        try {
          var result = FEATURES[i].test();
          if (result && ಠ_ಠ._isF(result.then)) {
            (function(feature, promise) {
              promise.then(function(result) {
                feature.result = result;
                if (++count == FEATURES.length) complete(FEATURES);
              }).catch(function(e) {
                feature.result = false;
                if (e) feature.error = e;
                if (++count == FEATURES.length) complete(FEATURES);
              });
            })(FEATURES[i], result);
          } else {
            FEATURES[i].result = result;
            if (++count == FEATURES.length) complete(FEATURES);
          }
        } catch (e) {
          FEATURES[i].result = false;
          if (e) FEATURES[i].error = e;
          if (++count == FEATURES.length) complete(FEATURES);
        }
      }
    },
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};