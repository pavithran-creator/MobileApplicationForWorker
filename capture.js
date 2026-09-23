const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ channel: 'msedge' });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 1. Login as Admin
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    const adminBtn = page.getByText('Federation Admin');
    if (await adminBtn.count() > 0) {
      await adminBtn.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'docs/screenshots/admin_dashboard.png' });
      console.log('Saved admin_dashboard.png');
    }

    // 2. Go to /worker
    await page.goto('http://localhost:3000/worker');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/screenshots/worker_dashboard.png' });
    console.log('Saved worker_dashboard.png');

    // 3. Go to /dashboard as Customer
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'docs/screenshots/customer_dashboard.png' });
    console.log('Saved customer_dashboard.png');

    // 4. Do a booking search
    await page.goto('http://localhost:3000/book');
    await page.waitForTimeout(2000);
    const findBtn = page.getByText('Find Geo-Matched Workers');
    if (await findBtn.count() > 0) {
      await findBtn.click();
      await page.waitForTimeout(2500);
    }
    await page.screenshot({ path: 'docs/screenshots/book_results.png' });
    console.log('Saved book_results.png');

    await browser.close();
    console.log('Done!');
  } catch (err) {
    console.error('Error during capture:', err);
  }
})();
