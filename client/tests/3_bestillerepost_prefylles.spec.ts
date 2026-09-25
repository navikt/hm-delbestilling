import test, { expect } from '@playwright/test'

test('bestillerepost prefylles fra tidligere manuell delbestilling', async ({ page }) => {
  await test.step('Slå opp hjelpemiddel og bestill en ukjent del med epost', async () => {
    await page.goto('/')
    await page.getByTestId('input-artnr').fill('301996')
    await page.getByTestId('button-oppslag-submit').click()
    await page.getByTestId('input-serienr').fill('700001')
    await page.getByRole('button', { name: 'Vis deler' }).click()

    await page.getByTestId('input-artnr').fill('999911')
    await page.getByTestId('input-ukjent-del-beskrivelse').fill('En ukjent del')
    // { force: true }: knappen overlappes av Rolleswitcher (fast posisjonert dev-banner, kun synlig utenfor prod)
    await page.getByRole('button', { name: 'Bestill' }).last().click({ force: true })
  })

  await test.step('Fyll inn epost, velg levering og send inn', async () => {
    await page.getByLabel('E-postadresse').fill('forste@e2e.no')
    await page.getByTestId('levering-xk-lager').check()
    await page.locator('button', { hasText: 'Send inn bestilling' }).click({ force: true })
    await expect(page.getByText('Bestillingen ble sendt inn.')).toBeVisible()
  })

  await test.step('Start ny bestilling og forvent at epost er forhåndsutfylt', async () => {
    await page.getByRole('button', { name: 'Start ny bestilling' }).click()
    await page.getByTestId('input-artnr').fill('301996')
    await page.getByTestId('button-oppslag-submit').click()
    await page.getByTestId('input-serienr').fill('700002')
    await page.getByRole('button', { name: 'Vis deler' }).click()

    await page.getByTestId('input-artnr').fill('999922')
    await page.getByTestId('input-ukjent-del-beskrivelse').fill('Enda en ukjent del')
    await page.getByRole('button', { name: 'Bestill' }).last().click({ force: true })

    await expect(page.getByLabel('E-postadresse')).toHaveValue('forste@e2e.no')
  })
})
