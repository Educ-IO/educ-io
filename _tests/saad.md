---
title: SaaD
for: [debug]
script: tests/saad
tests:
  - name: Fail
    desc: Verifies that the Check Mechanism is working properly (by failing)
    function: fail
    expected: false
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Create
    desc: Creates a new DB
    function: create
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Open
    desc: Opens an existing DB
    function: open
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Insert
    desc: Populates a DB with Records
    function: insert
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Fill
    desc: Fills a new DB with Records
    function: fill
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Edge
    desc: Edge case insertion and deletion with a new DB
    function: edge
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Ingest
    desc: Verifies that externally created records are ingested (marked with an ID) properly
    function: ingest
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Update
    desc: Updates All DB Records
    function: update
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Legacy Update
    desc: Updates All DB Records (without ID or Ingest)
    function: legacyUpdate
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Single Update
    desc: Updates Single DB Record (by ID)
    function: singleUpdate
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Single Legacy Update
    desc: Updates Single DB Record (by ROW)
    function: singleLegacyUpdate
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Multiple Update
    desc: Updates Multiple DB Records (by ID)
    function: multipleUpdate
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Multiple Legacy Update
    desc: Updates Multiple DB Records (by ROW)
    function: multipleLegacyUpdate
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Delete
    desc: Deletes Records from a DB
    function: delete
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Collision
    desc: Simulates a collision, where a DB Record is updated externally
    function: collision
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
These are tests for the '__Sheets as a Database__' (SaaD) system. This is used for persisting and retrieving data from a Google sheet, in apps such as [accounts](/accounts) and [docket](/docket). The first test should __fail__ to ensure the check mechanism is working properly.