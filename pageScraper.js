//performs the actual scraping

// You will add a new function called scrapeCurrentPage() to your scraper() method. This function will contain all the code that scrapes data from a particular page and then click the next button if it exists. Add the following highlighted code:


('li.next > a')
const scraperObject = {
  url: 'http://books.toscrape.com',
  async scraper(browser) {

    //add scrapCurrentPage() method that collects all the urls from each page. If there's a next button, call scrapeCurrentPage() again


    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    //Wait for the required DOM to be rendered
    await page.waitForSelector('.page_inner');

    //Get the link to all the required books
    //page.$$eval returns an array of all matching elements
    let urls = await page.$$eval('section ol > li', links => {
      //Make sure the book to be scraped is in stock
      links = links.filter(link => link.querySelector('.instock.availability > i'))
      //Extract the links from the data
      links = links.map(el => el.querySelector('h3 > a').href)
      return links;
    });
    // console.log(urls);


    //urls is now an array of links for the books that are in stock
    //Loop through each of those links, open a new page instance and get the relevant data
    let pagePromise = (link) => new Promise(async(resolve,reject) => {
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
    // let bookInfo = urls.map((link) => {
    //   return pagePromise(link)
    // })
    //
    // Promise.all(bookInfo)
    // .then(allBooksInfo => {
    //   console.log(allBooksInfo);
    // })

    //Better, requires less memory
    for (link in urls) {
      let bookInfo = await pagePromise(urls[link]);
      console.log(bookInfo);
    }

  }
}

module.exports = scraperObject;
