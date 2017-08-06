
TODO LIST 
=========
* Animated Logo
* Contrite Penguin
* Write Readme
* Write Repository
* Write Support
* Commands requiring Authentication (e.g. Open on View) should trigger auth-flow
* Should second level commands (e.g. export on view) be inactive until they are 'possible'? How to declaratively encode this in terms of state?
* Gracefully handle increasing Google Scopes (e.g. jump up to email, full drive access etc)
* Wrap Un-Authenticated Sheets Access in Google API Javascript file
* Gracefully handle the .map issue for injected async/fetched CSS <-- Relative path at end of Bootstrap CSS (e.g. /*# sourceMappingURL=bootstrap.min.css.map */)
* Match slashed and unslashed urls to service worker cache (e.g. "https://educ.io/view/" and "https://educ.io/view").
* Recents Menu item for Apps / Files

Apps
----

#### View
* BUG? Collapse Forms hide scrollbars when hidden!
* Sometimes there is a form submit(????) on Enter in Filter box on View

#### Folders
* File Counts

Complete
--------
* Handle Complex Header Options <-- DONE
* Visibility panel (templated) <-- DONE
* Tooltips for Visibility / Sort Control <-- DONE
* Inversion Option for Filters <-- DONE
* Better Operator / Filter Instructions in View <-- DONE
* Handle Operaters in View Filter <-- DONE
* Large Table Render & Filter/Sort Performance <-- Currently Clusterize
* Hide placeholder / un-published apps from Menu / Sitemap <-- DONE
* Make Google JSAPI Part of the Picker Process in Google_API Module -- This needs to be in the controller module, hook up Async script load event to promise resolve for 'no-cors' requests. <-- DONE
* Namespace whole App within single window variable to prevent variable bleed <-- DONE
* Minify Scripts? <-- DONE
* Get to 100 on PageSpeed Insights for all pages! <-- DONE apart from annoying Google Scripts!
* DEBUG flag to avoid registering Service Worker (for performance testing) <-- DONE
* Improve Font Handling <-- DONE
* Progressive Render Experience / Sort out CSS loading for consistent visual performance - e.g. not glitchy load display! <-- DONE
* Can update alert appear without a forced refresh? <-- Resolved with 5-sec delayed call
* Why does Upgrade Alert Sometimes Appear then get hidden! <-- Resolved
* Loader Screwing Up under CPU load??? Ironically. <-- Fixed with simplified loader
* Set no-cors on Fetch for Service Worker / particular Google JSAPI
* Structure Async Loading of Resources, including polyfills for IOS etc
* Convert APP Metadata to Arrays rather than split comma arrays
* Visual Sizing BUG with Loader (overspills?)
* Handle data load on tab show event, rather than click
* Update spinner to do highlight colour shades
* Can we upload an HTML file to Google Drive and convert it to a Doc for sharing etc? <-- YES
* Restructure SASS files
* Add Async / Defer to Imported Scripts
* Update Environment Variable to set debug/minimised JS versions, and analytics
* Move Docs to Compiled Page to Improve Speed / Caching
* Move Loader to Template / CSS

ᕕ( ᐛ )ᕗ JD ♑ - 2017-07-30