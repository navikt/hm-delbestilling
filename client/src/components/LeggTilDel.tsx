import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, BodyShort, Button, Heading, HStack, Switch, TextField } from '@navikt/ds-react'

import useDelKategorier from '../hooks/useDelKategorier'
import { CustomPanel, DottedPanel } from '../styledcomponents/CustomPanel'
import FlexedStack from '../styledcomponents/FlexedStack'
import { Del, Hjelpemiddel } from '../types/Types'

import { Avstand } from './Avstand'
import DelInfo from './DelInfo'
import DelInnhold from './DelInhold'
import DelKategoriVelger from './DelKategoriVelger'

interface Props {
  hjelpemiddel: Hjelpemiddel
  onLeggTil: (del: Del) => void
  knappeTekst?: string
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del' }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)
  const { t } = useTranslation()
  const [visKunFastLagervarer, setVisKunFastLagervarer] = useState(false)
  const [søk, setSøk] = useState('')

  const handleClickManglerDel = () => {
    window.hj('event', 'digihot_delbestilling_mangler_del_feedback')
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

        <HStack align="end" gap="4">
          <TextField label="Søk" onChange={(e) => setSøk(e.target.value)} />
          <Switch
            checked={visKunFastLagervarer}
            onChange={(e) => {
              setVisKunFastLagervarer(e.target.checked)
            }}
          >
            Vis kun faste lagervarer
          </Switch>
        </HStack>
      </Avstand>

      {hjelpemiddel.deler
        .filter((del) => (søk ? del.navn.toLowerCase().includes(søk.toLowerCase()) || del.hmsnr.includes(søk) : del))
        .filter((del) => (visKunFastLagervarer ? del.lagerstatus.minmax === true : del))
        .filter((del) => (kategoriFilter ? del.navn.startsWith(kategoriFilter) : del))
        .map((del) => {
          const erFastLagervare = del.lagerstatus.minmax
          return (
            <Avstand marginBottom={3} key={del.hmsnr}>
              <CustomPanel border>
                <DelInnhold>
                  <FlexedStack>
                    <DelInfo
                      navn={del.navn}
                      hmsnr={del.hmsnr}
                      levArtNr={del.levArtNr}
                      img={del.img}
                      lagerstatus={del.lagerstatus}
                    />
                  </FlexedStack>

                  {erFastLagervare && (
                    <Button variant="secondary" onClick={() => onLeggTil(del)}>
                      {knappeTekst}
                    </Button>
                  )}
                </DelInnhold>
              </CustomPanel>
            </Avstand>
          )
        })}
      <DottedPanel>
        <Avstand centered>
          <BodyShort spacing>
            <strong>Finner du ikke delen du er ute etter?</strong>
          </BodyShort>
          <Button onClick={handleClickManglerDel}>Fortell oss om det</Button>
        </Avstand>
      </DottedPanel>
    </>
  )
}

export default LeggTilDel
