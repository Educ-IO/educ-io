---
layout: guide
title: A Guide to Docket
permalink: /guides/docket/
short_title: A Guide
support: true
app: docket
---

#### Introduction

Calendars and task lists are great, but Docket is __even better__, because it helps you focus on what is important; the __things you need to do__.

It is simple, [lightweight](/about/#performance) and really easy to use. Fully functional on mobile devices, it also has keyboard shortcuts to make desktop work faster. Your task data is stored in a __Google Sheet__ in your [Google Drive](https://www.google.com/drive/){:target="_blank" rel="noopener"}. This makes it easy to use your productivity data for other things too (project tracking, goal management) as well as giving you reassurance about your __security__ and __complete privacy__.

#### Concept
{:.pt-2}

Some people live by scheduling their time, using a diary application such as [Google Calendar](https://calendar.google.com/){:target="_blank" rel="noopener"}. This works very well if you end up with a lot of temporally-bounded tasks that start / end at precise times (such as meetings, appointments, lessons etc.). Others work best by maintaining a task list, either as a standalone app or [integrated](https://gsuite.google.com/learning-center/products/apps/keep-track-of-tasks){:target="_blank" rel="noopener"} into their email/diary solution. Task lists are excellent in that they give you a list of everything you need to tackle, but often no easy way to schedule __when__ you are going to get it done.

Docket is a __little different__. It is a fusion of these two concepts, ideal for people who prefer to organise themselves around achieving targets. It is centred around a responsive weekly view (one, two or three columns wide, depending on the size of your To help manage this, Docket uses __two types__ of items:

##### Tasks

This is anything that __needs to get done__. A task is entered on a particular date (when it can/should be started), and can be in the future (for things that you know you will need to do or work on). Any task from the past will __rollover to the current date__ whilst it __remains incomplete__, so that you don't forget about them! Once a task has been marked as complete, it will remain under the day upon which it was completed. You can also always delete tasks if they are no longer relevant or required.

##### Events

Events are an item which is entered with a time. Past events __do not roll over__ to the current date, because they are specific to that single moment. This is ideal for meetings, appointments or reminders to take a call. Events are marked by a small <i class="material-icons md-1">schedule</i> icon but can be treated very similarly to tasks.

#### Display and Tags

Any item stored in Docket can be formatted using the popular [Markdown](https://www.markdownguide.org/){:target="_blank" rel="noopener"} syntax. This allows simple formatting, such as __bold__ and _italic_, as well as hyperlinks to other resources (such as an [email]({% link _tutorials/docket/hyperlinking_gmail.md %}), document or work item in another system). Tags can be applied to each item upon creation, and removed at any time, giving you the flexibility to apply project codes, extra statuses or metadata to help you best manage your workflow.

__TAGS__{: .badge .badge-pill .badge-primary} appear as pill-style badges at the start of each item. By default, tags are __blue__ but certain key terms are highlighted in __different colours__ (consistent with tags in our other apps):

+ __Info__ will appear in __GREY__{: .badge .badge-pill .badge-secondary}
+ __High__ = Will appear in __RED__{: .badge .badge-pill .badge-danger}
+ __Medium__ = Will appear in __ORANGE__{: .badge .badge-pill .badge-warning}
+ __Low__ = Will appear in __GREEN__{: .badge .badge-pill .badge-success}
+ __Work__ = Will appear in __BLACK__{: .badge .badge-pill .badge-dark}
+ __Review__ = Will appear in __TEAL__{: .badge .badge-pill .badge-info}
+ __Social__ = Will appear in __RAINBOW__{: .badge .badge-pill .badge-rainbow}

#### Data and Interoperability

Your Docket database is a standard __Google Sheet__, which means you retain complete control over your data at all times. In line with our policy on [privacy](/about/#privacy) and [transparency](/about/#privacy), we don't see, touch nor host your data. We provide the tools for you to manage and interact with your data.

Having your data in your __own sheet__ makes it trivial to import/export your tasks, or interact with them in other imaginative ways:

+ Assign a project tag to any item and you can use a simple [spreadsheet query]({% link _tutorials/docket/spreadsheet_query.md %}) to track overall progress toward project completion.
+ Create a graph/sparkline to visualise your productivity over time, and how much work is coming up.
+ You can use our other apps, your own custom apps script, or any popular mailmerge tool, to trigger emails when tasks are marked as complete.
+ Write your own apps script to add items to your Docket automatically, just by adding a new row in your data sheet.