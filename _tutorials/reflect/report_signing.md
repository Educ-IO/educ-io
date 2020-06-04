---
layout: tutorial
title: Signing a Report in Reflect
permalink: /tutorials/reflect/report-signing
lead: How to __review__ and __sign__ a __Reflect__ report.
for: reflect
---

#### Introduction
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-3}

A typical workflow in organisations is the need for a report to be reviewed and signed off if it is agreed. This is what __Reflect__ helps you to do.

#### Signing
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

You can open a report directly (using the __Open__ command on the __Report__ menu within the app), from Google Drive (if you have installed the app using the __Install__ command on the __About__ menu) or from a button/link in an email.

If you have been granted the __comment__ permission on the report, a Sign button will be visible at the bottom of the report. You will also be able to see any other signatures that have already been appended to the report. To add your own signature, just click the __Sign__ button. If you have opened the report directly from an email, you may be prompted to authorise the app to have access to your Google Drive files (which is needed to add a comment to the report). Opening the report directly from Google Drive will remove the need for any extra permissions.

#### Security
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

Your digital signature is a __cryptographic signature__, which is a secure method to sign the data that is in the report when you reviewed it. If the report is subsequently changed, your signature will no longer be shown within the app as __valid__. In this case, you might be asked by the report owner/author to review and sign it again (e.g. if they have added further evidence or corrected a mistake).

#### Troubleshooting
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

If the sign button is not visible, and you have comment access to the report, your browser may not support the secure cryptography features required. You can check whether it does by visiting our [test](/test/){:target="_blank"} page and checking whether all __Cryptography__ tests pass.