{% assign app = site.data.apps.reflect %}
{% capture logo %}{{ app.logo }}{% endcapture %}
{% include public.html logo=logo start="#google,auth" %}