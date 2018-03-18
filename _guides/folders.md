---
layout: guide
title: A Guide to Folders
short_title: A Guide
permalink: /guides/folders/
support: true
app: folders
lead: How to use our `Folders` app to help you manage your Google Drive __more effectively__!
---

#### Introduction

The essential __multi-tool__ for power-users of Google Drive. This [lightweight](/about/#performance) web-app makes working with multiple files in your [Google Drive](https://www.google.com/drive/){:target="_blank" rel="noopener"} __quicker__, __more productive__ and __easier__.

#### Features
{:.pt-2}

+ Find and sort with folders __fast__ with free-text searching and simple querying
+ Perform Advanced Searching within a __single folder__, or do a recursive search of all descendent folders as well, includes searching by:
  * __Properties__, including the presence of a property (using AND / OR selectors)
  * Name __Regexes__ (include/exclude files)
  * __Sharing__ Level
  {:.text-muted}
+ __Bulk convert__ files to native file formats (such as Word to Google Docs) in the browser
+ __Bulk export__ native file formats to PDF, including updating previously exported versions
+ Bulk __deletion__ or __starring__ of files
+ __Tag__ files and folders with custom properties
+ __Tally__ folder and file sizes to see where your storage space is being used, and for which types of files

#### Workflow
{:.pt-2}

__Folders__ is designed around a straightforward __search__ (for) then __act__ (upon) process. You can start by __opening__ any folder, [team drive](https://gsuite.google.com/learning-center/products/drive/get-started-team-drive/#!/){:target="_blank" rel="noopener"} or your entire Google Drive. From here, you can see you can perform actions (such as [converting]({% link _tutorials/folders/bulk_converting.md %}), [cloning]({% link _tutorials/folders/clone_files.md %}), [exporting]({% link _tutorials/folders/publish_pdfs.md %}), deleting or [auditing]({% link _tutorials/folders/audit_permissions.md %})) on the files in that folder or navigate to other folders.

To _refine_ your __current view__, you can sort and filter by clicking on the column _headers_. This is a very __fast__ way to find a particular folder/file (within the current set of items), as filters will be applied as you type, rather than having to wait for search results to appear. Clicking on the _remove_ __cross__ (situated on the far right of the _actions_ column) will remove that item from your __current view__, which is useful when _refining_ a list of items before performing a bulk action. Clicking on a file name will load then display a preview / thumbnail (if available) and clicking on a folder will navigate to that folder in the web-app.

Various icons are also shown to make common actions just a click away:

+ <i class="material-icons md-1">cloud</i> / <i class="material-icons md-1">cloud_off</i> - Indicates if an item is shared or not, _clicking_ will __audit__ the sharing permissions of the item.
+ ★ / ☆ - Indicates if an item is starred or not, _clicking_ will either __star__ or __un-star__ the item
+ <i class="material-icons md-1">delete_forever</i> - _Clicking_ on the rubbish bin / trashcan will __delete__ this item from Google Drive
+ ⇗ - Clicking on an link with this icon will open the item in another of our Apps, or an external tool

##### Searching
{:.pt-2}

You can also [search]({% link _tutorials/folders/advanced_searching.md %}) for files in the current folder, or (optionally) in all __descendent__ folders as well. Searching will allow you to perform actions on a large number of files (such as [converting]({% link _tutorials/folders/bulk_converting.md %}) all the Word documents in your Google Drive, or just those below a certain folder). Search results will appear in new _tabs_ within the web-app, allowing you to quickly switch between sets of results.

##### Logging
{:.pt-2}

When you are __cloning__ or __converting__ a set of files, you can also opt to __log the results__ of the actions to a Google Sheet. This will happen automatically if you choose to __batch__ the actions. A sheet will be automatically created (in your Google Drive) and populated as the process runs.