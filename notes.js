
//Option #1
const $anchor = await page.$('a.buy-now');
const link = await $anchor.getProperty('href');
await $anchor.click();

//Option #2
await page.evaluate(() => {
    const $anchor = document.querySelector('a.buy-now');
    const text = $anchor.href;
    $anchor.click();
});

//Both basically have the same effect, but they go about it in a different way.

//Option #1:
//page.$ goes to the browser, grabs element handle that matches a.buy-now and returns it to the Node.js environment. Then goes back to the browser and runs getProperty on that handle and returns the  result again to the Node.js environemnt. Then runs the click function. So node -> browser -> node -> browser -> node -> browser.
//Cons: This is slower, because three commands are sent to the browser
//Pros: behaves more 'human-like'. Puppeteer will move the mouse to the location and click on the element instead of just executing the click function. Use this if you need the element for longer (perhaps because you have to make some calculations with the element)

//Option #2
//Runs the function inside page.evaluate in the browser context, and returns the results to the Node.js environment
//Pros: Faster. Also a lot easier to debug. If an error happens, you can reproduce the error by opening DevTools and rerunning the same lines in the browser. By mixing a lot of page.$ statements, it's hard to tell if the error occurred in the browser or in the Node.js environment.
