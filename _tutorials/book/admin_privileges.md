---
layout: tutorial
title: G-Suite Privileges for Resources
permalink: /tutorials/book/admin-privileges
lead: Which G-Suite Administrative Permissions are required to create or edit __resources__.
for: book
---

#### Privileges
{:.pb-1}

In G-Suite, users can have administrative privileges. These can be found in the [Google Admin console](https://support.google.com/a/answer/172176){:target="_blank" rel="noopener"}. Any __Super Admin__ or __Services Admin__ has the ability to create or edit Google Calendar Resources.

However, it is rarely a good idea to grant more privileges than are necessary, as this can often lead to users making inadvertent or accidental changes. Therefore, it is sensible to create your own admin user 'type'. This can be called something like __Resources Admin__ and needs to have the __Calendar__ -> __All Settings__ -> __Buildings and Resources__ privilege assigned to it. This will alow users who are part of this role to create, delete and manage resources.

If you would prefer to grant __particular users__ access to manage the bookings for a __subset of resources__, this can be done from Google Calendar itself. Add the relevant __Resource Calendar__ to your calendar list, and then go to __Settings__ -> __Share with specific people__. You need to grant at least the __Make Changes to Events__ privilege to the users you would like to manage bookings.

#### Permissions
{:.pb-1}
To manage bookings (e.g mark them as loaned and returned), __edit__ permissions on the relevant resource calendars are required. These can be granted in bulk using our app, simple click __Manage__ --> __Permissions__. Alternatively, then can be set manually within Google Calendar. In both cases, a G-Suite Super-Admin is required (initially) to set these permissions.

#### Notifications
{:.pb-1}

If you have added one or more __Resource Calendars__ to you own Google Calendar, you can also opt to receive __Event Notifications__ for bookings (when they have been added or created) or a daily summary of all upcoming daily bookings by email. This is very useful is you want to know what bookings are coming up during the day ahead. You can find more details about this from the Google documentation [here](https://support.google.com/a/answer/1041497){:target="_blank" rel="noopener"} and [here](https://support.google.com/calendar/answer/37242){:target="_blank" rel="noopener"}.