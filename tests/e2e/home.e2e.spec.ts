import { test, expect } from "@playwright/test";

test("home renders and has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Zero17/i);
  await expect(page.locator("body")).toBeVisible();
});
