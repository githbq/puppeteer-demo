const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://taobao.com');
  await page.screenshot({ path: 'taobao.png' });

  await browser.close();
})();