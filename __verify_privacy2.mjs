import { chromium } from 'playwright';
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Desktop-GS-UI/3a1acab9-8217-4057-a46a-e78c00d88dfb/scratchpad/shots';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });

await page.goto('http://localhost:4200/privacy', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/v7-privacy-uk.png`, fullPage: true });

const enBtn = page.locator('.lang-switcher button', { hasText: 'ENG' }).first();
await enBtn.click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/v7-privacy-en.png`, fullPage: true });

// check footer link href on home page (still in EN context now)
await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const footerLink = page.locator('app-footer a[href="/privacy"]').first();
const count = await footerLink.count();
console.log('footer privacy link count:', count);
if (count) {
  await footerLink.click();
  await page.waitForTimeout(400);
  console.log('URL after footer click:', page.url());
}

console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
console.log('done');
