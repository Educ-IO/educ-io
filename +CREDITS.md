---
layout: page
title: Credits
permalink: /credits/
lead: This website and apps rely on code from the wider open-source community. Below is a list of all __external libraries__ that are used in this site, their versions and where you can find more information. A huge debt of thanks is due to all those who work to provide the highest possible quality open-source code.
---
{% include_relative FONTS.md %}

- - -

{% assign imports = site.array %}{% for app in site.data.apps %}{% if app[1].published and app[1].imports and app[1].imports.size > 0 %}{% assign names = app[1].imports | map: "name" %}{% assign imports = names | concat: imports %}{% endif %}{% endfor %}{% assign imports = imports | uniq | sort %}
{% for import in imports %}{% assign __import = site.data.imports[import] %}
##### {{ __import.name }}
{% if __import.version %}+ Version: _{{ __import.version }}_{:.text-muted}{% endif %}
{% if __import.project %}+ Link: [{{ __import.project }}]({{ __import.project }}){:target="_blank"}{% endif %}
{% if __import.license %}+ License: __{{ __import.license | upcase }}__{% endif %}
{% if __import.desc %}
{{ __import.desc }}
{:.small}
{% endif %}
{% unless forloop.last %}* * *{% endunless %}
{% endfor %}
{% include copyright.md %}