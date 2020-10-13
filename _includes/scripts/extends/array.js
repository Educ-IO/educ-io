/* <!-- Standard Deviation Method --> */
if (!Array.prototype.stdDev) {
  Array.prototype.stdDev = function() {
    var n = this.length,
        mean = n ? this.reduce((a,b) => a+b)/n : false;
    return mean ? Math.sqrt(this.map(x => Math.pow(x-mean,2)).reduce((a,b) => a+b)/n) : 0;
  };
}
/* <!-- Standard Deviation Method --> */

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

/* <!-- Column Sort (e.g. sort rows by header values in 2D array (array of rows)) --> */
/* <!-- Returns an Array, first element is sorted headers and second element sorted rows --> */
Array.columnSort = function(columns, rows, comparer, from) {
  
  /* <!-- If 'from', adjust sortable columns appropriately --> */
  from = from || 0;
  var _sortable = from ? columns.slice(from) : columns;
  
  var _sorted_Columns = _sortable.map(column => column).sort(comparer || undefined);
  
  /* <!-- Add the not-sorted columns to the front of the array --> */
  for (var i = from - 1; i >= 0; i -= 1) {
    _sorted_Columns.splice(0, 0, columns[i]);
  }
  
  var _sorts = columns.reduce((memo, column) => {
    memo.push(_sorted_Columns.indexOf(column));
    return memo;
  }, []);
  
  var _sorted_Rows = _.map(rows, row => {
        var _new = Array(columns.length);
        _.each(_sorts, (new_index, old_index) => {
          _new[new_index] = row[old_index];
        });
        return _new;
      });
  
  return [_sorted_Columns, _sorted_Rows];
};
/* <!-- Row Sort --> */