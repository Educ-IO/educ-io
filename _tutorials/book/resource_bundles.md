---
layout: tutorial
title: Creating Resources Bundles
permalink: /tutorials/book/resource-bundles
lead: How to create or edit __custom bundles__ of __resources__.
for: book
---

#### Introduction
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-3}

A resource bundle is a custom package of similar resources, selected to do a __specific task__. Consider the case where an organisation has 10 cameras, 10 tripods and 10 microphones. In normal circumstances, most users would want to book one of each in order to go out and do some filming. As all the cameras are the same, they don't much worry about which camera they book - they just need the whole package!

To support this, you can create a bundle with __three elements__. The first element is the cameras, the second the tripods and the third the microphones. When the user opts to book the bundle, the app will allocate the first available option in each of these elements and create a booking for three pieces of equipment (a camera, a tripid and a microphone). The user does need need to check through and see which items are available - they just need to book the bundle!

#### Creating a Bundle
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

First you need to navigate to the __Bundle Management__ view (Manage -> Bundles). Here you can create, view and edit bundles. Click on the __green__{:.text-success} __add__ button to create a new bundle. Simply give the bundle a name (e.g. Video Recording) and add the number of parts / elements you need (in our earlier example, this would be three).

Each part requires you to tell the app how many are items are required in this element. In our example this would just be one for each part (__one__ camera, __one__ tripod and __one__ microphone are required). However, we might also want to add filming lights, and typically we need two of these - so we could specify two if we were to add another part.

#### Allocating Resources
{:.p-2 .border .rounded-sm .bg-highlight-light .mt-lg-4}

Once the basic bundle has been created, you can __allocate resources__ to each part. This is where you can specify which cameras are ideal for the camera part of this bundle, which tripods etc. A resource can appear in as many parts / bundles as you like. It will simply get booked by the first user who requests it. If no resources are available (or less than the minimum number specified) the bundle __cannot be booked__ for a particular time. Like individual resources and groups, the user will get a __visual indication of availability__ - allowing them to tweak the timings of their booking to ensure equipment is available!