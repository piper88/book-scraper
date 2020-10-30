//performs the actual scraping

//page.$eval(selector, pageFunction) => choose element based on selector, passes that element to document.querySelector
//page.querySelector(selector) => runs document.querySelector on page, returns null if nothing found

const scraperObject = {
  url: 'http://books.toscrape.com',
  async scraper(browser) {
    let allUrls = [];

    async function scrapeCurrentPage() {
      let urls = await page.$$eval('section ol > li', links => {
        //Make sure the book to be scraped is in stock
        links = links.filter(link => link.querySelector('.instock.availability > i'))
        //Extract the links from the data
        links = links.map(el => el.querySelector('h3 > a').href)
        return links;
      });
      urls.map(url => {
        allUrls.push(url);
      })
      let nextUrl = await page.evaluate(() => {
        if (document.querySelector('.next > a')) {
           return document.querySelector('.next > a').href;
        } else {
          return false;
        }
      })

      if (nextUrl) {

        await page.goto(nextUrl);
          //When just kept going to second page for infinity: I was going to the second page, but 'page' was still the first page, so the first page just kept being scraped. Have to change page to the new page, then scrape that new page.
          //Old non-working code
          // let nextPage = await browser.newPage();
          // await nextPage.goto(nextUrl)

        await page.waitForSelector('.page_inner');
        //recursive call to scrape the next page
        await scrapeCurrentPage();
      } else {
        return;
      }
    }

    async function getAllCategories() {
      let categories = await page.$$eval('.side_categories > ul > li > ul > li > a', allCategories => {
        allCategories = allCategories.map(category => category.href)
        return allCategories;
      })
      return categories;
    }

    //LET THE SCRAPING COMMENCE
    //Open first page
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    //Wait for the required DOM to be rendered
    await page.waitForSelector('.page_inner');

    //Pick the category of books to scrape
    let listOfCategoryLinks = await getAllCategories();
    let category = listOfCategoryLinks[Math.floor(Math.random() * listOfCategoryLinks.length)];
    //Go to the page of the category that was chosen, and begin scraping
    await page.goto(category);
    await scrapeCurrentPage();

    //urls is now an array of links for the books that are in stock
    //Loop through each of those links, open a new page instance and get the relevant data
    let pagePromise = (link) => new Promise(async(resolve,reject) => {
      console.log('oy');
      let dataObj = {};
      let newPage = await browser.newPage();
      await newPage.goto(link);
      dataObj['bookTitle'] = await newPage.$eval('.product_main > h1', text => text.textContent);
      dataObj['bookPrice'] = await newPage.$eval('.price_color', text => text.textContent);
      dataObj['noAvailable'] = await newPage.$eval('.instock.availability', text => {
        // Strip new line and tab spaces
        text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
        // Get the number of stock available
        let regexp = /^.*\((.*)\).*$/i;
        let stockAvailable = regexp.exec(text)[1].split(' ')[0];
        return stockAvailable;
      });
      //no carrot inbetween product_gallery and img means img isn't a direct descendant of product_gallery, but just somewhere down the line
      dataObj['imageUrl'] = await newPage.$eval('#product_gallery img', img => img.src);
      dataObj['bookDescription'] = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent);
      dataObj['upc'] = await newPage.$eval('table.table-striped > tbody > tr > td', upc => upc.textContent);
      resolve(dataObj);
      await newPage.close();
    });

    //loop through urls, and call pagePromise on each link
    //This works, but the callback function (return pagePromise(link)) will have to go through the callback queue and event loop first, hence, multiple page instances will be open all at once. This will place a much larger strain on your memory than a for/in loop
    // let bookInfo = allUrls.map((link) => {
    //   return pagePromise(link)
    // })
    // //
    // Promise.all(bookInfo)
    // .then(allBooksInfo => {
    //   console.log(allBooksInfo);
    // })

    //Better, requires less memory
    let allBooks = []
    for (link in allUrls) {
      let bookInfo = await pagePromise(allUrls[link]);
      allBooks.push(bookInfo);
    }
    return allBooks;

  }
}

module.exports = scraperObject;
