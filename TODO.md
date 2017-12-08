TODO LIST 
=========
* ** IMPORTANT ** Put placeholder dialogs on Subscription options
* ** IMPORTANT ** Make JS Request calls for SW cacheable resources with integrity flags if available
* Match slashed and unslashed urls to service worker cache (e.g. "https://educ.io/view/" and "https://educ.io/view") <-- Needs a re-work of the sw-cache
* Animated Logo
* Favicon Background?
* BUG -> Order of Dev / Multiple IMPORT Scripts is dependent on loading times - needs to be declarative? E.g. XLSX AND JSZIP on debug only
* BUG -> ARROW functions in return object (e.g. View)???
* More Sophisticated Analytics use....link on actions? onclick="ga('send', 'event', 'Jumbotron actions', 'Download', 'Download 4.0.0-beta');"
* Remove .map / .filter etc calls so that polyfills can be removed in favour of using Underscore.
* Filter for correctly returned doc type on picker (recent shows all types?)
* Supply oauth keys are part of the URL.... STARTED but not complete <= Should hide URL after successfull set?
* Contrite Penguin 404 Page
* Links to ISSUE trackers for APPS and EXTENSIONS ??
* Branding License

Router
------
* Swap Route function to register routes, with more concise checking of arguments to stop matching in data strings.

Apps
----
* ** IMPORTANT ** Logo for Verified OAuth Apps (awaiting Google?) -> https://stackoverflow.com/questions/44138213/google-oauth-consent-screen-not-showing-app-logo-and-name/44167549#44167549
* ** IMPORTANT ** Retries (in network.js) takes too long when handling security (401) errors
* ** IMPORTANT ** Move tooltips to RHS/LHS for larger screens (responsive breakpoints?)
* Wrap Un-Authenticated Sheets Access in Google API Javascript file ... maybe??
* Clean Up Filters HTML to just go up to parent > .data-identifier <-- IMPORTANT
* LONG RUNNING / RECURSIVE Tasks -> Need to be cancellable? If a route out command is issued ... maybe a web worker in the background

Mobile
------
* ** IMPORTANT ** Full Page Lazy Scope Load may break app flow (need state object to pass back to app?) - also should test for scope before initiating flow?
* ** IMPORTANT ** Incognito Mode on IOS fails on sign-in (issue with LocalForage again?) -> Issue on IOS 10.3 but not on 11? 11 seems to fix the Local Storage problem. Cookie problems on IOS?
* Command clicks in header menu must close menu. Thought this was the case so perhaps a bug rather than a lack of functionality. This also screws up height measuring for scrolls.
* Top nav menu wastes space on mobile. Can it be shifted to sticky on mobile devices only with bootstrap? Maybe a media query if nothing else works.
* Horizontal scroll is broken on a mobile device - don't use it, or at least default to a flexbox fit algorithm then push 'grid' view into a menu - should probably be the global default because it's a pain everywhere.
* Freeze should measure the viewport width before doing anything because 2-3 columns screws the view. Should maybe just fix the headers?

View
----
* ** IMPORTANT ** Column Filters
* Do went need to save view definitions? e.g. .view files / mime-type = application/x.educ-io.view
* Write Flexbox-based Fit Algorithm
  + Categorised data to 'pills' for display?
* Freeze should measure the viewport width before doing anything because 2-3 columns screws the view. Should maybe just fix the headers?
* Vertical Only Freeze should work better (e.g. not screw with table row cell heights?);
* Horizontal scroll is broken on a mobile device - don't use it, or at least default to a flexbox fit algorithm then push 'grid' view into a menu - should probably be the global default because it's a pain everywhere.
* Provide Aggregate Open and Load (accepts cross-app commands from Folders?) (Partially done, no aggregation mechanism yet!)
* Handle Merged Cells and merged ranges.
* Table Module -> Line 40 Can sometimes evaluate to NULL, on short tables particularly --> var node = nodes[Math.floor(nodes.length / 2)]; <++ IMPORTANT // Happens with very 'tall' cells.
* Numerical Filter implies re-sort?
* Auto-hide hidden columns (from original sheet)
* Export -> Select Single, Multiple or All Tabs for export (need a custom template for this)
* Include instructions about Exporting only exporting values rather than formulas or formats.

Folders
-------
* ** IMPORTANT ** Tally should break down file / folder counts by MimeType?
* ** IMPORTANT ** Copy from Team Drive [feature](https://www.cloudconnect.goog/thread/21004) for Folders
* Tally could parse out parents and persist 'map' of folder sizes (useful when navigating through)???
* Update Scroll Position on Large List Conversions - e.g. follow progress.
* Properties-based Search?
* Replace calls to _formatBytes with formatBytes Template Handler

Merge
-----

Reflect
-------
* Assign 'form' to people for emailing (e.g. list of NQTs or staff for PDRs) -> Create folders / match folders for them? Permission them properly. Create data store for form if not supplied in URL
* Email group from above.
* Picker seems to have problems overlaying card for Report Form?
* Button Sizes inconsistent (Text vs Icon buttons) on Mobile / IOS
* Picker problems on IOS

Complete
--------
* File Upload to Google Drive (File From Evidence Menu) <-- DONE
* URL for Evidence <-- DONE
* Paper / Offline for Evidence <-- DONE
* Evidence List should close aspects/standard when a new one is selected <-- DONE
* Field Span <-- DONE
* Manual Selection for Processing Results (tick boxes?) <-- DONE
* Can we save as PDF directly in the same folder as the Google Doc / Sheet etc is in? What about from a link directly from Google Drive - does that give the parent folder info as well as the File ID? (NO IT DOESN'T) <-- DONE
* Put App Logos in Menu <-- DONE
* After Sign-In ... Recent Breaks? ERROR - Recent Items Failure DOMException: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing. (index):3687 <-- DONE
* List App as Drive Handling App / Shortcut <-- https://www.googleapis.com/auth/drive.install (https://developers.google.com/drive/v3/web/integrate-open)
* Handle remove app from Google account, e.g. delete local hello data... <== DONE
* ** IMPORTANT ** * Sign out doesn't route back to initial text in REFLECT App? <-- SEEMS TO HAPPEN SOMETIMES on VIEW as well? <== DONE
* ** IMPORTANT ** Gracefully handle increasing Google Scopes (e.g. jump up to email, full drive access etc) | Lazy Permission Requests.... <-- Pass a function to the Google API that returns a promise to increase scopes, and a checker (request scope?) <== DONE
* Vertical Freeze only <== DONE
* API Scopes (urls) don't wrap on scopes page, meaning page width exceeds header width ... <== DONE
* Move Export Selection to Dialog Box (rather than menu items) -> Or series of Options Dialogs (better documentation support?) <== DONE
* Test page for Javascript / Browser Features! <= DONE
* Invalid dates popping through into App when no cell content <= DONE
* Test new Excel .xls BIFF5 & BIFF8 outputs. Issues with newest output. <== DONE
    REPLACE:
`     var __toBuffer = function(bufs) { var x = []; for(var i = 0; i < bufs[0].length; ++i) { x.push.apply(x, bufs[0][i]); } return x; };   `
`     var je=function(e){var r=[];for(var t=0;t<e[0].length;++t){r.push.apply(r,e[0][t])}return r};   `
    WITH:
`     var __toBuffer = function(bufs) { return [].concat.apply([], bufs[0]); };   `
`     var je=function(e){return [].concat.apply([], e[0])};   `
* Add Material Icons to Pages <-- DONE
* Default Button for Textual Field <-- DONE
* Add Fonts to Credits page.... <-- DONE
* Generic Output Evidence Picker <-- DONE
* Comprehensive Teachers' Standards Evidence Picker <-- DONE
* Basic Reflect Report Form <-- DONE
* Make all re-usable form components sizable (with large option) <-- DONE
* Don't forget resizable CSS & Code <-- DONE
* Added Material Icon Support <-- DONE
* Table Module -> 'Flickering Bug' on Table Sroll to End on Occasional Sheets <-- DONE
* Scroll Bars are still buggy in Chrome <-- DONE
* Hidden-First Visibiity on 'View' needs to be hidden <-- DONE
* Added Performance Flag <-- DONE
* Should we remove entirely blank columns???? <-- DONE
* Deal with NaN - Undefined in size handling! <-- DONE
* SEARCH and CONVERT Instructions... <-- DONE
* FOLDERS -> Fill in app authorisation form -- https://support.google.com/code/contact/oauth_app_verification && https://support.google.com/cloud/answer/7454865 <-- DONE
* Add Team Drive Open Button <-- DONE
* Test Conversion in Team Drives. <-- DONE
* Gracefully handle authentication errors: <== DONE
* Check Get Started Button on Folders - Does it work from Un-Auth? <-- Pop-Up Blocker on Incognito tab. But button + script does work? <-- DONE
* VIEW -> Fill in app authorisation form -- https://support.google.com/code/contact/oauth_app_verification && https://support.google.com/cloud/answer/7454865 <-- SUBMITTED
* Add Markdown as an output format. <-- DONE
* [object Object] Parsing Weirdness on View HEADERS if blank cells. <-- DONE
* Export Bug on Table Chain ... <-- DONE
* Jump out link to View for Spreadsheets? <== PUT IT IN THE TYPE COLUMN? <-- DONE
* Bug on Spreadsheet Conversion Logs -> SeemsJust to create 4? Also - should be turned off if batch size is set to 0? <-- DONE
* Can we do an in-place MimeType change? <-- DONE
* Search and Remove -> Cleaning Up! <-- DONE
* Handle 204 Status Gracefully <-- DONE
* Clear Buttons on Search <-- DONE
* Add Size to output rows. <-- DONE
* Team Drive Support <-- DONE
* Rename Instructions -> Help // Add Short Name for folding down at below LG <-- DONE
* START VIEW LAYOUT ISN'T right on .md sized screen <-- DONE
* Collapse App Title on < LARGE display <-- DONE
* Catch Promise Errors in tally, continue but mark the data as suspect? <== DONE
* Remove Item from List <== DONE
* Suppress 'preview' on remove click. <== DONE
* Attach Statistics to Loki objects to persist filters. <-- DONE
* EMPTY Folders <-- DONE
* Parallelize Files / Folders with batches <-- DONE
* File / Folder Count <-- DONE
* Search Result Statistics in 'Alert' style dialog <-- DONE
* Shift Console.time to Flags Module (Debug Perf) <-- DONE
* Write Instructions for 'Folders' <-- DONE
* Extend highlight= instead of anchor links into about pages etc? <-- DONE
* Write Requirements <-- DONE
* Write Support <-- DONE
* ON UPDATE, need to force a refresh! <-- DONE
* Future and Past Filters? Are they working?? ... need to deal with the numerical values here? <-- DONE
* Handle no-App-route situation <-- DONE
* Version Update Details aren't correct (as it's cached!) ... need to fix <-- DONE
* Sign-Out should clear the 'protect' flag for jump out links <-- DONE
* Breadcrumbs for Navigation <== DONE
* Back <-> Forward Navigation for Folder Loading? <== DONE
* Close Search Results <== DONE
* Need to have a state property attached to menu items in the app yaml file. Some commands (e.g. Open) don't need to be navigated back to, whereas others (e.g. Freeze) make sense to turn off on back. Some (e.g. Toggles) will go into the back stack straight away? Others might be one removed e.g. Back takes you to the last state rather than 'undoing' an action? <== DONE
* Do anchor tags always work? E.g. Folders on Changes and Scopes? <-- DONE (a different way)
* Single Letter Icon is partially hidden on mobile (maybe z-index?). Only on App page though.... <--// DONE
* Where to put the link to the scopes? <--// DONE
* Add Folder Features <--// DONE
* Write Security Policy & Cookie Policy <--// DONE
* Provide standardised DNT Support? <--// DONE
* CHANGES page 404's even with SW loaded???? -- NOT ALL PAGES seem to be cached? <--// DONE
* Write Permissions showing Pages, including details of why the permissions are needed. <--// DONE
* Write Readme <--// DONE
* Style and tweak copyright notice <--// DONE
* Instantiate Popper in 'Normal' Pages? <--// DONE
* Move bulk of YAML config from __page__ to template? <--// DONE
* Markdownify Lead Paragraph but add lead class in? <--// DONE
* New Version Available - trailing dash??? <--// DONE
* CHANGES page should have improved layout for app versions??? <--# DONE
* Open Source CREDITS Page -- pulled from apps? <--// DONE
* Need to handle event on load - parse original anchor fragment <--# DONE
* Put in retry loop (3 times?) for conversion result save <--# DONE
* BUG: Proceed --> Click on Educ Logo to go back to main page breaks (goes to undefined!) <--# DONE
* Does version alert still work??? <--# DONE
* File IDs need to be changed in search results. <--# DONE
* Searches in tabs? Tied to a Search module??? <--# DONE
* Hide NOW doesn't work on visibility (assume field / index mismatch???) <--# DONE
* Check if _ _ class property makes it through to rows. <--# DONE
* Overflow isn't hidden on Folders View???? <--# DONE
* Vertical Scroll Borked .. was sr-only class issue? <== DONE
* Put Search Children Input on Search Dialog (default ticked) <-- DONE
* Searches on Modified Rows clear the classes - maybe we should make those changes to the data source as well? <-- DONE
* Sort on Type <-- DONE
* BUG: After Filter on table, data toggles are lost??? <-- DONE
* Name for Folders loaded via the 'LOAD' method? <-- DONE
* Authentication Error during Conversion Process - WHY? And how to cope with it? -> HTTP / 401 error. Need to _pause_ and get new token? <-- DONE, but still delay?
* Error on File Conversion logs WRONG File INDEX Number to console <-- DONE
* Move Filtered Table Code to Generic (including sorting, filtering & visibilities). <-- DONE
* Makes filtering Data Set into Module (dataset) <--- IMPORTANT <-- DONE
* NOT Ignoring $RECYCLE.BIN when it should be?????? <== DONE
* Spreadsheet Log out of conversion process (successes and failures) <== DONE
* Make a smaller loader that can fit within a table row element!  <== DONE
* Signout to clear only app recents, not global <== DONE
* Change educ namespace variable where it is still _ to ಠ _ ಠ <== DONE
* GOING BETWEEN APPS RESULTS IN 401 on Auth call. Need to 'rename' the provider in the main.js code -> Hello: including the name of the app so that auth keys are stored differently for each app on the site? <== DONE
* Display Files / Folders once the Folder is open (in a tab?) <== DONE
* Display Search Results <== DONE
* If we include FOLDERS in our return MIMEs on search, how do we express that in our includes? MIME then filter? <== DONE
* Search Options in Dialog <== DONE
* SPLIT OAuth Credentials, per App <-- DONE
* Add Timeout Backoff on API Calls in Google <-- DONE
* BUG: Button on Landing Page only works once <== DONE
* Write Auth'ed Landing Page [Process] <== DONE
* Write instructions, including further filter instructions <== DONE
* Write Public Landing Page [Features] <== DONE
* Changelog Page <== DONE
* Need to handle event on load - parse original anchor fragment or querystring? <== DONE
* Add Refresh Current Sheet (like SHIFT-CLICK) <== DONE
* BUG: Toggle Column Visibility at the end... <-- DONE
* BUG: Restore Hidden Column <-- DONE
* Parse Generated Link <-- DONE
* Link Shortener API Interfacing - https://developers.google.com/url-shortener/v1/ <-- DONE
* Remove Recent Command Handler <-- DONE
* Add Link generation including QR Code = https://chart.googleapis.com/chart?cht=qr&chs=540x540&chl=http://www.google.com&choe=UTF-8 <-- DONE
* Recents for Files / Part way done with LOAD route / Maybe Card on AUTH view? <-- DONE
* Show/Hide Column Selector dodgy on mobile (scroll and dropdowns) <-- DONE, was Bootstrap bug resolved in 4.0.0-beta
* Sheet Tab Headers should wrap? <- DONE
* Filter boxes are too wide on a small device. Need to stack them up rather than inline them on small screens. <-- DONE
* Tooltips are annoying after a while. Should hang around once then leave? <-- DONE
* BUG: Handle Router Directive before App Route broken <-- DONE
* BUG: Collapse Menu (Mobile) on Click <-- DONE
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

ᕕ( ᐛ )ᕗ JD - 2017-12-08