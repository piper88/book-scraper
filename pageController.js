//Controls the scraping process. Uses the browser instance to controller the pageScraper.js file, which is where all the scraping scripts actually execute.

const pageScraper = require('./pageScraper.js');
const fs = require('fs');

//we passed browserInstance to this file from index.js
async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    let books = await pageScraper.scraper(browser);
    fs.writeFile("books.json", JSON.stringify(books), 'utf8', function(err) {
      if (err) {
        console.error('Books did not save correctly');
      } else {
        console.log('Books saved successfully');
      }
    })
  } catch(err) {
    console.log(`Couldn't resolve browser instance => ${err}`);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
