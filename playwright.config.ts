import { defineConfig, devices } from "@playwright/test";
const baseURL=process.env.BASE_URL??"http://localhost:3003";
export default defineConfig({ testDir: "./e2e", timeout: 60_000, workers:1, use: { baseURL, trace: "retain-on-failure", serviceWorkers:"block" }, webServer: { command: "pnpm dev --port 3003", url: baseURL, reuseExistingServer: !process.env.CI }, projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }] });
