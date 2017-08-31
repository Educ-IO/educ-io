---
layout: page
title: Changes
permalink: /changes/
lead: Find out what is new across the site. Below are lists of the most recent versions for each component of the site, together with a summary description and a run down of all the changes in that version.
support: true
---
{% for app in site.data.versions %}{% assign name = app[0] %}
##### {{ name | capitalize }}
{% if site.data.apps[name].desc %}{{ site.data.apps[name].desc }}
{:.small}{% endif %}
{% for version in app[1] limit:5 %}
+ {{ version[0] }}{% if version[1].type == "security" %} <span class="badge badge-danger">Security Fix</span>{% endif %}{% if version[1].type == "major" %} <span class="badge badge-dark">Major Release</span>{% endif %}{% if version == app[1].first %} <span class="badge badge-secondary">Latest</span>{% endif %}
	- __{{ version[1].name }}__{% if version[1].desc %}
	- _{{ version[1].desc }}_{% endif %}{% if version[1].changes %}{% for change in version[1].changes %}
		* {% if change.details %}{{ change.details }}{% else %}{{ change }}{% endif %}{% if change.url %} (See [here]({{ change.url }}){:target="_blank"} for details){% endif %}
	{% endfor %}{% endif %}
{% endfor %}
{% unless forloop.last %}* * *{% endunless %}
{% endfor %}
{% include copyright.md %}