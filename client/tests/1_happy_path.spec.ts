import test, { expect } from '@playwright/test'

test('happy path', async ({ page }) => {
  await test.step('Naviger til delbestilling', async () => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Delbestilling/)
  })

  await test.step('Slå opp hjelpemiddel', async () => {
    await page.getByTestId('input-artnr').fill('301996')
    await page.getByTestId('input-serienr').fill('123456')
    await page.getByTestId('button-oppslag-submit').click()
  })

  await test.step('Forvent at hjelpemiddel er funnet og velg del', async () => {
    await expect(page.getByTestId('hjelpemiddel-navn')).toHaveText('Bestilling til Minicrosser X2 4W 15 km/t')
    await page.locator('button', { hasText: 'Bestill' }).first().click()
  })

  await test.step('Forvent at delkategorier vises og velg å legge til flere deler', async () => {
    await expect(page.locator('#deler')).toHaveText('Deler lagt til i bestillingen')
    await page.locator('button', { hasText: 'Legg til flere deler' }).click()
  })

  await test.step("Sorter på 'Lader' kategorien og legg til del", async () => {
    await page.getByRole('button', { name: 'lader' }).click()
    await page.locator('button', { hasText: 'Legg til del' }).first().click()
  })

  await test.step('Velg levering og send inn', async () => {
    await page.getByTestId('levering-xk-lager').check()
    await page.locator('button', { hasText: 'Send inn bestilling' }).click()
    await expect(page.getByText('Bestillingen ble sendt inn.')).toBeVisible()
  })
})
