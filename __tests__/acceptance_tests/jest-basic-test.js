// -- GoLang-Style Array Return Wrapper -- //
// -- See: http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/ -- //
const RUN = function(promise) {  
   return promise.then(data => {
      return [null, data];
   })
   .catch(err => [err]);
}

// -- Basic Objects with which to Test -- //
const puppeteer = require("puppeteer");
let err, page, browser, nothing;

// -- Basic Config with which to Test -- //
const SITE = process.env.TEST_URL ? process.env.TEST_URL : "educ.io";
const EMAIL = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : "";
const PASSWORD = process.env.TEST_PASSWORD ? process.env.TEST_PASSWORD : "";
const WIDTH = 1920, HEIGHT = 1080;
const DEBUG = false;
console.log("CONFIG", {site: SITE, width: WIDTH, height: HEIGHT});

// -- Set-Up and Tear-Down Methods -- //
/* jshint ignore:start */
beforeAll(() => {
  
  return new Promise(async (resolve, reject) => {
  
    [err, browser] = await RUN(puppeteer.launch({
      ignoreHTTPSErrors: true, slowMo: 80,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors", "--disable-popup-blocking", `--window-size=${WIDTH},${HEIGHT}`]
    }));
    if(err || !browser) reject("Error Launching Browser: " + JSON.stringify(err));

    [err, page] = await RUN(browser.newPage());
    if (err || !page) reject("Error Opening New Page: " + JSON.stringify(err));
  
    if (DEBUG) console.log("PAGE:", page);
    
    resolve();
    
  });
  
});

afterAll(() => {
  
  return new Promise(async (resolve, reject) => {
    
    [err, nothing] = await RUN(browser.close());
    if (err) reject("Error Closing Browser: " + JSON.stringify(err));
    
    console.log("<-- 🎉 🐧 🐧 🐧 🎉 -->");
    
    resolve();
    
  });
  
});
/* jshint ignore:end */

/* jshint ignore:start */
describe("Testing the Home Page", async () => {
  
  beforeAll(() => {
  
    return new Promise(async (resolve, reject) => {

      [err, nothing] = await RUN(page.goto(`https://${SITE}`, {waitUntil : "networkidle0"}));
      if (err) reject("Error Opening New Page: " + JSON.stringify(err));
      
      resolve();

    });

  });
  
  test("Asset that <title> is correct", async () => {
    expect.assertions(1);
    const title = await page.title();
    expect(title.trim()).toBe(
      "Home | Educ.io"
    );
  });
  
  test("Home Link", async () => {
    expect.assertions(1);
    const canonical = await page.$eval("a.img-fluid", el => el.href);
    expect(canonical).toEqual("https://educ.io/");
  });
  
  test("List of Apps", async () => {
    expect.assertions(2);
    const appCount = await page.$$eval(".d-flex.flex-row > div", divs => divs.length);
    expect(appCount).toBe(12);
    
    const details = await page.evaluate(() => {
      const apps = Array.from(document.querySelectorAll(".d-flex.flex-row > div"));
      return apps.map(app => app.textContent.trim());
    });
    expect(details[0]).toMatch("View");
  });
  
});
/* jshint ignore:end */