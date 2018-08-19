---
title: SaaD
for: [debug]
script: tests/saad
tests:
  - name: Create
    desc: Creates a new DB
    function: create
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Query
    desc: Queries a DB
    function: query
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
---
These are tests for the '__Sheets as a Database__' (SaaD) system. This is used for persisting and retrieving data from a Google sheet, in apps such as [accounts](/accounts) and [docket](/docket).