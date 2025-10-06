import { test, expect } from '@playwright/test';

test('basic application health check', async ({ page }) => {
  // Listen to console messages
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]: ${error.message}`);
    console.log(`[PAGE ERROR STACK]: ${error.stack}`);
  });

  await page.goto('http://localhost:8081');

  // Wait a bit for the application to load
  await page.waitForTimeout(3000);

  // Log the HTML content to see what's rendered
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('Body HTML:', bodyHTML.substring(0, 500) + (bodyHTML.length > 500 ? '...' : ''));

  // Check body styles
  const bodyStyles = await page.locator('body').evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      height: computed.height,
      overflow: computed.overflow
    };
  });
  console.log('Body computed styles:', bodyStyles);

  await expect(page).toHaveTitle(/BeProductive/);

  // Check if root element exists and has content
  const rootExists = await page.locator('#root').count();
  console.log('Root element count:', rootExists);

  if (rootExists > 0) {
    const rootHTML = await page.locator('#root').innerHTML();
    console.log('Root HTML:', rootHTML.substring(0, 300) + (rootHTML.length > 300 ? '...' : ''));
  }

  console.log('✅ Basic application health check completed');
});