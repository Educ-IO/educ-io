---
layout: page
title: API Scopes
permalink: /scopes/
lead: Each app on this site requires a particular set of permissions to access various parts of your Google account. These are called __[scopes](https://developers.google.com/identity/protocols/googlescopes){:target="_blank"}__ and are visible when you first authorise / sign into an app, or from your [connected app](https://myaccount.google.com/permissions){:target="_blank"} page. Here is a list of those scopes, broken down by app, and a short description of __why__ each permission is needed, and what it is used for.
support: true
---
{% assign apps = site.data.apps | where_exp:"item", "item.published == true" %}
{::options parse_block_html="true" /}
<div class="d-flex flex-column p-2">
{% for app in apps %}
<div class="highlight_all highlight_{{ app.name | downcase }} mb-3">
##### {{ app.name | capitalize }}
{% if app.desc %}{{ app.desc }}
{:.small}{% endif %}
{% for service in app.scopes %}
+ {{ service[0] | capitalize }}
{% for scope in service[1] %}
	- __{{ scope.scope }}__{% if scope.name %} - {{ scope.name }}{% endif %}
	{% if scope.reason %}- __Why?__ _{{ scope.reason }}_{:.text-muted}{% endif %}
{% endfor %}
{% endfor %}
</div>
{% endfor %}
</div>
{% include copyright.md %}