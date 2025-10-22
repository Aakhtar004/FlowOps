import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.E2E_PORT || '3000'
const HOST = process.env.E2E_HOST || 'localhost'
const BASE_URL = `http://${HOST}:${PORT}`
const RUN_WEB_SERVER = true
const BACKEND_PORT = process.env.BACKEND_PORT || '8000'
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost'
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`

// Ensure BACKEND_URL is logged for debugging
console.log(`Using backend URL: ${BACKEND_URL}`)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: RUN_WEB_SERVER
    ? {
        command: `npm run dev -- --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
})