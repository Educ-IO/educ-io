/* -- Is Null -- */
if (!Array.prototype.isNull) {
  Array.prototype.isNull = function() {
    for (var i = 0, l = this.length; i < l; i += 1) if (this[i] !== null && this[i] !== undefined) return false;
    return true;
  };
}

/* -- Remove Nulls by Cleaning -- */
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