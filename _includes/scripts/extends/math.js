Math.preciseRound = function(value, decimals) {
  return Number(Math.round(value+"e"+decimals)+"e-"+decimals);
};

Number.isNaN = Number.isNaN || function(value) {     
    return value !== value;
};

Math.parseInteger = function(value) {
  var parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? value : parsed;
};

Math.randomInteger = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};