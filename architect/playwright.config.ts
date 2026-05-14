import { defineConfig } from "@playwright/test";

export default defineConfig({
  fullyParallel: true,
  testDir: "./tests",
  snapshotPathTemplate: "{testDir}/snapshots/{arg}{ext}",
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
