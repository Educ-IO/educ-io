---
layout: simple
title: Cloudy Sky
permalink: /extensions/cloudy-sky
style: page
colour: 4a86e8
lead: A simple and powerful Chrome Extension, extending your BlueSky report options simply and easily.
icons: true
---
{% capture lead %}

A simple and powerful __Chrome__ [browser extension](https://support.google.com/chrome_webstore/answer/2664769) which extends the functionality of the [Bluesky](http://blueskyeducation.co.uk/) platform by enabling more comprehensive spreadsheet outputs from existing reports.
{:class="lead"}

Need to output _Lesson Observations_ with __notes / comments__? Want to monitor _Shared Journals_ using a __spreadsheet__? This the extension for you. It needs no configuration or setup, extending your BlueSky report options simply and easily. It's `free`, so you can grab the [code](https://github.com/thiscouldbejd/cloudysky-extension) or install the app from the [Google Web Store](https://chrome.google.com/webstore/detail/cloudysky/ankfkbhcljebidkfgjkhgpkjmlbigkgd).
{:class="lead mb-4"}

{% endcapture %}

{% capture text %}

It is __activated only__ when you visit certain matching [urls](https://github.com/thiscouldbejd/cloudysky-extension/blob/master/manifest.json) in your BlueSky application (using a Chrome browser with the extension installed). When this happens, a small piece of [javascript code](https://github.com/thiscouldbejd/cloudysky-extension/blob/master/open.js) adds 'Export to Spreadsheet' buttons on certain pages. When you click these buttons, extra data is gathered from BlueSky and a spreadsheet generated, which is then downloaded to your device. Nothing leaves your browser, and none of your information is sent anywhere else!
{:class="text-justify"}

#### Instructions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

##### Reviews Evidence <i class="material-icons md-24">face</i> <i class="material-icons md-24">domain</i>
{:title="For BlueSky Users, Mentors & Line Managers"}

While undertaking [reviews](https://v2.blueskyeducation.co.uk/reviews/levels), you can log evidence against different _dimensions_/_standards_. To help manage and monitor this evidence, you could build an __evidence tracker__ spreadsheet using this extension. If you are a line manager, you may also find it easier to use a spreadsheet to track evidence submission against review _dimensions_, such as the __UK Teachers' Standards__. This will help to ensure full evidence coverage. When you visit the  [user](https://v2.blueskyeducation.co.uk/reviews/levels) or [line manager](https://v2.blueskyeducation.co.uk/manage/reviews/index) reviews page, you can click on the evidence links (normally shown as 'Evidence' or a percentage). The extension will then add an 'Export to Spreadsheet' button on the subsequent page which, when clicked, will output links to all the evidence (together with __all comments__) to a spreadsheet, with relevant dimensions/standards. This spreadsheet will be automatically downloaded by your browser, so you can analyse it in Excel or open straight into Google Sheets.

##### Journal <i class="material-icons md-24">face</i>
{:title="For BlueSky Users"}

If you maintain a [personal journal](https://v2.blueskyeducation.co.uk/journal/index) in BlueSky, this extension will allow you to export all of these journal entries. An 'Export to Spreadsheet' button will be added to your [journal](https://v2.blueskyeducation.co.uk/journal/index) page. When you click the button, every journal entry in your current view (optionally filtered) is exported (with full text and any associated comments) to a spreadsheet, which is then downloaded by your browser.

##### Reviews <i class="material-icons md-24">domain</i>
{:title="For BlueSky Mentors & Line Managers"}

If you are using __Reviews__ (under either the [manage](https://v2.blueskyeducation.co.uk/manage/reviews/index){:target="_new"} or [mentor](https://v2.blueskyeducation.co.uk/mentor/reviews/index){:target="_new"} tabs) to track _self-assessments_, _skills_ or _knowlege_ then you might want to __monitor__ which users have completed different reviews. This extension gives you the ability to export this information to a spreadsheet by adding an 'Export to Spreadsheet' to the _paged_ overview of these reviews. This saves you having to click through each page of data (10 items at a time) to get the information you need.

##### Shared Journals <i class="material-icons md-24">domain</i>
{:title="For BlueSky Mentors & Line Managers"}

In the BlueSky web-app, you can access __Shared Journals__ under both [manage](https://v2.blueskyeducation.co.uk/manage/shared-journals/index){:target="_new"} and [mentor](https://v2.blueskyeducation.co.uk/mentor/shared-journals/index){:target="_new"}. These pages allow you to view shared journal entries in a series of _pages_ (10 entries per-page) using various filters (unread/read, by individual and after a specified month). When you use the Cloud Sky extension, an 'Export to Spreadsheet' button is added to these pages. When you click the button, the metadata about each journal entry (date, title, author, whether there are comments and attachments) is added to a spreadsheet output (which is then downloaded by your browser). This is essential if you want to monitor shared journals over time (are they being completed each week, for example). The spreadsheet output will include __all journal entries__ from the __current__ _page_ to the __last__ _page_ of your current filter. So, if you have 50 pages, and you are currently at the first one, the extension will get metadata from each of the 50 pages, giving somewhere between 491 and 500 journal entries into your spreadsheet. If you currently are on page 25, then it will be approximately half of that (pages 25-50 inclusive). Not only is this __accurate__, but it is also __much faster__ than trying to do this manually, because the extension will request several pages at about the same time, working in __parallel__ rather than sequentially processing them.

##### Lesson Observations <i class="material-icons md-24">domain</i>
{:title="For BlueSky Admins"}

Under the admin [reports](https://v2.blueskyeducation.co.uk/admin/org/reports/index){:target="_new"}, you can access a report (level 3) called __Lesson Observations Report__. This allows you to view a __filtered subset__ of all observations (who was observed, who did the observing, when was the observation done and what observation form was used). After the report is generated, this extension adds an 'Export to Spreadsheet' button to this report. If you click on this button, then the observations in the __current report__ will be __exported__ to a spreadsheet (that will be downloaded in your browser). The extension also __gathers any comments__ (notes) made against each observation and adds them to the spreadsheet output (included the date of the comment/note, who made it and what was said). Any evidence documents/links are also 'counted' and the total added to the output as well. If your observation process relies on the use of these comments (ensuring that the relevant line managers have reviewed the observation and commented on it), then the spreadsheet output will allow monitoring of this process, without having to open each observation to check it has been __reviewed__ and __commented__!

#### Licensing
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

The code is fully open-source but does contain code (many thanks!) from the projects below (any alterations or modifications are marked in the code). Everything else is __copyright [JD](https://github.com/thiscouldbejd/), 2017__. This program is free software: you can redistribute it and modify it under the terms of the GNU General Public License (Version 3) as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but __WITHOUT ANY WARRANTY__; without even the implied warranty of __MERCHANTABILITY__ or __FITNESS FOR A PARTICULAR PURPOSE__. Please see the full [GNU General Public License](https://github.com/thiscouldbejd/cloudysky-extension/blob/master/LICENSE) for more details.
{:class="text-justify text-muted"}

|File|From|Copyright|License|
|---|---|---|---|
|XLSX.js|[Github Repo](https://github.com/SheetJS/js-xlsx)|Copyright © 2012-2017 [SheetJS LLC ](http://sheetjs.com/)|[Apache License 2.0](https://github.com/SheetJS/js-xlsx/blob/master/LICENSE)|
|FileSaver.js|[Github Repo](https://github.com/eligrey/FileSaver.js)|Copyright © 2016 [Eli Grey](http://eligrey.com/)|[MIT License](https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md)|
{:class="table table-hover table-responsive"}

{% if site.data.apps.cloudysky.versions %}

#### Recent Versions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}
The most recent versions of this extension are below, showing significant functionality changes and improvements.
{:class="text-small text-muted"}
{% include versions.html versions=site.data.apps.cloudysky.versions %}

{% endif %}

{% endcapture %}
{% include extension.html logo="images/cloudysky.svg" url="https://chrome.google.com/webstore/detail/cloudysky/ankfkbhcljebidkfgjkhgpkjmlbigkgd" action="Install" %}