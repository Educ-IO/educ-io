{% assign app = site.data.apps.view %}
{% capture logo %}{{ app.logo }}{% endcapture %}
{% include public.html logo=logo start="#google,auth" %}