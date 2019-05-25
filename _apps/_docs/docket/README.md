{% assign app = site.data.apps.docket %}
{% capture text %}
Thanks for logging in, let's __get started__. If you haven't seen this app before, it might be worth __pausing for a moment__ to read the [instructions](#instructions). Or our [about](/about/) page to find out more about this site, our [privacy safeguards](/about/?highlight=privacy){:target="_blank"} and technology.

If this is your first time here, we will need to __create__ a new Docket, which is simply a Google Sheet (in your Google Drive) where your tasks will be stored. You can do this by clicking on the create button below. If you have deleted your Docket sheet (and want to start over again, with a new task list), then click __clear config__ to restore the app to its default state.
{% endcapture %}
{% include landing.html logo=app.logo buttons=app.buttons %}