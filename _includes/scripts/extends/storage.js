/* <!-- Test Storage Availability (inc Mobile Safari | Incognito Mode) --> */
var __storageAvailable = function (storage) {
  if (typeof storage == "undefined") return false;
  try { /* <!-- Hack for IOS/Safari Incognito Mode) --> */
    storage.setItem("__TEST__", "");
    storage.getItem("__TEST__");
    storage.removeItem("__TEST__");
    return true;
  }
  catch (err) {
    return false;
  }
};
/* <!-- Test Storage Availability (inc Mobile Safari | Incognito Mode) --> */