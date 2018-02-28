---
layout: tutorial
title: Publishing PDFs with Folders
permalink: /tutorials/folders/publish-pdfs
lead: Publishing __Google Docs to PDFs__ for a website
app: folders
---

#### Introduction

Using Google Drive to publish documents that need to be periodically updated, such as schedules, policies or timetables is an easy process. You can either publish the Google Doc / Sheet [directly](https://support.google.com/docs/answer/2494822){:target="_blank" rel="noopener"}, or export the document as a PDF and publish that.

The drawbacks of this method are obvious when you have a large number of documents to publish, or you need to publish updates to a document on a regular basis. This is a typical use case for policies, where there is a __live__ working copy, and then a __public__ version, which is essentially a snapshot of the working document, taken _quarterly_ or _yearly_. To do this using Drive, you need to download the exported copy of the PDF and then re-upload it as a [new version](https://support.google.com/drive/answer/2409045){:target="_blank" rel="noopener"} of your published document. This is incredibly time-consuming, and error prone!

#### Our Solution

With __Folders__, you can help streamline this process and save yourself a __lot__ of time.

##### Step 1

Open the folder containing the original (Google Doc / Sheet / Slide) documents that you would like to publish. This can be done from directly inside the __Folders App__ or from Google Drive if you have installed the app to your drive by clicking __About__ -> __Install__. Once installed, you can right-click on any folder and '_Open With_' __Folders__.Open

##### Step 2
Once your folder is open in the __Folders__ app, you are ready to __convert all the files__ it contains to PDFs. Any existing PDFs or files that are not native Google files will be ignored. If you would like to reduce the set of documents which are converted, you can do so by using:

- The __Folders__ -> __Search__ tool
- By removing individual files by clicking on the small cross at the end of each row
- __COMING SOON__ : By filtering particular columns. Click on the column headings and start typing to filter the files. __COMING SOON__{:.badge badge-info}

##### Step 3

Click on __Results__ -> __Convert__ to bring up the _Convert Files_ dialog. Here, you can customise how the conversion should proceed. To save you time, you can simply click the __Google Formats -> PDF__ button to set the correct options for this task.

If you are publishing from a folder (see the section below), then you can select the folder you are publishing in the __Mirror To__ section of the form, using the __Browse__ button to select the folder from your Google Drive. If you wish to clear this field, click the __Clear / Reset__ button.

##### Step 4

If you are likely to be publishing documents from this folder, using these settings, on a regular basis, then you can __Save__ these settings to your Google Drive. They will then appear as a file in this folder, which you can open in the __Folders__ app (directly from Google Drive) to save you time in the future. The correct folder will be opened, and your chosen settings will be pre-populated in the conversion dialog box when you click on __Results__ -> __Convert__.

##### Step 5

Click on the __Convert__ action button to start the conversion. If you have selected the __Convert In Place__ option (default if you used the __Google Formats -> PDF__ button) then any existing PDFs that are named the same as the source files __will updated with new versions__. If these PDFs are already published or shared, then the new version will be available straightaway. You will see each document being individually processed, and a tick will appear next to each one as it is successfully converted.

##### Step 6

If you are publishing, or sharing, individual PDF files and have not done so previously, you can now share these newly created files through the normal Google Drive sharing procedure. When you next run the convert, these same files __will be updated__ from your source documents, meaning your published files will then have the __same content__ as your working files.

#### Publishing Folders

It can be _tiresome_ publishing individual files, especially if you are continually adding new documents. You may wish to publish a whole folder, rather than individual documents. However, you shouldn't publish your original folder as this will also publish the working copies (which is exactly what we are trying not to do!). In this case, you can create a new folder in your Google Drive and publish it as normal (it can be empty at this point). When you go through the conversion process above, on __[Step 3](#step-3)__ you can select this folder as the __Mirror To__ folder before your documents are converted. After they have been converted, they are then added to this published folder as well as your working folder. This takes advantage of the ability for a file to be in more than one folder simultaneously in Google Drive. These newly converted PDFs will inherit the sharing policies of your published folder and therefore be available to your intended audience. Every time a new document is created and converted in that folder, provided the __Mirror To__ folder is set (you can save your settings in __[Step 4](#step-4)__), it will be publishing too!