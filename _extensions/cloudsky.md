---
layout: simple
title: Cloudy Sky
permalink: /extensions/cloudy-sky
style: page
colour: 4a86e8
lead: A simple and powerful Chrome Extension, extending your BlueSky report options simply and easily.
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

The code is fully open-source but does contain code (many thanks!) from the projects below (any alterations or modifications are marked in the code). Everything else is __copyright [JD](https://github.com/thiscouldbejd/), 2017__. This program is free software: you can redistribute it and modify it under the terms of the GNU General Public License (Version 3) as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but __WITHOUT ANY WARRANTY__; without even the implied warranty of __MERCHANTABILITY__ or __FITNESS FOR A PARTICULAR PURPOSE__.  Please see the full [GNU General Public License](https://github.com/thiscouldbejd/cloudysky-extension/blob/master/LICENSE) for more details.
{:class="text-justify text-muted"}

|File|From|Copyright|License|
|---|---|---|---|
|XLSX.js|[Github Repo](https://github.com/SheetJS/js-xlsx)|Copyright © 2012-2017 [SheetJS LLC ](http://sheetjs.com/)|[Apache License 2.0](https://github.com/SheetJS/js-xlsx/blob/master/LICENSE)|
|FileSaver.js|[Github Repo](https://github.com/eligrey/FileSaver.js)|Copyright © 2016 [Eli Grey](http://eligrey.com/).|[MIT License](https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md)|
{:class="table table-hover table-responsive"}

{% endcapture %}
{% include extension.html logo="images/cloudysky.svg" url="https://chrome.google.com/webstore/detail/cloudysky/ankfkbhcljebidkfgjkhgpkjmlbigkgd" action="Install" %}