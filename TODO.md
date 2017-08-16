
TODO LIST 
=========
* Match slashed and unslashed urls to service worker cache (e.g. "https://educ.io/view/" and "https://educ.io/view") <-- Needs a re-work of the sw-cache
* Animated Logo
* Contrite Penguin
* Write Readme
* Write Repository
* Write Support
* Gracefully handle increasing Google Scopes (e.g. jump up to email, full drive access etc)
* Favicon Background?
* Wrap Un-Authenticated Sheets Access in Google API Javascript file
* Move bulk of YAML config from page to template?
* BUG -> Order of Dev / Multiple IMPORT Scripts is dependent on loading times - needs to be declarative
* BUG -> ARROW functions in return object (e.g. View)???
* More Sophisticated Analytics use.

Apps
----

#### View
* Write instructions, including further filter instructions
* Recents for Files / Part way done with LOAD route / Maybe Card on AUTH view?
* Add Link generation
    
#### Folders
* File Counts

Complete
--------
* Frozen Rows / Columns <-- DONE
* BUG: If you set an 'collapsed' column back to visible, it doesn't show <-- DONE
* Scroll doesn't respect classes on tr>td (they get lost in scroll transition) <-- DONE
* Adjust Headers to Frozen Row Count
* > / now filter future / past?
* DETACH rather than hide header columns on _updateHeaders <-- DONE
* Hide now means indexing doesn't work... <-- DONE
* Hide / Show Visibility Columns <-- DONE
* Exports correctly for default (hide headers) <-- DONE
* BUG? Collapse Forms hide scrollbars when hidden! <-- DONE
* BUG? Fixed-Table doesn't work properly with vertical scroll (maybe related to above?) <-- DONE
* BUG: Shift table scroller to instance, not global <-- DONE
* Add Export Filtered Code <-- ADD HEADINGS in first line (not properties) <-- DONE
* Shift click to refresh <-- DONE
* Maybe filters should get Delete Crosses to remove them? <-- DONE
* Add Restore to Defaults <-- DONE
* c.hiddenByUser to be hidden initially <-- DONE
* Font Sizing for fixed width? <-- DONE
* Clear Filters / Sorts & Visibilities <-- DONE
* Restructure View JS <-- DONE
* Clean Array Rows? <-- DONE
* CLear widths on reload. <-- DONE
* Update Router to handle sub-commands (hash = command.subcommand) <-- DONE
* Move Auth flow trigger for commands into Main Module <-- DONE
* Commands requiring Authentication (e.g. Open on View) should trigger auth-flow <-- DONE but currently handled on a per app basis.
* Should second level commands (e.g. export on view) be inactive until they are 'possible'? How to declaratively encode this in terms of state? <-- DONE
* Instructions should overlay (?) the page rather than interupting app flow <-- DONE (Modal)
* Gracefully handle the .map issue for injected async/fetched CSS <-- Relative path at end of Bootstrap CSS (e.g. /*# sourceMappingURL=bootstrap.min.css.map */) <-- DONE
* Add Icon/s to Google Console App <-- DONE
* Slow Collapse Hide (Table re-render?) <-- Shifted to Fade (better performance)
* Sometimes there is a form submit(????) on Enter in Filter box on View <-- DONE
* Put filter as title over thead / th <-- DONE
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
* Get to 100 on PageSpeed Insights for all pages! <-- DONE apart from annoying Google Scripts! (Just analytics to go!)
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

ᕕ( ᐛ )ᕗ JD ♑ - 2017-08-09