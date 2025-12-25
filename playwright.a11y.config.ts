import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/a11y",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    headless: true,
  },
});
