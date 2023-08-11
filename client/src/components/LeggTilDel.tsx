import React from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, Button, Heading } from '@navikt/ds-react'

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
}
const LeggTilDel = ({ hjelpemiddel, onLeggTil, knappeTekst = 'Legg til del' }: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = useDelKategorier(hjelpemiddel.deler)
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
        .map((del) => (
          <Avstand marginBottom={2} key={del.hmsnr}>
            <CustomPanel border>
              <DelInnhold>
                <FlexedStack>
                  <DelInfo navn={del.navn} hmsnr={del.hmsnr} levArtNr={del.levArtNr} img={del.img} />
                </FlexedStack>

                <Button variant="secondary" onClick={() => onLeggTil(del)}>
                  {knappeTekst}
                </Button>
              </DelInnhold>
            </CustomPanel>
          </Avstand>
        ))}
    </>
  )
}

export default LeggTilDel
