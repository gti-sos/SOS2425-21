// @ts-check
import { test, expect } from "@playwright/test";

test("get cultural-event link", async ({ page }) => {
  await page.goto("http://localhost:16078");

  // Click con data-testid
  await page.getByTestId("link-cultural-event").click();

  // Verifica que el título corresponde
  await expect(page).toHaveTitle(/Cultural Event Manager/);
});

test("create and delete cultural event entry", async ({ page }) => {
  const testProvince = "__TEST_PROVINCE__";
  const testYear = "2099";
  const testMonth = "mayo";
  const testEvents = "100";
  const testPrice = "20";
  const testAttendance = "5000";
  const testLocal = "4000";
  const testForeign = "1000";
  const testTypes = "Conciertos, Teatro";
  const testDuration = "2.5";

  await page.goto("http://localhost:16078");

  // Click con data-testid
  await page.getByTestId("link-cultural-event").click();

  // Completar formulario
  await page.locator("#Province").fill(testProvince);
  await page.locator("#Year").fill(testYear);
  await page.locator("#Month").fill(testMonth);
  await page.locator("#TotalEvents").fill(testEvents);
  await page.locator("#AvgPrice").fill(testPrice);
  await page.locator("#TotalAttendance").fill(testAttendance);
  await page.locator("#LocalAttendance").fill(testLocal);
  await page.locator("#ForeignAttendance").fill(testForeign);
  await page.locator("#EventType").fill(testTypes);
  await page.locator("#AvgDuration").fill(testDuration);

  // Crear evento
  await page.getByRole("button", { name: "Create" }).click();

  // Verifica que la fila se creó
  const newRow = page.locator("tr", { hasText: testProvince });
  await expect(newRow).toContainText(testYear);
  await expect(newRow).toContainText(testEvents);
  await expect(newRow).toContainText(testAttendance);
  await expect(newRow).toContainText(testTypes);
  await expect(newRow).toContainText(testDuration);

  // Eliminar la fila
  const deleteButton = newRow.getByRole("button", { name: "Delete" });
  await deleteButton.click();

  // Verificar que fue eliminado
  await expect(newRow).toHaveCount(0);
});
