---
title: Sheets
for: [debug]
script: tests/sheets
tests:
  - name: Colours
    desc: Checks Colour Parsing
    function: colours
  - name: Formats
    desc: Checks Spreadsheet Formatting
    function: formats
  - name: Grid
    desc: Checks Grid Object Creation
    function: grid
  - name: Metadata
    desc: Checks Metadata Object Creation
    function: metadata
  - name: Notation
    desc: Checks Notation Formatting
    function: notation
  - name: Properties
    desc: Checks Spreadsheet Properties
    function: properties
---
These are tests for the __Google Sheet__ helpers. These support __Sheets as a Database__ (in apps such as [accounts](/accounts) and [docket](/docket)) and other apps that interact with Google Sheets (for logging, output etc).