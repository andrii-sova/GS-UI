import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the public GS-UI site, driven against a real browser.
 *
 * Two dev servers are started automatically:
 *  1. the API (GS-API) on :5048, pointed at a dedicated `GsContentE2E` LocalDB database
 *     (migrated + seeded on startup);
 *  2. `ng serve` on :4200, which proxies `/api` and `/uploads` to the API.
 *
 * Run: `npm run e2e`  (headed/interactive: `npm run e2e:ui`)
 */

const API_URL = 'http://localhost:5048';
const APP_URL = 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command:
        'dotnet run --project src/GS.Api --no-launch-profile',
      cwd: '../GS-API',
      url: `${API_URL}/health`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        ASPNETCORE_URLS: API_URL,
        ConnectionStrings__Default:
          'Server=(localdb)\\MSSQLLocalDB;Database=GsContentE2E;Trusted_Connection=True;TrustServerCertificate=True',
        Cors__AllowedOrigins__0: APP_URL,
      },
    },
    {
      command: 'npm start',
      url: APP_URL,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
    },
  ],
});
