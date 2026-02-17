import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BodyShort, Button, Detail, Heading, HStack, InfoCard, Search, VStack } from '@navikt/ds-react'

import FlexedStack from '../components/Layout/FlexedStack'
import { Del, Hjelpemiddel } from '../types/Types'

import { Beskrivelser } from './Beskrivelser/Beskrivelser'
import { Bilde } from './Bilde/Bilde'
import DelInnhold from './DelInhold/DelInhold'
import { CustomBox } from './Layout/CustomBox'
import { Avstand } from './Avstand'
import DelKategoriVelger, { useDelKategorier } from './DelKategoriVelger'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  knappeTekst?: string
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del' }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)

  const { t } = useTranslation()
  const [søk, setSøk] = useState('')

  if (!hjelpemiddel.deler || hjelpemiddel.deler.length === 0) {
    return (
      <InfoCard data-color="accent">
        <InfoCard.Header>
          <InfoCard.Title>{t('leggTilDel.ingenDeler.tittel')}</InfoCard.Title>
        </InfoCard.Header>
        <InfoCard.Content>{t('leggTilDel.ingenDeler.innhold')}</InfoCard.Content>
      </InfoCard>
    )
  }

  return (
    <>
      <Heading size="medium" level="3" spacing>
        Deler til {hjelpemiddel.navn}
      </Heading>

      <Avstand marginBottom={2}>
        <DelKategoriVelger
          setKategoriFilter={setKategoriFilter}
          delKategorier={delKategorier}
          kategoriFilter={kategoriFilter}
        />

        <Avstand marginBottom={4} />

        <HStack justify="start" align="end" gap="space-4">
          <div>
            <Search label="Søk" variant="simple" hideLabel onChange={(val) => setSøk(val)} />
          </div>
        </HStack>
      </Avstand>

      {hjelpemiddel.deler
        .filter((del) => (søk ? del.navn.toLowerCase().includes(søk.toLowerCase()) || del.hmsnr.includes(søk) : true))
        .filter((del) => (kategoriFilter ? del.kategori === kategoriFilter : true))
        .map((del) => {
          const erFastLagervare = del.lagerstatus.minmax
          const erBatteri = del.kategori.toLowerCase() === 'batteri'

          // Batteri er i seg selv dekket av garanti i 1 år
          const harNyligBlittBestiltBatteri =
            erBatteri &&
            hjelpemiddel.antallDagerSidenSistBatteribestilling !== null &&
            hjelpemiddel.antallDagerSidenSistBatteribestilling < 365

          // Dersom hjelpemiddelet er innenfor garantitiden, så kan batteriet være dekket av garantien
          const dekketAvHjelpemiddeletsGaranti = erBatteri && hjelpemiddel.erInnenforGaranti === true

          const erDekketAvGaranti = harNyligBlittBestiltBatteri || dekketAvHjelpemiddeletsGaranti

          const kanBestilles = !erDekketAvGaranti

          return (
            <Avstand marginBottom={3} key={del.hmsnr}>
              <CustomBox>
                <DelInnhold>
                  <FlexedStack>
                    <Bilde imgs={del.imgs} navn={del.navn} />
                    <Beskrivelser>
                      <Heading size="small" level="4" spacing>
                        {del.navn}
                      </Heading>

                      <HStack gap="space-20">
                        <BodyShort textColor="subtle">HMS-nr. {del.hmsnr}</BodyShort>
                        {del.levArtNr && <BodyShort textColor="subtle">Lev.art.nr. {del.levArtNr}</BodyShort>}
                        <VStack>
                          <BodyShort>RESERVEDEL || TILBEHØR</BodyShort>
                          <BodyShort>{erFastLagervare ? 'Lagervare' : 'Bestillingsvare'}</BodyShort>
                        </VStack>
                      </HStack>

                      {harNyligBlittBestiltBatteri && hjelpemiddel.antallDagerSidenSistBatteribestilling !== null ? (
                        <Avstand marginTop={5}>
                          <Detail textColor="subtle">
                            {t('del.antallDagerSidenSistBatteribestilling', {
                              count: hjelpemiddel.antallDagerSidenSistBatteribestilling,
                            })}
                          </Detail>
                        </Avstand>
                      ) : dekketAvHjelpemiddeletsGaranti ? (
                        <Avstand marginTop={5}>
                          <Detail>{t('del.hjelpemiddelErInnenforGarantitid')}</Detail>
                        </Avstand>
                      ) : null}
                    </Beskrivelser>
                  </FlexedStack>

                  {kanBestilles && (
                    <Button variant="secondary" onClick={() => onLeggTil(del)}>
                      {knappeTekst}
                    </Button>
                  )}
                </DelInnhold>
              </CustomBox>
            </Avstand>
          )
        })}
    </>
  )
}

const lagerTilEnhetnavnMap: { [key: string]: string } = {
  '01': 'Øst-Viken',
  '02': 'Oslo',
  '03': 'Oslo',
  '04': 'Elverum',
  '05': 'Gjøvik',
  '06': 'Vest-Viken',
  '07': 'Vestfold og Telemark',
  '08': 'Vestfold og Telemark',
  '09': 'Agder',
  '10': 'Agder',
  '11': 'Rogaland',
  '12': 'Vestland-Bergen',
  '14': 'Vestland-Førde',
  '15': 'Møre og Romsdal',
  '16': 'Trøndelag',
  '17': 'Trøndelag',
  '18': 'Nordland',
  '19': 'Troms og Finnmark',
  '20': 'Troms og Finnmark',
}

export default LeggTilDel
