---
layout: tutorial
title: Hyperlinking to an email in Gmail
permalink: /tutorials/docket/hyperlinking-gmail
lead: How to __hyperlink__ to an email from a __Docket__ task.
app: docket
---

#### Introduction
{:.pb-1}

Often, our tasks will be linked to or triggered by, an email. When creating a task in Docket it is incredibly useful to link to the source email. That way, when you come to tackle it, all the info you need is just one click away.

#### Markdown Links
{:.pt-2 .pb-1}

Markdown allows you to specify [hyperlinks](https://www.markdownguide.org/basic-syntax/#links), which will then be displayed as __blue clickable links__ in your Docket items. The easiest way to do this is to surround the text you want to link from (e.g. what will be displayed) with square brackets, like this: `[example link]`. Then, add the [URL](https://en.wikipedia.org/wiki/URL){:target="_blank" rel="noopener"} (which is the web page address) in normal brackets straight afterwards (without any space between them).

Your link should then look something like this: `[example link](https://www.google.com)`

Make sure that you include the protocol part of the address (the __http://__ or __https://__) at the start of the URL, to ensure it works correctly.

#### Linking to an Email
{:.pt-2 .pb-1}

Gmail has a unique URL for each conversation thread. To get this, navigate to the email you want to link and __copy the whole address__ from the browser address bar. It should look a little like this: `https://mail.google.com/mail/ca/u/0/#inbox/{LONG UNIQUE ID}`

Then, paste this into your docket item description, as part of your markdown URL. You will end up with an item like:

`Remember to read this [email](https://mail.google.com/mail/ca/u/0/#inbox/{LONG UNIQUE ID})`

When you __save the item__, your email will be now be linked to your task, making it __incredibly easy__ to get details about what the task refers to.