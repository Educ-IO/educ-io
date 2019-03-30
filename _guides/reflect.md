---
layout: guide
title: A Guide to Reflect
permalink: /guides/reflect/
short_title: A Guide
support: true
for: reflect
lead: How to use our `Reflect` app to create __reports__ and __forms__, with __digital signatures__ and helpful analysis!
---

#### Introduction
{:.p-2 .border .rounded-sm .bg-light}

Reflect is an app which allows __reports__ to be created, based on pre-defined or custom __forms__.

Reports are __owned__ by the user who creates them, and they can choose to __share__ them with whomever they wish. They are kept in Google Drive for ease of use and secure storage, meaning minimal or no training for users.

Routing decisions (who should the report be shared with) can be pre-populated in forms to help organisations run efficient processes. Users can review the reports precisely as the creating user intended and sign them in a cryptographically secure way.

Analysis of the reports can be conducted, with highlight data (such as final grades or target counts) can be quickly viewed for large cohorts and exported to a variety of formats (including Google Sheets).

##### Why not just use forms?

[Google Forms](https://www.google.co.uk/forms/about/){:target="_blank" rel="noopener"} are excellent for collecting simple data in bulk. They are brilliant for conducting surveys or getting feedback on events or classes.

Reflect offers a more sophisticated approach with some key benefits that make it much more suitable for review and assessment;

+ Reflect Forms offer a higher level of customisation and interactivity; with __calculations__, __evidence__, __targets__ and __scale__ fields as standard
+ Reflect Reports remain __owned by the user__ who created them, offering better protection and portability for sensitive professional assessment data
+ Reflect Reports can be shared with other users for __reviewing__ and __signing__, attaching an audit and management trail to the report which can always be easily verified
+ __Analysis__ of reports can be done quickly and easily for groups of users, allowing administrators to __efficiently manage__ periodic (weekly, monthly, quarterly, yearly etc.) collection of information

- - -

#### Forms
{:.p-2 .border .rounded-sm .bg-light}

Forms are the basis of everything that goes on in the app! They are the set of questions that are answered by users to create a report (a template). Reflect has a number of  [built-in]({% link _tutorials/reflect/standard_forms.md %}) forms, but you can also create [your own]({% link _tutorials/reflect/custom_forms.md %}).

Custom forms are __stored in Google Drive__, just like reports, and can be shared with users who can then fill them in to create reports. Forms can be shared like any other Google Drive file, or customised links can also be shared with users or put onto your website to make it even easier!

- - -

#### Reports
{:.p-2 .border .rounded-sm .bg-light}

Reports are saved when a user fills in a form. Every form can be filled in as __many times as desired__, so that users can create and share weekly (or any other period!) reports on their progress and achievements. A copy of the form is saved within the report, meaning that if the report is shared with a user who does not have access to the original form, they can still see the exact questions and layout of the form.

A user (the author) can save their report at any point, meaning they can author it over time, without needing to fill in all the required forms straight away. Once they are ready, the user can share the report with any other Google / G-Suite user. This is done via a regular Google Drive share, or a custom email (which contained [instructions]({% link _tutorials/reflect/report_signing.md %}) about how to sign the report).

##### Signing

A user who receives a shared report for review and signature would typically be a mentor or tutor, but may also be the subject of an assessment or observation, if their agreement were needed in the process.

The signatory would then view the report (by clicking on the email link or loading it from the web-app) in a __readonly__ mode. The report looks exactly the same as when the user created it, but the signatory can only view, rather than change, the data. Any Google Drive files attached to the report (such as evidence of achievement) will also be __automatically shared with the signatory__ (with viewing permissions), meaning they are able to review the __whole report__ and __associated data__.

If they then agree with the report, then can __sign__ the report using a __secure [cryptographic](https://en.wikipedia.org/wiki/Public-key_cryptography){:target="_blank" rel="noopener"} process__. This signature is attached to the report as a __comment__, and is __only valid__ if the report __remains unchanged__. Any user who can view the report can also __verify the validity__ of the signature, but only the original signatory can revoke their signature or re-sign a changed report.

- - -

#### Analysis
{:.p-2 .border .rounded-sm .bg-light}

The final step of the process is the __completion of the report__. The report author can mark the report as completed once it is __valid__. This means that all required fields have been filled in with acceptable data. The completed report is shared with whoever is needed (typically an administrator), and this person (or people) can be set as a __default__ in a custom report.

A completed report is __not editable__ within the Reflect app (even by the original author), although the author can choose to revoke their completion, which will then enable editing again. This is to prevent accidental changes after completion.

Reports can be analysed by all users who have access to them. This can include:

+ __Authors__: They can view a summary of all the reports they have created for certain forms
+ __Signatories__: They could easily see a summary for their mentor or tutor group
+ __Administrators__ / __Managers__: Can view a whole cohort, checking progress and verifying that reports have been completed

All analysis can be filtered by __date range__ (just show reports between specific dates), as well as excluding / including reports owned by the logged in user.

##### Exporting

Analysis data can be exported into a number of different formats, for further analysis or archiving. These formats include;

+ Google Sheets
+ Microsoft Excel
+ Comma-Separated Values (CSV)
+ Markdown