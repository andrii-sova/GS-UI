import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, apiLogin, signIn } from './helpers';

test.describe('hidden studio', () => {
  test('/studio redirects to the login page when signed out', async ({ page }) => {
    await page.goto('/studio');
    await expect(page).toHaveURL(/\/studio\/login$/);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('an unknown studio sub-path still lands on login, not a 404', async ({ page }) => {
    await page.goto('/studio/anything/else');
    await expect(page).toHaveURL(/\/studio\/login$/);
  });

  test('rejects a wrong password', async ({ page }) => {
    await page.goto('/studio/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill('not-the-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/studio\/login$/);
  });

  test('signs in with the default admin and shows the dashboard', async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    const sidebar = page.locator('aside');
    await expect(sidebar.getByRole('link', { name: '🔧 Services' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Operator accounts' })).toBeVisible();
  });

  test('session survives a full page reload (silent refresh)', async ({ page }) => {
    await signIn(page);
    await page.reload();
    await expect(page).toHaveURL(/\/studio\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('signing out returns to the login page and blocks the studio again', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/studio\/login$/);

    await page.goto('/studio/dashboard');
    await expect(page).toHaveURL(/\/studio\/login$/);
  });

  test('editing a testimonial propagates to the public site', async ({ page, request }) => {
    // Arrange: read the current first testimonial via the API so we can restore it afterwards.
    const token = await apiLogin(request);
    const auth = { Authorization: `Bearer ${token}` };
    const list = await (await request.get('/api/admin/testimonials', { headers: auth })).json();
    const target = [...list].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    const originalCompany: string = target.company;
    const marker = `E2E ${Date.now()}`;

    try {
      await signIn(page);
      await page.locator('aside').getByRole('link', { name: '💬 Testimonials' }).click();
      await expect(page).toHaveURL(/\/studio\/testimonials$/);
      await page.getByRole('link', { name: originalCompany }).click();

      const company = page.getByTestId('company');
      await expect(company).toHaveValue(originalCompany);
      await company.fill(marker);
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page).toHaveURL(/\/studio\/testimonials$/);
      await expect(page.getByRole('link', { name: marker })).toBeVisible();

      // The public homepage testimonials section now shows the new company name.
      await page.goto('/');
      await expect(page.getByText(marker, { exact: false })).toBeVisible();
    } finally {
      // Restore original value regardless of assertions.
      await request.put(`/api/admin/testimonials/${target.id}`, {
        headers: auth,
        data: {
          quote: target.quote,
          author: target.author,
          company: originalCompany,
          isPublished: target.isPublished,
        },
      });
    }
  });
});
