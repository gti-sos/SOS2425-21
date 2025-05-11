// @ts-check
import { test, expect } from '@playwright/test';

test('get cultural-event link', async ({ page }) => {
  await page.goto('http://localhost:16078');

  // Abre el dropdown de APIs
  await page.getByText('APIs').click();

  // Haz clic en el enlace de Cultural Events
  await page.getByTestId('link-cultural-event').click();

  // Verifica que el título contenga el nombre correcto
  await expect(page).toHaveTitle(/Cultural Events Manager/);
});

test('create and delete cultural event entry', async ({ page }) => {
  const testProvince = '__TEST_CULTURAL__';
  const testYear = '2099';
  const testMonth = 'mayo';
  const testTotal = '20';
  const testPrice = '12.5';
  const testAttendance = '500';

  await page.goto('http://localhost:16078');

  // Abre el dropdown de APIs
  await page.getByText('APIs').click();

  // Ir a la sección de Cultural Events
  await page.getByTestId('link-cultural-event').click();

  // Completar formulario de creación
  await page.locator('#Province').fill(testProvince);
  await page.locator('#Year').fill(testYear);
  await page.locator('#Month').fill(testMonth);
  await page.locator('#Total').fill(testTotal);
  await page.locator('#Price').fill(testPrice);
  await page.locator('#Attendance').fill(testAttendance);

  // Crear entrada
  await page.getByRole('button', { name: 'Crear' }).click();

  const newRow = page.locator('tr', { hasText: testProvince });
  await expect(newRow).toContainText(testMonth);
  await expect(newRow).toContainText(testPrice);

  // Eliminar entrada
  const deleteButton = newRow.getByRole('button', { name: 'Eliminar' });
  await deleteButton.click();

  // Verificar que ya no existe
  await expect(newRow).toHaveCount(0);
});
