import { test, expect } from '@playwright/test'

test('happy path', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Delbestilling/)

  // Aksepter cookies
  await page.locator('[data-name="consent-banner-all"]').click()

  // Slå opp hjelpemiddel
  await page.getByTestId('input-artnr').fill('301996')
  await page.getByTestId('input-serienr').fill('123456')
  await page.getByTestId('button-oppslag-submit').click()

  // Forvent at hjelpemiddel er funnet og velg del
  await expect(page.getByTestId('hjelpemiddel-navn')).toHaveText('Bestilling til Minicrosser X2 4W 15 km/t')
  await page.locator('button', { hasText: 'Bestill' }).first().click()

  // Forvent at delkategorier vises og velg å legge til flere deler
  await expect(page.locator('#deler')).toHaveText('Deler lagt til i bestillingen')
  await page.locator('button', { hasText: 'Legg til flere deler' }).click()

  // Sorter på 'Lader' kategorien og legg til del
  await page.getByRole('button', { name: 'Lader' }).click()
  await page.locator('button', { hasText: 'Legg til del' }).first().click()

  // Velg levering og send inn
  await page.getByTestId('levering-xk-lager').check()
  await page.locator('button', { hasText: 'Send inn bestilling' }).click()
  await expect(page.getByText('Bestillingen ble sendt inn.')).toBeVisible()
})
