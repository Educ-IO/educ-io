TODO LIST 
=========
* Match slashed and unslashed urls to service worker cache (e.g. "https://educ.io/view/" and "https://educ.io/view") <-- Needs a re-work of the sw-cache
* Animated Logo
* Contrite Penguin
* Write Support
* Write Requirements
* Favicon Background?
* BUG -> Order of Dev / Multiple IMPORT Scripts is dependent on loading times - needs to be declarative
* BUG -> ARROW functions in return object (e.g. View)???
* More Sophisticated Analytics use....link on actions?
* Gracefully handle authentication errors:
  + ERROR - Signed into Google {error: {…}, network: "google"}error: {code: "blocked", message: "Popup was blocked"}network: "google" <= e.g. Private Browsing Mode (redirect?)
  + ERROR - Signed into Google {error: {…}, network: "google"}error: {code: "cancelled", message: "Login has been cancelled"}network: "google" <= e.g. Close Login Popup
* Gracefully handle increasing Google Scopes (e.g. jump up to email, full drive access etc) <-- Pass a function to the Google API that returns a promise to increase scopes, and a checker (request scope?)  
* Remove .map / .filter etc calls so that polyfills can be removed in favour if using Underscore.
* Filter for correctly returned doc type on picker (recent shows all types?)
* Supply oauth keys are part of the URL.... STARTED but not complete <= Should hide URL after successfull set?
* Mini-blog for app use cases?

Router
------
* Swap Route function to register routes, with more concise checking of arguments to stop matching in data strings.

Apps
----
* Wrap Un-Authenticated Sheets Access in Google API Javascript file ... maybe
* Clean Up Filters HTML to just go up to parent > .data-identifier <-- IMPORTANT
* After Sign-In....Recent Breaks? ERROR - Recent Items Failure DOMException: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing. (index):3687

Mobile
------

* Command clicks in header menu must close menu. Thought this was the case so perhaps a bug rather than a lack of functionality. This also screws up height measuring for scrolls.
* Top nav menu wastes space on mobile. Can it be shifted to sticky on mobile devices only with bootstrap? Maybe a media query if nothing else works.
* Horizontal scroll is broken on a mobile device - don't use it, or at least default to a flexbox fit algorithm then push 'grid' view into a menu - should probably be the global default because it's a pain everywhere.
* Freeze should measure the viewport width before doing anything because 2-3 columns screws the view. Should maybe just fix the headers?

View
----
* List App as Drive Handling App / Shortcut <--- https://www.googleapis.com/auth/drive.install
* Hidden-First Visibiity on 'View' needs to be hidden
* Write Flexbox-based Fit Algorithm
* Freeze should measure the viewport width before doing anything because 2-3 columns screws the view. Should maybe just fix the headers?
* Horizontal scroll is broken on a mobile device - don't use it, or at least default to a flexbox fit algorithm then push 'grid' view into a menu - should probably be the global default because it's a pain everywhere.
* Fill in app authorisation form -- https://support.google.com/code/contact/oauth_app_verification && https://support.google.com/cloud/answer/7454865

Folders
-------
* Update Scroll Position on Large List Conversions - e.g. follow progress.
* Can we do an in-place MimeType change?
* Write Instructions for 'Folders'

Reflect
-------


Complete
--------
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

ᕕ( ᐛ )ᕗ JD ♑ - 2017-09-01