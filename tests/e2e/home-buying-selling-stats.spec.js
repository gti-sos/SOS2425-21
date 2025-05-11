// tests/e2e/home-buying-selling-stats.spec.js
// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "https://sos2425-21.onrender.com";

test("visit home-buying-selling-stats page directly and check title", async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/home-buying-selling-stats`);
  await expect(page).toHaveTitle(/Home Buying Selling Manager/);
});

test("create and delete home buying stats entry directly", async ({ page }) => {
  const timestamp = Date.now();
  const testProvince = `__TEST_PROVINCE__${timestamp}`;
  const testYear = "2099";
  const testTotal = "2999";
  const testProtected = "56799";
  const testNew = "12399";
  const testSecondhand = "88888";

  await page.goto(`${BASE_URL}/home-buying-selling-stats`);

  const inputs = page.locator("tbody tr").first().locator("input");
  await inputs.nth(0).fill(testProvince);
  await inputs.nth(1).fill(testYear);
  await inputs.nth(2).fill(testTotal);
  await inputs.nth(3).fill(testProtected);
  await inputs.nth(4).fill(testNew);
  await inputs.nth(5).fill(testSecondhand);

  await page.getByRole("button", { name: "Crear" }).click();

  const newRow = page.locator("tr", { hasText: testProvince });
  await expect(newRow).toHaveCount(1, { timeout: 7000 });
  await expect(newRow).toContainText(testYear);
  await expect(newRow).toContainText(testTotal);
  await expect(newRow).toContainText(testProtected);
  await expect(newRow).toContainText(testNew);
  await expect(newRow).toContainText(testSecondhand);

  await newRow.getByRole("button", { name: "Eliminar" }).click();
  await expect(newRow).toHaveCount(0);
});
