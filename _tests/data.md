---
title: Data
for: [debug]
script: tests/data
tests:
  - name: Dialogs
    desc: Checks getting and setting of data from dialog boxes
    function: dialogs
  - name: Forms
    desc: Checks getting and setting of data from complex forms
    function: forms
  - name: Interactions
    desc: Checks interactions with User Interface form elements
    function: interactions
  - name: Persistence
    desc: Checks dehydrated and rehydrating data from / to complex forms
    function: persistence
---
These are tests for the __data__ modules and helpers. They are used to serialise/deserialise data from dialog boxes and complex forms (used in apps such as [reflect](/reflect)).