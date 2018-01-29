---
layout: extension
title: Sheets for iSAMS
permalink: /extensions/isams
colour: 38761d
lead: An easy to use Chrome Extension, making working with iSAMS and Google Apps even better.
---
{% capture lead %}

An incredibly easy to use __Chrome__ [browser extension](https://support.google.com/chrome_webstore/answer/2664769) which allows [iSAMS](https://www.isams.com/) MIS lists to be directly opened into a browser window (rather than downloaded).
{:class="lead"}

Using iSAMS in __Chromebook__ / __Google Apps__ environment? This little extension will ensure that 'XLS / Excel' reports will __open directly in your browser window__ rather than downloading first. It's simple and just works. This makes it faster, smoother, and easier to work with iSAMS using a __Chromebook__. It's `free`, so you can grab the [code](https://github.com/thiscouldbejd/isams-extension) or install the app from the [Google Web Store](https://chrome.google.com/webstore/detail/isams-xls-reports-to-shee/kkahfpjmfgjidhahaapadhgcnecbfckl).
{:class="lead mb-4"}

{% endcapture %}

{% capture text %}

It is __activated only__ when you visit certain matching [urls](https://github.com/thiscouldbejd/isams-extension/blob/master/manifest.json) in your iSAMS application (using a Chrome browser with the extension installed). When this happens, a small piece of [javascript code](https://github.com/thiscouldbejd/isams-extension/blob/master/open.js) is run when you click on the 'XLS' download link, which downloads the file for you, and then opens in a new tab (rather than just saving it to your computer). Nothing leaves your browser, and none of your information is sent anywhere else!
{:class="text-justify"}

The code is fully open-source but does contain code (many thanks!) from the projects below (any alterations or modifications are marked in the code). Everything else is __copyright [JD](https://github.com/thiscouldbejd/), 2017__. This program is free software: you can redistribute it and modify it under the terms of the GNU General Public License (Version 3) as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but __WITHOUT ANY WARRANTY__; without even the implied warranty of __MERCHANTABILITY__ or __FITNESS FOR A PARTICULAR PURPOSE__.  Please see the full [GNU General Public License](https://github.com/thiscouldbejd/isams-extension/blob/master/LICENSE) for more details.
{:class="text-justify text-muted"}

|File|From|Copyright|License|
|---|---|---|---|
|FileSaver.js|[Github Repo](https://github.com/eligrey/FileSaver.js)|Copyright © 2016 [Eli Grey](http://eligrey.com/).|[MIT License](https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md)|
{:class="table table-hover table-responsive"}

{% if site.data.apps.isams.versions %}

#### Recent Versions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}
The most recent versions of this extension are below, showing significant functionality changes and improvements.
{:class="text-small text-muted"}
{% include versions.html versions=site.data.apps.isams.versions %}

{% endif %}

{% endcapture %}
{% include extension.html logo="images/sheets_downloader.svg" url="https://chrome.google.com/webstore/detail/isams-xls-reports-to-shee/kkahfpjmfgjidhahaapadhgcnecbfckl" action="Install" %}