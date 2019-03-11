### Privacy
{:.anchor mb-2}

As well as an unswerving commitment to __transparency__, we are determined to protect the __privacy__, __security__ and __confidentiality__ of your data.
{:.alert .alert-primary}

We therefore __do not__ store, process or analyse any of your __Google user data__. Your data stays in your Google account and on your device only, our servers and people never see it, and we never touch it. This data is __yours__, and that is the way it should always be!
{:.alert .alert-dark}

When you use any of our apps in conjunction with your __Google account__, the app may request __scoped__ access to part of your Google data, so that you can interact with that data (but just within __your__ browser, it doesn't go anywhere else!). This request generates a __token__ (think of it like a temporary password) that is only valid for accessing the data that you granted access to. This token is saved on your device until you log out of Google services or our apps, and it is periodically refreshed. This means, if you remove the [granted permission](https://security.google.com/settings/security/permissions){:target="_blank" rel="noopener"}, the next refresh will fail and the token will __no longer be valid__ (even if you have not signed out).

To most users, these scopes can sometimes appear __quite complex__, so we have a [__complete__ list of all the scopes](/scopes) that may be requested when using each of our apps. Each of these scopes is accompanied by an __explanation of why__ it may be requested, and __what functionality__ requires it. Any scopes that are not essential for the app (e.g. they may simply give some extra useful functionality) are marked as __optional__ in this list.

#### Data Protection, US COPPA and the EU GDPR
{:.mt-2}

All the web-apps run from this site are '__client side__' apps, meaning that __none__ of your data is transmitted back to _our systems_. Apps and their instructions are served up over HTTPS (industry standard encryption, please [download](/docs/educ-io-ssl.pdf) or test our [SSL Security Score](https://www.htbridge.com/ssl/){:target="_blank" rel="noopener"}). *Your data*, however, is loaded (and saved) directly from Google, again using HTTPS. Your data stays between you and Google, ensuring it remains secure and governed by your existing data protection agreements. We __never see it__, never could see it, and never would want to see it. We just provide the code, and our tools can even [help you]({% link _articles/2018-03-26-GDPR.md %}) with __securing__ your own data!

#### Analytics
{:.mt-2}

The only data that we receive from this site is __usage__ information. This data is handled by via [Googe Analytics](https://en.wikipedia.org/wiki/Google_Analytics){:target="_blank" rel="noopener"}, which is a widely-used third party service that collects standard internet log information, and behaviour patterns. The reason we do this is to measure the usage of these apps (e.g. what is frequently used), and also __how__ they are being used (e.g. which buttons or menu-items are clicked most often). This data helps to shape development decisions (e.g. updating and streamlining layout and processes). None of this data is linked to your account, name or email address in any way. Personally identifiable information is banned from the [analytics platform](https://support.google.com/analytics/answer/6004245){:target="_blank" rel="noopener"} and we would never seek to try to track any individual users. All data is held in a highly secure state by google, and only accessible by us using industry-standard 2-factor authentication.

While this data is important, and __useful to us__, your preferences are __even more so__. If you would prefer to block these sorts of analytics tools while you are browsing the web, you can enable [do not track](http://donottrack.us/){:target="_blank" rel="noopener"} in your browser. This setting will be [read by us](https://github.com/Educ-IO/educ-io.github.io/blob/master/_includes/analytics.html){:target="_blank" rel="noopener"} and __we will not attempt__ to load the analytics code if it is set. Compliance with this setting is dependent on the website/tool and is not universally honoured across the web. Alternatively, to __forcefully block__ these analytics scripts from loading, you can install a privacy enhancing tool, such as the excellent [Ghostery](https://www.ghostery.com/){:target="_blank" rel="noopener"} chrome extension.

#### Browser Storage
{:.mt-2}

To provide functionality to you, we need to store a small amount of information in your browser. This stored information takes three forms:

##### Cookies
{:.mt-1}

Cookies are small pieces of text stored, sent and received by your browser from a website that you are visiting. __Google Analytics__ uses these cookies (first-party cookies, so they are not shared across sites) to store 'non-personally identifiable information'. These cookies are prefixed with '_ga' or '_gid'. Our apps also load [third-party scripts](/credits/) from a global content delivery network (CDN) for speed and reliability. These CDNs may also use first-party cookies to help deliver their services (e.g. [Cloudflare](https://www.cloudflare.com/cookie-policy/){:target="_blank" rel="noopener"}).

##### Cache Storage
{:.mt-1}

In order to deliver the best possible service, even in __challenging connectivity__ situations (poor wifi stability for example), we make use of [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/){:target="_blank" rel="noopener"} technology on [compatible platforms](http://caniuse.com/#feat=serviceworkers){:target="_blank" rel="noopener"}. This technology means we can proactively cache various parts of the site and code in your browser, allowing it to be __fetched__, even when moving between different pages, without having to communicate over the Internet. These pages are stored securely in the browser cache, and are periodically updated when updates are released.

##### Local Storage
{:.mt-1}

Finally, we use browser storage functions (such as [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB){:target="_blank" rel="noopener"} and [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage){:target="_blank" rel="noopener"}) to store:
- __Access Tokens__: These are the cryptographic tokens which grant access to API Services. They are stored __only in your browser__, work only on our site, and are invalidated/cleared when you sign out of the services (e.g. out of one of our apps or the Google platform as a while).
- __Recent Items__: To save you clicks, and time, we store the most recent commands that you have used on our site (e.g. open a particular file with one of our tools). These recent items become a 'shortcut' list for you on each app. They are also __only stored__ in your browser, can be __removed individually__ and are __cleared__ when you sign out of the app.