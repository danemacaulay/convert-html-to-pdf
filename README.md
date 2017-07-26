# Convert HTML to PDF Example

This will convert the included `index.html` into a pdf called `page.pdf`. The included index.html will read in the browsers cookie and write it to the page in order to demonstrate chrome's ability to set cookies.

The pdf will only be created when the global variable `pageFullyLoaded` is set to true.

# Run

```
npm install
npm start
```

# Resources

- https://developers.google.com/web/updates/2017/04/headless-chrome
- https://chromedevtools.github.io/devtools-protocol/
- https://github.com/cyrus-and/chrome-remote-interface
- https://github.com/GoogleChrome/lighthouse/tree/master/chrome-launcher

