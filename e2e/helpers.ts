import { APIRequestContext, Page, expect } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@galiciasteel.com.ua';
export const ADMIN_PASSWORD = 'ChangeMe!Admin2026';

/** Signs in through the studio login form and waits for the dashboard. */
export async function signIn(page: Page): Promise<void> {
  await page.goto('/studio/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/studio\/dashboard$/);
}

/** Direct API login for tests that need to set up / tear down data quickly. */
export async function apiLogin(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/auth/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).accessToken as string;
}
