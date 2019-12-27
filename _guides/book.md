---
layout: guide
title: A Guide to Book
permalink: /guides/book/
short_title: A Guide
support: true
for: book
---

#### Introduction
{:.p-2 .border .rounded-sm .bg-light}

Book is an app which extends the __resource booking__ functionality found in G-Suite. The app makes is much easier to use G-Suite as a resource booking system, fully integrated with Google Calendar.Book

Resource booking is a feature only supported by [G-Suite domains](https://gsuite.google.com/compare-editions/?feature=calendar){:target="_blank" rel="noopener"}, including education and not-for-profit domains. Unfortunately regular Gmail accounts cannot host bookable resources.

##### Is it compatible with Google Calendar?

__Absolutely__ and __completely__ compatible. This app adds an enhanced interface onto the Google calendar booking system. Bookings made through the app are the same as events created in Google Calendar, just as any booked events make in Google Calendar __will appear in this app too__.

This means you can make bookings in whatever way you wish, however, there are many advantages to using this app:

+ Resources are __easier to find__ in this app, and they can be grouped together - which is incredibly useful when you have lots of the __same type__ of resource (e.g. a class set of Chromebooks).
+ Bookings are __easier to schedule__, an overview of availability is shown for each day and groups of resources can be booked together (e.g. 10 Chromebooks).
+ Resources are __easier to manage__ for administrators, with logging of __serial / asset numbers__ in a Google sheet when bookings are collected - giving an audit log of where equipment has been, and with whom.
+ Users can present QR codes directly from the app, allowing bookings to be __quickly__ and __easily__ processed.

- - -

#### Setup
{:.p-2 .border .rounded-sm .bg-light}

Before your users can start to book resources, you will need to create some first! You can do this from within [the app](#instructions.manage.resources), or using the [Google Admin](https://admin.google.com/){:target="_blank" rel="noopener"} console. You will need to have the appropriate privileges to create and manage resources in your G-Suite domain. You can find more details about the privileges required in this [tutorial]({% link _tutorials/book/admin_privileges.md %})

The best way to organise similar resources is into [groups]({% link _tutorials/book/resource_groups.md %}). A resource can exist on it's own, or in any number of groups. When a resource has a parent (e.g. it is a member of a group), it will be displayed under that group title. An __orphaned__ resource will be displayed on it's own (e.g. at the top level).

Grouped resources can be booked together (e.g. I would like to book 10 Chromebooks). In order for this to make sense for your users, it is best to group together resources that are the same or (functionally) very similar.

#### Shortcut Codes
{:.p-2 .border .rounded-sm .bg-light}

In most organisations, after resources have been booked they must be __collected__. Often there will be someone responsible for looking after these resources, and ensuring they are only given out to users who have made an appropriate booking. This can be a time-consuming process, but shortcut QR codes should make it __easier__!

The user who has made the booking can access their shortcut QR code by clicking on this button <i class="small material-icons md-1 text-light bg-success p-1 border rounded">touch_app</i> from either their __create__ or __view__ booking pages. The __QR code__ contains an embedded URL (web page address) that can be read by a __2D__ (another term used to describe a QR Code) barcode scanner. Most scanners based on image recognition will be able to read barcodes from a phone screen (transmissive, rather than reflective, light). The URL can be scanned directly into the address bar of a browser, or into the __shortcut__ text box on the booking management view.

Due to the way most barcode scanners deliver non-standard characters (such as #) to the browser, please make sure the language setting on your barcode scanner matches the keyboard input language on your computer!

#### Logging Equipment Loans and Returns
{:.p-2 .border .rounded-sm .bg-light}

Recording loans is easy, simply click on the <i class="small material-icons md-1 text-light bg-action p-1 border rounded">directions_run</i> Loan button in the management view for the appropriate loan (loans are visible by day, for the resources which you have toggled 'on'). This will record the booking as <span class="badge badge-danger ml-1 mr-1">LOANED</span>. You can then record it as <span class="badge badge-success ml-1 mr-1">RETURNED</span> when the resource has been delivered back. If you have made a loan in error, or are just testing the app out, you can delete the <span class="badge badge-danger ml-1 mr-1">LOANED</span> status by clicking on the small cross next to it.

If you would like to go further, you can also record the __serial number__ (of any identifier) of resource being loaned. This is important where __accountability__ for __expensive equipment__ needs to be maintained. Clicking on the Loan button dropdown, then 'Log Loan' will then prompt you to enter the serial number/s of the equipment being booked. If this is the first time you have done this, the app will prompt you to select an existing Google sheet (if there is one). Cancelling out of this dialog will result in the app creating a __new Google Sheets database__ to record the loans in.

Each equipment loan will be recorded as a __single row__ in the sheet, with the details of what was loaned, when it was loaned and to whom (a booking for three pieces of equipment will therefore be recorded as three rows). When the equipment is logged as being returned (__Log Return__ under the return button options), the relevant data is also recorded in that row (date/time of return). This makes it easy to use filtering to view the loan history of any item (in case of loss or damage) and also to view __all the outstanding loans__ (e.g. equipment that has been loaned out but not returned).

After logging equipment in, or out, you can use the __Tools__ - __Open Data__ menu command to go directly the sheets database, which will have been created in your Google Drive.