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
  - name: Ingest
    desc: Verifies that externally created records are ingested (marked with an ID) properly
    function: ingest
    auth: google
    scopes:
      - https://www.googleapis.com/auth/drive.file
  - name: Update
    desc: Updates DB Records
    function: update
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
These are tests for the '__Sheets as a Database__' (SaaD) system. This is used for persisting and retrieving data from a Google sheet, in apps such as [accounts](/accounts) and [docket](/docket).