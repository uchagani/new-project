import { test, expect, Page } from '@playwright/test';

let sessionStorage:string;
let hostname:string;
const url = 'https://demo.playwright.dev/todomvc';

test.describe.serial('Verify Session Storage', () => {
  test('add item to session storage', async ({ page }) => {
    await page.goto(url);
    hostname = await page.evaluate(() => window.location.hostname);
    expect(hostname).toEqual('demo.playwright.dev');

    await page.evaluate(() => window.sessionStorage.setItem("foo", "bar"));
    sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
    expect(sessionStorage).toEqual("{\"foo\":\"bar\"}")
  });

  test('load item into session storage', async ({ context }) => {
    expect(sessionStorage).toEqual("{\"foo\":\"bar\"}")

    await context.addInitScript(storage => {
      if (window.location.hostname === hostname) {
        const entries = JSON.parse(storage);
        for (const [key, value] of Object.entries(entries)) {
          window.sessionStorage.setItem(key, value);
        }
      }
    }, sessionStorage);

    const page = await context.newPage();
    await page.goto(url);

    // ensure hostname is correct since that is what is used in the addInitScript
    hostname = await page.evaluate(() => window.location.hostname);
    expect(hostname).toEqual('demo.playwright.dev');

    const sessionStorageFromPage = await page.evaluate(() => JSON.stringify(sessionStorage));
    expect(sessionStorageFromPage).toEqual(sessionStorage);    
  });
});
