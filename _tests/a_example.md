---
title: Example
display: Example-ception
for: [debug]
script: tests/example
tests:
  - name: Test 1
    desc: First Example Test
    function: test1
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Test 2
    desc: Second Example Test
    function: test2
    expected: false
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Test 3
    desc: Third Example Test
    function: test3
    expected: error
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
---
These are example tests, to verify that the debug testing system is, in itself, functioning properly! __Click__ on the individual tests below to __run them__, visual __status__ of the tests will be shown within the __button__. Test 1 should __succeed__{:.badge .badge-pill .badge-success .text-uppercase}, Test 2 and Test 3 should __fail__{:.badge .badge-pill .badge-danger .text-uppercase}.