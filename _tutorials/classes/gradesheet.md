---
layout: tutorial
title: Explaining Gradesheets
permalink: /tutorials/classes/gradesheet
lead: How to generate, understand and best use a Classes Gradesheet
for: classes
---

#### Introduction
{:.pb-1}

A __gradesheet__ is a Google Sheets output of all the classwork submissions in your selected Google Classrooms. It is a similar concept to the 'Download Grades to Sheets' [functionality](https://support.google.com/edu/classroom/answer/6020294){:target="_blank" rel="noopener"} currently offered inside Google Classroom. However, our gradesheet offers loads of __extra features__ to make it a much more useful tool!

##### Features

- Output from __multiple classrooms__. If you are a teacher in a number of different classrooms, or an administrator looking to audit all graded work in your entire domain, you can output from any number of classrooms in to a single spreadsheet!
- Better __formatted__ output. The gradesheet produced has clear formatting, with proper headers and information about when classwork was created and due.
- __Contextual__ information. Not only are grades shown in the gradesheet (as you would expect!) but also whether a submission is late (and by how long) and whether it has been handed back or returned.
- Summary __metrics__ for each piece of classwork. details such as the average, number of submissions graded, standard deviation of graded results are shown at the top of each classwork column.
- __Sparkline__ overview. Each student row has a sparkline showing how they have performed (in graded terms) against the average for each piece of classwork.
- Cohort __analysis__. Conditional formatting is used to highlight pupils with high / low graded averages and submission totals.

#### Generating
{:.pb-1}

To generate a gradesheet, you first need to load all the classwork for your selected classes (Overview -> Classwork). Once this has been fetched, you can filter by the classwork you wish to include in your gradesheet (using column filters or by removing rows).

Once you are happy with your classwork list, load the user submissions (Classwork -> Submissions). Once these have been loaded the 'Gradesheet' menu and button will become active. You can use these to create a new gradesheet, which will be done automatically into your Google Drive.

#### Legend / Key
{:.pb-1}

Contextual information is conveyed in a number of different ways in the gradesheet:

##### Classwork

The following symbols appear in the classwork title row;

- ◔ = Classwork has been assigned to a subset of the whole class (e.g. individual pupils)
- ✓ = Classwork is a __Quiz__
- 🖹 = Classwork is an __Assignment__
- ✎ = Classwork is a __Text Question__
- ⚟ = Classwork is a __Multiple-Choice Question__

##### Submissions

- ★ = Classwork is not set up as being graded, so the submission doesn't need a grade.
- ☆ = Submission is awaiting a grade from the teacher.
- ⭘ = Submission is with the student and awaiting handing in.
- 🗅 = Submission has been handed in but has no work attached to it (and work is expected, e.g. it is not a quiz or question)

##### Colours

Cell colours are also used to help highlight the contextual states too. __Red__{.text-danger} cells indicate late submissions, __green__{.text-success} have been returned to students, __blue__{.text-primary} have been handed in and __yellow__{.text-warning} are assigned to students but haven't yet been done.