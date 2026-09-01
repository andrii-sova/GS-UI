import { test, expect } from '@playwright/test';

test.describe('public site', () => {
  test('homepage renders content served by the API', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Галіція Сталь' })).toBeVisible();

    // Services section is populated from GET /api/content.
    await expect(page.getByRole('heading', { name: 'Наші послуги' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Виготовлення металевих дверей' }),
    ).toBeVisible();
  });

  test('a service detail page loads from its slug', async ({ page }) => {
    await page.goto('/services/metal-doors');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Виготовлення металевих дверей',
    );
    await expect(page.getByRole('heading', { name: 'Специфікації' })).toBeVisible();
  });

  test('switching language re-fetches localized content', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: 'Виготовлення металевих дверей' })).toBeVisible();

    await page.getByRole('button', { name: 'ENG' }).first().click();
    await expect(page.getByRole('heading', { name: 'Metal Doors' })).toBeVisible();
  });

  test('the studio is not linked anywhere on the public site', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="studio"]')).toHaveCount(0);

    await page.goto('/contact');
    await expect(page.locator('a[href*="studio"]')).toHaveCount(0);
  });
});
