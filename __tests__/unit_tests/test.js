const puppeteer = require("puppeteer");

const SITE = process.argv && process.argv[2] ? process.argv[2] : "educ.io";
console.log("SITE:", SITE);

const width = 1920;
const height = 1080;

/* jshint ignore:start */
(async () => {
  
  puppeteer.launch(
    {
      ignoreHTTPSErrors: true, 
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"]
    }).then(async browser => {

    
    console.log(await browser.version());
    
    const page = await browser.newPage();
    
    /**
   * Attach an event listener to page to capture a custom event on page load/navigation.
   * @param {string} type Event name.
   * @return {!Promise}
   */
    function listenFor(type) {
      return page.evaluateOnNewDocument(type => {
        document.addEventListener(type, e => {
          console.log(e);
          console.log(`${e.type} FIRED`, e.detail || "");
          window.onCustomEvent({type, detail: e.detail});
        });
      }, type);
    }

    await page.goto("https://" + SITE, {waitUntil : "networkidle0"});

    await page.exposeFunction("onCustomEvent", e => {
      console.log(`${e.type} fired`, e.detail || "");
    });

    await listenFor("controller-completed");

    await page.waitFor("h1");
    
    // Get the "viewport" of the page, as reported by the page.
    const dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        deviceScaleFactor: window.devicePixelRatio
      };
    });

    console.log("Dimensions:", dimensions);
    
    await page.screenshot({path : "outputs/home.png", fullPage : true});
    
    // await page.click('input[type="submit"]');

    const details = await page.evaluate(() => {
      const apps = Array.from(document.querySelectorAll(".d-flex.flex-row > div"));
      return apps.map(app => app.textContent.trim());
    });
    //console.log("Apps:", details.join("\n"));
    
    await browser.close();

  }).catch(e => console.log("Error Launching Browser:", e));

})();
/* jshint ignore:end */