import { test, expect } from '@playwright/test'

test('happy path', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Delbestilling/)

  await page.locator('[data-name="consent-banner-all"]').click()

  await page.getByTestId('input-artnr').fill('301996')
  await page.getByTestId('input-serienr').fill('123456')
  await page.getByTestId('button-oppslag-submit').click()

  await expect(page.getByTestId('hjelpemiddel-navn')).toHaveText('Bestilling til Minicrosser X2 4W 15 km/t')
})
