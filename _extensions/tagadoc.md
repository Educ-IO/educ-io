---
layout: extension
title: Tag-a-Doc
permalink: /extensions/tag-a-doc
colour: cc0
lead: Show tags directly in Google Docs!
---
{% capture lead %}

An indispensible little __Chrome__ [browser extension](https://support.google.com/chrome_webstore/answer/2664769) which will __display tags__ in the header of your Google Docs, Sheets, Slides and Drawings.
{:class="lead"}

Use it to __keep track__ of projects, or remind users when they are handling __confidential__ or __sensitive__ information. With our [folders](/folders) app managing your tags, this extension makes sure __everyone sees them__. It's `free`, so you can grab the [code](https://github.com/thiscouldbejd/tagadoc-extension) or install the app from the [Google Web Store](https://chrome.google.com/webstore/detail/tagadoc/ekniapbebejhamindielmdgpceijdpff).
{:class="lead mb-4"}

{% endcapture %}

{% capture text %}

#### Instructions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

Once installed, you need to quickly and securely __sign in__ to the extension using your Google account. You can do this by clicking on the __extension icon__ in Chrome (which should be found on the top right, near the end of the address bar). Then click on the __sign in__ button to trigger the authentication process. You will need to grant the extension permission to read your Google Drive files, so it can lookup property tags for your opened documents. In line with our fierce commitment to [your privacy](/about/#privacy), __no data__ from your Google drive __is ever sent to us__.

Once you have signed in, any __tags__ associated with your Google documents (documents, spreadsheets, presentations or drawings) will be displayed as __small badges__ at the top of your editor window (next to the title of the document). These will match the look and feel of the tags you can __edit__ and __manage__ using our [folders](/folders) app.

If you are not signed in to the extension, a small __warning badge__ will appear instead. We display this to make you aware when you're not signed in, rather than there being no tags associated with the document.

#### Licensing
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

The code is fully open-source, and __copyright [JD](https://github.com/thiscouldbejd/), 2018__. This program is free software: you can redistribute it and modify it under the terms of the GNU General Public License (Version 3) as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but __WITHOUT ANY WARRANTY__; without even the implied warranty of __MERCHANTABILITY__ or __FITNESS FOR A PARTICULAR PURPOSE__. Please see the full [GNU General Public License](https://github.com/thiscouldbejd/cloudysky-extension/blob/master/LICENSE) for more details.
{:class="text-justify text-muted"}

{% if site.data.apps.tagadoc.versions %}

#### Recent Versions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}
The most recent versions of this extension are below, showing significant functionality changes and improvements.
{:class="text-small text-muted"}
{% include versions.html versions=site.data.apps.tagadoc.versions %}

{% endif %}

{% endcapture %}
{% include extension.html logo="images/tagadoc.svg" url="https://chrome.google.com/webstore/detail/tagadoc/ekniapbebejhamindielmdgpceijdpff" action="Install" %}