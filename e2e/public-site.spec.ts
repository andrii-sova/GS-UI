import { test, expect, type APIRequestContext } from '@playwright/test';

/** Public payload as the browser sees it (proxied through :4200). */
async function loadContent(request: APIRequestContext, lang = 'uk') {
  const res = await request.get(`/api/content?lang=${lang}`);
  expect(res.ok()).toBeTruthy();
  return res.json();
}

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

  test('hero background is served from /uploads (API site settings)', async ({ page, request }) => {
    const content = await loadContent(request);
    expect(content.site.heroImageUrl).toContain('/uploads/');

    await page.goto('/');
    const hero = page.locator('.hero-bg-image');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute('src', /\/uploads\//);
  });

  test('header and footer phone come from the API', async ({ page, request }) => {
    const { site } = await loadContent(request);
    const digits = site.phone.replace(/\D/g, '');
    expect(digits.length).toBeGreaterThan(5);

    await page.goto('/');
    const headerPhone = page.getByTestId('header-phone');
    await expect(headerPhone).toHaveText(site.phone);
    await expect(headerPhone).toHaveAttribute('href', `tel:+${digits}`);
    await expect(page.locator('footer').getByRole('link', { name: site.phone })).toBeVisible();
  });

  test('hero stats are rendered from the API stats groups', async ({ page, request }) => {
    const { stats } = await loadContent(request);
    expect(stats.hero.length).toBeGreaterThan(0);

    await page.goto('/');
    const hero = page.locator('app-hero');
    for (const stat of stats.hero) {
      await expect(hero.getByText(stat.value, { exact: true }).first()).toBeVisible();
    }

    await page.goto('/about');
    for (const stat of stats.metrics) {
      await expect(page.getByText(stat.label, { exact: true }).first()).toBeVisible();
    }
  });

  test('maps highlight exactly the countries and regions published by the API', async ({ page, request }) => {
    const { exportCountries, regions } = await loadContent(request);
    expect(exportCountries.length).toBeGreaterThan(0);
    expect(regions.length).toBeGreaterThan(0);

    await page.goto('/portfolio');
    await expect(page.locator('svg.europe-map path.active')).toHaveCount(exportCountries.length);
    for (const c of exportCountries) {
      await expect(page.locator(`svg.europe-map path#${c.key}.active`)).toHaveCount(1);
    }
    await expect(page.locator('svg.ukraine-map path.active')).toHaveCount(regions.length);
  });

  test('privacy page is rendered from the API legal content', async ({ page, request }) => {
    const { legal } = await loadContent(request);
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(legal.privacy.title);
    await expect(page.locator('section h2')).toHaveCount(legal.privacy.sections.length);
  });

  test('testimonial "Details" opens an accessible dialog and Esc closes it', async ({ page, request }) => {
    const { testimonials } = await loadContent(request);
    const withDetails = testimonials.filter(
      (t: { detail: string[]; gallery: string[] }) => t.detail.length > 0 || t.gallery.length > 0,
    );
    test.skip(withDetails.length === 0, 'no testimonial with detail text or gallery in the seed');

    await page.goto('/');
    const buttons = page.getByTestId('testimonial-details');
    await expect(buttons).toHaveCount(withDetails.length);

    const first = buttons.first();
    await first.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { level: 3 })).not.toHaveText('');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });

  test('mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/', '/about', '/contact']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
    }
  });
});
