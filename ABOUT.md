---
layout: page
title: About
permalink: /about/
style: page
lead: A collection of web apps, built to make the most of the Google Apps platform and designed to save time, making the technology work for you.
modules:
  - controller
  - service
imports:
- name: jquery
  load: first
- name: popper
  load: first
- name: bootstrap-css
  load: first
- name: bootstrap-js
  load: last
---

{% include_relative README.md %}

- - -

{% include_relative TRANSPARENCY.md %}

- - -

{% include_relative PRIVACY.md %}

- - -

{% include_relative RELIABILITY.md %}

- - -

{% include_relative TERMS_OF_SERVICE.md %}