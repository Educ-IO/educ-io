{% assign app = site.data.apps.folders %}
{% capture logo %}{{ app.logo }}{% endcapture %}
{% include public.html logo=logo start="#google,auth" %}