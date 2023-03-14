const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");

let browser, page;
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
  });
  page = await browser.newPage();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await browser.close();
});

test("The header has the correct text", async () => {
  const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in shows logout button", async () => {
  //   const id = "63dcbc6e57c2555c61d610d8";

  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });
  await page.goto("http://localhost:3000");
  // if our test fails it will fail on the below line, because it will keep on waiting for the logout button to appear
  await page.waitForSelector('a[href="/auth/logout"]'); // to slow down the execution of our test to make sure user is signed in and this button is rendered

  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  expect(text).toEqual("Logout");
});
