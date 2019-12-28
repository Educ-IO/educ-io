---
layout: simple
title: Home
permalink: /
style: page
description: Web Apps & Tools built for Google Apps
css:
  primary:
    - bootstrap/functions
    - bootstrap/variables
    - bootstrap/mixins
    - bootstrap/utilities
    - bootstrap/root
    - bootstrap/reboot
    - bootstrap/type
    - bootstrap/images
    - bootstrap/grid
    - bootstrap/buttons
    - material/buttons
    - bootstrap/carousel
    - material/carousel
    - custom/variables
    - custom/basic
    - custom/fonts
    - custom/logo
    - custom/home
  secondary:
    - bootstrap/functions
    - bootstrap/variables
    - bootstrap/mixins
    - bootstrap/alert
    - bootstrap/close
    - bootstrap/print
helpers:
  - scroll
modules:
  - controller
  - service
  - home
sitemap:
  priority: 1.0
---
{% capture lead %}
__Welcome__ to our place, __open it__ up and find a collection of `free web apps` that __integrate__ with the Google platform. They make complex and everyday tasks __easier__, __faster__ and more __intuitive__.
{:class="lead"}
{% endcapture %}

{% capture text %}
Running __entirely__ in __your web browser__{:class="text-success"} and using the [Google APIs](https://en.wikipedia.org/wiki/Google_APIs "All about the Google APIs - Wikipedia"), we enhance the functionality of G-Suite apps (Drive, Sheets, Docs & Slides) for __busy professionals__. Read our [about](/about/ "About this site") page to find out more, especially about our strong [privacy](about/?highlight=privacy) __safeguards__, commitment to __transparency__, [GDPR](/articles/2018-03-26-gdpr/) __compliance__ and our __technology__. Learn how to [suggest ideas](/support/) or check our [technical](/requirements/) and [access](/scopes/) requirements.
{:class="text-justify"}

The apps are below and ready to use straight away, `so jump in` and __give them a go__!
{:class="lead mb-3"}

{% endcapture %}
{% include home.html logo="images/logo.svg" %}