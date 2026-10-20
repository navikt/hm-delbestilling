import test, { expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/hjelpemidler/delbestilling/deler?hmsnr=999999&serienr=123456')
  await expect(page.getByTestId('hjelpemiddel-navn')).toHaveText('Bestilling til Et helt supert hjelpemiddel')
  await page.getByTestId('input-ukjent-del-beskrivelse').fill('En ukjent del')
})

test('hjelpemiddel kan ikke legges til som del, men et annet HMS-nr kan legges til etterpå', async ({ page }) => {
  await page.getByTestId('input-artnr').fill('999999')
  await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })

  await expect(
    page.getByText(
      'Hmsnr 999999 er et hjelpemiddel (Et helt supert hjelpemiddel), og kan derfor ikke legges til som en del'
    )
  ).toBeVisible()
  await expect(page).toHaveURL(/\/deler\?/)

  await page.getByTestId('input-artnr').fill('000000')
  await expect(page.getByText(/Hmsnr 999999 er et hjelpemiddel/)).not.toBeVisible()
  await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })
  await expect(page).toHaveURL(/\/utsjekk/)
  await expect(page.getByText('En ukjent del')).toBeVisible()
})

for (const [hmsnr, feilmelding] of [
  ['333333', 'Noe gikk feil med oppslag, prøv igjen senere'],
  ['444444', 'Du har gjort for mange oppslag. Vennligst vent litt og prøv igjen.'],
]) {
  test(`oppslagsfeil for ${hmsnr} blokkerer tillegging og tillater nytt forsøk`, async ({ page }) => {
    await page.getByTestId('input-artnr').fill(hmsnr)
    await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })

    await expect(page.getByText(feilmelding)).toBeVisible()
    await expect(page).toHaveURL(/\/deler\?/)

    await page.getByTestId('input-artnr').fill('000000')
    await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })
    await expect(page).toHaveURL(/\/utsjekk/)
  })
}

test('lev.art.nr kan fortsatt legges til uten HMS-oppslag etter avvist hjelpemiddel', async ({ page }) => {
  await page.getByTestId('input-artnr').fill('999999')
  await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })
  await expect(page.getByText(/Hmsnr 999999 er et hjelpemiddel/)).toBeVisible()

  await page.getByRole('button', { name: 'Oppgi lev.art.nr i stedet' }).click()
  await page.getByTestId('input-levartnr').fill('999999')
  await page.getByTestId('input-ukjent-del-beskrivelse').fill('En ukjent del')
  await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })
  await expect(page).toHaveURL(/\/utsjekk/)
})
