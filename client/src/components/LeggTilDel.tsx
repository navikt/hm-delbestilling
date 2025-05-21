import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, BodyShort, Box, Button, Detail, Heading, HStack, Search, Switch } from '@navikt/ds-react'

import useDelKategorier from '../hooks/useDelKategorier'
import { CustomBox } from '../styledcomponents/CustomBox'
import FlexedStack from '../styledcomponents/FlexedStack'
import { Del, Hjelpemiddel, Pilot } from '../types/Types'
import { logKlikkVisKunFastLagervare } from '../utils/amplitude'
import { isConsentingToSurveys } from '../utils/nav-cookie-consent'

import { Avstand } from './Avstand'
import DelInfo from './DelInfo'
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
      window.hj('event', 'digihot_delbestilling_mangler_del_feedback')
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

          const kanBestilles =
            !harNyligBlittBestiltBatteri && (erPilotForBestilleIkkeFasteLagervarer || erFastLagervare)

          console.log('harNyligBlittBestiltBatteri:', harNyligBlittBestiltBatteri)

          return (
            <Avstand marginBottom={3} key={del.hmsnr}>
              <CustomBox>
                <DelInnhold>
                  <FlexedStack>
                    <DelInfo
                      navn={del.navn}
                      hmsnr={del.hmsnr}
                      levArtNr={del.levArtNr}
                      imgs={del.imgs}
                      lagerstatus={del.lagerstatus}
                      visVarselOmIkkeFastLagervare={!erPilotForBestilleIkkeFasteLagervarer && !kanBestilles}
                      visVarselOmNyligBestiltBatteri={harNyligBlittBestiltBatteri}
                      antallDagerSidenSistBatteribestilling={hjelpemiddel.antallDagerSidenSistBatteribestilling}
                    />
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
      {isConsentingToSurveys() && (
        <Box borderColor="border-default" padding="8" borderWidth="2" style={{ borderStyle: 'dashed' }}>
          <Avstand centered>
            <BodyShort spacing>
              <strong>Finner du ikke delen du er ute etter?</strong>
            </BodyShort>
            <Button onClick={handleClickManglerDel}>Fortell oss om det</Button>
          </Avstand>
        </Box>
      )}
    </>
  )
}

export default LeggTilDel
