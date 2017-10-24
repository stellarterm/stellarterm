const puppeteer = require('puppeteer');
const fileUrl = require('./file-url');
const assert = require('assert');

const fetchesTicker = async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    await page.goto(fileUrl('./dist/index.html'));
    console.log('Test to see if assetlist appears within 4 seconds. (This means the ticker successfully loaded)')
    await page.waitForSelector('.AssetList__asset', {
      timeout: 4000,
    });
  } catch(e) {
    console.log(e)
    await browser.close();
    process.exit(1);
  }
  await browser.close();
};

fetchesTicker();
