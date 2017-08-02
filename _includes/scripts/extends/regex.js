/* <!-- Regex Escape --> */
RegExp.escape = function(value) {
    return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};
/* <!-- Regex Escape --> */