//Controls the scraping process. Uses the browser instance to controller the pageScraper.js file, which is where all the scraping scripts actually execute.

const pageScraper = require('./pageScraper.js');

//we passed browserInstance to this file from index.js
async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    await pageScraper.scraper(browser);
  } catch(err) {
    console.log(`Couldn't resolve browser instance => ${err}`);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
