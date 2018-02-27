---
layout: extension
title: Shiny! Shiny!
permalink: /extensions/shiny
colour: 000080
lead: Distraction-free, full screen text editing for Chromebooks. Ideal for controlled assessments and exams.
---
{% capture lead %}

A __very simple__ text authoring app for Chrome, designed around the [Ace](https://ace.c9.io) text editor. __Ideal__ for use in educational environments where a distraction-free __full screen text editor__ is required, and particularly for _controlled assessments_ or _exams_.
{:class="lead"}

__Ironically__ named for it's _minimalistic approach_ because `simple solutions` are frequently __the best__. It's `free`, so you can grab the [code](https://github.com/thiscouldbejd/Shiny-Shiny) or install the app from the [Google Web Store](https://chrome.google.com/webstore/detail/shiny-shiny/ihigondjldgbcfcaabmplodljjliedaf).
{:class="lead mb-4"}

{% endcapture %}

{% capture text %}

You can read the [instructions](https://github.com/thiscouldbejd/Shiny-Shiny/blob/master/documentation/INSTRUCTIONS.md) online, or from within the App by pressing *ctrl-?*{:.kb-shortcut}. As you would expect, files can be opened, saved and printed and a basic [markdown](https://daringfireball.net/projects/markdown/syntax) syntax is used for formatting. To aid _exam typists_ in all subjects, _international_ and _special_ characters are supported by their `Unicode` codes. Full details and the codes themselves can be found in the [characters](https://github.com/thiscouldbejd/Shiny-Shiny/blob/master/documentation/CHARACTERS.md) page online, and can also be viewed in the App by pressing *ctrl-shift-?*{:.kb-shortcut}.
{:class="text-justify"}

The code is fully open-source but does contain code (many thanks!) from the projects below (any alterations or modifications are marked in the code). Everything else is __copyright [JD](https://github.com/thiscouldbejd/), 2014-2017__. This program is free software: you can redistribute it and modify it under the terms of the GNU General Public License (Version 3) as published by the Free Software Foundation. This program is distributed in the hope that it will be useful, but __WITHOUT ANY WARRANTY__; without even the implied warranty of __MERCHANTABILITY__ or __FITNESS FOR A PARTICULAR PURPOSE__.  Please see the full [GNU General Public License](https://github.com/thiscouldbejd/Shiny-Shiny/blob/master/LICENSE) for more details.
{:class="text-justify text-muted"}
    
|File|From|Copyright|License|
|---|---|---|---|
|jquery-2.2.0.min.js|[Website](http://jquery.org)|Copyright 2005, 2016 jQuery Foundation, Inc.|MIT License|
|Markdown.Convertor.js|[Website](https://code.google.com/p/pagedown/)|Copyright 2004-2014 Various|[MIT License](https://code.google.com/p/pagedown/source/browse/LICENSE.txt)|
|Marked.js|[Website](https://github.com/chjj/marked)|Copyright 2011-2014, Christopher Jeffrey|[MIT License](https://github.com/chjj/marked/blob/master/LICENSE)|
|ace/_*_|[Website](https://ace.c9.io)|Copyright 2010, Ajax.org B.V.|[Revised BSD License](https://github.com/ajaxorg/ace/blob/master/LICENSE)|
|EXAMPLE.md|[Website](http://www.unexpected-vortices.com/sw/rippledoc/quick-markdown-example.html)|Copyright 2014 John Gabriele|[GNU GPL v3](http://www.gnu.org/licenses/)|
{:class="table table-hover table-responsive"}

{% if site.data.apps.shiny.versions %}

#### Recent Versions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}
The most recent versions of this tool are below, showing significant functionality changes and improvements.
{:class="text-small text-muted"}
{% include versions.html versions=site.data.apps.shiny.versions %}

{% endif %}

{% endcapture %}
{% include extension.html logo="images/shiny.svg" url="https://chrome.google.com/webstore/detail/shiny-shiny/ihigondjldgbcfcaabmplodljjliedaf" action="Install" support="https://github.com/thiscouldbejd/Shiny-Shiny/issues/new" %}