/* <!-- Sequential Promise Execution Polyfill --> */
if (!Promise.each) {
  Promise.each = function(promises) {
    return promises && typeof promises === "object" && promises.constructor === Array ?
      promises.reduce(function(all, promise) {
        return all.then(function(result) {
          return (typeof promise === "function" ? promise() : promise)
            .then(Array.prototype.concat.bind(result));
        });
      }, Promise.resolve([])) : Promise.resolve();
  };
}
/* <!-- Sequential Promise Execution Polyfill --> */