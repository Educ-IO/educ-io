{% assign app = site.data.apps.grades %}
{% capture logo %}{{ app.logo }}{% endcapture %}
{% include public.html logo=logo start="#google,auth" %}