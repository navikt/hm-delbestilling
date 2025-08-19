import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, BodyShort, Box, Button, Detail, Heading, HStack, Search, Switch } from '@navikt/ds-react'

import useDelKategorier from '../hooks/useDelKategorier'
import { CustomBox } from '../styledcomponents/CustomBox'
import FlexedStack from '../styledcomponents/FlexedStack'
import { Del, Hjelpemiddel, Pilot } from '../types/Types'
import { logKlikkVisKunFastLagervare } from '../utils/amplitude'
import { triggerHotjarEvent } from '../utils/hotjar'
import { isConsentingToSurveys } from '../utils/nav-cookie-consent'

import { Avstand } from './Avstand'
import { Beskrivelser } from './Beskrivelser'
import { Bilde } from './Bilde'
import DelInnhold from './DelInhold'
import DelKategoriVelger from './DelKategoriVelger'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  knappeTekst?: string
  piloter: Pilot[]
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del', piloter }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)
  const { t } = useTranslation()
  const [visKunDigitaleDeler, setVisKunDigitaleDeler] = useState(false)
  const [søk, setSøk] = useState('')

  const erPilotForBestilleIkkeFasteLagervarer = piloter.includes(Pilot.BESTILLE_IKKE_FASTE_LAGERVARER)

  const handleClickManglerDel = () => {
    if (isConsentingToSurveys()) {
      triggerHotjarEvent('digihot_delbestilling_mangler_del_feedback')
    }
  }

  if (!hjelpemiddel.deler || hjelpemiddel.deler.length === 0) {
    return <Alert variant="info">{t('leggTilDel.ingenDeler')}</Alert>
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

        <HStack justify="start" align="end" gap="4">
          <div>
            <Search label="Søk" variant="simple" hideLabel onChange={(val) => setSøk(val)} />
          </div>
          {!erPilotForBestilleIkkeFasteLagervarer && (
            <Switch
              checked={visKunDigitaleDeler}
              onChange={(e) => {
                setVisKunDigitaleDeler(e.target.checked)
                logKlikkVisKunFastLagervare(e.target.checked)
              }}
            >
              {t('filtrering.visKunDelerSomKanBestillesDigitalt')}
            </Switch>
          )}
        </HStack>
      </Avstand>

      {hjelpemiddel.deler
        .filter((del) => (søk ? del.navn.toLowerCase().includes(søk.toLowerCase()) || del.hmsnr.includes(søk) : true))
        .filter((del) => (visKunDigitaleDeler ? del.lagerstatus.minmax === true : true))
        .filter((del) => (kategoriFilter ? del.kategori === kategoriFilter : true))
        .map((del) => {
          const erFastLagervare = del.lagerstatus.minmax
          const harNyligBlittBestiltBatteri =
            del.kategori === 'Batteri' &&
            hjelpemiddel.antallDagerSidenSistBatteribestilling !== null &&
            hjelpemiddel.antallDagerSidenSistBatteribestilling < 365

          const hjelpemiddelInnenforGaranti = del.kategori === 'Batteri' && hjelpemiddel.erInnenforGaranti

          const kanBestilles =
            !harNyligBlittBestiltBatteri &&
            (erPilotForBestilleIkkeFasteLagervarer || erFastLagervare) &&
            !hjelpemiddelInnenforGaranti

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
                      <BodyShort textColor="subtle">
                        <HStack gap="5">
                          <span>HMS-nr. {del.hmsnr}</span>
                          {del.levArtNr && <span>Lev.art.nr. {del.levArtNr}</span>}
                        </HStack>
                      </BodyShort>
                      {del.lagerstatus && !erPilotForBestilleIkkeFasteLagervarer && !kanBestilles && (
                        <Avstand marginTop={5}>
                          <Detail textColor="subtle">
                            {t('del.lagerstatus.ikkeFastLagervare', {
                              hmsNavn:
                                lagerNavnMap[del.lagerstatus.organisasjons_navn.slice(1, 3)] ??
                                del.lagerstatus.organisasjons_navn,
                            })}
                          </Detail>
                        </Avstand>
                      )}

                      {harNyligBlittBestiltBatteri && (
                        <Avstand marginTop={5}>
                          <Detail textColor="subtle">{t('del.antallDagerSidenSistBatteribestilling')}</Detail>
                        </Avstand>
                      )}

                      {hjelpemiddelInnenforGaranti && (
                        <Avstand marginTop={5}>
                          <Detail textColor="subtle">{t('del.hjelpemiddelInnenforGaranti')}</Detail>
                        </Avstand>
                      )}
                    </Beskrivelser>
                  </FlexedStack>

                  {kanBestilles && (
                    <Button variant="secondary" onClick={() => onLeggTil(del)}>
                      {knappeTekst}
                    </Button>
                  )}
                </DelInnhold>
                {window.appSettings.MILJO === 'dev-gcp' &&
                  erPilotForBestilleIkkeFasteLagervarer &&
                  !erFastLagervare && (
                    <HStack justify={'end'}>
                      <Avstand marginTop={2}>
                        <Detail color="subtle">[DEBUG]: ikke fast lagervare (min/max)</Detail>
                      </Avstand>
                    </HStack>
                  )}
              </CustomBox>
            </Avstand>
          )
        })}
      {/* {isConsentingToSurveys() && (
        <Box borderColor="border-default" padding="8" borderWidth="2" style={{ borderStyle: 'dashed' }}>
          <Avstand centered>
            <BodyShort spacing>
              <strong>Finner du ikke delen du er ute etter?</strong>
            </BodyShort>
            <Button onClick={handleClickManglerDel}>Fortell oss om det</Button>
          </Avstand>
        </Box>
      )} */}
    </>
  )
}

const lagerNavnMap: { [key: string]: string } = {
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
