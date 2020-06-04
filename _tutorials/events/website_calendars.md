---
layout: tutorial
title: Displaying Events on the Web
permalink: /tutorials/event/website-calendars
lead: Use __javascript code__ to display __google calendar events__ on your website
for: events
---

#### Introduction
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-3}

This is more of a __technical tutorial__ than normal! It is intended to lay the groundwork for people looking to __code__ their own websites and wanting to include their Google Calendar events. The approach taken here is a client-side one, where javascript code is included in a website, and client browsers request and display calendar events themselves.

#### Preparing the Events
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

We want to filter our events for display, so that we only show a subset of them. For this example we are going to use the highlight tag to indicate which events we want to display.

#### Accessing Google Calendar
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

To retrieve events, we are going to use the [Google Calendar API](https://developers.google.com/calendar/){:target="_blank" rel="noopener"}, authorising our requests using an API key. To do this, you will need to generate your own API key. You can find instructions all over the web to help do this, but for the impatient, here is a particularly [helpful set](https://docs.simplecalendar.io/google-api-key/){:target="_blank" rel="noopener"}. Following these instructions (except for the final, WordPress-specific step) you will end up with an API key that we can use in the code below.

Using a generic API key means the calendar you want to access must be [publicaly available](https://support.google.com/calendar/answer/37083?hl=en){:target="_blank" rel="noopener"} and you will need the calendar ID from the settings page.

When you have your API key and calendar ID, insert them into the code below. You will need to include the [Moment](https://momentjs.com/docs/#/use-it/browser/){:target="_blank" rel="noopener"} or [Day.js](https://github.com/iamkun/dayjs){:target="_blank" rel="noopener"}  library, to provide simple date handling. You should also include a [fetch](https://github.com/github/fetch){:target="_blank" rel="noopener"} polyfill for older browsers, which adds in that functionality where it isn't available.

{% highlight javascript %}
var _loadDiary = function() {

  var API_KEY = "<< INSERT API KEY HERE>>";
  var CALENDAR_ID = "<< INSERT CALENDAR ID HERE >>";
  
  var BASE = "https://content.googleapis.com/calendar/v3/calendars/";
  
  var START = (window.moment || window.dayjs)().subtract(2, "days").startOf("day").toDate().toISOString();
  var LIMIT = "5";
  var FILTER = "Highlight=TRUE";

  var URL = BASE + encodeURIComponent(CALENDAR_ID) + "/events?maxResults=" + LIMIT + 
    "&orderBy=startTime&sharedExtendedProperty=" + encodeURIComponent(FILTER) + 
    "&showDeleted=false&singleEvents=true&timeMin=" + encodeURIComponent(START) + 
    "&key=" + API_KEY;

  fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
  }).then(function(response) {
    if (response.ok && response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }).then(function(data) {

    if (data.items && data.items.length > 0) {
      for (var i = 0; i < data.items.length; i++) {
        var _item = data.items[i];
                console.log("Event to Display on Page:", item);
      }
    }
    return true;
  }).then(function() {
    console.log("Diary Loaded");
  });
};

$(document).ready(_loadDiary);
{% endhighlight %}

#### How it works
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

We use a fetch call to the Google API, combining our API key and Calendar ID to ensure we get the correct data! We use a simple filter to retrieve a maximum of 5 events, that are more recent than two days before today. Finally, we only ask for events that have the highlight tag set.

You can add your own code to the loop through the events, to format and display them on your own page!