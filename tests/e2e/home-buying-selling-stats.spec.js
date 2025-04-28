// @ts-check
import { test, expect } from '@playwright/test';


test('get home-buying-selling-stats link', async ({ page }) => {
  await page.goto('http://localhost:16078');

  // Click the get started link.
  await page.getByRole('link', { name: 'Estadísticas sobre la compraventa de viviendas en España' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page).toHaveTitle(/Home Buying Selling Manager/);
});


test('create and delete stats', async ({ page }) => {
  const testProvince = "__TEST_PROVINCE__";
  const testYear= "99";
  const testTransactionTotal= "2999";
  const testTransactionProtectedHousing= "56799";
  const testTransactionNewHousing= "12399";
  const testTransactionSecondhandHousing= "12399";
  await page.goto('http://localhost:16078');

  // Click the get started link.
  await page.getByRole('link', { name: 'Estadísticas sobre la compraventa de viviendas en España' }).click();

  await page.locator('#Province').fill(testProvince);    
  await page.locator('#Year').fill(testYear);         
  await page.locator('#Total').fill(testTransactionTotal);        
  await page.locator('#Protected').fill(testTransactionProtectedHousing);     
  await page.locator('#New').fill(testTransactionNewHousing);   
  await page.locator('#Secondhand').fill(testTransactionSecondhandHousing);   

  await page.getByRole('button',{name: "Create"}).click();

 // Verifica que la fila ha sido creada
 const newRow = page.locator('tr', { hasText: testProvince });
 await expect(newRow).toContainText(testYear);
 await expect(newRow).toContainText(testTransactionTotal);
 await expect(newRow).toContainText(testTransactionProtectedHousing);
 await expect(newRow).toContainText(testTransactionNewHousing);
 await expect(newRow).toContainText(testTransactionSecondhandHousing);

 // Eliminar la fila
 const deleteButton = newRow.getByRole('button', { name: "Delete" });
 await deleteButton.click();

 // Verifica que ya no exista 
 await expect(newRow).toHaveCount(0);
});