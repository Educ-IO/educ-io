{% assign app = site.data.apps.merge %}
{% capture logo %}{{ app.logo }}{% endcapture %}
{% include public.html logo=logo start="#google,auth" %}