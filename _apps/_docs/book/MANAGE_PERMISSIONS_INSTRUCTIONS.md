The permission management view allows a resource administrator to grant/remove __access__ to manage bookings for different resources.

##### What Permissions are Needed?

To manage bookings (e.g. confirm loans / returns) using this app, 'Write Access to Calendar Events' is required. This also allows for deleting / editing bookings via Google Calendar too.

##### Adding / Removing Permissions

{% include_relative _docs/shared/ICON_EXPLANATION.md icon="add_circle_outline" explanation="To add a new permission, toggle the resources you wish to add the permission for and click the add button at the top of the view." %}

{% include_relative _docs/shared/ICON_EXPLANATION.md icon="remove_circle_outline" explanation="To remove an exisitng permission, toggle the resources you wish to remove the permission on and click the remove button at the top of the view." %}

When __adding__ or __removing__ permissions, you must first toggle the resources you wish to permission. This can be done by __resource group__ (click on the group title), __individually__ (toggle the required resources) or for __all resources__ (use the 'Toggle All' button).

Once you have done this, when adding / removing permissions you need to specify the type of [permission](https://support.google.com/a/answer/60765){:target="_blank" rel="noopener"} you wish to grant / remove. You can also do this within the Google Calendar web app as well, but using this app gives you the ability to make bulk changes must more quickly.

You must also __specify a value__ if you have chosen user, group or domain access. This should be the email address of the user / group, or the full G-Suite domain (e.g. the part after the '@' sign).

The best way to manage permissions is to create a group for booking management, and assign permissions to it. This way, it is easy to add/remove permissions afterwards.

Finally, you can opt to notify users of these permissions, but this should be used judiciously to avoid overloading users with these emails!