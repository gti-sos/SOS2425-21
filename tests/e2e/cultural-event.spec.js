// tests/e2e/cultural-event.spec.js
// @ts-check
import { test, expect } from "@playwright/test";

const BASE_URL = "https://sos2425-21.onrender.com";

test("visit cultural-event page directly and check title", async ({ page }) => {
  await page.goto(`${BASE_URL}/cultural-event`);
  await expect(page).toHaveTitle(/Cultural Events Manager/);
});

test("create and delete cultural event entry directly", async ({ page }) => {
  const timestamp = Date.now();
  const testProvince = `__TEST_CULTURAL__${timestamp}`;
  const testYear = "2099";
  const testMonth = "mayo";
  const testTotal = "20";
  const testPrice = "12.5";
  const testAttendance = "500";

  await page.goto(`${BASE_URL}/cultural-event`);
  await page.getByTestId("input-province").waitFor();

  await page.getByTestId("input-province").fill(testProvince);
  await page.getByTestId("input-year").fill(testYear);
  await page.getByTestId("input-month").fill(testMonth);
  await page.getByTestId("input-total").fill(testTotal);
  await page.getByTestId("input-price").fill(testPrice);
  await page.getByTestId("input-attendance").fill(testAttendance);

  await page.getByRole("button", { name: "Crear" }).click();

  const newRow = page.locator("tr", { hasText: testProvince });
  await expect(newRow).toHaveCount(1, { timeout: 7000 });
  await expect(newRow).toContainText(testMonth);
  await expect(newRow).toContainText(testPrice);

  await newRow.getByRole("button", { name: "Eliminar" }).click();
  await expect(newRow).toHaveCount(0);
});
