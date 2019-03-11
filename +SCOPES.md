---
layout: page
title: API Scopes
permalink: /scopes/
lead: Each app requires a __particular set of permissions__ to access various parts of your Google account. These are called __[scopes](https://developers.google.com/identity/protocols/googlescopes){:target="_blank"}__ and are visible when you first sign into an app, or from your [connected apps](https://myaccount.google.com/permissions){:target="_blank"} page. By authorising an app, the token that __grants access__ will remain on __your device only__ - nowhere else!
support: true
---

Here are __all the scopes__ we use, broken down by app, with a short description of __why__ each permission is needed, and what it is used for. Sometimes, scopes are only required when you try to use a certain part or function within an app. These scopes are only requested at that point in time, and are __not required for core functionality__. We believe in asking for the __minimum number__ of scopes to allow our apps to function. Extra scopes are only required if you want to use that feature (such as sending an email from one of our apps, for example). These scopes are marked as __OPTIONAL__{:.badge .badge-dark} in the list below.

{% assign apps = site.array %}{% for app in site.data.apps %}{% if jekyll.environment == site.debug or app[1].published == true %}{% assign apps = apps | push: app[1] %}{% endif %}{% endfor %}
{::options parse_block_html="true" /}
<div class="d-flex flex-column p-2">
{% for app in apps %}
{% if app.scopes %}{% if app.published or app.scoped %}
<div class="highlight_all highlight_{{ app.name | downcase }} mb-3">
<div class="alert alert-success">
##### {{ app.name | capitalize }}
{% if app.desc %}{{ app.desc }}
{:.small .mb-0}{% endif %}
</div>
{% for service in app.scopes %}
+ ###### {{ service[0] | capitalize }}
{% for scope in service[1] %}
	- __{{ scope.scope }}__{:.wrap-break}{% if scope.name %} - {{ scope.name }}{% endif %} {% if scope.request == 'lazy' %}__OPTIONAL__{:.badge .badge-primary}{% endif %}
	{% if scope.reason %}- __Why?__ _{{ scope.reason }}_{:.text-muted}{% endif %}
{% endfor %}
{% endfor %}
</div>
{% endif %}{% endif %}
{% endfor %}
</div>
{% include copyright.md %}