---
title: Promises
for: [debug]
script: tests/promises
tests:
  - name: Sequential
    desc: Test Sequential Promise Execution
    function: sequential
---
To verify the functionality of the __promise__ extensions, which includes the ability to sequentially execute promises (essential in some Apps for non-idempotent rate limiting).