---
layout: page
title: About
permalink: /about/
support: true
lead: A collection of web apps, built to take advantage of the Google G-Suite platform and designed to __save time__, making technology __work for you__.
includes: ["README", "TRANSPARENCY", "PRIVACY", "RELIABILITY", "PERFORMANCE", "TERMS"]
sitemap:
  priority: 0.9
---

{::options parse_block_html="true" /}
<div class="d-flex flex-column p-2">
{% for file in page.includes %}
<div class="highlight_all highlight_{{ file | downcase }} mb-3">
{% include_relative {{ file | upcase }}.md %}
</div>
{% endfor %}
</div>

{% include copyright.md %}