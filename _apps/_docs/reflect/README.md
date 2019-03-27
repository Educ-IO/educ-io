{% assign app = site.data.apps.reflect %}
{% capture text %}Thanks for logging in; let's __get started__. Use the __menus above__, your __recently created__ reports, or the __buttons below__ to jump straight in.

If you haven't used this app before, please take __a moment__ to read the [instructions](#instructions) or [guide](/guides/reflect){:target="_blank"} which will help you understand how __versatile__ and __powerful__ reflect is!

We also have a series of [tutorials](#tutorials) to help you with __specific tasks__.

Finally, please visit our [about](/about/){:target="_blank"} page to find out more about this site, our [privacy safeguards](about/?highlight=privacy){:target="_blank"} and our technology.{% endcapture %}
{% include landing.html logo=app.logo buttons=app.buttons %}