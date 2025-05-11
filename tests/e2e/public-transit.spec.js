// tests/e2e/public-transit.spec.js
// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "https://sos2425-21.onrender.com";

test("visit public-transit page directly and check title", async ({ page }) => {
  await page.goto(`${BASE_URL}/public-transit-stats`);
  await expect(page).toHaveTitle(/Public Transit Manager/);
});

test("create and delete public transit entry directly", async ({ page }) => {
  const timestamp = Date.now();
  const testProvince = `__TEST_PROVINCE__${timestamp}`;
  const testYear = "2099";
  const testPrice = "1.99";
  const testTrips = "99999";
  const testLength = "123.45";

  await page.goto(`${BASE_URL}/public-transit-stats`);

  const inputs = page.locator("tbody input");
  await inputs.nth(0).fill(testProvince);
  await inputs.nth(1).fill(testYear);
  await inputs.nth(2).fill(testPrice);
  await inputs.nth(3).fill(testTrips);
  await inputs.nth(4).fill(testLength);

  await page.getByRole("button", { name: "Crear" }).click();

  const newRow = page.locator("tr", { hasText: testProvince });
  await expect(newRow).toHaveCount(1, { timeout: 7000 });
  await expect(newRow).toContainText(testYear);
  await expect(newRow).toContainText(testPrice);
  await expect(newRow).toContainText(testTrips);
  await expect(newRow).toContainText(testLength);

  await newRow.getByRole("button", { name: "Eliminar" }).click();
  await expect(newRow).toHaveCount(0);
});
