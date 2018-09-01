---
layout: extension
title: Shiny! Shiny!
permalink: /extensions/shiny
colour: 000080
lead: Distraction-free, full-screen text editing for Chromebooks. Ideal for controlled assessments and exams.
excerpt_separator: ~~~~~~~~~~~
---
{% capture lead %}

A __very simple__ text authoring app for Chrome, designed around the [Ace](https://ace.c9.io) text editor. __Ideal__ for use in educational environments where a distraction-free __full screen text editor__ is required, and particularly for _controlled assessments_ or _exams_.
{:class="lead"}

__Ironically__ named for it's _minimalistic approach_ because `simple solutions` are frequently __the best__. It's `free`, so you can grab the [code](https://github.com/thiscouldbejd/Shiny-Shiny) or install the app from the [Google Web Store](https://chrome.google.com/webstore/detail/shiny-shiny/ihigondjldgbcfcaabmplodljjliedaf).
{:class="lead mb-4"}

{% endcapture %}

{% capture text %}

#### Instructions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

You can read the [instructions](https://github.com/thiscouldbejd/Shiny-Shiny/blob/master/documentation/INSTRUCTIONS.md) online, or from within the App by pressing *ctrl-?*{:.kb-shortcut}. As you would expect, files can be opened, saved and printed and a basic [markdown](https://daringfireball.net/projects/markdown/syntax) syntax is used for formatting. To aid _exam typists_ in all subjects, _international_ and _special_ characters are supported by their `Unicode` codes. Full details and the codes themselves can be found in the [characters](https://github.com/thiscouldbejd/Shiny-Shiny/blob/master/documentation/CHARACTERS.md) page online, and can also be viewed in the App by pressing *ctrl-shift-?*{:.kb-shortcut}.
{:class="text-justify"}

#### Page Headers and Printing
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

By default, printing will render with __double line height__ and a __12pt font__ to comply with UK Exam Board marking requirements. To override this, press *ctrl-shift-p*{:.kb-shortcut} rather than *ctrl-p*{:.kb-shortcut}. A title can be added to the start of the document by making it the first line and enclosing it with ampersands, e.g. `@This is a Title@`. To add a header (such as exam paper and candidate details) to _every_ __printed page__, a simple template is used. To access this template, position the cursor at the start of the document and press *ctrl-t*{:.kb-shortcut} to insert the header template. Then simply fill in the template with you own details (lines can be added or removed provided the existing formatting is copied). The header will repeat on every page when you print using *ctrl-p*{:.kb-shortcut}. Currently __only available__ in the __BETA Release__{:.badge .badge-warning} (see [section](#recent-versions) below).

#### Configure Chromebooks for Exams
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

You can use this app as a perfect tool for controlled assessments or exams. If you have [managed Chromebooks](https://support.google.com/chromebook/answer/1331549) in your organisation, then you can configure some of these devices to boot straight into Shiny! Shiny, using [single app kiosk mode](https://support.google.com/chrome/a/answer/3273084). Using Chromebooks for [student assessments](https://static.googleusercontent.com/media/www.google.com/en//chrome/assets/common/files/Chromebooks_assessments_overview.pdf) or exams is easy, fast and secure. 

Using the [Google Admin Console](https://admin.google.com/AdminHome?fral=1#ServiceSettings/notab=1&service=chrome+os&subtab=devicesettings), administrators can set up a dedicated OU with the appropriate kiosk app settings, then simply move the number of __exam devices__ required into this OU. When they next boot up, they will apply the new policy and launch the app. When the exams are complete, the devices can be moved back to their original OUs and will operate as normal Chromebooks again. Using __Cloud Print__ a printer can be assigned to these devices. Security can further be enhanced by disabling USB devices if required.

#### Licensing
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}

The code is fully open-source but does contain code (many thanks!) from the projects below (any alterations or modifications are marked in the code). Everything else is __copyright [JD](https://github.com/thiscouldbejd/), 2014-{{ 'now' | date: "%Y" }}__. This program is free software: you can redistribute it and modify it under the terms of the GNU General Public License (Version 3) as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but __WITHOUT ANY WARRANTY__; without even the implied warranty of __MERCHANTABILITY__ or __FITNESS FOR A PARTICULAR PURPOSE__.  Please see the full [GNU General Public License](https://github.com/thiscouldbejd/Shiny-Shiny/blob/master/LICENSE) for more details.
{:class="text-justify text-muted"}
    
|File|From|Copyright|License|
|---|---|---|---|
|jquery-3.3.1.min.js|[Website](http://jquery.org)|Copyright 2005, 2016 jQuery Foundation, Inc.|MIT License|
|showdown.min.js|[Website](http://showdownjs.com/)|Copyright 2007, John Fraser|[BSD 3-Clause License](https://github.com/showdownjs/showdown/blob/master/license.txt)|
|ace/_*_|[Website](https://ace.c9.io)|Copyright 2010, Ajax.org B.V.|[Revised BSD License](https://github.com/ajaxorg/ace/blob/master/LICENSE)|
|EXAMPLE.md|[Website](http://www.unexpected-vortices.com/sw/rippledoc/quick-markdown-example.html)|Copyright 2014 John Gabriele|[GNU GPL v3](http://www.gnu.org/licenses/)|
{:class="table table-hover table-responsive"}

{% if site.data.apps.shiny.versions %}

#### Recent Versions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}
One of the important uses of this app is for __controlled assessments__ or __exams__. This means that functionality changes could have an impact on students taking those exams. As such, any new changes to the app are published in a [beta](https://chrome.google.com/webstore/detail/shiny-shiny-beta/fjikdpllkfmopbebghfjifpgcjalojjh) version before they are made available in the [production](https://chrome.google.com/webstore/detail/shiny-shiny/ihigondjldgbcfcaabmplodljjliedaf) version. Any update below tagged as a 'BETA Release' is currently only available on the [beta](https://chrome.google.com/webstore/detail/shiny-shiny-beta/fjikdpllkfmopbebghfjifpgcjalojjh) version. Administrators and technical staff should test these releases before any changes are __pushed into production__. [Support subscribers](/support) are pro-actively informed about changes, and can __participate__ in the review and suggestion of __future changes__. 

The most recent versions of this tool are below, showing significant functionality changes and improvements.
{:class="small text-muted"}
{% include versions.html versions=site.data.apps.shiny.versions %}

{% endif %}

{% endcapture %}
{% include extension.html logo="images/shiny.svg" url="https://chrome.google.com/webstore/detail/shiny-shiny/ihigondjldgbcfcaabmplodljjliedaf" action="Install" support="https://github.com/thiscouldbejd/Shiny-Shiny/issues/new" %}