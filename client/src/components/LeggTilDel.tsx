import React from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'

import { useRolleContext } from '../context/rolle'
import useDelKategorier from '../hooks/useDelKategorier'
import { CustomPanel } from '../styledcomponents/CustomPanel'
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
  harArtnrOgSerienrParams?: boolean
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del', harArtnrOgSerienrParams }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)
  const { delbestillerrolle } = useRolleContext()
  const { t } = useTranslation()

  if (!hjelpemiddel.deler || hjelpemiddel.deler.length === 0) {
    return <Alert variant="info">{t('leggTilDel.ingenDeler')}</Alert>
  }

  return (
    <>
      <Heading size="medium" level="3" spacing>
        Deler til {hjelpemiddel.navn}
      </Heading>
      <Avstand marginBottom={4}>
        <DelKategoriVelger
          setKategoriFilter={setKategoriFilter}
          delKategorier={delKategorier}
          kategoriFilter={kategoriFilter}
        />
      </Avstand>

      {hjelpemiddel.deler
        .filter((del) => (kategoriFilter ? kategoriFilter === del.kategori : del))
        .map((del) => {
          // TODO: se om dette kan gjøres på en litt mindre hacky måte.
          let kanBestilleDel = false
          // Er ikke logget inn, sjekk params
          if (harArtnrOgSerienrParams) {
            kanBestilleDel = del.kategori !== 'Batteri' && del.kategori !== 'Lader'
          } else {
            // Er logget inn, sjekk rolle
            if (delbestillerrolle) {
              if (delbestillerrolle.erTekniker) {
                kanBestilleDel = true
              } else {
                kanBestilleDel = del.kategori !== 'Batteri' && del.kategori !== 'Lader'
              }
            } else {
              kanBestilleDel = true
            }
          }

          return (
            <Avstand marginBottom={3} key={del.hmsnr}>
              <CustomPanel border>
                <DelInnhold>
                  <FlexedStack>
                    <DelInfo navn={del.navn} hmsnr={del.hmsnr} levArtNr={del.levArtNr} img={del.img} />
                  </FlexedStack>

                  {kanBestilleDel && (
                    <Button variant="secondary" onClick={() => onLeggTil(del)}>
                      {knappeTekst}
                    </Button>
                  )}
                </DelInnhold>
                {!kanBestilleDel && (
                  <Avstand marginTop={4}>
                    <BodyShort>
                      Som brukerpassbruker kan du ikke bestille denne delen. Ta kontakt med tekniker.
                    </BodyShort>
                  </Avstand>
                )}
              </CustomPanel>
            </Avstand>
          )
        })}
    </>
  )
}

export default LeggTilDel
