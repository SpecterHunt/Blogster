// const puppeteer = require("puppeteer");
const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  // below code is moved to wrqpper CustomPage class in helpers/page.js
  //   browser = await puppeteer.launch({
  //     headless: false,
  //   });
  //   page = await browser.newPage();

  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("The header has the correct text", async () => {
  const text = await page.getContentsOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when signed in shows logout button", async () => {
  await page.login();
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual("Logout");
});
