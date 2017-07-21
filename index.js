"use strict";

const CDP = require('chrome-remote-interface');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

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
  const server = serveIndex();
  const chrome = await launchChrome();
  const protocol = await CDP({port: chrome.port});

  const {Page, Network, Runtime} = protocol;
  await Page.enable();
  await Network.enable();
  await Runtime.enable();

  await Network.setCookie({url: 'http://localhost:3000/', name: 'cookie-name', value: 'cookie-value'});
  await Page.navigate({url: 'http://localhost:3000/'});

  let intervalId = setInterval(async function() {
    let evaluateResponse = await Runtime.evaluate({expression: 'window.pageFullyLoaded'});
    let isLoaded = evaluateResponse.result.value;
    if (isLoaded) {
      clearInterval(intervalId);
      let base64PDF = await Page.printToPDF();
      fs.writeFileSync('./page.pdf', Buffer.from(base64PDF.data, 'base64'));
      console.log('pdf saved as "page.pdf"');
      protocol.close();
      chrome.kill();
      server.close();
    }
  }, 1000);

})();
