---
layout: page
title: App Dependencies
permalink: /dependencies/
lead: Each app we make includes a __number of different dependencies__. This is __open-source code__ needed to do particular things. Here are __all the dependencies__ we use, indexed by app, with their library sizes.
---

{% assign apps = site.array %}{% for app in site.data.apps %}{% if jekyll.environment == site.debug or app[1].published == true %}{% assign apps = apps | push: app[1] %}{% endif %}{% endfor %}
{::options parse_block_html="true" /}
<div class="d-flex flex-column p-2">
<ul class="list-group">
{% for app in apps %}{% if app.imports %}{% if app.published or app.scoped %}
{% assign total = 0 %}{% assign first = site.array %}{% assign last = site.array %}{% assign lazy = site.array %}
{% for import in app.imports %}{% assign dependency = site.data.imports[import.name] %}
{% if import.load == 'first' and dependency.type == 'js' %}{% assign first = first | push: dependency %}{% elsif import.load == 'last' and dependency.type == 'js' %}{% assign last = last | push: dependency %}{% elsif import.load == 'lazy' and dependency.type == 'js' %}{% assign lazy = lazy | push: dependency %}{% endif %}
{% if jekyll.environment == site.debug %}{% assign total = total | plus: dependency.dev[0].bulk %}{% else %}{% assign total = total | plus: dependency.prod[0].bulk %}{% endif %}
{% endfor %}
<li class="list-group-item">
<div class="d-flex w-100 justify-content-between mt-2">
<h4 class="mb-1" markdown="1"><a href="/{{ app.name | downcase }}">{{ app.name | capitalize }}</a></h4>
<small>Total: <strong>{% include number.html number=total decimals=0 ds="." ts="," suffix="kb" %}</strong></small>
</div>
{% if app.desc %}<p class="mb-1">{{ app.desc | markdownify }}</p>{% endif %}

{% if first.size > 0 %}{% include dependencies.html class="danger" title="Essential:" list=first total=true %}{% endif %}
{% if last.size > 0 %}{% if first.size > 0 %}<hr />{% endif %}{% include dependencies.html class="warning" title="Loaded:" list=last total=true %}{% endif %}
{% if lazy.size > 0 %}{% if first.size > 0 or last.size > 0 %}<hr />{% endif %}{% include dependencies.html class="success" title="On-Demand:" list=lazy %}{% endif %}

</li>
{% endif %}{% endif %}{% endfor %}
</ul>
</div>

* * *

{% include copyright.md %}