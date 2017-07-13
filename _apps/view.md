---
layout: app
title: View | Educ.IO
permalink: /view/
fonts: true
bootstrap: true
google: true
imports: jquery;tether;bootstrap;showdown;hello;urlparser;loki;clusterize;xlsx;filesaver;handlebars
scripts: polyfills.js;setup.js;flags.js;interact.js;google.js;apps/view.js;app.js
templates: choose;confirm
scopes:
  - email
  - profile
  - https://www.googleapis.com/auth/drive.file
  - https://www.googleapis.com/auth/spreadsheets.readonly
style: _apps/view
menu:
  name: Commands
  groups:
    file:
      name: File
      commands:
        - name: Open
          description: Open a Sheet from your Drive
          hash: open
        - name: Export
          description: Export the Sheet to Legacy Formats
          hash: export
        - name: Close
          description: Close the current Sheet
          hash: close
version: 0.0.1
---