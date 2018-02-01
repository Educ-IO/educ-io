{% for tutorial in site.pages %}{% if tutorial.layout == "tutorial" and tutorial.path contains include.app %}
#### {% if include.blank %}[{{ tutorial.title }}]({{ tutorial.url }}){:target="_blank" rel="noopener"}{% else %}[{{ tutorial.title }}]({{ tutorial.url }}){% endif %}
{% if tutorial.lead %}
  {{ tutorial.lead | strip_html }}
{% elsif tutorial.content contains '<!--more-->' %}
  {{ tutorial.content | split:'<!--more-->' | first | strip_html }}
{% else %}
  {{ tutorial.content | strip_html | truncatewords: 40 , "  .." }}
{% endif %}
{% endif %}{% endfor %}