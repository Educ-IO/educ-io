Once you have __signed in__ to the site, or to the view app, you'll be able to __load a sheet__ from your Google Drive using the __open__ command from the __Sheet__ menu.

If you have opened any other sheets during this logged in session (e.g. until you __sign out__), they will appear on the opening screen of the app, giving you a __quick way__ to open sheets that you commonly use. Just click on them to open directly, or click on the small cross to remove them from this page.

Upon opening a sheet, the first _tab_ and it's associated data is displayed. You can refresh the data in the tab (by re-loading it from your Google Drive sheet) via the __Refresh__ command on the __Settings__ menu (this will also clear any filters / sorts / visibilities). You can open other tabs by clicking on them (*shift*{:.kb-shortcut} click will refresh the data if it has been already loaded). Moving between tabs will __not clear__ your filters / sorts / visibilities unless you refresh them.

Once the data is visible, you can do the following things:

##### Filter & Sort the data

Filters allow you to reduce the number of rows that you see, by applying filters to one or more columns (multiple column filters are cumulative, so they will show rows that meet __ALL__ of the filters, rather than any of them). They are accessible by clicking on a column heading, then start typing using the syntax below. Filters are _live_ so the relevant results will be shown as soon as you begin typing. Sorting is also accessible in the filter panel, with sort icons on the columns indicating the presence of a sort, and its direction.

{% include_relative _docs/view/FILTER_INSTRUCTIONS.md %}

##### Show / Hide Columns

Visibiity can be set inside the __filter panel__ for an individual column, or using the __Show / Hide Columns__ command from the __Settings__ menu for all of the columns (especially __hidden ones__). Setting the visibility to __hide initially__ will allow groups of adjacent columns to be quickly shown and hidden both on this page, and your final _view_.

##### Exporting

Under the __Share__ menu you can export your data into a variety of different formats. Not all formats support multiple tabs, but this is marked on the __export format selection__ dialog that will appear when you use one of these commands. An exported file will then be generated and saved to your device.

##### Sharing your View

Once you have filtered and sorted your sheet appropriately, and set your column visibilities, you can generate a _view_ __link__ for sharing the __currently visible tab__, using the __Link -> Create__ command on the __Share__ menu. This will bring up another dialog with your link already generated. It will likely be very long, so you can copy it to your clipboard, or shorten it to a usable size using the commands under the __Test Link__ button. Clicking on this button itself will allow you to test the _view_ in a new browser tab or window. If you prefer to share your view link as a QR code (for mobile devices), then you can view this using the __QR Code__ button, or even copy the link to the QR Code (to embed in a webpage, document or email) by using the button dropdown. The link will change for each combination of filters, sorts & visibilities - so make sure you __re-use__ this command after any changes you have made! Also, remember that the _view_ link will only be usable to those people who already have access to your underlying _Google Sheet_ using the normal _Google Drive_ sharing process.

##### Finishing Up

When you're all done, you can either open a new sheet or return to the initial page (with your recently opened sheets list) by using the __Close__ command on the __Sheet__ menu. 