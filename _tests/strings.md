---
title: Strings
for: [debug]
script: tests/strings
tests:
  - name: Sort
    desc: Test Sensible Sorter
    function: sort
  - name: Stringify
    desc: Test Deterministic Stringify
    function: stringify
---
To verify the functionality of the __strings helper__, which includes a sensible sort (numerically sensitive) and a deterministic conversion of objects to strings (essential for apps like __Relect__ to function correctly).