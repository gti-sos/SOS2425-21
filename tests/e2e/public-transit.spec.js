// @ts-check
import { test, expect } from '@playwright/test';

const dev = process.env.NODE_ENV !== 'production';

let baseUrl = dev
  ? 'http://localhost:16078/public-transit-stats' 
  : '/public-transit-stats';

test('has title', async ({ page }) => {
  await page.goto(baseUrl);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Public Transit Manager/);
});

test('create and delete transit trip', async ({ page }) => {
  const testProvince = "__TEST_PROVINCE__";
  const testYear = "2099";
  const testPrice = "1.99";
  const testTrips = "99999";
  const testLength = "123.45";

  await page.goto('http://localhost:16078');

  // Llenar el formulario de creación
  await page.getByRole('textbox').nth(0).fill(testProvince);     // Provincia
  await page.getByRole('textbox').nth(1).fill(testYear);         // Año
  await page.getByRole('textbox').nth(2).fill(testPrice);        // Precio
  await page.getByRole('textbox').nth(3).fill(testTrips);        // Viajes
  await page.getByRole('textbox').nth(4).fill(testLength);       // Longitud

  // Crear el viaje
  await page.getByRole('button', { name: /Create/i }).click();

  // Verifica que la fila ha sido creada
  const newRow = page.locator('tr', { hasText: testProvince });
  await expect(newRow).toContainText(testYear);
  await expect(newRow).toContainText(testPrice);
  await expect(newRow).toContainText(testTrips);
  await expect(newRow).toContainText(testLength);

  // Eliminar la fila
  const deleteButton = newRow.getByRole('button', { name: /Delete/i });
  await deleteButton.click();

  // Verifica que ya no exista
  await expect(newRow).toHaveCount(0);
});
