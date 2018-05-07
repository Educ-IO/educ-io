---
layout: page
title: API Scopes
permalink: /scopes/
lead: Each app requires a __particular set of permissions__ to access various parts of your Google account. These are called __[scopes](https://developers.google.com/identity/protocols/googlescopes){:target="_blank"}__ and are visible when you first sign into an app, or from your [connected apps](https://myaccount.google.com/permissions){:target="_blank"} page. By authorising an app, the token that __grants access__ will remain on __your device only__ - nowhere else! Here are those scopes, broken down by app, with a short description of __why__ each permission is needed, and what it is used for.
support: true
---
{% assign apps = site.array %}{% for app in site.data.apps %}{% if jekyll.environment == site.debug or app[1].published == true %}{% assign apps = apps | push: app[1] %}{% endif %}{% endfor %}
{::options parse_block_html="true" /}
<div class="d-flex flex-column p-2">
{% for app in apps %}
{% if app.scopes %}
<div class="highlight_all highlight_{{ app.name | downcase }} mb-3">
##### {{ app.name | capitalize }}
{% if app.desc %}{{ app.desc }}
{:.small}{% endif %}
{% for service in app.scopes %}
+ {{ service[0] | capitalize }}
{% for scope in service[1] %}
	- __{{ scope.scope }}__{:.wrap-break}{% if scope.name %} - {{ scope.name }}{% endif %}
	{% if scope.reason %}- __Why?__ _{{ scope.reason }}_{:.text-muted}{% endif %}
{% endfor %}
{% endfor %}
</div>
{% endif %}
{% endfor %}
</div>
{% include copyright.md %}