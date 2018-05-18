---
layout: page
title: Changes
permalink: /changes/
lead: Find out what is new across the site. Below are lists of the most recent versions for each component of the site, together with a summary description and a run down of all the changes in that version.
support: true
---
{::options parse_block_html="true" /}
<div class="d-flex flex-column p-2">
{% for app in site.data.versions %}{% assign _name = app[0] %}{% if jekyll.environment == site.debug or _name == 'site' or site.data.apps[_name].published == true %}
{% assign _desc = site.data.apps[_name].desc %}{% assign _versions = app[1] %}
{% include versions.html name=_name desc=_desc versions=_versions %}
{% endif %}{% endfor %}
</div>
{% include copyright.md %}