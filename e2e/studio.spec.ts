import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, apiLogin, signIn } from './helpers';

test.describe('hidden studio', () => {
  test('/studio redirects to the login page when signed out', async ({ page }) => {
    await page.goto('/studio');
    await expect(page).toHaveURL(/\/studio\/login$/);
    await expect(page.getByRole('button', { name: 'Увійти' })).toBeVisible();
  });

  test('an unknown studio sub-path still lands on login, not a 404', async ({ page }) => {
    await page.goto('/studio/anything/else');
    await expect(page).toHaveURL(/\/studio\/login$/);
  });

  test('rejects a wrong password', async ({ page }) => {
    await page.goto('/studio/login');
    await page.getByRole('textbox', { name: 'Електронна пошта' }).fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill('not-the-password');
    await page.getByRole('button', { name: 'Увійти' }).click();
    await expect(page.getByText('Невірна електронна пошта або пароль.')).toBeVisible();
    await expect(page).toHaveURL(/\/studio\/login$/);
  });

  test('signs in with the default admin and shows the ERP shell', async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible();

    const sidebar = page.locator('aside');
    for (const name of ['Дашборд', 'Публічний сайт', 'Користувачі', 'Обліковий запис']) {
      await expect(sidebar.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('navigation', { name: 'Навігаційний ланцюжок' })).toBeVisible();
  });

  test('the Public website workspace opens every tab', async ({ page }) => {
    await signIn(page);
    await page.locator('aside').getByRole('link', { name: 'Публічний сайт', exact: true }).click();
    await expect(page).toHaveURL(/\/studio\/website\/media$/);

    const tabs = page.getByTestId('website-tabs');
    const expected: Array<[string, RegExp]> = [
      ['Медіа та головний екран', /\/website\/media$/],
      ['Команда', /\/website\/team$/],
      ['Партнери', /\/website\/partners$/],
      ['Проєкти', /\/website\/projects$/],
      ['Відгуки', /\/website\/testimonials$/],
      ['Послуги', /\/website\/services$/],
      ['Блог', /\/website\/blog$/],
      ['Показники', /\/website\/numbers$/],
      ['Географія', /\/website\/coverage$/],
      ['Контакти та соцмережі', /\/website\/contacts$/],
      ['Юридичні сторінки', /\/website\/legal\/privacy$/],
    ];
    for (const [name, url] of expected) {
      await tabs.getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(url);
      await expect(tabs.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    // Sub-tabs.
    await tabs.getByRole('link', { name: 'Проєкти', exact: true }).click();
    await page.getByRole('link', { name: 'Категорії', exact: true }).click();
    await expect(page).toHaveURL(/\/website\/projects\/categories$/);
    await tabs.getByRole('link', { name: 'Географія', exact: true }).click();
    await page.getByRole('link', { name: 'Регіони', exact: true }).click();
    await expect(page).toHaveURL(/\/website\/coverage\/regions$/);
  });

  test('content forms show both languages side by side, with an English-missing hint', async ({ page }) => {
    await signIn(page);
    await page.goto('/studio/website/team/new');
    const uk = page.getByTestId('name-uk');
    const en = page.getByTestId('name-en');
    await expect(uk).toBeVisible();
    await expect(en).toBeVisible();
    await expect(page.getByText('Українською').first()).toBeVisible();
    await expect(page.locator('label.st-loc-badge', { hasText: 'English' }).first()).toBeVisible();

    // Side by side on desktop.
    const a = await uk.boundingBox();
    const b = await en.boundingBox();
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(4);
    expect(b!.x).toBeGreaterThan(a!.x + a!.width - 1);

    const hint = page.getByTestId('en-missing-hint');
    await expect(hint).toHaveCount(0);
    await uk.fill('Тест');
    await expect(hint.first()).toHaveText(/Англійський переклад відсутній/);
    await en.fill('Test');
    await expect(hint).toHaveCount(0);
  });

  test('session survives a full page reload (silent refresh)', async ({ page }) => {
    await signIn(page);
    await page.reload();
    await expect(page).toHaveURL(/\/studio\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Дашборд' })).toBeVisible();
  });

  test('signing out returns to the login page and blocks the studio again', async ({ page }) => {
    await signIn(page);
    await page.getByTestId('user-menu').click();
    await page.getByRole('menuitem', { name: 'Вийти' }).click();
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
      await page.locator('aside').getByRole('link', { name: 'Публічний сайт', exact: true }).click();
      await page
        .getByTestId('website-tabs')
        .getByRole('link', { name: 'Відгуки', exact: true })
        .click();
      await expect(page).toHaveURL(/\/studio\/website\/testimonials$/);
      await page.getByRole('link', { name: originalCompany, exact: true }).click();

      const company = page.getByTestId('company');
      await expect(company).toHaveValue(originalCompany);
      await company.fill(marker);
      await page.getByRole('button', { name: 'Зберегти', exact: true }).click();

      await expect(page).toHaveURL(/\/studio\/website\/testimonials$/);
      await expect(page.getByRole('link', { name: marker, exact: true })).toBeVisible();

      // The public homepage testimonials section now shows the new company name.
      await page.goto('/');
      await expect(page.getByText(marker, { exact: false })).toBeVisible();
    } finally {
      // Restore original value regardless of assertions.
      await request.put(`/api/admin/testimonials/${target.id}`, {
        headers: auth,
        data: { ...target, company: originalCompany },
      });
    }
  });
});
