"use strict";

const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

// launch chrome with `chrome-launcher`
function launchChrome(headless=true) {
  return chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
    chromeFlags: [
      '--window-size=412,732',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  });
}

// create a web server and serve index.html
function serveIndex() {
  const http = require('http');
  const fs = require('fs');
  const port = 3000;
  const app = http.createServer((req,res) => {
      res.writeHead(200);
      res.end(fs.readFileSync('./index.html'));
  });
  app.listen(port);
  return app;
}

(async function() {
  // serve `index.html`
  const server = serveIndex();
  // launch chrome
  const chrome = await launchChrome();
  // create remote debugging connection
  const protocol = await CDP({port: chrome.port});

  // initialize the needed protocol domains
  const {Page, Network, Runtime} = protocol;
  await Page.enable();
  await Network.enable();
  await Runtime.enable();

  // set a cookie
  await Network.setCookie({url: 'http://localhost:3000/', name: 'cookie-name', value: 'cookie-value'});
  // navigate to the page
  await Page.navigate({url: 'http://localhost:3000/'});

  // poll the page and when `window.pageFullyLoaded === true` save the pdf
  let intervalId = setInterval(async function() {
    let evaluateResponse = await Runtime.evaluate({expression: 'window.pageFullyLoaded'});
    let isLoaded = evaluateResponse.result.value;
    if (isLoaded) {
      // stop the poll
      clearInterval(intervalId);
      // print the pdf
      let base64PDF = await Page.printToPDF();
      // write the file
      fs.writeFileSync('./page.pdf', Buffer.from(base64PDF.data, 'base64'));
      console.log('pdf saved as "page.pdf"');
      // close the connection to chrome
      protocol.close();
      // close down chrome
      chrome.kill();
      // close the web server
      server.close();
    }
  }, 1000);

})();
