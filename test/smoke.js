const puppeteer = require('puppeteer');
const fileUrl = require('./file-url');
const assert = require('assert');

const fetchesTicker = async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    await page.goto(fileUrl('./dist/index.html'));
    console.log('Test ticker.json can load. See if assetlist appears within 4 seconds.')
    await page.waitForSelector('.AssetList__asset', {
      timeout: 4000,
    });


    console.log('Test we can connect to Horizon. See if the pricechart says loading.')
    await page.click('a[href="#exchange"]');
    await page.waitForSelector('#PriceChart', {
      timeout: 4000,
    });

    console.log('Test to see if we can load trade history chart.')
    await page.waitForSelector('.highcharts-root', {
      timeout: 8000,
    });

    // await page.screenshot({path: 'screenshot.png'});

  } catch(e) {
    console.log(e)
    await browser.close();
    process.exit(1);
  }
  await browser.close();
};

fetchesTicker();
