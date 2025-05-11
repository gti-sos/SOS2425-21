// @ts-check
import { test, expect } from '@playwright/test';

test('get public-transit-stats link', async ({ page }) => {
  await page.goto('http://localhost:16078');

  // Abre el dropdown "APIs"
await page.getByTestId('apis-dropdown').click();

  // Clic en el enlace a Public Transit
  await page.getByTestId('link-public-transit').click();

  // Verifica que el título contiene el texto esperado
  await expect(page).toHaveTitle(/Public Transit Manager/);
});

test('create and delete transit trip', async ({ page }) => {
  const testProvince = '__TEST_PROVINCE__';
  const testYear = '2099';
  const testPrice = '1.99';
  const testTrips = '99999';
  const testLength = '123.45';

  await page.goto('http://localhost:16078');

  // Abre el dropdown "APIs"
  await page.getByText('APIs').click();

  // Clic en el enlace a Public Transit
  await page.getByTestId('link-public-transit').click();

  // Completa el formulario
  await page.locator('#Province').fill(testProvince);
  await page.locator('#Year').fill(testYear);
  await page.locator('#Price').fill(testPrice);
  await page.locator('#Trips').fill(testTrips);
  await page.locator('#Length').fill(testLength);

  // Crear viaje
  await page.getByRole('button', { name: 'Create' }).click();

  // Verificar la fila creada
  const newRow = page.locator('tr', { hasText: testProvince });
  await expect(newRow).toContainText(testYear);
  await expect(newRow).toContainText(testPrice);
  await expect(newRow).toContainText(testTrips);
  await expect(newRow).toContainText(testLength);

  // Eliminar la fila
  const deleteButton = newRow.getByRole('button', { name: 'Delete' });
  await deleteButton.click();

  // Verificar que ya no exista
  await expect(newRow).toHaveCount(0);
});
