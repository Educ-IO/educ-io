Strings = () => {
  "use strict";

  /* <!-- HELPER: Provides a extra string helper methods --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
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
    hex: {

      /* <!-- Encode / Convert Hex String To ArrayBuffer / ArrayBufferView --> */
      encode: value => {
        if (typeof value !== "string")
          throw new TypeError("Expected value to be a string");
        if ((value.length % 2) !== 0)
          throw new RangeError("Expected string to be an even number of characters");
        var _buffer = new Uint8Array(value.length / 2);
        for (var i = 0; i < value.length; i += 2) _buffer[i / 2] = parseInt(value.substring(i, i + 2), 16);
        return _buffer.buffer;
      },

      /* <!-- Decode / Convert ArrayBuffer / ArrayBufferView to Hex String --> */
      decode: value => {
        if (typeof value !== "object" || value === null || typeof value.byteLength !== "number")
          throw new TypeError("Expected value to be an ArrayBuffer");
        var _buffer = new Uint8Array(value),
          _result = "",
          _value;
        for (var i = 0; i < _buffer.length; i++)
          _result += ((_value = _buffer[i].toString(16)).length === 1 ? "0" + _value : _value);
        return _result;
      }

    },

    arraybuffer: {

      /* <!-- Encode / Convert String To Byte Array / ArrayBufferView --> */
      /* <!-- SAME as TextEncoder().encode(string) --> */
      convert: value => {
        var bytes = new Uint8Array(value.length);
        for (var i = 0; i < value.length; i++) bytes[i] = value.charCodeAt(i);
        return bytes;
      },

      /* <!-- Encode / Convert String To Array Buffer --> */
      /* <!-- SAME as TextEncoder().encode(string) --> */
      encode: value => {
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

      /* <!-- Decode / Convert Array Buffer / Byte Array to String --> */
      /* <!-- SAME as TextDecoder().decode(string) --> */
      decode: value => String.fromCharCode.apply(null, new Uint8Array(value)),

    },

    base64: {

      /* <!-- Encodes a string in base-64 --> */
      encode: value => btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g,
        (m, p) => String.fromCharCode("0x" + p))),

      /* <!-- Decodes base-64 to a string --> */
      decode: value => decodeURIComponent(_.map(atob(value).split(""),
        c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")),

    }
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};