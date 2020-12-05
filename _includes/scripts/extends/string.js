(function() {

  var supported = function() {
    
    try {
      "foo".localeCompare("bar", "i");
    } catch (e) {
      return e.name === "RangeError";
    }
    return false;
    
  }();
  
  var ignoreCaseCompare = function(s1, s2) {
    
          return s1.length !== s2.length ? false : s1 === s2;
        
      },
      localeCompare = function(s1, s2, locale) {

        return supported ? s1.localeCompare(s2, locale, {sensitivity: "base"}) === 0 :
          locale ? locale.length ? s1.toLocaleLowerCase(locale) === s2.toLocaleLowerCase(locale) : s1.toLocaleLowerCase() === s2.toLocaleLowerCase() :
            s1.toLowerCase() === s2.toLowerCase();

      };
  
  String.equal = function(s1, s2, ignoreCase, useLocale) {
    
    return (typeof s1 === "string" && typeof s2 === "string") ? !ignoreCase ? ignoreCaseCompare(s1, s2) : localeCompare(s1, s2, useLocale) : s1 === s2;
    
  };
  
  String.prototype.equals = function(value, ignoreCase, useLocale) {
    
    return (typeof value === "string") ? !ignoreCase ? ignoreCaseCompare(this, value) : localeCompare(this, value, useLocale) : this === value;
    
  };
  
  String.prototype.indexOfAny = function(searchValues, fromIndex) {
    
    if (this && this.length && searchValues && searchValues.length) {
      for (var i = 0; i < searchValues.length; i++) {
        var _result = this.indexOf(searchValues[i], fromIndex);
        if (_result >= 0) return _result;
      }
    }
    
    return -1;
    
  };

})();