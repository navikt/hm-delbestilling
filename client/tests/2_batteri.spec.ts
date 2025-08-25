import test, { expect } from '@playwright/test'

test('batteri', async ({ page }) => {
  await test.step('Naviger til delbestilling', async () => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Delbestilling/)
  })

  // Slå opp hjelpemiddel
  await test.step('Slå opp hjelpemiddel', async () => {
    await page.getByTestId('input-artnr').fill('301996')
    await page.getByTestId('input-serienr').fill('123456')
    await page.getByTestId('button-oppslag-submit').click()
  })

  // Sorter på 'Batteri' kategorien og se at det ikke kan legges til
  await test.step("Sorter på 'Batteri' kategorien og se at det ikke kan legges til", async () => {
    await expect(page.getByRole('button', { name: 'Batteri' })).toBeVisible()
    await page.getByRole('button', { name: 'Batteri' }).click()
    await expect(page.getByRole('button', { name: 'Legg til del' })).toBeHidden()
    await expect(
      page.getByText(
        'Det er bestilt batteri for 123 dager siden. Ta kontakt med Hjelpemiddelsentralen hvis det likevel er behov for nytt batteri.'
      )
    ).toBeVisible()
  })

  // Slå opp hjelpemiddel som batteri ikke har blitt bestilt for
  await test.step('Slå opp hjelpemiddel som batteri ikke har blitt bestilt for', async () => {
    await page.getByRole('button', { name: 'Endre' }).click()
    await page.getByTestId('input-artnr').fill('301996')
    await page.getByTestId('input-serienr').fill('500500')
    await page.getByTestId('button-oppslag-submit').click()
  })

  // Sorter på 'Batteri' kategorien og legg til batteri
  await test.step("Sorter på 'Batteri' kategorien og legg til batteri", async () => {
    await page.getByRole('button', { name: 'Batteri' }).click()
    await expect(
      page.getByText(
        'Det er bestilt batteri for 500 dager siden. Ta kontakt med Hjelpemiddelsentralen hvis det likevel er behov for nytt batteri.'
      )
    ).toBeHidden()
    await expect(page.getByRole('button', { name: 'Bestill' })).toBeVisible()
    await page.getByRole('button', { name: 'Bestill' }).click()
  })

  // Velg levering og prøv å send inn
  await test.step('Velg levering og prøv å send inn', async () => {
    await page.getByTestId('levering-serviceOppdrag').check()
    await page.locator('button', { hasText: 'Send inn bestilling' }).click()
  })

  // Forvent feil - fiks feil og send inn bestilling
  await test.step('Forvent feil - fiks feil og send inn bestilling', async () => {
    await expect(page.getByText('Du må bekrefte at du har fått opplæring i å bytte disse batteriene.')).toBeVisible()
    await page.locator('#opplæring-batteri').check()
    await page.locator('button', { hasText: 'Send inn bestilling' }).click()
    await expect(page.getByText('Bestillingen ble sendt inn.')).toBeVisible()
  })
})
