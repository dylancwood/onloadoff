onLoadOff (like a dance-off, but for websites)
=======

Try out the <a href="http://noveld.com/onloadoff">demo</a>.

When testing how code changes affect total loading times, it can be difficult to compare to a previous benchmark that might have been set with a different client OS, hardware, browser, location or connection speed. onLoadOff provides a clean interface that allows you to test the current load time (time from window.onunload event to window.onload event) of your beta site/page directly against the current load time of your production site/page. It also provides some basic statistics and plots that may be useful when showing off how much faster your new code loads.

This is written in pure Javascript, and does not rely on any server-side code. Consequently, you can use this to test sites located on your local network or filesystem. This also makes it a great candidate for becoming a browser extension.

onLoadOff uses the excellent nvd3 library to generate some simple plots.

See the issues tab for possible future features and enhancements.
