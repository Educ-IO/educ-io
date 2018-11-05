---
title: Router
for: [debug]
script: tests/router
tests:
  - name: Simple
    desc: Test Simple Single Word App Routing
    function: test_Router_Simple
    auth: google
  - name: State
    desc: Test State-Setting App Routing
    function: test_Router_State
    auth: google
  - name: Complex
    desc: Test Complex Stateful App Routing
    function: test_Router_Complex
    auth: google
  - name: Range
    desc: Test Ranged Length App Routing
    function: test_Router_Range
    auth: google
  - name: Length
    desc: Multiple Overriding Length App Routing
    function: test_Router_Length
    auth: google
---
To verify the functionality of the __app router__, which controls ther majority of button and menu actions, providing __stateful routing__ of commands in all apps.