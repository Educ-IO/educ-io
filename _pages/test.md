---
layout: page
title: Browser Test
permalink: /test/
helpers:
  - handlebars
modules:
  - controller
  - service
  - flags
  - display
  - test
  - page
imports:
- name: jquery_slim
  load: first
- name: popper
  load: first
- name: bootstrap-js
  load: last
- name: underscore
  load: last
- name: handlebars
  load: last
- name: urlparser
  load: last
- name: localforage
  load: last
templates:
    - test/status
lead: Check that your browser will work `seamlessly` with __our apps__. The tests below will highlight any issues, or give you the green light that everything is going to be __just fine__!
icons: true
---

The following tests have been run in your browser to verify that the code that our app use will __successfully run__. You will see an __overall status result__ as well as results for each of the individual tests. Some tests may show __warnings__, but any functionality in these cases will be _[polyfilled](https://remysharp.com/2010/10/08/what-is-a-polyfill){:target="_new"}_ and should __not prevent__ the apps from running successfully, although they might __not perform__ optimally.
{:class="preamble"}

{% include copyright.md %}