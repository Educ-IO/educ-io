---
layout: extension
title: Gabriel
permalink: /extensions/gabriel
colour: 333333
excerpt_separator: ~~~~~~~~~~~
---
{% capture lead %}

Your very own __markdown angel__. Publish __google docs__ to [github pages](https://pages.github.com/) with this `simple add-on`. Gabriel grabs your document, __converts__ it to [markdown](https://daringfireball.net/projects/markdown/syntax), before sprinkling a little __metadata__ (title, author &amp; tags) and __committing__ it to your selected Github Repository.
{:class="lead"}

Designed to make generating a publishing Markdown __easier__ for non-technical or non-confident users and named with a nod to __Jekyll &amp; Hyde__ as it is best used with static [Jekyll](https://jekyllrb.com/) sites. It's `free`, so you can grab the [code](https://github.com/thiscouldbejd/Gabriel) or install the app from the [Google Web Store](https://chrome.google.com/webstore/detail/gabriel-the-markdown-ange/okimajjeocnndpifeelaajdebkkbckff).
{:class="lead mb-4"}

{% endcapture %}

{% capture text %}

Gabriel is aimed at users who have a [Jekyll](https://jekyllrb.com/) blog or static site that is hosted using Github Pages, but who are not especially familiar with the [markdown](https://daringfireball.net/projects/markdown/syntax) format, or the technicalities of GitHub _commits_. Jekyll is a static site generator, transforming Markdown into a fully featured blog or article-driven website. You can host these for free using Github. What this add-on does is allow you to __transform your Google Docs__ into this Markdown format, and __publish in one easy step__; all directly from Google Apps.
{:class="text-justify"}

+ [Creating and Hosting a Personal Site on GitHub](http://jmcglone.com/guides/github-pages/)
+ [Template Github Pages / Jekyll Blog](https://github.com/barryclark/jekyll-now)
+ [Create a Beautiful and Minimal Blog Using Jekyll, Github Pages, and Poole](http://joshualande.com/jekyll-github-pages-poole)
+ [Build A Blog With Jekyll And GitHub Pages](http://www.smashingmagazine.com/2014/08/build-blog-jekyll-github-pages/)

We help you use Google Docs as a __content authoring system__ for your blog. Ordinarily, you would author blog posts (in Markdown) on your local computer (then use the Github Command Line Interface or GUI Application to push them to Github) or on the Github website directly (which doesn't allow you to save a draft while working on it). With Gabriel, you can author each post as a document in Google Docs, including __tables__, __links__, __headers__ and __images__. When you're ready to publish it, simply __save__ it to Github and all the _technicalities_ of conversion and publishing are taken care of. If you need to __update the post__ in the future, just make your content changes and re-save it, which will __update the published versions__.
{:class="text-justify"}

It allows for simple __permalinks__, __tagging__ and __titles__. You can also submit [arbitary YAML](https://jekyllrb.com/docs/frontmatter/) if you're doing custom things in Jekyll. All Gabriel related metadata is stored in the `DocumentProperties` of the document, making it ideal for collaboration (e.g. the settings for each document follow each document, rather than the user).You can also simultaneous publish to multiple blogs/repos at the same time, making cross-posting much __faster__.
{:class="text-justify"}

To use this add-on, you'll need to have a Github account already [set up](https://help.github.com/articles/signing-up-for-a-new-github-account/), and __ideally__ your Jekyll-based blog already set up and running (although this is a recommendation, not a requirement). The __first time__ you run this add-on, you'll need to authorise it to talk to Github on your behalf. This involves clicking on the link that will appear in the sidebar and __following__ the __on-screen instructions__ (Github will ask you to grant 'Gabriel - The Markdown Angel' access to your repositories and author files within them). If you __grant this__ (which you will need to do for the add-on to work), then you will have to close and re-open the sidebar. Once this is done, you'll be ready to go!
{:class="text-justify"}

The code is fully __open-source__ but does contain code (many thanks!) from the projects below (any alterations or modifications are marked in the code). Everything else is __copyright [JD](https://github.com/thiscouldbejd/), 2015-2017__. This software is licensed under the __Apache License__, _Version 2.0_ (the "License"); you may not use this software except in compliance with the License.
You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0). Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
{:class="text-justify text-muted"}
    
|File|From|Copyright|License|
|---|---|---|---|
|OAuth2.gs|[Github Repo](https://github.com/googlesamples/apps-script-oauth2)|Copyright 2014 Google Inc.<br>All Rights Reserved.|[Apache License, Version 2.0](https://github.com/googlesamples/apps-script-oauth2/blob/master/LICENSE)|
|Markdown.gs|[Github Repo](https://github.com/mangini/gdocs2md)|Copyright 2013 Google Inc.<br>All Rights Reserved.|[Apache License, Version 2.0](https://github.com/mangini/gdocs2md/blob/master/LICENSE)|
|Underscore|[Website](http://underscorejs.org)|Copyright 2009-2015<br/>Jeremy Ashkenas, DocumentCloud and Investigative Reporters &amp; Editors|[MIT License](https://github.com/jashkenas/underscore/blob/master/LICENSE)|
|js-yaml.min.gs|[Github Repo](https://github.com/nodeca/js-yaml)|Copyright (C) 2011-2015 by Vitaly Puzrin|[MIT License](https://github.com/nodeca/js-yaml/blob/master/LICENSE)|
{:class="table table-hover table-responsive"}

The __logo__ incorporates the [Markdown Mark](https://github.com/dcurtis/markdown-mark) which is licensed under the Creative Commons License (CC0 UNIVERSAL PUBLIC DOMAIN DEDICATION LICENSE).

{% if site.data.apps.gabriel.versions %}

#### Recent Versions
{:class="border border-left-0 border-right-0 border-top-0 mt-2 pb-1"}
The most recent versions of this add-on are below, showing significant functionality changes and improvements.
{:class="text-small text-muted"}
{% include versions.html versions=site.data.apps.gabriel.versions %}

{% endif %}

{% endcapture %}
{% include extension.html logo="images/gabriel.svg" url="https://chrome.google.com/webstore/detail/gabriel-the-markdown-ange/okimajjeocnndpifeelaajdebkkbckff" action="Install" support="https://github.com/thiscouldbejd/Gabriel/issues/new" %}