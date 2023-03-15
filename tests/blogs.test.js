const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in, ", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see blog create form", async () => {
    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
  });

  describe("And using invalid inputs", () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    test("the form shows an error message", async () => {
      const titleErr = await page.getContentsOf(".title .red-text");
      const contentErr = await page.getContentsOf(".content .red-text");
      expect(titleErr).toEqual("You must provide a value");
      expect(contentErr).toEqual("You must provide a value");
    });
  });

  describe("And using valid inputs", () => {
    beforeEach(async () => {
      await page.type(".title input", "My title");
      await page.type(".content input", "My content");
      await page.click("form button");
    });

    test("Submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blog to index page ", async () => {
      await page.click("button.green");
      await page.waitForSelector(".card");

      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("My title");
      expect(content).toEqual("My content");
    });
  });
});

describe("When user is not logged in", () => {
  test("User cannot create blog post", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "My new Title",
          content: "My new Content",
        }),
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("User cannot fetch blog posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: "You must log in!" });
  });
});
