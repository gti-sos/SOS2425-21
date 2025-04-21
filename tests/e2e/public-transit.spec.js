import { test, expect } from '@playwright/test';

const dev = process.env.NODE_ENV !== 'production';

let baseUrl = dev
  ? 'http://localhost:16078/public-transit-stats' 
  : '/public-transit-stats';

const testTrip = {
  province: 'TestProvince',
  year: '2022',
  ticket_price: '1.5',
  total_trips: '10000',
  route_length: '25.5'
};

test.describe('Public Transit Stats E2E', () => {
  test('Create, search, edit, and delete a trip', async ({ page }) => {
    await page.goto(baseUrl);
  
    // Esperar a que se cargue el formulario
    await page.waitForSelector('table input', { timeout: 60000 });

    // 1. Crear un nuevo viaje (inputs por orden)
    const inputs = page.locator('table input');
    await inputs.nth(0).fill(testTrip.province); // province
    await inputs.nth(1).fill(testTrip.year);     // year
    await inputs.nth(2).fill(testTrip.ticket_price); // price
    await inputs.nth(3).fill(testTrip.total_trips);  // trips
    await inputs.nth(4).fill(testTrip.route_length); // length
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText(testTrip.province)).toBeVisible();

    // 2. Buscar el viaje
    await page.getByPlaceholder('Ej. Sevilla').fill(testTrip.province);
    await page.getByPlaceholder('Ej. 2000').fill(testTrip.year);
    await page.getByPlaceholder('Ej. 2017').fill(testTrip.year);
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText(testTrip.province)).toBeVisible();

    // 3. Editar el viaje
    await page
    .getByRole('row', { name: new RegExp(`${testTrip.province}.*${testTrip.year}`) })
    .getByRole('button', { name: 'Edit' })
    .click();

    await expect(page).toHaveURL(new RegExp(`${testTrip.province}/${testTrip.year}`));

    // 4. Verificar mensaje de éxito
    await page.waitForResponse((res) =>
      res.url().includes(`/api/v1/public-transit-stats/${testTrip.province}/${testTrip.year}`) &&
      res.status() === 200
    );
    const successMessage = await page.getByText('Viaje actualizado correctamente', { exact: false });
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // 5. Eliminar el viaje (de forma específica)
    await page
    .getByRole('row', { name: new RegExp(`${testTrip.province}.*${testTrip.year}`) })
    .getByRole('button', { name: 'Delete' })
    .click();

  });
});
