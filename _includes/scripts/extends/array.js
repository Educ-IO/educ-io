/* <!-- Standard Deviation Method --> */
if (!Array.prototype.stdDev) {
  Array.prototype.stdDev = function() {
    var n = this.length,
        mean = n ? this.reduce((a,b) => a+b)/n : false;
    return mean ? Math.sqrt(this.map(x => Math.pow(x-mean,2)).reduce((a,b) => a+b)/n) : 0;
  };
}
/* <!-- Is Null Method --> */




/* <!-- Is Null Method --> */
if (!Array.prototype.isNull) {
  Array.prototype.isNull = function() {
    for (var i = 0, l = this.length; i < l; i += 1) if (this[i] !== null && this[i] !== undefined) return false;
    return true;
  };
}
/* <!-- Is Null Method --> */

/* <!-- Remove Nulls by Cleaning --> */
if (!Array.prototype.clean) {
  Array.prototype.clean = function(all, reverse) {
    if (all === true) {
      if (reverse === true) this.reverse();
      for (var i = 0; i < this.length; i++) {
        if (this[i] == null || (this[i].isNull && this[i].isNull())) {     
          this.splice(i, 1);
          i--;
        }
      }
      if (reverse === true) this.reverse();
    } else {
      if (reverse === true) this.reverse();
      var start = 0;
			for (var j = 0; j < this.length; j++) {
				if (this[j] == null || (this[j].isNull && this[j].isNull())) {
					start+=1;
				} else {
					break;
				}
			}
			this.splice(0, start);
      if (reverse === true) this.reverse();
    }
    return this;
  };
}
/* <!-- Remove Nulls by Cleaning --> */

/* <!-- Trim Array to Length (if nulls) --> */
if (!Array.prototype.trim) {
  Array.prototype.trim = function(length) {
		if (this.length > length) {
			var _trim = true;
			for (var i = length, l = this.length; i < l; i += 1) {
				if (this[i] !== null && this[i] !== undefined) {
					_trim = false;
					if (this[i].trim) this[i].trim(length);
				}
			}
			if (_trim) this.splice(length, this.length - length);
		}
		return this;
	};
}
/* <!-- Trim Array to Length (if nulls) --> */