import { test, expect } from '@playwright/test';

/**
 * Smoke tests to verify pages load without console errors.
 *
 * These tests start each page and check that no JavaScript errors
 * appear in the browser console.
 */

const pages = [
  { name: 'Main App', path: '/' },
  { name: 'Components Showcase', path: '/components.html' },
  { name: 'Black Hole Demo', path: '/blackhole.html' },
  { name: 'Icons Demo', path: '/icons.html' },
];

for (const { name, path } of pages) {
  test(`${name} loads without console errors`, async ({ page }) => {
    const errors = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    // Give a moment for any async errors to surface
    await page.waitForTimeout(500);

    expect(errors, `Console errors on ${name}:`).toEqual([]);
  });
}

test('Main app renders the galaxy map', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check that the SVG galaxy map is rendered
  const svg = page.locator('svg');
  await expect(svg.first()).toBeVisible();
});

test('Components page renders showcase sections', async ({ page }) => {
  await page.goto('/components.html');
  await page.waitForLoadState('networkidle');

  // Check that component sections exist
  const header = page.getByRole('heading', { name: 'Sol3000 Component Library' });
  await expect(header).toBeVisible();
});
