// tests/e2e/home_buying-selling-stats.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:16078';

test.describe('Home Buying/Selling Stats UI', () => {

  test('Check list page loads and has basic elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/home‐buying‐selling‐stats`);

    // 1. El <title>
    await expect(page).toHaveTitle(/Home Buying\/Selling Manager/);

    // 2. Encabezado principal
    await expect(
      page.getByRole('heading', { name: 'Estadísticas de compraventa de viviendas' })
    ).toBeVisible();

    // 3. Tabla de datos
    await expect(page.locator('table')).toBeVisible();

    // 4. Botones de acción
    await expect(page.getByRole('button', { name: 'Crear' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Borrar Todo' })).toBeVisible();
  });

  test('Check edit page loads for a specific record', async ({ page }) => {
    // Ajusta estos valores a uno que exista en tu BD inicial
    const testProvince = 'madrid';
    const testYear     = 2015;

    await page.goto(`${BASE_URL}/home‐buying‐selling‐stats/${testProvince}/${testYear}`);

    // 1. Título de la ventana
    await expect(page).toHaveTitle(/Home Buying\/Selling Manager/);

    // 2. Encabezado de la vista de edición
    await expect(
      page.getByRole('heading', { name: `Editar datos de vivienda en ${testProvince} - ${testYear}` })
    ).toBeVisible();

    // 3. Inputs con sus placeholders
    await expect(page.getByPlaceholder('Total')).toBeVisible();
    await expect(page.getByPlaceholder('Protegida')).toBeVisible();
    await expect(page.getByPlaceholder('Nueva')).toBeVisible();
    await expect(page.getByPlaceholder('2ª Mano')).toBeVisible();

    // 4. Botones de la vista de edición
    await expect(page.getByRole('button', { name: 'Actualizar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  });

  test('Create and then Delete a new home‐buying record', async ({ page }) => {
    // Datos únicos
    const prov = `testprov_${Date.now()}`;
    const yr   = 2099;

    await page.goto(`${BASE_URL}/home‐buying‐selling‐stats`);

    // 1. Rellenar la fila de creación
    await page.getByPlaceholder('Provincia').fill(prov);
    await page.getByPlaceholder('Año').fill(yr.toString());
    await page.getByPlaceholder('Total').fill('123');
    await page.getByPlaceholder('Protegida').fill('45');
    await page.getByPlaceholder('Nueva').fill('67');
    await page.getByPlaceholder('2ª Mano').fill('89');

    // 2. Pulsar Crear
    await page.getByRole('button', { name: 'Crear' }).click();

    // 3. Esperar la fila que acabe de aparecer
    const newRow = page.locator(`tr:has-text("${prov}"):has-text("${yr}")`);
    await expect(newRow).toBeVisible({ timeout: 10_000 });

    // 4. Borrar ese registro
    page.on('dialog', d => d.accept());
    await newRow.getByRole('button', { name: 'Eliminar' }).click();

    // 5. Confirmar mensaje y que la fila desaparezca
    await expect(page.getByRole('alert')).toContainText(/eliminado correctamente/i);
    await expect(newRow).not.toBeVisible({ timeout: 10_000 });
  });

});
