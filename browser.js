const puppeteer = require('puppeteer');

async function startBrowser() {
  let browser;
  try {
    console.log('Opening the browser......');
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
      //lets you visit websites not hosted over secure HTTPS protocol and ignores any https-related errors
      'ignoreHTTPSErrors': true
    });
  } catch(err) {
    console.log(`Couldn't create a browser instance => : ${err}`);
  }
  return browser;
}

module.exports = {
  startBrowser
}
