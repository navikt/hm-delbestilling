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
  await page.getByTestId('input-levartnr').fill('123456')
  await page.getByTestId('input-ukjent-del-beskrivelse').fill('En ukjent del')
  await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })
  await expect(page).toHaveURL(/\/utsjekk/)
})

for (const levArtNr of ['999999', ' 999999 ']) {
  test(`hjelpemiddelets HMS-nr avvises som lev.art.nr: "${levArtNr}"`, async ({ page }) => {
    await page.getByRole('button', { name: 'Oppgi lev.art.nr i stedet' }).click()
    const input = page.getByTestId('input-levartnr')
    await input.fill(levArtNr)
    await page.getByTestId('input-ukjent-del-beskrivelse').fill('En ukjent del')
    await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })

    const error = page.getByText(
      'Dette er HMS-nummeret til hjelpemiddelet du bestiller deler til. Vennligst fyll inn lev.art.nr. til delen du skal bestille i stedet.'
    )
    await expect(error).toBeVisible()
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(page).toHaveURL(/\/deler\?/)

    await input.fill('DEL-123')
    await expect(error).not.toBeVisible()
    await page.getByRole('button', { name: 'Bestill', exact: true }).last().click({ force: true })
    await expect(page).toHaveURL(/\/utsjekk/)
  })
}
