{% assign app = site.data.apps.accounts %}
{% capture text %}
Thanks for logging in, let's __get started__. If you haven't seen this app before, it might be worth __pausing for a moment__ to read the [instructions](#instructions). Or our [about](/about/) page to find out more about this site, our [privacy safeguards](/about/?highlight=privacy){:target="_blank"} and technology.

If this is your first time here, you can __create__ a new Accounts database, which is simply a Google Sheet (in your Google Drive) where your credentials / passwords will be stored. You can do this by clicking on the __create button__ below.
{% endcapture %}
{% include landing.html logo=app.logo buttons=app.buttons %}