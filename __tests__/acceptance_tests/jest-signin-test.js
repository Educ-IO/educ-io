// -- Basic Config with which to Test -- //
const SITE = process.env.TEST_URL ? process.env.TEST_URL : "educ.io";
const EMAIL = process.env.TEST_EMAIL ? process.env.TEST_EMAIL : "";
const PASSWORD = process.env.TEST_PASSWORD ? process.env.TEST_PASSWORD : "";
const CODE = process.env.TEST_CODE ? process.env.TEST_CODE : "";
const WIDTH = 1920, HEIGHT = 1080;
const DEBUG = process.env.TEST_DEBUG ? true : false, 
      VERBOSE = process.env.TEST_VERBOSE ? true : false, 
      TIMED = process.env.TEST_TIMED ? true : false;

const IS_FUNCTION = function(o) {return !!(o && o.constructor && o.call && o.apply);}
  
// -- GoLang-Style Array Return Wrapper -- //
// -- See: http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/ -- //
const RUN = function(promise) {  
   return promise.then(data => {
      return [null, data];
   }).catch(err => [err]);
};

const ACTION = function(name, context, fn /*, args */) {
  if (TIMED) console.time(name);
  return new Promise((resolve, reject) => {
    const error = function(err) {
      console.error(`ERRORED: ${name} == ${err}`);
      if (TIMED) console.timeEnd(name);
      resolve();
    }
    if (VERBOSE) console.log(`RUNNING: ${name}`);
    try {
      let result = fn.apply(context, Array.prototype.slice.call(arguments, 3));
      if (IS_FUNCTION(result.then)) {
        if (VERBOSE) console.log(`WAITING: ${name} returns a PROMISE, attempting to resolve`);
        result.then(data => {
          if (VERBOSE) console.log(`COMPLETED: ${name} => Resolved`);
          if (TIMED) console.timeEnd(name);
          resolve(data);
        }).catch(error);
      } else {
        if (VERBOSE) console.log(`COMPLETED: ${name} => Returned`);
        if (TIMED) console.timeEnd(name);
        resolve(result);
      }  
    } catch (err) {
      error(err);
    }
  });
};

const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));

// -- Basic Objects with which to Test -- //
const puppeteer = require("puppeteer");
let err, page, browser, nothing;

console.log("CONFIG", {site: SITE, debug: DEBUG, verbose: VERBOSE, width: WIDTH, height: HEIGHT, email: EMAIL});

// -- Set-Up and Tear-Down Methods -- //
/* jshint ignore:start */
beforeAll(() => {
  
  return new Promise(async (resolve, reject) => {
  
    var defaults = ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors", "--disable-popup-blocking", "--incognito", `--window-size=${WIDTH},${HEIGHT}`];
    // --user-agent
    
    browser = await ACTION("Launch Browser", puppeteer, puppeteer.launch, {
      ignoreHTTPSErrors: true,
      args: DEBUG ?  defaults.concat(["--enable-logging", "--v=1", "--shm-size=1gb"]) : defaults,
      dumpio: DEBUG ? true : false,
    });

    page = await ACTION("Open New Page", browser, browser.newPage);

    page.on("console", msg => msg.args.forEach((item, index) => console.log(`PAGE LOG -> ${index}: ${item}`)));
    
    if (DEBUG) console.log("PAGE:", page);
    
    resolve();
    
  });
  
});

afterAll(() => {
  
  return new Promise(async (resolve, reject) => {
    
    await ACTION("Closing Browser", browser, browser.close);
    
    console.log("<-- 🎉 🐧 🐧 🐧 🎉 -->");
    
    resolve();
    
  });
  
});
/* jshint ignore:end */

/* jshint ignore:start */
describe("Testing the App Sign-In Process", async () => {
  
  beforeAll(() => {
  
    return new Promise(async (resolve, reject) => {

      await ACTION(`Navigating to https://${SITE}`, page, page.goto, `https://${SITE}`, {waitUntil : "networkidle0"});
      
      await ACTION("Waiting for 'View' App Button to Appear", page, page.waitForSelector, "a#open_view", {visible: true});
      
      await ACTION("Clicking on 'View' App Button", page, page.click, "a#open_view");
      
      await ACTION("Waiting for the 'View' App Navigation to Appear", page, page.waitForSelector, "nav#site_nav", {visible: true});
      
      resolve();

    });

  });
  
  /*
  afterAll(() => {
    
    return new Promise(async (resolve, reject) => {

      await page.screenshot({path : "outputs/view.png", fullPage : true});
      
      let sign_out = await page.$("form#sign_out a.btn");
      let sign_out_box = await sign_out.boundingBox();
      
      console.log("SIGN-OUT BOUNDING BOX:", sign_out_box);
      
      let sign_in = await page.$("form#sign_in a.btn");
      let sign_in_box = await sign_in.boundingBox();
      
      console.log("SIGN-IN BOUNDING BOX:", sign_in_box);
      
      if (sign_out && sign_out_box) { // Check for Visibility
        
        console.log("SIGNING OUT");
      
        [err, nothing] = await RUN(page.click("form#sign_out a.btn"));
        if (err) reject("Error Signing Out: " + JSON.stringify(err));  
        
      }
      
      resolve();

    });
    
  });
  */
  
  describe("Testing View App Sign-In", () => {
    
    var login_Page;
    
    beforeAll(() => {
  
      return new Promise(async (resolve, reject) => {

        await ACTION("Wait for Log In Button", page, page.waitForSelector, "form#sign_in a.btn", {visible: true});

        await ACTION("Screenshot - " + page.url(), page, page.screenshot, {path : "outputs/app.png", fullPage : true});
      
        await ACTION("Click Log In Button", page, page.click, "form#sign_in a.btn");
        
        await browser.on("targetcreated", async () => {
          
          try {
           
            let pages = await ACTION("Wait for Browser Pages 1 ", browser, browser.pages);
            let login = pages[pages.length - 1], title = await ACTION("Wait for New Page Title 1", login, login.title);

            if (title == "Sign in - Google Accounts") {
              
              if (DEBUG) await login.tracing.start({path: "outputs/trace.json"});
              
              login.on("console", msg => msg.args.forEach((item, index) => console.log(`LOGIN PAGE LOG -> ${index}: ${item}`)));
              login.on("pageerror", msg => console.log(`LOGIN PAGE PAGE ERROR -> ${msg}`));
              login.on("error", err => console.log(`LOGIN PAGE ERROR -> ${err}`));
              
              login_Page = login;
              
              resolve();
              
            }
  
          } catch (e) {
           
            reject();
           
          }
            
        });
                         
      });

    });
    
    afterAll(() => {
      return new Promise(async (resolve, reject) => {
        if (DEBUG && login_Page) await login_Page.tracing.stop();
        resolve();
      });
    });
    
    it("Should log in", async () => {

      expect.assertions(1);
    
      if (login_Page) {
      
        await ACTION("Bring Login Screen to Front", login_Page, login_Page.bringToFront);

        await ACTION("Wait for Username Input on Login Page", login_Page, login_Page.waitForSelector, "input#Email, input#identifierId", {visible : true});
        
        await ACTION("Type Email Address in Username Input", login_Page, login_Page.type, "input#Email, input#identifierId", EMAIL);
        
        await ACTION("Click Next", login_Page, login_Page.click, "input#next,div#identifierNext");
        
        await ACTION("Wait for Password Input on Login Page", login_Page, login_Page.waitForSelector, "input#Passwd, #password input[type='password']", {visible : true});
        
        await ACTION("Type Password into Input", login_Page, login_Page.type, "input#Passwd, #password input[type='password']", PASSWORD);
        
        await ACTION("Click Next", login_Page, login_Page.click, "input#signIn, div#passwordNext");
                
        await ACTION("Wait for 2FA Code Input on Login Page", login_Page, login_Page.waitForSelector, "input#totpPin, input[name='totpPin'][type='tel']", {visible : true});
        
        await ACTION("Type Code into 2FA Code Input", login_Page, login_Page.type, "input#totpPin, input[name='totpPin'][type='tel']", CODE);
        
        await ACTION("Click Next", login_Page, login_Page.click, "input#submit, div#totpNext");
        
        await ACTION("Bring App Screen to Front", page, page.bringToFront);
        
        await ACTION("Wait for Log In Button", page, page.waitForSelector, "form#sign_out a.btn", {visible: true});
        
        await ACTION("Screenshot - " + page.url(), page, page.screenshot, {path : "outputs/app_authenticated.png", fullPage : false});
        
        await page.waitForSelector("a#user_details");
        const user = await page.$eval("a#user_details", el => el.innerText);
        expect(user).toEqual("Educ Testing");
        
      }
      
    }, 30000);
    
    
  });
  
});
/* jshint ignore:end */