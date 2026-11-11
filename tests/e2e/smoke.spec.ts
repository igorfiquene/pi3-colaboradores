import { test, expect } from "@playwright/test";

test("smoke: home carrega", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
