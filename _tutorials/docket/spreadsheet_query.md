---
layout: tutorial
title: Analysing your Tasks
permalink: /tutorials/docket/spreadsheet-query
lead: __Querying__ and __analysing__ your `Docket` data inside Google Sheets.
app: docket
---

#### Introduction
{:.pb-1}

Google sheets include an incredibly powerful [query language](https://developers.google.com/chart/interactive/docs/querylanguage){:target="_blank" rel="noopener"} that can be used to generate aggregate statistics. As Docket stores all your data in __your own__ sheet, in __your__ Google Drive, we can use these queries to help summarise information about your productivity and tasks.

#### Query Formulas
{:.pt-2 .pb-1}

There are plenty of [excellent tutorials](https://lifestack.io/snippets/#spreadsheet-functions){:target="_blank" rel="noopener"} available on the web to help you design the perfect query formula in your sheet. To help get you started, here are a couple you might like to try.

The best way to test out your formulas is to __create an extra tab__ in your Docket data sheet. That way you can query your task data without interfering with the operation of the Docket app.

In this new tab, enter the following formula:

`QUERY(Tasks!A3:G, "select F, D, count(G) group by F, D order by F, D label count(G) ''", 0)`
{:.formula .pl-1 .pr-3 .py-2}

This will generate a table of all your tags, followed by statuses (normally an empty for incomplete and 'COMPLETE' for items which you have marked as complete).

If you use multiple tags per item, and one of those tags might be a __project code__, you can use the formula below to generate statistics for an individual project (put the project code in cell A1 as it is referenced in the formula).

`QUERY(Tasks!A2:G, "select count(D), count(G), count(D)/count(G) where F contains '"&A1&"' label count(D) '', count(G) '', count(D)/count(G) ''", 0)`
{:.formula .pl-1 .pr-3 .py-2}

The formula will output the number of __completed items__, the __total number of items__ and the __percentage__ of items that have been completed (remember to set the data type of this cell to percentage, in the __Format__ -> __Number__ menu) for any items which include the project code in their tags.

Finally, if you would like to break down your completed tasks by the __month__ in which they were completed, you can use a formula such as this:

`QUERY(Tasks!A3:G, "select year(E), month(E), count(G) WHERE D = 'COMPLETE' group by E label year(E) 'Year', month(E) 'Month', count(G) 'Completed Items'", 0)`
{:.formula .pl-1 .pr-3 .py-2}

You can see, from these simple examples, that you can do a __lot of analysis__ with spreadsheet formulas. As the data is yours, and the sheet is yours, there is little limit to the sort of solutions you can build, and __insights you can gain__!